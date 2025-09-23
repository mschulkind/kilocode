# API Duplication Mid-Turn Investigation Plan

**Purpose:** Investigation plan for API request duplication that occurs in the middle of a turn without queued messages, after many back and forths.

**Status:** ACTIVE INVESTIGATION  
**Created:** 2024-12-19  
**Priority:** CRITICAL

## Problem Description

### Actual Symptoms

- **No queued messages involved** - happens during active processing
- **Occurs in the middle of a turn** - not at the beginning or end
- **After many back and forths** - suggests state accumulation or corruption
- **Multiple API requests with spinners** appear simultaneously
- **Responses come back jumbled** and confuse the chat interface

### Root Cause Hypothesis

**Subtask Completion Race Condition**: When a subtask completes, it calls `parentTask.recursivelyMakeClineRequests([], false)` while the main task loop is still running, creating concurrent API calls.

## Code Analysis

### Key Locations

#### 1. Main Task Loop

**File:** `src/core/task/Task.ts:1760`

```typescript
while (!this.abort) {
	const didEndLoop = await this.recursivelyMakeClineRequests(nextUserContent, includeFileDetails)
	// ... loop continues
}
```

#### 2. Subtask Completion

**File:** `src/core/webview/ClineProvider.ts:1587`

```typescript
await parentTask.recursivelyMakeClineRequests([], false)
```

#### 3. API Call Location

**File:** `src/core/task/Task.ts:2984`

```typescript
return this.api.createMessage(systemPrompt, cleanConversationHistory, metadata)
```

### The Race Condition

1. **Main task loop** calls `recursivelyMakeClineRequests`
2. **Subtask completes** and calls `parentTask.recursivelyMakeClineRequests([], false)`
3. **Both calls** are now running concurrently
4. **Each call** makes its own API request via `this.api.createMessage`
5. **Result**: Duplicate API requests

## Investigation Strategy

### Phase 1: Concurrent Call Detection (IMMEDIATE)

#### 1.1 Task Loop Instrumentation

**File:** `src/core/task/Task.ts`

Add comprehensive logging to detect concurrent calls:

```typescript
// Add to Task class
private _activeRecursiveCalls = new Set<string>()
private _recursiveCallCounter = 0

public async recursivelyMakeClineRequests(
    userContent: Anthropic.Messages.ContentBlockParam[],
    includeFileDetails: boolean = false,
): Promise<boolean> {
    const callId = `recursive_${++this._recursiveCallCounter}_${Date.now()}`
    this._activeRecursiveCalls.add(callId)

    console.log("[RECURSIVE_CALL_START]", {
        callId,
        taskId: this.taskId,
        activeCalls: this._activeRecursiveCalls.size,
        userContentLength: userContent.length,
        includeFileDetails,
        isStreaming: this.isStreaming,
        sendingDisabled: this.sendingDisabled,
        timestamp: Date.now()
    })

    // Check for concurrent calls
    if (this._activeRecursiveCalls.size > 1) {
        console.warn("[CONCURRENT_RECURSIVE_CALLS_DETECTED]", {
            callId,
            activeCalls: Array.from(this._activeRecursiveCalls),
            taskId: this.taskId,
            timestamp: Date.now()
        })
    }

    try {
        // ... existing method logic
    } finally {
        this._activeRecursiveCalls.delete(callId)
        console.log("[RECURSIVE_CALL_END]", {
            callId,
            remainingCalls: this._activeRecursiveCalls.size,
            taskId: this.taskId
        })
    }
}
```

#### 1.2 API Call Instrumentation

**File:** `src/core/task/Task.ts` (around line 2984)

Add logging to track API calls:

```typescript
// Add before the API call
const apiCallId = `api_${callId}_${Date.now()}`
console.log("[API_CALL_START]", {
	apiCallId,
	callId,
	taskId: this.taskId,
	activeRecursiveCalls: this._activeRecursiveCalls.size,
	systemPromptLength: systemPrompt.length,
	conversationHistoryLength: cleanConversationHistory.length,
	timestamp: Date.now(),
})

return this.api.createMessage(systemPrompt, cleanConversationHistory, metadata)
```

#### 1.3 Subtask Completion Instrumentation

**File:** `src/core/webview/ClineProvider.ts` (around line 1587)

Add logging to track subtask completion:

```typescript
// Add before the recursive call
console.log("[SUBTASK_COMPLETION_RECURSIVE_CALL]", {
	parentTaskId: parentTask.taskId,
	subtaskId: subtaskId,
	activeRecursiveCalls: parentTask._activeRecursiveCalls?.size || 0,
	isStreaming: parentTask.isStreaming,
	timestamp: Date.now(),
})

await parentTask.recursivelyMakeClineRequests([], false)
```

### Phase 2: State Synchronization (IMMEDIATE)

#### 2.1 Prevent Concurrent Recursive Calls

**File:** `src/core/task/Task.ts`

Add synchronization to prevent concurrent calls:

```typescript
// Add to Task class
private _recursiveCallLock = false

public async recursivelyMakeClineRequests(
    userContent: Anthropic.Messages.ContentBlockParam[],
    includeFileDetails: boolean = false,
): Promise<boolean> {
    // Wait for any existing call to complete
    while (this._recursiveCallLock) {
        console.log("[RECURSIVE_CALL_WAITING]", {
            taskId: this.taskId,
            activeCalls: this._activeRecursiveCalls.size,
            timestamp: Date.now()
        })
        await new Promise(resolve => setTimeout(resolve, 10))
    }

    this._recursiveCallLock = true
    const callId = `recursive_${++this._recursiveCallCounter}_${Date.now()}`
    this._activeRecursiveCalls.add(callId)

    try {
        // ... existing method logic
    } finally {
        this._recursiveCallLock = false
        this._activeRecursiveCalls.delete(callId)
    }
}
```

#### 2.2 Queue Subtask Completion Calls

**File:** `src/core/webview/ClineProvider.ts`

Queue subtask completion calls instead of calling immediately:

```typescript
// Add to ClineProvider class
private _subtaskCompletionQueue: Array<{parentTask: Task, subtaskId: string}> = []
private _processingSubtaskCompletions = false

private async processSubtaskCompletionQueue() {
    if (this._processingSubtaskCompletions || this._subtaskCompletionQueue.length === 0) {
        return
    }

    this._processingSubtaskCompletions = true

    while (this._subtaskCompletionQueue.length > 0) {
        const { parentTask, subtaskId } = this._subtaskCompletionQueue.shift()!

        console.log("[PROCESSING_SUBTASK_COMPLETION]", {
            parentTaskId: parentTask.taskId,
            subtaskId,
            remainingInQueue: this._subtaskCompletionQueue.length,
            timestamp: Date.now()
        })

        try {
            await parentTask.recursivelyMakeClineRequests([], false)
        } catch (error) {
            console.error("[SUBTASK_COMPLETION_ERROR]", {
                parentTaskId: parentTask.taskId,
                subtaskId,
                error: error.message
            })
        }
    }

    this._processingSubtaskCompletions = false
}

// Update the subtask completion call
const continueExecution = async () => {
    try {
        // Queue the completion instead of calling immediately
        this._subtaskCompletionQueue.push({ parentTask, subtaskId })
        await this.processSubtaskCompletionQueue()
    } catch (error) {
        this.log(
            `[continueParentTask] Error continuing parent task execution: ${error instanceof Error ? error.message : String(error)}`,
        )
    }
}
```

### Phase 3: Provider-Level Deduplication (IMMEDIATE)

#### 3.1 Request Deduplication

**File:** `src/api/providers/` - All provider files

Add request deduplication:

```typescript
// Add to each provider
private static _activeRequests = new Map<string, RequestInfo>()

interface RequestInfo {
    id: string
    taskId: string
    model: string
    timestamp: number
    systemPromptHash: string
    conversationHash: string
}

static startRequest(provider: string, taskId: string, model: string, systemPrompt: string, conversation: any[]): string {
    const systemPromptHash = crypto.createHash('md5').update(systemPrompt).digest('hex')
    const conversationHash = crypto.createHash('md5').update(JSON.stringify(conversation)).digest('hex')

    // Check for duplicate requests
    const existingRequest = Array.from(this._activeRequests.values())
        .find(req =>
            req.taskId === taskId &&
            req.systemPromptHash === systemPromptHash &&
            req.conversationHash === conversationHash
        )

    if (existingRequest) {
        console.warn("[PROVIDER_DUPLICATE_DETECTED]", {
            existingRequestId: existingRequest.id,
            taskId,
            model,
            timeSinceExisting: Date.now() - existingRequest.timestamp
        })

        // Return existing request ID instead of creating new one
        return existingRequest.id
    }

    const requestId = `${provider}_${taskId}_${Date.now()}`
    this._activeRequests.set(requestId, {
        id: requestId,
        taskId,
        model,
        timestamp: Date.now(),
        systemPromptHash,
        conversationHash
    })

    return requestId
}
```

### Phase 4: Testing and Validation

#### 4.1 Reproducible Test Case

**File:** `src/core/task/__tests__/Task.concurrent-calls.spec.ts`

```typescript
describe("Concurrent Recursive Calls", () => {
	it("should not create duplicate API calls from concurrent recursive calls", async () => {
		const task = new Task(/* ... */)

		// Simulate concurrent recursive calls
		const call1 = task.recursivelyMakeClineRequests([{ type: "text", text: "test 1" }], false)
		const call2 = task.recursivelyMakeClineRequests([{ type: "text", text: "test 2" }], false)

		await Promise.all([call1, call2])

		// Verify only one API call was made
		expect(apiCallCount).toBe(1)
	})

	it("should handle subtask completion without creating duplicates", async () => {
		const parentTask = new Task(/* ... */)
		const subtask = new Task(/* ... */)

		// Simulate subtask completion
		const mainLoop = parentTask.recursivelyMakeClineRequests([{ type: "text", text: "main" }], false)
		const subtaskCompletion = parentTask.recursivelyMakeClineRequests([], false)

		await Promise.all([mainLoop, subtaskCompletion])

		// Verify only one API call was made
		expect(apiCallCount).toBe(1)
	})
})
```

## Implementation Timeline

### Week 1: Detection and Logging

- [ ] Implement Phase 1: Concurrent Call Detection
- [ ] Deploy debug version for testing
- [ ] Collect data for 24-48 hours

### Week 2: Synchronization

- [ ] Implement Phase 2: State Synchronization
- [ ] Add request queuing for subtask completions
- [ ] Test synchronization fixes

### Week 3: Provider Deduplication

- [ ] Implement Phase 3: Provider-Level Deduplication
- [ ] Add request deduplication logic
- [ ] Test deduplication effectiveness

### Week 4: Testing and Validation

- [ ] Implement Phase 4: Testing and Validation
- [ ] Run comprehensive tests
- [ ] Validate fixes in production-like environment

## Success Criteria

### Detection Success

- [ ] Able to reproduce concurrent recursive calls consistently
- [ ] Clear visibility into call timing and overlap
- [ ] Identified all sources of concurrent calls
- [ ] Quantified frequency and impact

### Fix Success

- [ ] Zero duplicate API requests in test scenarios
- [ ] Proper synchronization between main loop and subtask completions
- [ ] No performance degradation
- [ ] All existing functionality preserved

### Monitoring Success

- [ ] Real-time detection of concurrent calls
- [ ] Automated alerts for duplicate requests
- [ ] Performance metrics and dashboards
- [ ] Historical data for analysis

## Risk Mitigation

### Development Risks

- **Synchronization Deadlocks**: Lock mechanism could cause deadlocks

    - _Mitigation_: Use timeout-based locks with fallback
    - _Mitigation_: Implement deadlock detection

- **Performance Impact**: Synchronization may slow down processing
    - _Mitigation_: Use non-blocking synchronization where possible
    - _Mitigation_: Monitor performance metrics

### Production Risks

- **Queue Overflow**: Subtask completion queue could grow indefinitely

    - _Mitigation_: Implement queue size limits
    - _Mitigation_: Add queue monitoring and alerts

- **State Corruption**: Synchronization bugs could corrupt task state
    - _Mitigation_: Comprehensive testing before deployment
    - _Mitigation_: Gradual rollout with monitoring

## Next Steps

### Immediate (Today)

1. **Review and approve** this updated investigation plan
2. **Implement Phase 1** - concurrent call detection
3. **Deploy debug version** for testing
4. **Begin data collection**

### This Week

1. **Analyze collected data** for concurrent call patterns
2. **Implement Phase 2** - state synchronization
3. **Test synchronization fixes**
4. **Monitor for improvements**

### Next Week

1. **Implement Phase 3** - provider deduplication
2. **Create comprehensive tests**
3. **Validate fixes** in test environment
4. **Prepare for production deployment**

## Conclusion

This updated investigation plan focuses on the actual root cause: **concurrent calls to `recursivelyMakeClineRequests`** from both the main task loop and subtask completion. The plan provides a systematic approach to:

1. **Detect concurrent calls** through comprehensive logging
2. **Prevent concurrent calls** through synchronization
3. **Deduplicate requests** at the provider level
4. **Validate fixes** through comprehensive testing

The key insight is that subtask completion can trigger new recursive calls while the main task loop is still running, creating the race condition that leads to duplicate API requests.

---

**Contact:** Development Team  
**Last Updated:** 2024-12-19  
**Status:** Ready for Implementation
