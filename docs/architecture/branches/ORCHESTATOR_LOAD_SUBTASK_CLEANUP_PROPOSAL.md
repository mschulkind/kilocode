# Cleanup Proposal: Replace `catrielmuller/orchestator-load-subtask`

## Table of Contents

* [Cleanup Proposal: Replace ](#cleanup-proposal-replace)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Quick Navigation](#quick-navigation)
* [Research Context](#research-context)
* [Objectives](#objectives)
* [Design Overview](#design-overview)
* [Changes (Before → After)](#changes-before--after)
* [1) Provider: Stop directly calling recursion; emit intent instead](#1-provider-stop-directly-calling-recursion-emit-intent-instead)
* [2) Task: Wrap recursion in arbiter-aware executor](#2-task-wrap-recursion-in-arbiter-aware-executor)
* [3) Arbiter: Single selection with explicit preconditions](#3-arbiter-single-selection-with-explicit-preconditions)
* [4) Executor: Idempotent recursion + parent init intent](#4-executor-idempotent-recursion--parent-init-intent)
* [Testing Plan](#testing-plan)
* [Migration Plan](#migration-plan)
* [Rollback](#rollback)
* [Expected Outcomes](#expected-outcomes)
* [🔍 Research Context & Next Steps](#-research-context--next-steps)
* [When You're Here, You Can:](#when-youre-here-you-can)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation Footer](#navigation-footer)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Cleanup Proposal: Replace ](#cleanup-proposal-replace)
* [Table of Contents](#table-of-contents)
* [Quick Navigation](#quick-navigation)
* [Research Context](#research-context)
* [Objectives](#objectives)
* [Design Overview](#design-overview)
* [Changes (Before → After)](#changes-before--after)
* [1) Provider: Stop directly calling recursion; emit intent instead](#1-provider-stop-directly-calling-recursion-emit-intent-instead)
* [2) Task: Wrap recursion in arbiter-aware executor](#2-task-wrap-recursion-in-arbiter-aware-executor)
* [3) Arbiter: Single selection with explicit preconditions](#3-arbiter-single-selection-with-explicit-preconditions)
* [4) Executor: Idempotent recursion + parent init intent](#4-executor-idempotent-recursion--parent-init-intent)
* [Testing Plan](#testing-plan)
* [Migration Plan](#migration-plan)
* [Rollback](#rollback)
* [Expected Outcomes](#expected-outcomes)
* [🔍 Research Context & Next Steps](#-research-context--next-steps)
* [When You're Here, You Can:](#when-youre-here-you-can)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation Footer](#navigation-footer)

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
> documentation helps us understand how! ⚙️

Purpose: A PR-style, end-to-end proposal that supersedes the original branch. It retains the
navigation resume fix while eliminating concurrency races, adding idempotency, and centralizing
control.

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

* **Purpose**: \[Brief description of what this document covers]
* **Audience**: \[Who should read this document]
* **Prerequisites**: \[What you should know before reading]
* **Related Documents**: \[Links to related documentation]

## Quick Navigation

## Research Context

* *Purpose:*\* \[Describe the purpose and scope of this document]

* *Background:*\* \[Provide relevant background information]

* *Research Questions:*\* \[List key questions this document addresses]

* *Methodology:*\* \[Describe the approach or methodology used]

* *Findings:*\* \[Summarize key findings or conclusions]

* \*\*

* [Branch Changes Analysis](./ORCHESTATOR_LOAD_SUBTASK_CHANGES_ANALYSIS.md)

* [Solution Options and Synchronization Strategies](../race-condition/SOLUTION_RECOMMENDATIONS.md)

* [Testing Strategy and Validation Plan](../../testing/TESTING_STRATEGY.md)

## Objectives

* Preserve: parent resume after navigation away/back.
* Fix: eliminate concurrent `recursivelyMakeClineRequests` from multiple sources.
* Improve: idempotency, observability, and explicit preconditions.

## Design Overview

* Add a `RequestArbiter` per TaskId to select exactly one next action.
* Producers (main loop, subtask completion, user) submit `Intent`s.
* Executor performs the selected action and emits lifecycle events.
* Parent initialization modeled as an eligibility-gated `InitializeParent` intent.

## Changes (Before → After)

### 1) Provider: Stop directly calling recursion; emit intent instead

Before

```ts
// ClineProvider.ts
private async continueParentTask(lastMessage: string): Promise<void> {
	const parentTask = this.getCurrentTask()
	if (!parentTask) return

	if (!parentTask.isInitialized) {
		parentTask.clineMessages = await parentTask.getSavedClineMessages()
		parentTask.apiConversationHistory = await parentTask.getSavedApiConversationHistory()
		parentTask.isInitialized = true
	}

	await parentTask.completeSubtask(lastMessage)

	if (!parentTask.isPaused && parentTask.isInitialized) {
		const continueExecution = async () => {
			await parentTask.recursivelyMakeClineRequests([], false)
		}
		continueExecution()
	}
}
```

After

```ts
// ClineProvider.ts
private async continueParentTask(lastMessage: string): Promise<void> {
	const parentTask = this.getCurrentTask()
	if (!parentTask) return

	await parentTask.completeSubtask(lastMessage)

	// Submit intent; Arbiter will handle init/continuation ordering
	this.requestArbiter.submit({
		taskId: parentTask.taskId,
		source: "subtask-completion",
		type: "continue-parent",
		payload: { lastMessage },
		ttlMs: 60000,
	})
}
```

Motivation

* Centralize selection and sequencing; remove fire-and-forget recursion from the provider.

### 2) Task: Wrap recursion in arbiter-aware executor

Before

```ts
// Task.ts
const didEndLoop = await this.recursivelyMakeClineRequests(nextUserContent, includeFileDetails)
```

After

```ts
// Task.ts
this.requestArbiter.submit({
	taskId: this.taskId,
	source: "main-loop",
	type: "execute-recursion",
	payload: { nextUserContent, includeFileDetails },
})
```

Motivation

* Main loop becomes a producer of intents, not an executor; single writer enforces sequencing.

### 3) Arbiter: Single selection with explicit preconditions

New

```ts
// RequestArbiter.ts
export class RequestArbiter {
	constructor(
		private readonly taskId: string,
		private readonly executor: Executor,
	) {}
	private queue: Intent[] = []
	private selecting = false

	submit(intent: Intent) {
		this.queue.push(intent)
		void this.selectNext()
	}

	private async selectNext() {
		if (this.selecting) return
		this.selecting = true
		try {
			const candidates = this.queue.filter(this.isEligible)
			const next = this.applyPolicy(candidates)
			if (!next) return
			this.queue = this.queue.filter((i) => i !== next)
			await this.executor.execute(next)
		} finally {
			this.selecting = false
			if (this.queue.length) void this.selectNext()
		}
	}

	private isEligible = (i: Intent) => {
		if (i.type === "continue-parent" || i.type === "execute-recursion") {
			if (!this.executor.parentInitialized()) return false
		}
		return true
	}

	private applyPolicy(intents: Intent[]): Intent | undefined {
		// Example: user > recovery > subtask-completion > main-loop
		const order = ["user-request", "recovery", "subtask-completion", "main-loop"]
		return intents.sort((a, b) => order.indexOf(a.source) - order.indexOf(b.source))[0]
	}
}
```

Motivation

* Exactly one selected action at a time; eligibility guarantees proper ordering (e.g., init first).

### 4) Executor: Idempotent recursion + parent init intent

New

```ts
// Executor.ts
export class Executor {
	constructor(private readonly task: Task) {}

	parentInitialized(): boolean {
		return this.task.isInitialized === true
	}

	async execute(i: Intent): Promise<void> {
		if (i.type === "continue-parent") {
			await this.ensureParentInitialized()
			return this.executeRecursion([], false, "subtask-completion")
		}
		if (i.type === "execute-recursion") {
			await this.ensureParentInitialized()
			const { nextUserContent, includeFileDetails } = i.payload
			return this.executeRecursion(nextUserContent, includeFileDetails, i.source)
		}
		if (i.type === "initialize-parent") {
			await this.ensureParentInitialized()
		}
	}

	private async ensureParentInitialized() {
		if (this.task.isInitialized) return
		this.task.clineMessages = await this.task.getSavedClineMessages()
		this.task.apiConversationHistory = await this.task.getSavedApiConversationHistory()
		this.task.isInitialized = true
	}

	private async executeRecursion(content: string[], includeFiles: boolean, reason: string) {
		const key = `${this.task.taskId}:${this.task.currentTurnId}:${reason}`
		if (await this.task.idempotencySeen(key)) return
		await this.task.markIdempotency(key)
		await this.task.recursivelyMakeClineRequests(content, includeFiles)
	}
}
```

Motivation

* Enforce initialization before recursion; add idempotency to prevent duplicates.

## Testing Plan

* Determinism: one selected action at a time.
* Navigation: initialize-parent → continuation ordering guaranteed.
* No-overlap: concurrent producers result in queued intents, not concurrent recursion.
* E2E: no multiple spinners; no XML corruption.

## Migration Plan

* Feature-flag RA/Executor path; submit intents in parallel with existing path for logging-only
  validation.
* Switch providers and task to intent submission; remove direct recursion calls.
* Remove temporary lock once RA proves stable.

## Rollback

* Disable RA flag; revert providers to direct flow (kept in code for the rollout window only).

## Expected Outcomes

* Race class eliminated by design.
* Clear audit trail of decisions; improved UX and stability.

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

* *Understanding Architecture:*\*

* **Next**: Check related architecture documentation in the same directory

* **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology,
  [Architecture Documentation](README.md) for context

* *Implementing Architecture Features:*\*

* **Next**: [Repository Development Guide](../GETTING_STARTED.md) →
  [Testing Infrastructure](../../testing/TESTING_STRATEGY.md)

* **Related**: [Orchestrator Documentation](../../orchestrator/README.md) for integration patterns

* *Troubleshooting Architecture Issues:*\*

* **Next**: \[Race Condition Analysis]race-condition/README.md) →
  \[Root Cause Analysis]race-condition/ROOT\_CAUSE\_ANALYSIS.md)

* **Related**: [Orchestrator Error Handling](../../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Architecture Documentation](README.md) for guidance.

## Navigation Footer

* \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

* **If you're new here**: Start with the [When You're Here](#when-youre-here) section

* **If you need context**: Check the [Research Context](#research-context) section

* **If you're ready to implement**: Jump to the implementation sections

* **If you're stuck**: Visit our [Troubleshooting Guide](../../tools/TROUBLESHOOTING_GUIDE.md)

* **If you need help**: Check the [Technical Glossary](../../GLOSSARY.md)

* *Navigation*\*: [← Back to Architecture Documentation](README.md) ·
  [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
