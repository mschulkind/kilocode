# Basic Validation Training

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

This training module introduces you to the fundamentals of documentation validation in the KiloCode system.

## Learning Objectives

By the end of this training, you will be able to:
- Understand what documentation validation is and why it matters
- Identify common validation errors and their causes
- Use basic validation tools and commands
- Fix simple validation issues
- Understand the validation workflow

## Prerequisites
- Basic familiarity with Markdown
- VS Code installed and configured
- Access to the KiloCode documentation system

## What is Documentation Validation?

Documentation validation is the process of checking documentation files for:
- **Syntax errors**: Missing required sections, malformed Markdown
- **Style issues**: Inconsistent formatting, poor structure
- **Link problems**: Broken links, non-descriptive link text
- **Content quality**: Missing information, unclear writing

### Why Validation Matters
- **Consistency**: Ensures all documentation follows the same standards
- **Quality**: Catches errors before they reach users
- **Maintainability**: Makes documentation easier to update and maintain
- **User Experience**: Provides clear, well-structured information

## Validation Tools Overview

### 1. VS Code Extensions
- **Markdown All in One**: Real-time validation and formatting
- **markdownlint**: Style checking and auto-fixing
- **Remark**: Advanced validation and processing

### 2. Command Line Tools
- `pnpm docs:validate`: Run full validation
- `pnpm docs:fix`: Auto-fix common issues
- `pnpm docs:report`: Generate validation reports

### 3. Git Integration
- Pre-commit hooks prevent invalid documentation
- Commit message validation ensures proper formatting

## Common Validation Errors

### 1. Missing Required Sections
- *Error*\*: Missing required section "Research Context"
- *What it means*\*: Every KiloCode document must have a Research Context section
- *How to fix*\*:

```markdown
## Research Context

Brief description of the research and context behind this document.
```

### 2. Missing Navigation Footer
- *Error*\*: Missing navigation footer
- *What it means*\*: Documents need navigation links for better organization
- *How to fix*\*:

```markdown
- \*Navigation\*\*: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]
```

### 3. Non-descriptive Link Text
- *Warning*\*: Link text "https://example.com" is not descriptive
- *What it means*\*: Links should have meaningful text, not just URLs
- *How to fix*\*:

```markdown
<!-- Bad -->

[https://example.com](https://example.com)

<!-- Good -->

[Example Website](https://example.com)
```

### 4. Improper Heading Hierarchy
- *Warning*\*: Heading level should be 2, not 3
- *What it means*\*: Headings should follow a logical hierarchy (H1 → H2 → H3)
- *How to fix*\*:

```markdown
# Main Title (H1)

## Section Title (H2)

### Subsection Title (H3)
```

## Hands-On Exercise 1: Basic Validation

### Setup
1. Open VS Code
2. Navigate to the `docs/` directory
3. Open a Markdown file

### Exercise Steps
1. **Run validation**:

   ```bash
   pnpm docs:validate
   ```
2. **Check Problems panel**:
- Look for validation errors
- Note the error types and locations
3. **Try auto-fix**:

   ```bash
   pnpm docs:fix
   ```
4. **Verify fixes**:
- Run validation again
- Check that errors are resolved

### Expected Results
- You should see validation errors in the Problems panel
- Auto-fix should resolve some issues automatically
- Manual fixes may be needed for complex issues

## Hands-On Exercise 2: Fixing Common Errors

### Exercise File

Create a test file `docs/training/test-validation.md`:

```markdown
# Test Document

This is a test document with some validation issues.

## Missing Research Context

This section should be "Research Context" not "Missing Research Context".

[Click here](https://example.com) for more information.

### Improper Heading

This heading should be level 2, not 3.

## Another Section

Some content here.

[Another link](https://another-example.com)
```

### Fix the Issues
1. **Add Research Context section**:

   ```markdown
   ## Research Context

   This document demonstrates common validation errors and how to fix them.
   ```
2. **Fix link text**:

   ```markdown
   [Example Website](https://example.com) for more information.
   ```
3. **Fix heading hierarchy**:

   ```markdown
   ## Improper Heading
   ```
4. **Add navigation footer**:
   ```markdown
   **Navigation**: [← Back to Training](./TRAINING_MATERIALS_INDEX.md) · [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#basic-validation-training)
   ```

### Verify Your Fixes
1. Run validation: `pnpm docs:validate`
2. Check that all errors are resolved
3. Verify the document looks correct

## Validation Workflow

### Daily Workflow
1. **Before writing**: Check existing standards and templates
2. **While writing**: Use VS Code real-time validation
3. **Before saving**: Run auto-fix if available
4. **Before committing**: Run full validation
5. **After committing**: Check for any remaining issues

### Weekly Workflow
1. **Monday**: Review validation reports
2. **Wednesday**: Check for new validation errors
3. **Friday**: Update documentation standards if needed

### Monthly Workflow
1. **Review**: Analyze validation trends
2. **Update**: Refresh training materials
3. **Improve**: Enhance validation rules

## Best Practices

### 1. Start with Templates
- Use existing document templates
- Follow established patterns
- Check similar documents for reference

### 2. Validate Early and Often
- Don't wait until the end to validate
- Fix issues as you encounter them
- Use real-time validation in VS Code

### 3. Understand the Rules
- Read error messages carefully
- Learn what each rule checks for
- Ask questions when unclear

### 4. Use Auto-fix Wisely
- Let auto-fix handle simple issues
- Review auto-fix changes before committing
- Manual fixes for complex issues

## Troubleshooting Common Issues

### Validation Not Running
1. Check VS Code extensions are installed
2. Verify dependencies: `pnpm install`
3. Check configuration files exist

### Auto-fix Not Working
1. Ensure markdownlint extension is active
2. Check VS Code settings
3. Try manual fix commands

### Confusing Error Messages
1. Read the error message carefully
2. Check this training guide
3. Look at similar documents
4. Ask team members for help

## Assessment

### Self-Check Questions
1. What are the four main types of validation errors?
2. How do you run validation from the command line?
3. What is the purpose of the Research Context section?
4. How do you fix non-descriptive link text?
5. What is the proper heading hierarchy?

### Practical Assessment
1. Create a new document with intentional errors
2. Run validation and identify all errors
3. Fix all errors using appropriate methods
4. Verify the document passes validation

## Next Steps

### Immediate Actions
1. Practice with the exercises above
2. Try validating existing documents
3. Fix any validation errors you find

### Further Learning
1. Complete [VS Code Integration Training](./VSCODE_INTEGRATION_TRAINING.md)
2. Learn about [Custom Validation Rules](./CUSTOM_VALIDATION_RULES_TRAINING.md)
3. Practice with [Interactive Exercises](./practice/)

### Team Integration
1. Share your learning with team members
2. Ask questions in team channels
3. Contribute to documentation improvements

## Resources

### Documentation
- [Validation Errors Guide](./VALIDATION_ERRORS_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
- [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)

### Tools
- VS Code Markdown extensions
- Command line validation tools
- Git pre-commit hooks

### Support
- Team documentation channels
- Training materials
- Peer support network

## Navigation Footer
- *Navigation*\*: [← Back to Training Index](./TRAINING_MATERIALS_INDEX.md) · [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#basic-validation-training)
