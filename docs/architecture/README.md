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

## 🚀 Quick Start Paths

### For Expert Engineers New to KiloCode

**Start Here**: [Technical Glossary](../GLOSSARY.md) - Essential terminology before diving deeper

**Then Choose Your Path:**

1. **🚨 Emergency Response** (Something's Broken)

    - [Race Condition Analysis](./race-condition/README.md) → [Root Cause Analysis](./race-condition/ROOT_CAUSE_ANALYSIS.md) → [Solution Recommendations](./race-condition/SOLUTION_RECOMMENDATIONS.md)
    - [Short Troubleshooting Guide](./DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md) for immediate triage

2. **🔬 Deep Dive Research** (Understanding the System)

    - [Repository Overview](./repository/README.md) → [Core Systems](./repository/CORE_SYSTEMS.md) → [State Machines](./state-machines/README.md)
    - [Race Condition Analysis](./race-condition/README.md) for current issues

3. **🛠️ Implementation Journey** (Building Solutions)
    - [Solution Recommendations](./race-condition/SOLUTION_RECOMMENDATIONS.md) → [Testing Strategy](./race-condition/TESTING_STRATEGY.md) → [Implementation Guide](./API_DUPLICATION_DEBUG_IMPLEMENTATION.md)

## 📚 Core Documentation

### Critical Analysis & Current Issues

- **[Race Condition Analysis](./race-condition/README.md)** - Master index for API duplication issues, symptoms, and solutions
- **[Short Debug Implementation Guide](./API_DUPLICATION_DEBUG_IMPLEMENTATION_SHORT.md)** - Concise playbook for instrumentation and verification
- **[Short Troubleshooting Guide](./DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md)** - Field triage checklist for incidents

### System Understanding

- **[State Machines](./state-machines/README.md)** - Task, Session, and Recursive Call state definitions and transitions
- **[Repository Overview](./repository/README.md)** - High-level system map and monorepo structure
- **[Core Systems](./repository/CORE_SYSTEMS.md)** - Detailed breakdown of major system components

## Planning & Improvements

- [Prioritized Architecture Improvements](./PRIORITIZED_ARCHITECTURE_IMPROVEMENTS.md)
  A ranked roadmap of high-impact architecture changes (arbiter, idempotency, FSM guards, single-writer). Each item states motivation, outcome, and rollout hints. Use to plan incremental improvements.
- [Branch Analyses and Proposals](./branches/README.md)
  Index of branch-specific analyses, proposals, and cross-fork comparisons. Useful for reviewing historical context and the rationale for corrective PRs. Links include detailed before/after diffs.

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

**Understanding Race Conditions:**

- **Next**: [Race Condition Analysis](./race-condition/README.md) → [Root Cause Analysis](./race-condition/ROOT_CAUSE_ANALYSIS.md) → [Code Flow Analysis](./race-condition/CODE_FLOW_ANALYSIS.md)
- **Related**: [State Machines](./state-machines/README.md) for behavior modeling, [Orchestrator Documentation](../orchestrator/README.md) for execution patterns

**Understanding System Architecture:**

- **Next**: [Repository Overview](./repository/README.md) → [Core Systems](./repository/CORE_SYSTEMS.md) → [Build Pipelines](./repository/BUILD_PIPELINES.md)
- **Related**: [State Machines](./state-machines/README.md) for runtime behavior, [Technical Glossary](../GLOSSARY.md) for terminology

**Implementing Solutions:**

- **Next**: [Solution Recommendations](./race-condition/SOLUTION_RECOMMENDATIONS.md) → [Testing Strategy](./race-condition/TESTING_STRATEGY.md) → [Implementation Guide](./API_DUPLICATION_DEBUG_IMPLEMENTATION.md)
- **Related**: [Orchestrator Best Practices](../orchestrator/ORCHESTRATOR_BEST_PRACTICES.md), [Repository Development Guide](./repository/DEVELOPMENT_GUIDE.md)

**Planning Improvements:**

- **Next**: [Prioritized Architecture Improvements](./PRIORITIZED_ARCHITECTURE_IMPROVEMENTS.md) → [Branch Analyses](./branches/README.md) → [Implementation Plans](../plans/README.md)
- **Related**: [Consolidation Plan](./CONSOLIDATION_PLAN.md) for documentation improvements

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to this README for guidance.

## Navigation

- **[Race Condition Documentation](./race-condition/README.md)** - Complete analysis of API duplication issues, root causes, and solutions
- **[Orchestrator Documentation](../orchestrator/README.md)** - Task coordination, lifecycle management, and execution patterns
- **[Repository Documentation](./repository/README.md)** - Codebase structure, packages, and development workflow
- **[State Machine Documentation](./state-machines/README.md)** - System behavior modeling and state transition definitions
- **[Technical Glossary](../GLOSSARY.md)** - Essential terminology and system concepts
- **[Observability Layer System](./OBSERVABILITY_LAYER_SYSTEM.md)** - Tracing, metrics, and instrumentation patterns

## Notes

- Prefer SHORT docs for quick field use; deep links lead to full guides.
- See [Documentation Consolidation Plan](./CONSOLIDATION_PLAN.md) for active deduplication work.

## Directory context

This directory aggregates all architecture-focused documents: high-level overviews, layered system design, critical issue analyses (like race conditions), and state-machine specifications. Use the Quick Start to jump into urgent tasks or deep dives, and the Planning section to track active architectural work. Subdirectories (e.g., `race-condition/`, `repository/`, `state-machines/`) each provide their own focused indexes with detailed coverage.
