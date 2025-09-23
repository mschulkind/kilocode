import React, { useState, useCallback } from "react"
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { VSCodeTextField, VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { SetCachedStateField } from "./types"
import { cn } from "@src/lib/utils"
import { vscode } from "@src/utils/vscode"

export interface LaminarSettingsData {
	apiKey?: string
	baseUrl?: string
	httpPort?: number
	grpcPort?: number
	recordIO?: boolean
	enabled?: boolean
}

interface LaminarSettingsProps {
	laminarSettings?: LaminarSettingsData
	setCachedStateField: SetCachedStateField<"laminarSettings">
}

type TestStatus = "idle" | "testing" | "success" | "error"

export const LaminarSettings = ({ laminarSettings, setCachedStateField }: LaminarSettingsProps) => {
	const { t } = useAppTranslation()
	const [showApiKey, setShowApiKey] = useState(false)
	const [testStatus, setTestStatus] = useState<TestStatus>("idle")
	const [testMessage, setTestMessage] = useState<string>("")

	// Use local state for form fields to ensure immediate updates
	const [localApiKey, setLocalApiKey] = useState("")
	const [localBaseUrl, setLocalBaseUrl] = useState("https://api.lmnr.ai")
	const [localHttpPort, setLocalHttpPort] = useState(443)
	const [localGrpcPort, setLocalGrpcPort] = useState(8443)
	const [localRecordIO, setLocalRecordIO] = useState(true)

	const {
		apiKey = "",
		baseUrl = "https://api.lmnr.ai",
		httpPort = 443,
		grpcPort = 8443,
		recordIO = true,
		enabled = true,
	} = laminarSettings || {}

	// Sync local state with props when they change
	React.useEffect(() => {
		setLocalApiKey(apiKey)
		setLocalBaseUrl(baseUrl)
		setLocalHttpPort(httpPort)
		setLocalGrpcPort(grpcPort)
		setLocalRecordIO(recordIO)
	}, [apiKey, baseUrl, httpPort, grpcPort, recordIO])

	const updateField = useCallback(
		(field: keyof LaminarSettingsData, value: any) => {
			setCachedStateField("laminarSettings", {
				...laminarSettings,
				[field]: value,
			})
		},
		[laminarSettings, setCachedStateField],
	)

	const handleTestConnection = useCallback(async () => {
		setTestStatus("testing")
		setTestMessage("")

		try {
			// Send test connection request to the extension with current form values
			const response = await new Promise<{
				success: boolean
				error?: string
				details?: any
			}>((resolve) => {
				const handleMessage = (event: MessageEvent) => {
					const message = event.data
					if (message.type === "laminarConnectionTestResult") {
						window.removeEventListener("message", handleMessage)
						resolve({
							success: message.success,
							error: message.error,
							details: message.details,
						})
					}
				}

				window.addEventListener("message", handleMessage)

				// Send the test request with current settings
				const testValues = {
					apiKey: localApiKey,
					baseUrl: localBaseUrl,
					httpPort: localHttpPort,
					grpcPort: localGrpcPort,
					recordIO: localRecordIO,
					enabled,
				}
				console.log("[LAMINAR DEBUG] Sending test connection values:", {
					...testValues,
					apiKey: testValues.apiKey ? testValues.apiKey.substring(0, 8) + "..." : "undefined",
					apiKeyLength: testValues.apiKey ? testValues.apiKey.length : 0,
					apiKeyType: typeof testValues.apiKey,
					rawApiKey: testValues.apiKey,
					baseUrl: testValues.baseUrl,
					httpPort: testValues.httpPort,
					grpcPort: testValues.grpcPort,
					recordIO: testValues.recordIO,
					enabled: testValues.enabled,
				})

				// Also log the raw values separately for debugging
				console.log("[LAMINAR DEBUG] Raw test values being sent:", testValues)
				console.log("[LAMINAR DEBUG] Local state values:", {
					localApiKey,
					localBaseUrl,
					localHttpPort,
					localGrpcPort,
					localRecordIO,
					enabled,
				})
				vscode.postMessage({
					type: "testLaminarConnection",
					values: testValues,
				})
			})

			console.log("[LAMINAR DEBUG] Test connection response received:", {
				success: response.success,
				error: response.error,
				details: response.details,
				fullResponse: response,
			})

			if (response.success) {
				setTestStatus("success")
				const httpStatus = response.details?.httpConnectivity?.success ? "✓" : "✗"
				const grpcStatus = response.details?.grpcConnectivity?.success ? "✓" : "✗"
				setTestMessage(
					`Connection successful — ${response.details?.baseUrl}:${response.details?.httpPort} (HTTP: ${httpStatus}, gRPC: ${grpcStatus})`,
				)
			} else {
				setTestStatus("error")
				setTestMessage(response.error || "Connection failed")
			}
		} catch (error) {
			setTestStatus("error")
			setTestMessage(`Test failed: ${error}`)
		}
	}, [enabled, localApiKey, localBaseUrl, localGrpcPort, localHttpPort, localRecordIO])

	const validateUrl = (url: string): boolean => {
		try {
			new URL(url)
			return true
		} catch {
			return false
		}
	}

	const validatePort = (port: number): boolean => {
		return port >= 1 && port <= 65535
	}

	return (
		<div className="space-y-4">
			{/* Configuration Section - Only show when experimental feature is enabled */}
			{enabled && (
				<div className="space-y-4 pl-4 border-l-2 border-vscode-panel-border">
					{/* API Key Input */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-vscode-foreground">
							{t("settings:laminar.apiKey.label")}
						</label>
						<div className="relative">
							<VSCodeTextField
								type={showApiKey ? "text" : "password"}
								value={localApiKey}
								placeholder={t("settings:laminar.apiKey.placeholder")}
								onInput={(e: any) => {
									const value = e.target.value || ""
									console.log("[LAMINAR DEBUG] API Key input:", {
										oldLength: localApiKey.length,
										newLength: value.length,
										newValue: value.substring(0, 8) + "...",
									})
									setLocalApiKey(value)
									updateField("apiKey", value)
								}}
								onChange={(e: any) => {
									const value = e.target.value || ""
									console.log("[LAMINAR DEBUG] API Key changed:", {
										oldLength: localApiKey.length,
										newLength: value.length,
										newValue: value.substring(0, 8) + "...",
									})
									setLocalApiKey(value)
									updateField("apiKey", value)
								}}
								className="w-full pr-10"
							/>
							<button
								type="button"
								className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-vscode-button-hoverBackground rounded"
								onClick={() => setShowApiKey(!showApiKey)}>
								{showApiKey ? (
									<EyeOff className="w-4 h-4 text-vscode-foreground" />
								) : (
									<Eye className="w-4 h-4 text-vscode-foreground" />
								)}
							</button>
						</div>
						<p className="text-xs text-vscode-descriptionForeground">
							{t("settings:laminar.apiKey.description")}
						</p>
					</div>

					{/* Base URL Input */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-vscode-foreground">
							{t("settings:laminar.baseUrl.label")}
						</label>
						<VSCodeTextField
							type="text"
							value={localBaseUrl}
							placeholder={t("settings:laminar.baseUrl.placeholder")}
							onChange={(e: any) => {
								const value = e.target.value || ""
								console.log("[LAMINAR DEBUG] Base URL changed:", {
									oldValue: localBaseUrl,
									newValue: value,
								})
								setLocalBaseUrl(value)
								updateField("baseUrl", value)
							}}
							className={cn("w-full", localBaseUrl && !validateUrl(localBaseUrl) && "border-red-500")}
						/>
						{localBaseUrl && !validateUrl(localBaseUrl) && (
							<p className="text-xs text-red-500">{t("settings:laminar.baseUrl.invalidFormat")}</p>
						)}
						<p className="text-xs text-vscode-descriptionForeground">
							{t("settings:laminar.baseUrl.description")}
						</p>
					</div>

					{/* Port Configuration */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-vscode-foreground">
								{t("settings:laminar.httpPort.label")}
							</label>
							<VSCodeTextField
								value={localHttpPort.toString()}
								onChange={(e: any) => {
									const value = parseInt(e.target.value || "443", 10)
									setLocalHttpPort(value)
									updateField("httpPort", value)
								}}
								className={cn(
									"w-full",
									localHttpPort && !validatePort(localHttpPort) && "border-red-500",
								)}
							/>
							{localHttpPort && !validatePort(localHttpPort) && (
								<p className="text-xs text-red-500">{t("settings:laminar.httpPort.invalidRange")}</p>
							)}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-vscode-foreground">
								{t("settings:laminar.grpcPort.label")}
							</label>
							<VSCodeTextField
								value={localGrpcPort.toString()}
								onChange={(e: any) => {
									const value = parseInt(e.target.value || "8443", 10)
									setLocalGrpcPort(value)
									updateField("grpcPort", value)
								}}
								className={cn(
									"w-full",
									localGrpcPort && !validatePort(localGrpcPort) && "border-red-500",
								)}
							/>
							{localGrpcPort && !validatePort(localGrpcPort) && (
								<p className="text-xs text-red-500">{t("settings:laminar.grpcPort.invalidRange")}</p>
							)}
						</div>
					</div>

					{/* Record I/O Toggle */}
					<div className="flex items-center justify-between">
						<div>
							<label className="text-sm font-medium text-vscode-foreground">
								{t("settings:laminar.recordIO.label")}
							</label>
							<p className="text-xs text-vscode-descriptionForeground mt-1">
								{t("settings:laminar.recordIO.description")}
							</p>
						</div>
						<VSCodeButton
							appearance={localRecordIO ? "primary" : "secondary"}
							onClick={() => {
								const newValue = !localRecordIO
								setLocalRecordIO(newValue)
								updateField("recordIO", newValue)
							}}>
							{localRecordIO ? t("settings:common.enabled") : t("settings:common.disabled")}
						</VSCodeButton>
					</div>

					{/* Test Connection Status and Button */}
					<div className="space-y-3">
						{/* Status Text */}
						<div className="text-sm">
							{testStatus === "idle" && (
								<p className="text-vscode-descriptionForeground">Ready to test connection</p>
							)}
							{testStatus === "testing" && (
								<p className="text-blue-400 flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									Testing connection...
								</p>
							)}
							{testStatus === "success" && (
								<p className="text-green-400 flex items-center gap-2">
									<CheckCircle className="w-4 h-4" />
									Connection successful
								</p>
							)}
							{testStatus === "error" && (
								<p className="text-red-400 flex items-center gap-2">
									<XCircle className="w-4 h-4" />
									Connection failed
								</p>
							)}
						</div>

						{/* Test Connection Button */}
						<VSCodeButton
							appearance="secondary"
							onClick={handleTestConnection}
							disabled={testStatus === "testing" || !localApiKey?.trim() || !localBaseUrl?.trim()}
							className="w-full">
							{t("settings:laminar.testConnection.label")}
						</VSCodeButton>

						{/* Detailed Message */}
						{testMessage && (
							<div
								className={cn(
									"p-3 rounded text-sm",
									testStatus === "success" &&
										"bg-green-900/20 text-green-400 border border-green-800",
									testStatus === "error" && "bg-red-900/20 text-red-400 border border-red-800",
								)}>
								{testMessage}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
