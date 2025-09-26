# Rules Discovery

> **Development note**: This document explains how Kilo searches for and loads "rules" files and highlights symlink behavior.

**Purpose:** Describe code paths and behaviors used to discover and read rules files so engineers can diagnose issues (for example, symlinked rules not appearing in the UI).

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Search order and roo directories](#search-order-and-roo-directories)
- [Primary loader: loadRuleFiles](#primary-loader-loadrulefiles)
- [Directory walker, symlink resolution, and sorting](#directory-walker-symlink-resolution-and-sorting)
- [Webview listing (no symlink resolution)](#webview-listing-no-symlink-resolution)
- [Other helpers affecting discovery](#other-helpers-affecting-discovery)
- [Likely root cause for missing symlinked rules](#likely-root-cause-for-missing-symlinked-rules)
- [Suggested fixes](#suggested-fixes)
- [Research context & next steps](#research-context--next-steps)

</details>

## Executive Summary

_Kilo looks first in "roo" style directories (global then project) for rule directories and files. The primary loader that assembles rules content is [`loadRuleFiles`](src/core/prompts/sections/custom-instructions.ts:211) which uses a directory walker that resolves symlinks and reads target files. The webview UI uses a separate code path ([`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47)) that does not follow symlinks, which is the most likely mismatch when symlinked rules are not shown._

## Search order and roo directories

- Roo directories are resolved by [`getRooDirectoriesForCwd`](src/services/roo-config/index.ts:155). It returns an ordered list: global then project-local (see [`getProjectRooDirectoryForCwd`](src/services/roo-config/index.ts:61)).
- Keys:
    - Global base: [`getGlobalRooDirectory`](src/services/roo-config/index.ts:27).
    - Project base: [`getProjectRooDirectoryForCwd`](src/services/roo-config/index.ts:61) (prefers `.roo` when present, otherwise `.kilocode`).

## Primary loader: loadRuleFiles

- The main compilation point is [`loadRuleFiles`](src/core/prompts/sections/custom-instructions.ts:211). Behavior:
    - Iterates roo directories (global first) and checks for a `rules` directory (e.g., `~/.kilocode/rules` or `<project>/.kilocode/rules`).
    - If a `rules` directory exists it calls `readTextFilesFromDirectory` to enumerate and read files.
    - If no directories are found it falls back to legacy files (`.kilocoderules`, `.roorules`, `.clinerules`) in the cwd.
- Also handles mode-specific directories (`rules-{mode}`) and AGENTS.md via a separate helper (`loadAgentRulesFile`) which explicitly checks symlinks for agent rule files [`loadAgentRulesFile`](src/core/prompts/sections/custom-instructions.ts:256).

## Directory walker, symlink resolution, and sorting

- File enumeration and symlink handling are implemented inside [`readTextFilesFromDirectory`](src/core/prompts/sections/custom-instructions.ts:127).
- Key functions:
    - `resolveDirectoryEntry` — initial per-Dirent resolver (handles files and delegates symlinks): [`resolveDirectoryEntry`](src/core/prompts/sections/custom-instructions.ts:62).
    - `resolveSymLink` — resolves a symlink target via `fs.readlink`, `fs.stat` and recursively enumerates directory targets: [`resolveSymLink`](src/core/prompts/sections/custom-instructions.ts:86).
    - `safeReadFile` — reads file content ignoring ENOENT/EISDIR: [`safeReadFile`](src/core/prompts/sections/custom-instructions.ts:32).
- Behavior notes:
    - For symlinked files the code stores both originalPath (symlink path) and resolvedPath (target). When sorting and presenting results it sorts by originalPath (`sortKey`) so symlinks are ordered by their symlink names, not the target names (see sorting and comment): [`readTextFilesFromDirectory`](src/core/prompts/sections/custom-instructions.ts:180).
    - If a symlink points to a directory, the resolver recursively enumerates files inside the target directory and includes them.
    - Binary files and common cache files are filtered (`isBinaryFile` + `shouldIncludeRuleFile`) to avoid noise.

## Webview listing (no symlink resolution)

- The webview uses [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47) to build rule toggles shown in the UI.
- That function:
    - Calls `fs.readdir(dirPath, { withFileTypes: true })` and only treats entries with `dirent.isFile()` as rule files. It does not call `lstat`/`readlink` to resolve symlinks, nor does it traverse symlink target directories — see [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:56).
    - Filters by allowed extensions using [`allowedExtensions`](src/shared/kilocode/rules.ts:1).
- Implication: symlink entries that are Dirent objects with `isSymbolicLink() === true` and `isFile() === false` are ignored by this code path and therefore do not appear in the webview toggles.

## Other helpers affecting discovery

- `readDirectory` in [`src/utils/fs.ts`](src/utils/fs.ts:79) is used by some utilities (`rule-helpers`) and filters Dirents with `entry.isFile()` — this likewise excludes symlink Dirents that are not reported as files: [`readDirectory`](src/utils/fs.ts:79).
- `rule-helpers.readDirectoryRecursive` uses `readDirectory` and then filters by extensions — so code that relies on `readDirectory` will not see symlink entries unless the implementation resolves symlinks first: [`src/core/context/instructions/rule-helpers.ts`](src/core/context/instructions/rule-helpers.ts:10).
- Migration helper `ensureLocalKilorulesDirExists` may convert a legacy file into a directory; it uses `fileExistsAtPath` / `isDirectory` from [`src/core/context/instructions/kilo-rules.ts`](src/core/context/instructions/kilo-rules.ts:10).

## Likely root cause for missing symlinked rules

- There are two different discovery strategies:
    1. The "loader" (`loadRuleFiles` + `readTextFilesFromDirectory`) actively resolves symlinks and includes target files.
    2. The "UI"/listing (`getEnabledRulesFromDirectory`) treats Dirent entries conservatively and only includes entries that `isFile()` — it does not resolve or follow symlinks.
- This mismatch means symlinked rule files (or symlinked directories containing rule files) can appear in the compiled rules returned by `loadRuleFiles` but will be absent from the webview's toggle list. That explains issues where rules execute but are not toggleable or visible in the UI.

## Suggested fixes

- Short-term (least invasive):
    - Update [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47) to call `fs.lstat` on each Dirent and, when `isSymbolicLink()` is true, resolve the link with `fs.readlink` and `fs.stat` to determine if the target is a file. Add symlink-based entries to the returned toggles.
    - Alternatively, reuse `readTextFilesFromDirectory` or factor its symlink resolution into a shared helper and call it from both the loader and the webview listing.
- Medium-term:
    - Unify discovery into a single util module (e.g., export a symlink-aware directory reader) that both `loadRuleFiles` and `getEnabledRulesFromDirectory` consume so behavior stays consistent.
- Considerations:
    - Ensure the UI path preserves the same sorting rule (symlink ordering by symlink name) if that semantic is important (tests assert this behavior: [`custom-instructions` tests](src/core/prompts/sections/__tests__/custom-instructions.spec.ts:1617)).
    - Be cautious about recursive symlink cycles — the loader uses MAX_DEPTH to limit recursion: see [`resolveSymLink`](src/core/prompts/sections/custom-instructions.ts:91).

## Research context & next steps

- Confirm whether the failing case is in the webview toggle listing (missing entries) or in the compiled rules (missing content). Verify by comparing:
    - What `loadRuleFiles(cwd)` returns: [`src/core/prompts/sections/custom-instructions.ts`](src/core/prompts/sections/custom-instructions.ts:211).
    - What `getEnabledRules(workspacePath, ...)` returns for the same directory: [`src/core/webview/kilorules.ts`](src/core/webview/kilorules.ts:21).
- If UI toggles are missing, implement the short-term fix and run the relevant tests:
    - Tests around symlink handling live in: [`src/core/prompts/sections/__tests__/custom-instructions.spec.ts`](src/core/prompts/sections/__tests__/custom-instructions.spec.ts:1352) (see many symlink-related cases).
- If desired, implement the unified helper and update both call sites; write unit tests mirroring the existing symlink tests.

<a id="navigation-footer"></a>

- Back: [`README.md`](README.md) · Root: [`README.md`](README.md) · Source: `/docs/RULES_DISCOVERY.md#L1`
