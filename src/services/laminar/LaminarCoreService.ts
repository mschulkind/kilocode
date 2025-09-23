import { Laminar, LaminarAttributes, observe, observeDecorator } from "@lmnr-ai/lmnr"
import { laminarConfig, reloadLaminarConfig, type LaminarSettings } from "../../shared/services/config/laminar-config"
import { logger } from "../../utils/logging"
import { LaminarSpanManager } from "./LaminarSpanManager"
import { LaminarConnectivityTester } from "./LaminarConnectivityTester"
import { type SpanType, type ConnectivityTestResult } from "./LaminarTypes"

export class LaminarCoreService {
	private static instance: LaminarCoreService | undefined
	private enabled: boolean = false
	private isInitialized: boolean = false
	private isInitializing: boolean = false
	private currentConfig: LaminarSettings = laminarConfig
	private spanManager: LaminarSpanManager
	private connectivityTester: LaminarConnectivityTester

	private constructor() {
		this.spanManager = new LaminarSpanManager()
		this.connectivityTester = new LaminarConnectivityTester()
	}

	public static getInstance(): LaminarCoreService {
		const operationId = `getInstance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] getInstance - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {} - Context: Retrieving singleton instance`,
		)
		if (!LaminarCoreService.instance) {
			console.log(`[LAMINAR DEBUG] getInstance - Operation ID: ${operationId} - Creating new instance`)
			LaminarCoreService.instance = new LaminarCoreService()
		}
		console.log(
			`[LAMINAR DEBUG] getInstance - Operation ID: ${operationId} - Completed - Instance exists: ${!!LaminarCoreService.instance}`,
		)
		return LaminarCoreService.instance
	}

	public async initialize(): Promise<void> {
		const operationId = `initialize-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {} - Context: Initializing Laminar service - Current state: enabled=${this.enabled}, isInitialized=${this.isInitialized}, isInitializing=${this.isInitializing}`,
		)
		console.log("[LAMINAR] initialize() called")

		if (this.isInitialized) {
			console.log(
				`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Already initialized, returning early`,
			)
			return
		}

		if (this.isInitializing) {
			console.log(
				`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Initialization already in progress, returning`,
			)
			return
		}

		this.isInitializing = true
		try {
			console.log("[LAMINAR] Checking config:", {
				enabled: this.currentConfig.enabled,
				hasApiKey: !!this.currentConfig.apiKey,
			})

			// Only initialize if enabled and API key is provided
			if (!this.currentConfig.enabled || !this.currentConfig.apiKey) {
				console.log("[LAMINAR] Not enabled or no API key, disabling service")
				this.enabled = false
				this.isInitialized = true
				console.log(
					`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Disabled due to config - Final state: enabled=${this.enabled}, isInitialized=${this.isInitialized}`,
				)
				return
			}

			// Initialize Laminar with custom server configuration
			console.log(
				`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Initializing Laminar with config: apiKey=${!!this.currentConfig.apiKey}, baseUrl=${this.currentConfig.baseUrl}, httpPort=${this.currentConfig.httpPort}, grpcPort=${this.currentConfig.grpcPort}`,
			)
			Laminar.initialize({
				projectApiKey: this.currentConfig.apiKey,
				baseUrl: this.currentConfig.baseUrl,
				httpPort: this.currentConfig.httpPort,
				grpcPort: this.currentConfig.grpcPort,
			})

			this.enabled = this.currentConfig.enabled
			this.spanManager.updateSettings(this.currentConfig.recordIO)
			this.isInitialized = true

			console.log(
				`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Initialization successful - State changes: enabled=${this.enabled}, isInitialized=${this.isInitialized}`,
			)
			console.log(
				`Laminar service initialized successfully with server: ${this.currentConfig.baseUrl}:${this.currentConfig.httpPort}`,
			)

			// Perform a one-time connection test immediately after initialization.
			// This helps verify the backend is reachable and the configured API key is accepted.
			// Note: We intentionally swallow non-fatal failures to avoid breaking initialization.
			;(async () => {
				try {
					const testResult = await this.testConnection()
					console.log(
						`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Connection test result: ${JSON.stringify(
							testResult,
						)}`,
					)
				} catch (err) {
					console.log(
						`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Connection test threw an error: ${String(
							err,
						)}`,
					)
				}
			})()

			// Process any spans that were requested before initialization completed.
			this.spanManager.processPendingSpanRequests()
		} catch (error) {
			console.log(
				`[LAMINAR DEBUG] initialize - Operation ID: ${operationId} - Initialization failed - Error: ${error}`,
			)
			logger.error("Failed to initialize Laminar service:", error)
			this.enabled = false
			this.isInitialized = true
		} finally {
			this.isInitializing = false
		}
	}

	public updateTelemetryState(isOptedIn: boolean): void {
		const operationId = `updateTelemetryState-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] updateTelemetryState - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {isOptedIn: ${isOptedIn}} - Context: Updating telemetry state - Previous enabled: ${this.enabled}, config.enabled: ${this.currentConfig.enabled}`,
		)
		this.enabled = isOptedIn && (this.currentConfig.enabled ?? false)
		console.log(
			`[LAMINAR DEBUG] updateTelemetryState - Operation ID: ${operationId} - Completed - New enabled state: ${this.enabled}`,
		)
	}

	public setUserId(userId: string): void {
		const operationId = `setUserId-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] setUserId - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {userId: '${userId}'} - Context: Setting user ID`,
		)
		this.spanManager.updateSettings(this.spanManager.getRecordSpanIO(), userId)
		console.log(`[LAMINAR DEBUG] setUserId - Operation ID: ${operationId} - Completed - User ID set`)
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
			)}, isActive: ${isActive}} - Context: Starting span - Service state: enabled=${this.enabled}, isInitialized=${this.isInitialized}, isInitializing=${this.isInitializing}`,
		)

		// If service is disabled explicitly, skip.
		if (!this.currentConfig.enabled && !this.enabled) {
			console.log(`[LAMINAR DEBUG] startSpan - Operation ID: ${operationId} - Skipped due to service disabled`)
			return
		}

		// If we haven't finished initializing, queue the span request and attempt to initialize.
		if (!this.isInitialized) {
			console.log(
				`[LAMINAR DEBUG] startSpan - Operation ID: ${operationId} - Service not initialized, queueing span request: name='${options.name}'`,
			)
			this.spanManager.queueSpanRequest(spanType, options, isActive)
			// Trigger initialization in the background if it's not already running.
			if (!this.isInitializing) {
				this.initialize().catch((err) =>
					console.error("[LAMINAR] Failed to initialize while processing pending span requests:", err),
				)
			}
			return
		}

		// At this point the service is initialized and enabled.
		this.spanManager.startSpan(spanType, options, isActive)
	}

	public endSpan(spanName: string): void {
		this.spanManager.endSpan(spanName)
	}

	public addAttributesToSpan(spanName: string, attributes: Record<string, any>): void {
		this.spanManager.addAttributesToSpan(spanName, attributes)
	}

	public addLlmAttributesToSpan(spanName: string, attributes: Record<string, any>): void {
		this.spanManager.addLlmAttributesToSpan(spanName, attributes)
	}

	public recordExceptionOnSpan(spanName: string, error: Error): void {
		this.spanManager.recordExceptionOnSpan(spanName, error)
	}

	public getActiveSpan(spanType: SpanType) {
		return this.spanManager.getActiveSpan(spanType)
	}

	public isEnabled(): boolean {
		const operationId = `isEnabled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] isEnabled - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {} - Context: Checking if service is enabled`,
		)
		const result = this.enabled
		console.log(`[LAMINAR DEBUG] isEnabled - Operation ID: ${operationId} - Completed - Enabled: ${result}`)
		return result
	}

	public getUserId(): string | undefined {
		return this.spanManager.getUserId()
	}

	public async testConnectionWithConfig(config: LaminarSettings): Promise<ConnectivityTestResult> {
		// Set the config on the connectivity tester
		;(this.connectivityTester as any).currentConfig = config
		;(this.connectivityTester as any).userId = this.spanManager.getUserId()

		return this.connectivityTester.testConnectionWithConfig(config)
	}

	public async testConnection(): Promise<ConnectivityTestResult> {
		const operationId = `testConnection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] testConnection - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {} - Context: Testing connection to Laminar backend - Service state: enabled=${this.enabled}, isInitialized=${this.isInitialized}, config.enabled=${this.currentConfig.enabled}`,
		)

		// Check if the service is properly configured and enabled
		if (!this.currentConfig.enabled) {
			const error = "Laminar observability is disabled in settings"
			console.log(`[LAMINAR DEBUG] testConnection - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		if (!this.currentConfig.apiKey) {
			const error = "Laminar API key is not configured"
			console.log(`[LAMINAR DEBUG] testConnection - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		if (!this.enabled || !this.isInitialized) {
			const error = "Service not enabled or initialized - try saving settings first"
			console.log(`[LAMINAR DEBUG] testConnection - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		try {
			// Test the connection by creating a test span - this is the most reliable way to validate the API key
			console.log(
				`[LAMINAR DEBUG] testConnection - Operation ID: ${operationId} - Testing connection by creating a test span - baseUrl=${this.currentConfig.baseUrl}, httpPort=${this.currentConfig.httpPort}`,
			)

			// Create a test span to validate the connection
			const testSpanName = `connection-test-${Date.now()}`
			const testSpan = Laminar.startSpan({
				name: testSpanName,
				spanType: "DEFAULT",
				input: { test: true, timestamp: new Date().toISOString() },
			})

			// Add some attributes to the test span
			testSpan.setAttributes({
				"test.connection": true,
				"test.timestamp": new Date().toISOString(),
				"test.apiKeyLength": this.currentConfig.apiKey?.length || 0,
			})

			// End the test span
			testSpan.end()

			// Wait a moment for the span to be sent
			await new Promise((resolve) => setTimeout(resolve, 1000))

			console.log(
				`[LAMINAR DEBUG] testConnection - Operation ID: ${operationId} - Completed - Test span created successfully`,
			)

			return {
				success: true,
				details: {
					baseUrl: this.currentConfig.baseUrl,
					httpPort: this.currentConfig.httpPort,
					grpcPort: this.currentConfig.grpcPort,
					userId: this.spanManager.getUserId(),
					testSpanName: testSpanName,
				},
			}
		} catch (error) {
			const errorMessage = `Connection test failed: ${error}`
			console.log(
				`[LAMINAR DEBUG] testConnection - Operation ID: ${operationId} - Failed - Error: ${errorMessage}`,
			)
			logger.error("Laminar connection test failed:", error)
			return { success: false, error: errorMessage, details: error }
		}
	}

	public getRecordSpanIO(): boolean {
		return this.spanManager.getRecordSpanIO()
	}

	public async reloadConfiguration(): Promise<void> {
		const operationId = `reloadConfiguration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] reloadConfiguration - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {} - Context: Reloading Laminar configuration`,
		)

		try {
			// Reload configuration from VS Code settings
			const newConfig = reloadLaminarConfig()

			// Update the current config reference
			this.currentConfig = newConfig

			// Reset initialization state to force re-initialization with new config
			this.isInitialized = false
			this.isInitializing = false
			this.enabled = false

			// Clear any pending span requests
			this.spanManager.clearPendingRequests()

			// Re-initialize with new configuration
			await this.initialize()

			console.log(
				`[LAMINAR DEBUG] reloadConfiguration - Operation ID: ${operationId} - Completed - Configuration reloaded successfully`,
			)
		} catch (error) {
			console.log(`[LAMINAR DEBUG] reloadConfiguration - Operation ID: ${operationId} - Failed - Error: ${error}`)
			logger.error("Failed to reload Laminar configuration:", error)
		}
	}
}
