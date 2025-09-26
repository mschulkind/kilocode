# Repository Overview

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

- *Purpose:** Master index for comprehensive information about the KiloCode repository structure,
systems, and components.

> **Dinosaur Fun Fact**: Architecture documentation is like a dinosaur fossil record - each layer
> tells us about the evolution of our system, helping us understand how it grew and changed over
> time! 🦕

## 🗺️ Navigation Guide

## Research Context

- *Purpose:** \[Describe the purpose and scope of this document]

- *Background:** \[Provide relevant background information]

- *Research Questions:** \[List key questions this document addresses]

- *Methodology:** \[Describe the approach or methodology used]

- *Findings:** \[Summarize key findings or conclusions]

- **

### Quick Start Paths

- **Need an Overview**: Start with [Repository Structure](../architecture/repository/REPOSITORY_STRUCTURE.md)
- **Understanding Systems**: Begin with [Core Systems](../architecture/repository/CORE_SYSTEMS.md)
- **Development Journey**: Follow [Development Guide](repository/DEVELOPMENT_GUIDE.md)

### Current Focus
- Repository structure and organization
- Core systems and architecture
- Development tools and workflows
- Testing and build infrastructure

## 📚 Documentation Structure

This overview has been split into focused, manageable documents for better navigation and
understanding:

### Core Documentation

- **[Repository Structure](../architecture/repository/REPOSITORY_STRUCTURE.md)** - High-level repository
  organization
- **[Core Systems](../architecture/repository/CORE_SYSTEMS.md)** - Core systems and services
- **[Workspace Packages](../architecture/repository/WORKSPACE_PACKAGES.md)** - Workspace packages and libraries
- **[Applications](../architecture/repository/APPLICATIONS.md)** - Applications and interfaces

### Development & Infrastructure

- **[Testing Infrastructure](repository/TESTING_INFRASTRUCTURE.md)** - Testing tools and
  frameworks
- **[Build Pipelines](../architecture/repository/BUILD_PIPELINES.md)** - Build and CI/CD systems
- **[Development Tools](../architecture/repository/DEVELOPMENT_TOOLS.md)** - Development tools and utilities
- **[External Integrations](../architecture/repository/EXTERNAL_INTEGRATIONS.md)** - External service integrations
- **[Development Guide](repository/DEVELOPMENT_GUIDE.md)** - Comprehensive development guide

## Executive Summary

The KiloCode repository is a comprehensive VS Code extension for AI-powered coding assistance,
featuring a multi-layered architecture with extensive tooling, testing, and deployment
infrastructure. The codebase spans over 1,120 TypeScript files across multiple workspace packages,
applications, and services.

- *Key Statistics:**

- **Total Files**: 1,120+ TypeScript files
- **Workspace Packages**: 7 core packages
- **Applications**: 8 applications (docs, testing, web interfaces)
- **Core Services**: 15+ specialized services
- **Tools**: 25+ AI-powered tools
- **Test Coverage**: Extensive unit, integration, and E2E testing

## Quick Reference

### Repository Structure

- **Core Extension**: `src/` - Main VS Code extension implementation
- **Webview UI**: `webview-ui/` - React-based user interface
- **Workspace Packages**: `packages/` - Shared libraries and utilities
- **Applications**: `apps/` - Standalone applications and interfaces
- **Documentation**: `docs/` - Comprehensive documentation system

### Core Systems

- **Orchestrator Service**: Task execution and coordination
- **API Service**: External AI service communication
- **Message Queue Service**: Message queuing and processing
- **Laminar Service**: Observability and tracing
- **Prompt Service**: Prompt engineering and management
- **Tool Service**: AI tool execution and coordination

### Development Workflow

- **Monorepo Management**: PNPM workspace with Turbo orchestration
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Vitest, Playwright, Jest for comprehensive testing
- **Building**: Webpack, Vite, TypeScript compilation
- **Deployment**: VS Code Marketplace, NPM registry, web hosting

## 🔗 Cross-References

- **Architecture**: See [Architecture Documentation](../../README.md) for system architecture
- **Standards**: See [../standards/](../standards/) for development standards
- **Plans**: See [../../plans/](../../plans/) for development plans

## 🦕 Dinosaur Analogy

Think of the repository like a dinosaur fossil site - it contains many different layers and
components that tell the story of how the system evolved. Just as paleontologists carefully catalog
and organize fossils by type, age, and location, we organize our code by function, purpose, and
architectural layer. Each directory is like a different excavation site, revealing different aspects
of the system's structure!

## 🧭 Navigation Footer
- [← Back to Architecture Home](../../README.md)
- [→ Repository Structure](../architecture/repository/REPOSITORY_STRUCTURE.md)
- [↑ Table of Contents](../../README.md)

## Navigation Footer

- **

- *Navigation**: [docs](../) · [architecture](../docs/architecture/) ·
[↑ Table of Contents](#repository-overview)

## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.
- Each section provides clear navigation to related content
- All internal links are validated and point to existing documents
- Cross-references include context for better understanding
