# KiloCode Documentation Fixer

Automated tool for fixing documentation warnings and issues.

## Quick Start

### Fix Documentation Issues

```bash
# From project root - fix all issues and validate (main command)
pnpm docs:fix

# Preview changes without modifying files
pnpm docs:check
```

### Run Tests

```bash
# Test the documentation fixer
pnpm docs:fixer:test

# Run tests with watch mode
cd scripts/docs-fixes && npm run test:watch
```

### Generate Documentation

```bash
# Generate API docs and guides
pnpm docs:fixer:docs
```

## What Gets Fixed

The documentation fixer runs 4 automated fixers in sequence:

### 1. **List Indentation Fixes**

Removes leading spaces from list items and unifies bullet styles for remark-lint compliance.

### 2. **Path Issue Corrections**

Fixes relative path depth issues and corrects broken cross-references using AST-based precision.

### 3. **Link Text Improvements**

Converts non-descriptive link text to descriptive text for better accessibility.

### 4. **Navigation Footer Automation**

Adds context-aware navigation footers based on document location to improve discoverability.

📖 **For detailed examples, implementation details, and source code links, see [COMPREHENSIVE_FIXERS.md](./COMPREHENSIVE_FIXERS.md)**

📚 **For information about the auto-generated examples system, see [AUTO_GENERATED_EXAMPLES.md](./AUTO_GENERATED_EXAMPLES.md)**

## Command Reference

| Command                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `pnpm docs:fix`        | Fix all issues and run validation (main command) |
| `pnpm docs:check`      | Preview changes without modifying files          |
| `pnpm docs:validate`   | Validate only (no fixes)                         |
| `pnpm docs:fixer:test` | Run comprehensive test suite                     |
| `pnpm docs:fixer:docs` | Generate documentation                           |

## Advanced Usage

### Direct Script Usage

```bash
# From project root
node scripts/docs-fixer.js --help
node scripts/docs-fixer.js --dry-run --verbose
node scripts/docs-fixer.js --validate
```

### Programmatic Usage

```javascript
import { main } from "./scripts/docs-fixes/src/docs-fixer.js"

await main({
	dryRun: true, // Preview mode
	verbose: true, // Detailed output
	validate: true, // Run validation after
})
```

## Example Output

```
KiloCode Documentation Fixer
============================

  Path fix: ../GLOSSARY.md → ../../GLOSSARY.md
  Path fix: ../README.md → ../../README.md
Fixed 2 issues in: docs/orchestrator/README.md

Summary:
- Files processed: 152
- Files modified: 60
- Total fixes applied: 156
- Path issue fixes: 156
```

## Common Use Cases

### Before Committing

```bash
# Check for issues before committing
pnpm docs:check
```

### CI/CD Integration

```bash
# Fix issues and validate in CI
pnpm docs:fix
```

### Development Workflow

```bash
# Quick fix during development
pnpm docs:fix
```

## Documentation

- **API Reference**: `scripts/docs-fixes/docs/generated/api-reference.md`
- **Examples**: `scripts/docs-fixes/docs/generated/examples.md`
- **Configuration**: `scripts/docs-fixes/docs/generated/configuration-guide.md`

## Installation

The documentation fixer is part of the KiloCode project. To use it:

```bash
# Navigate to the docs-fixes directory
cd scripts/docs-fixes

# Install dependencies (if needed)
npm install

# Make the script executable
chmod +x src/docs-fixer.js
```

## Overview

The KiloCode Documentation Fixer is designed to systematically address common markdown documentation problems including:

- **Path Issues**: Incorrect relative path references between documents
- **Link Text Improvements**: Making link text more descriptive and accessible
- **Formatting**: List indentation and other formatting issues
- **Structure**: Adding navigation footers and improving document connectivity
- **Validation**: Integration with remark validation tools

## Features

### Automated Fixes

- **Path Corrections**: Automatically fixes incorrect relative path references based on directory structure
- **Link Text Enhancement**: Converts generic file names to descriptive link text
- **Navigation Footers**: Adds context-appropriate navigation footers to documents
- **List Formatting**: Fixes list item indentation issues
- **Cross-Reference Validation**: Ensures internal links are valid

### Smart Context Awareness

- **Directory-Based Templates**: Different navigation templates based on document location
- **Path Depth Calculation**: Automatically calculates correct relative paths based on file location
- **Pattern Matching**: Uses regex patterns to identify and fix specific issues

### Testing & Validation

- **Comprehensive Test Suite**: Full test coverage for all fixing functionality
- **Ultra-Simplified Test Structure**: Tests use `validateFixerResolvesLintErrors` helper for maximum consistency
- **Lint Integration**: Tests validate that fixers resolve actual remark-lint errors
- **Auto-Generated Examples**: Documentation examples generated directly from test data
- **Dry Run Mode**: Preview changes without modifying files
- **Validation Integration**: Runs remark validation after fixes
- **Error Handling**: Robust error handling and reporting

## Configuration

The fixer uses a flexible configuration system with predefined patterns and templates. See the [Configuration Guide](docs/generated/configuration-guide.md) for details on customizing behavior.

## Performance

- **Speed**: Processes 152 files in ~10.6 seconds
- **Efficiency**: Optimized for regular use in development workflows
- **Memory**: Minimal memory footprint with streaming processing

## Contributing

The documentation fixer is designed to be extensible. See the [API Reference](docs/generated/api-reference.md) for details on adding new fix patterns and extending functionality.

## Additional Resources

- [Comprehensive Fixers Documentation](./COMPREHENSIVE_FIXERS.md) - Detailed information about each fixer with examples
- [Auto-Generated Examples System](./AUTO_GENERATED_EXAMPLES.md) - How the test-driven documentation system works
- [Remark List Plugins Analysis](./REMARK_LINT_LIST_PLUGINS_ANALYSIS.md) - Deep dive into the 4 main remark-lint list plugins and how they work together

---

**Ready to use!** The documentation fixer is designed to be safe, fast, and comprehensive in addressing documentation issues automatically.
