# Repository Structure

## Overview

This document provides a comprehensive overview of the KiloCode repository structure, including directories, packages, and their purposes.

## Root Directory Structure

```
kilocode2/
├── apps/                    # Applications
├── packages/                # Shared packages
├── src/                     # Source code
├── docs/                    # Documentation
├── scripts/                 # Build and utility scripts
├── webview-ui/              # Webview UI components
├── plugins/                 # Remark plugins
├── plans/                   # Project plans
├── context/                 # Context files
└── reports/                 # Generated reports
```

## Applications (`apps/`)

### Core Applications
- **kilocode-docs/**: Documentation system and viewer
- **playwright-e2e/**: End-to-end testing framework
- **storybook/**: Component development and testing
- **vscode-e2e/**: VSCode extension testing
- **web-docs/**: Web-based documentation
- **web-evals/**: Evaluation and testing web interface
- **web-roo-code/**: Web-based code interface

### Supporting Applications
- **vscode-nightly/**: Nightly builds and testing
- **benchmark/**: Performance benchmarking tools

## Packages (`packages/`)

### Core Packages
- **build/**: Build system and tooling
- **cloud/**: Cloud integration services
- **config-eslint/**: ESLint configuration
- **config-typescript/**: TypeScript configuration
- **evals/**: Evaluation and testing framework
- **ipc/**: Inter-process communication
- **telemetry/**: Telemetry and analytics
- **types/**: TypeScript type definitions

## Source Code (`src/`)

### Core Systems
- **core/**: Core system components
  - **task/**: Task management system
  - **orchestrator/**: Orchestration layer
  - **provider/**: Provider layer
- **services/**: Service layer components
- **utils/**: Utility functions and helpers
- **ui/**: User interface components

## Documentation (`docs/`)

### Architecture Documentation
- **architecture/**: System architecture documentation
- **services/**: Service documentation
- **standards/**: Coding standards and guidelines
- **tools/**: Tool documentation
- **testing/**: Testing documentation
- **templates/**: Documentation templates

### Specialized Documentation
- **laminar/**: Laminar system documentation
- **orchestrator/**: Orchestrator documentation
- **integrations/**: Integration documentation
- **improvements/**: Improvement documentation

## Scripts (`scripts/`)

### Build Scripts
- **docs/**: Documentation processing scripts
- **kilocode/**: KiloCode-specific scripts
- **bootstrap.mjs**: Project bootstrap script

### Utility Scripts
- **docs-fixer.js**: Documentation fixer
- **find-missing-i18n-key.js**: Internationalization helper
- **install-vsix.js**: VSCode extension installer

## Webview UI (`webview-ui/`)

### UI Components
- **src/**: Source components
- **public/**: Static assets
- **dist/**: Built components

## Plugins (`plugins/`)

### Remark Plugins
- **remark-kilocode-comprehensive.js**: Comprehensive validation
- **remark-kilocode-unified.js**: Unified processing

## Plans (`plans/`)

### Project Plans
- **API_DUPLICATION_INVESTIGATION_PLAN.md**
- **CATEGORY_1_CROSS_REFERENCE_FIXES_PLAN.md**
- **DOCUMENTATION_AUTOMATION_IMPLEMENTATION_PLAN.md**
- **ZERO_WARNINGS_ERRORS_VALIDATION_PLAN.md**

## Context (`context/`)

### Context Files
- **category-1-cross-reference-fixes/**: Cross-reference fix context
- **zero-warnings-validation/**: Validation context

## Reports (`reports/`)

### Generated Reports
- **compliance-report-*.json**: Compliance reports
- **notification-*.json**: Notification reports
- **recommendations-report-*.json**: Recommendation reports
- **trends-report-*.json**: Trend analysis reports
- **weekly-report-*.json**: Weekly progress reports

## Configuration Files

### Root Configuration
- **package.json**: Project configuration
- **pnpm-workspace.yaml**: PNPM workspace configuration
- **turbo.json**: Turbo build configuration
- **tsconfig.json**: TypeScript configuration
- **knip.json**: Dependency analysis configuration

### Development Configuration
- **flake.nix**: Nix flake configuration
- **renovate.json**: Renovate bot configuration
- **ellipsis.yaml**: Ellipsis configuration

## Build System

### Package Management
- **PNPM**: Package manager
- **Turbo**: Monorepo build system
- **TypeScript**: Type checking and compilation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Playwright**: E2E testing

## Related Documentation

- [System Overview](SYSTEM_OVERVIEW.md)
- [Core Systems](CORE_SYSTEMS.md)
- [Development Tools](DEVELOPMENT_TOOLS.md)
- [Build Pipelines](BUILD_PIPELINES.md)

## Navigation

- [Getting Started](GETTING_STARTED.md)
- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [Development Guide](../architecture/DEVELOPMENT_GUIDE.md)

---

*This document is part of the KiloCode documentation system.*
