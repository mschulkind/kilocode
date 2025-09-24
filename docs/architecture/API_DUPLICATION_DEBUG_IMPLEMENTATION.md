# API Duplication Debug Implementation Guide

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

**Purpose:** Technical implementation guide for adding comprehensive debug logging to track down API
request duplication issues in KiloCode.

> **Cartography Fun Fact**: Just as cartographers use triangulation to pinpoint exact locations,
> this debug implementation uses multiple logging points to triangulate the exact source of
> duplicate API requests! 🗺️

## 🔍 Research Context & Next Steps

## Research Context

**Purpose:** \[Describe the purpose and scope of this document]

**Background:** \[Provide relevant background information]

**Research Questions:** \[List key questions this document addresses]

**Methodology:** \[Describe the approach or methodology used]

**Findings:** \[Summarize key findings or conclusions]

---

### When You're Here, You Can:

**Implementing Debug Logging:**

- **Next**: Follow the implementation phases below →
  [Testing Strategy](race-condition/TESTING_STRATEGY.md) →
  [Solution Recommendations](race-condition/SOLUTION_RECOMMENDATIONS.md)
- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Race Condition Analysis](README.md) for context

**Understanding the Problem:**

- **Next**: [Root Cause Analysis](race-condition/ROOT_CAUSE_ANALYSIS.md) →
  [Code Flow Analysis](race-condition/CODE_FLOW_ANALYSIS.md) → This implementation guide
- **Related**: [Short Debug Implementation Guide](./API_DUPLICATION_DEBUG_IMPLEMENTATION_SHORT.md)
  for quick reference

**Troubleshooting Issues:**

- **Next**: [Short Troubleshooting Guide](./DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md) → This
  implementation guide → [Testing Strategy](race-condition/TESTING_STRATEGY.md)
- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

This guide provides complete implementation steps with clear next actions. If you're unsure where to
go next, return to [Architecture Documentation](../README.md) for guidance.

## Overview

This document provides step-by-step implementation instructions for adding debug logging to identify
and resolve the [race condition](README.md) causing duplicate
[API requests](../GLOSSARY.md#API-Request). The implementation is designed to be non-intrusive
and easily removable after the issue is resolved.

## Implementation Phases

### Phase 1: Core Request Tracking

#### 1.1 Task-Level Request Tracker

**File:** `src/core/task/Task.ts`

Add the following interface and class properties:

```typescript
// Add to Task.ts imports
import { EventEmitter } from 'events'

// Add interface after existing interfaces
interface RequestInfo {
  id: string
  source: 'ask' | 'processQueuedMessages' | 'submitUserMessage' | 'tool_completion'
  timestamp: number
  messageText?: string
  askType?: string
  toolName?: string
  stackTrace: string
  parentRequestId?: string
}

interface ConcurrencyInfo {
  lastAskTime: number
  concurrentAsks: number
  maxConcurrentAsks: number
  raceConditionCount: number
}

// Add to Task class properties (after existing properties)
private _requestTracker = {
  activeRequests: new Map<string, RequestInfo>(),
  requestCounter: 0,
  completedRequests: 0,

  startRequest: (source: string, details: any, parentId?: string): string => {
    const id = `req_${this.taskId}_${++this._requestTracker.requestCounter}_${Date.now()}`
    const stackTrace = new Error().stack || 'unknown'

    this._requestTracker.activeRequests.set(id, {
      id,
      source: source as any,
      timestamp: Date.now(),
      messageText: details.messageText?.substring(0, 100),
      askType: details.askType,
      toolName: details.toolName,
      stackTrace,
      parentRequestId: parentId
    })

    console.log(`[REQUEST_START] ${id}`, {
      source,
      details: {
        ...details,
        messageText: details.messageText?.substring(0, 50)
      },
      activeCount: this._requestTracker.activeRequests.size,
      completedCount: this._requestTracker.completedRequests
    })

    return id
  },

  endRequest: (id: string, success: boolean = true, result?: any) => {
    const request = this._requestTracker.activeRequests.get(id)
    if (request) {
      const duration = Date.now() - request.timestamp
      console.log(`[REQUEST_END] ${id}`, {
        success,
        duration,
        result: result ? JSON.stringify(result).substring(0, 100) : undefined,
        remainingActive: this._requestTracker.activeRequests.size - 1
      })

      this._requestTracker.activeRequests.delete(id)
      this._requestTracker.completedRequests++
    }
  },

  getActiveRequests: () => Array.from(this._requestTracker.activeRequests.values()),
  getStats: () => ({
    active: this._requestTracker.activeRequests.size,
    completed: this._requestTracker.completedRequests,
    total: this._requestTracker.requestCounter
  })
}

private _concurrencyMonitor: ConcurrencyInfo = {
  lastAskTime: 0,
  concurrentAsks: 0,
  maxConcurrentAsks: 0,
  raceConditionCount: 0
}
```

#### 1.2 Ask Method Instrumentation

**File:** `src/core/task/Task.ts` (around line 883)

Replace the race-prone message queue processing with instrumented version:

```typescript
// Replace lines 883-903 with:
} else if (isMessageQueued) {
  const requestId = this._requestTracker.startRequest('ask', {
    askType: type,
    messageText: 'queued_message_processing',
    queueSize: this.messageQueueService.messages.length
  })

  console.log("[ASK_RACE_CHECK] Processing queued message", {
    requestId,
    askType: type,
    queueSize: this.messageQueueService.messages.length,
    activeRequests: this._requestTracker.activeRequests.size,
    concurrentAsks: this._concurrencyMonitor.concurrentAsks,
    timestamp: Date.now()
  })

  // Check for race condition
  const now = Date.now()
  const timeSinceLastAsk = now - this._concurrencyMonitor.lastAskTime
  if (timeSinceLastAsk < 100) { // Less than 100ms
    this._concurrencyMonitor.concurrentAsks++
    this._concurrencyMonitor.maxConcurrentAsks = Math.max(
      this._concurrencyMonitor.maxConcurrentAsks,
      this._concurrencyMonitor.concurrentAsks
    )
    this._concurrencyMonitor.raceConditionCount++

    console.warn("[RACE_CONDITION_DETECTED]", {
      requestId,
      askType: type,
      timeSinceLastAsk,
      concurrentAsks: this._concurrencyMonitor.concurrentAsks,
      maxConcurrentAsks: this._concurrencyMonitor.maxConcurrentAsks,
      raceConditionCount: this._concurrencyMonitor.raceConditionCount
    })
  } else {
    this._concurrencyMonitor.concurrentAsks = 0
  }
  this._concurrencyMonitor.lastAskTime = now

  // Use atomic dequeue operation (will be implemented in Phase 2)
  const message = this.messageQueueService.dequeueMessage()

  if (message) {
    console.log("[ASK_PROCESSING] Dequeued message", {
      requestId,
      messageId: message.id,
      messageText: message.text.substring(0, 50),
      askType: type
    })

    try {
      // Check if this is a tool approval ask that needs to be handled
      if (
        type === "tool" ||
        type === "command" ||
        type === "browser_action_launch" ||
        type === "use_mcp_server"
      ) {
        console.log("[ASK_PROCESSING] Tool approval ask", {
          requestId,
          messageId: message.id,
          askType: type
        })
        this.handleWebviewAskResponse("yesButtonClicked", message.text, message.images)
      } else {
        console.log("[ASK_PROCESSING] Direct ask fulfillment", {
          requestId,
          messageId: message.id,
          askType: type
        })
        this.setMessageResponse(message.text, message.images)
      }

      this._requestTracker.endRequest(requestId, true, { messageId: message.id })
    } catch (error) {
      console.error("[ASK_PROCESSING] Error processing queued message", {
        requestId,
        messageId: message.id,
        error: error.message,
        stack: error.stack
      })
      this._requestTracker.endRequest(requestId, false, { error: error.message })
      throw error
    }
  } else {
    console.log("[ASK_RACE_CHECK] No message available after dequeue", {
      requestId,
      askType: type
    })
    this._requestTracker.endRequest(requestId, true, { reason: 'no_message' })
  }
}
```

#### 1.3 ProcessQueuedMessages Instrumentation

**File:** `src/core/task/Task.ts` (around line 3297)

Add synchronization and comprehensive logging:

```typescript
// Add class property
private _isProcessingQueue = false

// Replace processQueuedMessages method
public processQueuedMessages(): void {
  if (this._isProcessingQueue) {
    console.log("[QUEUE_PROCESSING] Already processing queue, skipping", {
      taskId: this.taskId,
      queueSize: this.messageQueueService.messages.length,
      activeRequests: this._requestTracker.activeRequests.size
    })
    return
  }

  this._isProcessingQueue = true
  const requestId = this._requestTracker.startRequest('processQueuedMessages', {
    messageText: 'queue_processing',
    queueSize: this.messageQueueService.messages.length
  })

  try {
    if (!this.messageQueueService.isEmpty()) {
      console.log("[QUEUE_PROCESSING] Processing queued messages", {
        requestId,
        queueSize: this.messageQueueService.messages.length,
        activeRequests: this._requestTracker.activeRequests.size,
        concurrentAsks: this._concurrencyMonitor.concurrentAsks
      })

      const queued = this.messageQueueService.dequeueMessage()
      if (queued) {
        console.log("[QUEUE_PROCESSING] Dequeued message for processing", {
          requestId,
          messageId: queued.id,
          messageText: queued.text.substring(0, 50),
          remainingQueue: this.messageQueueService.messages.length
        })

        setTimeout(() => {
          const submitRequestId = this._requestTracker.startRequest('submitUserMessage', {
            messageText: queued.text,
            parentRequestId: requestId
          })

          this.submitUserMessage(queued.text, queued.images)
            .then(() => {
              this._requestTracker.endRequest(submitRequestId, true)
              this._isProcessingQueue = false
              this._requestTracker.endRequest(requestId, true)
            })
            .catch((error) => {
              console.error("[QUEUE_PROCESSING] Error in submitUserMessage", {
                requestId,
                submitRequestId,
                error: error.message
              })
              this._requestTracker.endRequest(submitRequestId, false, { error: error.message })
              this._isProcessingQueue = false
              this._requestTracker.endRequest(requestId, false, { error: error.message })
            })
        }, 0)
      } else {
        console.log("[QUEUE_PROCESSING] No message available after dequeue", {
          requestId
        })
        this._isProcessingQueue = false
        this._requestTracker.endRequest(requestId, true, { reason: 'no_message' })
      }
    } else {
      console.log("[QUEUE_PROCESSING] No messages to process", {
        requestId,
        activeRequests: this._requestTracker.activeRequests.size
      })
      this._isProcessingQueue = false
      this._requestTracker.endRequest(requestId, true, { reason: 'empty_queue' })
    }
  } catch (error) {
    console.error("[QUEUE_PROCESSING] Error processing queue", {
      requestId,
      error: error.message,
      stack: error.stack
    })
    this._isProcessingQueue = false
    this._requestTracker.endRequest(requestId, false, { error: error.message })
  }
}
```

### Phase 2: Message Queue Service Enhancement

#### 2.1 Atomic Operations

**File:** `src/core/message-queue/MessageQueueService.ts`

Add thread-safe operations:

```typescript
// Add to MessageQueueService class
private _isProcessing = false
private _processingLock = new Promise<void>()

public async dequeueMessageAtomically(): Promise<QueuedMessage | undefined> {
  if (this._isProcessing) {
    console.log('[MESSAGE_QUEUE] Concurrent dequeue attempt blocked', {
      queueSize: this._messages.length,
      timestamp: Date.now()
    })
    return undefined
  }

  this._isProcessing = true
  try {
    const message = this._messages.shift()
    if (message) {
      console.log('[MESSAGE_QUEUE] Dequeued atomically', {
        messageId: message.id,
        messageText: message.text.substring(0, 50),
        remainingMessages: this._messages.length,
        timestamp: Date.now()
      })
      this.emit("stateChanged", this._messages)
    } else {
      console.log('[MESSAGE_QUEUE] No message to dequeue', {
        queueSize: this._messages.length,
        timestamp: Date.now()
      })
    }
    return message
  } finally {
    this._isProcessing = false
  }
}

public detectRaceCondition(): void {
  if (this._isProcessing && this._messages.length > 0) {
    console.warn('[MESSAGE_QUEUE] Potential race condition detected', {
      isProcessing: this._isProcessing,
      queueLength: this._messages.length,
      messages: this._messages.map(m => ({
        id: m.id,
        text: m.text.substring(0, 30),
        timestamp: m.timestamp
      })),
      timestamp: Date.now()
    })
  }
}

// Add monitoring methods
public getQueueStats() {
  return {
    size: this._messages.length,
    isProcessing: this._isProcessing,
    messages: this._messages.map(m => ({
      id: m.id,
      textLength: m.text.length,
      timestamp: m.timestamp
    }))
  }
}
```

### Phase 3: UI State Monitoring

#### 3.1 Chat UI Instrumentation

**File:** `webview-ui/src/components/chat/ChatView.tsx`

Add comprehensive state monitoring:

```typescript
// Add to ChatView component (after existing state)
const [debugState, setDebugState] = useState({
	sendingDisabled: false,
	isStreaming: false,
	enableButtons: false,
	activeRequests: 0,
	queuedMessages: 0,
	lastStateChange: Date.now(),
	stateChangeCount: 0,
})

// Add state change monitoring
useEffect(() => {
	const stateChange = {
		sendingDisabled,
		isStreaming,
		enableButtons,
		timestamp: Date.now(),
	}

	console.log("[UI_STATE_CHANGE]", {
		...stateChange,
		changeCount: debugState.stateChangeCount + 1,
		timeSinceLastChange: Date.now() - debugState.lastStateChange,
	})

	setDebugState((prev) => ({
		...prev,
		...stateChange,
		lastStateChange: Date.now(),
		stateChangeCount: prev.stateChangeCount + 1,
	}))
}, [sendingDisabled, isStreaming, enableButtons])

// Add request tracking to handleSendMessage
const handleSendMessage = useCallback(
	(text: string, images: string[]) => {
		const requestId = `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

		console.log("[UI_SEND_MESSAGE]", {
			requestId,
			text: text.substring(0, 50),
			textLength: text.length,
			imageCount: images?.length || 0,
			sendingDisabled,
			isStreaming,
			enableButtons,
			timestamp: Date.now(),
			stateChangeCount: debugState.stateChangeCount,
		})

		if (sendingDisabled) {
			console.log("[UI_SEND_MESSAGE] Queuing message due to sendingDisabled", {
				requestId,
				reason: "sending_disabled",
			})
			vscode.postMessage({ type: "queueMessage", text, images })
		} else {
			console.log("[UI_SEND_MESSAGE] Sending immediately", {
				requestId,
				reason: "sending_enabled",
			})
			vscode.postMessage({ type: "newTask", text, images })
		}
	},
	[sendingDisabled, isStreaming, enableButtons, debugState.stateChangeCount],
)
```

#### 3.2 Webview Message Handler Instrumentation

**File:** `src/core/webview/webviewMessageHandler.ts`

Add message tracking:

```typescript
// Add helper function at the top of webviewMessageHandler
const logWebviewMessage = (type: string, data: any, provider: ClineProvider) => {
  console.log("[WEBVIEW_MESSAGE]", {
    type,
    data: typeof data === 'string' ? data.substring(0, 100) : data,
    timestamp: Date.now(),
    currentTaskId: provider.getCurrentTask()?.taskId,
    currentTaskStreaming: provider.getCurrentTask()?.isStreaming,
    queueSize: provider.getCurrentTask()?.messageQueueService?.messages?.length || 0
  })
}

// Instrument key message handlers
case "newTask": {
  logWebviewMessage("newTask", {
    text: message.text?.substring(0, 50),
    images: message.images?.length
  }, provider)
  // ... existing code
}

case "queueMessage": {
  logWebviewMessage("queueMessage", {
    text: message.text?.substring(0, 50),
    images: message.images?.length
  }, provider)
  provider.getCurrentTask()?.messageQueueService.addMessage(message.text ?? "", message.images)
  break
}
```

### Phase 4: Tool Completion Instrumentation

#### 4.1 Tool Helper Function

**File:** `src/core/tools/debugHelpers.ts` (new file)

Create a shared helper for tool completion logging:

```typescript
export const logToolCompletion = (toolName: string, cline: any, context?: any) => {
	const taskId = cline.taskId
	const queueSize = cline.messageQueueService?.messages?.length || 0
	const willProcessQueue = !cline.messageQueueService?.isEmpty()

	console.log("[TOOL_COMPLETION]", {
		toolName,
		taskId,
		queueSize,
		willProcessQueue,
		context,
		timestamp: Date.now(),
		activeRequests: cline._requestTracker?.activeRequests?.size || 0,
	})
}

export const logToolError = (toolName: string, cline: any, error: any) => {
	console.error("[TOOL_ERROR]", {
		toolName,
		taskId: cline.taskId,
		error: error.message,
		stack: error.stack,
		timestamp: Date.now(),
	})
}
```

#### 4.2 Update All Tool Files

Update all tool files that call `processQueuedMessages()`:

```typescript
// Example for applyDiffTool.ts
import { logToolCompletion, logToolError } from "../debugHelpers"

// Before processQueuedMessages() calls:
logToolCompletion("apply_diff", cline, {
	success: true,
	filesModified: filesModified.length,
})
cline.processQueuedMessages()

// In error handlers:
logToolError("apply_diff", cline, error)
cline.processQueuedMessages()
```

### Phase 5: API Provider Instrumentation

#### 5.1 Provider Request Tracking

**File:** `src/api/providers/requestTracker.ts` (new file)

Create a shared request tracker for all providers:

```typescript
interface ProviderRequestInfo {
	id: string
	provider: string
	timestamp: number
	taskId?: string
	model: string
	requestType: "create" | "stream" | "retry"
}

class ProviderRequestTracker {
	private static _requestCounter = 0
	private static _activeRequests = new Map<string, ProviderRequestInfo>()

	static startRequest(provider: string, taskId: string, model: string, requestType: string = "create"): string {
		const requestId = `${provider}_${++this._requestCounter}_${Date.now()}`

		this._activeRequests.set(requestId, {
			id: requestId,
			provider,
			timestamp: Date.now(),
			taskId,
			model,
			requestType: requestType as any,
		})

		console.log("[PROVIDER_REQUEST]", {
			requestId,
			provider,
			taskId,
			model,
			requestType,
			activeProviderRequests: this._activeRequests.size,
			timestamp: Date.now(),
		})

		return requestId
	}

	static endRequest(requestId: string, success: boolean, error?: any) {
		const request = this._activeRequests.get(requestId)
		if (request) {
			const duration = Date.now() - request.timestamp
			console.log("[PROVIDER_RESPONSE]", {
				requestId,
				provider: request.provider,
				success,
				duration,
				error: error?.message,
				remainingActive: this._activeRequests.size - 1,
			})
			this._activeRequests.delete(requestId)
		}
	}

	static getStats() {
		return {
			active: this._activeRequests.size,
			total: this._requestCounter,
			byProvider: Array.from(this._activeRequests.values()).reduce(
				(acc, req) => {
					acc[req.provider] = (acc[req.provider] || 0) + 1
					return acc
				},
				{} as Record<string, number>,
			),
		}
	}
}

export { ProviderRequestTracker }
```

#### 5.2 Update Provider Files

Update each provider to use the request tracker:

```typescript
// Example for openai.ts
import { ProviderRequestTracker } from "./requestTracker"

// In createMessage method:
const requestId = ProviderRequestTracker.startRequest("openai", taskId, model, "create")

try {
	// ... existing provider logic
	ProviderRequestTracker.endRequest(requestId, true)
} catch (error) {
	ProviderRequestTracker.endRequest(requestId, false, error)
	throw error
}
```

## Testing and Validation

### 1. Unit Tests

**File:** `src/core/task/__tests__/Task.race-condition.spec.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Task } from "../Task"

describe("API Request Duplication Race Conditions", () => {
	let task: Task
	let apiCallCount: number

	beforeEach(() => {
		apiCallCount = 0
		// Mock API calls to count them
		vi.spyOn(console, "log").mockImplementation(() => {})
	})

	it("should not create duplicate API calls from concurrent ask calls", async () => {
		// Setup task with mocked dependencies
		task = new Task(/* ... */)

		// Queue a message
		task.messageQueueService.addMessage("test message")

		// Simulate concurrent ask calls
		const ask1 = task.ask("tool", "tool request 1")
		const ask2 = task.ask("followup", "followup request")

		// Both should process the same queued message
		await Promise.all([ask1, ask2])

		// Verify only one API call was made
		expect(apiCallCount).toBe(1)
	})

	it("should detect race conditions", async () => {
		task = new Task(/* ... */)

		// Simulate rapid concurrent calls
		const promises = Array.from({ length: 5 }, (_, i) => task.ask("tool", `request ${i}`))

		await Promise.all(promises)

		// Verify race condition was detected
		expect(task._concurrencyMonitor.raceConditionCount).toBeGreaterThan(0)
	})
})
```

### 2. Integration Tests

**File:** `src/core/task/__tests__/Task.integration.spec.ts`

```typescript
describe("End-to-End Race Condition Tests", () => {
	it("should not create duplicate API requests during tool execution", async () => {
		// Test the full scenario from UI to API
		// This would test the complete flow
	})
})
```

## Deployment and Monitoring

### 1. Environment Configuration

Add debug logging controls:

```typescript
// Add to environment configuration
const DEBUG_CONFIG = {
	enableRequestTracking: process.env.NODE_ENV === "development" || process.env.KILOCODE_DEBUG === "true",
	enableRaceConditionDetection: true,
	enableUIStateMonitoring: true,
	logLevel: process.env.KILOCODE_LOG_LEVEL || "info",
}
```

### 2. Log Analysis Tools

Create scripts to analyze debug logs:

```bash
#!/bin/bash
# analyze-debug-logs.sh

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

echo "=== API Duplication Debug Analysis ==="
echo ""

echo "1. Race Condition Detections:"
grep "RACE_CONDITION_DETECTED" logs/conport.log | wc -l

echo "2. Concurrent Ask Calls:"
grep "CONCURRENCY_WARNING" logs/conport.log | wc -l

echo "3. Duplicate API Requests:"
grep "PROVIDER_REQUEST" logs/conport.log | awk '{print $2}' | sort | uniq -c | sort -nr

echo "4. Message Queue Issues:"
grep "MESSAGE_QUEUE.*Concurrent dequeue blocked" logs/conport.log | wc -l

echo "5. UI State Inconsistencies:"
grep "UI_STATE_CHANGE" logs/conport.log | tail -10
```

### 3. Monitoring Dashboard

Create a simple monitoring dashboard:

```typescript
// Add to webview for real-time monitoring
const DebugDashboard = () => {
  const [stats, setStats] = useState({})

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTask = provider.getCurrentTask()
      if (currentTask) {
        setStats({
          activeRequests: currentTask._requestTracker?.getStats() || {},
          concurrency: currentTask._concurrencyMonitor || {},
          queueStats: currentTask.messageQueueService?.getQueueStats() || {}
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="debug-dashboard">
      <h3>Debug Stats</h3>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  )
}
```

## Cleanup and Removal

### 1. Feature Flags

Use feature flags to easily disable debug logging:

```typescript
const DEBUG_FEATURES = {
  REQUEST_TRACKING: process.env.KILOCODE_DEBUG_REQUEST_TRACKING === 'true',
  RACE_CONDITION_DETECTION: process.env.KILOCODE_DEBUG_RACE_DETECTION === 'true',
  UI_STATE_MONITORING: process.env.KILOCODE_DEBUG_UI_STATE === 'true'
}

// Wrap all debug code with feature flags
if (DEBUG_FEATURES.REQUEST_TRACKING) {
  this._requestTracker.startRequest(...)
}
```

### 2. Removal Checklist

After the issue is resolved:

- [ ] Remove debug logging code
- [ ] Remove debug helper files
- [ ] Remove test files
- [ ] Update documentation
- [ ] Clean up console.log statements
- [ ] Remove feature flags

## Conclusion

This implementation provides comprehensive debug logging to identify and resolve the API request
duplication issue. The logging is designed to be:

1. **Non-intrusive**: Minimal performance impact
2. **Comprehensive**: Covers all potential race condition sources
3. **Removable**: Easy to clean up after resolution
4. **Actionable**: Provides clear data for analysis

The implementation follows a phased approach, allowing for incremental deployment and validation of
each component.

## Navigation Footer

---

**Navigation**: [← Back to Architecture Documentation](../README.md) ·
[→ Race Condition Analysis](README.md) ·
[📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)

**Last Updated:** 2024-12-19 **Status:** Ready for Implementation **Priority:** Critical
