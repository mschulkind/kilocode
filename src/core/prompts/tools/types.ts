import { DiffStrategy } from "../../../shared/tools.js"
import { McpHub } from "../../../services/mcp/McpHub.js"
import { Experiments } from "@roo-code/types"

export type ToolArgs = {
	cwd: string
	supportsComputerUse: boolean
	diffStrategy?: DiffStrategy
	browserViewportSize?: string
	mcpHub?: McpHub
	toolOptions?: any
	partialReadsEnabled?: boolean
	settings?: Record<string, any>
	experiments?: Partial<Experiments>
}
