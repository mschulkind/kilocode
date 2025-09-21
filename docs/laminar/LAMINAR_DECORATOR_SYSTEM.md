# Laminar Decorator System

**Purpose:** This document describes the observeDecorator implementation for automatic instrumentation, detailing method decoration, input/output capture, performance monitoring, and seamless integration with existing decorator patterns in Kilo Code.

<details><summary>Table of Contents</summary>

- [Overview](#overview)
- [Decorator Architecture](#decorator-architecture)
- [Automatic Instrumentation](#automatic-instrumentation)
- [Input/Output Capture](#inputoutput-capture)
- [Performance Monitoring](#performance-monitoring)
- [Integration Patterns](#integration-patterns)
- [Error Handling](#error-handling)
- [Configuration Options](#configuration-options)
- [Code Reference Matrix](#code-reference-matrix)
- [Implementation Timeline](#implementation-timeline)

</details>

## Overview

The Decorator System provides automatic instrumentation capabilities through the observeDecorator, enabling seamless tracing of method executions, input/output capture, and performance monitoring across Kilo Code subsystems.

### Role in Laminar Integration

The decorator system is responsible for:

- **Automatic Instrumentation:** Applying tracing without code modifications
- **Method Decoration:** Wrapping methods with observability logic
- **Input/Output Tracking:** Capturing method parameters and return values
- **Performance Metrics:** Measuring execution time and resource usage
- **Error Propagation:** Maintaining exception handling integrity

### Integration Scope

This subsystem enables non-invasive observability, allowing existing code to be instrumented with minimal changes while providing comprehensive monitoring and tracing capabilities.

## Decorator Architecture

### Core Decorator Implementation

**observeDecorator Function:**

```typescript
function observeDecorator(spanName?: string, options?: ObserveOptions): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value

		descriptor.value = async function (...args: any[]) {
			const span = await createObservationSpan(spanName || propertyKey.toString(), options)

			try {
				const result = await originalMethod.apply(this, args)
				span.setAttribute("result.type", typeof result)
				return result
			} catch (error) {
				span.recordException(error)
				throw error
			} finally {
				span.end()
			}
		}

		return descriptor
	}
}
```

**Decorator Components:**

- **Span Creation:** Automatic span initialization
- **Method Wrapping:** Preservation of original method behavior
- **Error Handling:** Exception recording and re-throwing
- **Resource Cleanup:** Proper span completion

### Decorator Options

**Configuration Interface:**

```typescript
interface ObserveOptions {
	captureInput?: boolean
	captureOutput?: boolean
	includeStackTrace?: boolean
	customAttributes?: Record<string, any>
	parentSpan?: Span
}
```

**Option Descriptions:**

- `captureInput`: Whether to record method parameters
- `captureOutput`: Whether to record return values
- `includeStackTrace`: Include stack traces in error recording
- `customAttributes`: Additional span attributes
- `parentSpan`: Explicit parent span for nesting

## Automatic Instrumentation

### Method Decoration Process

**Decoration Flow:**

1. **Target Identification:** Identify methods to instrument
2. **Decorator Application:** Apply observeDecorator to target methods
3. **Wrapper Installation:** Replace original method with instrumented version
4. **Span Management:** Handle span lifecycle during execution

**Application Examples:**

```typescript
class CheckpointService {
	@observeDecorator("checkpoint.save")
	async save(data: any): Promise<void> {
		// Implementation
	}

	@observeDecorator("checkpoint.restore", { captureInput: true })
	async restore(id: string): Promise<any> {
		// Implementation
	}
}
```

### Class-Level Decoration

**Class Decoration Pattern:**

```typescript
function observeClass(options?: ObserveOptions): ClassDecorator {
	return function (target: any) {
		const prototype = target.prototype
		const methodNames = Object.getOwnPropertyNames(prototype)

		methodNames.forEach((methodName) => {
			const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName)
			if (descriptor && typeof descriptor.value === "function") {
				observeDecorator(`${target.name}.${methodName}`, options)(target, methodName, descriptor)
			}
		})
	}
}
```

## Input/Output Capture

### Input Capture

**Parameter Recording:**

```typescript
private captureInput(args: any[], options: ObserveOptions): void {
  if (!options.captureInput) return;

  args.forEach((arg, index) => {
    span.setAttribute(`input.${index}.type`, typeof arg);
    span.setAttribute(`input.${index}.value`, this.serializeValue(arg));
  });
}
```

**Serialization Strategy:**

- **Primitive Types:** Direct value recording
- **Objects:** JSON serialization with size limits
- **Sensitive Data:** Masking or exclusion
- **Large Objects:** Truncation or sampling

### Output Capture

**Return Value Recording:**

```typescript
private captureOutput(result: any, options: ObserveOptions): void {
  if (!options.captureOutput) return;

  span.setAttribute('output.type', typeof result);
  span.setAttribute('output.value', this.serializeValue(result));
}
```

**Output Handling:**

- **Success Results:** Record return values
- **Error Results:** Record exception details
- **Async Results:** Handle promises and async functions
- **Void Returns:** Mark as void type

## Performance Monitoring

### Execution Time Tracking

**Duration Measurement:**

```typescript
const startTime = performance.now()
// Execute method
const endTime = performance.now()
const duration = endTime - startTime

span.setAttribute("duration.ms", duration)
span.setAttribute("performance.category", duration > 1000 ? "slow" : duration > 100 ? "medium" : "fast")
```

**Performance Categories:**

- **Fast:** < 100ms (optimal)
- **Medium:** 100-1000ms (acceptable)
- **Slow:** > 1000ms (needs optimization)

### Resource Usage Monitoring

**Memory Tracking:**

```typescript
const beforeMemory = process.memoryUsage()
// Execute method
const afterMemory = process.memoryUsage()

span.setAttribute("memory.delta.heap", afterMemory.heapUsed - beforeMemory.heapUsed)
span.setAttribute("memory.delta.external", afterMemory.external - beforeMemory.external)
```

**Resource Metrics:**

- **Heap Usage:** JavaScript heap memory changes
- **External Memory:** Native addon memory usage
- **CPU Time:** Process CPU time consumption

## Integration Patterns

### Existing Decorator Compatibility

**Decorator Composition:**

```typescript
class ExampleService {
	@someExistingDecorator()
	@observeDecorator("example.method")
	async method(): Promise<void> {
		// Both decorators applied
	}
}
```

**Execution Order:**

- Decorators execute from bottom to top
- observeDecorator wraps the final method
- Existing decorators remain functional

### Framework Integration

**VS Code Extension Patterns:**

- **Command Handlers:** Instrument command execution
- **Event Listeners:** Track event processing
- **Service Methods:** Monitor service operations

**Integration Examples:**

```typescript
// Command instrumentation
@observeDecorator('command.execute', { captureInput: true })
async executeCommand(command: string, ...args: any[]): Promise<any> {
  // Command execution logic
}

// Event handling
@observeDecorator('event.process')
async handleEvent(event: vscode.Event): Promise<void> {
  // Event processing logic
}
```

## Error Handling

### Exception Propagation

**Error Recording:**

```typescript
try {
	const result = await originalMethod.apply(this, args)
	return result
} catch (error) {
	span.recordException(error)
	span.setAttribute("error.type", error.constructor.name)
	span.setAttribute("error.message", error.message)

	if (options.includeStackTrace) {
		span.setAttribute("error.stack", error.stack)
	}

	throw error // Re-throw to maintain behavior
}
```

**Error Context:**

- **Exception Type:** Constructor name for categorization
- **Error Message:** Human-readable error description
- **Stack Trace:** Full call stack for debugging
- **Context Data:** Relevant operation context

### Decorator Failure Handling

**Decorator Robustness:**

- **Graceful Degradation:** Continue execution if decoration fails
- **Error Isolation:** Decorator errors don't affect method execution
- **Logging:** Record decoration failures for debugging

## Configuration Options

### Global Configuration

**Default Settings:**

```typescript
const defaultOptions: ObserveOptions = {
	captureInput: false,
	captureOutput: false,
	includeStackTrace: true,
	customAttributes: {},
}
```

**Configuration Override:**

```typescript
// Global configuration
observeDecorator.config({
  captureInput: true,
  maxValueSize: 1024
});

// Method-specific override
@observeDecorator('method.name', { captureOutput: true })
```

### Environment-Specific Settings

**Development vs Production:**

- **Development:** Full capture, detailed logging
- **Production:** Minimal capture, performance optimized
- **Testing:** Mock spans, deterministic behavior

## Code Reference Matrix

| Component      | Primary Functions              | Key Files                                  | Integration Points     |
| -------------- | ------------------------------ | ------------------------------------------ | ---------------------- |
| Decorator      | `observeDecorator()`           | `src/services/laminar/observeDecorator.ts` | Method instrumentation |
| Input Capture  | `captureInput()`               | `src/services/laminar/observeDecorator.ts` | Parameter recording    |
| Output Capture | `captureOutput()`              | `src/services/laminar/observeDecorator.ts` | Return value tracking  |
| Performance    | Duration and resource tracking | `src/services/laminar/observeDecorator.ts` | Performance monitoring |

## Implementation Timeline

**Estimated Time:** 45 minutes

| Step | Description                        | Time   | Status  |
| ---- | ---------------------------------- | ------ | ------- |
| 1    | Implement basic decorator function | 10 min | Pending |
| 2    | Add input/output capture           | 15 min | Pending |
| 3    | Implement performance monitoring   | 10 min | Pending |
| 4    | Add error handling and propagation | 5 min  | Pending |
| 5    | Integration testing                | 5 min  | Pending |

<a id="navigation-footer"></a>

- Back: [`LAMINAR_SUBSYSTEMS_INDEX.md`](LAMINAR_SUBSYSTEMS_INDEX.md:1) · Root: [`INDEX.md`](INDEX.md:1) · Source: `/docs/LAMINAR_DECORATOR_SYSTEM.md#L1`
