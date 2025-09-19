# Docs Index

- [`docs/ORCHESTRATOR_ARCHITECTURE.md`](docs/ORCHESTRATOR_ARCHITECTURE.md:1)

    - Describes the orchestrator's overall architecture and design principles.
    - Lists core components (Task Engine, Streaming Parser, Tool Executor) and their interactions.
    - Includes data-flow diagrams and pointers to key implementation entry points.

- [`docs/ORCHESTRATOR_BEST_PRACTICES.md`](docs/ORCHESTRATOR_BEST_PRACTICES.md:1)

    - Provides developer guidelines for prompt design, tool usage, and iteration.
    - Advises on tool and mode development (atomic tools, clear error messages, mode boundaries).
    - Recommends planning, todo gating, and testing/validation practices.

- [`docs/ORCHESTRATOR_ERROR_HANDLING.md`](docs/ORCHESTRATOR_ERROR_HANDLING.md:1)

    - Explains the error-handling philosophy and model-led recovery loop.
    - Catalogs error types (tool execution, parsing, permission, catastrophic) and handling strategies.
    - Describes the "Mistake Limit" and concrete recovery scenarios (e.g., FileRestrictionError).

- [`docs/ORCHESTRATOR_EXTENSIBILITY.md`](docs/ORCHESTRATOR_EXTENSIBILITY.md:1)

    - Guides adding extensions: new tools, modes, and workspace rules.
    - Notes current gaps for formalizing tool/mode creation and expected registration steps.
    - Explains custom rule files loading and how they integrate into system prompts.

- [`docs/ORCHESTRATOR_INDEX.md`](docs/ORCHESTRATOR_INDEX.md:1)

    - Master index and high-level entry for all orchestrator documentation.
    - Summarizes responsibilities, core concepts, lifecycle snapshot, and guardrails.
    - Maps related documents and provides change-management and glossary sections.

- [`docs/ORCHESTRATOR_LIFECYCLE.md`](docs/ORCHESTRATOR_LIFECYCLE.md:1)

    - Details the task lifecycle stages from initiation to completion.
    - Describes the execution loop (`recursivelyMakeClineRequests`) and state transitions.
    - Covers subtask lifecycle, sample sequences, and practical implementation pointers.

- [`docs/ORCHESTRATOR_SECURITY_GOVERNANCE.md`](docs/ORCHESTRATOR_SECURITY_GOVERNANCE.md:1)

    - Describes the mode-based security model and the principle of least privilege.
    - Covers tool permissioning, file access control, and FileRestrictionError semantics.
    - Shows governance workflow diagrams and enforcement points in the codebase.

- [`docs/ORCHESTRATOR_TASK_DELEGATION.md`](docs/ORCHESTRATOR_TASK_DELEGATION.md:1)

    - Explains the philosophy and mechanism for delegating work into subtasks.
    - Documents `startSubtask` / `completeSubtask` flows and parent/child state handling.
    - Lists common use cases for delegation and mode-specialized subtasks.

- [`docs/ORCHESTRATOR_TOOLS_REFERENCE.md`](docs/ORCHESTRATOR_TOOLS_REFERENCE.md:1)

    - Reference list of core tools, their purposes, parameters, and source links.
    - Highlights core task-flow tools (e.g., attemptCompletionTool) and task-management tools.
    - Summarizes file-system tools and permissioning implications per mode.

- [`docs/PROVIDER_GUIDELINES.md`](docs/PROVIDER_GUIDELINES.md:1)

    - Specifies provider contracts for errors, retries, cancellation, and tracing.
    - Recommends headers for tracing (X-KILOCODE-TASK-ID, X-KILOCODE-TIMESTAMP-ISO) and behaviors.
    - Includes a testing checklist and clear responsibilities for orchestrator vs provider retries.

- [`docs/RULES_LOADING_SUMMARY.md`](docs/RULES_LOADING_SUMMARY.md:1)

    - Deep dive into how `.kilocode/rules` files are discovered, filtered, and loaded.
    - Describes toggle-aware loading, directory resolution, symlink handling, and legacy fallbacks.
    - Notes performance, caching trade-offs, error handling, and suggested improvements.

- [`docs/SETTINGS_SCREEN.md`](docs/SETTINGS_SCREEN.md:1)

    - Documents the settings UI composition, draft/edit flow, and save lifecycle.
    - Describes the model shortcut dropdown behavior and guidance to avoid lost edits.
    - Provides debugging tips, validation rules, and instrumentation recommendations.

- [`docs/SHELL_INTEGRATION.md`](docs/SHELL_INTEGRATION.md:1)

    - Explains shell integration purpose, invocation flow, and safety/timeouts.
    - Lists relevant settings (enable, timeout, interactive allowance, max output) and fallbacks.
    - Recommends logging, correlation by requestId, and troubleshooting steps for failures.

- [`docs/UI_CHAT_TASK_WINDOW.md`](docs/UI_CHAT_TASK_WINDOW.md:1)
    - Describes the chat/task window UI, panels, and model shortcut placement.
    - Covers message flow, payload composition, timestamps, and guard conditions for sends.
    - Provides diagnostics and fixes for duplicate API requests and control-loop races.
