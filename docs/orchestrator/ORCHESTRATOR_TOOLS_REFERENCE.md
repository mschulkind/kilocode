# Orchestrator Tools Reference

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

- *Purpose:*\* This document provides a comprehensive reference for the core tools available to the
  Kilo Code Orchestrator. Each entry details the tool's purpose, parameters, and provides a link to
  its source implementation.

> **Cartography Fun Fact**: This documentation is like a map - it shows you where you are, where you
> can go, and how to get there without getting lost! 🗺️

<details>
<summary>Table of Contents</summary>
- [1. Related Documents](#related-documents)
- [2. Tool Philosophy](#tool-philosophy)
- [3. Core Task Flow Tools](#core-task-flow-tools)
- [4. Task Management Tools](#task-management-tools)
- [5. User Interaction Tools](#user-interaction-tools)
- [6. State & Planning Tools](#state--planning-tools)
- [7. File System Tools](#file-system-tools)
- [8. Navigation Footer](#navigation-footer)

</details>
- \*\*

### Related Documents

<a id="related-documents"></a>

- **[Orchestrator Master Index](../orchestrator/ORCHESTRATOR_INDEX.md)**: The master index for all
orchestrator
  documentation.
- **[Security & Governance](ORCHESTRATOR_SECURITY_GOVERNANCE.md)**: Explains how tool
  access is governed by modes and permissions.
- **[Extensibility Guide](ORCHESTRATOR_EXTENSIBILITY.md)**: Describes how to add new
  custom tools to the system.

[Back to Top](#orchestrator-tools-reference)
- \*\*

### Tool Philosophy

<a id="tool-philosophy"></a>

Tools are the fundamental actions the orchestrator can perform. They are designed to be:

- **Atomic**: Each tool performs a single, well-defined operation.

- **Declarative**: Tools are invoked via a clear, XML-based syntax that the model generates.

- **Permissioned**: Most tools are only available in specific modes, ensuring a separation of
  concerns and enhancing security.
- \*\*

### Core Task Flow Tools

<a id="core-task-flow-tools"></a>

These tools are fundamental to the execution and completion of tasks.

#### `attemptCompletionTool`

- **Purpose**: Signals the successful completion of a task. This is a terminal operation that ends
  the task lifecycle.

- **Source**:
[`src/core/tools/attemptCompletionTool.ts`](../../src/core/tools/attemptCompletionTool.ts#L35)

- **Parameters**:
- `result`: A final message summarizing the work done.
- \*\*

### Task Management Tools

<a id="task-management-tools"></a>

These tools control the flow of execution, manage modes, and delegate work.

#### `newTaskTool`

- **Purpose**: Creates a new, independent task that runs asynchronously. This is a "fire-and-forget"
  operation; the parent task does not wait for the new task to complete.
- **Source**: [`src/core/tools/newTaskTool.ts`](../../src/core/tools/attemptCompletionTool.ts#L14)
- **Parameters**:
- `mode`: The mode in which to start the new task.
- `message`: The initial user message or instructions for the new task.

#### `switchModeTool`

- **Purpose**: Changes the active operational mode of the current task. This alters the set of
  available tools and permissions.
- **Source**: [`src/core/tools/switchModeTool.ts`](../../src/core/tools/attemptCompletionTool.ts#L8)
- **Parameters**:
- `mode_slug`: The slug of the mode to switch to (e.g., "code", "architect").
- `reason`: An optional explanation for why the mode switch is necessary.

#### `startSubtask` / `completeSubtask`

- **Purpose**: Manages the delegation of work to a synchronous, blocking subtask. See
  [Task Delegation Guide](ORCHESTRATOR_TASK_DELEGATION.md) for a detailed explanation.

- **Source**: [`startSubtask`](../../src/core/tools/attemptCompletionTool.ts#L1628),
  [`completeSubtask`](../../src/core/tools/attemptCompletionTool.ts#L1669)
- \*\*

### User Interaction Tools

<a id="user-interaction-tools"></a>

This category includes tools for communicating with the end-user.

#### `askFollowupQuestionTool`

- **Purpose**: Pauses the task and asks the user for clarification or additional information. The
  task will not proceed until the user provides a response.

- **Source**:
[`src/core/tools/askFollowupQuestionTool.ts`](../../src/core/tools/attemptCompletionTool.ts#L6)

- **Parameters**:
- `question`: The question to ask the user.
- `follow_up`: A list of suggested, actionable answers.
- \*\*

### State & Planning Tools

<a id="state-planning-tools"></a>

Tools for managing the internal state and plan of a task.

#### `updateTodoListTool`

- **Purpose**: Creates or overwrites the task's todo list. This is the primary mechanism for "Todo
  Gating," where the orchestrator tracks its plan and progress.

- **Source**:
[`src/core/tools/updateTodoListTool.ts`](../../src/core/tools/attemptCompletionTool.ts#L156)

- **Parameters**:
- `todos`: A markdown-formatted checklist of tasks.
- \*\*

### File System Tools

<a id="file-system-tools"></a>

A suite of tools for interacting with the file system. These are typically restricted to specific
modes like `code`.

- **`read_file`**: Reads the content of one or more files.

- **`write_to_file`**: Creates a new file or completely overwrites an existing one.

- **`apply_diff`**: Applies a surgical change to a file using a search/replace block.

- **`insert_content`**: Inserts new content at a specific line in a file.

- **`list_files`**: Lists the files and directories within a given path.

- **`search_files`**: Performs a regex search across files in a directory.
- \*\*

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

- *Understanding This System:*\*

- **Next**: Check related documentation in the same directory

- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Architecture Documentation](../architecture/README.md) for context

- *Implementing Features:*\*

- **Next**: [Repository Development Guide](../architecture/GETTING_STARTED.md) →
  [Testing Infrastructure](../testing/TESTING_STRATEGY.md)

- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

- *Troubleshooting Issues:*\*

- **Next**: [Race Condition Analysis](../architecture/README.md) →
  [Root Cause Analysis](../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md)

- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to the appropriate README for guidance.

### Navigation Footer

<a id="navigation-footer"></a>

You have reached the end of the tools reference. Return to the [Master
Index](../orchestrator/ORCHESTRATOR_INDEX.md)
or proceed to the [Error Handling Document](ORCHESTRATOR_ERROR_HANDLING.md).

[Back to Top](#orchestrator-tools-reference)
- \*\*

End of document.
- \*\*

- *Navigation*\*: [docs](../) · [orchestrator](../orchestrator/) ·
  [↑ Table of Contents](#orchestrator-tools-reference)
