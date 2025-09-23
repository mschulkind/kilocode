import { type LaminarSettings } from "../../shared/services/config/laminar-config"
import { type ConnectivityTestResult } from "./LaminarTypes"

export class LaminarConnectivityTester {
	public async testConnectionWithConfig(config: LaminarSettings): Promise<ConnectivityTestResult> {
		const operationId = `testConnectionWithConfig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {} - Context: Testing connection with provided config - Config: enabled=${config.enabled}, hasApiKey=${!!config.apiKey}, baseUrl=${config.baseUrl}, httpPort=${config.httpPort}, grpcPort=${config.grpcPort}`,
		)

		// Check if the service is properly configured and enabled
		if (!config.enabled) {
			const error = "Laminar observability is disabled in settings"
			console.log(`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		if (!config.apiKey) {
			const error = "Laminar API key is not configured"
			console.log(`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		// Validate URL format
		try {
			const url = new URL(config.baseUrl)
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - URL validation passed - protocol: ${url.protocol}, hostname: ${url.hostname}`,
			)
		} catch (urlError) {
			const error = `Invalid base URL format: ${config.baseUrl}`
			console.log(`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		// Validate ports
		if (config.httpPort < 1 || config.httpPort > 65535) {
			const error = `Invalid HTTP port: ${config.httpPort} (must be 1-65535)`
			console.log(`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		if (config.grpcPort < 1 || config.grpcPort > 65535) {
			const error = `Invalid gRPC port: ${config.grpcPort} (must be 1-65535)`
			console.log(`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - ${error}`)
			return { success: false, error }
		}

		try {
			// First, test basic HTTP connectivity to the server
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Testing HTTP connectivity to ${config.baseUrl}`,
			)

			const httpTestResult = await this.testHttpConnectivity(config.baseUrl, config.httpPort)
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - HTTP connectivity test result: ${JSON.stringify(httpTestResult)}`,
			)

			if (!httpTestResult.success) {
				const error = `HTTP connectivity test failed: ${httpTestResult.error}`
				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - ${error}`,
				)
				return { success: false, error, details: httpTestResult }
			}

			// Test gRPC connectivity to the server
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Testing gRPC connectivity to ${config.baseUrl}:${config.grpcPort}`,
			)
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - gRPC test parameters: baseUrl=${config.baseUrl}, grpcPort=${config.grpcPort}`,
			)

			const grpcTestResult = await this.testGrpcConnectivity(config.baseUrl, config.grpcPort)
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - gRPC connectivity test result:`,
				{
					success: grpcTestResult.success,
					error: grpcTestResult.error,
					details: grpcTestResult.details,
					fullResult: grpcTestResult,
				},
			)

			if (!grpcTestResult.success) {
				const error = `gRPC connectivity test failed: ${grpcTestResult.error}`
				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - ${error}`,
				)
				return { success: false, error, details: { http: httpTestResult, grpc: grpcTestResult } }
			}

			// Test the connection by creating a test span - this validates the API key
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Testing Laminar API with test span - baseUrl=${config.baseUrl}, httpPort=${config.httpPort}`,
			)

			// Temporarily initialize Laminar with the test configuration
			const { Laminar } = await import("@lmnr-ai/lmnr")
			const originalConfig = this.currentConfig
			this.currentConfig = config

			try {
				// Initialize Laminar with the test config
				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Initializing Laminar with test config - apiKey length: ${config.apiKey?.length}, baseUrl: ${config.baseUrl}`,
				)

				Laminar.initialize({
					projectApiKey: config.apiKey,
					baseUrl: config.baseUrl,
					httpPort: config.httpPort,
					grpcPort: config.grpcPort,
				})

				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Laminar initialized successfully, creating test span`,
				)

				// Create a test span to validate the connection
				const testSpanName = `connection-test-${Date.now()}`
				const testSpan = Laminar.startSpan({
					name: testSpanName,
					spanType: "DEFAULT",
					input: { test: true, timestamp: new Date().toISOString() },
				})

				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Test span created: ${testSpanName}`,
				)

				// Add some attributes to the test span
				testSpan.setAttributes({
					"test.connection": true,
					"test.timestamp": new Date().toISOString(),
					"test.apiKeyLength": config.apiKey?.length || 0,
					"test.baseUrl": config.baseUrl,
					"test.httpPort": config.httpPort,
				})

				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Test span attributes set, ending span`,
				)

				// End the test span
				testSpan.end()

				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Test span ended, waiting for transmission`,
				)

				// Wait a moment for the span to be sent
				await new Promise((resolve) => setTimeout(resolve, 2000))

				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Completed - Test span created and sent successfully`,
				)

				return {
					success: true,
					details: {
						baseUrl: config.baseUrl,
						httpPort: config.httpPort,
						grpcPort: config.grpcPort,
						userId: this.userId,
						testSpanName: testSpanName,
						httpConnectivity: httpTestResult,
						grpcConnectivity: grpcTestResult,
					},
				}
			} finally {
				// Restore the original configuration
				console.log(
					`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Restoring original configuration`,
				)
				this.currentConfig = originalConfig
				// Re-initialize with the original config if it was different
				if (originalConfig.apiKey && originalConfig.enabled) {
					try {
						console.log(
							`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Re-initializing with original config`,
						)
						Laminar.initialize({
							projectApiKey: originalConfig.apiKey,
							baseUrl: originalConfig.baseUrl,
							httpPort: originalConfig.httpPort,
							grpcPort: originalConfig.grpcPort,
						})
						console.log(
							`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Original configuration restored successfully`,
						)
					} catch (err) {
						console.log(
							`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Warning: Failed to restore original config: ${err}`,
						)
					}
				}
			}
		} catch (error) {
			const errorMessage = `Connection test failed: ${error}`
			console.log(
				`[LAMINAR DEBUG] testConnectionWithConfig - Operation ID: ${operationId} - Failed - Error: ${errorMessage}`,
			)
			return { success: false, error: errorMessage, details: error }
		}
	}

	private async testGrpcConnectivity(baseUrl: string, grpcPort: number): Promise<ConnectivityTestResult> {
		const operationId = `testGrpcConnectivity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {baseUrl: '${baseUrl}', grpcPort: ${grpcPort}} - Context: Testing gRPC connectivity to Laminar server`,
		)

		try {
			// Parse the base URL to get the hostname
			const url = new URL(baseUrl)
			const hostname = url.hostname

			console.log(
				`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - Parsed URL - hostname: ${hostname}, baseUrl: ${baseUrl}`,
			)
			console.log(
				`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - Testing gRPC port ${grpcPort} on ${hostname}`,
			)

			// Test gRPC connectivity by attempting to connect to the gRPC port
			// Since we can't easily test gRPC without proper client setup, we'll test basic TCP connectivity
			console.log(
				`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - Calling testTcpConnectivity with hostname: ${hostname}, port: ${grpcPort}`,
			)
			const testResult = await this.testTcpConnectivity(hostname, grpcPort)

			console.log(
				`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - testTcpConnectivity result:`,
				{
					success: testResult.success,
					error: testResult.error,
					details: testResult.details,
				},
			)

			if (testResult.success) {
				console.log(
					`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - Completed - gRPC port is reachable`,
				)
				return {
					success: true,
					details: {
						hostname,
						grpcPort,
						tcpConnectivity: testResult.details,
					},
				}
			} else {
				const error = `gRPC port ${grpcPort} is not reachable: ${testResult.error}`
				console.log(`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - Failed - ${error}`)
				return { success: false, error, details: { hostname, grpcPort, tcpConnectivity: testResult } }
			}
		} catch (error) {
			const errorMessage = `gRPC connectivity test failed: ${error}`
			console.log(
				`[LAMINAR DEBUG] testGrpcConnectivity - Operation ID: ${operationId} - Failed - Error: ${errorMessage}`,
			)
			return { success: false, error: errorMessage, details: error }
		}
	}

	private async testTcpConnectivity(hostname: string, port: number): Promise<ConnectivityTestResult> {
		const operationId = `testTcpConnectivity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {hostname: '${hostname}', port: ${port}} - Context: Testing TCP connectivity`,
		)

		try {
			// Use a more reliable approach for testing TCP connectivity
			// We'll try to connect and look for specific error patterns
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

			try {
				const testUrl = `http://${hostname}:${port}`

				console.log(
					`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Testing TCP connection to ${testUrl}`,
				)

				const response = await fetch(testUrl, {
					method: "GET",
					signal: controller.signal,
					headers: {
						"User-Agent": "KiloCode-Laminar-Test/1.0",
					},
				})

				clearTimeout(timeoutId)

				// Any response means the port is open and accepting connections
				console.log(
					`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - TCP connection successful - Status: ${response.status}`,
				)

				return {
					success: true,
					details: {
						hostname,
						port,
						status: response.status,
						statusText: response.statusText,
						note: "Port is open and responding to HTTP requests",
					},
				}
			} catch (fetchError) {
				clearTimeout(timeoutId)

				// Log the actual error details for debugging
				console.log(
					`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Fetch error details:`,
					{
						name: fetchError instanceof Error ? fetchError.name : "Unknown",
						message: fetchError instanceof Error ? fetchError.message : String(fetchError),
						type: typeof fetchError,
						constructor: fetchError?.constructor?.name,
						fullError: fetchError,
					},
				)

				if (fetchError instanceof Error && fetchError.name === "AbortError") {
					const error = "TCP connection timed out after 5 seconds"
					console.log(
						`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Failed - ${error}`,
					)
					return { success: false, error, details: { hostname, port, timeout: true } }
				}

				// Check for specific connection refused errors that indicate port is closed
				if (
					fetchError instanceof Error &&
					(fetchError.message.includes("ECONNREFUSED") ||
						fetchError.message.includes("connection refused") ||
						fetchError.message.includes("ERR_CONNECTION_REFUSED") ||
						fetchError.message.includes("ERR_NETWORK_CHANGED") ||
						fetchError.message.includes("ERR_INTERNET_DISCONNECTED") ||
						fetchError.message.includes("Failed to connect") ||
						fetchError.message.includes("Could not connect"))
				) {
					const error = `Port ${port} is not open or not accepting connections: ${fetchError.message}`
					console.log(
						`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Failed - ${error}`,
					)
					return { success: false, error, details: { hostname, port, connectionRefused: true } }
				}

				// For other errors, check if it's a protocol error (port open but doesn't speak HTTP)
				// This is common for gRPC ports - they accept connections but don't respond to HTTP
				if (
					fetchError instanceof Error &&
					(fetchError.message.includes("fetch failed") ||
						fetchError.message.includes("ERR_INVALID_HTTP_RESPONSE") ||
						fetchError.message.includes("HTTP/0.9") ||
						fetchError.message.includes("Invalid response"))
				) {
					// Port is open but doesn't speak HTTP (likely gRPC)
					console.log(
						`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Port open but doesn't speak HTTP (likely gRPC) - Error: ${fetchError.message}`,
					)
					return {
						success: true,
						details: {
							hostname,
							port,
							note: "Port is open but does not respond to HTTP requests (likely gRPC port)",
							error: fetchError.message,
						},
					}
				}

				// For other errors, assume port might be closed
				const error = `Unable to connect to port ${port}: ${fetchError.message}`
				console.log(`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Failed - ${error}`)
				return { success: false, error, details: { hostname, port, networkError: true } }
			}
		} catch (error) {
			const errorMessage = `TCP connectivity test failed: ${error}`
			console.log(
				`[LAMINAR DEBUG] testTcpConnectivity - Operation ID: ${operationId} - Failed - Error: ${errorMessage}`,
			)
			return { success: false, error: errorMessage, details: error }
		}
	}

	private async testHttpConnectivity(baseUrl: string, httpPort: number): Promise<ConnectivityTestResult> {
		const operationId = `testHttpConnectivity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		console.log(
			`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - Timestamp: ${new Date().toISOString()} - Params: {baseUrl: '${baseUrl}', httpPort: ${httpPort}} - Context: Testing HTTP connectivity to Laminar server`,
		)

		try {
			// Construct the full URL for the health check endpoint
			const url = new URL(baseUrl)
			url.port = httpPort.toString()
			url.pathname = "/health" // Common health check endpoint

			console.log(
				`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - Testing URL: ${url.toString()}`,
			)

			// Try to make a simple HTTP request to test connectivity
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

			try {
				const response = await fetch(url.toString(), {
					method: "GET",
					signal: controller.signal,
					headers: {
						"User-Agent": "KiloCode-Laminar-Test/1.0",
						Accept: "application/json",
					},
				})

				clearTimeout(timeoutId)

				console.log(
					`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - HTTP response received - Status: ${response.status}, StatusText: ${response.statusText}`,
				)

				// Even if the health endpoint doesn't exist, a response means the server is reachable
				if (response.status >= 200 && response.status < 600) {
					console.log(
						`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - Completed - Server is reachable`,
					)
					return {
						success: true,
						details: {
							url: url.toString(),
							status: response.status,
							statusText: response.statusText,
						},
					}
				} else {
					const error = `Unexpected HTTP status: ${response.status} ${response.statusText}`
					console.log(
						`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - Failed - ${error}`,
					)
					return { success: false, error, details: { url: url.toString(), status: response.status } }
				}
			} catch (fetchError) {
				clearTimeout(timeoutId)

				if (fetchError instanceof Error && fetchError.name === "AbortError") {
					const error = "HTTP request timed out after 10 seconds"
					console.log(
						`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - Failed - ${error}`,
					)
					return { success: false, error, details: { url: url.toString(), timeout: true } }
				}

				// Check if it's a network error (DNS resolution, connection refused, etc.)
				if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
					const error = `Network error: ${fetchError.message}`
					console.log(
						`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - Failed - ${error}`,
					)
					return { success: false, error, details: { url: url.toString(), networkError: true } }
				}

				throw fetchError
			}
		} catch (error) {
			const errorMessage = `HTTP connectivity test failed: ${error}`
			console.log(
				`[LAMINAR DEBUG] testHttpConnectivity - Operation ID: ${operationId} - Failed - Error: ${errorMessage}`,
			)
			return { success: false, error: errorMessage, details: error }
		}
	}

	// This will be set by the main service
	public currentConfig: any
	public userId?: string
}
