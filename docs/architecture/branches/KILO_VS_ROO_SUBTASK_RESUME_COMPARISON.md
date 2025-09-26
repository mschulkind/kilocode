# Kilo vs Roo Comparison: Subtask Resume & Orchestrator Continuation

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

Purpose: Compare Kilo’s analysis/proposal to the Roo-Code branch
`catrielmuller/fix-orchestator-load-subtask`, relative to Roo `origin/main`. Highlight base
differences, touched files, behavioral deltas, and alignment/variance with our cleanup plan.

## Quick Navigation

## Research Context

- *Purpose:** \[Describe the purpose and scope of this document]

- *Background:** \[Provide relevant background information]

- *Research Questions:** \[List key questions this document addresses]

- *Methodology:** \[Describe the approach or methodology used]

- *Findings:** \[Summarize key findings or conclusions]

- **
- [Branch Analysis: orchestator-load-subtask (Kilo)](./ORCHESTATOR_LOAD_SUBTASK_CHANGES_ANALYSIS.md)
- [Cleanup Proposal: Replace orchestator-load-subtask (Kilo)](./ORCHESTATOR_LOAD_SUBTASK_CLEANUP_PROPOSAL.md)

## Repositories and Branches Compared
- Kilo: current repo (analysis/proposal live here)
- Roo: `/home/matt/code/system/Roo-Code` on branch `catrielmuller/fix-orchestator-load-subtask`
- Roo baseline: `origin/main`

## Roo Branch Diff (against origin/main)
- Branch: `catrielmuller/fix-orchestator-load-subtask`
- Files changed (top-level):
- `src/core/task/Task.ts` (modified)
- `src/core/webview/ClineProvider.ts` (modified)
- `src/core/webview/__tests__/ClineProvider.stack-reconstruction.spec.ts` (added)
- `src/core/webview/__tests__/ClineProvider.taskReconstruction.spec.ts` (added)
- `.changeset/rude-pans-throw.md` (added)
- Stats: 5 files changed, 1506 insertions, 5 deletions

Inference (from paths):
- Roo mirrors the same change loci as Kilo (Task.ts, ClineProvider.ts) and adds targeted tests for
  stack/task reconstruction (good practice and a base difference vs Kilo at the time of the break).

## Conceptual Before/After (Kilo vs Roo)

Kilo (observed)
- Before: `finishSubTask` removed subtask from stack and only called `completeSubtask`.
- After: `finishSubTask` delegates to `continueParentTask`, which:
- Rehydrates parent if needed (`isInitialized` guard; load messages + API history).
- Calls `completeSubtask`.
- Background-triggers `recursivelyMakeClineRequests([], false)` if not paused.
- Side effect: can race with main loop when parent was already running (2- and 3-request variants).

Roo (observed by diff scope)
- Touches the same two core files, so likely similar structural change: parent rehydration + a
  resume call post-subtask completion.
- Adds tests around stack and task reconstruction:
- Suggests Roo codified the navigation scenario and validates reconstruction correctness.
- Minimal deletions vs large insertions indicate additive behavior (rehydration/resume) rather than
  refactors.

## Base Differences That Matter
- Tests present in Roo: Roo has specific `__tests__/ClineProvider.*` validating reconstruction; Kilo
  lacked these until our new plan.
- Naming and branch intent: Roo’s branch name is aligned with the fix; Kilo’s local changes were
  integrated without tests initially, causing regressions.
- Divergence age: Forks have evolved separately; code structure differences may exist in
  providers/services.

## Alignment With Our Cleanup Proposal

Where Roo aligns out of the box
- Parent rehydration path before continuation (seen by modified `ClineProvider.ts`).
- Recognition of reconstruction as a first-class scenario (presence of tests).

Where differences may remain
- Concurrent recursion prevention: Roo’s diff shows changes only in `Task.ts` and
  `ClineProvider.ts`. Without a central arbiter/guard, Roo may still allow concurrent calls if both
  main loop and completion trigger continuation.
- Idempotency: No evidence of an idempotency layer from the paths alone.
- Single-writer model: No new central module is present in the changed files list.
- Policy/cooldown around “green text end-of-turn”: Not evident from paths.

## Recommended Mapping of Kilo Proposal to Roo
1. Introduce a Request Arbiter (per TaskId) in Roo
- Add a new module (e.g., `src/core/execution/RequestArbiter.ts`) to own next-action selection.
- Have `ClineProvider` and `Task` submit intents instead of directly calling recursion.
2. Parent Initialization as Eligibility
- Move rehydration into arbiter/executor eligibility checks; treat it as an `initialize-parent`
  intent that always precedes continuation.
3. Idempotent Execution Keys
- Implement idempotency in Roo’s API execution layer (Task/Executor), keyed by TaskId+Turn+Reason.
4. Update and Extend Roo Tests
- Keep Roo’s reconstruction tests; add tests for:
- No concurrent recursion under concurrent producers.
- Deterministic selection under competing intents (user > recovery > subtask-completion >
    main-loop).
- Triple-request prevention when green text is emitted prematurely.
5. Observability
- Add span logs for arbiter decisions and executor lifecycle to Roo’s tracing layer.

## Side-by-Side Conceptual Diffs

ClineProvider (Kilo current vs Roo branch)
- Both: ensure parent rehydration + continuation after subtask finish.
- Kilo issue: background fire-and-forget recursion causes race in active sessions.
- Roo: likely same pattern; tests focus on reconstruction, not concurrency.

Task (Kilo vs Roo)
- Both: main loop calls recursion.
- Needed: shift to intent submission so main loop doesn’t compete with completion path.

Tests (Kilo vs Roo)
- Roo: added meaningful tests for reconstruction.
- Kilo: our plan adds both reconstruction and concurrency tests; Roo should adopt the concurrency
  suite.

## Conclusion
- Roo implemented the necessary rehydration/resume behavior and added tests around reconstruction—a
  stronger basis than Kilo had at the time of failure.
- Both codebases still need a concurrency-safe selection model. Applying the Request Arbiter +
  idempotency + eligibility gates will harmonize behavior, prevent races, and keep navigation fixes.
- Action: Port Kilo’s cleanup proposal (arbiter model, idempotency, policy) to Roo; keep Roo’s tests
  and add concurrency-specific tests.

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

- *Understanding Architecture:**

- **Next**: Check related architecture documentation in the same directory
- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology,
  [Architecture Documentation](README.md) for context

- *Implementing Architecture Features:**

- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) →
  [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)
- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

- *Troubleshooting Architecture Issues:**

- **Next**: \[Race Condition Analysis]race-condition/README.md) →
  \[Root Cause Analysis]race-condition/ROOT\_CAUSE\_ANALYSIS.md)
- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Architecture Documentation](README.md) for guidance.

## Navigation Footer

- **

- *Navigation**: [← Back to Architecture Documentation](README.md) ·
[📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
