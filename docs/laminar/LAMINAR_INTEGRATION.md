# Laminar Integration

## Table of Contents
- [Laminar Integration](#laminar-integration)
- [Table of Contents](#table-of-contents)
- [When You're Here](#when-youre-here)
- [What is Laminar?](#what-is-laminar)
- [Purpose in Kilo Code](#purpose-in-kilo-code)
- [Integration with Telemetry Systems](#integration-with-telemetry-systems)
- [Key Components](#key-components)
- [LaminarService](#laminarservice)
- [Spans](#spans)
- [Decorators](#decorators)
- [Configuration](#configuration)
- [Effects on Codebase](#effects-on-codebase)
- [Task Execution](#task-execution)
- [Tool Handling](#tool-handling)
- [Authentication](#authentication)
- [Checkpoints](#checkpoints)
- [Configuration](#configuration)
- [Code Examples](#code-examples)
- [Span Creation in Task Execution](#span-creation-in-task-execution)
- [Tool Execution Tracing](#tool-execution-tracing)
- [Decorator Usage](#decorator-usage)
- [Exception Recording](#exception-recording)
- [Differences from Cline](#differences-from-cline)
- [🔍 Research Context & Next Steps](#-research-context--next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Laminar Integration](#laminar-integration)
- [Table of Contents](#table-of-contents)
- [What is Laminar?](#what-is-laminar)
- [Purpose in Kilo Code](#purpose-in-kilo-code)
- [Integration with Telemetry Systems](#integration-with-telemetry-systems)
- [Key Components](#key-components)
- [LaminarService](#laminarservice)
- [Spans](#spans)
- [Decorators](#decorators)
- [Configuration](#configuration)
- [Effects on Codebase](#effects-on-codebase)
- [Task Execution](#task-execution)
- [Tool Handling](#tool-handling)
- [Authentication](#authentication)
- [Checkpoints](#checkpoints)
- [Configuration](#configuration)
- [Code Examples](#code-examples)
- [Span Creation in Task Execution](#span-creation-in-task-execution)
- [Tool Execution Tracing](#tool-execution-tracing)
- [Decorator Usage](#decorator-usage)
- [Exception Recording](#exception-recording)
- [Differences from Cline](#differences-from-cline)
- [🔍 Research Context & Next Steps](#-research-context--next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
> documentation helps us understand how! ⚙️

Comprehensive observability and tracing system for Kilo Code, enabling detailed monitoring of task
execution, tool usage, and LLM interactions.

<details><summary>Table of Contents</summary>
- [What is Laminar?](#what-is-laminar)
- [Purpose in Kilo Code](#purpose-in-kilo-code)
- [Integration with Telemetry Systems](#integration-with-telemetry-systems)
- Key Components
- [Effects on Codebase](#effects-on-codebase)
- [Configuration](#configuration)
- [Code Examples](#code-examples)
- [Differences from Cline](#differences-from-cline)

</details>

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: \[Brief description of what this document covers]
- **Audience**: \[Who should read this document]
- **Prerequisites**: \[What you should know before reading]
- **Related Documents**: \[Links to related documentation]

## What is Laminar?

Laminar is an open-source observability platform specifically designed for Large Language Model
(LLM) applications. It provides comprehensive tracing capabilities to monitor and analyze the
execution flow of AI-powered systems, including function calls, LLM API interactions, and custom
spans.

The Laminar TypeScript SDK (`@lmnr-ai/lmnr`) offers:

- **Automatic tracing** of LLM calls with token counts, costs, and model information
- **Manual span creation** for custom operations
- **Decorator-based instrumentation** for functions
- **Exception recording** and error tracking
- **User attribution** and session tracking

## Purpose in Kilo Code

As a fork of Cline (which itself is an AI coding assistant), Kilo Code integrates Laminar to enhance
observability beyond the basic telemetry provided by PostHog. Laminar enables:

- **Detailed task lifecycle tracing**: Track the complete execution flow from user input to task
  completion
- **Tool execution monitoring**: Monitor which tools are invoked, their performance, and success
  rates
- **LLM interaction analysis**: Capture token usage, costs, and response quality metrics
- **Error diagnosis**: Record exceptions and failures with full context
- **Performance optimization**: Identify bottlenecks in task execution and tool handling

This integration provides developers and maintainers with deep insights into how Kilo Code processes
requests, enabling data-driven improvements to the AI assistant's capabilities.

## Integration with Telemetry Systems

Laminar integrates seamlessly with Kilo Code's existing PostHog-based telemetry system:

- **Unified opt-in/opt-out**: Laminar respects the same telemetry settings as PostHog
- **User identification**: Shares authenticated user IDs for consistent attribution
- **Complementary data**: PostHog handles high-level usage analytics while Laminar provides detailed
  execution traces

The integration is controlled by the `updateTelemetryState` method in the controller, ensuring users
have consistent control over their data sharing preferences.

## Key Components

### LaminarService

The central service managing all Laminar operations in Kilo Code. It provides:

- **Singleton pattern** for consistent state management
- **Initialization** with project API keys
- **Span lifecycle management** (start, end, attribute setting)
- **Exception recording** for error tracking
- **User ID association** for attribution

### Spans

Spans represent units of work in the tracing system:

- **Task spans**: Track overall task execution (`task.step`)
- **Tool spans**: Monitor individual tool invocations (`tool`)
- **LLM spans**: Capture language model interactions (`llm`)
- **Active spans**: Automatically nest child spans for hierarchical tracing

### Decorators

The `observeDecorator` enables automatic instrumentation of functions:

- **Method decoration**: Applied to class methods like `CheckpointTracker.commit`
- **Automatic span creation**: Wraps function execution with tracing
- **Input/output capture**: Records function parameters and return values (when enabled)

### Configuration

Environment-specific configuration in `laminar-config.ts`:

- **API keys**: Separate keys for development and production projects
- **IO recording**: Controls whether span inputs/outputs are captured
- **Feature flags**: Enable/disable tracing based on environment

## Effects on Codebase

### Task Execution

Laminar traces the complete task lifecycle:

- **Step initialization**: New spans created for each conversation turn
- **LLM calls**: Detailed tracking of model interactions with token counts and costs
- **Exception handling**: Records errors in task processing
- **Completion signaling**: Properly ends spans when tasks finish

### Tool Handling

Tool execution is wrapped with tracing:

- **Span creation**: Each tool invocation gets its own span
- **Input capture**: Tool parameters are recorded
- **Execution timing**: Performance metrics are tracked
- **Result attribution**: Success/failure status is logged

### Authentication

User context is integrated into traces:

- **User ID setting**: Authenticated users are associated with their traces
- **Session tracking**: Links traces to specific user sessions
- **Privacy compliance**: Respects telemetry opt-out preferences

### Checkpoints

Checkpoint operations are instrumented:

- **Decorator application**: `CheckpointTracker.commit` uses `observeDecorator`
- **Operation tracing**: Git operations are monitored for performance
- **Error capture**: Checkpoint failures are recorded with context

## Configuration

Laminar requires API key configuration for data transmission:

```typescript
// Development environment (laminar-config.ts)
const laminarDevConfig = {
	apiKey: "", // Set your Laminar development project API key
	recordIO: true,
	enabled: true,
}

// Production environment
const laminarProdConfig = {
	apiKey: "", // Set your Laminar production project API key
	recordIO: true,
	enabled: true,
}
```

- *Setup steps:*\*
1. Create projects in Laminar dashboard for dev and prod
2. Obtain API keys from project settings
3. Update `laminar-config.ts` with the keys
4. Ensure keys are not committed to version control

## Code Examples

### Span Creation in Task Execution

```typescript
// Starting a task step span
laminarService.startSpan(
	"task.step",
	{
		name: `task.step`,
		sessionId: this.taskId,
		input: userContent,
	},
	true,
) // Active span for nesting

// LLM call tracing
laminarService.startSpan("llm", {
	name: "llm_call",
	spanType: "LLM",
	input: [{ role: "system", content: systemPrompt }, ...conversationHistory],
})

// Adding LLM metrics
laminarService.addLlmAttributesToSpan("llm", {
	inputTokens,
	outputTokens,
	totalCost: totalCost ?? 0,
	modelId: model.id,
	providerId,
	cacheWriteTokens,
	cacheReadTokens,
})
```

### Tool Execution Tracing

```typescript
// Tool span creation
laminarService.startSpan("tool", {
	name: block.name,
	spanType: "TOOL",
	input: block,
})

// Tool completion
laminarService.endSpan("tool")
```

### Decorator Usage

```typescript
@observeDecorator({ name: "CheckpointTracker.commit" })
public async commit(): Promise<string | undefined> {
  // Function execution is automatically traced
  console.info(`Creating new checkpoint commit for task ${this.taskId}`)
  // ... implementation
}
```

### Exception Recording

```typescript
try {
	// LLM API call
	const stream = this.api.createMessage(systemPrompt, conversationHistory)
} catch (error) {
	laminarService.recordExceptionOnSpan("llm", error)
	// Handle error
}
```

## Differences from Cline

Kilo Code's Laminar integration is a new addition not present in the original Cline codebase. Key
differences:

- **Enhanced observability**: Cline relied primarily on PostHog for telemetry; Kilo Code adds
  detailed execution tracing
- **LLM metrics**: Comprehensive tracking of token usage, costs, and model performance
- **Tool monitoring**: Granular visibility into tool execution patterns
- **Error context**: Rich exception data with full execution context
- **User attribution**: Consistent user identification across all trace data

This integration positions Kilo Code for better debugging, performance optimization, and user
experience improvements compared to the base Cline implementation.

<a id="navigation-footer"></a>
- Back: [`README.md`](README.md:1) · Root: [`README.md`](README.md:1) · Source:
  `/docs/LAMINAR_INTEGRATION.md#L1`

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

- *Understanding Laminar Observability:*\*

- **Next**: Check related Laminar documentation in the same directory

- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Laminar Documentation](README.md) for context

- *Implementing Observability Features:*\*

- **Next**: [Repository Development Guide](../architecture/GETTING_STARTED.md) →
  [Testing Infrastructure](../../../testing/TESTING_STRATEGY.md)

- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

- *Troubleshooting Observability Issues:*\*

- **Next**: [Race Condition Analysis](../architecture/README.md) →
  [Root Cause Analysis](../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md)

- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Laminar Documentation](README.md) for guidance.

## Navigation Footer
- \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

- **If you're new here**: Start with the [When You're Here](#when-youre-here) section

- **If you need context**: Check the [Research Context](#research-context) section

- **If you're ready to implement**: Jump to the implementation sections

- **If you're stuck**: Visit our [Troubleshooting Guide](../../../tools/TROUBLESHOOTING_GUIDE.md)

- **If you need help**: Check the [Technical Glossary](../GLOSSARY.md)

- *Navigation*\*: [← Back to Laminar Documentation](README.md) ·
  [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
