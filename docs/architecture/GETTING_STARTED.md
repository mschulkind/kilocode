# Getting Started Guide

**Purpose:** Comprehensive guide for new developers, contributors, and users to understand and get started with KiloCode development.

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Environment Setup](#development-environment-setup)
- [Understanding the Codebase](#understanding-the-codebase)
- [Core Concepts](#core-concepts)
- [Development Workflow](#development-workflow)
- [Testing & Quality](#testing--quality)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)
- [Navigation Footer](#navigation-footer)

</details>

## Executive Summary

_KiloCode is a comprehensive VS Code extension for AI-powered coding assistance. This guide provides everything needed to understand, set up, and contribute to the project._

**What You'll Learn:**

- How to set up a development environment
- Core architecture and key concepts
- Development workflow and best practices
- How to contribute effectively

**Time to Complete:** 30-45 minutes

## Prerequisites

### Required Knowledge

- **JavaScript/TypeScript** - Intermediate level
- **Node.js** - Basic understanding
- **VS Code Extension Development** - Helpful but not required
- **Git** - Basic version control

### System Requirements

- **Node.js**: 20.19.2 (see `.nvmrc`)
- **pnpm**: 10.8.1+ (package manager)
- **Git**: Latest stable version
- **VS Code**: 1.84.0+ (for extension development)

### Development Environment Options

#### Option 1: Native Development (Recommended)

```bash
# Install Node.js 20.19.2
nvm install 20.19.2
nvm use 20.19.2

# Install pnpm
npm install -g pnpm@10.8.1

# Verify installations
node --version  # Should be 20.19.2
pnpm --version  # Should be 10.8.1+
```

#### Option 2: Dev Container (Windows/Cross-platform)

```bash
# Prerequisites: Docker Desktop + VS Code + Dev Containers extension
# Clone repository
git clone https://github.com/Kilo-Org/kilocode.git
cd kilocode

# Open in VS Code and select "Reopen in Container"
# All dependencies automatically installed
```

#### Option 3: Nix Flake (NixOS/Nix users)

```bash
# Prerequisites: Nix with flakes + direnv
git clone https://github.com/Kilo-Org/kilocode.git
cd kilocode

# Automatic environment setup
direnv allow
```

## Quick Start

### 1. Clone and Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/kilocode.git
cd kilocode

# Install dependencies
pnpm install

# Build the extension
pnpm build
```

### 2. Run in Development Mode

```bash
# Open in VS Code
code .

# Press F5 to start debugging
# This opens a new VS Code window with KiloCode loaded
```

### 3. Verify Installation

1. **Open the new VS Code window** (Extension Development Host)
2. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. **Type "Kilo Code"** - you should see KiloCode commands
4. **Click the KiloCode icon** in the Activity Bar to open the sidebar

## Development Environment Setup

### VS Code Extensions (Recommended)

**Required Extensions:**

- [ESBuild Problem Matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers)

**Recommended Extensions:**

```json
{
	"recommendations": [
		"dbaeumer.vscode-eslint",
		"esbenp.prettier-vscode",
		"bradlc.vscode-tailwindcss",
		"ms-vscode.vscode-typescript-next"
	]
}
```

### Environment Configuration

**Development Configuration:**

```bash
# .env.development
NODE_ENV=development
ENABLE_DEBUG_LOGGING=true
ENABLE_HOT_RELOAD=true
```

**Git Configuration:**

```bash
# Setup Git hooks
git config core.hooksPath .husky

# Configure remotes (if contributing)
git remote add upstream https://github.com/Kilo-Org/kilocode.git
```

### Workspace Structure

```
kilocode/
├── src/                    # Core extension code
│   ├── core/              # Core functionality
│   ├── services/          # Service implementations
│   └── api/               # API integrations
├── webview-ui/            # React frontend
├── packages/              # Shared libraries
├── apps/                  # Applications (docs, tests)
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

## Understanding the Codebase

### Architecture Overview

```mermaid
graph TB
    subgraph "VS Code Extension"
        UI[Webview UI<br/>React Frontend]
        EXT[Extension Host<br/>Node.js Backend]
    end

    subgraph "Core Systems"
        TASK[Task Engine<br/>Orchestration]
        MSG[Message Queue<br/>Communication]
        TOOLS[Tool System<br/>AI Tools]
    end

    subgraph "External Services"
        AI[AI Providers<br/>Claude, GPT, etc.]
        CLOUD[Cloud Services<br/>Authentication]
    end

    UI <--> EXT
    EXT --> TASK
    TASK --> MSG
    TASK --> TOOLS
    TOOLS --> AI
    EXT --> CLOUD
```

### Key Components

#### 1. Extension Host (`src/extension.ts`)

```typescript
// Main entry point
export async function activate(context: ExtensionContext) {
	// Initialize core services
	const clineProvider = new ClineProvider(context)

	// Register providers
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("kilo-code.SidebarProvider", clineProvider))
}
```

#### 2. Task Engine (`src/core/task/Task.ts`)

```typescript
// Core orchestration engine
export class Task {
	async initiateTaskLoop() {
		// Main execution loop
		while (this.state === TaskState.RUNNING) {
			await this.recursivelyMakeClineRequests()
		}
	}
}
```

#### 3. Webview UI (`webview-ui/src/components/`)

```typescript
// React frontend components
export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([])

  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  )
}
```

### File Organization

**Core Extension Files:**

- `src/extension.ts` - Main extension entry point
- `src/core/webview/ClineProvider.ts` - Webview management
- `src/core/task/Task.ts` - Task orchestration
- `src/core/webview/webviewMessageHandler.ts` - Message handling

**Frontend Files:**

- `webview-ui/src/components/chat/ChatView.tsx` - Main chat interface
- `webview-ui/src/components/settings/SettingsView.tsx` - Settings UI
- `webview-ui/src/utils/` - Utility functions

**Service Files:**

- `src/services/laminar/LaminarService.ts` - Observability
- `src/services/cloud/CloudService.ts` - Cloud integration
- `src/api/providers/` - AI provider implementations

## Core Concepts

### 1. Task Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Task
    participant AI
    participant Tools

    User->>UI: Send message
    UI->>Task: Create task
    Task->>AI: Generate response
    AI->>Task: Response with tools
    Task->>Tools: Execute tools
    Tools->>Task: Tool results
    Task->>AI: Continue with results
    AI->>Task: Final response
    Task->>UI: Display result
```

### 2. Message Flow

**UI to Extension:**

```typescript
// Webview sends message
vscode.postMessage({
	type: "newTask",
	text: userInput,
	images: selectedImages,
})
```

**Extension to UI:**

```typescript
// Extension responds
webview.postMessage({
	type: "taskUpdate",
	taskId: task.id,
	state: task.state,
	messages: task.messages,
})
```

### 3. Tool System

**Tool Definition:**

```typescript
export async function writeToFileTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
) {
	// Tool implementation
	const { path, content } = block.input
	await fs.writeFile(path, content)
	pushToolResult("File written successfully")
}
```

### 4. AI Provider Integration

**Provider Abstraction:**

```typescript
interface AIProvider {
	generateResponse(prompt: string, options: GenerationOptions): Promise<AIResponse>
	streamResponse(prompt: string, options: GenerationOptions): AsyncIterable<AIChunk>
}

// Usage
const provider = new AnthropicProvider(apiKey)
const response = await provider.generateResponse(prompt, options)
```

## Development Workflow

### 1. Making Changes

**Hot Reloading:**

- **Webview changes**: Automatically reload
- **Extension changes**: Auto-reload extension host
- **Configuration changes**: Restart required

**Development Commands:**

```bash
# Watch mode for webview
cd webview-ui && pnpm dev

# Watch mode for extension
cd src && pnpm watch:tsc

# Full development build
pnpm build
```

### 2. Debugging

**Extension Debugging:**

```typescript
// Use console.log for debugging
console.log("Task state:", task.state)
console.log("Message received:", message)

// Check VS Code Developer Tools
// Help > Toggle Developer Tools
```

**Webview Debugging:**

```typescript
// Right-click in webview > "Inspect Element"
// Use browser developer tools
console.log("UI state:", uiState)
```

**Debug Configuration:**

```json
{
	"type": "extensionHost",
	"request": "launch",
	"name": "Launch Extension",
	"runtimeExecutable": "${execPath}",
	"args": ["--extensionDevelopmentPath=${workspaceFolder}"]
}
```

### 3. Testing Changes

**Unit Tests:**

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/core/task/Task.test.ts

# Watch mode
pnpm test --watch
```

**Integration Tests:**

```bash
# Run E2E tests
pnpm playwright

# Run VS Code extension tests
pnpm test:extension
```

### 4. Building and Packaging

**Development Build:**

```bash
pnpm build
# Creates development .vsix file
```

**Production Build:**

```bash
pnpm build:production
# Creates optimized .vsix file
```

**Install Locally:**

```bash
# Install the built extension
code --install-extension bin/kilo-code-*.vsix
```

## Testing & Quality

### Test Structure

**Unit Tests:**

- `src/**/*.test.ts` - Core functionality tests
- `webview-ui/src/**/*.test.tsx` - UI component tests

**Integration Tests:**

- `apps/playwright-e2e/` - End-to-end browser tests
- `apps/vscode-e2e/` - VS Code extension tests

**Test Commands:**

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm playwright

# Run specific test suite
pnpm test --grep "Task lifecycle"
```

### Code Quality

**Linting:**

```bash
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

**Type Checking:**

```bash
# Check TypeScript types
pnpm check-types

# Watch mode
pnpm watch:types
```

**Formatting:**

```bash
# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check
```

### Quality Gates

**Pre-commit Hooks:**

- Type generation
- Linting and formatting
- Basic tests

**Pre-push Hooks:**

- Full type checking
- Test suite
- Changeset validation

## Contributing

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR-USERNAME/kilocode.git
cd kilocode

# Add upstream remote
git remote add upstream https://github.com/Kilo-Org/kilocode.git
```

### 2. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: add your feature description"
```

### 3. Submit Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
# Fill out PR template
# Request review
```

### 4. Code Review Process

**Review Checklist:**

- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered

### 5. Contribution Guidelines

**Commit Message Format:**

```
type(scope): description

- Detailed description
- Breaking changes (if any)
- Resolves #issue-number
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

## Troubleshooting

### Common Issues

#### 1. Extension Not Loading

```bash
# Check VS Code Developer Tools
# Help > Toggle Developer Tools > Console

# Common causes:
# - Missing dependencies
# - TypeScript errors
# - VS Code version incompatibility
```

#### 2. Webview Not Updating

```bash
# Check webview developer tools
# Right-click in webview > Inspect Element

# Common causes:
# - Message handler errors
# - React component errors
# - State management issues
```

#### 3. Build Failures

```bash
# Clear build cache
pnpm clean
rm -rf node_modules
pnpm install

# Check Node.js version
node --version  # Should be 20.19.2
```

#### 4. Test Failures

```bash
# Run tests with verbose output
pnpm test --verbose

# Check test environment
pnpm test --run --reporter=verbose
```

### Debugging Tips

**Enable Debug Logging:**

```typescript
// In development mode
process.env.NODE_ENV = "development"
console.log("Debug info:", debugData)
```

**Use VS Code Debugger:**

```json
// .vscode/launch.json
{
	"type": "extensionHost",
	"request": "launch",
	"name": "Launch Extension",
	"runtimeExecutable": "${execPath}",
	"args": ["--extensionDevelopmentPath=${workspaceFolder}"]
}
```

**Check Extension Logs:**

```bash
# VS Code extension logs
# Help > Toggle Developer Tools > Console
# Look for "KiloCode" or "kilo-code" messages
```

### Getting Help

**Documentation:**

- [System Overview](SYSTEM_OVERVIEW.md) - Architecture details
- [Repository Overview](REPOSITORY_OVERVIEW.md) - Codebase structure
- [API Provider Patterns](API_PROVIDER_PATTERNS.md) - AI integration

**Community:**

- [GitHub Issues](https://github.com/Kilo-Org/kilocode/issues) - Bug reports
- [GitHub Discussions](https://github.com/Kilo-Org/kilocode/discussions) - Questions
- [Discord](https://discord.gg/Ja6BkfyTzJ) - Real-time chat

## Next Steps

### Immediate Next Steps

1. **Explore the Codebase:**

    - Read [System Overview](SYSTEM_OVERVIEW.md)
    - Review [Repository Overview](REPOSITORY_OVERVIEW.md)
    - Check [External Dependencies](EXTERNAL_DEPENDENCIES.md)

2. **Try Development:**

    - Make a small change (e.g., update a UI text)
    - Run tests to verify
    - Build and test locally

3. **Understand Architecture:**
    - Study the [Task Engine](orchestrator/INDEX.md)
    - Review [Tool System](tools/TOOL_SYSTEM_ARCHITECTURE.md)
    - Explore [Service Layer](services/INDEX.md)

### Learning Paths

#### For New Contributors

1. [Getting Started Guide](GETTING_STARTED.md) ← You are here
2. [System Overview](SYSTEM_OVERVIEW.md)
3. [Repository Overview](REPOSITORY_OVERVIEW.md)
4. [Tool System Architecture](tools/TOOL_SYSTEM_ARCHITECTURE.md)
5. [Documentation Guide](../DOCUMENTATION_GUIDE.md) - Contribution standards

#### For Experienced Developers

1. [System Overview](SYSTEM_OVERVIEW.md)
2. [API Provider Patterns](API_PROVIDER_PATTERNS.md)
3. [External Dependencies](EXTERNAL_DEPENDENCIES.md)
4. [Upstream/Downstream Integration](UPSTREAM_DOWNSTREAM_INTEGRATION.md)
5. [Priority Improvements](../improvements/PRIORITY_IMPROVEMENTS.md)

#### For System Administrators

1. [Repository Overview](REPOSITORY_OVERVIEW.md)
2. [Build Pipeline Architecture](../build/BUILD_PIPELINE_ARCHITECTURE.md)
3. [Testing Strategy](../testing/TESTING_STRATEGY.md)
4. [External Dependencies](EXTERNAL_DEPENDENCIES.md)

### Recommended Reading

**Essential Documents:**

- [System Overview](SYSTEM_OVERVIEW.md) - Complete architecture
- [Repository Overview](REPOSITORY_OVERVIEW.md) - Codebase structure
- [External Dependencies](EXTERNAL_DEPENDENCIES.md) - Dependencies and libraries

**Advanced Topics:**

- [Upstream/Downstream Integration](UPSTREAM_DOWNSTREAM_INTEGRATION.md) - Code transfer processes
- [Priority Improvements](../improvements/PRIORITY_IMPROVEMENTS.md) - Development roadmap
- [Technical Debt](../improvements/TECHNICAL_DEBT.md) - Known issues and solutions

**Troubleshooting:**

- [Duplicate API Requests Root Cause Analysis](DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md)
- [Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md)

---

**🎉 Congratulations!** You're now ready to start developing with KiloCode. Remember to:

- Follow the development workflow
- Write tests for your changes
- Update documentation as needed
- Ask questions in the community channels

Happy coding! 🚀

<a id="navigation-footer"></a>

- Back: [`REPOSITORY_OVERVIEW.md`](REPOSITORY_OVERVIEW.md) · Root: [`INDEX.md`](../INDEX.md) · Source: `/docs/architecture/GETTING_STARTED.md#L1`
