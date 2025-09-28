# IDE Integration Guide

## Table of Contents
- [IDE Integration Guide](#ide-integration-guide)
- [Table of Contents](#table-of-contents)
- [When You're Here](#when-youre-here)
- [Research Context](#research-context)
- [Technical Overview](#technical-overview)
- [Background](#background)
- [Methodology](#methodology)
- [Overview](#overview)
- [Setup](#setup)
- [Required Extensions](#required-extensions)
- [Configuration](#configuration)
- [Markdown Validation](#markdown-validation)
- [Markdown All in One](#markdown-all-in-one)
- [Markdownlint](#markdownlint)
- [Available Tasks](#available-tasks)
- [docs: validate](#docs-validate)
- [docs: maintain](#docs-maintain)
- [docs: report](#docs-report)
- [Real-time Validation](#realtime-validation)
- [Features](#features)
- [Error Types](#error-types)
- [Troubleshooting](#troubleshooting)
- [Common Issues](#common-issues)
- [Extension Not Working](#extension-not-working)
- [Validation Not Running](#validation-not-running)
- [Auto-fix Not Working](#autofix-not-working)
- [Performance Issues](#performance-issues)
- [Debug Mode](#debug-mode)
- [Reset Configuration](#reset-configuration)
- [Best Practices](#best-practices)
- [File Organization](#file-organization)
- [Writing Guidelines](#writing-guidelines)
- [Validation Workflow](#validation-workflow)
- [Integration with CI/CD](#integration-with-cicd)
- [Support](#support)
- [Related Documentation](#related-documentation)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)
- [Navigation](#navigation)
- [IDE Integration Guide](#ide-integration-guide)
- [Table of Contents](#table-of-contents)
- [When You're Here](#when-youre-here)
- [Research Context](#research-context)
- [Technical Overview](#technical-overview)
- [Background](#background)
- [Methodology](#methodology)
- [Overview](#overview)
- [Setup](#setup)
- [Required Extensions](#required-extensions)
- [Configuration](#configuration)
- [Markdown Validation](#markdown-validation)
- [Markdown All in One](#markdown-all-in-one)
- [Markdownlint](#markdownlint)
- [Available Tasks](#available-tasks)
- [docs: validate](#docs-validate)
- [docs: maintain](#docs-maintain)
- [docs: report](#docs-report)
- [Real-time Validation](#realtime-validation)
- [Features](#features)
- [Error Types](#error-types)
- [Troubleshooting](#troubleshooting)
- [Common Issues](#common-issues)
- [Extension Not Working](#extension-not-working)
- [Validation Not Running](#validation-not-running)
- [Auto-fix Not Working](#autofix-not-working)
- [Performance Issues](#performance-issues)
- [Debug Mode](#debug-mode)
- [Reset Configuration](#reset-configuration)
- [Best Practices](#best-practices)
- [File Organization](#file-organization)
- [Writing Guidelines](#writing-guidelines)
- [Validation Workflow](#validation-workflow)
- [Integration with CI/CD](#integration-with-cicd)
- [Support](#support)
- [Related Documentation](#related-documentation)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
> documentation helps us understand how! ⚙️

This guide covers the VS Code integration for KiloCode's documentation automation system.

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

The IDE integration provides real-time validation, auto-fixing, and seamless workflow integration
for documentation maintenance.

## Setup

### Required Extensions

Install the following VS Code extensions (automatically recommended):

- **Markdown All in One** (`yzhang.markdown-all-in-one`) - Comprehensive markdown support
- **markdownlint** (`davidanson.vscode-markdownlint`) - Markdown linting and validation
- **MDX** (`unifiedjs.vscode-mdx`) - MDX file support

### Configuration

The following settings are automatically configured in `.vscode/settings.json`:

#### Markdown Validation
- Real-time validation enabled
- Link validation enabled
- Fragment validation enabled
- File link validation enabled
- Reference validation enabled

#### Markdown All in One
- TOC levels: 1-6
- Auto-update TOC on save
- Detect indentation automatically
- Exclude common TOC headers from validation

#### Markdownlint
- Custom rules configuration
- Auto-fix on save enabled
- Optimized for KiloCode documentation standards

## Available Tasks

Use `Ctrl+Shift+P` → "Tasks: Run Task" to access:

### `docs: validate`
- Validates all documentation files using remark
- Shows validation errors in Problems panel
- Provides detailed error reporting

### `docs: maintain`
- Runs automated maintenance on documentation
- Updates TOCs, navigation footers, research context
- Auto-fixes common issues

### `docs: report`
- Generates comprehensive validation report
- Shows quality metrics and statistics
- Identifies areas for improvement

## Real-time Validation

### Features

- **Live Error Detection**: See validation errors as you type
- **Auto-fix on Save**: Automatically fix common markdown issues
- **Link Validation**: Check internal and external links
- **TOC Management**: Auto-generate and update table of contents

### Error Types

- **Syntax Errors**: Malformed markdown
- **Link Errors**: Broken internal/external links
- **Structure Errors**: Missing required sections
- **Style Errors**: Inconsistent formatting

## Troubleshooting

### Common Issues

#### Extension Not Working
1. Ensure all required extensions are installed
2. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
3. Check extension status in Extensions panel

#### Validation Not Running
1. Verify `.remarkrc` configuration exists
2. Check that `pnpm docs:validate` works in terminal
3. Ensure markdown files are in correct directories

#### Auto-fix Not Working
1. Check `editor.codeActionsOnSave` setting
2. Verify markdownlint extension is active
3. Try manual fix: `Ctrl+Shift+P` → "Markdown: Fix all markdownlint violations"

#### Performance Issues
1. Exclude large directories in `markdown.validate.ignore`
2. Disable real-time validation for large files
3. Use incremental validation for changed files only

### Debug Mode

Enable debug logging:
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Developer: Toggle Developer Tools"
3. Check Console for validation errors
4. Look for "remark" or "markdownlint" messages

### Reset Configuration

To reset IDE integration:
1. Close VS Code
2. Delete `.vscode/settings.json`
3. Restore from git: `git checkout .vscode/settings.json`
4. Reopen VS Code

## Best Practices

### File Organization
- Keep documentation in `docs/` directory
- Use consistent naming conventions
- Organize by topic/feature

### Writing Guidelines
- Use descriptive headings
- Include table of contents for long documents
- Add research context sections
- Use descriptive link text

### Validation Workflow
1. Write documentation
2. Check Problems panel for errors
3. Use auto-fix when available
4. Run `docs: validate` before committing
5. Run `docs: maintain` for automated updates

## Integration with CI/CD

The IDE integration works seamlessly with the CI/CD pipeline:

- **Pre-commit**: Local validation before commit
- **CI Pipeline**: Automated validation on PR/push
- **Consistent Results**: Same validation rules everywhere

## Support

For issues with IDE integration:
1. Check this troubleshooting guide
2. Review VS Code output logs
3. Test with minimal markdown file
4. Check project documentation standards

## Related Documentation
- [Documentation Guide](../DOCUMENTATION_GUIDE.md)
- [Development Workflow](architecture/GETTING_STARTED.md)
- [Remark Configuration](../../.remarkrc)
- [Package Scripts](../../package.json)

## No Dead Ends Policy

This document connects to:

For more information, see:
- [Documentation Structure](architecture/README.md)
- [Additional Resources](../tools/README.md)

## Navigation Footer
- \*\*

- *Navigation*\*: [docs](../) · [tools](./) ·
  [↑ Table of Contents](#ide-integration-guide)

## Navigation
- 📚 [Technical Glossary](GLOSSARY.md)
