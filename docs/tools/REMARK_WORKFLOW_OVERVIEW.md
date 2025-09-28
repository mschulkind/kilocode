# Remark Workflow Overview
## Table of Contents

- [Remark Workflow Overview](#remark-workflow-overview)
  - [Table of Contents](#table-of-contents)
  - [When You're Here](#when-youre-here)
  - [What is Remark?](#what-is-remark)
  - [Workflow Components](#workflow-components)
    - [1. Validation Pipeline](#1-validation-pipeline)
    - [2. Maintenance Automation](#2-maintenance-automation)
    - [3. Quality Analysis](#3-quality-analysis)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Basic Commands](#basic-commands)
    - [VS Code Integration](#vs-code-integration)
  - [Validation Rules](#validation-rules)
    - [Required Sections](#required-sections)
    - [Style Requirements](#style-requirements)
    - [Link Standards](#link-standards)
  - [Common Workflows](#common-workflows)
    - [Writing New Documentation](#writing-new-documentation)
    - [Updating Existing Documentation](#updating-existing-documentation)
    - [Reviewing Documentation](#reviewing-documentation)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Getting Help](#getting-help)
  - [Best Practices](#best-practices)
    - [File Organization](#file-organization)
    - [Writing Guidelines](#writing-guidelines)
    - [Validation Workflow](#validation-workflow)
  - [Integration Points](#integration-points)
    - [Pre-commit Hooks](#precommit-hooks)
    - [CI/CD Pipeline](#cicd-pipeline)
    - [Team Collaboration](#team-collaboration)
  - [Next Steps](#next-steps)
  - [Related Documentation](#related-documentation)
  - [No Dead Ends Policy](#no-dead-ends-policy)
  - [Navigation](#navigation)




## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
> documentation helps us understand how! ⚙️

This document provides a comprehensive overview of KiloCode's remark-based documentation automation
workflow.

## What is Remark?

Remark is a powerful markdown processor that enables:

- **Validation**: Check markdown files for errors and style issues
- **Transformation**: Modify markdown content programmatically
- **Analysis**: Extract insights from documentation structure
- **Automation**: Integrate with CI/CD and development workflows

## Workflow Components

### 1. Validation Pipeline

```
Markdown Files → Remark Processing → Validation Rules → Error Reports
```

- *Key Features:*\*
- Real-time validation in VS Code
- Pre-commit validation hooks
- CI/CD pipeline integration
- Comprehensive error reporting

### 2. Maintenance Automation

```
Documentation → Auto-Maintenance → Updated Files → Quality Reports
```

- *Automated Tasks:*\*
- Table of Contents generation
- Navigation footer updates
- Research context validation
- Link health checking

### 3. Quality Analysis

```
Content → Quality Metrics → Scoring → Improvement Suggestions
```

- *Metrics Tracked:*\*
- Readability scores
- Technical term consistency
- Cross-reference validation
- Orphaned document detection

## Getting Started

### Prerequisites
1. **VS Code Extensions** (auto-installed):
- Markdown All in One
- markdownlint
- MDX support
2. **Node.js Dependencies** (auto-installed):
- remark-cli
- remark-preset-lint-recommended
- Custom KiloCode plugins

### Basic Commands

```bash
# Validate all documentation

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

pnpm docs:validate

# Run automated maintenance

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

pnpm docs:maintain

# Generate validation report

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

pnpm docs:report

# Validate specific file

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

npx remark docs/specific-file.md
```

### VS Code Integration

- *Real-time Validation:*\*
- Errors appear in Problems panel
- Auto-fix on save enabled
- Live link validation
- TOC auto-generation

- *Available Tasks:*\*
- `Ctrl+Shift+P` → "Tasks: Run Task"
- Select `docs: validate`, `docs: maintain`, or `docs: report`

## Validation Rules

### Required Sections

Every documentation file must include:
1. **Research Context Section**

   ```markdown
   ## Research Context

   Brief description of the research and context behind this document.
   ```
2. **Navigation Footer**

   ```markdown
   **Navigation**: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]
   ```
3. **Table of Contents** (for files >500 words)

   ```markdown
   ## Table of Contents
   ```
- [Section 1](#section-1)
- [Section 2](#section-2)
  ```
  ```

### Style Requirements

- **Headings**: Use proper hierarchy (H1 → H2 → H3)
- **Links**: Descriptive text, not raw URLs
- **Fun Facts**: Include engaging facts where appropriate
- **Consistency**: Follow KiloCode documentation standards

### Link Standards

- **Internal Links**: Use relative paths
- **External Links**: Include descriptive text
- **References**: Validate all cross-references
- **Broken Links**: Automatically detected and reported

## Common Workflows

### Writing New Documentation
1. Create markdown file in appropriate directory
2. Add required sections (Research Context, Navigation Footer)
3. Write content following style guidelines
4. Check Problems panel for validation errors
5. Run `pnpm docs:validate` before committing
6. Commit with descriptive message

### Updating Existing Documentation
1. Open file in VS Code
2. Make changes (validation runs automatically)
3. Fix any validation errors shown in Problems panel
4. Run `pnpm docs:maintain` to update TOCs and footers
5. Test with `pnpm docs:validate`
6. Commit changes

### Reviewing Documentation
1. Run `pnpm docs:report` for comprehensive analysis
2. Check quality metrics and scores
3. Review link health and cross-references
4. Address any issues found
5. Approve or request changes

## Troubleshooting

### Common Issues

- *Validation Errors:*\*
- Check Problems panel in VS Code
- Run `pnpm docs:validate` for detailed output
- Review error messages and fix accordingly

- *Auto-fix Not Working:*\*
- Ensure markdownlint extension is active
- Check VS Code settings for auto-fix configuration
- Try manual fix: `Ctrl+Shift+P` → "Markdown: Fix all markdownlint violations"

- *Performance Issues:*\*
- Large files may take longer to validate
- Use incremental validation for changed files
- Check file size and complexity

### Getting Help
1. Check this overview document
2. Review [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
3. Consult [Documentation Guide](../DOCUMENTATION_GUIDE.md)
4. Check VS Code output logs for detailed error information

## Best Practices

### File Organization
- Keep documentation in `docs/` directory
- Use consistent naming conventions
- Organize by topic/feature
- Maintain clear directory structure

### Writing Guidelines
- Use descriptive headings
- Include table of contents for long documents
- Add research context sections
- Use descriptive link text
- Include engaging fun facts

### Validation Workflow
1. Write documentation
2. Check Problems panel for errors
3. Use auto-fix when available
4. Run `docs: validate` before committing
5. Run `docs: maintain` for automated updates

## Integration Points

### Pre-commit Hooks

Automatically validates documentation before commits:
- Prevents broken documentation from being committed
- Ensures consistent quality standards
- Provides immediate feedback

### CI/CD Pipeline

Automated validation on pull requests and pushes:
- Comprehensive validation across all files
- Quality metrics and reporting
- Prevents regressions

### Team Collaboration
- Consistent validation rules for all team members
- Shared understanding of documentation standards
- Automated quality enforcement

## Next Steps

After mastering the basic workflow:
1. **Advanced Features**: Learn about custom validation rules
2. **Performance**: Optimize validation for large documentation sets
3. **Metrics**: Use quality analysis for continuous improvement
4. **Customization**: Adapt rules for specific project needs

## Related Documentation
- [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
- [Documentation Guide](../DOCUMENTATION_GUIDE.md)
- [Development Workflow](../architecture/GETTING_STARTED.md)
- [Remark Configuration](../../.remarkrc)
- [Package Scripts](../../package.json)

## No Dead Ends Policy

This document connects to:
- [Related Document 1](./related-doc-1.md) - \[Brief description]
- [Related Document 2](./related-doc-2.md) - \[Brief description]
- [Related Document 3](./related-doc-3.md) - \[Brief description]

For more information, see:
- [Category Overview](../category/)
- [Related Resources](../resources/)

## Navigation
- [← Tools Overview](README.md)
- [← Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- [← Validation Errors Guide](VALIDATION_ERRORS_GUIDE.md)
- [← Remark Workflow Overview](REMARK_WORKFLOW_OVERVIEW.md)
- [← Documentation Best Practices](DOCUMENTATION_BEST_PRACTICES.md)
- [← Main Documentation](../README.md)
- [← Project Root](../README.md)
