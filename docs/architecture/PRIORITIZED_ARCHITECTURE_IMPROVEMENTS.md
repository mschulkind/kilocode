# Prioritized Architecture Improvements

Purpose: High-impact, near-to-mid term improvements around task/orchestrator, recursion, session management, and API execution. Complements the race-condition work with strategic upgrades.

## Quick Navigation

- [Request Arbiter and Declarative Execution Model](./race-condition/SOLUTION_RECOMMENDATIONS.md)
- [Code Flow and Execution Analysis](./race-condition/CODE_FLOW_ANALYSIS.md)
- [State Machine Index and Diagrams](./state-machines/INDEX.md)
- [Repository Structure Overview](./repository/REPOSITORY_STRUCTURE.md)

## Top Priorities (Tier 0–1)

1. Request Arbiter (single authority for “what runs next”)

- Problem: Multiple producers can trigger execution; a lock masks ambiguity.
- Outcome: Only one SelectedAction at a time; producers submit intents; executor runs the choice.
- Link: [Solution Options and Synchronization Strategies](./race-condition/SOLUTION_RECOMMENDATIONS.md)

2. Parent Initialization as a First-Class Precondition

- Auto-insert InitializeParent intent gated by eligibility before any continuation.
- Ensures correctness after navigation without scattered checks.
- Link: [Navigation Scenario and Parent Resumption Context](./race-condition/NAVIGATION_SCENARIO.md)

3. Idempotent API/Tool Execution Contract

- Idempotency keys per TaskId+Turn+Step; dedupe late arrivals/retries.
- Prevent duplicate tool side effects; single write per logical step.

4. Formal State Machines as Runtime Guards

- Promote Task/Session/RecursiveCall charts to enforce transitions at runtime.
- Reject illegal concurrent transitions; log violations.
- Link: [State Machine Index and Diagrams](./state-machines/INDEX.md)

5. Single Writer Principle per TaskId

- Exactly one writer (arbiter+executor) mutates execution state; others only publish intents.

## High Priority (Tier 2)

6. Event-Sourced Task Timeline

- Append-only log of intents → selections → results; perfect resume and audit.

7. Standardized Reconstruction

- Canonical loader restores messages, API history, FSM, pending intents; RA resumes deterministically.

8. UI State Contract and Spinner Semantics

- One SelectedAction → one spinner; queue shows pending intents; end-of-turn cooldowns.

9. Tool Invocation Envelope

- Idempotency token, deadline, cancellation; executor owns lifecycle; results via RA.

10. Observability First

- Arbiter spans: inputs, eligibility, policy, selection. Executor spans: lifecycle, idempotency.
- Link: [Observability Layer System](./OBSERVABILITY_LAYER_SYSTEM.md)

## Medium Priority (Tier 3)

11. Queue Persistence and Back-Pressure

- Durable queue per TaskId; priorities adapt under load; surface UI back-pressure.

12. Policy Engine for Priorities and Cooldowns

- Declarative policies: user > recovery > main-loop; cooldowns; burst limits; hot-reload.

13. Failure Domains and Circuit Breakers

- Isolate providers/tools; breakers on error budgets; degrade gracefully.

14. Time-Bounded Steps and Watchdogs

- Per-action deadlines; RA selects recovery/rollback on timeout.

## Low Priority (Tier 4)

15. Multi-Task Concurrency Scheduler

- Fair scheduling across tasks; per-user quotas; priority inheritance.

16. Planner Integration (Future)

- High-level planner proposes; RA selects exactly one.

## Risks and Mitigations

- Centralization (RA bottleneck) → per-TaskId arbiters; measure latency; keep policies simple.
- Migration complexity → staged rollout, flags, dual-path logging, shims.
- Over-constraint → admin override policies for debugging.

## Success Metrics

- Zero concurrent recursive executions per TaskId.
- P95/P99 RA decision latency within budget.
- Idempotency dedupe rate; reduced duplicate API/tool calls.
- UX: no multiple spinners; no XML/jumbled responses.

## Suggested Rollout Plan

- Phase A: Arbiter/Executor behind flags; producers emit intents.
- Phase B: Enforce Single Writer; remove direct recursion; keep lock as fallback.
- Phase C: Idempotency keys, cooldown policies; ship spinner contract.
- Phase D: Event-sourced timeline; runtime FSM; enhanced observability.

## Related Reading

- [Race Condition Analysis (Master Index)](./API_DUPLICATION_RACE_CONDITION_ANALYSIS.md)
- [Solution Options and Synchronization Strategies](./race-condition/SOLUTION_RECOMMENDATIONS.md)
- [Testing Strategy and Validation Plan](./race-condition/TESTING_STRATEGY.md)
- [Repository Overview (Master Index)](./REPOSITORY_OVERVIEW.md)
