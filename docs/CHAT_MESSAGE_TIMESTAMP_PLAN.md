# CHAT MESSAGE TIMESTAMP PLAN

This document provides the comprehensive implementation plan for adding robust, user-visible timestamps to chat messages.

<details><summary>Table of Contents</summary>

- [Executive summary](#executive-summary)
- [Goals](#goals)
- [Non-goals](#non-goals)
- [Current state](#current-state)
- [Requirements](#requirements)
    - [Functional requirements](#functional-requirements)
    - [Non-functional requirements](#non-functional-requirements)
- [Data model](#data-model)
- [Timestamp generation & normalization](#timestamp-generation--normalization)
- [Event timeline instrumentation](#event-timeline-instrumentation)
- [UI rendering](#ui-rendering)
- [Persistence & rehydration](#persistence--rehydration)
- [Edge cases](#edge-cases)
- [Formatting rules](#formatting-rules)
- [Instrumentation & logging](#instrumentation--logging)
- [Testing strategy](#testing-strategy)
- [Migration plan](#migration-plan)
- [Risks & mitigations](#risks--mitigations)
- [Open questions](#open-questions)
- [Acceptance criteria](#acceptance-criteria)
- [Change log](#change-log)

</details>

## Executive summary

This document defines the normative, implementation-ready specification for chat message timestamps. Its purpose is to consolidate fragmented guidance into a single source of truth, ensuring timestamps are implemented consistently, accurately, and in a manner that is useful for both users and developers for debugging.

## Goals

- To define a canonical data model for message timestamps, including key lifecycle events.
- To specify the exact UI rendering, formatting, and persistence rules for timestamps.
- To provide clear guidance on instrumenting the message lifecycle for improved debuggability.
- To address known edge cases like streaming, retries, and clock skew.
- To establish a clear testing and migration strategy for implementation.

## Non-goals

- Implementation of a user-facing UI for timezone or time format preferences.
- Historical data migration of legacy chat transcripts that lack timestamp information.
- Real-time display of relative timestamps (e.g., "5 minutes ago").

## Current state

The current guidance on timestamps is fragmented and inconsistent, primarily located in [`UI_CHAT_TASK_WINDOW.md`](UI_CHAT_TASK_WINDOW.md:1). Key issues include:

- **Inconsistent Terminology:** The document uses phrases like "local ISO-8601 with timezone offset" and "ISO-8601 timestamp (UTC)" without a clear, authoritative definition.
- **Malformed Examples:** The document contains corrupted sections and duplicated content, making it difficult to parse the intended specification.
- **Gaps in Specification:** The existing document introduces the concept of `UI enqueue` and `provider start` timestamps but fails to define a complete data model, persistence strategy, or rules for handling critical edge cases.
- **Lack of Formalism:** The event timeline is described informally, lacking a strict schema for logging and instrumentation.

This plan supersedes all previous documentation on this topic.

## Requirements

### Functional requirements

- All user and assistant messages must display a timestamp.
- Timestamps must be persisted as part of the chat history.
- Message ordering in the UI must be stable and based on the timestamp.
- The UI must display a human-readable time and provide the full, precise timestamp on hover.

### Non-functional requirements

- **Performance:** Timestamp generation and rendering should have negligible impact on UI performance and message processing latency.
- **Determinism:** Timestamp logic should be deterministic. Given the same event log, rehydration should always produce the same UI state.
- **Debuggability:** The instrumented lifecycle timestamps must be sufficient to diagnose common issues like duplicate messages, retries, and performance bottlenecks.

## Data model

The canonical message object will be extended to include a standardized set of timestamp fields.

```typescript
// Pseudo-interface for the chat message object
interface ChatMessage {
	id: string // Unique message identifier
	role: "user" | "assistant" | "system" | "tool"
	text: string
	provider?: string // e.g., 'openai'
	requestId?: string // Correlates to a specific request lifecycle

	// The canonical timestamp for the message event. Persisted.
	timestamp: string // ISO-8601 UTC format: YYYY-MM-DDTHH:MM:SS.sssZ

	// A derived, non-persisted, memoized value for UI display.
	localTimestamp?: string // e.g., "14:32"

	// Detailed lifecycle event timestamps. Persisted.
	lifecycleTimestamps?: {
		uiEnqueue: string // ISO-8601 UTC
		orchestratorDispatch: string // ISO-8601 UTC
		providerFirstChunk: string // ISO-8601 UTC
		providerCompleted: string // ISO-8601 UTC
	}

	// Optional flags for edge cases
	timestampInferred?: boolean
	clockSkewDetected?: boolean
}
```

- **Persisted:** `timestamp`, `lifecycleTimestamps`.
- **Transient/Derived:** `localTimestamp`. This is derived on the client during rehydration or rendering to avoid storing user-specific locale information and to ensure the displayed time is always correct for the user's current timezone.

## Timestamp generation & normalization

- **Source-of-Truth Clock:** The orchestrator is the source of truth for the canonical `timestamp`. While the UI records an `uiEnqueue` time, the orchestrator's clock is considered authoritative for sequencing messages to mitigate client-side clock skew. The primary `timestamp` should be generated by the orchestrator upon receiving the message.
- **Ordering Guarantees:** Messages will be primarily sorted by their `timestamp`. In the rare event of a tie, a secondary sort key (e.g., monotonic sequence ID from the orchestrator) will be used to ensure stable ordering.
- **Late-Arriving Updates:** For streaming messages, the `lifecycleTimestamps` object may be updated after the initial message is rendered (e.g., `providerCompleted` arrives last). The UI should be capable of handling these late updates without causing a re-render of the primary message timestamp.
- **Clock Skew Mitigation:** During event instrumentation, the system will compare the `uiEnqueue` timestamp (from the client) with the `orchestratorDispatch` timestamp (from the server). If the delta exceeds a defined threshold (e.g., 5 seconds), a warning will be logged, and the `clockSkewDetected: true` flag will be attached to the message metadata.

## Event timeline instrumentation

The four primary lifecycle events are defined as follows:

1.  **UI Enqueue:** The moment the user initiates a "send" action in the UI.
2.  **Orchestrator Dispatch:** The moment the orchestrator validates the request and dispatches it to a provider.
3.  **Provider First Token:** The moment the first chunk of a streaming response is received from the provider.
4.  **Provider Finalization:** The moment the provider signals the end of the response stream.

These events will be logged with the following schema:

```json
{
  "phase": "uiEnqueue" | "orchestratorDispatch" | "providerFirstChunk" | "providerCompleted",
  "requestId": "req_abc123",
  "ts": "2025-09-19T20:25:37.331Z",
  "monotonicSeq": 1024,
  "deltaPrevMs": 52
}
```

- `deltaPrevMs` measures the time since the previous lifecycle event for the same `requestId`, helping to pinpoint performance bottlenecks. Duplicates are correlated by `requestId`.

## UI rendering

- **Placement:** The timestamp will be rendered as a subtle metadata line below the message content bubble.
- **Format:**
    - **Visible:** A short-form time, e.g., `16:25` (24-hour local time). The client will use `toLocaleTimeString()` with appropriate options for robust localization.
    - **Tooltip:** On hover, a tooltip will display the full, unambiguous timestamp, e.g., `2025-09-19T20:25:37.331Z (Local: 16:25 EDT)`.
- **Accessibility:** The message container will have an `aria-label` that includes the full, descriptive timestamp for screen readers.
- **Streaming Messages:** The timestamp shown is the initial one. It MUST NOT update as new chunks arrive.
- **Edited/Retried Messages:** An edit or retry action creates a new message with a new `requestId` and a new timestamp. The original message's timestamp is immutable.

## Persistence & rehydration

- **Persistence:** Only the canonical UTC ISO string for the primary `timestamp` and the `lifecycleTimestamps` object are persisted in the chat history.
- **Rehydration:** On loading a conversation, the client will eagerly derive and memoize the local display string (`localTimestamp`) for initial paint.
- **Backward Compatibility:** For legacy messages loaded from history that lack a timestamp, the system will set the `timestamp` to the time of rehydration and attach the `timestampInferred: true` flag.

## Edge cases

- **Duplicate Sends:** If two requests are generated for the same user action (resulting in two `requestId`s), both messages are preserved and displayed. The UI will NOT attempt to group them visually in the first iteration. Their distinct timestamps will clarify the sequence of events.
- **Retries after Error:** A retry is a new message with a new `requestId` and timestamp.
- **System/Tool Messages:** All messages, including those generated by the system or tools, will have a timestamp. If a message is generated by the orchestrator without a direct user trigger, the `uiEnqueue` time can be set to the orchestrator's generation time.
- **Out-of-Order Arrival:** The UI will use a stable sort based on `timestamp` (primary key) and a monotonic sequence ID (secondary key) to handle messages that may arrive out of order from the backend.
- **Day Boundary:** If a message's date is different from the previous message's date, the UI will render a date separator (e.g., "--- September 20, 2025 ---").
- **Clock Skew > 5s:** As noted, a warning is logged and the `clockSkewDetected: true` flag is attached to the message.

## Formatting rules

- **ISO Persistence:** `YYYY-MM-DDTHH:MM:SS.sssZ` (e.g., `2025-09-19T20:25:37.331Z`)
- **Display Short:** `HH:MM` (24h local time, derived via `toLocaleTimeString`).
- **Tooltip/Hover:** A composite string showing the original ISO string and a user-friendly local representation, e.g., `2025-09-19T20:25:37.331Z (Local: 16:25 EDT)`.

## Instrumentation & logging

- **Channel:** All timestamp-related lifecycle events will be logged to a dedicated channel, `chat.timestamps`.
- **Sampling:** For the initial implementation, all lifecycle events will be logged (100% sampling). The sampling rate can be made configurable in the future if the logging volume is too high.

## Testing strategy

- **Unit Tests:**
    - Test timestamp formatting functions for different locales and times.
    - Test derivation logic for `localTimestamp`.
    - Test fallback logic for messages with missing timestamps.
- **Integration Tests:**
    - Verify that all four `lifecycleTimestamps` are correctly recorded for a standard streaming message.
    - Test the day-boundary rendering logic.
- **Test Environment:**
    - Use a deterministic clock source (e.g., `vi.useFakeTimers()`) in all tests to ensure reproducible results.
    - Simulate race conditions, such as a duplicate dispatch, to verify that both messages are handled correctly.
- **Snapshot Example:** Snapshot tests will be used to capture the rendered output of a message list, including timestamps and day boundaries, to prevent regressions.

## Migration plan

1.  **Phase 1: Instrumentation:** Implement the logging for all four lifecycle events (`uiEnqueue`, `orchestratorDispatch`, `providerFirstChunk`, `providerCompleted`).
    - _Acceptance:_ Logs for all four phases appear correctly in the `chat.timestamps` channel for every message.
2.  **Phase 2: Persistence:** Add the `timestamp` and `lifecycleTimestamps` fields to the message data model and ensure they are saved to the chat history.
    - _Acceptance:_ New conversations have persisted timestamps. The `timestampInferred` logic correctly handles old conversations.
3.  **Phase 3: UI Adoption:** Update the UI components to render the short timestamp, hover tooltip, and day boundary separators.
    - _Acceptance:_ All UI requirements are met and verified across different scenarios.
4.  **Phase 4: Cleanup:** Remove any legacy timestamp logic and update or remove the now-obsolete sections of [`UI_CHAT_TASK_WINDOW.md`](UI_CHAT_TASK_WINDOW.md:1).

## Risks & mitigations

| Risk                     | Mitigation                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clock Skew**           | Use the orchestrator as the source of truth for the canonical timestamp. Log a warning and flag messages when client/server clock delta exceeds a threshold.              |
| **Missing Timestamps**   | Implement a robust fallback for legacy data (`timestampInferred: true`) to prevent crashes and provide a reasonable default.                                              |
| **Performance Overhead** | Memoize derived `localTimestamp` values. Ensure logging is asynchronous and does not block the message processing path.                                                   |
| **Timezone Complexity**  | Persist all timestamps in UTC. Delegate all local time conversions to the client's browser API (`toLocaleTimeString`), which handles timezones and locales automatically. |

## Open questions

- Should a user-configurable time format (12h vs. 24h) be added in a future iteration?
- Should relative time display (e.g., "just now", "2 minutes ago") be considered for recent messages?
- What is the final threshold for detecting significant clock skew? (Initial proposal: 5 seconds).

## Acceptance criteria

- All goals listed in the [Goals](#goals) section are met.
- All functional and non-functional requirements are satisfied.
- The migration plan is completed, and all legacy logic is removed.
- All tests outlined in the [Testing strategy](#testing-strategy) are implemented and passing.

## Change log

- 2025-09-19: Initial creation of this plan.

<a id="navigation-footer"></a>

- Back: [`ORCHESTRATOR_LIFECYCLE.md`](ORCHESTRATOR_LIFECYCLE.md:1) · Root: [`INDEX.md`](INDEX.md:1) · Source: `/docs/CHAT_MESSAGE_TIMESTAMP_PLAN.md#L1`
