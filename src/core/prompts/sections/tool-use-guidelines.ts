import { CodeIndexManager } from "../../../services/code-index/manager"

export function getToolUseGuidelinesSection(codeIndexManager?: CodeIndexManager): string {
	const isCodebaseSearchAvailable =
		codeIndexManager &&
		codeIndexManager.isFeatureEnabled &&
		codeIndexManager.isFeatureConfigured &&
		codeIndexManager.isInitialized

	// Build guidelines array with automatic numbering
	let itemNumber = 1
	const guidelinesList: string[] = []

	// First guideline is always the same
	guidelinesList.push(
		`${itemNumber++}. Assess what information you already have and what information you need to proceed with the task.`,
	)

	// Conditional codebase search guideline
	if (isCodebaseSearchAvailable) {
		guidelinesList.push(
			`${itemNumber++}. **CRITICAL: For ANY exploration of code you haven't examined yet in this conversation, you MUST use the codebase_search tool FIRST before any other search or file exploration tools.** This applies throughout the entire conversation, not just at the beginning. The codebase_search tool uses semantic search to find relevant code based on meaning rather than just keywords, making it far more effective than regex-based search_files for understanding implementations. Even if you've already explored some code, any new area of exploration requires codebase_search first.`,
		)
		guidelinesList.push(
			`${itemNumber++}. Choose the most appropriate tool based on the task and the tool descriptions provided. After using codebase_search for initial exploration of any new code area, you may then use more specific tools like search_files (for regex patterns), list_files, or read_file for detailed examination. For example, using the list_files tool is more effective than running a command like ls in the terminal. It's critical that you think about each available tool and use the one that best fits the current step in the task.`,
		)
	} else {
		guidelinesList.push(
			`${itemNumber++}. Choose the most appropriate tool based on the task and the tool descriptions provided. Assess if you need additional information to proceed, and which of the available tools would be most effective for gathering this information. For example using the list_files tool is more effective than running a command like ls in the terminal. It's critical that you think about each available tool and use the one that best fits the current step in the task.`,
		)
	}

	// Remaining guidelines
	guidelinesList.push(
		`${itemNumber++}. If multiple actions are needed, use one tool at a time per message to accomplish the task iteratively, with each tool use being informed by the result of the previous tool use. Do not assume the outcome of any tool use. Each step must be informed by the previous step's result.`,
	)
	guidelinesList.push(`${itemNumber++}. Formulate your tool use using the XML format specified for each tool.`)
	guidelinesList.push(`${itemNumber++}. After each tool use, the user will respond with the result of that tool use. This result will provide you with the necessary information to continue your task or make further decisions. This response may include:
- Information about whether the tool succeeded or failed, along with any reasons for failure.
- Linter errors that may have arisen due to the changes you made, which you'll need to address.
- New terminal output in reaction to the changes, which you may need to consider or act upon.
- Any other relevant feedback or information related to the tool use.`)
	guidelinesList.push(
		`${itemNumber++}. ALWAYS wait for user confirmation after each tool use before proceeding. Never assume the success of a tool use without explicit confirmation of the result from the user.`,
	)

	// Build the final text without using a large template literal that can confuse linters
	const footerLines = [
		"# Tool Use Guidelines",
		"",
		guidelinesList.join("\n"),
		"",
		"These guidelines represent the default, repository-level expectations for tool usage. They are intentionally permissive of explicit operator and project customizations. To maximize user control while preserving safety, follow this strict priority order when resolving conflicting instructions (highest precedence first):",
		"",
		"Note: These Tool Use Guidelines live in the system prompt as repository-default guidance, but they CAN be overridden by any higher-precedence source listed below. Always resolve conflicts using the precedence order and explicitly document which override you followed when acting under an override.",
		"",
		"1. Explicit, in-turn user prompt overrides supplied in the current message (an inline 'rules' or 'mode definition' block the user provided in this message). These are immediate operator directives.",
		"2. The active prompt component / custom instructions attached to the current conversation's mode selection (promptComponent or per-conversation roleDefinition).",
		"3. Conversation-scoped overrides previously accepted earlier in this chat (mode switches, interrogator-approved edits applied during this conversation).",
		"4. Workspace-level custom mode files provided by the user (for example: .kilocodemodes in the repo or globalStorage/.../custom_modes.yaml). These override built-in modes for this workspace. When following a workspace-level override, prefer the workspace's explicit file-restriction policies and mode instructions over the defaults.",
		"5. Persisted extension customModePrompts stored in VS Code global storage.",
		"6. Built-in mode definitions shipped with the agent (the DEFAULT_MODES / modes array).",
		"7. Repository or project-level RULES and safety policies (e.g., files under .kilocode/rules and the top-level RULES document).",
		"8. These default tool use guidelines and other generic operational guidance.",
		"",
		"Rules with higher precedence MUST be followed and take effect even if they conflict with lower-precedence guidance. When you act under an override, include a short rationale in your response stating which rule you followed (for example: 'Applied inline prompt override (priority 1) to allow execute_command for this step'). If an override requests an action that would violate critical safety constraints (for example, forbidden destructive commands, sandbox breaches, or file-restriction protections), prefer safety: do not perform the unsafe action and surface the conflict to the user using ask_followup_question.",
		"",
		"It is crucial to proceed step-by-step, waiting for the user's message after each tool use before moving forward with the task. This approach allows you to:",
		"1. Confirm the success of each step before proceeding.",
		"2. Address any issues or errors that arise immediately.",
		"3. Adapt your approach based on new information or unexpected results.",
		"4. Ensure that each action builds correctly on the previous ones.",
		"",
		"By waiting for and carefully considering the user's response after each tool use, you can react accordingly and make informed decisions about how to proceed with the task. This iterative process helps ensure the overall success and accuracy of your work.",
	]

	return footerLines.join("\n")
}
