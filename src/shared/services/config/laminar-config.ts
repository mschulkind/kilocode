import * as vscode from "vscode"

// Laminar configuration - supports VS Code settings with fallback to environment variables
const configLoadId = `laminar-config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
console.log(`[${new Date().toISOString()}] [${configLoadId}] Starting laminar configuration loading`)

export interface LaminarSettings {
	apiKey: string
	baseUrl: string
	httpPort: number
	grpcPort: number
	recordIO: boolean
	enabled: boolean
}

const loadLaminarConfig = (): LaminarSettings => {
	// Load from VS Code settings first
	const vscodeSettings = vscode.workspace.getConfiguration("kilo-code.laminar")

	// Debug: Log all VS Code settings
	console.log(`[${new Date().toISOString()}] [laminar-config] VS Code settings dump:`, {
		apiKey: vscodeSettings.get<string>("apiKey"),
		baseUrl: vscodeSettings.get<string>("baseUrl"),
		httpPort: vscodeSettings.get<number>("httpPort"),
		grpcPort: vscodeSettings.get<number>("grpcPort"),
		recordIO: vscodeSettings.get<boolean>("recordIO"),
		enabled: vscodeSettings.get<boolean>("enabled"),
	})

	// Fallback to environment variables
	const apiKey: string = vscodeSettings.get<string>("apiKey") || process.env.LMNR_API_KEY || ""
	const baseUrl: string = vscodeSettings.get<string>("baseUrl") || process.env.LMNR_BASE_URL || "https://api.lmnr.ai"
	const httpPort: number = vscodeSettings.get<number>("httpPort") || parseInt(process.env.LMNR_HTTP_PORT || "443", 10)
	const grpcPort: number =
		vscodeSettings.get<number>("grpcPort") || parseInt(process.env.LMNR_GRPC_PORT || "8443", 10)
	const recordIO: boolean = vscodeSettings.get<boolean>("recordIO") ?? process.env.LMNR_RECORD_IO !== "false"
	const enabled: boolean = vscodeSettings.get<boolean>("enabled") ?? process.env.LMNR_ENABLED !== "false"

	console.log(
		`[${new Date().toISOString()}] [${configLoadId}] Reading LMNR_API_KEY: ${apiKey ? `"${apiKey.substring(0, 8)}..."` : 'undefined (using default "")'} -> "${apiKey ? apiKey.substring(0, 8) + "..." : ""}"`,
	)
	console.log(`[${new Date().toISOString()}] [${configLoadId}] Reading LMNR_BASE_URL: ${baseUrl} -> "${baseUrl}"`)
	console.log(`[${new Date().toISOString()}] [${configLoadId}] Reading LMNR_HTTP_PORT: ${httpPort} -> ${httpPort}`)
	console.log(`[${new Date().toISOString()}] [${configLoadId}] Reading LMNR_GRPC_PORT: ${grpcPort} -> ${grpcPort}`)
	console.log(`[${new Date().toISOString()}] [${configLoadId}] Reading LMNR_RECORD_IO: ${recordIO} -> ${recordIO}`)
	console.log(`[${new Date().toISOString()}] [${configLoadId}] Reading LMNR_ENABLED: ${enabled} -> ${enabled}`)

	return { apiKey, baseUrl, httpPort, grpcPort, recordIO, enabled }
}

export const laminarConfig = (() => {
	const cfg = loadLaminarConfig()
	console.log(`[${new Date().toISOString()}] [${configLoadId}] Laminar configuration object created:`, {
		...cfg,
		apiKey: cfg.apiKey ? cfg.apiKey.substring(0, 8) + "..." : "",
	})
	return cfg
})()

// Function to reload configuration (useful when settings change)
export const reloadLaminarConfig = (): LaminarSettings => {
	const newConfig = loadLaminarConfig()
	console.log(`[${new Date().toISOString()}] Laminar configuration reloaded:`, {
		...newConfig,
		apiKey: newConfig.apiKey ? newConfig.apiKey.substring(0, 8) + "..." : "",
	})
	return newConfig
}
