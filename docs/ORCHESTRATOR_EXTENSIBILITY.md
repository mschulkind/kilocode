# Orchestrator Extensibility

**Purpose:** This document provides guidance on how to extend the capabilities of the Kilo Code Orchestrator. It covers the primary extension points: adding new tools, creating custom modes, and defining workspace-specific rules.

<details>
<summary>Table of Contents</summary>

- [1. Related Documents](#related-documents)
- [2. Extensibility Philosophy](#extensibility-philosophy)
- [3. Adding New Tools (Gap)](#adding-new-tools-gap)
- [4. Adding New Modes (Gap)](#adding-new-modes-gap)
- [5. Adding Custom Rules](#adding-custom-rules)
- [6. Navigation Footer](#navigation-footer)

</details>

---

### Related Documents

<a id="related-documents"></a>

- **[ORCHESTRATOR_INDEX.md](ORCHESTRATOR_INDEX.md)**: The master index for all orchestrator documentation.
- **[ORCHESTRATOR_BEST_PRACTICES.md](ORCHESTRATOR_BEST_PRACTICES.md)**: Contains best practices for developing new tools and modes.
- **[docs/RULES_LOADING_SUMMARY.md](RULES_LOADING_SUMMARY.md)**: Provides a detailed look at the rule-loading mechanism.

[Back to Top](#orchestrator-extensibility)

---

### Extensibility Philosophy

<a id="extensibility-philosophy"></a>

The orchestrator is designed to be a flexible framework, not a fixed system. Extensibility is a core tenant, allowing developers to tailor the orchestrator's capabilities to specific project needs or to integrate with external services.

The primary extension vectors are:

- **Tools**: Adding new actions the orchestrator can perform.
- **Modes**: Defining new operational contexts with unique permission sets.
- **Rules**: Providing project-specific instructions and constraints to the model.

[Back to Top](#orchestrator-extensibility)

---

### Adding New Tools (Gap)

<a id="adding-new-tools-gap"></a>

Adding a new tool allows the orchestrator to perform novel actions, such as calling a third-party API or interacting with a proprietary build system.

While the detailed implementation process is still being finalized, the general workflow will involve:

1.  **Implementation**: Creating a TypeScript function that encapsulates the tool's logic. This function must be robust and provide clear error messages on failure.
2.  **Registration**: Registering the new tool with the `ToolExecutor` so that it can be discovered and invoked.
3.  **Documentation**: Generating a schema that describes the tool's purpose, parameters, and return values. This schema is used for both validation and for informing the model on how to use the tool.
4.  **Permissioning**: Assigning the new tool to one or more modes to control its availability.

This section is marked as a **Gap** and will be updated as the formal process is solidified.

[Back to Top](#orchestrator-extensibility)

---

### Adding New Modes (Gap)

<a id="adding-new-modes-gap"></a>

Creating a new mode allows for the definition of a new security context, tailored for a specific type of task.

The process for adding a new mode is currently under development. The anticipated steps are:

1.  **Definition**: Defining the new mode's name, purpose, and slug in the central mode registry, likely [`src/shared/modes.ts`](/src/shared/modes.ts#L69).
2.  **Permission Assignment**: Creating a mapping that links the new mode to a specific set of allowed tools.
3.  **File Access Policy**: Optionally defining a file access policy that restricts the mode's read/write capabilities to certain file patterns.

This section is marked as a **Gap**. Further details will be provided once the API for mode creation is finalized.

[Back to Top](#orchestrator-extensibility)

---

### Adding Custom Rules

<a id="adding-custom-rules"></a>

This is the most straightforward way to extend and guide the orchestrator's behavior on a per-project basis. The system is designed to load `.md` files from a `.kilocode/rules` directory in the workspace root.

These rule files are injected directly into the system prompt via [`getSystemPrompt`](src/core/task/Task.ts:2499). They can contain any information that helps guide the model, such as:

- "Do not use the `any` type in TypeScript."
- "All new components must be registered in `src/components/index.ts`."
- "API calls to the billing service must be routed through the `BillingAPIClient`."

For a complete overview of how these rules are discovered and loaded, please refer to **[docs/RULES_LOADING_SUMMARY.md](RULES_LOADING_SUMMARY.md)**.

[Back to Top](#orchestrator-extensibility)

---

### Navigation Footer

<a id="navigation-footer"></a>

You have reached the end of the extensibility document. Return to the [Master Index](ORCHESTRATOR_INDEX.md).

[Back to Top](#orchestrator-extensibility)

---

End of document.
