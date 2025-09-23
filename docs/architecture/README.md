# Architecture Documentation

Overview and navigation for system architecture, design patterns, and critical system analysis.

## Directory Context

The architecture directory contains comprehensive documentation for understanding KiloCode's system design, component relationships, and architectural patterns. This includes critical analysis of race conditions, state machines, repository structure, and architectural improvements. Essential for understanding how components interact and identifying system-level issues.

### Key Focus Areas

- **System Architecture Layers** - UI, Communication, Orchestration, Provider, and Observability layers
- **Critical Issues & Analysis** - Race conditions, API duplication, and system reliability
- **Repository Structure** - Monorepo organization, packages, and build systems
- **State Machines** - Task, Session, and Recursive Call state management
- **Architectural Improvements** - Prioritized roadmap for system enhancements

## Quick Start

- [Race Condition Analysis (Master Index)](./API_DUPLICATION_RACE_CONDITION_ANALYSIS.md)
  Master entry point summarizing the duplicate-API-request problem, symptoms, and links to detailed state machines, flows, and mitigations. Read this first to understand the overall landscape. It also contains navigation for emergency response, deep dives, and implementation journeys.
- [Short Debug Implementation Guide](./API_DUPLICATION_DEBUG_IMPLEMENTATION_SHORT.md)
  A concise playbook to instrument, reproduce, and verify race conditions with minimal code changes. Includes logging snippets, span guidance, and quick checks. Use during active triage.
- [Short Troubleshooting Guide](./DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md)
  Field triage checklist for multi-spinner/jumbled-response incidents. Walks through scenario identification, lock status, and quick mitigations. Includes links to deeper analysis.
- [State Machines Index and Diagrams](./state-machines/INDEX.md)
  Central index for Task, Session, Recursive Call, and Race-Condition state machines. Each page explains states, transitions, and diagrams with notes. Use as the source of truth for runtime behavior.
- [Repository Overview (Master Index)](./REPOSITORY_OVERVIEW.md)
  High-level map of major systems, packages, and applications. Explains monorepo structure and links to focused repository documentation. Ideal to orient new contributors.

## Planning & Improvements

- [Prioritized Architecture Improvements](./PRIORITIZED_ARCHITECTURE_IMPROVEMENTS.md)
  A ranked roadmap of high-impact architecture changes (arbiter, idempotency, FSM guards, single-writer). Each item states motivation, outcome, and rollout hints. Use to plan incremental improvements.
- [Branch Analyses and Proposals](./branches/README.md)
  Index of branch-specific analyses, proposals, and cross-fork comparisons. Useful for reviewing historical context and the rationale for corrective PRs. Links include detailed before/after diffs.

## Navigation

- [Race Condition Documentation](./race-condition/README.md)
  Directory index for all race-condition-specific docs, including timelines, flows, and solutions. Helpful when focused narrowly on this issue family.
- [Orchestrator Documentation](../orchestrator/README.md)
  Overview of orchestrator responsibilities, lifecycles, and best practices with navigation to deeper topics. Start here to understand task coordination.
- [Repository Documentation](./repository/README.md)
  Index for repository-wide structure and submodules (core, webview, packages, apps). Each subpage details responsibilities and navigation.
- [Observability Layer System](./OBSERVABILITY_LAYER_SYSTEM.md)
  Explains observability architecture (spans, metrics, logs) and how to instrument flows. Reference for adding traceability to new or refactored paths.

## Notes

- Prefer SHORT docs for quick field use; deep links lead to full guides.
- See [Documentation Consolidation Plan](./CONSOLIDATION_PLAN.md) for active deduplication work.

## Directory context

This directory aggregates all architecture-focused documents: high-level overviews, layered system design, critical issue analyses (like race conditions), and state-machine specifications. Use the Quick Start to jump into urgent tasks or deep dives, and the Planning section to track active architectural work. Subdirectories (e.g., `race-condition/`, `repository/`, `state-machines/`) each provide their own focused indexes with detailed coverage.
