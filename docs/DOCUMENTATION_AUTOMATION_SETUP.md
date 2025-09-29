# Documentation Automation Setup Guide

## Table of Contents

* [Documentation Automation Setup Guide](#documentation-automation-setup-guide)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Overview](#overview)
* [Usage](#usage)
* [Available Scripts](#available-scripts)
* [Basic Validation](#basic-validation)
* [Auto-fixing Issues](#autofixing-issues)
* [Pre-commit Hooks](#precommit-hooks)
* [CI/CD Pipeline](#cicd-pipeline)
* [GitHub Actions Workflow](#github-actions-workflow)
* [Workflow Features](#workflow-features)
* [IDE Integration](#ide-integration)
* [Common Issues](#common-issues)
* [Getting Help](#getting-help)
* [Navigation Footer](#navigation-footer)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation](#navigation)
* [Documentation Automation Setup Guide](#documentation-automation-setup-guide)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Overview](#overview)
* [Usage](#usage)
* [Available Scripts](#available-scripts)
* [Basic Validation](#basic-validation)
* [Auto-fixing Issues](#autofixing-issues)
* [Pre-commit Hooks](#precommit-hooks)
* [CI/CD Pipeline](#cicd-pipeline)
* [GitHub Actions Workflow](#github-actions-workflow)
* [Workflow Features](#workflow-features)
* [IDE Integration](#ide-integration)
* [Common Issues](#common-issues)
* [Getting Help](#getting-help)
* [Navigation Footer](#navigation-footer)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

* **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
* **Context**: Use this as a starting point or reference while navigating the project.
* **Navigation**: Use the table of contents below to jump to specific topics.

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
> documentation helps us understand how! ⚙️

This guide explains how to set up and use the automated documentation validation and maintenance
system for KiloCode.

## Research Context

### Technical Overview

**Component**: \[Component name]
**Version**: \[Version number]
**Architecture**: \[Architecture description]
**Dependencies**: \[Key dependencies]

### Background

\[Background information about the topic]

### Methodology

\[Research or development methodology used]

## Overview

The documentation automation system uses Remark to validate markdown files and ensure they meet
KiloCode's documentation standards. It includes:

* Automated validation of markdown files
* Proactive maintenance tools
* Custom KiloCode-specific validation rules
* Integration with CI/CD pipeline
* IDE integration for real-time validation

**Related Links:**

* [Related Documentation](tools/related-doc.md)
* [Additional Resources](tools/resources.md)## Installation

The documentation automation dependencies are already installed in the workspace. They include:

* `remark-cli` - Command-line interface for remark
* `remark-preset-lint-recommended` - Recommended linting rules
* `remark-validate-links` - Link validation
* `remark-toc` - Table of contents generation
* `remark-gfm` - GitHub Flavored Markdown support
* `remark-stringify` - Markdown stringification
* `remark-frontmatter` - Frontmatter support

**Related Links:**

* [Related Documentation](tools/related-doc.md)
* [Additional Resources](tools/resources.md)## Configuration

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
"ignore": ["https://github.com/roo-ai/kilo-code/issues/*",
"https://github.com/roo-ai/kilo-code/discussions/*"]
	}
}
```

## Usage

### Available Scripts

* `pnpm docs:validate` - Validate all documentation files (quiet mode)
* `pnpm docs:validate:verbose` - Validate all documentation files with detailed output
* `pnpm docs:fix` - Auto-fix common documentation issues
* `pnpm docs:maintain` - Run proactive maintenance tools
* `pnpm docs:report` - Generate detailed validation reports
* `pnpm docs:metrics` - Generate documentation metrics

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

**Related Links:**

* [Related Documentation](tools/related-doc.md)
* [Additional Resources](tools/resources.md)## Integration

### Pre-commit Hooks

Documentation validation is integrated into pre-commit hooks to ensure all documentation meets
standards before commits.

### CI/CD Pipeline

The system includes GitHub Actions workflows that validate documentation on pull requests and
pushes.

#### GitHub Actions Workflow

The documentation validation workflow (`.github/workflows/docs-validation.yml`) runs on:

* **Push events** to main/master branches when markdown files are changed
* **Pull request events** to main/master branches when markdown files are changed

The workflow includes two jobs:

1. **Documentation Validation**: Validates all documentation files using remark
2. **Documentation Maintenance**: Auto-fixes common issues and commits changes back to PRs

#### Workflow Features

* Validates documentation on every PR and push
* Generates detailed validation reports on failure
* Auto-maintains documentation by fixing common issues
* Uploads validation reports as artifacts for debugging
* Skips CI on auto-maintenance commits to prevent loops

### IDE Integration

VS Code integration provides real-time validation as you edit markdown files.

**Related Links:**

* [Related Documentation](tools/related-doc.md)
* [Additional Resources](tools/resources.md)## Troubleshooting

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

**Related Links:**

* [Related Documentation](tools/related-doc.md)
* [Additional Resources](tools/resources.md)## Next Steps

After setup, the system will:

1. Validate all documentation on every commit
2. Provide real-time feedback in your IDE
3. Generate reports on documentation quality
4. Help maintain consistent documentation standards

For advanced configuration and custom rules, see the Phase 1 implementation plan in
`context/doc_automation/phase1.md`.

**Related Links:**

* [Related Documentation](tools/related-doc.md)
* [Additional Resources](tools/resources.md)## No Dead Ends Policy

This document connects to:

For more information, see:

* [Documentation Structure](../README.md)
* [Additional Resources](tools/README.md)

## Navigation Footer

* \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

* **If you're new here**: Start with the [When You're Here](#when-youre-here) section

* **If you need context**: Check the [Research Context](#research-context) section

* **If you're ready to implement**: Jump to the implementation sections

* **If you're stuck**: Visit our [Troubleshooting Guide](tools/TROUBLESHOOTING_GUIDE.md)

* **If you need help**: Check the [Technical Glossary](GLOSSARY.md)

* *Navigation*\*: [docs](../docs/) · [↑ Table of Contents](#documentation-automation-setup-guide)

## Navigation

* 📚 [Technical Glossary](GLOSSARY.md)
