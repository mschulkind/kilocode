# RULES_DISCOVERY

> **Development note**: This document explains how Kilo searches for and loads "rules" files and documents the symlink behaviour observed across loader and UI codepaths.

**Purpose:** Describe the code paths and behaviors Kilo uses to discover and read rule files so engineers can quickly diagnose issues (for example, symlinked rules not appearing in the UI).

<details><summary>Table of Contents</summary>

- [Executive summary](#executive-summary)
- [Search order and roo directories](#search-order-and-roo-directories)
- [Primary loader: loadRuleFiles](#primary-loader-loadrulefiles)
- [Directory walker, symlink resolution, and sorting](#directory-walker-symlink-resolution-and-sorting)
- [Webview listing (no symlink resolution)](#webview-listing-no-symlink-resolution)
- [Other helpers affecting discovery](#other-helpers-affecting-discovery)
- [Likely root cause for missing symlinked rules](#likely-root-cause-for-missing-symlinked-rules)
- [Suggested fixes](#suggested-fixes)
- [Research context & next steps](#research-context--next-steps)

</details>

## Executive summary

_Kilo searches for rules in "roo"-style directories (global then project). The canonical loader is [`loadRuleFiles`](src/core/prompts/sections/custom-instructions.ts:211) which uses a symlink-aware directory walker. The UI uses a separate listing function [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47) that currently does not follow symlinks — this mismatch is the most likely cause when symlinked rules are missing from UI toggles._

## Search order and roo directories

- Roo directories are resolved by [`getRooDirectoriesForCwd`](src/services/roo-config/index.ts:155), which returns ordered directories (global first, project second). See also [`getProjectRooDirectoryForCwd`](src/services/roo-config/index.ts:61).
- Typical locations:
    - Global: [`getGlobalRooDirectory`](src/services/roo-config/index.ts:27) → typically `~/.kilocode`.
    - Project: project-local roo directory (prefers `.roo` over `.kilocode`) via [`getProjectRooDirectoryForCwd`](src/services/roo-config/index.ts:61).

## Primary loader: loadRuleFiles

- The main compilation entrypoint is [`loadRuleFiles`](src/core/prompts/sections/custom-instructions.ts:211).
- Behaviour summary:
    - Iterates the ordered roo directories and checks for a `rules` subdirectory (for example `~/.kilocode/rules` or `<workspace>/.kilocode/rules`).
    - When found, it calls the symlink-aware enumerator [`readTextFilesFromDirectory`](src/core/prompts/sections/custom-instructions.ts:127) which resolves symlinks, filters binary/cache files, and returns ordered file content.
    - If no roo `rules` directories exist, it falls back to legacy single-file rules: `.kilocoderules`, `.roorules`, `.clinerules` in the cwd.
- Special cases:
    - Mode-specific directories (`rules-<mode>`) are handled similarly (see the mode-specific block in [`addCustomInstructions`](src/core/prompts/sections/custom-instructions.ts:318)).
    - AGENTS.md / AGENT.md are read via [`loadAgentRulesFile`](src/core/prompts/sections/custom-instructions.ts:256) which contains explicit symlink handling logic for single agent files.

## Directory walker, symlink resolution, and sorting

- `readTextFilesFromDirectory` (the enumerator) lives at [`readTextFilesFromDirectory`](src/core/prompts/sections/custom-instructions.ts:127).
- Important helpers:
    - [`resolveDirectoryEntry`](src/core/prompts/sections/custom-instructions.ts:62) — initial per-Dirent resolver that delegates symlink handling.
    - [`resolveSymLink`](src/core/prompts/sections/custom-instructions.ts:86) — resolves symlinks with `fs.readlink` and then `fs.stat`, recursing into directories and preventing cycles via `MAX_DEPTH` (`src/core/prompts/sections/custom-instructions.ts:57`).
    - [`safeReadFile`](src/core/prompts/sections/custom-instructions.ts:32) — resilient file reader that swallows ENOENT/EISDIR.
- Behaviour notes:
    - For symlinked files the implementation stores both `originalPath` (the symlink) and `resolvedPath` (the target). Sorting is performed by the original symlink name (`sortKey`) so user-visible order follows symlink filenames, not target names.
    - If a symlink targets a directory, that target is recursively enumerated and its files are included.
    - Binary files and common OS/cache files are filtered by `isBinaryFile` usage and `shouldIncludeRuleFile`.

## Webview listing (no symlink resolution)

- The webview toggle UI obtains rules via [`getEnabledRules`](src/core/webview/kilorules.ts:21) which calls [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47) per directory.
- [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47) uses `fs.readdir(..., { withFileTypes: true })` and only accepts entries where `dirent.isFile()` is true; it filters by extension using [`allowedExtensions`](src/shared/kilocode/rules.ts:1).
- Consequence: Dirent entries that are symbolic links (where `isSymbolicLink()` might be true and `isFile()` false) are skipped. Symlinked rule files or directories therefore may be present in the loader output but absent from the UI toggle lists.

## Other helpers affecting discovery

- [`readDirectory`](src/utils/fs.ts:79) — a utility used by some code paths which filters to `entry.isFile()`; it will also exclude symlink Dirents unless the Dirent reports as a file.
- Any code that relies on `readDirectory` or `fs.readdir(..., { withFileTypes: true })` and then checks `isFile()` will inherit the same symlink-exclusion behaviour.

## Likely root cause for missing symlinked rules

- Two discovery strategies exist:
    1. Loader: symlink-aware enumerator (`readTextFilesFromDirectory`) used by `loadRuleFiles`.
    2. UI/listing: conservative Dirent-based discovery (`getEnabledRulesFromDirectory`) used by the webview.
- The mismatch causes rules to execute (loader reads targets) but not be visible/toggleable in the UI (UI ignored symlink Dirents).

## Suggested fixes

- Short-term / quick patch:
    - Update [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47) to `lstat` each Dirent and when `isSymbolicLink()` is true, resolve with `fs.readlink` and `fs.stat` to detect file targets and include them in toggles. Preserve the same extension whitelist ([`allowedExtensions`](src/shared/kilocode/rules.ts:1)).
    - As an alternative short patch, call a small shared helper that converts Dirent lists into file paths while resolving symlinks.
- Medium-term / recommended:
    - Factor the loader's symlink-aware enumeration into a shared utility (for example `src/utils/rules-reader.ts`) and use it in both `loadRuleFiles` and `getEnabledRulesFromDirectory`. This guarantees parity and reduces regressions.
- Tests & considerations:
    - Preserve behavior for sorting by symlink name if tests or UX rely on that ordering (see tests referencing `custom-instructions` at [`src/core/prompts/sections/__tests__/custom-instructions.spec.ts:1617`](src/core/prompts/sections/__tests__/custom-instructions.spec.ts:1617)).
    - Be careful to bound recursion to avoid symlink cycles (use `MAX_DEPTH` as in [`resolveSymLink`](src/core/prompts/sections/custom-instructions.ts:91)).

## Research context & next steps

- To reproduce and confirm:
    - Compare the string returned by the loader: [`loadRuleFiles(cwd)`](src/core/prompts/sections/custom-instructions.ts:211).
    - Compare the toggles returned by the webview: [`getEnabledRules(workspacePath, ...)`](src/core/webview/kilorules.ts:21).
- If UI toggles are missing:
    1. Implement short-term patch in `getEnabledRulesFromDirectory` (quick verification).
    2. Add unit tests that create symlinked files/dirs under a temp rules dir and assert toggles include symlink paths.
    3. Consider refactor into shared util and run full test-suite.

<a id="navigation-footer"></a>

- Back: [`README.md`](README.md) · Root: [`README.md`](README.md) · Source: `/docs/RULES_DISCOVERY.md#L1`
