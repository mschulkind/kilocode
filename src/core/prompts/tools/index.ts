import type { ToolName, ModeConfig } from "@roo-code/types"

import { TOOL_GROUPS, ALWAYS_AVAILABLE_TOOLS, DiffStrategy } from "../../../shared/tools.js"
import { McpHub } from "../../../services/mcp/McpHub.js"
import { Mode, getModeConfig, isToolAllowedForMode, getGroupName } from "../../../shared/modes.js"

import { ToolArgs } from "./types.js"
import { getExecuteCommandDescription } from "./execute-command.js"
import { getReadFileDescription } from "./read-file.js"
import { getSimpleReadFileDescription } from "./simple-read-file.js"
import { getFetchInstructionsDescription } from "./fetch-instructions.js"
import { shouldUseSingleFileRead } from "@roo-code/types"
import { getWriteToFileDescription } from "./write-to-file.js"
import { getSearchFilesDescription } from "./search-files.js"
import { getListFilesDescription } from "./list-files.js"
import { getInsertContentDescription } from "./insert-content.js"
import { getSearchAndReplaceDescription } from "./search-and-replace.js"
import { getListCodeDefinitionNamesDescription } from "./list-code-definition-names.js"
import { getBrowserActionDescription } from "./browser-action.js"
import { getAskFollowupQuestionDescription } from "./ask-followup-question.js"
import { getAttemptCompletionDescription } from "./attempt-completion.js"
import { getUseMcpToolDescription } from "./use-mcp-tool.js"
import { getAccessMcpResourceDescription } from "./access-mcp-resource.js"
import { getSwitchModeDescription } from "./switch-mode.js"
import { getNewTaskDescription } from "./new-task.js"
import { getCodebaseSearchDescription } from "./codebase-search.js"
import { getUpdateTodoListDescription } from "./update-todo-list.js"
import { getRunSlashCommandDescription } from "./run-slash-command.js"
import { getGenerateImageDescription } from "./generate-image.js"
import { CodeIndexManager } from "../../../services/code-index/manager.js"
import { isMorphAvailable } from "../../tools/editFileTool.js"

// kilocode_change start: Morph fast apply
import { getEditFileDescription } from "./edit-file.js"
import { type ClineProviderState } from "../../webview/ClineProvider.js"
// kilocode_change end

// Map of tool names to their description functions
const toolDescriptionMap: Record<string, (args: ToolArgs) => string | undefined> = {
	execute_command: (args) => getExecuteCommandDescription(args),
	read_file: (args) => {
		// Check if the current model should use the simplified read_file tool
		const modelId = args.settings?.modelId
		if (modelId && shouldUseSingleFileRead(modelId)) {
			return getSimpleReadFileDescription(args)
		}
		return getReadFileDescription(args)
	},
	fetch_instructions: (args) => getFetchInstructionsDescription(args.settings?.enableMcpServerCreation),
	write_to_file: (args) => getWriteToFileDescription(args),
	search_files: (args) => getSearchFilesDescription(args),
	list_files: (args) => getListFilesDescription(args),
	list_code_definition_names: (args) => getListCodeDefinitionNamesDescription(args),
	browser_action: (args) => getBrowserActionDescription(args),
	ask_followup_question: () => getAskFollowupQuestionDescription(),
	attempt_completion: (args) => getAttemptCompletionDescription(args),
	use_mcp_tool: (args) => getUseMcpToolDescription(args),
	access_mcp_resource: (args) => getAccessMcpResourceDescription(args),
	codebase_search: (args) => getCodebaseSearchDescription(args),
	switch_mode: () => getSwitchModeDescription(),
	new_task: (args) => getNewTaskDescription(args),
	insert_content: (args) => getInsertContentDescription(args),
	search_and_replace: (args) => getSearchAndReplaceDescription(args),
	edit_file: () => getEditFileDescription(), // kilocode_change: Morph fast apply
	apply_diff: (args) =>
		args.diffStrategy ? args.diffStrategy.getToolDescription({ cwd: args.cwd, toolOptions: args.toolOptions }) : "",
	update_todo_list: (args) => getUpdateTodoListDescription(args),
	run_slash_command: () => getRunSlashCommandDescription(),
	generate_image: (args) => getGenerateImageDescription(args),
}

export function getToolDescriptionsForMode(
	mode: Mode,
	cwd: string,
	supportsComputerUse: boolean,
	codeIndexManager?: CodeIndexManager,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	mcpHub?: McpHub,
	customModes?: ModeConfig[],
	experiments?: Record<string, boolean>,
	partialReadsEnabled?: boolean,
	settings?: Record<string, any>,
	enableMcpServerCreation?: boolean,
	modelId?: string,
	clineProviderState?: ClineProviderState, // kilocode_change
): string {
	const config = getModeConfig(mode, customModes)
	const args: ToolArgs = {
		cwd,
		supportsComputerUse,
		diffStrategy,
		browserViewportSize,
		mcpHub,
		partialReadsEnabled,
		settings: {
			...settings,
			enableMcpServerCreation,
			modelId,
		},
		experiments,
	}

	const tools = new Set<string>()

	// Add tools from mode's groups
	config.groups.forEach((groupEntry) => {
		const groupName = getGroupName(groupEntry)
		const toolGroup = TOOL_GROUPS[groupName]
		if (toolGroup) {
			toolGroup.tools.forEach((tool) => {
				if (
					isToolAllowedForMode(
						tool as ToolName,
						mode,
						customModes ?? [],
						undefined,
						undefined,
						experiments ?? {},
					)
				) {
					tools.add(tool)
				}
			})
		}
	})

	// Add always available tools
	ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool))

	// Conditionally exclude codebase_search if feature is disabled or not configured
	if (
		!codeIndexManager ||
		!(codeIndexManager.isFeatureEnabled && codeIndexManager.isFeatureConfigured && codeIndexManager.isInitialized)
	) {
		tools.delete("codebase_search")
	}

	// kilocode_change start: Morph fast apply
	if (isMorphAvailable(clineProviderState)) {
		// When Morph is enabled, disable traditional editing tools
		const traditionalEditingTools = ["apply_diff", "write_to_file", "insert_content", "search_and_replace"]
		traditionalEditingTools.forEach((tool) => tools.delete(tool))
	} else {
		tools.delete("edit_file")
	}
	// kilocode_change end

	// Conditionally exclude update_todo_list if disabled in settings
	if (settings?.todoListEnabled === false) {
		tools.delete("update_todo_list")
	}

	// Conditionally exclude generate_image if experiment is not enabled
	if (!experiments?.imageGeneration) {
		tools.delete("generate_image")
	}

	// Conditionally exclude run_slash_command if experiment is not enabled
	if (!experiments?.runSlashCommand) {
		tools.delete("run_slash_command")
	}

	// Map tool descriptions for allowed tools
	const descriptions = Array.from(tools).map((toolName) => {
		const descriptionFn = toolDescriptionMap[toolName]
		if (!descriptionFn) {
			return undefined
		}

		return descriptionFn({
			...args,
			toolOptions: undefined, // No tool options in group-based approach
		})
	})

	return `# Tools\n\n${descriptions.filter(Boolean).join("\n\n")}`
}

// Export individual description functions for backward compatibility
export {
	getExecuteCommandDescription,
	getReadFileDescription,
	getSimpleReadFileDescription,
	getFetchInstructionsDescription,
	getWriteToFileDescription,
	getSearchFilesDescription,
	getListFilesDescription,
	getListCodeDefinitionNamesDescription,
	getBrowserActionDescription,
	getAskFollowupQuestionDescription,
	getAttemptCompletionDescription,
	getUseMcpToolDescription,
	getAccessMcpResourceDescription,
	getSwitchModeDescription,
	getInsertContentDescription,
	getSearchAndReplaceDescription,
	getEditFileDescription, // kilocode_change: Morph fast apply
	getCodebaseSearchDescription,
	getRunSlashCommandDescription,
	getGenerateImageDescription,
}
