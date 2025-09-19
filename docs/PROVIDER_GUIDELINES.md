# Provider Guidelines and Retry Policy

Purpose: provide a concise, implementable contract for provider implementations so orchestrator-level retries, tracing and cancellation behave predictably.

## Provider error & retry contract

- Providers MUST throw errors for throttling / rate-limit conditions so the orchestrator can perform exponential backoff.
- Providers MAY perform limited, idempotent internal retries for:
    - token refresh on 401 (single in-flight refresh; block concurrent sends)
    - previous_response_id "not found" → retry once without previous_response_id
- Providers SHOULD NOT swallow/emit error chunks in place of throwing for errors that should trigger orchestrator retry.

## Cancellation contract

- Providers SHOULD accept an AbortSignal / cancellation token via metadata or requestOptions.
- When cancellation is signalled providers must abort network streams ASAP and throw an AbortError (or propagate the underlying cancellation error).

## Tracing & idempotency (headers)

- Recommended request headers:
    - X-KILOCODE-TASK-ID: uuid assigned by MessageQueueService / Task
    - X-KILOCODE-TIMESTAMP-ISO: ISO8601 send timestamp
- Prefer placing headers in HTTP request headers or SDK requestOptions. If a provider SDK does not support headers, include minimal metadata as a non-behavioral system message field as a last resort.

## previous_response_id guidance

- Use previous_response_id only when stable and non-null.
- On a 400 "previous_response_id not found" error providers MAY retry once without the field, then MUST throw if the retry fails.

## Usage reporting and token counting

- Providers should emit `usage` ApiStream chunks during streaming or at completion using the shared ApiStream shape.
- Providers that offer a server-side token counting endpoint SHOULD implement countTokens(); otherwise the base tiktoken fallback is acceptable.

## Provider-level best practices

- Avoid duplicate fetchModel / model discovery calls within a single createMessage.
- Serialize token refresh so only one refresh runs at a time; concurrent sends should wait for the refresh result.
- Do not yield "Error: ..." as normal text to signal retryable errors—throw instead so the orchestrator can act.

## Retry responsibility (orchestrator vs provider)

- The orchestrator (Task) is authoritative for request-level retries and exponential backoff.
- Providers are allowed small, deterministic internal retries (token refresh, previous_response_id) but must not mask throttling by performing long retry loops.
- Providers MUST rethrow throttling errors (explicit THROTTLING classification) so Task.ts can run its backoff and retry loop.

## Testing checklist (integration scenarios)

- Concurrent previous_response_id race: simulate simultaneous sends that rely on previous_response_id and confirm only one effective response is produced.
- Token refresh: simulate 401 and ensure only one final successful send occurs after refresh.
- SSE vs SDK fallback: force SDK streaming error and confirm SSE fallback produces a single successful stream (no duplicate bodies).
- Provider switching / VirtualQuotaFallback: start a request, trigger an active provider switch, and verify the original stream is cancelled and only one downstream completion is delivered.
- Polling patterns (e.g., Glama): validate polling for usage does not re-submit the completion request.
- Bedrock throttling: emulate throttling and verify provider throws THROTTLING and orchestrator retries per backoff policy.

## Where to use this doc

- Reference in PR descriptions for provider changes.
- Use as acceptance criteria for provider implementations and provider-focused tests.
- Link from `ORCHESTRATOR_LIFECYCLE.md` and add short checklist items in the repo's test plan.
