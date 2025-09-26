# Documentation Automation Setup Guide

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

This guide explains how to set up and use the automated documentation validation and maintenance
system for KiloCode.

## Overview

The documentation automation system uses Remark to validate markdown files and ensure they meet
KiloCode's documentation standards. It includes:
- Automated validation of markdown files
- Proactive maintenance tools
- Custom KiloCode-specific validation rules
- Integration with CI/CD pipeline
- IDE integration for real-time validation

## Installation

The documentation automation dependencies are already installed in the workspace. They include:
- `remark-cli` - Command-line interface for remark
- `remark-preset-lint-recommended` - Recommended linting rules
- `remark-validate-links` - Link validation
- `remark-toc` - Table of contents generation
- `remark-gfm` - GitHub Flavored Markdown support
- `remark-stringify` - Markdown stringification
- `remark-frontmatter` - Frontmatter support

## Configuration

The system is configured via `.remarkrc` in the project root:

```json
{
	"plugins": [
		"remark-preset-lint-recommended",
		"remark-gfm",
		"remark-frontmatter",
		"remark-toc",
		"remark-validate-links"
	],
	"settings": {
		"bullet": "-",
		"emphasis": "*",
		"fence": "`",
		"listItemIndent": "one",
		"rule": "-",
		"ruleRepetition": 3,
		"ruleSpaces": false,
		"strong": "*"
	},
	"validateLinks": {
		"repository": "roo-ai/kilo-code",
		"branches": ["main", "master"],
		"ignore": ["https://github.com/roo-ai/kilo-code/issues/*", "https://github.com/roo-ai/kilo-code/discussions/*"]
	}
}
```

## Usage

### Available Scripts
- `pnpm docs:validate` - Validate all documentation files (quiet mode)
- `pnpm docs:validate:verbose` - Validate all documentation files with detailed output
- `pnpm docs:fix` - Auto-fix common documentation issues
- `pnpm docs:maintain` - Run proactive maintenance tools
- `pnpm docs:report` - Generate detailed validation reports
- `pnpm docs:metrics` - Generate documentation metrics

### Basic Validation

To validate all documentation files:

```bash
pnpm docs:validate
```

To validate specific files:

```bash
remark path/to/file.md
```

### Auto-fixing Issues

Many common issues can be automatically fixed:

```bash
pnpm docs:fix
```

## Integration

### Pre-commit Hooks

Documentation validation is integrated into pre-commit hooks to ensure all documentation meets
standards before commits.

### CI/CD Pipeline

The system includes GitHub Actions workflows that validate documentation on pull requests and
pushes.

#### GitHub Actions Workflow

The documentation validation workflow (`.github/workflows/docs-validation.yml`) runs on:

- **Push events** to main/master branches when markdown files are changed
- **Pull request events** to main/master branches when markdown files are changed

The workflow includes two jobs:
1. **Documentation Validation**: Validates all documentation files using remark
2. **Documentation Maintenance**: Auto-fixes common issues and commits changes back to PRs

#### Workflow Features
- Validates documentation on every PR and push
- Generates detailed validation reports on failure
- Auto-maintains documentation by fixing common issues
- Uploads validation reports as artifacts for debugging
- Skips CI on auto-maintenance commits to prevent loops

### IDE Integration

VS Code integration provides real-time validation as you edit markdown files.

## Troubleshooting

### Common Issues
1. **Link validation errors**: Ensure all internal links use relative paths and external links are
   valid
2. **Literal URL warnings**: Wrap bare URLs in angle brackets `<url>`
3. **Heading hierarchy issues**: Ensure proper heading levels (no skipping levels)

### Getting Help

For issues with the documentation automation system:
1. Check the validation output for specific error messages
2. Review the documentation standards in `docs/DOCUMENTATION_GUIDE.md`
3. Use `pnpm docs:validate:verbose` for detailed error information

## Next Steps

After setup, the system will:
1. Validate all documentation on every commit
2. Provide real-time feedback in your IDE
3. Generate reports on documentation quality
4. Help maintain consistent documentation standards

For advanced configuration and custom rules, see the Phase 1 implementation plan in
`context/doc_automation/phase1.md`.

## Navigation Footer

- **

- *Navigation**: [docs](../docs/) · [↑ Table of Contents](#documentation-automation-setup-guide)
