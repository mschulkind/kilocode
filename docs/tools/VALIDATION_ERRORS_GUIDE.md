# Validation Errors Guide

## Table of Contents
- [Validation Errors Guide](#validation-errors-guide)
- [When You're Here](#when-youre-here)
- [Error Categories](#error-categories)
- [1. Syntax Errors](#1-syntax-errors)
- [2. Link Errors](#2-link-errors)
- [3. Structure Errors](#3-structure-errors)
- [4. Style Errors](#4-style-errors)
- [Common Error Patterns](#common-error-patterns)
- [1. URL-Only Links](#1-url-only-links)
- [2. Missing Alt Text](#2-missing-alt-text)
- [3. Inconsistent Code Blocks](#3-inconsistent-code-blocks)
- [Auto-Fix Capabilities](#auto-fix-capabilities)
- [VS Code Auto-Fix](#vs-code-auto-fix)
- [Command Line Auto-Fix](#command-line-auto-fix)
- [Error Resolution Workflow](#error-resolution-workflow)
- [1. Identify the Error](#1-identify-the-error)
- [2. Understand the Error](#2-understand-the-error)
- [3. Fix the Error](#3-fix-the-error)
- [4. Verify the Fix](#4-verify-the-fix)
- [Error Prevention](#error-prevention)
- [1. Use VS Code Extensions](#1-use-vs-code-extensions)
- [2. Follow Standards](#2-follow-standards)
- [3. Regular Validation](#3-regular-validation)
- [4. Team Guidelines](#4-team-guidelines)
- [Advanced Error Handling](#advanced-error-handling)
- [Custom Validation Rules](#custom-validation-rules)
- [Suppressing Errors](#suppressing-errors)
- [Error Reporting](#error-reporting)
- [Troubleshooting](#troubleshooting)
- [Validation Not Running](#validation-not-running)
- [Auto-fix Not Working](#auto-fix-not-working)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)
- [Resources](#resources)
- [Support](#support)
- [Related Documentation](#related-documentation)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation](#navigation)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
> foundation, clear structure, and intuitive navigation! 🏗️

This guide helps you understand and fix common validation errors in KiloCode documentation.

## Error Categories

### 1. Syntax Errors

- *Missing Required Sections*\*

```
Error: Missing required section "Research Context"
```

- *Fix:*\* Add the required section:

```markdown
## Research Context

Brief description of the research and context behind this document.
```

- *Missing Navigation Footer*\*

```
Error: Missing navigation footer
```

- *Fix:*\* Add navigation footer:

```markdown
- *Navigation**: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]
```

### 2. Link Errors

- *Non-descriptive Link Text*\*

```
Warning: Link text "https://example.com" is not descriptive
```

- *Fix:*\* Use descriptive text:

```markdown
<!-- Bad -->

[Example](https://example.com)

<!-- Good -->

[Example Website](https://example.com)
```

- *Broken Internal Links*\*

```
Error: Broken internal link to "nonexistent-file.md"
```

- *Fix:*\* Check file path and update link:

```markdown
<!-- Verify file exists and update path -->

[Link Text](./correct-path/file.md)
```

- *Broken External Links*\*

```
Warning: External link "https://broken-link.com" is not accessible
```

- *Fix:*\* Update or remove broken links:

```markdown
<!-- Update URL or remove if no longer relevant -->

[Updated Link](https://working-link.com)
```

### 3. Structure Errors

- *Improper Heading Hierarchy*\*

```
Warning: Heading level should be 2, not 3
```

- *Fix:*\* Use proper heading hierarchy:

```markdown
# Main Title (H1)

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

## Section Title (H2)

### Subsection Title (H3)
```

- *Missing Table of Contents*\*

```
Warning: File is long (>500 words) but missing table of contents
```

- *Fix:*\* Add table of contents:

```markdown

### 4. Style Errors

- *Inconsistent Formatting*\*

```

Warning: Inconsistent list formatting

````

- *Fix:*\* Use consistent formatting:

```markdown
<!-- Use consistent bullet points -->
- Item 1
- Item 2
- Item 3
````

- *Missing Fun Facts*\*

```
Warning: Consider adding a fun fact to make content more engaging
```

- *Fix:*\* Add engaging fun facts:

```markdown
> **Fun Fact**: Did you know that markdown was created in 2004 by John Gruber?
```

## Common Error Patterns

### 1. URL-Only Links

- *Problem:*\*

```markdown
Check out https://example.com for more information.
```

- *Solution:*\*

```markdown
Check out [Example Website](https://example.com) for more information.
```

### 2. Missing Alt Text

- *Problem:*\*

```markdown
![Image](image.png)
```

- *Solution:*\*

```markdown
![Descriptive alt text for the image](image.png)
```

### 3. Inconsistent Code Blocks

- *Problem:*\*

````markdown
```javascript
code here
```
````

````

- *Solution:**
```markdown
```javascript
code here
````

````

### 4. Broken Cross-References

- *Problem:**
```markdown
See [Section 1](#section-1) for details.
````

- *Solution:*\*

```markdown
See [Section 1](#section-1) for details.

<!-- Ensure the heading exists: ## Section 1 -->
```

## Auto-Fix Capabilities

### VS Code Auto-Fix

Many errors can be automatically fixed:
1. **Enable Auto-fix on Save:**
- Already configured in VS Code settings
- Fixes common markdown issues automatically
2. **Manual Auto-fix:**
- `Ctrl+Shift+P` → "Markdown: Fix all markdownlint violations"
- Fixes all auto-fixable issues

### Command Line Auto-Fix

```bash
# Fix auto-fixable issues

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

npx remark --use remark-stringify docs/

# Fix specific file

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

npx remark --use remark-stringify docs/specific-file.md
```

## Error Resolution Workflow

### 1. Identify the Error
- Check Problems panel in VS Code
- Run `pnpm docs:validate` for detailed output
- Look for error codes and descriptions

### 2. Understand the Error
- Read error message carefully
- Check this guide for common solutions
- Review documentation standards

### 3. Fix the Error
- Use auto-fix when available
- Apply manual fixes for complex issues
- Test fix with validation

### 4. Verify the Fix
- Run validation again
- Check Problems panel
- Ensure no new errors introduced

## Error Prevention

### 1. Use VS Code Extensions
- Markdown All in One for real-time validation
- markdownlint for style checking
- Auto-fix on save enabled

### 2. Follow Standards
- Use required sections consistently
- Follow naming conventions
- Maintain proper structure

### 3. Regular Validation
- Run `pnpm docs:validate` before committing
- Check Problems panel regularly
- Use pre-commit hooks

### 4. Team Guidelines
- Share common error patterns
- Document project-specific rules
- Regular team training

## Advanced Error Handling

### Custom Validation Rules

Some errors may be project-specific:

```javascript
// Custom rule example
function customRule(tree, file) {
	// Check for project-specific requirements
	// Return error if not met
}
```

### Suppressing Errors

For legitimate cases where errors should be ignored:

```markdown
<!-- remark-disable-next-line rule-name -->

Content that triggers the rule
```

### Error Reporting

For complex errors:
1. Check validation report: `pnpm docs:report`
2. Review error context and file location
3. Consult team documentation
4. Escalate if needed

## Troubleshooting

### Validation Not Running
1. Check VS Code extensions are installed
2. Verify `.remarkrc` configuration exists
3. Ensure dependencies are installed: `pnpm install`

### Auto-fix Not Working
1. Check VS Code settings for auto-fix configuration
2. Verify markdownlint extension is active
3. Try manual fix command

### Performance Issues
1. Check file size and complexity
2. Use incremental validation
3. Exclude large directories if needed

## Getting Help

### Resources
1. This validation errors guide
2. [Remark Workflow Overview](./REMARK_WORKFLOW_OVERVIEW.md)
3. [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
4. [Documentation Guide](../DOCUMENTATION_GUIDE.md)

### Support
1. Check VS Code output logs
2. Review error messages carefully
3. Consult team documentation
4. Ask team members for help

## Related Documentation
- [Remark Workflow Overview](./REMARK_WORKFLOW_OVERVIEW.md)
- [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
- [Documentation Guide](../DOCUMENTATION_GUIDE.md)
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
