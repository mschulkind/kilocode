# UI_CHAT_TASK_WINDOW

**Purpose:** Describe the chat / task window UI, how user actions map to orchestrator actions, the control loop that decides when to fire API requests (including payload construction), how messages are displayed (including timestamps), and troubleshooting steps for duplicate API requests.

<details>
<summary>Table of contents</summary>

-   1. Related Documents
-   2. UI Overview
-   3. Message Flow & Control Loop
-   4. Request Payloads & Timing (timestamps)
-   5. State, Persistence & Rendering
-   6. Debugging: duplicate API requests
-   7. Troubleshooting & UX notes
- Navigation Footer

</summary>
</details>

<a name="related-docs"></a>

## 1. Related Documents

- Backend lifecycle and task orchestration: [`ORCHESTRATOR_LIFECYCLE.md`](ORCHESTRATOR_LIFECYCLE.md)
- Task delegation & subtasking: [`ORCHESTRATOR_TASK_DELEGATION.md`](ORCHESTRATOR_TASK_DELEGATION.md)
- UI feature docs (external): see the UI docs under `../apps/kilocode-docs` for related user-facing documentation: [`../apps/kilocode-docs/docs/features/settings-management.md`](../apps/kilocode-docs/docs/features/settings-management.md)

[Back to Top](#)

<a name="ui-overview"></a>

## 2. UI Overview

This section describes the primary parts of the chat / task window and their responsibilities.

### 2.1 Panels & Controls

- Chat input: free-text input where users type prompts.
- Shortcut dropdown (model switcher): located below the chat input; selecting an item updates the model used for the next request.
- Message list: chronological list of messages and system responses.
- Task / plan view<write_to_file>
  <path>docs/UI_CHAT_TASK_WINDOW.md</path>
  <: optional panel showing the current plan or subtaskcontent>

# UI_CHAT_TASK_WINDOW

**Purpose:** Document the chat / tree.

- Status indicators: show request state ( task window UI: how messages are displayed, the control loop that decides when to fire API requests and what topending, in_progress, completed, error).

### 2.2 include in each request, timestamp handling, and debugging guidance for duplicate API requests.

<details>
<summary>Table of contents</summary>

- Display conventions
- Messages are rendered with the1. Related Documents
-   2. UI Overview
-   3. following elements:
    - Author (User / System / Chat Flow & Control Loop
    - 3.1 Sequence diagram
      Tool)
    - Body (Markdown)
    - Timestamps (see section - 3.2 When requests are issued
    - 3.3 What is included in4)
    - Streaming indicator (when response is streaming)
- Use concise status badges for message states and sub each request
-   4. Message Display & Timestamps
       task states.

[Back to Top](#)

<a name="message-flow- 5. API-request duplication: common causes & diagnostics
"></a>

## 3. Message Flow & Control Loop

This section- 6. Instrumentation & Logs

-   7. Troubleshooting checklist
       documents the control loop that decides when the- Navigation Footer

</details>

<a name="related-doc UI issues API requests and what is included in eachs"></a>

## 1. Related Documents

- Primary orchestrator request.

### 3.1 High-level flow

Mermaid sequence showing the simplified control loop:

```mermaid lifecycle: [`ORCHESTRATOR_LIFECYCLE.md`](docs
sequenceDiagram
participant U as User
participant UI/ORCHESTRATOR_LIFECYCLE.md:1)

- Task delegation & subtask as Chat UI
  participant O as Orchestrator
  participant APIing: [`ORCHESTRATOR_TASK_DELEGATION.md`](docs/OR as Provider
  U->>UI: submit prompt
  UI->>O: formatCHESTRATOR_TASK_DELEGATION.md:1)
- UI-level docs ( message + metadata
  O->>API: send request (external): apps/kilocode-docs feature docs (see `appssingle or streaming)
API-->>O: partial stream / final/kilocode-docs/docs/`).
- Implementation references:
  O-->>UI: render stream / final message

````

 key symbols and handlers are surfaced from source code as inline links where helpful (for example### 3.2 Control loop responsibilities
- Debounce/coalesce rapid user edits: the UI should avoid firing a [`initiateTaskLoop`](/\src/core/task/Task.ts#L1699)).

Back request on every keystroke. Key triggers that produce requests:
 to Top

<a name="ui-overview"></a>
## 2. UI Overview

Short  - Explicit "Send" action.
  - Shortcut/model-change actions summary: the chat/task window is the primary interaction that explicitly re-send.
  - Background orchestr surface. It contains:
- Chat input area (ator decisions (e.g. follow-up questions issued by the orchestrator).
- Orcompose box) with model shortcut dropdown below the input.
- Messagechestrator list (chronological), showing assistant-side decision points:
  - `initiateTaskLoop` / task scheduler decides to compose and dispatch provider, user, and system messages.
- Task panel / plan view (where active subtasks and plan steps appear).
- requests. See [`src/extension.ts`](src/extension.ts: Status indicators (pending, streaming, completed, error).
1) and orchestration lifecycle docs for backend mapping.
  - The UI builds the request envelope (messages,- Controls: send, stop/cancel, retry.

Design intent: metadata, model selection) and hands it to the orchestr the UI is thin — it reflects orchestrator state and delegates decision-making (what to send to API) to theator / provider layer: see [`src/api/index.ts`](src/api orchestrator control loop.

Back to Top

<a name="/index.ts:1)

### 3.3 When the UI sends vs orchestratorchat-flow"></a>
## 3. Chat Flow & Control Loop

This section sends
- UI-initiated send: user presses Send → describes the sequence from UI packages user messages + chosen model → one request dispatched input to API request and response integration back into the.
- Orchestrator-initiated send: orchestrator UI.

### 3.1 Sequence diagram

```mermaid
sequenceDiagram requests (subtasks / tool calls) may trigger additional requests
participant U as User
participant UI as Chat UI; these are produced by the orchestrator runtime and
participant O as Orchestrator
participant API as Provider may be visible as additional messages in the UI.


U->>UI: submits message
UI->>O: enqueueMessage[Back to Top](#)

<a name="payloads-timestamps"></a>
## 4. Request Payloads & Timing (timestamps)

###(message)
O->>O: updateState(pending)
O->>O: decideRequest 4.1 Payload composition
- Each outgoing request contains:
 Payload()
O->>API: sendRequest(payload)
API-- - message history (trimmed / summarized),
  - system prompts>>O: streamResponse(chunk)
O-->>UI: streamToMessage(chunk,
  - tool metadata,
  - selected model/profile (from)
O->>O: finalizeMessage()
````

Back to Top

### the shortcut dropdown),

- request-level options ( 3.2 When requests are issuedmax tokens, temperature, streaming flag).
- Where to

- Debounce & explicit send:
    - A request is issued when the user presses Send map code:
    - Request formation: [`src/api/transform/openai-format.ts`](src/api/transform/openai-format.ts:, or when an orchestrator action (subtask, follow-up) programmatically triggers `initiateTaskLoop`.

1. and provider transform layers.
   -- Guard conditions before issuing:

- There is no active Provider dispatch: [`src/api/providers/index.ts`](src/api/providers/index request for the same chat turn (prevents reentrant.ts:1)

### 4.2 Timestamps

- Display format recommendation: sends).
    - The message is in a "ready" state ( local ISO-8601 with timezone offset (e.g. 2025-09-validated, not empty).
    - The orchestrator evaluates whether the input should create a direct provider call or trigger an internal subtask first (see [`OR19T12:34:56-04:00) for precise debugging.
- UI placement: each message should show a short timestamp (e.g. HHCHESTRATOR_TASK_DELEGATION.md`](docs/ORCHESTRATOR_TASK_DELEGATION.md)).

Back to Top

### 3.3 What is- Logging: Add request-level timestamps both when the included in each request

Typical payload composition:
UI enqueues the request and when the provider sends- System & context frames: persistent system prompt, the first byte:

- UI enqueue timestamp: when the workspace context (if enabled).
- Recent message window Send button is activated (record client-side).
  : last N messages chosen by token/recency policy.
- Dispatcher timestamp: when the orchestrator hands to- Tools / mode hints: instructions for tools (e provider (record server-side/orchestrator).
- Provider.g., shell integration), and metadata such as the selected model response timestamp: when the first token/response chunk profile.
- Safety & settings flags: user config that affects response arrives.

### 4.3 Example timeline

- shape (e.g., safe-mode toggles t0: user clicks Send (UI enqueue)
- t1: UI hands envelope).

Implementation note: the control loop attempts to minimize redundant context by trimming messages using to orchestrator (dispatcher)

- t2: orchestrator the configured token window before sending.

Back to calls provider (network)

- t3: provider returns first stream chunk
- Recording these timestamps in logs Top

<a name="timestamps"></a>

## 4. Message Display & T helps correlate duplicates or retries.

[Back toimestamps

- Each message displayed in the UI should include an ISO-8601 timestamp (UTC Top](#)

<a name="state-persistence"></a>

## ) rendered in the UI and converted to local timezone client-side.

- Timestamp placement: small5. State, Persistence & Rendering

### 5.1 In subdued text under the message bubble (follow existing UI conventions-memory state vs persisted state

- In-memory UI state:
    - current).
- Source metadata: messages originating draft message,
    - streaming response buffers from API responses should include provider id and request id as data attributes (useful when diagnosing,
    - temporary subtask states.
- Persisted state:
  duplicate requests).
- Best practice: persist timestamps - conversation history,
    - model/profile preferences,
      in conversation state so re-renders or reconstructions - saved drafts (if implemented).
- Link UI state show consistent times.

Example data model (concept to configuration: settings that affect behavior (e.g., auto-send, streaming) are read from the settingsual):

```json
{
  "id": "msg_123",
  "role": "assistant screen described in [`docs/SETTINGS_SCREEN.md`](docs/SETTINGS_SCREEN.md) (when added) and UI docs at",
  "text": "Here's the plan...",
  "timestamp": "2025-09-19T16:00:19.119Z",
  "provider": "openai `apps/kilocode-docs`.

### 5.2 Rendering notes & rerendering issues
- Rendering must preserve edit buffer",
  "requestId": "req_abc"
}
```

Back to while background tasks run.

- Ensure controlled components Top

<a name="dup-: keep draft text in a stable state object so rerendersrequests"></a>

## 5. API-request duplication don't lose edits.

- Model switching via the: common causes & diagnostics

If multiple API requests shortcut dropdown should only mutate the "next-request" model appear to fire for a single user input, check the selection and not flush the draft.

[Back to Top]( following in order:

1. UI double-send:
    - The send control was clicked/activated multiple times (deb#)

<a name="debugging-duplicate-requests"></a>

## ounce missing).

- Verify UI event handlers disable the send button on click and re-enable after error/complete.

2. Re-entrant control loop:
    - The orchestrator6. Debugging: duplicate API requests

If you observe multiple API requests being sent for a single user action, check the following likely causes and steps.

control loop was invoked twice (e.g., user action + a scheduled### 6.1 Likely causes

- Duplicate event listeners: the Send handler is bound retry). Inspect calls to [`initiateTask more than once (e.g., component mounted twice).
- Race conditions producing multipleLoop`](/\src/core/task/Task.ts#L1699) or equivalent entry dispatcher calls: both UI and orchestratorpoints.
    - Confirm the orchestrator sets an " decide to send at similar times.
- Missing debounce / throttleactiveRequest" token per chat turn and skips issuing if on autocorrect or shortcut actions.
- Retries triggered present.

3. Streaming vs finalization race:
    - by provider timeouts where cancellation was not applied.

- Streaming handlers calling completion logic multiple A start-of-stream event triggers a secondary finalization flow that re-sends a payload.
    - Ensure the streaming times.

### 6.2 Quick reproduction steps

1. Open the lifecycle (open → streaming → closed) sets proper developer console / extension log.
2. Add logging for:

    - UI flags.

3. Shortcut/mode switch triggers:
   enqueue timestamp and request id (generate - Shortcut dropdown / mode switch handlers below a short uuid).
    - Orchestrator dispatch timestamp the input may dispatch a secondary request. Confirm mode changes do with same request id.
    - Provider start timestamp not auto-trigger sends unless with same id.
4. Perform a single Send action and explicitly requested.

5. Shell-integration fallback loops:
    - If a shell integration times out and triggers a fallback request path, the fallback may also issue provider calls. Correlate requestId and timestamps.

Diagnostics to gather:

- Request timestamps and observe how many distinct "UI enqueue" logs appear.

### requestId for each observed request.

- Provider and 6.3 Suggested instrumentation (practical)
- When enqueuing a request, attach a client-generated requestId and record:
    - `UI.enqueue(requestId, timestamp)`
    - `Orchestrator.dispatch(requestId, timestamp)`
    - ` UI-side request tokens (attach to message metadata).
- Event trace of user actions leading up to the send (button clicksProvider.start(requestId, timestamp)`
- Search logs for duplicated `UI.enqueue` events; if present, keyboard shortcuts).
- Logs from orchestrator about guard checks (activeRequest flag).

Back to Top, root-cause is UI duplication.

- If only one `UI.enqueue

<a name="instrumentation"></a>

## 6`but multiple`Orchestrator.dispatch` events exist, inspect orchestrator logic (task scheduler / retry. Instrumentation & Logs

Where to look:

- Client logs: UI console logs for event handlers and network calls.
- Or logic) — see orchestration lifecycle: [`docs/ORCHESTRchestrator logs: debug traces that show decision points (enqueueMessage, decideRequestPayloadATOR_LIFECYCLE.md`](docs/ORCHESTRATOR_LIFECYCLE, sendRequest).
- Provider logs: provider-side request ids and.md:1).

### 6.4 Typical fixes

- Ensure send handler latency.

Recommended logging points:

- On send: log payload is attached exactly once (use effects cleanup in React hash, requestId, and activeRequest).
- Add a short debounce (100-250ms) for program token.
- On stream start: log requestId and firstmatic triggers.
- Use cancellation tokens for in-flight-chunk timestamp.
- On fallback trigger: log reason and requests; when a new request supersedes an old one trace (timeout, non-200 status).

Back to Top, cancel the old provider call.

- Consolidate orchestrator-initiated requests: add deduplication by

<a name="troubleshooting"></a>

## 7. Troubleshooting checklist

- Reproduce with devtools open to capture requestId at the dispatcher layer.

[Back to Top](#)

<a name network and console logs.

- Confirm only one UI event="troubleshooting-ux"></a>

## 7. Troubleshooting & handler for Send is registered.

- Check message metadata for duplicate requestIds; if different, identify UX notes

- UX: show a clear "Request queued" vs " why multiple requestIds were created.
- Correlate timestampsRequest sending" vs "Streaming" vs "Completed" between UI and provider logs to find ordering.
- Tempor state so users can understand what the UI is doing.
- Whenarily enable verbose orchestrator logging to capture guard evaluation decisions.

Back to Top

## Navigation Footer timeouts occur, show the fallback behavior (see shell integration fallback docs and provider-level time

- See the orchestrator lifecycle: [`ORCHESTRouts at [`src/api/providers/fetchers/`](src/apiATOR_LIFECYCLE.md`](docs/ORCHESTRATOR_LIFECYCLE.md/providers/fetchers:1).
- For local debugging, enable verbose logging in the settings UI and replicate the action:1)
- See task delegation: [`ORCHESTRATOR_TASK_DELEG while capturing timestamps.

[Back to Top](#)

---

ATION.md`](docs/ORCHESTRATOR_TASK_DELEGATION### Navigation Footer

- Index: [`docs/ORCHESTRATOR_L.md)
