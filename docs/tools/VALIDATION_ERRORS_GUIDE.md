# Validation Errors Guide

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

This guide helps you understand and fix common validation errors in KiloCode documentation.

## Error Categories

### 1. Syntax Errors

**Missing Required Sections**

```
Error: Missing required section "Research Context"
```

**Fix:** Add the required section:

```markdown
## Research Context

Brief description of the research and context behind this document.
```

**Missing Navigation Footer**

```
Error: Missing navigation footer
```

**Fix:** Add navigation footer:

```markdown
**Navigation**: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]
```

### 2. Link Errors

**Non-descriptive Link Text**

```
Warning: Link text "https://example.com" is not descriptive
```

**Fix:** Use descriptive text:

```markdown
<!-- Bad -->

[https://example.com](https://example.com)

<!-- Good -->

[Example Website](https://example.com)
```

**Broken Internal Links**

```
Error: Broken internal link to "nonexistent-file.md"
```

**Fix:** Check file path and update link:

```markdown
<!-- Verify file exists and update path -->

[Link Text](./correct-path/file.md)
```

**Broken External Links**

```
Warning: External link "https://broken-link.com" is not accessible
```

**Fix:** Update or remove broken links:

```markdown
<!-- Update URL or remove if no longer relevant -->

[Updated Link](https://working-link.com)
```

### 3. Structure Errors

**Improper Heading Hierarchy**

```
Warning: Heading level should be 2, not 3
```

**Fix:** Use proper heading hierarchy:

```markdown
# Main Title (H1)

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

## Section Title (H2)

### Subsection Title (H3)
```

**Missing Table of Contents**

```
Warning: File is long (>500 words) but missing table of contents
```

**Fix:** Add table of contents:

```markdown
## Table of Contents

- [Introduction](#introduction)
- [Main Content](#main-content)
- [Conclusion](#conclusion)
```

### 4. Style Errors

**Inconsistent Formatting**

```
Warning: Inconsistent list formatting
```

**Fix:** Use consistent formatting:

```markdown
<!-- Use consistent bullet points -->

- Item 1
- Item 2
- Item 3
```

**Missing Fun Facts**

```
Warning: Consider adding a fun fact to make content more engaging
```

**Fix:** Add engaging fun facts:

```markdown
> **Fun Fact**: Did you know that markdown was created in 2004 by John Gruber?
```

## Common Error Patterns

### 1. URL-Only Links

**Problem:**

```markdown
Check out https://example.com for more information.
```

**Solution:**

```markdown
Check out [Example Website](https://example.com) for more information.
```

### 2. Missing Alt Text

**Problem:**

```markdown
![Image](image.png)
```

**Solution:**

```markdown
![Descriptive alt text for the image](image.png)
```

### 3. Inconsistent Code Blocks

**Problem:**

````markdown
```javascript
code here
```
````

````

**Solution:**
```markdown
```javascript
code here
````

````

### 4. Broken Cross-References

**Problem:**
```markdown
See [Section 1](#section-1) for details.
````

**Solution:**

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

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

npx remark --use remark-stringify docs/

# Fix specific file

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

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
