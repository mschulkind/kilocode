# Development Guide

**Purpose:** Comprehensive guide for developing and contributing to KiloCode.

> **Dinosaur Fun Fact**: Architecture documentation is like a dinosaur fossil record - each layer tells us about the evolution of our system, helping us understand how it grew and changed over time! 🦕

## Getting Started

### Prerequisites

**Required Software**:

- **Node.js**: Version 18 or higher
- **PNPM**: Package manager
- **Git**: Version control
- **VS Code**: Development environment

**Installation**:

```bash
# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install PNPM
npm install -g pnpm

# Install Git
# Follow platform-specific installation instructions
```

### Repository Setup

**Clone Repository**:

```bash
git clone https://github.com/mschulkind/kilocode.git
cd kilocode
```

**Install Dependencies**:

```bash
pnpm install
```

**Build Project**:

```bash
turbo build
```

**Start Development**:

```bash
turbo dev
```

## Development Workflow

### Branch Strategy

**Main Branches**:

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/\***: Feature development branches
- **hotfix/\***: Critical bug fixes

**Branch Naming**:

- **feature/description**: Feature development
- **bugfix/description**: Bug fixes
- **hotfix/description**: Critical fixes
- **chore/description**: Maintenance tasks

### Commit Strategy

**Commit Message Format**:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:

- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code style changes
- **refactor**: Code refactoring
- **test**: Test changes
- **chore**: Maintenance tasks

**Examples**:

```
feat(api): add OpenAI integration
fix(ui): resolve chat message display issue
docs(readme): update installation instructions
```

### Pull Request Process

**Before Creating PR**:

1. **Update Branch**: `git pull origin develop`
2. **Run Tests**: `turbo test`
3. **Run Linting**: `turbo lint`
4. **Check Types**: `turbo type-check`
5. **Build Project**: `turbo build`

**PR Requirements**:

- **Description**: Clear description of changes
- **Tests**: Include relevant tests
- **Documentation**: Update documentation if needed
- **Screenshots**: Include screenshots for UI changes
- **Breaking Changes**: Document breaking changes

## Code Standards

### TypeScript Standards

**Configuration**: `@roo-code/config-typescript`

**Key Rules**:

- **Strict Mode**: Always use strict mode
- **No Any**: Avoid `any` type
- **Explicit Types**: Use explicit type annotations
- **Interface Naming**: Use PascalCase for interfaces

**Example**:

```typescript
interface User {
	id: string
	name: string
	email: string
}

function createUser(userData: Omit<User, "id">): User {
	return {
		id: generateId(),
		...userData,
	}
}
```

### React Standards

**Configuration**: React-specific ESLint rules

**Key Rules**:

- **Functional Components**: Prefer functional components
- **Hooks**: Use hooks for state management
- **Props Interface**: Define props interfaces
- **Component Naming**: Use PascalCase for components

**Example**:

```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export function Button({ children, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
```

### Testing Standards

**Test Structure**:

```typescript
describe("ComponentName", () => {
	describe("when condition", () => {
		it("should do something", () => {
			// Arrange
			const input = "test input"

			// Act
			const result = functionUnderTest(input)

			// Assert
			expect(result).toBe("expected output")
		})
	})
})
```

**Test Coverage**: Minimum 80% coverage

**Test Types**:

- **Unit Tests**: Individual function testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: End-to-end workflow testing

## Project Structure

### Monorepo Organization

**Root Level**:

```
kilocode/
├── src/                 # Core extension
├── webview-ui/          # React UI
├── packages/            # Shared packages
├── apps/                # Applications
├── docs/                # Documentation
├── scripts/             # Build scripts
└── turbo.json           # Turbo configuration
```

**Package Structure**:

```
packages/package-name/
├── src/                 # Source code
├── dist/                # Build output
├── tests/               # Test files
├── package.json         # Package configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Package documentation
```

### File Organization

**Naming Conventions**:

- **Files**: kebab-case (e.g., `user-service.ts`)
- **Directories**: kebab-case (e.g., `user-management/`)
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Interfaces**: PascalCase (e.g., `UserProfile.ts`)
- **Types**: PascalCase (e.g., `UserProfile.ts`)

**Directory Structure**:

```
src/
├── components/          # React components
├── services/            # Business logic
├── utils/               # Utility functions
├── types/               # Type definitions
├── hooks/               # Custom hooks
└── __tests__/           # Test files
```

## Development Tools

### VS Code Setup

**Recommended Extensions**:

- **TypeScript**: TypeScript support
- **ESLint**: ESLint integration
- **Prettier**: Code formatting
- **GitLens**: Git integration
- **Thunder Client**: API testing
- **REST Client**: REST API testing

**Settings**:

```json
{
	"typescript.preferences.importModuleSpecifier": "relative",
	"editor.formatOnSave": true,
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"files.exclude": {
		"**/node_modules": true,
		"**/dist": true,
		"**/.turbo": true
	}
}
```

### Git Configuration

**Global Configuration**:

```gitconfig
[user]
  name = "Your Name"
  email = "your.email@example.com"
[core]
  autocrlf = input
  safecrlf = true
[push]
  default = simple
[init]
  defaultBranch = main
```

**Repository Configuration**:

```gitconfig
[core]
  autocrlf = input
  safecrlf = true
[push]
  default = simple
[merge]
  tool = vscode
[diff]
  tool = vscode
```

## Testing

### Running Tests

**All Tests**:

```bash
turbo test
```

**Specific Package**:

```bash
cd packages/package-name
pnpm test
```

**Watch Mode**:

```bash
turbo test --watch
```

**Coverage**:

```bash
turbo test --coverage
```

### Test Types

**Unit Tests**:

- **Location**: `__tests__/` directories
- **Naming**: `*.test.ts` or `*.spec.ts`
- **Framework**: Vitest
- **Coverage**: Individual functions and components

**Integration Tests**:

- **Location**: `tests/integration/`
- **Naming**: `*.integration.test.ts`
- **Framework**: Vitest
- **Coverage**: Component interactions

**E2E Tests**:

- **Location**: `apps/playwright-e2e/tests/`
- **Naming**: `*.e2e.test.ts`
- **Framework**: Playwright
- **Coverage**: Complete user workflows

## Building

### Build Commands

**Build All**:

```bash
turbo build
```

**Build Specific Package**:

```bash
cd packages/package-name
pnpm build
```

**Build Applications**:

```bash
turbo build:apps
```

**Build Extension**:

```bash
turbo build:extension
```

### Build Output

**Package Output**:

- **Location**: `packages/*/dist/`
- **Format**: CommonJS and ES modules
- **Types**: Declaration files (`.d.ts`)

**Application Output**:

- **Location**: `apps/*/dist/`
- **Format**: Optimized bundles
- **Assets**: Static assets and resources

## Debugging

### VS Code Debugging

**Launch Configuration**:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Debug Extension",
			"type": "node",
			"request": "launch",
			"program": "${workspaceFolder}/src/extension.ts",
			"outFiles": ["${workspaceFolder}/dist/**/*.js"],
			"preLaunchTask": "npm: build"
		}
	]
}
```

**Debug Tasks**:

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"label": "build",
			"type": "npm",
			"script": "build",
			"group": "build",
			"presentation": {
				"echo": true,
				"reveal": "silent",
				"focus": false,
				"panel": "shared"
			}
		}
	]
}
```

### Console Debugging

**Logging**:

```typescript
import { logger } from "@roo-code/telemetry"

logger.info("Debug message", { context: "debug" })
logger.error("Error message", { error: new Error("test") })
```

**Debug Mode**:

```bash
DEBUG=* pnpm dev
```

## Deployment

### Local Deployment

**Extension Development**:

```bash
# Build extension
turbo build:extension

# Package extension
cd src
npx vsce package

# Install extension
code --install-extension kilo-code-1.0.0.vsix
```

**Web Applications**:

```bash
# Build application
turbo build:apps

# Start development server
cd apps/app-name
pnpm dev
```

### Production Deployment

**Extension Publishing**:

```bash
# Build and package
turbo build:extension
cd src
npx vsce publish
```

**Web Application Deployment**:

```bash
# Build application
turbo build:apps

# Deploy to hosting platform
# Follow platform-specific deployment instructions
```

## Troubleshooting

### Common Issues

**Dependency Issues**:

```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Build Issues**:

```bash
# Clean build
turbo clean
turbo build
```

**Test Issues**:

```bash
# Clear test cache
turbo test --no-cache
```

### Getting Help

**Documentation**: Check relevant documentation files

**Issues**: Search existing GitHub issues

**Discussions**: Use GitHub Discussions for questions

**Code Review**: Ask for code review on pull requests

## Next Steps

1. **Explore Repository**: See [REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md)
2. **Understand Core Systems**: See [CORE_SYSTEMS.md](CORE_SYSTEMS.md)
3. **Learn Testing**: See [TESTING_INFRASTRUCTURE.md](TESTING_INFRASTRUCTURE.md)

## 🧭 Navigation Footer

- [← Back to Repository Home](README.md)
- [→ Repository Structure](REPOSITORY_STRUCTURE.md)
- [↑ Table of Contents](README.md)
