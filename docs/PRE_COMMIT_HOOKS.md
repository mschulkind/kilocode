# Pre-commit Hooks Documentation

## Table of Contents
- [Pre-commit Hooks Documentation](#pre-commit-hooks-documentation)
- [When You're Here](#when-youre-here)
- [Overview](#overview)
- [Configuration](#configuration)
- [Husky Setup](#husky-setup)
- [Pre-commit Hook Flow](#pre-commit-hook-flow)
- [Documentation Validation](#documentation-validation)
- [Validation Commands](#validation-commands)
- [Validation Rules](#validation-rules)
- [Auto-fix Capabilities](#auto-fix-capabilities)
- [Error Handling](#error-handling)
- [Validation Failures](#validation-failures)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Link Validation Errors](#link-validation-errors)
- [Missing Required Sections](#missing-required-sections)
- [Heading Hierarchy Issues](#heading-hierarchy-issues)
- [Bypassing Hooks (Emergency Only)](#bypassing-hooks-emergency-only)
- [Skip Pre-commit Hook](#skip-pre-commit-hook)
- [Skip All Hooks](#skip-all-hooks)
- [Troubleshooting](#troubleshooting)
- [Hook Not Running](#hook-not-running)
- [Performance Issues](#performance-issues)
- [Validation Errors](#validation-errors)
- [Too Many Warnings](#too-many-warnings)
- [False Positives](#false-positives)
- [Best Practices](#best-practices)
- [Before Committing](#before-committing)
- [Commit Messages](#commit-messages)
- [Integration with CI/CD](#integration-with-cicd)
- [Maintenance](#maintenance)
- [Updating Hook Configuration](#updating-hook-configuration)
- [Adding New Validation Rules](#adding-new-validation-rules)
- [Support](#support)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
> this documentation provides structured guidance for understanding and implementing solutions! 🔧

## Overview

This project uses Husky to manage Git pre-commit hooks that automatically validate and maintain
documentation before commits are accepted.

## Configuration

### Husky Setup

The project uses Husky v9.1.7 for Git hook management. The pre-commit hook is located at
`.husky/pre-commit` and includes:
1. **Branch Protection**: Prevents direct commits to main branch (unless tracking origin/main)
2. **Lint-staged**: Runs linting on staged files
3. **General Linting**: Runs project-wide linting
4. **Documentation Validation**: Validates all markdown files using remark
5. **Documentation Maintenance**: Automatically maintains documentation structure

### Pre-commit Hook Flow

```bash
# 1. Check branch protection

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧
# 2. Run lint-staged on staged files

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧
# 3. Run general project linting

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻
# 4. Validate documentation with remark

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️
# 5. Run documentation maintenance

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

```

## Documentation Validation

The pre-commit hook runs the following documentation checks:

### Validation Commands
- `pnpm docs:validate` - Validates all markdown files using remark with custom KiloCode plugins
- `pnpm docs:maintain` - Automatically maintains documentation structure (TOC, navigation, etc.)

### Validation Rules

The documentation validation enforces:

- **KiloCode Standards**: Custom validation rules specific to KiloCode documentation
- **Markdown Standards**: Standard markdown linting rules
- **Link Validation**: Internal and external link validation
- **Structure Validation**: Required sections and proper hierarchy
- **Content Quality**: Readability and consistency checks

### Auto-fix Capabilities

Some documentation issues can be automatically fixed:
- Table of Contents generation
- Navigation footer updates
- Research context sections
- Basic formatting issues

Run `pnpm docs:fix` to automatically fix fixable issues.

## Error Handling

### Validation Failures

If documentation validation fails:
1. **Commit is blocked** - The commit will not proceed
2. **Error details shown** - Specific validation errors are displayed
3. **Fix suggestions provided** - Guidance on how to resolve issues
4. **Auto-fix recommendation** - Suggests running `pnpm docs:fix`

### Common Issues and Solutions

#### Link Validation Errors

```bash
# Fix: Update broken links or use descriptive link text

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

[Descriptive Text](https://example.com)  # Good
https://example.com                       # Bad - use descriptive text
```

#### Missing Required Sections

```bash
# Fix: Add required sections like Research Context

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧
## Research Context

<!-- Add research context here -->
```

#### Heading Hierarchy Issues

```bash
# Fix: Use proper heading hierarchy (H1 -> H2 -> H3)

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧
# Title

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️
## Section
### Subsection

```

## Bypassing Hooks (Emergency Only)

⚠️ **Warning**: Only bypass hooks in emergency situations and fix issues immediately after.

### Skip Pre-commit Hook

```bash
git commit --no-verify -m "Emergency commit message"
```

### Skip All Hooks

```bash
git commit --no-verify --no-edit
```

## Troubleshooting

### Hook Not Running
1. **Check permissions**: Ensure `.husky/pre-commit` is executable

   ```bash
   chmod +x .husky/pre-commit
   ```
2. **Verify Husky installation**: Run `pnpm prepare` to reinstall hooks
3. **Check Git configuration**: Ensure hooks directory is correct
   ```bash
   git config core.hooksPath
   ```

### Performance Issues

If validation is slow:
1. **Run validation on specific files**:

   ```bash
   pnpm docs:validate path/to/file.md
   ```
2. **Use quiet mode**:

   ```bash
   pnpm docs:validate --quiet
   ```
3. **Skip maintenance temporarily**:
   ```bash
   # Edit .husky/pre-commit to comment out docs:maintain
   ```

### Validation Errors

#### Too Many Warnings
- Focus on errors first, warnings can be addressed later
- Use `--quiet` flag to reduce output
- Consider updating validation rules if warnings are not actionable

#### False Positives
- Report false positives to the team
- Consider updating validation rules
- Use inline comments to suppress specific warnings

## Best Practices

### Before Committing
1. **Run validation manually**:

   ```bash
   pnpm docs:validate
   pnpm docs:maintain
   ```
2. **Fix issues early**:

   ```bash
   pnpm docs:fix
   ```
3. **Review changes**:
   ```bash
   git diff
   ```

### Commit Messages

Use descriptive commit messages that include:
- Type of change (docs, fix, feat, etc.)
- Brief description
- Reference to documentation standards if applicable

Example:

```bash
git commit -m "docs: add pre-commit hooks documentation
- Document pre-commit hook configuration
- Add troubleshooting guide
- Include best practices for documentation validation

Implements: T009 · Phase 1 Task 3.1: Implement Pre-commit Hooks"
```

## Integration with CI/CD

The pre-commit hooks complement the CI/CD pipeline:

- **Pre-commit**: Fast local validation and auto-fixes
- **CI/CD**: Comprehensive validation and reporting
- **Both**: Ensure documentation quality and consistency

## Maintenance

### Updating Hook Configuration
1. **Edit `.husky/pre-commit`**
2. **Test changes**:
   ```bash
   ./.husky/pre-commit
   ```
3. **Commit changes**
4. **Update documentation**

### Adding New Validation Rules
1. **Update validation plugins**
2. **Test with sample files**
3. **Update documentation**
4. **Notify team of changes**

## Support

For issues with pre-commit hooks:
1. **Check this documentation**
2. **Review error messages carefully**
3. **Try suggested fixes**
4. **Ask team for help if needed**
5. **Report bugs or false positives**

## No Dead Ends Policy

This document connects to:
- [Related Document 1](./related-doc-1.md) - \[Brief description]
- [Related Document 2](./related-doc-2.md) - \[Brief description]
- [Related Document 3](./related-doc-3.md) - \[Brief description]

For more information, see:
- [Category Overview](../category/)
- [Related Resources](../resources/)

## Navigation Footer
- \*\*

- *Navigation*\*: [← Back to Documentation Guide](../DOCUMENTATION_GUIDE.md) ·
  [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#pre-commit-hooks-documentation)
