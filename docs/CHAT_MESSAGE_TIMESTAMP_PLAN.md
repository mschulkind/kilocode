# CHAT MESSAGE TIMESTAMP PLAN

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

This document provides the comprehensive implementation plan for adding robust, user-visible
timestamps to chat messages.

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
- Testing strategy
- [Migration plan](#migration-plan)
- [Risks & mitigations](#risks--mitigations)
- [Open questions](#open-questions)
- [Acceptance criteria](#acceptance-criteria)
- [Change log](#change-log)

</details>

## Executive summary

This document defines the normative, implementation-ready specification for chat message timestamps.
Its purpose is to consolidate fragmented guidance into a single source of truth, ensuring timestamps
are implemented consistently, accurately, and in a manner that is useful for both users and
developers for debugging.

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

The current guidance on timestamps is fragmented and inconsistent, primarily located in
[`UI_CHAT_TASK_WINDOW.md`](UI_CHAT_TASK_WINDOW.md). Key issues include:

- **Inconsistent Terminology:** The document uses phrases like "local ISO-8601 with timezone offset"
  and "ISO-8601 timestamp (UTC)" without a clear, authoritative definition.
- **Malformed Examples:** The document contains corrupted sections and duplicated content, making it
  difficult to parse the intended specification.
- **Gaps in Specification:** The existing document introduces the concept of `UI enqueue` and
  `provider start` timestamps but fails to define a complete data model, persistence strategy, or
  rules for handling critical edge cases.
- **Lack of Formalism:** The event timeline is described informally, lacking a strict schema for
  logging and instrumentation.

This plan supersedes all previous documentation on this topic.

## Requirements

### Functional requirements

- All user and assistant messages must display a timestamp.
- Timestamps must be persisted as part of the chat history.
- Message ordering in the UI must be stable and based on the timestamp.
- The UI must display a human-readable time and provide the full, precise timestamp on hover.

### Non-functional requirements

- **Performance:** Timestamp generation and rendering should have negligible impact on UI
  performance and message processing latency.
- **Determinism:** Timestamp logic should be deterministic. Given the same event log, rehydration
  should always produce the same UI state.
- **Debuggability:** The instrumented lifecycle timestamps must be sufficient to diagnose common
  issues like duplicate messages, retries, and performance bottlenecks.

## Data model

The canonical message object will be extended to include a standardized set of timestamp fields and
a few auxiliary fields used by the orchestrator and logging systems. The example below is
intentionally explicit so implementers can map UI state -> persisted state -> logs.

```typescript
// typescript
interface ChatMessage {
	id: string // Unique message identifier (stable across re-renders)
	role: "user" | "assistant" | "system" | "tool"
	text: string
	provider?: string // e.g., 'openai'
	requestId?: string // Correlates to a specific request lifecycle (may differ from id for retries)

	// Canonical persisted timestamp (source: orchestrator). Always UTC ISO.
	timestamp: string // ISO-8601 UTC format: YYYY-MM-DDTHH:MM:SS.sssZ

	// Display-only: derived per-client (not persisted) to keep UI locale/timezone independent.
	localTimestamp?: string // e.g., "14:32" (derived with toLocaleTimeString)

	// Detailed lifecycle timestamps (persisted). Keys are optional and added as events occur.
	lifecycleTimestamps?: {
		uiEnqueue?: string // client-side time when user hit Send (UTC ISO)
		orchestratorDispatch?: string // when orchestrator dispatched to provider (UTC ISO)
		providerFirstChunk?: string // when first streaming chunk arrived (UTC ISO)
		providerCompleted?: string // when stream completed (UTC ISO)
	}

	// Additional orchestrator metadata used for stable ordering and debugging
	monotonicSeq?: number // server-assigned sequence for tie-breaking
	channel?: string // logical channel (e.g., "chat.timestamps", "chat.activity") for routing/logging
	providerRequestId?: string // vendor/provider request id (if available)

	// Optional flags for edge cases
	timestampInferred?: boolean
	clockSkewDetected?: boolean
}
```

Why these fields exist (mapping to repo code)

- `monotonicSeq` is used as a deterministic secondary sort key when two messages share the same
  `timestamp`.
- `channel` maps to the logger "context" used by the compact logger (see the logger ctx → `c` field
  in [`src/utils/logging/types.ts`](src/utils/logging/types.ts:1) and the logger implementations in
  [`src/utils/logging/CompactLogger.ts`](src/utils/logging/CompactLogger.ts:1)).
- `lifecycleTimestamps` is intentionally persisted so operations (replay, audit, metrics) can
  reconstruct latency breakdowns.

Example persisted JSON for a single message:

```json
{
	"id": "msg_123",
	"requestId": "req_abc123",
	"role": "assistant",
	"text": "Hello",
	"timestamp": "2025-09-19T20:25:37.331Z",
	"monotonicSeq": 1024,
	"lifecycleTimestamps": {
		"uiEnqueue": "2025-09-19T20:25:36.500Z",
		"orchestratorDispatch": "2025-09-19T20:25:36.820Z",
		"providerFirstChunk": "2025-09-19T20:25:37.000Z",
		"providerCompleted": "2025-09-19T20:25:37.331Z"
	},
	"channel": "chat.timestamps"
}
```

Diagram (ASCII, simplified): message lifecycle & relationships

```text
text
+----------------------+          +------------------------+          +------------------+
|  Client (UI)         |  ----->  |  Orchestrator Service  |  ----->  |  Provider (API)  |
|  - uiEnqueue (ts)    |          |  - orchestratorDispatch|          |  - providerFirst |
|  - localTimestamp    |          |  - assigns monotonicSeq|          |  - providerDone  |
+----------------------+          +------------------------+          +------------------+
         |                                |                                   ^
         |                                |                                   |
         |  persisted ChatMessage         |--------------- logs --------------+
         |  (timestamp, lifecycleTimestamps)                         (providerRequestId)
         v
   Chat history storage
```

Storage notes

- Persist only canonical UTC timestamps and lifecycle objects. Avoid persisting per-user locale
  strings.
- When ingesting legacy messages without `timestamp`, set `timestampInferred: true` and set
  `timestamp` to rehydration time.

Developer pointers

- Logger types and compact entry shape are defined in
  [`src/utils/logging/types.ts`](src/utils/logging/types.ts:1).
- The compact logger implementation is in
  [`src/utils/logging/CompactLogger.ts`](src/utils/logging/CompactLogger.ts:1).
- Transport (file/console) behaviour is implemented in
  [`src/utils/logging/CompactTransport.ts`](src/utils/logging/CompactTransport.ts:1).

## Timestamp generation & normalization

- **Source-of-Truth Clock:** The orchestrator is the source of truth for the canonical `timestamp`.
  While the UI records an `uiEnqueue` time, the orchestrator's clock is considered authoritative for
  sequencing messages to mitigate client-side clock skew. The primary `timestamp` should be
  generated by the orchestrator upon receiving the message.
- **Ordering Guarantees:** Messages will be primarily sorted by their `timestamp`. In the rare event
  of a tie, a secondary sort key (e.g., monotonic sequence ID from the orchestrator) will be used to
  ensure stable ordering.
- **Late-Arriving Updates:** For streaming messages, the `lifecycleTimestamps` object may be updated
  after the initial message is rendered (e.g., `providerCompleted` arrives last). The UI should be
  capable of handling these late updates without causing a re-render of the primary message
  timestamp.
- **Clock Skew Mitigation:** During event instrumentation, the system will compare the `uiEnqueue`
  timestamp (from the client) with the `orchestratorDispatch` timestamp (from the server). If the
  delta exceeds a defined threshold (e.g., 5 seconds), a warning will be logged, and the
  `clockSkewDetected: true` flag will be attached to the message metadata.

## Event timeline instrumentation

The four primary lifecycle events are defined as follows:

1. **UI Enqueue:** The moment the user initiates a "send" action in the UI.
2. **Orchestrator Dispatch:** The moment the orchestrator validates the request and dispatches it to
   a provider.
3. **Provider First Token:** The moment the first chunk of a streaming response is received from the
   provider.
4. **Provider Finalization:** The moment the provider signals the end of the response stream.

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

- `deltaPrevMs` measures the time since the previous lifecycle event for the same `requestId`,
  helping to pinpoint performance bottlenecks. Duplicates are correlated by `requestId`.

## UI rendering

- **Placement:** The timestamp will be rendered as a subtle metadata line below the message content
  bubble.
- **Format:**
    - **Visible:** A short-form time, e.g., `16:25` (24-hour local time). The client will use
      `toLocaleTimeString()` with appropriate options for robust localization.
    - **Tooltip:** On hover, a tooltip will display the full, unambiguous timestamp, e.g.,
      `2025-09-19T20:25:37.331Z (Local: 16:25 EDT)`.
- **Accessibility:** The message container will have an `aria-label` that includes the full,
  descriptive timestamp for screen readers.
- **Streaming Messages:** The timestamp shown is the initial one. It MUST NOT update as new chunks
  arrive.
- **Edited/Retried Messages:** An edit or retry action creates a new message with a new `requestId`
  and a new timestamp. The original message's timestamp is immutable.

## Persistence & rehydration

- **Persistence:** Only the canonical UTC ISO string for the primary `timestamp` and the
  `lifecycleTimestamps` object are persisted in the chat history.
- **Rehydration:** On loading a conversation, the client will eagerly derive and memoize the local
  display string (`localTimestamp`) for initial paint.
- **Backward Compatibility:** For legacy messages loaded from history that lack a timestamp, the
  system will set the `timestamp` to the time of rehydration and attach the
  `timestampInferred: true` flag.

## Edge cases

- **Duplicate Sends:** If two requests are generated for the same user action (resulting in two
  `requestId`s), both messages are preserved and displayed. The UI will NOT attempt to group them
  visually in the first iteration. Their distinct timestamps will clarify the sequence of events.
- **Retries after Error:** A retry is a new message with a new `requestId` and timestamp.
- **System/Tool Messages:** All messages, including those generated by the system or tools, will
  have a timestamp. If a message is generated by the orchestrator without a direct user trigger, the
  `uiEnqueue` time can be set to the orchestrator's generation time.
- **Out-of-Order Arrival:** The UI will use a stable sort based on `timestamp` (primary key) and a
  monotonic sequence ID (secondary key) to handle messages that may arrive out of order from the
  backend.
- **Day Boundary:** If a message's date is different from the previous message's date, the UI will
  render a date separator (e.g., "--- September 20, 2025 ---").
- **Clock Skew > 5s:** As noted, a warning is logged and the `clockSkewDetected: true` flag is
  attached to the message.

## Formatting rules

- **ISO Persistence:** `YYYY-MM-DDTHH:MM:SS.sssZ` (e.g., `2025-09-19T20:25:37.331Z`)
- **Display Short:** `HH:MM` (24h local time, derived via `toLocaleTimeString`).
- **Tooltip/Hover:** A composite string showing the original ISO string and a user-friendly local
  representation, e.g., `2025-09-19T20:25:37.331Z (Local: 16:25 EDT)`.

## Instrumentation & logging

This repository uses a compact, structured logging system designed for low-overhead production
logging and convenient test-time assertions.

Core components

- Compact logger: [`src/utils/logging/CompactLogger.ts`](src/utils/logging/CompactLogger.ts:1)
- Transport (console + file):
  [`src/utils/logging/CompactTransport.ts`](src/utils/logging/CompactTransport.ts:1)
- Convenience VSCode output logger:
  [`src/utils/outputChannelLogger.ts`](src/utils/outputChannelLogger.ts:1)
- Default exported logger selector: [`src/utils/logging/index.ts`](src/utils/logging/index.ts:1)

Concepts and "channels"

- In this codebase "channels" are logical contexts attached to log entries via the logger metadata
  `ctx` → compact entry `c`.
    - Use a channel for grouping related events, e.g. `chat.timestamps`, `chat.lifecycle`,
      `orchestrator`.
    - Create contextual loggers with `.child({ ctx: "chat.timestamps" })` so the `c` field is
      automatically set on entries.

What gets written (CompactLogEntry)

- Entries written by the logger are compact objects: `{ t, l, m, c?, d? }`.
    - `t` is a delta timestamp (transport converts absolute → delta for storage).
    - `l` is level (`debug|info|warn|error|fatal`).
    - `m` is a short human message.
    - `c` is the channel/context (maps to `ctx` in LogMeta).
    - `d` is a structured payload (use for requestId, phase, monotonicSeq, deltaPrevMs).

Recommended payload for timestamp lifecycle logs

- Use `d` to store structured lifecycle data so consumers can parse logs easily:

Example usage (typescript)

```typescript
// typescript
import { logger } from "src/utils/logging/index"

const chatLogger = logger.child?.({ ctx: "chat.timestamps" }) ?? logger

chatLogger.info("lifecycle", {
	requestId: "req_abc123",
	phase: "orchestratorDispatch",
	ts: new Date().toISOString(),
	monotonicSeq: 1024,
	deltaPrevMs: 52,
})
```

Note: the repo's default `logger` behaves differently depending on environment.

- [`src/utils/logging/index.ts`](src/utils/logging/index.ts:1) exports a `noopLogger` for non-test
  runtimes and a `CompactLogger` when `NODE_ENV === "test"`. This means:
    - In normal runtime the default export is a noop (no file writes) to avoid spamming logs unless
      an explicit logger is created.
    - For local debugging or CI you can instantiate a `CompactLogger` yourself, or set up the
      transport explicitly:

Explicit logger with file output (example)

```typescript
// typescript
import { CompactLogger } from "src/utils/logging/CompactLogger"
import { CompactTransport } from "src/utils/logging/CompactTransport"

const transport = new CompactTransport({
	level: "debug",
	fileOutput: { enabled: true, path: "./logs/chat.log" },
})
const fileLogger = new CompactLogger(transport, { ctx: "chat.timestamps" })
fileLogger.info("instrumentation-enabled", { startedAt: new Date().toISOString() })
```

Transport behavior and log files

- Default transport writes delta timestamps and appends newline-delimited JSON to the configured
  file (default `./logs/app.log`) and optionally to stdout (see `CompactTransport` default config in
  [`src/utils/logging/CompactTransport.ts`](src/utils/logging/CompactTransport.ts:1)).
- Because `t` becomes a delta in the transport, post-processing tools must reconstruct absolute
  times by summing deltas starting from the session marker that the transport writes on
  initialization.

VSCode UI and debugging

- For extension/UI diagnostics prefer `createOutputChannelLogger` / `createDualLogger` in
  [`src/utils/outputChannelLogger.ts`](src/utils/outputChannelLogger.ts:1). These helpers format
  arbitrary objects safely for the VSCode Output channel and optionally mirror to console.
- Use the output channel for verbose developer-only traces; use compact structured logs for
  production telemetry.

Sampling and volume control

- The compact transport supports a minimum log level (`level` in `CompactTransportConfig`) to reduce
  volume.
- For higher-level sampling (e.g., only 1% of `chat.timestamps`) implement a sampling gate in the
  instrumentation layer before calling the logger (e.g., rand < 0.01).

Guidance: what to log where

- Production telemetry/metrics: use `CompactLogger` -> `CompactTransport` (structured `d` payloads).
  Keep messages short and structured.
- Local debugging & extension UI: use `createOutputChannelLogger` or `createDualLogger` for readable
  output and full object serialization.
- Tests: rely on `CompactLogger` (exported in test env by index) and assert on compact entries or
  mock transport (`src/utils/logging/__tests__/MockTransport.ts`).
- Sensitive data: never log full user prompt or secrets. Log request identifiers and truncated or
  hashed fingerprints instead.

Example lifecycle log entry (compact)

```json
{
	"t": 52,
	"l": "info",
	"m": "phase",
	"c": "chat.timestamps",
	"d": { "requestId": "req_abc123", "phase": "providerFirstChunk", "monotonicSeq": 1024 }
}
```

Operational checklist for enabling timestamp instrumentation

- [ ] Add a child logger in the code path producing lifecycle events:
      `logger.child({ ctx: "chat.timestamps" })`.
- [ ] Write structured events as shown above (phase, requestId, ts, monotonicSeq, deltaPrevMs).
- [ ] For production, enable a `CompactTransport` with an appropriate `level` and `fileOutput.path`.
- [ ] Add post-processing or log ingestion rules that convert delta `t` back to absolute timestamps
      for analysis.

Sampling example (pseudo)

```typescript
// typescript
if (Math.random() < 0.01) {
	chatLogger.debug("lifecycle-sampled", {
		/* ... */
	})
}
```

## Testing strategy

- **Unit Tests:**
    - Test timestamp formatting functions for different locales and times.
    - Test derivation logic for `localTimestamp`.
    - Test fallback logic for messages with missing timestamps.
- **Integration Tests:**
    - Verify that all four `lifecycleTimestamps` are correctly recorded for a standard streaming
      message.
    - Test the day-boundary rendering logic.
- **Test Environment:**
    - Use a deterministic clock source (e.g., `vi.useFakeTimers()`) in all tests to ensure
      reproducible results.
    - Simulate race conditions, such as a duplicate dispatch, to verify that both messages are
      handled correctly.
- **Snapshot Example:** Snapshot tests will be used to capture the rendered output of a message
  list, including timestamps and day boundaries, to prevent regressions.

## Migration plan

1. **Phase 1: Instrumentation:** Implement the logging for all four lifecycle events (`uiEnqueue`,
   `orchestratorDispatch`, `providerFirstChunk`, `providerCompleted`).
    - _Acceptance:_ Logs for all four phases appear correctly in the `chat.timestamps` channel for
      every message.
2. **Phase 2: Persistence:** Add the `timestamp` and `lifecycleTimestamps` fields to the message
   data model and ensure they are saved to the chat history.
    - _Acceptance:_ New conversations have persisted timestamps. The `timestampInferred` logic
      correctly handles old conversations.
3. **Phase 3: UI Adoption:** Update the UI components to render the short timestamp, hover tooltip,
   and day boundary separators.
    - _Acceptance:_ All UI requirements are met and verified across different scenarios.
4. **Phase 4: Cleanup:** Remove any legacy timestamp logic and update or remove the now-obsolete
   sections of [`UI_CHAT_TASK_WINDOW.md`](UI_CHAT_TASK_WINDOW.md).

## Risks & mitigations

| Risk                     | Mitigation                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clock Skew**           | Use the orchestrator as the source of truth for the canonical timestamp. Log a warning and flag messages when client/server clock delta exceeds a threshold.              |
| **Missing Timestamps**   | Implement a robust fallback for legacy data (`timestampInferred: true`) to prevent crashes and provide a reasonable default.                                              |
| **Performance Overhead** | Memoize derived `localTimestamp` values. Ensure logging is asynchronous and does not block the message processing path.                                                   |
| **Timezone Complexity**  | Persist all timestamps in UTC. Delegate all local time conversions to the client's browser API (`toLocaleTimeString`), which handles timezones and locales automatically. |

## Open questions

- Should a user-configurable time format (12h vs. 24h) be added in a future iteration?
- Should relative time display (e.g., "just now", "2 minutes ago") be considered for recent
  messages?
- What is the final threshold for detecting significant clock skew? (Initial proposal: 5 seconds).

## Acceptance criteria

- All goals listed in the [Goals](#goals) section are met.
- All functional and non-functional requirements are satisfied.
- The migration plan is completed, and all legacy logic is removed.
- All tests outlined in the Testing strategy are implemented and passing.

## Change log

- 2025-09-19: Initial creation of this plan.

<a id="navigation-footer"></a>

- Back: [`ORCHESTRATOR_LIFECYCLE.md`](ORCHESTRATOR_LIFECYCLE.md:1) · Root: [`README.md`](README.md:1)
  · Source: [`/docs/CHAT_MESSAGE_TIMESTAMP_PLAN.md#L1`](/docs/CHAT_MESSAGE_TIMESTAMP_PLAN.md#L1)

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

**Understanding This System:**

- **Next**: Check related documentation in the same directory
- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Architecture Documentation](../architecture/README.md) for context

**Implementing Features:**

- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) →
  [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)
- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

**Troubleshooting Issues:**

- **Next**: [Race Condition Analysis](../architecture/race-condition/README.md) →
  [Root Cause Analysis](../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md)
- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to the appropriate README for guidance.

## Navigation Footer

---

**Navigation**: [← Back to Documentation Hub](../../README.md) ·
[📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
