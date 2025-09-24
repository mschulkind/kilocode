# Quick Reference Card

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

Essential commands and shortcuts for KiloCode documentation automation.

## Essential Commands

### Validation

```bash
# Validate all documentation

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

pnpm docs:validate

# Validate specific file

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

npx remark docs/file.md

# Validate with custom config

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

npx remark --config .remarkrc docs/
```

### Maintenance

```bash
# Run automated maintenance

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

pnpm docs:maintain

# Maintain specific file

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

node scripts/docs/maintain-docs.js docs/file.md

# Update TOCs only

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

npx remark --use remark-toc docs/
```

### Reporting

```bash
# Generate validation report

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

pnpm docs:report

# HTML report

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

node scripts/docs/validation-report.js --html

# Summary only

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

node scripts/docs/validation-report.js --summary
```

## VS Code Shortcuts

### Tasks
- `Ctrl+Shift+P` → "Tasks: Run Task"
- Select: `docs: validate`, `docs: maintain`, `docs: report`

### Auto-fix
- `Ctrl+Shift+P` → "Markdown: Fix all markdownlint violations"
- Auto-fix on save (enabled by default)

### Navigation
- `Ctrl+Shift+O` → Go to symbol in file
- `Ctrl+T` → Go to symbol in workspace
- `F12` → Go to definition

## Required Sections

### Every Document

```markdown
## Research Context

Brief description of research and context.

## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)

## Main Content

Your content here.

## Navigation
- *Navigation**: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]
```

### File Structure

```
docs/
├── architecture/     # System design
├── services/        # Service docs
├── tools/           # Process docs
├── standards/       # Style guides
└── improvements/    # Proposals
```

## Common Fixes

### Link Issues

```markdown
<!-- Bad -->

[https://example.com](https://example.com)

<!-- Good -->

[Example Website](https://example.com)
```

### Heading Hierarchy

```markdown
# Main Title (H1)

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

## Section (H2)

### Subsection (H3)

#### Detail (H4)
```

### Code Blocks

````markdown
```javascript
// Use language tags
const example = "with syntax highlighting"
```
````

````

### Lists

```markdown
<!-- Consistent formatting -->
- Item 1
- Item 2
- Item 3
````

## Validation Rules

### Required
- \[ ] Research Context section
- \[ ] Navigation footer
- \[ ] Table of Contents (if >500 words)
- \[ ] Descriptive link text
- \[ ] Proper heading hierarchy

### Style
- \[ ] Consistent formatting
- \[ ] Alt text for images
- \[ ] Working code examples
- \[ ] Fun facts where appropriate

### Links
- \[ ] All internal links work
- \[ ] External links accessible
- \[ ] Descriptive link text
- \[ ] No broken references

## Error Codes

### Common Warnings
- `no-literal-urls` → Use descriptive link text
- `missing-heading` → Add required section
- `broken-link` → Fix or remove broken link
- `inconsistent-list` → Use consistent formatting

### Common Errors
- `missing-research-context` → Add Research Context section
- `missing-navigation` → Add navigation footer
- `broken-internal-link` → Fix file path
- `invalid-heading-hierarchy` → Fix heading levels

## File Patterns

### Naming
- Use kebab-case: `my-document.md`
- Be descriptive: `api-integration-guide.md`
- Include version if needed: `v2-migration-guide.md`

### Organization
- Group by topic/feature
- Use consistent directory structure
- Keep related files together
- Avoid deep nesting

## Performance Tips

### Large Files
- Split into smaller sections
- Use table of contents
- Optimize images
- Consider pagination

### Validation Speed
- Use incremental validation
- Exclude large directories
- Cache results when possible
- Process in parallel

## Troubleshooting

### Quick Fixes
1. **Validation not running** → Check extensions, run `pnpm install`
2. **Auto-fix not working** → Check VS Code settings, restart
3. **Performance issues** → Exclude large dirs, use incremental
4. **Link errors** → Check paths, verify files exist

### Debug Commands

```bash
# Check configuration

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

cat .remarkrc

# Test single file

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

npx remark docs/file.md --verbose

# Check dependencies

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

pnpm list | grep remark
```

## Team Workflow

### Before Committing
1. Run `pnpm docs:validate`
2. Fix any errors
3. Run `pnpm docs:maintain`
4. Test all links
5. Commit with descriptive message

### Code Review
1. Check validation report
2. Verify all links work
3. Review content quality
4. Ensure standards compliance
5. Approve or request changes

### Regular Maintenance
- Weekly: Run validation, check errors
- Monthly: Update links, review content
- Quarterly: Full documentation review

## Resources

### Documentation
- [Remark Workflow Overview](./REMARK_WORKFLOW_OVERVIEW.md)
- [Validation Errors Guide](./VALIDATION_ERRORS_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
- [Documentation Best Practices](./DOCUMENTATION_BEST_PRACTICES.md)

### Tools
- [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
- [Remark Configuration](../../.remarkrc)
- [Package Scripts](../../package.json)
- [VS Code Settings](../../.vscode/settings.json)

### External
- [Remark Documentation](https://remark.js.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [VS Code Markdown](https://code.visualstudio.com/docs/languages/markdown)

## No Dead Ends Policy

This document is designed to provide value and connect to the broader KiloCode ecosystem:
- **Purpose**: \[Brief description of document purpose]
- **Connections**: Links to related documents and resources
- **Next Steps**: Clear guidance on how to use this information
- **Related Documentation**: References to complementary materials

For questions or suggestions about this documentation, please refer to the [Documentation Guide](../DOCUMENTATION_GUIDE.md) or [Architecture Overview](../architecture/README.md).

## Navigation Footer
- *Navigation*\*:
- [← Back to Documentation Overview](../README.md)
- [Architecture Documentation](../architecture/README.md)
- [Standards Documentation](../../standards////////README.md)
- *Related*\*:
- [Documentation Guide](../DOCUMENTATION_GUIDE.md)
- [Glossary](../GLOSSARY.md)
