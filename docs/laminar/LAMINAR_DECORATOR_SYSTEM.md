# Laminar Decorator System

## Table of Contents

* [When You're Here](#when-youre-here)
* [Overview](#overview)
* [Decorator Architecture](#decorator-architecture)
* [Automatic Instrumentation](#automatic-instrumentation)
* [Input/Output Capture](#inputoutput-capture)
* [Performance Monitoring](#performance-monitoring)
* [Integration Patterns](#integration-patterns)
* [Error Handling](#error-handling)
* [Configuration Options](#configuration-options)
* [Code Reference Matrix](#code-reference-matrix)
* [Research Context & Next Steps](#research-context--next-steps)
* [Navigation](#navigation)

## When You're Here

This document provides comprehensive documentation of the Laminar decorator system, including automatic instrumentation, performance monitoring, and integration patterns.

* **Purpose**: Laminar decorator system architecture and implementation
* **Audience**: Developers implementing decorator-based observability
* **Prerequisites**: Understanding of TypeScript decorators and instrumentation
* **Related Documents**: [Laminar Documentation](README.md), [Technical Glossary](../GLOSSARY.md)

## Overview

The Laminar Decorator System provides automatic instrumentation for TypeScript/JavaScript code using decorators, enabling comprehensive observability without manual instrumentation.

### Role in Laminar Integration

The decorator system serves as the primary instrumentation mechanism:

- **Automatic Instrumentation**: Decorators automatically add observability to methods and classes
- **Performance Monitoring**: Built-in performance tracking and resource monitoring
- **Input/Output Capture**: Automatic capture of method inputs and outputs
- **Error Tracking**: Comprehensive error handling and propagation

### Integration Scope

The decorator system integrates with:

- **Method Instrumentation**: Individual method tracing
- **Class Instrumentation**: Class-level observability
- **Framework Integration**: Integration with popular frameworks
- **Custom Decorators**: Support for custom decorator implementations

## Decorator Architecture

### Core Decorator Implementation

The system provides several core decorators:

```typescript
// Method-level tracing
@LaminarTrace('operation-name')
async function myFunction(param1: string, param2: number) {
  // Function implementation
}

// Class-level tracing
@LaminarClass('service-name')
class MyService {
  @LaminarMethod('method-name')
  async processData(data: any) {
    // Method implementation
  }
}

// Performance monitoring
@LaminarPerformance({ threshold: 1000 })
async function slowOperation() {
  // Operation implementation
}
```

### Decorator Options

Decorators support various configuration options:

```typescript
interface LaminarTraceOptions {
  name?: string;           // Custom span name
  tags?: Record<string, any>; // Additional tags
  recordIO?: boolean;      // Record inputs/outputs
  recordErrors?: boolean;  // Record errors
  timeout?: number;        // Operation timeout
}

interface LaminarPerformanceOptions {
  threshold?: number;      // Performance threshold in ms
  recordMetrics?: boolean; // Record performance metrics
  alertOnSlow?: boolean;  // Alert on slow operations
}
```

## Automatic Instrumentation

### Method Decoration Process

The decoration process follows these steps:

1. **Method Analysis**: Analyze method signature and metadata
2. **Span Creation**: Create Laminar span for the method
3. **Input Capture**: Capture method inputs (if enabled)
4. **Execution Wrapping**: Wrap method execution with observability
5. **Output Capture**: Capture method outputs (if enabled)
6. **Span Completion**: Complete span with results and metadata

### Class-Level Decoration

Class-level decoration provides:

- **Automatic Method Instrumentation**: All public methods are automatically instrumented
- **Class Metadata**: Class-level metadata and context
- **Lifecycle Tracking**: Constructor and destructor tracking
- **Dependency Injection**: Integration with dependency injection systems

## Input/Output Capture

### Input Capture

Method inputs are captured automatically:

```typescript
@LaminarTrace({ recordIO: true })
async function processUser(user: User, options: ProcessOptions) {
  // Inputs are automatically captured:
  // - user: { id: "123", name: "John", email: "john@example.com" }
  // - options: { validate: true, notify: false }
}
```

### Output Capture

Method outputs are captured and logged:

```typescript
@LaminarTrace({ recordIO: true })
async function calculateTotal(items: Item[]): Promise<number> {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  // Output is automatically captured: total = 150.00
  return total;
}
```

## Performance Monitoring

### Execution Time Tracking

Automatic execution time tracking:

```typescript
@LaminarPerformance({ threshold: 1000 })
async function databaseQuery(query: string) {
  // Execution time is automatically tracked
  // Alerts are sent if execution exceeds 1000ms
}
```

### Resource Usage Monitoring

Resource usage is monitored automatically:

- **Memory Usage**: Peak memory consumption during execution
- **CPU Usage**: CPU time spent on the operation
- **I/O Operations**: Database queries, file operations, network calls
- **External Dependencies**: Time spent on external service calls

## Integration Patterns

### Existing Decorator Compatibility

The system is designed to work with existing decorators:

```typescript
@Injectable()
@LaminarClass('user-service')
class UserService {
  @Get('/users/:id')
  @LaminarMethod('get-user')
  async getUser(@Param('id') id: string) {
    // Both NestJS and Laminar decorators work together
  }
}
```

### Framework Integration

Framework integration examples:

#### Express.js Integration

```typescript
@LaminarClass('express-controller')
class UserController {
  @LaminarMethod('create-user')
  async createUser(req: Request, res: Response) {
    // Express route handler with Laminar tracing
  }
}
```

#### NestJS Integration

```typescript
@Controller('users')
@LaminarClass('user-controller')
export class UserController {
  @Post()
  @LaminarMethod('create-user')
  async create(@Body() createUserDto: CreateUserDto) {
    // NestJS controller with Laminar tracing
  }
}
```

## Error Handling

### Exception Propagation

Errors are properly propagated and traced:

```typescript
@LaminarTrace({ recordErrors: true })
async function riskyOperation() {
  try {
    // Operation that might fail
    return await externalService.call();
  } catch (error) {
    // Error is automatically captured and traced
    throw error; // Re-throw to maintain normal error flow
  }
}
```

### Decorator Failure Handling

If decorators fail, the system gracefully degrades:

- **Fallback Mode**: Operations continue without tracing
- **Error Logging**: Decorator failures are logged
- **Health Checks**: System health is monitored
- **Recovery**: Automatic recovery from decorator failures

## Configuration Options

### Global Configuration

Global decorator configuration:

```typescript
const decoratorConfig = {
  // Global settings
  enabled: true,
  recordIO: false,
  recordErrors: true,
  
  // Performance settings
  performanceThreshold: 1000,
  alertOnSlow: true,
  
  // Sampling settings
  samplingRate: 1.0,
  maxSpansPerSecond: 1000
};
```

### Per-Decorator Configuration

Individual decorator configuration:

```typescript
@LaminarTrace({
  name: 'custom-operation',
  recordIO: true,
  tags: { component: 'payment', version: '1.0' },
  timeout: 5000
})
async function customOperation() {
  // Custom configuration for this specific operation
}
```

## Code Reference Matrix

| Component | File | Key Methods | Laminar Integration |
|-----------|------|-------------|-------------------|
| Decorator Factory | [Decorator Implementation](../../src/core/tools/ToolRepetitionDetector.ts) | `createTraceDecorator()`, `createClassDecorator()` | Decorator creation |
| Method Instrumenter | [Decorator Implementation](../../src/core/tools/ToolRepetitionDetector.ts) | `instrumentMethod()`, `wrapExecution()` | Method instrumentation |
| I/O Capturer | [Decorator Implementation](../../src/core/tools/ToolRepetitionDetector.ts) | `captureInput()`, `captureOutput()` | Input/output capture |
| Performance Monitor | [Decorator Implementation](../../src/core/tools/ToolRepetitionDetector.ts) | `trackExecution()`, `recordMetrics()` | Performance monitoring |
| Error Handler | [Decorator Implementation](../../src/core/tools/ToolRepetitionDetector.ts) | `handleError()`, `propagateError()` | Error handling |

## Research Context & Next Steps

### When You're Here, You Can:

* **Understanding Laminar Observability:**
  * **Next**: Check related Laminar documentation in the same directory
  * **Related**: [Technical Glossary](../GLOSSARY.md) for terminology, [Laminar Documentation](README.md) for context

* **Implementing Observability Features:**
  * **Next**: [Repository Development Guide](../README.md) → [Testing Infrastructure](../testing/TESTING_STRATEGY.md)
  * **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

* **Troubleshooting Observability Issues:**
  * **Next**: [Race Condition Analysis](../README.md) → [Root Cause Analysis](DUPLICATE_API_REQUESTS_TROUBLESHOOTING.md)
  * **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to [Laminar Documentation](README.md) for guidance.

## Navigation

* **Back**: [Laminar Subsystems Index](LAMINAR_SUBSYSTEMS_INDEX.md) · **Root**: [Laminar Documentation](README.md) · **Source**: `/docs/laminar/LAMINAR_DECORATOR_SYSTEM.md#L1`
* **Technical Glossary**: [GLOSSARY.md](../GLOSSARY.md) · **Table of Contents**: [#research-context--next-steps](#research-context--next-steps)
