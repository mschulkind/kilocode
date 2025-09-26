# UNIFY_RULES_DISCOVERY_PLAN

> **Purpose:** Plan options to unify rules discovery (loader vs UI) and eliminate symlink mismatch.

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Goals](#goals)
- [Constraints & Considerations](#constraints--considerations)
- [Options](#options)
- [Recommendation](#recommendation)
- [Next steps & acceptance criteria](#next-steps--acceptance-criteria)

</details>

## Executive Summary

The two code paths to reconcile:

- Loader: [`src/core/prompts/sections/custom-instructions.ts`](src/core/prompts/sections/custom-instructions.ts:211) (resolves symlinks via readTextFilesFromDirectory)
- UI listing: [`src/core/webview/kilorules.ts`](src/core/webview/kilorules.ts:47) (reads dirents, ignores symlinks)

This plan presents three options varying in risk and scope to make discovery consistent.

## Goals

- Ensure symlinked rule files and symlinked directories are discovered identically by loader and UI.
- Preserve existing sorting semantics (symlink order by link name).
- Minimize disruption; provide tests and rollout plan.

## Constraints & Considerations

- Avoid regressions and long-running changes during active releases.
- Respect MAX_DEPTH symlink guard in [`custom-instructions.ts`](src/core/prompts/sections/custom-instructions.ts:57).
- Cross-platform behavior (Windows symlink semantics) — tests skip symlink cases on Windows.

## Why are there two discovery systems?

Over time the project evolved to use two separate discovery code paths for different purposes and runtime contexts. Summarized reasons:

- Historical evolution: The loader code (used at runtime by core features) was implemented first with a robust, recursive, symlink-aware reader to fully ingest rules files. The webview listing was added later to provide a lightweight UI surface for toggling rules and initially took a simpler approach (directory scan using Dirent.isFile) for safety and portability.
- Separation of concerns: The loader must read and concatenate rule contents for runtime processing; the UI only needs filenames, enablement state, and stable ordering. These differing responsibilities led to different implementation trade-offs.
- Context and environment constraints: The webview and UI code may run in a different execution context (renderer/webview or tightly sandboxed environment) and historically used safer, non-recursive filesystem APIs to avoid exposing complex symlink resolution or binary detection logic in the UI layer.
- Performance and simplicity: The UI listing favors minimal, fast operations to populate toggles without heavy file I/O or binary checks. The loader prioritizes correctness over micro-performance during initialization.
- Backwards compatibility and risk management: Early conservative choices (ignore symlinks) reduced risk of surprising behavior caused by symlink loops or external filesystem mounts. That conservatism persisted even after the loader implemented symlink protections (MAX_DEPTH).
- Test coverage and drift: Tests and utilities were added around the loader's behavior, and the UI code path received fewer symlink-centric tests, allowing behavior drift.

Implication: these justified differences explain why the two paths diverged. Unification (Option B/C) should preserve the original reasons by ensuring the shared implementation exposes a minimal, fast API for UI use while centralizing the complex symlink and binary-handling logic.

## Options

### Option A — Minimal: make UI symlink-aware

- Change: Update [`getEnabledRulesFromDirectory`](src/core/webview/kilorules.ts:47) to call lstat/readlink+stat for symlinks, include resolved entries in toggles.
- Risk: Low. Small surface area.
- Effort: ~1-2 days including tests.
- Pros: Fast; fixes UI visibility quickly.
- Cons: Duplicate symlink logic remains in two places.

```mermaid
graph TD
  A[Webview request] --> B[getEnabledRulesFromDirectory]
  B --> C{Dirent}
  C -->|isFile| D[Add file]
  C -->|isSymbolicLink| E[Resolve symlink and add file]
```

### Option B — Shared util: factor symlink-aware reader

- Change: Extract `readTextFilesFromDirectory` symlink logic into a shared module (`src/utils/rules-reader.ts`) and have both loader and webview consume it.
- Risk: Medium. Refactor touches multiple call sites.
- Effort: ~2-4 days incl. tests and migration.
- Pros: Eliminates duplication; single tested implementation; consistent behavior.
- Cons: Slight refactor effort; ensure webview bundling/imports work for the shared util.

```mermaid
graph TD
  A[loadRuleFiles] --> B[rules-reader.ts]
  C[getEnabledRulesFromDirectory] --> B
  B --> D[Symlink aware enumeration]
```

### Option C — RulesService: full centralization and caching

- Change: Implement `RulesService` (singleton) exposing discover(), read(), getToggles(); centralize caching, invalidation, normalization, and telemetry.
- Risk: High. Architectural change.
- Effort: ~1-2 weeks.
- Pros: Best long-term maintainability and performance; single API for consumers.
- Cons: Larger change, more review, migration work.

```mermaid
graph TD
  UI[UI] -->|query| S[RulesService]
  Loader[Loader] -->|query| S
  S --> Cache[Cache layer]
  S --> Reader[Symlink aware reader]
```

## Recommendation

- Implement Option A immediately to resolve the user-facing issue.
- Parallel-track Option B to remove duplication and stabilize behavior.
- Consider Option C only if future needs (performance, features) justify the larger investment.

## Next steps & acceptance criteria

1. Create PR for Option A:

    - Update [`src/core/webview/kilorules.ts`](src/core/webview/kilorules.ts:47) to resolve symlinks when building toggles.
    - Add unit tests mirroring symlink tests in [`src/core/prompts/sections/__tests__/custom-instructions.spec.ts`](src/core/prompts/sections/__tests__/custom-instructions.spec.ts:1617).
    - Acceptance: webview shows symlinked rules; CI passes.

2. Implement Option B in follow-up PR:

    - Add `src/utils/rules-reader.ts` with exported API: discover(dir), readFiles(dir), resolveSymlinks(options).
    - Replace call sites: [`src/core/prompts/sections/custom-instructions.ts`](src/core/prompts/sections/custom-instructions.ts:211) and [`src/core/webview/kilorules.ts`](src/core/webview/kilorules.ts:47).
    - Acceptance: behavior identical; tests consolidated.

3. Long-term: evaluate RulesService if caching or richer API needed.

<a id="navigation-footer"></a>

- Back: [`plans/README.md`](plans/README.md:1) · Root: [`README.md`](README.md:1) · Source: `/plans/UNIFY_RULES_DISCOVERY_PLAN.md#L1`
