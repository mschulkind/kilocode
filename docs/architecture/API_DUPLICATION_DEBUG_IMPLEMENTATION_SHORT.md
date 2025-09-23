# API Duplication Debug Implementation (Short)

Purpose: Practical, minimal playbook to instrument, reproduce, and verify the duplicate-API-call race conditions. This is a condensed version. See the full guide in `API_DUPLICATION_DEBUG_IMPLEMENTATION.md`.

## Quick Links

- [Root Cause Analysis of Duplicate API Requests](./race-condition/ROOT_CAUSE_ANALYSIS.md)
- [Code Flow and Execution Analysis](./race-condition/CODE_FLOW_ANALYSIS.md)
- [State Machine Index and Diagrams](./state-machines/INDEX.md)
- [Solution Options and Synchronization Strategies](./race-condition/SOLUTION_RECOMMENDATIONS.md)
- [Testing Strategy and Validation Plan](./race-condition/TESTING_STRATEGY.md)

## Goals

- Detect concurrent `recursivelyMakeClineRequests` invocations.
- Attribute each call (reason: main-loop | subtask-completion | user-request).
- Capture timings to prove interleaving (race) vs sequence.
- Tie logs to spans for end-to-end traces (Laminar).

## Minimal Instrumentation

Add structured logs (JSON) and span breadcrumbs.

```ts
// Task.ts
private recursiveCallLock = new AsyncLock()
private callHistory: Array<{ id: string; reason: string; start: number; end?: number }> = []

async recursivelyMakeClineRequests(
	content: string[],
	includeFiles: boolean,
	reason: "main-loop" | "subtask-completion" | "user-request" = "main-loop",
): Promise<boolean> {
	const callId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	this.logJSON({ at: "Task.recursivelyMakeClineRequests", evt: "start", callId, reason })
	this.laminar.span("recursiveCall", { callId, reason }).mark("start")
	this.callHistory.push({ id: callId, reason, start: Date.now() })

	return await this.recursiveCallLock.acquire(async () => {
		try {
			const result = await this._recursivelyMakeClineRequests(content, includeFiles)
			return result
		} finally {
			const entry = this.callHistory.find(c => c.id === callId)
			if (entry) entry.end = Date.now()
			this.laminar.span("recursiveCall", { callId, reason }).mark("end")
			this.logJSON({ at: "Task.recursivelyMakeClineRequests", evt: "end", callId, reason })
		}
	})
}
```

```ts
// ClineProvider.ts (subtask completion)
await parentTask.recursivelyMakeClineRequests([], false, "subtask-completion")
```

Utility:

```ts
private logJSON(obj: unknown) {
	console.log(JSON.stringify(obj))
}
```

## Minimal Reproduction Scenarios

1. Two-request race (most common)

- Start orchestrator task with a plan that spawns a subtask.
- Keep UI on the same chat (no navigation).
- At subtask completion, observe two starts close in time:
    - start { reason: "main-loop" }
    - start { reason: "subtask-completion" }
- Expect jumbled responses/spinners if lock is not present.

2. Three-request variant (severe)

- Subtask prematurely ends (green text).
- User sends another message immediately.
- Observe three nearly-simultaneous starts:
    - main-loop, subtask-completion, user-request.
- Expect XML/corruption symptoms without synchronization.

## Verification Checklist

- Confirm exactly one active call at any timestamp after lock is enabled.
- Ensure `end` of a call precedes the `start` of the next one (except queued scenarios).
- Laminar trace shows a single active `recursiveCall` span at a time per task.

## Metrics to Capture

- call_count by reason
- concurrent_call_detected (boolean)
- max_parallelism (expect 1 after fix)
- duration_ms per call
- queue_wait_ms when lock is contended

## Log Patterns (for grep/jq)

```bash
# Starts by reason
jq -r 'select(.at=="Task.recursivelyMakeClineRequests" and .evt=="start") | [.reason] | @tsv'

# Overlaps (naive)
# Sort by time externally and flag starts that occur before the previous end
```

## Laminar Spans

- Parent span: task execution
- Child span: recursiveCall (tagged with reason, callId)
- Add marks: start/end; record attributes duration_ms, wait_ms

## Expected Outcomes After Fix

- No concurrent starts for the same task.
- Queued attempts visible as wait time, not overlap.
- 2-request/3-request scenarios disappear in logs and UI.

## Rollback Plan

- Feature flag the lock.
- If throughput regressions are reported, toggle flag off and investigate.

## Where to Go Next

- [Navigation Scenario and Parent Resumption Context](./race-condition/NAVIGATION_SCENARIO.md)
- [Complete Solution Options and Tradeoffs](./race-condition/SOLUTION_RECOMMENDATIONS.md)
- [Tests to Add for Race Prevention](./race-condition/TESTING_STRATEGY.md)

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

**Understanding Architecture:**

- **Next**: Check related architecture documentation in the same directory
- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Architecture Documentation](README.md) for context

**Implementing Architecture Features:**

- **Next**: [Repository Development Guide](./repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](./repository/TESTING_INFRASTRUCTURE.md)
- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

**Troubleshooting Architecture Issues:**

- **Next**: [Race Condition Analysis](./race-condition/README.md) → [Root Cause Analysis](./race-condition/ROOT_CAUSE_ANALYSIS.md)
- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to [Architecture Documentation](README.md) for guidance.

---

**Navigation**: [← Back to Architecture Documentation](README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#research-context--next-steps)
