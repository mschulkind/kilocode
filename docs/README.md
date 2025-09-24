# KiloCode Documentation Hub

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
> documentation helps us understand how! ⚙️

Welcome to the KiloCode documentation! 🦕 This is your central hub for understanding the system
architecture, development workflows, and troubleshooting guides.

## 🗺️ Navigation Guide

### Quick Start Paths
- **🚨 Emergency Response**: Start with [Race Condition Analysis](README.md) for critical API
  duplication issues
- **🔬 Deep Dive Research**: Begin with [Architecture Overview](README.md) for system understanding
- **🛠️ Implementation Journey**: Follow the [Investigation Plans](plans/README.md) for active
  development work
- **📚 New to Codebase**: Start with [Technical Glossary](GLOSSARY.md) for terminology, then
  [Repository Overview](README.md)

### Expert Engineer Onboarding
- *For experienced engineers new to KiloCode:*\*
1. **Start Here**: [Technical Glossary](GLOSSARY.md) - Essential terminology and concepts
2. **System Overview**: [Architecture Documentation](README.md) - High-level system design
3. **Current Issues**: [Race Condition Analysis](README.md) - Active problems and solutions
4. **Implementation**: [Orchestrator Documentation](README.md) - Core execution patterns
5. **Development**: [Repository Structure](README.md) - Codebase organization

### Current Focus
- API duplication race condition investigation and resolution
- Orchestrator-subtask lifecycle improvements
- Documentation standards and consolidation

## 📚 Documentation Structure

### Core Documentation
- **[Documentation Standards](DOCUMENTATION_GUIDE.md)** - Complete guide to our documentation
  principles, structure, and standards
- **[Documentation Progress](DOCUMENTATION_PROGRESS.md)** - Tracking documentation coverage and
  improvements
- **[Improvement Log](IMPROVEMENT_LOG.md)** - Running log of system improvements and technical debt

### Architecture & Design
- **[Architecture Documentation](README.md)** - System architecture, state machines, and critical
  issue analysis
- **[Orchestrator Documentation](README.md)** - Task orchestration and lifecycle management
- **[Services Documentation](README.md)** - Service layer architecture and patterns

### Development & Operations
- **[Build System](README.md)** - Build pipeline, deployment, and CI/CD documentation
- **[Testing Infrastructure](README.md)** - Testing frameworks, strategies, and tools
- **[Integrations](README.md)** - External service integrations and APIs

### Planning & Research
- **[Investigation Plans](plans/README.md)** - Active investigations, debugging plans, and research
  work
- **[Improvements](README.md)** - Technical debt, enhancement opportunities, and research areas

## Directory Context

This directory serves as the central repository for all KiloCode documentation, following a
structured approach with clear navigation paths and consistent standards. Each subdirectory provides
focused coverage of specific domains while maintaining cross-references and contextual guidance.

### Specialized Documentation Areas
- **`architecture/`** - System design, component relationships, and architectural patterns. Contains
  critical analysis of race conditions, state machines, and repository structure. Essential for
  understanding how components interact and identifying system-level issues.
- **`orchestrator/`** - Task management, lifecycle coordination, and orchestration patterns. Focuses
  on how tasks are created, managed, and executed. Critical for understanding the main execution
  flow and subtask coordination.
- **`plans/`** - Active investigation plans and development roadmaps. Contains detailed analysis of
  current issues and proposed solutions. Use for tracking ongoing research and debugging efforts.
- **`services/`** - Individual service documentation and integration patterns. Covers specific
  services and their responsibilities within the larger system architecture.
- **`tools/`** - Tool system architecture and development guidelines. Documents how tools are
  created, integrated, and managed within the execution environment.
- **`integrations/`** - External system integrations and API patterns. Covers third-party service
  connections, data flows, and integration best practices.
- **`testing/`** - Testing strategies, frameworks, and best practices. Documents how to test various
  system components and ensure reliability.
- **`ui/`** - User interface components and interaction patterns. Covers frontend architecture, user
  experience design, and component relationships.
- **`laminar/`** - Observability and monitoring system documentation. Details the Laminar service
  for tracing, metrics, and system observability.
- **`improvements/`** - Historical improvement logs and enhancement documentation. Tracks system
  evolution, lessons learned, and technical debt management.

The documentation follows our established standards for discoverability, linkability, and user
journey optimization.

## 🔍 Research Context & Next Steps

### When You're Here, You Can:
- *Understanding System Architecture:*\*
- **Next**: [Architecture Overview](README.md) → [State Machines](README.md) →
  [Race Condition Analysis](README.md)
- **Related**: [Orchestrator Documentation](README.md) for execution patterns
- *Investigating Issues:*\*
- **Next**: [Race Condition Analysis](README.md) →
  [Root Cause Analysis](architecture/race-condition/ROOT_CAUSE_ANALYSIS.md) →
  [Solution Recommendations](architecture/race-condition/SOLUTION_RECOMMENDATIONS.md)
- **Related**: [Investigation Plans](plans/README.md) for active debugging work
- *Implementing Solutions:*\*
- **Next**: [Solution Recommendations](architecture/race-condition/SOLUTION_RECOMMENDATIONS.md) →
  [Testing Strategy](architecture/race-condition/TESTING_STRATEGY.md) →
  [Implementation Guide](architecture/API_DUPLICATION_DEBUG_IMPLEMENTATION.md)
- **Related**: [Orchestrator Best Practices](orchestrator/ORCHESTRATOR_BEST_PRACTICES.md)
- *Understanding Codebase:*\*
- **Next**: [Repository Overview](README.md) →
  [Core Systems](architecture/../architecture/repository/CORE_SYSTEMS.md) → [Source Code](../src/)
- **Related**: [Build Pipelines](architecture/../architecture/repository/BUILD_PIPELINES.md) for
  development workflow

### No Dead Ends Policy

Every documentation page provides:
- **Clear next steps** based on your current context
- **Related concepts** for deeper understanding
- **Cross-references** to relevant implementation details
- **Breadcrumb navigation** showing your current location

## 🔗 Cross-References
- **Source Code**: See [Source Code](../src/) for implementation details
- **Configuration**: See [Packages](../packages/) for package configurations
- **Context Portal**: See [../context\_portal/](../context_portal/) for ConPort integration
- **Technical Terms**: See [Technical Glossary](GLOSSARY.md) for definitions and concepts

## 🦕 Dinosaur Analogy

Think of this documentation like a dinosaur fossil site - each layer tells a different part of the
story, from the deep architectural foundations (like bedrock) to the surface-level user guides (like
topsoil). Just as paleontologists carefully map and cross-reference different strata to understand
the complete history, our documentation layers work together to provide a comprehensive
understanding of the KiloCode ecosystem!

## 🧭 Navigation Footer
- [← Back to Project Root](../README.md)
- [→ Architecture Documentation](README.md)
- [↑ Table of Contents](#-documentation-structure)

## Navigation
- [← Main Documentation](README.md)
- [← Project Root](README.md)
- [← Architecture](architecture/README.md)
- [← Orchestrator](orchestrator/README.md)
- [← Standards](standards/README.md)
- [← Plans](plans/README.md)
- [← Tools](tools/README.md)
- [← Improvements](improvements/README.md)
- [← Integrations](integrations/README.md)
