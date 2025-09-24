# Repository Overview Documentation

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

Welcome to the repository overview documentation! 🏗️ This directory contains comprehensive
information about the KiloCode repository structure, systems, and components.

## 🗺️ Navigation Guide

## Research Context

**Purpose:** \[Describe the purpose and scope of this document]

**Background:** \[Provide relevant background information]

**Research Questions:** \[List key questions this document addresses]

**Methodology:** \[Describe the approach or methodology used]

**Findings:** \[Summarize key findings or conclusions]

---

### Quick Start Paths

- **Need an Overview**: Start with [REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md)
- **Understanding Systems**: Begin with [CORE_SYSTEMS.md](CORE_SYSTEMS.md)
- **Development Journey**: Follow [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

### Current Focus

- Repository structure and organization
- Core systems and architecture
- Development tools and workflows
- Testing and build infrastructure

## 📚 Documentation Structure

- **[REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md)** - High-level repository organization Maps
  directories (src, webview-ui, packages, apps) and their roles. Explains how pieces fit together
  and where to find things. Start here to orient yourself in the monorepo.
- **[CORE_SYSTEMS.md](CORE_SYSTEMS.md)** - Core systems and services Describes the layered
  architecture (presentation, application, services, data). Summarizes orchestrator, message queue,
  API, observability, and tool services. Helps understand system responsibilities and dependencies.
- **[WORKSPACE_PACKAGES.md](WORKSPACE_PACKAGES.md)** - Workspace packages and libraries Catalog of
  shared packages (types, build, cloud, evals, ipc, telemetry, configs). Details exports, consumers,
  and dependency relationships. Use this to locate reusable building blocks.
- **[APPLICATIONS.md](APPLICATIONS.md)** - Applications and interfaces Overview of docs, storybook,
  web apps, e2e test apps, and nightly builds. Clarifies technologies used and deployment targets.
  Useful when working outside the core extension.
- **[TESTING_INFRASTRUCTURE.md](TESTING_INFRASTRUCTURE.md)** - Testing tools and frameworks Explains
  test layers (unit/integration/e2e/perf) and frameworks (Vitest, Playwright, Jest). Shows directory
  patterns and CI execution. Use as a guide to add or navigate tests.
- **[BUILD_PIPELINES.md](BUILD_PIPELINES.md)** - Build and CI/CD systems Documents build tools
  (Turbo, Webpack, Vite, TSC) and CI workflows. Includes configuration examples and quality gates.
  Handy for debugging builds and optimizing pipelines.
- **[DEVELOPMENT_TOOLS.md](DEVELOPMENT_TOOLS.md)** - Development tools and utilities Details code
  quality, build, and testing tools (ESLint, Prettier, PNPM, etc.). Provides standard configurations
  and recommended settings. Use to ensure local setup matches CI.
- **[EXTERNAL_INTEGRATIONS.md](EXTERNAL_INTEGRATIONS.md)** - External service integrations
  Summarizes AI providers, cloud services, marketplaces, telemetry, and analytics. Lists integration
  points and sample configs. Start here when wiring an external dependency.

## 🔗 Cross-References

- **Architecture**: See [Architecture Documentation](../README.md) for system architecture Global architecture
  index with quick links to race-condition docs, state machines, and improvements.
- **Standards**: See [../../standards/](../../standards/) for development standards Documentation,
  navigation, and code standards that keep the repo consistent and discoverable.
- **Plans**: See [../../../plans/](../../../plans/) for development plans Active and historical
  plans that capture investigation and rollout steps.

## 🦕 Dinosaur Analogy

Think of the repository like a dinosaur fossil site - it contains many different layers and
components that tell the story of how the system evolved. Just as paleontologists carefully catalog
and organize fossils by type, age, and location, we organize our code by function, purpose, and
architectural layer. Each directory is like a different excavation site, revealing different aspects
of the system's structure!

## 🧭 Navigation Footer

- [← Back to Architecture Home](../README.md)
- [→ Core Systems](CORE_SYSTEMS.md)
- [↑ Table of Contents](../README.md)
