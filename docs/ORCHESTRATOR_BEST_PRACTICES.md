# Orchestrator Best Practices

**Purpose:** This document provides guidelines and best practices for developers working with the Kilo Code Orchestrator. Following these practices will lead to more robust, predictable, and maintainable interactions with the system.

<details>
<summary>Table of Contents</summary>

- [1. Related Documents](#related-documents)
- [2. Prompt Engineering Best Practices](#prompt-engineering-best-practices)
- [3. Tool and Mode Development](#tool-and-mode-development)
- [4. Task Management and Delegation](#task-management-and-delegation)
- [5. Testing and Validation](#testing-and-validation)
- [6. Navigation Footer](#navigation-footer)

</details>

---

### 1. Related Documents

<a id="related-documents"></a>

- **[ORCHESTRATOR_INDEX.md](ORCHESTRATOR_INDEX.md)**: The master index for all orchestrator documentation.
- **[ORCHESTRATOR_EXTENSIBILITY.md](ORCHESTRATOR_EXTENSIBILITY.md)**: Provides the technical details for creating new tools and modes.
- **[docs/RULES_LOADING_SUMMARY.md](RULES_LOADING_SUMMARY.md)**: Explains how to define and use workspace-specific rules.

[Back to Top](#orchestrator-best-practices)

---

### 2. Prompt Engineering Best Practices

<a id="prompt-engineering-best-practices"></a>

The quality of the orchestrator's output is highly dependent on the quality of the input prompts.

- **Be Specific and Unambiguous**: Clearly state the goal of the task. Avoid vague language. Instead of "Fix the UI," say "In `src/components/MyComponent.tsx`, align the save button to the right of the cancel button."
- **Provide Context**: Include relevant file paths, code snippets, and error messages in the initial prompt. The more context the model has, the less it needs to discover on its own.
- **Leverage System Prompts**: Use the [`getSystemPrompt`](src/core/task/Task.ts:2499) function to its full potential. Ensure that all necessary rules, constraints, and formatting guidelines like [`markdownFormattingSection`](src/core/prompts/sections/markdown-formatting.ts:1) are included.
- **Iterate and Refine**: If a task does not perform as expected, analyze the conversation history. Often, a small tweak to the initial prompt or a custom rule can significantly improve performance.

[Back to Top](#orchestrator-best-practices)

---

### 3. Tool and Mode Development

<a id="tool-and-mode-development"></a>

When extending the system, adhere to these principles.

- **Keep Tools Atomic**: A tool should do one thing and do it well. Avoid creating monolithic tools that handle multiple distinct operations. For example, `read_file` and `write_to_file` are separate tools.
- **Provide Rich Error Feedback**: When a tool fails, it should return a descriptive error message. This is crucial for the model's ability to self-correct.
- **Define Clear Mode Boundaries**: When creating a new mode, clearly define its purpose and the exact set of tools it should have access to. Use the principle of least privilege, as detailed in the [Security & Governance](ORCHESTRATOR_SECURITY_GOVERNANCE.md) document.
- **Use `FileRestrictionError`**: For modes that have limited file system access, ensure they correctly implement and throw [`FileRestrictionError`](src/shared/modes.ts:157) when a violation occurs.

[Back to Top](#orchestrator-best-practices)

---

### 4. Task Management and Delegation

<a id="task-management-and-delegation"></a>

- **Favor Delegation for Complexity**: Encourage the model to use subtasks for complex problems. This can be done by structuring prompts in a way that suggests a multi-step process.
- **Use `updateTodoListTool` for Planning**: For any non-trivial task, the first step should be to create a plan using [`updateTodoListTool`](src/core/tools/updateTodoListTool.ts:156). This provides clarity and makes the task's progress auditable.
- **Use `switchModeTool` Deliberately**: Mode switching should be a conscious decision to gain necessary permissions. The model should be prompted to provide a reason for the switch, which is captured by the [`switchModeTool`](src/core/tools/switchModeTool.ts:8).

[Back to Top](#orchestrator-best-practices)

---

### 5. Testing and Validation

<a id="testing-and-validation"></a>

- **Unit Test New Tools**: Every new tool must have comprehensive unit tests that cover both success and failure scenarios.
- **Integration Test New Modes**: When adding a new mode, create integration tests that verify its tool permissions and file access restrictions. Test that it can perform its allowed actions and that it is correctly blocked from performing disallowed actions.
- **Create E2E Scenarios**: For significant new capabilities, create end-to-end evaluation scenarios that simulate a real user request. This is the best way to validate the entire workflow, from prompt to completion.

[Back to Top](#orchestrator-best-practices)

---

### 6. Navigation Footer

<a id="navigation-footer"></a>

You have reached the end of the best practices document. Return to the [Master Index](ORCHESTRATOR_INDEX.md) or proceed to the [Extensibility Document](ORCHESTRATOR_EXTENSIBILITY.md).

[Back to Top](#orchestrator-best-practices)

---

End of document.
