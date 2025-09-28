# Kilo Code Logging Documentation

## Table of Contents
- [Kilo Code Logging Documentation](#kilo-code-logging-documentation)
- [Table of Contents](#table-of-contents)
- [When You're Here](#when-youre-here)
- [Writing to Logs from Code](#writing-to-logs-from-code)
- [1. Console Logging](#1-console-logging)
- [2. Custom Logger (CompactLogger)](#2-custom-logger-compactlogger)
- [3. VSCode Output Channel Logger](#3-vscode-output-channel-logger)
- [4. Forwarding Logger (JetBrains)](#4-forwarding-logger-jetbrains)
- [5. API Event Logging](#5-api-event-logging)
- [Log Message Routing](#log-message-routing)
- [VSCode Environment Routing](#vscode-environment-routing)
- [JetBrains Environment Routing](#jetbrains-environment-routing)
- [Routing Logic](#routing-logic)
- [Viewing Logs](#viewing-logs)
- [VSCode Environment](#vscode-environment)
- [JetBrains Environment](#jetbrains-environment)
- [Log Analysis Tools](#log-analysis-tools)
- [Configuration and Filtering](#configuration-and-filtering)
- [Environment Variables](#environment-variables)
- [Log Level Configuration](#log-level-configuration)
- [Platform-Specific Configuration](#platformspecific-configuration)
- [File Output Configuration](#file-output-configuration)
- [Conditional Logging](#conditional-logging)
- [Advanced Configuration](#advanced-configuration)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)
- [1. Choose the Right Logging Method](#1-choose-the-right-logging-method)
- [2. Log Levels and Filtering](#2-log-levels-and-filtering)
- [3. Structured Logging](#3-structured-logging)
- [4. Error Handling](#4-error-handling)
- [5. Performance](#5-performance)
- [Troubleshooting](#troubleshooting)
- [Common Issues](#common-issues)
- [Debug Commands](#debug-commands)
- [🔍 Research Context & Next Steps](#-research-context-next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Kilo Code Logging Documentation](#kilo-code-logging-documentation)
- [Table of Contents](#table-of-contents)
- [Writing to Logs from Code](#writing-to-logs-from-code)
- [1. Console Logging](#1-console-logging)
- [2. Custom Logger (CompactLogger)](#2-custom-logger-compactlogger)
- [3. VSCode Output Channel Logger](#3-vscode-output-channel-logger)
- [4. Forwarding Logger (JetBrains)](#4-forwarding-logger-jetbrains)
- [5. API Event Logging](#5-api-event-logging)
- [Log Message Routing](#log-message-routing)
- [VSCode Environment Routing](#vscode-environment-routing)
- [JetBrains Environment Routing](#jetbrains-environment-routing)
- [Routing Logic](#routing-logic)
- [Viewing Logs](#viewing-logs)
- [VSCode Environment](#vscode-environment)
- [JetBrains Environment](#jetbrains-environment)
- [Log Analysis Tools](#log-analysis-tools)
- [Configuration and Filtering](#configuration-and-filtering)
- [Environment Variables](#environment-variables)
- [Log Level Configuration](#log-level-configuration)
- [Platform-Specific Configuration](#platformspecific-configuration)
- [File Output Configuration](#file-output-configuration)
- [Conditional Logging](#conditional-logging)
- [Advanced Configuration](#advanced-configuration)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)
- [1. Choose the Right Logging Method](#1-choose-the-right-logging-method)
- [2. Log Levels and Filtering](#2-log-levels-and-filtering)
- [3. Structured Logging](#3-structured-logging)
- [4. Error Handling](#4-error-handling)
- [5. Performance](#5-performance)
- [Troubleshooting](#troubleshooting)
- [Common Issues](#common-issues)
- [Debug Commands](#debug-commands)
- [🔍 Research Context & Next Steps](#-research-context-next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
> this documentation provides structured guidance for understanding and implementing solutions! 🔧

This document provides comprehensive information about Kilo Code's logging system, including how to
write logs, where messages are routed, viewing options, and configuration settings.

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: \[Brief description of what this document covers]
- **Audience**: \[Who should read this document]
- **Prerequisites**: \[What you should know before reading]
- **Related Documents**: \[Links to related documentation]

## Writing to Logs from Code

Kilo Code supports multiple logging methods and channels, each suited for different use cases and
environments.

### 1. Console Logging

The most basic logging method available throughout the codebase:

```typescript
// Simple message logging
console.log("Task started:", taskId)

// Error logging with context
console.error("API call failed:", error)

// Warning messages
console.warn("Deprecated method used:", methodName)

// Debug information
console.debug("Processing item:", item.id)

// Informational messages
console.info("Configuration loaded successfully")
```

- *Usage Notes:*\*
- Available in all JavaScript/TypeScript files
- Automatically routed based on platform (VSCode vs JetBrains)
- No additional imports required
- Best for development and debugging

### 2. Custom Logger (CompactLogger)

A structured logging system with hierarchical metadata support:

```typescript
import { logger } from "../utils/logging"

// Basic logging with different levels
logger.info("User authentication successful", { userId: "12345" })
logger.error("Database connection failed", { error: err.message })
logger.debug("Cache hit ratio", { ratio: 0.85 })
logger.warn("Rate limit approaching", { remaining: 5 })
logger.fatal("Critical system error", { component: "auth-service" })

// Child loggers with inherited context
const userLogger = logger.child({ userId: "12345", sessionId: "abc" })
userLogger.info("User action performed", { action: "login" })

// Trace-level logging for detailed debugging
logger.trace("Function entry", { function: "processData", params: { size: 100 } })
```

- *Features:*\*
- Structured JSON output with timestamps
- Hierarchical metadata inheritance
- Configurable log levels
- File output capability
- Performance optimized for production

### 3. VSCode Output Channel Logger

Platform-specific logging for VSCode environment:

```typescript
import { createOutputChannelLogger, createDualLogger } from "../utils/outputChannelLogger"

// Create logger for VSCode output channel
const outputLogger = createOutputChannelLogger(outputChannel)

// Log various data types
outputLogger("Simple message")
outputLogger({ user: "john", action: "login" })
outputLogger(new Error("Something went wrong"))

// Dual logger (output channel + console)
const dualLogger = createDualLogger(outputLogger)
dualLogger("This appears in both output channel and console")
```

- *Usage Context:*\*
- Automatically initialized in VSCode environment
- Handles complex object serialization
- Integrated with VSCode's output panel

### 4. Forwarding Logger (JetBrains)

Automatic console forwarding for JetBrains IDE:

```typescript
// No explicit usage needed - automatically forwards console methods
console.log("This message is forwarded to JetBrains console")
console.error("Error forwarded to JetBrains")

// All console methods are supported:
console.info("Info message")
console.warn("Warning message")
console.debug("Debug message")
```

- *Platform Detection:*\*
- Automatically detects JetBrains environment
- Monkey-patches global console methods
- Falls back gracefully if RPC unavailable

### 5. API Event Logging

Task-specific logging with file output:

```typescript
import { logApiEvent } from "../extension/api"

// Log task lifecycle events
logApiEvent("task_started", { taskId: "123", type: "code_generation" })
logApiEvent("task_completed", { taskId: "123", duration: 1500 })
logApiEvent("task_failed", { taskId: "123", error: "timeout" })
```

- *Features:*\*
- Automatic file output to temp directory
- Structured event data
- Enabled when IPC socket path is configured

## Log Message Routing

Log messages are routed to different destinations based on platform, configuration, and message
type.

### VSCode Environment Routing

- *Primary Destinations:*\*
1. **VSCode Output Channel** ("Kilo-Code")
- Main logging destination in VSCode
- Accessible via View → Output → "Kilo-Code"
- Handles all data types with JSON serialization
2. **Console Output**
- Secondary output for development
- Available in Developer Tools (F12) → Console
- Terminal output in development mode
3. **File Output** (`./logs/app.log`)
- Optional structured JSON logging
- Delta timestamp optimization for space efficiency
- Configurable path and enable/disable
4. **IPC Log File** (`kilo-code-messages.log`)
- Task-specific events in temp directory
- Enabled when `KILO_IPC_SOCKET_PATH` is set
- Dual output: console + file

### JetBrains Environment Routing

- *Primary Destinations:*\*
1. **JetBrains IDE Console**
- Console messages forwarded via MainThread RPC
- Seamless integration with JetBrains logging
- All console methods supported (log, info, warn, error, debug)
2. **Fallback Console Output**
- Standard console when RPC unavailable
- Graceful degradation
3. **File Output**
- Same CompactLogger file output as VSCode
- Platform-independent configuration

### Routing Logic

- *Platform Detection:*\*

```typescript
// Automatic platform detection in extension.ts
if (!kiloCodeWrapped) {
	// VSCode mode: Output channel + console
	registerOutputChannelLogger(context)
} else {
	// JetBrains mode: Console forwarding
	registerMainThreadForwardingLogger(context)
}
```

- *Environment-Based Routing:*\*

- **Development**: Additional console logging

- **Test**: No-op logger for performance

- **Production**: Structured file logging + output channels

## Viewing Logs

Multiple methods to view and monitor log messages during software usage.

### VSCode Environment

- *1. Output Panel*\*

- **Access**: View → Output → Select "Kilo-Code" channel

- **Content**: Real-time streaming of all routed messages

- **Features**:
- Search and filter capabilities
- Clear output option
- Multiple output channels support

- *2. Developer Console*\*

- **Access**: Help → Toggle Developer Tools → Console tab

- **Content**: Console.log messages and errors

- **Features**:
- Interactive debugging
- Stack trace inspection
- Real-time message streaming

- *3. Terminal Output*\*

- **Access**: Integrated terminal in VSCode

- **Content**: Console messages during development

- **Features**:
- Standard terminal logging
- Command output mixed with logs

- *4. File-Based Viewing*\*

- **Application Logs**: `./logs/app.log`
- JSON format with timestamps
- Delta timestamp optimization
- Session markers for log rotation

- **Task Logs**: System temp directory
- `kilo-code-messages.log`
- Task-specific event logging
- Automatic cleanup

### JetBrains Environment

- *1. IDE Console*\*

- **Access**: Built-in IDE console/terminal

- **Content**: Forwarded console messages

- **Features**:
- Native IDE integration
- Standard console interface
- All console methods displayed

- *2. File Logs*\*
- Same file-based logging as VSCode
- Accessible via file system
- JSON format for structured analysis

### Log Analysis Tools

- *Built-in Features:*\*

- **Search**: Filter logs by keywords, levels, or components

- **Export**: Save log output to files

- **Clear**: Reset log output for new sessions

- *External Tools:*\*
- JSON log parsers for structured analysis
- Log aggregation tools for production monitoring
- Text editors for file-based log inspection

## Configuration and Filtering

Comprehensive configuration options for controlling logging behavior.

### Environment Variables

- *Laminar Service Configuration:*\*

```bash
# API Configuration

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

LMNR_API_KEY=your_api_key
LMNR_BASE_URL=https://api.lmnr.ai
LMNR_HTTP_PORT=443
LMNR_GRPC_PORT=8443

# Service Control

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

LMNR_RECORD_IO=true          # Record span I/O (default: true)
LMNR_ENABLED=true           # Enable Laminar service (default: true)
```

- *Development and IPC Configuration:*\*

```bash
# Development mode

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

NODE_ENV=development         # Enables additional console logging

# IPC Communication

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

KILO_IPC_SOCKET_PATH=/tmp/kilo.sock    # Enables IPC logging
ROO_CODE_IPC_SOCKET_PATH=/tmp/roo.sock # Alternative IPC path
```

### Log Level Configuration

- *CompactLogger Levels:*\*

```typescript
// Available levels (ordered by verbosity)
const levels = {
	trace: 0, // Most verbose - detailed debugging
	debug: 1, // Debug information
	info: 2, // General information
	warn: 3, // Warnings
	error: 4, // Errors
	fatal: 5, // Critical errors
}

// Configure minimum level
const config = {
	level: "info", // Only show info, warn, error, fatal
	fileOutput: {
		enabled: true,
		path: "./logs/app.log",
	},
}
```

- *Level Filtering:*\*
- Messages below minimum level are filtered out
- File output includes all levels regardless of filter
- Console output respects level filtering

### Platform-Specific Configuration

- *VSCode Configuration:*\*
- Output channel name: "Kilo-Code"
- Automatic output channel creation
- No user-configurable VSCode settings for logging

- *JetBrains Configuration:*\*
- Automatic RPC detection
- Console method forwarding
- Graceful fallback to standard console

### File Output Configuration

- *Default Configuration:*\*

```typescript
const DEFAULT_CONFIG = {
	level: "debug",
	fileOutput: {
		enabled: true,
		path: "./logs/app.log",
	},
}
```

- *Customization Options:*\*

- **Path**: Configurable log file location

- **Enabled**: Toggle file logging on/off

- **Format**: JSON with delta timestamps

- **Rotation**: Session-based markers

### Conditional Logging

- *Environment-Based Conditions:*\*

```typescript
// Development-only logging
if (process.env.NODE_ENV === "development") {
	console.log("Debug information:", data)
}

// Test environment - no logging
if (process.env.NODE_ENV === "test") {
	// Use no-op logger
	logger = createNoOpLogger()
}

// IPC-enabled logging
if (process.env.KILO_IPC_SOCKET_PATH) {
	enableApiLogging()
}
```

- *Platform-Based Conditions:*\*

```typescript
// VSCode-specific logging
if (!kiloCodeWrapped) {
	// VSCode environment
	useOutputChannelLogger()
} else {
	// JetBrains environment
	useForwardingLogger()
}
```

### Advanced Configuration

- *Hierarchical Logger Configuration:*\*

```typescript
// Parent logger with base context
const appLogger = logger.child({
	component: "api-server",
	version: "1.0.0",
})

// Child logger inherits context
const requestLogger = appLogger.child({
	requestId: "req-123",
	userId: "user-456",
})

requestLogger.info("Processing request", { method: "POST", path: "/api/users" })
```

- *Structured Metadata:*\*

```typescript
logger.info("User action", {
	userId: "12345",
	action: "login",
	timestamp: new Date().toISOString(),
	metadata: {
		ip: "192.168.1.1",
		userAgent: "Mozilla/5.0...",
	},
})
```

### Performance Considerations

- *Test Environment Optimization:*\*
- No-op logger prevents logging overhead during tests
- Zero performance impact on test execution

- *Production Optimization:*\*
- Delta timestamp storage reduces file size
- Structured JSON format for efficient parsing
- Configurable output destinations

- *Development Optimization:*\*
- Console logging for immediate feedback
- Multiple output channels for different needs
- Hierarchical context for organized logging

## Best Practices

### 1. Choose the Right Logging Method

- **Development/Debugging**: Use `console.log` for quick debugging
- **Production/Error Tracking**: Use `logger.error/fatal` for structured error logging
- **Performance Monitoring**: Use custom logger with metadata
- **Platform-Specific**: Use appropriate logger for VSCode vs JetBrains

### 2. Log Levels and Filtering
- Use appropriate log levels (debug < info < warn < error < fatal)
- Configure minimum levels based on environment
- Use debug level sparingly in production

### 3. Structured Logging
- Include relevant context and metadata
- Use consistent field names
- Leverage child loggers for hierarchical context

### 4. Error Handling
- Always log errors with full context
- Include stack traces when available
- Use appropriate error levels (warn vs error vs fatal)

### 5. Performance
- Avoid logging in hot paths unless necessary
- Use conditional logging for expensive operations
- Consider log volume in production environments

## Troubleshooting

### Common Issues

- *Logs Not Appearing in VSCode Output Panel:*\*
- Check if "Kilo-Code" channel is selected
- Verify extension is properly loaded
- Check for console errors in Developer Tools

- *JetBrains Console Not Showing Logs:*\*
- Verify RPC connection is available
- Check if `kiloCodeWrapped` is properly detected
- Look for fallback console messages

- *File Logging Not Working:*\*
- Check write permissions on log directory
- Verify file path configuration
- Ensure `fileOutput.enabled` is true

- *Performance Issues:*\*
- Reduce log volume in production
- Use appropriate log levels
- Consider disabling debug logging in production

### Debug Commands

```bash
# Check environment variables

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

echo $NODE_ENV
echo $KILO_IPC_SOCKET_PATH

# View log files

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

tail -f ./logs/app.log
cat /tmp/kilo-code-messages.log

# Check VSCode output channels

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️
# View → Output → Kilo-Code

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

```

This logging system provides comprehensive coverage for development, debugging, and production
monitoring across both VSCode and JetBrains platforms.

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

- *Understanding This System:*\*

- **Next**: Check related documentation in the same directory

- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Architecture Documentation](../architecture/README.md) for context

- *Implementing Features:*\*

- **Next**: [Repository Development Guide](../architecture/GETTING_STARTED.md) →
  [Testing Infrastructure](../testing/TESTING_STRATEGY.md)

- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

- *Troubleshooting Issues:*\*

- **Next**: [Race Condition Analysis](../architecture/README.md) →
  [Root Cause Analysis](../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md)

- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to the appropriate README for guidance.

## Navigation Footer
- \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

- **If you're new here**: Start with the [When You're Here](#when-youre-here) section

- **If you need context**: Check the [Research Context](#research-context) section

- **If you're ready to implement**: Jump to the implementation sections

- **If you're stuck**: Visit our [Troubleshooting Guide](../tools/TROUBLESHOOTING_GUIDE.md)

- **If you need help**: Check the [Technical Glossary](../GLOSSARY.md)

- *Navigation*\*: [← Back to Documentation Hub](../README.md) ·
  [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
