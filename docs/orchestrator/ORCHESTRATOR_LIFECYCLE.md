# Orchestrator Task Lifecycle

## Table of Contents

* [Orchestrator Task Lifecycle](#orchestrator-task-lifecycle)
* [Table of Contents](#table-of-contents)
* [Related Documents](#related-documents)
* [Lifecycle Overview](#lifecycle-overview)
* [Lifecycle Stages in Detail](#lifecycle-stages-in-detail)
* [Stage 1: Initiation](#stage-1-initiation)
* [Stage 2: Prompt Generation](#stage-2-prompt-generation)
* [Stage 3: Model Response & Parsing](#stage-3-model-response--parsing)
* [Stage 4: Parsing & Execution Loop](#stage-4-parsing--execution-loop)
* [Stage 5: Completion](#stage-5-completion)
* [Stage 6: Termination](#stage-6-termination)
* [State Transitions](#state-transitions)
* [The Execution Loop: ](#the-execution-loop-)
* [Subtask Lifecycle](#subtask-lifecycle)
* [Navigation Footer](#navigation-footer)
* [When You're Here](#when-youre-here)
* [Provider network send points, duplicate-causes, and recommended docs-only changes](#provider-network-send-points-duplicate-causes-and-recommended-docs-only-changes)
* [Quick pointer to code](#quick-pointer-to-code)
* [Concrete send patterns (summary)](#concrete-send-patterns-summary)
* [Likely causes of duplicate requests (doc summary)](#likely-causes-of-duplicate-requests-doc-summary)
* [Docs-only recommendations (no code changes)](#docs-only-recommendations-no-code-changes)
* [Suggested doc locations & links (insert these pages)](#suggested-doc-locations--links-insert-these-pages)
* [🔍 Research Context & Next Steps](#research-context--next-steps)
* [When You're Here, You Can:](#when-youre-here-you-can)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Next doc-step I will take (if you approve)](#next-doc-step-i-will-take-if-you-approve)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation](#navigation)
* [Orchestrator Task Lifecycle](#orchestrator-task-lifecycle)
* [Table of Contents](#table-of-contents)
* [Related Documents](#related-documents)
* [Lifecycle Overview](#lifecycle-overview)
* [Lifecycle Stages in Detail](#lifecycle-stages-in-detail)
* [Stage 1: Initiation](#stage-1-initiation)
* [Stage 2: Prompt Generation](#stage-2-prompt-generation)
* [Stage 3: Model Response & Parsing](#stage-3-model-response--parsing)
* [Stage 4: Parsing & Execution Loop](#stage-4-parsing--execution-loop)
* [Stage 5: Completion](#stage-5-completion)
* [Stage 6: Termination](#stage-6-termination)
* [State Transitions](#state-transitions)
* [The Execution Loop: ](#the-execution-loop-)
* [Subtask Lifecycle](#subtask-lifecycle)
* [Navigation Footer](#navigation-footer)
* [Provider network send points, duplicate-causes, and recommended docs-only changes](#provider-network-send-points-duplicate-causes-and-recommended-docs-only-changes)
* [Quick pointer to code](#quick-pointer-to-code)
* [Concrete send patterns (summary)](#concrete-send-patterns-summary)
* [Likely causes of duplicate requests (doc summary)](#likely-causes-of-duplicate-requests-doc-summary)
* [Docs-only recommendations (no code changes)](#docs-only-recommendations-no-code-changes)
* [Suggested doc locations & links (insert these pages)](#suggested-doc-locations--links-insert-these-pages)
* [🔍 Research Context & Next Steps](#research-context--next-steps)
* [When You're Here, You Can:](#when-youre-here-you-can)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Next doc-step I will take (if you approve)](#next-doc-step-i-will-take-if-you-approve)

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
> behind the "what"! 💻

* *Purpose:*\* This document provides a detailed, step-by-step description of the orchestrator's
  task
  lifecycle, from the moment a request is received to its final completion. It covers state
  transitions, the execution loop, and subtask management.

> **Geology Fun Fact**: The orchestrator lifecycle is like the rock cycle - tasks start as molten
> magma (CREATED), cool into solid rock (RUNNING), get weathered by external forces (PAUSED), and
> eventually erode back into sediment (COMPLETED)! 🪨

<details>
<summary>Table of Contents</summary>
- [1. Related Documents](#related-documents)
- [2. Lifecycle Overview](#lifecycle-overview)
- [3. Lifecycle Stages in Detail](#lifecycle-stages-in-detail)
- [4. State Transitions](#state-transitions)
- [5. The Execution Loop:
`recursivelyMakeClineRequests`](#the-execution-loop-recursivelymakeclinerequests)
- [6. Subtask Lifecycle](#subtask-lifecycle)
- [7. Navigation Footer](#navigation-footer)

</details>
- \*\*

### Related Documents

<a id="related-documents"></a>

* **[Orchestrator Master Index](../orchestrator/ORCHESTRATOR_INDEX.md)**: The master index for all
  orchestrator
  documentation.
* **[Orchestrator Architecture](ORCHESTRATOR_ARCHITECTURE.md)**: Describes the components
  involved in the lifecycle.
* **[Task Delegation Guide](ORCHESTRATOR_TASK_DELEGATION.md)**: Focuses specifically on
  the subtask creation and management process.
* **[Error Handling Guide](ORCHESTRATOR_ERROR_HANDLING.md)**: Explains how errors are
  handled at various stages of the lifecycle.

[Back to Top](#orchestrator-task-lifecycle)

* \*\*

### Lifecycle Overview

<a id="lifecycle-overview"></a>

The task lifecycle is a stateful, iterative process managed by the `Task` engine. It is designed to
handle complex, multi-step workflows that may involve multiple interactions with the language model
and various tools. The entire process is kicked off by a single call and runs until a completion
state is reached.

```mermaid
sequenceDiagram
    participant Client
    participant TaskEngine
    participant Model
    participant ToolExecutor

    Client->>TaskEngine: Initiate Request
    TaskEngine->>TaskEngine: 1. Initiation (initiateTaskLoop)
    TaskEngine->>Model: 2. Prompt Generation (getSystemPrompt)
    Model-->>TaskEngine: 3. Model Response (Streaming)
    TaskEngine->>TaskEngine: 4. Parsing & Execution (recursivelyMakeClineRequests)
    TaskEngine->>ToolExecutor: Execute Tool
    ToolExecutor-->>TaskEngine: Tool Result
    Note over TaskEngine,ToolExecutor: Loop until completion tool is called
    TaskEngine->>ToolExecutor: 5. Completion (attemptCompletionTool)
    ToolExecutor-->>TaskEngine: Final State
    TaskEngine-->>Client: 6. Termination
```

[Back to Top](#orchestrator-task-lifecycle)

* \*\*

### Lifecycle Stages in Detail

<a id="lifecycle-stages-in-detail"></a>

#### Stage 1: Initiation

A task begins when an external caller (e.g., the VS Code extension UI) invokes the
[`initiateTaskLoop`](../../src/core/task/Task.ts#L1699) function. At this stage, the `Task` object
is
created, initial state is set up, and the context for the task is established.

#### Stage 2: Prompt Generation

The `Task` engine constructs the initial prompt to be sent to the language model. This is handled by
the [`getSystemPrompt`](../../src/core/task/Task.ts#L2499) function, which assembles the user's
request, conversation history, available tools, and formatting rules like
[`markdownFormattingSection`](../../src/core/prompts/sections/markdown-formatting.ts#L1).

#### Stage 3: Model Response & Parsing

The prompt is sent to the model. The orchestrator's `StreamingParser` begins processing the response
as it arrives. It actively scans for tool-call syntax, allowing the system to react instantly
without waiting for the full response.

#### Stage 4: Parsing & Execution Loop

This is the core interactive phase of the lifecycle, driven by
[`recursivelyMakeClineRequests`](../../src/core/task/Task.ts#L1735). When the parser identifies a
valid tool call, the `ToolExecutor` validates and runs it. The result of the tool execution is then
appended to the conversation history, and the loop continues by sending the updated context back to
the model.

#### Stage 5: Completion

The loop terminates when the model invokes the special
[`attemptCompletionTool`](../../src/core/tools/attemptCompletionTool.ts#L35). This signals that the
task's objective has
been met. The tool is responsible for packaging the final result and setting the task's status to
"completed."

#### Stage 6: Termination

The `Task` engine performs final cleanup, persists the final state, and returns the result to the
initial caller. The lifecycle for this task instance is now complete.

[Back to Top](#orchestrator-task-lifecycle)

* \*\*

### State Transitions

<a id="state-transitions"></a>

A task can exist in several states throughout its lifecycle:

* `pending`: The task has been created but the execution loop has not yet begun.
* `in_progress`: The task is actively engaged in the model-response/tool-execution loop.
* `awaiting_subtask`: The task has delegated work to a subtask and is paused, waiting for it to
  complete.
* `completed`: The task has successfully finished via `attemptCompletionTool`.
* `failed`: The task terminated due to an unrecoverable error or reaching its mistake limit.

[Back to Top](#orchestrator-task-lifecycle)

* \*\*

### The Execution Loop: `recursivelyMakeClineRequests`

<a id="the-execution-loop-recursivelymakeclinerequests"></a>

The function [`recursivelyMakeClineRequests`](../../src/core/task/Task.ts#L1735) is the engine of
the
lifecycle. It is not a simple loop but a recursive function that represents one full turn of the
conversation with the model.

1. **Call Model**: Sends the current context (history, tool results) to the model.
2. **Parse Response**: The `StreamingParser` processes the output.
3. **Execute Tools**: If tool calls are found, they are executed.
4. **Recurse**: The function calls itself with the updated context, continuing the "conversation"
   until a terminal state (completion or failure) is reached.

[Back to Top](#orchestrator-task-lifecycle)

* \*\*

### Subtask Lifecycle

<a id="subtask-lifecycle"></a>

When the model determines a part of the task requires isolated execution, it can use the
[`startSubtask`](../../src/core/task/Task.ts#L1628) tool.

1. **Pause Parent**: The parent task's state is set to `awaiting_subtask`.
2. **Create Child**: A new `Task` instance is created with a specific, narrowed-down objective. This
   child task has its own independent lifecycle.
3. **Execute Child**: The child task runs through its own initiation, execution, and completion
   stages.
4. **Resume Parent**: Once the child task calls
   [`completeSubtask`](../../src/core/task/Task.ts#L1669), its result is passed back to the parent.
   The parent task's state is switched back to `in_progress`, and its execution loop continues, now
   with the information from the completed subtask.

[Back to Top](#orchestrator-task-lifecycle)

* \*\*

### Navigation Footer

<a id="navigation-footer"></a>

You have reached the end of the lifecycle document. Return to the
[Master Index](../orchestrator/ORCHESTRATOR_INDEX.md) or proceed to the
[Task Delegation Document](ORCHESTRATOR_TASK_DELEGATION.md).

[Back to Top](#orchestrator-task-lifecycle)

* \*\*

End of document.

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

* **Purpose**: \[Brief description of what this document covers]
* **Audience**: \[Who should read this document]
* **Prerequisites**: \[What you should know before reading]
* **Related Documents**: \[Links to related documentation]

## Provider network send points, duplicate-causes, and recommended docs-only changes

### Quick pointer to code

* Task control loop: [`src/core/task/Task.ts`](../../src/core/task/Task.ts#L2648)
* Message queue:

[`src/core/message-queue/MessageQueueService.ts`](../../src/core/message-queue/MessageQueueService.ts#L36)

* Provider entrypoints: `createMessage()` implementations under
  [`src/api/providers/`](../../src/api/providers/index.ts#L1)

### Concrete send patterns (summary)

* OpenAI-compatible SDK calls: client.chat.completions.create(...) (many handlers:
  [`/\src/api/providers/openai.ts#L83`](../../src/api/providers/openai.ts#L83),
  [`/\src/api/providers/ollama.ts#L61`](../../src/api/providers/ollama.ts#L61), etc.)
* Responses API + SSE fallback: OpenAI Native handler uses SDK streaming and a fetch-based SSE
  fallback (see
  [`/\src/api/providers/openai-native.ts#L296`](../../src/api/providers/openai-native.ts#L296)).
* Vendor SDK streaming iterators: Anthropic, Gemini, Bedrock (e.g.,
  [`/\src/api/providers/anthropic.ts#L80`](../../src/api/providers/anthropic.ts#L80),
  [`/\src/api/providers/bedrock.ts#L420`](../../src/api/providers/bedrock.ts#L420)).
* Manual fetch() usages (SSE or JSON): OpenRouter image endpoint, OpenAI Native SSE fallback, Glama
  polling, etc.

### Likely causes of duplicate requests (doc summary)

1. Orchestrator-level retries + provider internal retries/fallbacks (e.g., OpenAI-native
   previous\_response retry + Task retry).
2. Token refresh flows that retry the same request (Gemini/Qwen patterns).
3. Race on conversation continuity (previous\_response\_id) causing a provider retry and
   orchestrator
   retry.
4. Wrapper/provider switching (VirtualQuotaFallback) without cancelling in-flight streams.
5. Duplicate or repeated fetchModel calls in provider code paths (observed pattern).
6. SSE vs SDK fallback paths that can trigger additional network sends on error-handling branches.

### Docs-only recommendations (no code changes)

* Add a "Provider expectations" doc section describing:
* Which errors providers should throw vs yield (e.g., THROTTLING -> throw so Task-level
  retry/backoff runs).
* Expected behavior for token refresh flows (single in-flight refresh promise; block concurrent
  sends while refresh occurs).
* Best-effort contract for previous\_response\_id usage and race mitigation strategy.
* How providers should expose cancellation (note the orchestration will supply an AbortSignal
  when supported).
* Where to include request-level metadata (recommended header names and fallbacks).
* Add a "Tracing & idempotency" doc covering:
* Recommended header names (X-KILOCODE-TASK-ID, X-KILOCODE-TIMESTAMP-ISO) and preferred
  placement in requests.
* Per-provider caveats where headers cannot be used (e.g., Bedrock SDK) and fallback options
  (embed minimal metadata into conversation or system block).
* Add a "Retry responsibility" doc that states:
* Providers may perform idempotent internal retries (token refresh, small SDK-specific fixes).
* Providers must rethrow throttling/rate-limit errors to allow Task.ts to perform exponential
  backoff.
* Add a "Testing checklist" doc for integration tests:
* Simulate concurrent sends to exercise previous\_response\_id handling.
* Simulate token refresh and assert only one successful send occurs.
* Simulate provider-switch while a stream is in-flight to validate cancellation behavior.
* Verify that handlers that poll (glama) do not cause extra requests on normal success.
* Create a short "Fast fixes" list for engineers to follow when implementing code changes later:
* Centralize header injection plan (docs link to recommended header names).
* Standardize error classification mapping for throttling vs non-retriable errors.
* Remove duplicate fetchModel calls where observed.

### Suggested doc locations & links (insert these pages)

* docs/PROVIDER\_GUIDELINES.md — provider expectations, header names, cancellation contract. (link
  from here)
* docs/RETRY\_POLICY.md — retry responsibility, orchestrator vs provider, backoff guidelines.
* docs/TESTING\_STRATEGY.md — integration tests to add.
* Update: [`ORCHESTRATOR_LIFECYCLE.md`](ORCHESTRATOR_LIFECYCLE.md) to reference the new pages.

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

* *Understanding Orchestrator Lifecycle:*\*

* **Next**: [Orchestrator Architecture](ORCHESTRATOR_ARCHITECTURE.md) →
  [Orchestrator Tools Reference](ORCHESTRATOR_TOOLS_REFERENCE.md) →
  [Orchestrator Best Practices](ORCHESTRATOR_BEST_PRACTICES.md)

* **Related**: [Technical Glossary](../../../GLOSSARY.md) for terminology,
  [State Machines](../architecture/README.md) for behavior modeling

* *Investigating Race Conditions:*\*

* **Next**: [Race Condition Analysis](../architecture/README.md) →
  [Root Cause Analysis](../../../../../../../../../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md) →
  [Code Flow Analysis](../architecture/race-condition/CODE_FLOW_ANALYSIS.md)

* **Related**: [Orchestrator Error Handling](ORCHESTRATOR_ERROR_HANDLING.md) for common issues

* *Implementing Orchestrator Features:*\*

* **Next**: [Orchestrator Best Practices](ORCHESTRATOR_BEST_PRACTICES.md) →
  [Orchestrator Task Delegation](ORCHESTRATOR_TASK_DELEGATION.md) →
  [Solution Recommendations](../architecture/race-condition/SOLUTION_RECOMMENDATIONS.md)

* **Related**: [Repository Development Guide](../../../../GETTING_STARTED.md) for
  codebase patterns

* *Understanding Current Problems:*\*

* **Next**: [Race Condition Analysis](../architecture/README.md) →
  [Code Flow Analysis](../architecture/race-condition/CODE_FLOW_ANALYSIS.md) →
  [Solution Recommendations](../architecture/race-condition/SOLUTION_RECOMMENDATIONS.md)

* **Related**: [State Machines](../architecture/README.md) for behavior analysis

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Orchestrator Documentation](../README.md) for guidance.

### Next doc-step I will take (if you approve)

I will add these markdown files under `docs/` with concise, copy-pasteable guidelines and the
testing checklist. Tell me to proceed and I will create:

* `docs/PROVIDER_GUIDELINES.md`
* `docs/RETRY_POLICY.md`
* `docs/TESTING_STRATEGY.md`
* \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

* **If you're new here**: Start with the [When You're Here](#when-youre-here) section

* **If you need context**: Check the [Research Context](#research-context) section

* **If you're ready to implement**: Jump to the implementation sections

* **If you're stuck**: Visit our [Troubleshooting Guide](../../../tools/TROUBLESHOOTING_GUIDE.md)

* **If you need help**: Check the [Technical Glossary](../../../GLOSSARY.md)

* *Navigation*\*: [docs/](../) · [orchestrator/](./) ·
  [↑ Table of Contents](#orchestrator-task-lifecycle)

## Navigation

* 📚 [Technical Glossary](../../../GLOSSARY.md)
