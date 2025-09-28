# How Linter Names Make It to the `docs:validate` Output

## Table of Contents
- [How Linter Names Make It to the ](#how-linter-names-make-it-to-the)
- [When You're Here](#when-youre-here)
- [Overview](#overview)
- [Command Flow](#command-flow)
- [1. Command Execution](#1-command-execution)
- [2. Validation Script](#2-validation-script)
- [3. Remark Configuration](#3-remark-configuration)
- [Linter Categories and Names](#linter-categories-and-names)
- [1. Built-in Remark-Lint Plugins](#1-built-in-remark-lint-plugins)
- [2. Link Validation Plugin](#2-link-validation-plugin)
- [3. Custom KiloCode Plugins](#3-custom-kilocode-plugins)
- [A. ](#a)
- [B. ](#b)
- [How Linter Names Are Set](#how-linter-names-are-set)
- [1. Built-in Plugins](#1-built-in-plugins)
- [2. Custom Plugins](#2-custom-plugins)
- [3. Link Validation](#3-link-validation)
- [Output Format Structure](#output-format-structure)
- [Plugin Execution Order](#plugin-execution-order)
- [Key Points](#key-points)
- [Troubleshooting](#troubleshooting)
- [Related Files](#related-files)
- [Navigation](#navigation)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

This document explains the complete flow of how linter names appear in the `docs:validate` command
output, from configuration to final display.

## Overview

The `docs:validate` command uses a multi-layered validation system that combines built-in
remark-lint plugins, custom KiloCode plugins, and link validation tools. Each linter that detects an
issue contributes its name to the validation output.

## Command Flow

### 1. Command Execution

```bash
pnpm docs:validate
```

This executes the script defined in `package.json`:

```json
"docs:validate": "bash scripts/docs-validate.sh"
```

### 2. Validation Script

The `scripts/docs-validate.sh` script runs:

```bash
script -qfc "remark \"$TARGET\" --quiet > /dev/null" /dev/null
```

This invokes the `remark` CLI tool with the target directory (defaults to `docs/`).

### 3. Remark Configuration

Remark reads the `.remarkrc` configuration file:

```json
{
  "plugins": [
    "remark-preset-lint-recommended",
    "remark-gfm",
    "remark-frontmatter", 
    "remark-toc",
    "remark-validate-links",
    "./plugins/remark-kilocode-standards.js",
    "./plugins/remark-kilocode-comprehensive.js"
  ]
}
```

## Linter Categories and Names

### 1. Built-in Remark-Lint Plugins

The `remark-preset-lint-recommended` preset includes these plugins:
- `remark-lint:final-newline` - Ensures files end with newline
- `remark-lint:list-item-bullet-indent` - Validates list indentation
- `remark-lint:no-blockquote-without-marker` - Requires blockquote markers
- `remark-lint:no-literal-urls` - Prevents bare URLs
- `remark-lint:hard-break-spaces` - Validates hard break spacing
- `remark-lint:no-duplicate-definitions` - Prevents duplicate link definitions
- `remark-lint:no-heading-content-indent` - Validates heading content indentation
- `remark-lint:no-shortcut-reference-image` - Prevents shortcut image references
- `remark-lint:no-shortcut-reference-link` - Prevents shortcut link references
- `remark-lint:no-undefined-references` - Validates link references
- `remark-lint:no-unused-definitions` - Flags unused link definitions

**Output Format:**

```
151:36    warning    Unexpected missing final newline character    final-newline    remark-lint
```

### 2. Link Validation Plugin

The `remark-validate-links` plugin provides:
- `remark-validate-links:missing-file` - Missing file references
- `remark-validate-links:missing-heading` - Missing heading references

**Output Format:**

```
197:33-197:44    warning    Cannot find file `ui`    missing-file
remark-validate-links:missing-file
```

### 3. Custom KiloCode Plugins

#### A. `remark-kilocode-standards.js`

This plugin provides KiloCode-specific validation rules:
- `remark-kilocode-standards:kilocode-descriptive-links` - Non-descriptive link text
- `remark-kilocode-standards:kilocode-title-required` - Missing H1 title
- `remark-kilocode-standards:kilocode-research-context-required` - Missing Research Context
- `remark-kilocode-standards:kilocode-navigation-footer-required` - Missing navigation footer
- `remark-kilocode-standards:kilocode-fun-fact-suggestion` - Missing fun fact
- `remark-kilocode-standards:kilocode-heading-hierarchy` - Invalid heading hierarchy
- `remark-kilocode-standards:kilocode-no-dead-ends` - Dead end documents

#### B. `remark-kilocode-comprehensive.js`

This plugin provides advanced validation rules:
- `remark-kilocode-comprehensive:kilocode-title-required` - Missing H1 title
- `remark-kilocode-comprehensive:kilocode-research-context-required` - Missing Research Context
- `remark-kilocode-comprehensive:kilocode-navigation-footer-required` - Missing navigation footer
- `remark-kilocode-comprehensive:kilocode-no-dead-ends-required` - Missing No Dead Ends Policy
- `remark-kilocode-comprehensive:kilocode-when-youre-here-required` - Missing When You're Here
  section
- `remark-kilocode-comprehensive:kilocode-fun-fact-suggestion` - Missing fun fact
- `remark-kilocode-comprehensive:kilocode-heading-hierarchy` - Invalid heading hierarchy
- `remark-kilocode-comprehensive:kilocode-heading-progression` - Poor heading progression
- `remark-kilocode-comprehensive:kilocode-content-length` - Content too short
- `remark-kilocode-comprehensive:kilocode-link-density` - Link density issues
- `remark-kilocode-comprehensive:kilocode-heading-structure` - Poor heading structure
- `remark-kilocode-comprehensive:kilocode-quality-threshold` - Quality score below threshold
- `remark-kilocode-comprehensive:kilocode-cross-reference` - Invalid cross-references
- `remark-kilocode-comprehensive:kilocode-orphaned-document` - Orphaned documents
- `remark-kilocode-comprehensive:kilocode-orphaned-sections` - Orphaned sections

**Output Format:**

```
1:1-1:51    warning    Document must include No Dead Ends Policy
remark-kilocode-comprehensive:kilocode-no-dead-ends-required
```

## How Linter Names Are Set

### 1. Built-in Plugins

Built-in remark-lint plugins automatically set their source and ruleId:

```javascript
// Example from remark-lint:final-newline
file.message('Unexpected missing final newline character', {
  ruleId: 'final-newline',
  source: 'remark-lint'
})
```

### 2. Custom Plugins

Custom KiloCode plugins explicitly set the source and ruleId:

```javascript
// From remark-kilocode-standards.js
const message = file.message(issue.message, {
  start: { line: issue.line, column: issue.column },
  end: { line: issue.line, column: issue.column + 50 },
  ruleId: issue.rule,  // e.g., "kilocode-descriptive-links"
  severity: issue.type === "error" ? "error" : "warning",
  source: "remark-kilocode-standards",  // Plugin name
})
```

### 3. Link Validation

The `remark-validate-links` plugin sets names like:

```javascript
file.message('Cannot find file `' + file + '`', {
  ruleId: 'missing-file',
  source: 'remark-validate-links:missing-file'
})
```

## Output Format Structure

Each validation message follows this format:

```
LINE:COLUMN    SEVERITY    MESSAGE    RULE_ID    SOURCE
```

**Example:**

```
151:36    warning    Unexpected missing final newline character    final-newline    remark-lint
```

Where:
- `151:36` - Line and column position
- `warning` - Severity level (warning/error)
- `Unexpected missing final newline character` - Human-readable message
- `final-newline` - Rule identifier
- `remark-lint` - Source plugin name

## Plugin Execution Order

Plugins are executed in the order defined in `.remarkrc`:
1. `remark-preset-lint-recommended` (built-in rules)
2. `remark-gfm` (GitHub Flavored Markdown)
3. `remark-frontmatter` (frontmatter parsing)
4. `remark-toc` (table of contents)
5. `remark-validate-links` (link validation)
6. `./plugins/remark-kilocode-standards.js` (KiloCode standards)
7. `./plugins/remark-kilocode-comprehensive.js` (KiloCode comprehensive)

## Key Points
1. **Source Names**: The `source` field identifies which plugin generated the message
2. **Rule IDs**: The `ruleId` field identifies the specific rule within that plugin
3. **Custom Plugins**: KiloCode custom plugins use descriptive rule IDs like
   `kilocode-descriptive-links`
4. **Built-in Plugins**: Use simple rule IDs like `final-newline` or `no-literal-urls`
5. **Link Validation**: Uses compound source names like `remark-validate-links:missing-file`

## Troubleshooting

If linter names don't appear in output:
1. Check that plugins are properly configured in `.remarkrc`
2. Verify that custom plugins export the correct function signature
3. Ensure that `file.message()` calls include both `ruleId` and `source` parameters
4. Check that the plugin is actually being executed (add console.log for debugging)

## Related Files
- `.remarkrc` - Main configuration file
- `plugins/remark-kilocode-standards.js` - Basic KiloCode validation
- `plugins/remark-kilocode-comprehensive.js` - Advanced KiloCode validation
- `scripts/docs-validate.sh` - Validation script
- `package.json` - Command definitions

## Navigation
- [← Tools Overview](README.md)
- [← Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- [← Validation Errors Guide](VALIDATION_ERRORS_GUIDE.md)
- [← Remark Workflow Overview](REMARK_WORKFLOW_OVERVIEW.md)
- [← Documentation Best Practices](DOCUMENTATION_BEST_PRACTICES.md)
- [← Main Documentation](../README.md)
- [← Project Root](../README.md)
