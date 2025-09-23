import { Laminar, Span } from "@lmnr-ai/lmnr"
import { logger } from "../../utils/logging"
import { type SpanType, type PendingSpanRequest } from "./LaminarTypes"

export class LaminarSpanManager {
	private spans = new Map<string, Span>()
	private activeSpans = new Map<string, Span>()
	private pendingSpanRequests: PendingSpanRequest[] = []
	private recordSpanIO: boolean = false
	private userId?: string

	constructor(recordSpanIO: boolean = false, userId?: string) {
		this.recordSpanIO = recordSpanIO
		this.userId = userId
	}

	public updateSettings(recordSpanIO: boolean, userId?: string): void {
		this.recordSpanIO = recordSpanIO
		this.userId = userId
	}

	public startSpan(
		spanType: SpanType,
		options: {
			name: string
			spanType?: string
			input?: any
			sessionId?: string
		},
		isActive: boolean = false,
	): void {
		const operationId = `startSpan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] startSpan - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {spanType: '${spanType}', options: ${JSON.stringify(
				options,
			)}, isActive: ${isActive}} - Context: Starting span - Service state: userId=${this.userId}`,
		)

		try {
			console.log(
				`[LAMINAR DEBUG] startSpan - Operation ID: ${operationId} - Creating span with Laminar - Final spanType: '${options.spanType || spanType}', recordSpanIO: ${this.recordSpanIO}`,
			)
			this._startSpanNow(spanType, options, isActive)
		} catch (error) {
			console.log(`[LAMINAR DEBUG] startSpan - Operation ID: ${operationId} - Failed - Error: ${error}`)
			logger.error("Failed to start span:", error)
		}
	}

	public endSpan(spanName: string): void {
		const operationId = `endSpan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] endSpan - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {spanName: '${spanName}'} - Context: Ending span - span exists: ${this.spans.has(
				spanName,
			)}`,
		)

		try {
			const span = this.spans.get(spanName)
			if (span) {
				console.log(`[LAMINAR DEBUG] endSpan - Operation ID: ${operationId} - Ending span`)
				// Defensive: guard against span.end() throwing
				try {
					span.end()
				} catch (endErr) {
					console.warn(`[LAMINAR DEBUG] endSpan - Operation ID: ${operationId} - span.end() threw: ${endErr}`)
				}
				this.spans.delete(spanName)
				// Remove any active span references pointing to this span
				for (const [key, value] of this.activeSpans.entries()) {
					if (value === span) {
						this.activeSpans.delete(key)
					}
				}
				console.log(
					`[LAMINAR DEBUG] endSpan - Operation ID: ${operationId} - Completed - Span removed, remaining spans: ${this.spans.size}, active spans: ${this.activeSpans.size}`,
				)
			} else {
				console.log(`[LAMINAR DEBUG] endSpan - Operation ID: ${operationId} - Span not found`)
			}
		} catch (error) {
			console.log(`[LAMINAR DEBUG] endSpan - Operation ID: ${operationId} - Failed - Error: ${error}`)
			logger.error("Failed to end span:", error)
		}
	}

	public addAttributesToSpan(spanName: string, attributes: Record<string, any>): void {
		const operationId = `addAttributesToSpan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] addAttributesToSpan - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {spanName: '${spanName}', attributes: ${JSON.stringify(attributes)}} - Context: Adding attributes to span - span exists: ${this.spans.has(spanName)}`,
		)

		try {
			const span = this.spans.get(spanName)
			if (span) {
				console.log(
					`[LAMINAR DEBUG] addAttributesToSpan - Operation ID: ${operationId} - Setting attributes on span`,
				)
				span.setAttributes(attributes)
				console.log(
					`[LAMINAR DEBUG] addAttributesToSpan - Operation ID: ${operationId} - Completed - Attributes added`,
				)
			} else {
				console.log(`[LAMINAR DEBUG] addAttributesToSpan - Operation ID: ${operationId} - Span not found`)
			}
		} catch (error) {
			console.log(`[LAMINAR DEBUG] addAttributesToSpan - Operation ID: ${operationId} - Failed - Error: ${error}`)
			logger.error("Failed to add attributes to span:", error)
		}
	}

	public addLlmAttributesToSpan(spanName: string, attributes: Record<string, any>): void {
		const operationId = `addLlmAttributesToSpan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] addLlmAttributesToSpan - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {spanName: '${spanName}', attributes: ${JSON.stringify(attributes)}} - Context: Adding LLM attributes to span - span exists: ${this.spans.has(spanName)}`,
		)

		try {
			const span = this.spans.get(spanName)
			if (span) {
				console.log(
					`[LAMINAR DEBUG] addLlmAttributesToSpan - Operation ID: ${operationId} - Setting LLM attributes using Laminar.withSpan`,
				)
				Laminar.withSpan(span, () => {
					Laminar.setSpanAttributes(attributes as any)
				})
				console.log(
					`[LAMINAR DEBUG] addLlmAttributesToSpan - Operation ID: ${operationId} - Completed - LLM attributes added`,
				)
			} else {
				console.log(`[LAMINAR DEBUG] addLlmAttributesToSpan - Operation ID: ${operationId} - Span not found`)
			}
		} catch (error) {
			console.log(
				`[LAMINAR DEBUG] addLlmAttributesToSpan - Operation ID: ${operationId} - Failed - Error: ${error}`,
			)
			logger.error("Failed to add LLM attributes to span:", error)
		}
	}

	public recordExceptionOnSpan(spanName: string, error: Error): void {
		const operationId = `recordExceptionOnSpan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] recordExceptionOnSpan - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {spanName: '${spanName}', error: ${error.message}} - Context: Recording exception on span - span exists: ${this.spans.has(spanName)}`,
		)

		try {
			const span = this.spans.get(spanName)
			if (span) {
				console.log(
					`[LAMINAR DEBUG] recordExceptionOnSpan - Operation ID: ${operationId} - Recording exception on span`,
				)
				span.recordException(error)
				console.log(
					`[LAMINAR DEBUG] recordExceptionOnSpan - Operation ID: ${operationId} - Completed - Exception recorded`,
				)
			} else {
				console.log(`[LAMINAR DEBUG] recordExceptionOnSpan - Operation ID: ${operationId} - Span not found`)
			}
		} catch (err) {
			console.log(`[LAMINAR DEBUG] recordExceptionOnSpan - Operation ID: ${operationId} - Failed - Error: ${err}`)
			logger.error("Failed to record exception on span:", err)
		}
	}

	public getActiveSpan(spanType: SpanType): Span | undefined {
		const operationId = `getActiveSpan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] getActiveSpan - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {spanType: '${spanType}'} - Context: Retrieving active span - Active spans count: ${this.activeSpans.size}`,
		)
		const span = this.activeSpans.get(spanType)
		console.log(`[LAMINAR DEBUG] getActiveSpan - Operation ID: ${operationId} - Completed - Span found: ${!!span}`)
		return span
	}

	public queueSpanRequest(
		spanType: SpanType,
		options: { name: string; spanType?: string; input?: any; sessionId?: string },
		isActive: boolean,
	): void {
		const operationId = `queueSpanRequest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] queueSpanRequest - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {spanType: '${spanType}', options: ${JSON.stringify(options)}, isActive: ${isActive}} - Context: Queueing span request`,
		)

		this.pendingSpanRequests.push({ spanType, options, isActive })
		console.log(
			`[LAMINAR DEBUG] queueSpanRequest - Operation ID: ${operationId} - Completed - Queued span request, total pending: ${this.pendingSpanRequests.length}`,
		)
	}

	public processPendingSpanRequests(): void {
		const operationId = `processPendingSpanRequests-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] processPendingSpanRequests - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {} - Context: Processing pending span requests - Count: ${this.pendingSpanRequests.length}`,
		)

		if (this.pendingSpanRequests.length > 0) {
			const queued = this.pendingSpanRequests.splice(0)
			console.log(
				`[LAMINAR DEBUG] processPendingSpanRequests - Operation ID: ${operationId} - Processing ${queued.length} pending span(s)`,
			)
			for (const req of queued) {
				this._startSpanNow(req.spanType, req.options, req.isActive)
			}
			console.log(
				`[LAMINAR DEBUG] processPendingSpanRequests - Operation ID: ${operationId} - Completed - Processed ${queued.length} pending spans`,
			)
		}
	}

	public clearPendingRequests(): void {
		this.pendingSpanRequests = []
	}

	public getSpanCount(): number {
		return this.spans.size
	}

	public getActiveSpanCount(): number {
		return this.activeSpans.size
	}

	public getPendingRequestCount(): number {
		return this.pendingSpanRequests.length
	}

	public getUserId(): string | undefined {
		return this.userId
	}

	public getRecordSpanIO(): boolean {
		return this.recordSpanIO
	}

	// Internal helper to immediately start a span (used after initialization or when processing queued spans)
	private _startSpanNow(
		spanType: SpanType,
		options: { name: string; spanType?: string; input?: any; sessionId?: string },
		isActive: boolean = false,
	): void {
		const operationId = `_startSpanNow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		try {
			const span = Laminar.startSpan({
				name: options.name,
				spanType: (options.spanType || spanType) as "LLM" | "DEFAULT" | "TOOL",
				input: this.recordSpanIO ? options.input : undefined,
				userId: this.userId,
				sessionId: options.sessionId,
			})
			this.spans.set(options.name, span)
			if (isActive) {
				this.activeSpans.set(spanType, span)
			}
			console.log(
				`[LAMINAR DEBUG] _startSpanNow - Operation ID: ${operationId} - Completed - Span stored: name='${options.name}', isActive=${isActive}, total spans: ${this.spans.size}, active spans: ${this.activeSpans.size}`,
			)
		} catch (error) {
			console.log(`[LAMINAR DEBUG] _startSpanNow - Operation ID: ${operationId} - Failed - Error: ${error}`)
			logger.error("Failed to start span (internal):", error)
		}
	}
}
