import { Span } from "@lmnr-ai/lmnr"

export type SpanType = "LLM" | "DEFAULT" | "TOOL"

export interface PendingSpanRequest {
	spanType: SpanType
	options: { name: string; spanType?: string; input?: any; sessionId?: string }
	isActive: boolean
}

export interface ConnectivityTestResult {
	success: boolean
	error?: string
	details?: any
}

export interface LaminarServiceState {
	enabled: boolean
	isInitialized: boolean
	isInitializing: boolean
	recordSpanIO: boolean
	userId?: string
	spans: Map<string, Span>
	activeSpans: Map<string, Span>
	pendingSpanRequests: PendingSpanRequest[]
}
