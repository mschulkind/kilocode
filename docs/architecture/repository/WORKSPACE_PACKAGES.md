# Workspace Packages

**Purpose:** Detailed overview of the workspace packages and shared libraries in the KiloCode monorepo.

## Package Overview

The KiloCode monorepo contains 7 core packages that provide shared functionality across the entire codebase:

```mermaid
graph TB
    subgraph "Core Packages"
        TYPES[@roo-code/types]
        BUILD[@roo-code/build]
        CLOUD[@roo-code/cloud]
        EVALS[@roo-code/evals]
        IPC[@roo-code/ipc]
        TELEMETRY[@roo-code/telemetry]
    end

    subgraph "Configuration Packages"
        CONFIG_ESLINT[@roo-code/config-eslint]
        CONFIG_TYPESCRIPT[@roo-code/config-typescript]
    end

    subgraph "Dependencies"
        CORE[Core Extension]
        WEBVIEW[Webview UI]
        APPS[Applications]
    end

    TYPES --> CORE
    TYPES --> WEBVIEW
    TYPES --> APPS
    BUILD --> CORE
    BUILD --> WEBVIEW
    CLOUD --> CORE
    EVALS --> CORE
    IPC --> CORE
    TELEMETRY --> CORE
    CONFIG_ESLINT --> CORE
    CONFIG_ESLINT --> WEBVIEW
    CONFIG_TYPESCRIPT --> CORE
    CONFIG_TYPESCRIPT --> WEBVIEW
```

## Core Packages

### @roo-code/types

**Purpose**: Shared TypeScript type definitions and schemas

**Key Exports**:

- **Message Types**: Chat message and conversation types
- **Task Types**: Task and orchestrator type definitions
- **API Types**: API request and response types
- **Tool Types**: Tool definition and execution types
- **Configuration Types**: Configuration and settings types

**File Structure**:

```
packages/types/src/
├── message.ts          # Message type definitions
├── task.ts             # Task type definitions
├── api.ts              # API type definitions
├── tool.ts             # Tool type definitions
├── config.ts           # Configuration types
└── index.ts            # Main export file
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: None (base package)

**Used By**: All packages and applications

### @roo-code/build

**Purpose**: Build system and tooling utilities

**Key Exports**:

- **Build Utilities**: Build process utilities
- **Webpack Configs**: Webpack configuration helpers
- **TypeScript Configs**: TypeScript configuration helpers
- **ESLint Configs**: ESLint configuration helpers

**File Structure**:

```
packages/build/src/
├── webpack/            # Webpack configurations
├── typescript/         # TypeScript configurations
├── eslint/             # ESLint configurations
├── utils/              # Build utilities
└── index.ts            # Main export file
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: @roo-code/types

**Used By**: Core extension, webview UI, applications

### @roo-code/cloud

**Purpose**: Cloud service integrations and utilities

**Key Exports**:

- **Cloud Clients**: Cloud service client implementations
- **Authentication**: Cloud authentication utilities
- **Storage**: Cloud storage utilities
- **Deployment**: Deployment utilities

**File Structure**:

```
packages/cloud/src/
├── clients/            # Cloud service clients
├── auth/               # Authentication utilities
├── storage/            # Storage utilities
├── deployment/         # Deployment utilities
└── index.ts            # Main export file
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: @roo-code/types

**Used By**: Core extension, applications

### @roo-code/evals

**Purpose**: Evaluation and testing utilities

**Key Exports**:

- **Test Utilities**: Testing utility functions
- **Evaluation Metrics**: Evaluation metric calculations
- **Test Data**: Test data generation and management
- **Performance Testing**: Performance testing utilities

**File Structure**:

```
packages/evals/src/
├── metrics/            # Evaluation metrics
├── test-data/          # Test data utilities
├── performance/        # Performance testing
├── utils/              # General utilities
└── index.ts            # Main export file
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: @roo-code/types

**Used By**: Testing infrastructure, applications

### @roo-code/ipc

**Purpose**: Inter-process communication utilities

**Key Exports**:

- **IPC Channels**: IPC channel definitions
- **Message Handlers**: Message handling utilities
- **Event Emitters**: Event emission utilities
- **Communication Protocols**: Communication protocol definitions

**File Structure**:

```
packages/ipc/src/
├── channels/           # IPC channel definitions
├── handlers/           # Message handlers
├── events/             # Event emitters
├── protocols/          # Communication protocols
└── index.ts            # Main export file
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: @roo-code/types

**Used By**: Core extension, webview UI

### @roo-code/telemetry

**Purpose**: Telemetry and analytics utilities

**Key Exports**:

- **Telemetry Client**: Telemetry client implementation
- **Metrics Collection**: Metrics collection utilities
- **Event Tracking**: Event tracking utilities
- **Analytics**: Analytics and reporting utilities

**File Structure**:

```
packages/telemetry/src/
├── client/             # Telemetry client
├── metrics/            # Metrics collection
├── events/             # Event tracking
├── analytics/          # Analytics utilities
└── index.ts            # Main export file
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: @roo-code/types

**Used By**: Core extension, applications

## Configuration Packages

### @roo-code/config-eslint

**Purpose**: Shared ESLint configuration

**Key Exports**:

- **Base Config**: Base ESLint configuration
- **TypeScript Config**: TypeScript-specific rules
- **React Config**: React-specific rules
- **Custom Rules**: Custom ESLint rules

**File Structure**:

```
packages/config-eslint/
├── base.js             # Base configuration
├── typescript.js       # TypeScript configuration
├── react.js            # React configuration
├── rules/              # Custom rules
└── package.json        # Package configuration
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: None

**Used By**: All TypeScript packages

### @roo-code/config-typescript

**Purpose**: Shared TypeScript configuration

**Key Exports**:

- **Base Config**: Base TypeScript configuration
- **Strict Config**: Strict TypeScript configuration
- **React Config**: React-specific configuration
- **Node Config**: Node.js-specific configuration

**File Structure**:

```
packages/config-typescript/
├── base.json           # Base configuration
├── strict.json         # Strict configuration
├── react.json          # React configuration
├── node.json           # Node.js configuration
└── package.json        # Package configuration
```

**Status**: ✅ **Fully Implemented**

**Dependencies**: None

**Used By**: All TypeScript packages

## Package Dependencies

### Dependency Graph

```mermaid
graph TD
    TYPES[@roo-code/types]
    BUILD[@roo-code/build]
    CLOUD[@roo-code/cloud]
    EVALS[@roo-code/evals]
    IPC[@roo-code/ipc]
    TELEMETRY[@roo-code/telemetry]
    CONFIG_ESLINT[@roo-code/config-eslint]
    CONFIG_TYPESCRIPT[@roo-code/config-typescript]

    BUILD --> TYPES
    CLOUD --> TYPES
    EVALS --> TYPES
    IPC --> TYPES
    TELEMETRY --> TYPES
```

### External Dependencies

**Common Dependencies**:

- **TypeScript**: Type checking and compilation
- **React**: UI framework (for webview UI)
- **Node.js**: Runtime environment
- **VS Code API**: VS Code extension API

**Package-Specific Dependencies**:

- **@roo-code/cloud**: AWS SDK, Azure SDK
- **@roo-code/telemetry**: Analytics libraries
- **@roo-code/evals**: Testing frameworks

## Package Management

### Workspace Configuration

**Root Package.json**:

```json
{
	"name": "kilo-code",
	"private": true,
	"workspaces": ["packages/*", "apps/*", "src", "webview-ui"]
}
```

**Package Dependencies**: Managed through PNPM workspace

**Version Management**: Centralized version management

### Build Process

**Individual Package Builds**: Each package can be built independently

**Monorepo Builds**: All packages built together using Turbo

**Dependency Resolution**: PNPM handles dependency resolution

### Publishing

**NPM Registry**: Packages published to NPM registry

**Version Management**: Semantic versioning for all packages

**Release Process**: Automated release process with changesets

## Development Workflow

### Package Development

1. **Create Package**: `mkdir packages/new-package`
2. **Initialize Package**: `cd packages/new-package && pnpm init`
3. **Add Dependencies**: `pnpm add <dependency>`
4. **Implement Package**: Write package implementation
5. **Test Package**: `pnpm test`
6. **Build Package**: `pnpm build`

### Package Testing

**Unit Tests**: Individual package unit tests

**Integration Tests**: Package integration tests

**E2E Tests**: End-to-end package testing

### Package Documentation

**README**: Each package has its own README

**API Documentation**: Generated API documentation

**Examples**: Usage examples and samples

## Quality Assurance

### Code Quality

**Linting**: ESLint configuration for all packages

**Type Checking**: TypeScript strict mode for all packages

**Formatting**: Prettier for consistent formatting

### Testing

**Test Coverage**: Minimum 80% test coverage

**Test Types**: Unit, integration, and E2E tests

**Test Automation**: Automated test execution

### Documentation

**API Documentation**: Generated from TypeScript types

**Usage Examples**: Comprehensive usage examples

**Migration Guides**: Package migration and upgrade guides

## Next Steps

1. **Explore Applications**: See [APPLICATIONS.md](APPLICATIONS.md)
2. **Understand Testing**: See [TESTING_INFRASTRUCTURE.md](TESTING_INFRASTRUCTURE.md)
3. **Learn Development**: See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

## 🧭 Navigation Footer

- [← Back to Repository Home](README.md)
- [→ Applications](APPLICATIONS.md)
- [↑ Table of Contents](README.md)
