import * as vscode from "vscode"
import laminarService from "../../services/laminar/LaminarService"
import { Task } from "../task/Task"
import {
	ToolUse,
	AskApproval,
	HandleError,
	PushToolResult,
	RemoveClosingTag,
	ToolDescription,
	AskFinishSubTaskApproval,
} from "../../shared/tools"
import { formatResponse } from "../prompts/responses"
import { TelemetryService } from "@roo-code/telemetry"
import { RooCodeEventName, TodoItem } from "@roo-code/types"
import { Anthropic } from "@anthropic-ai/sdk"

// Minimal fallback for getClineMessageOptions to satisfy types while TS errors are resolved.
// This can be replaced with the canonical implementation if/when it is located.
async function getClineMessageOptions(
	_cline: Task,
): Promise<{ isNonInteractive?: boolean; metadata?: Record<string, unknown> }> {
	return {}
}

export async function attemptCompletionTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
	toolDescription: ToolDescription,
	askFinishSubTaskApproval: AskFinishSubTaskApproval,
) {
	const result: string | undefined = block.params.result
	const command: string | undefined = block.params.command

	// Generate unique identifier for this tool execution
	const toolExecutionId = `attempt_completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	const timestamp = new Date().toISOString()

	console.log(`[LAMINAR DEBUG] Tool execution started: ${toolExecutionId} at ${timestamp}`)
	console.log(`[LAMINAR DEBUG] Tool: attempt_completion, Input:`, {
		result: result?.substring(0, 100) + (result && result.length > 100 ? "..." : ""),
		command,
	})

	// Start tracing span for tool execution
	try {
		console.log(`[LAMINAR DEBUG] Starting span for tool execution: ${toolExecutionId}, Span params:`, {
			name: "attempt_completion",
			spanType: "TOOL",
			input: { result: result?.substring(0, 50) + (result && result.length > 50 ? "..." : ""), command },
		})
		laminarService.startSpan("TOOL", {
			name: "attempt_completion",
			spanType: "TOOL",
			sessionId: cline.rootTaskId || cline.taskId,
			input: { result, command },
		})
		console.log(`[LAMINAR DEBUG] Span started successfully for tool execution: ${toolExecutionId}`)
	} catch (e) {
		console.log(`[LAMINAR DEBUG] Error starting span for tool execution: ${toolExecutionId}`, e)
		// Ignore tracing errors to prevent interference with tool execution
	}

	// Get the setting for preventing completion with open todos from VSCode configuration
	const preventCompletionWithOpenTodos = vscode.workspace
		.getConfiguration("kilo-code")
		.get<boolean>("preventCompletionWithOpenTodos", false)

	// Check if there are incomplete todos (only if the setting is enabled)
	const hasIncompleteTodos = cline.todoList && cline.todoList.some((todo) => todo.status !== "completed")

	if (preventCompletionWithOpenTodos && hasIncompleteTodos) {
		cline.consecutiveMistakeCount++
		cline.recordToolError("attempt_completion")

		pushToolResult(
			formatResponse.toolError(
				"Cannot complete task while there are incomplete todos. Please finish all todos before attempting completion.",
			),
		)

		try {
			const endTimestamp = new Date().toISOString()
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: incomplete todos check - Task cannot complete with open todos`,
			)
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
			)
			laminarService.endSpan("tool")
			laminarService.endSpan("task.step")
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
			)
		} catch (e) {
			const errorTimestamp = new Date().toISOString()
			console.log(
				`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: incomplete todos check`,
				e,
			)
			// Ignore tracing errors
		}

		return
	}

	try {
		const lastMessage = cline.clineMessages.at(-1)

		if (block.partial) {
			if (command) {
				// the attempt_completion text is done, now we're getting command
				// remove the previous partial attempt_completion ask, replace with say, post state to webview, then stream command

				// const secondLastMessage = cline.clineMessages.at(-2)
				if (lastMessage && lastMessage.ask === "command") {
					// update command
					await cline.ask("command", removeClosingTag("command", command), block.partial).catch(() => {})
				} else {
					// last message is completion_result
					// we have command string, which means we have the result as well, so finish it (doesnt have to exist yet)
					await cline.say(
						"completion_result",
						removeClosingTag("result", result),
						undefined,
						false,
						undefined,
						undefined,
						await getClineMessageOptions(cline), // kilocode_change
					)

					TelemetryService.instance.captureTaskCompleted(cline.taskId)
					cline.emit(RooCodeEventName.TaskCompleted, cline.taskId, cline.getTokenUsage(), cline.toolUsage)

					await cline.ask("command", removeClosingTag("command", command), block.partial).catch(() => {})
				}
			} else {
				// No command, still outputting partial result
				await cline.say("completion_result", removeClosingTag("result", result), undefined, block.partial)
			}
			try {
				const endTimestamp = new Date().toISOString()
				console.log(
					`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: partial block - Processing partial completion result`,
				)
				console.log(
					`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
				)
				laminarService.endSpan("attempt_completion")
				laminarService.endSpan(`${cline.taskId}-task.step`)
				console.log(
					`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
				)
			} catch (e) {
				const errorTimestamp = new Date().toISOString()
				console.log(
					`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: partial block`,
					e,
				)
				// Ignore
			}
			return
		} else {
			if (!result) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("attempt_completion")
				pushToolResult(await cline.sayAndCreateMissingParamError("attempt_completion", "result"))
				try {
					const endTimestamp = new Date().toISOString()
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: missing result param - Required 'result' parameter not provided`,
					)
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
					)
					laminarService.endSpan("attempt_completion")
					laminarService.endSpan(`${cline.taskId}-task.step`)
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
					)
				} catch (e) {
					const errorTimestamp = new Date().toISOString()
					console.log(
						`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: missing result param`,
						e,
					)
					// Ignore
				}
				return
			}

			cline.consecutiveMistakeCount = 0

			// Command execution is permanently disabled in attempt_completion
			// Users must use execute_command tool separately before attempt_completion
			await cline.say(
				"completion_result",
				result,
				undefined,
				false,
				undefined,
				undefined,
				await getClineMessageOptions(cline), //kilocode_change
			)
			TelemetryService.instance.captureTaskCompleted(cline.taskId)
			cline.emit(RooCodeEventName.TaskCompleted, cline.taskId, cline.getTokenUsage(), cline.toolUsage)

			if (cline.parentTask) {
				const didApprove = await askFinishSubTaskApproval()

				if (!didApprove) {
					try {
						const endTimestamp = new Date().toISOString()
						console.log(
							`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: subtask approval not given - User declined to finish subtask`,
						)
						console.log(
							`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
						)
						laminarService.endSpan("attempt_completion")
						laminarService.endSpan(`${cline.taskId}-task.step`)
						console.log(
							`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
						)
					} catch (e) {
						const errorTimestamp = new Date().toISOString()
						console.log(
							`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: subtask approval not given`,
							e,
						)
						// Ignore
					}
					return
				}

				// tell the provider to remove the current subtask and resume the previous task in the stack
				await cline.providerRef.deref()?.finishSubTask(result)
				try {
					const endTimestamp = new Date().toISOString()
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: after finishing subtask - Subtask completed and parent task resumed`,
					)
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
					)
					laminarService.endSpan("tool")
					laminarService.endSpan("task.step")
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
					)
				} catch (e) {
					const errorTimestamp = new Date().toISOString()
					console.log(
						`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: after finishing subtask`,
						e,
					)
					// Ignore
				}
				return
			}

			// We already sent completion_result says, an
			// empty string asks relinquishes control over
			// button and field.
			const { response, text, images } = await cline.ask("completion_result", "", false)

			// Signals to recursive loop to stop (for now
			// cline never happens since yesButtonClicked
			// will trigger a new task).
			if (response === "yesButtonClicked") {
				pushToolResult("")
				try {
					const endTimestamp = new Date().toISOString()
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: yesButtonClicked - User confirmed task completion`,
					)
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
					)
					laminarService.endSpan("tool")
					laminarService.endSpan("task.step")
					console.log(
						`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
					)
				} catch (e) {
					const errorTimestamp = new Date().toISOString()
					console.log(
						`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: yesButtonClicked`,
						e,
					)
					// Ignore
				}
				return
			}

			await cline.say("user_feedback", text ?? "", images)
			const toolResults: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = []

			toolResults.push({
				type: "text",
				text: `The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.\n<feedback>\n${text}\n</feedback>`,
			})

			toolResults.push(...formatResponse.imageBlocks(images))
			cline.userMessageContent.push({ type: "text", text: `${toolDescription()} Result:` })
			cline.userMessageContent.push(...toolResults)

			try {
				const endTimestamp = new Date().toISOString()
				console.log(
					`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: user feedback - User provided feedback, task continuing`,
				)
				console.log(
					`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
				)
				laminarService.endSpan("tool")
				laminarService.endSpan("task.step")
				console.log(
					`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
				)
			} catch (e) {
				const errorTimestamp = new Date().toISOString()
				console.log(
					`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: user feedback`,
					e,
				)
				// Ignore
			}

			return
		}

		// End tracing spans on successful completion
		try {
			const endTimestamp = new Date().toISOString()
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: successful completion - Task completed successfully`,
			)
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
			)
			laminarService.endSpan("tool")
			laminarService.endSpan("task.step")
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
			)
		} catch (e) {
			const errorTimestamp = new Date().toISOString()
			console.log(
				`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: successful completion`,
				e,
			)
			// Ignore tracing errors
		}
	} catch (error) {
		// Record exception and end spans on error
		console.log(`[LAMINAR DEBUG] Error occurred during tool execution: ${toolExecutionId}`, error)
		console.log(`[LAMINAR DEBUG] Recording exception on span for tool execution: ${toolExecutionId}`)
		try {
			laminarService.recordExceptionOnSpan("attempt_completion", error)
			const endTimestamp = new Date().toISOString()
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Ending spans for tool execution: ${toolExecutionId} - Reason: error handling - Exception occurred during execution`,
			)
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Ending 'tool' span (attempt_completion tool execution) and 'task.step' span (current task step) for ${toolExecutionId}`,
			)
			laminarService.endSpan("tool")
			laminarService.endSpan("task.step")
			console.log(
				`[LAMINAR DEBUG] [${endTimestamp}] Spans ended successfully for tool execution: ${toolExecutionId} - 'tool' and 'task.step' spans properly closed`,
			)
		} catch (e) {
			const errorTimestamp = new Date().toISOString()
			console.log(
				`[LAMINAR DEBUG] [${errorTimestamp}] Error ending spans for tool execution: ${toolExecutionId} - Reason: error handling`,
				e,
			)
			// Ignore tracing errors
		}
		await handleError("inspecting site", error)
		return
	}

	console.log(`[LAMINAR DEBUG] Tool execution completed: ${toolExecutionId}`)
}
