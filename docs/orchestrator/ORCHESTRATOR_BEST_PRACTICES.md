# Orchestrator Best Practices

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

**Purpose:** This document provides guidelines and best practices for developers working with the
Kilo Code Orchestrator. Following these practices will lead to more robust, predictable, and
maintainable interactions with the system.

> **Biology Fun Fact**: Best practices are like the DNA of good code - they encode the essential
> patterns that ensure healthy, robust systems that can evolve and adapt over time! 🧬

<details>
<summary>Table of Contents</summary>

- [1. Related Documents](#related-documents)
- [2. Prompt Engineering Best Practices](#prompt-engineering-best-practices)
- [3. Tool and Mode Development](#tool-and-mode-development)
- [4. Task Management and Delegation](#task-management-and-delegation)
- [5. Testing and Validation](#testing-and-validation)
- [6. Navigation Footer

</details>

---

### Related Documents

<a id="related-documents"></a>](6-navigation-footer-details-----related-documents-a-idrelated-documentsa-)

- **[Orchestrator Master Index](ORCHESTRATOR_INDEX.md)**: The master index for all orchestrator
  documentation.
- **[Extensibility Guide](ORCHESTRATOR_EXTENSIBILITY.md)**: Provides the technical details
  for creating new tools and modes.
- **[Documentation Guide](../DOCUMENTATION_GUIDE.md)**: Documentation standards and practices.

[Back to Top](#orchestrator-best-practices)

---

### Prompt Engineering Best Practices

<a id="prompt-engineering-best-practices"></a>

The quality of the orchestrator's output is highly dependent on the quality of the input prompts.

- **Be Specific and Unambiguous**: Clearly state the goal of the task. Avoid vague language. Instead
  of "Fix the UI," say "In `src/components/MyComponent.tsx`, align the save button to the right of
  the cancel button."
- **Provide Context**: Include relevant file paths, code snippets, and error messages in the initial
  prompt. The more context the model has, the less it needs to discover on its own.
- **Leverage System Prompts**: Use the [`getSystemPrompt`](`[FILE_MOVED_OR_RENAMED]`#L2499) function
  to its full potential. Ensure that all necessary rules, constraints, and formatting guidelines
  like [`markdownFormattingSection`](/src/core/prompts/sections/markdown-formatting.ts#L1) are
  included.
- **Iterate and Refine**: If a task does not perform as expected, analyze the conversation history.
  Often, a small tweak to the initial prompt or a custom rule can significantly improve performance.

[Back to Top](#orchestrator-best-practices)

---

### Tool and Mode Development

<a id="tool-and-mode-development"></a>

When extending the system, adhere to these principles.

- **Keep Tools Atomic**: A tool should do one thing and do it well. Avoid creating monolithic tools
  that handle multiple distinct operations. For example, `read_file` and `write_to_file` are
  separate tools.
- **Provide Rich Error Feedback**: When a tool fails, it should return a descriptive error message.
  This is crucial for the model's ability to self-correct.
- **Define Clear Mode Boundaries**: When creating a new mode, clearly define its purpose and the
  exact set of tools it should have access to. Use the principle of least privilege, as detailed in
  the [Security & Governance](ORCHESTRATOR_SECURITY_GOVERNANCE.md) document.
- **Use `FileRestrictionError`**: For modes that have limited file system access, ensure they
  correctly implement and throw [`FileRestrictionError`](`[FILE_MOVED_OR_RENAMED]`#L157) when a
  violation occurs.

[Back to Top](#orchestrator-best-practices)

---

### Task Management and Delegation

<a id="task-management-and-delegation"></a>

- **Favor Delegation for Complexity**: Encourage the model to use subtasks for complex problems.
  This can be done by structuring prompts in a way that suggests a multi-step process.
- **Use `updateTodoListTool` for Planning**: For any non-trivial task, the first step should be to
  create a plan using [`updateTodoListTool`](/src/core/tools/updateTodoListTool.ts#L156). This
  provides clarity and makes the task's progress auditable.
- **Use `switchModeTool` Deliberately**: Mode switching should be a conscious decision to gain
  necessary permissions. The model should be prompted to provide a reason for the switch, which is
  captured by the [`switchModeTool`](/src/core/tools/switchModeTool.ts#L8).

[Back to Top](#orchestrator-best-practices)

---

### Testing and Validation

<a id="testing-and-validation"></a>

- **Unit Test New Tools**: Every new tool must have comprehensive unit tests that cover both success
  and failure scenarios.
- **Integration Test New Modes**: When adding a new mode, create integration tests that verify its
  tool permissions and file access restrictions. Test that it can perform its allowed actions and
  that it is correctly blocked from performing disallowed actions.
- **Create E2E Scenarios**: For significant new capabilities, create end-to-end evaluation scenarios
  that simulate a real user request. This is the best way to validate the entire workflow, from
  prompt to completion.

[Back to Top](#orchestrator-best-practices)

---

### Navigation Footer

<a id="navigation-footer"></a>

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

**Implementing Orchestrator Features:**

- **Next**: [Orchestrator Task Delegation](ORCHESTRATOR_TASK_DELEGATION.md) →
  [Orchestrator Extensibility](ORCHESTRATOR_EXTENSIBILITY.md) →
  [Solution Recommendations](../architecture/race-condition/SOLUTION_RECOMMENDATIONS.md)
- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) for codebase
  patterns

**Understanding Current Problems:**

- **Next**: [Race Condition Analysis](../architecture/race-condition/README.md) →
  [Code Flow Analysis](../architecture/race-condition/CODE_FLOW_ANALYSIS.md) →
  [Solution Recommendations](../architecture/race-condition/SOLUTION_RECOMMENDATIONS.md)
- **Related**: [State Machines](../architecture/state-machines/README.md) for behavior analysis

**Testing and Validation:**

- **Next**: [Testing Strategy](../architecture/race-condition/TESTING_STRATEGY.md) →
  [Implementation Guide](../architecture/API_DUPLICATION_DEBUG_IMPLEMENTATION.md) →
  [Repository Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)
- **Related**: [Orchestrator Error Handling](ORCHESTRATOR_ERROR_HANDLING.md) for common issues

**Understanding Orchestrator Architecture:**

- **Next**: [Orchestrator Architecture](ORCHESTRATOR_ARCHITECTURE.md) →
  [Orchestrator Lifecycle](ORCHESTRATOR_LIFECYCLE.md) →
  [Orchestrator Tools Reference](ORCHESTRATOR_TOOLS_REFERENCE.md)
- **Related**: [State Machines](../architecture/state-machines/README.md) for behavior modeling

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Orchestrator Documentation](README.md) for guidance.

---

**Navigation**: [← Back to Orchestrator Documentation](README.md) ·
[→ Orchestrator Task Delegation](ORCHESTRATOR_TASK_DELEGATION.md) ·
[📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
