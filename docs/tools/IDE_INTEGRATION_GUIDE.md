# IDE Integration Guide

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

This guide covers the VS Code integration for KiloCode's documentation automation system.

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
- [Development Workflow](../architecture/repository/DEVELOPMENT_GUIDE.md)
- [Remark Configuration](../../.remarkrc)
- [Package Scripts](../../package.json)

## Navigation Footer

---

**Navigation**: [docs](../) · [tools](../docs/tools/) ·
[↑ Table of Contents](#ide-integration-guide)
