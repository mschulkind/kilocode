# Documentation Best Practices

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

This guide outlines the best practices for writing and maintaining high-quality documentation in the
KiloCode project.

## Writing Guidelines

### 1. Structure and Organization

- *Clear Hierarchy*\*

```markdown
# Main Title (H1) - Only one per document

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

## Major Section (H2)

### Subsection (H3)

#### Detail Section (H4)
```

- *Logical Flow*\*
- Start with overview and purpose
- Progress from general to specific
- End with next steps or related resources
- Use consistent section ordering

- *File Organization*\*

```
docs/
├── architecture/          # System design docs
├── services/             # Service-specific docs
├── tools/                # Tool and process docs
├── standards/            # Coding and style standards
└── improvements/         # Improvement proposals
```

### 2. Content Quality

- *Research Context*\* Every document should include:

```markdown
## Research Context

Brief description of the research, background, and context that led to this document. Explain the
"why" behind the content.
```

- *Engaging Content*\*
- Include fun facts where appropriate
- Use analogies and examples
- Make content accessible to different skill levels
- Include visual elements when helpful

- *No Dead Ends Policy*\*
- Every document should have clear next steps
- Link to related resources
- Provide navigation paths
- Avoid orphaned content

```markdown
## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.
- Each section provides clear navigation to related content
- All internal links are validated and point to existing documents  
- Cross-references include context for better understanding
```

### 3. Writing Style

- *Tone and Voice*\*
- Professional but approachable
- Clear and concise
- Consistent terminology
- Active voice preferred

- *Technical Accuracy*\*
- Verify all technical claims
- Include code examples that work
- Update outdated information
- Cross-reference related concepts

- *Accessibility*\*
- Use descriptive headings
- Include alt text for images
- Provide text alternatives for diagrams
- Use clear, simple language

## Formatting Standards

### 1. Markdown Best Practices

- *Headings*\*

```markdown
# Use Title Case for H1

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

## Use Sentence case for H2 and below

### Avoid too many heading levels
```

- *Lists*\*

```markdown
<!-- Use consistent bullet points -->
- Item 1
- Item 2
- Item 3

<!-- For ordered lists -->
1. First step
2. Second step
3. Third step
```

- *Code Blocks*\*

````markdown
```javascript
// Use appropriate language tags
const example = "with syntax highlighting"
```
````

````

- *Links**
```markdown
<!-- Use descriptive link text -->
[KiloCode Documentation](../README.md)

<!-- Not just URLs -->
https://example.com ❌
[Example Website](https://example.com) ✅
````

### 2. Required Sections

- *Document Length*\*
- Target: 300-1500 words per document
- Split large documents at natural boundaries
- Each document should cover one main concept

- *Table of Contents*\* (for files >500 words)

```markdown
## Table of Contents
- [Introduction](#introduction)
- [Main Content](#main-content)
- [Examples](#examples)
- [Conclusion](#conclusion)
```

- *Navigation Footer*\*

```markdown
- *Navigation**: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]
```

- *Research Context*\*

```markdown
## Research Context

Brief description of the research, background, and context that led to this document. Explain the
"why" behind the content.
```

- *No Dead Ends Policy*\*

```markdown
## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.
- Each section provides clear navigation to related content
- All internal links are validated and point to existing documents  
- Cross-references include context for better understanding
```

### 3. Visual Elements

- *Images*\*
- Use descriptive filenames
- Include alt text
- Optimize file sizes
- Use consistent formats (PNG, SVG)

- *Diagrams*\*
- Use Mermaid for flowcharts
- Include text descriptions
- Keep diagrams simple and clear
- Update when content changes

- *Code Examples*\*
- Use working code
- Include comments
- Show expected output
- Test all examples

## Quality Assurance

### 1. Pre-Writing Checklist
- \[ ] Define the document's purpose
- \[ ] Identify target audience
- \[ ] Outline main sections
- \[ ] Gather necessary information
- \[ ] Check for existing similar content

### 2. Writing Checklist
- \[ ] Include all required sections
- \[ ] Use consistent formatting
- \[ ] Add descriptive links
- \[ ] Include code examples
- \[ ] Add fun facts where appropriate
- \[ ] Check spelling and grammar

### 3. Post-Writing Checklist
- \[ ] Run validation: `pnpm docs:validate`
- \[ ] Check all links work
- \[ ] Verify code examples
- \[ ] Review with team member
- \[ ] Update related documents
- \[ ] Fix validation warnings and errors
- \[ ] Ensure final newline character present
- \[ ] Verify cross-references are valid

## Team Collaboration

### 1. Review Process

- *Self-Review*\*
- Read through entire document
- Check for clarity and completeness
- Verify technical accuracy
- Run validation tools

- *Peer Review*\*
- Ask team member to review
- Focus on content quality
- Check for missing information
- Verify understanding

- *Final Review*\*
- Run automated validation
- Check all links and references
- Ensure consistency with standards
- Approve for publication

### 2. Maintenance

- *Regular Updates*\*
- Review documents quarterly
- Update outdated information
- Check link health
- Improve based on feedback

- *Version Control*\*
- Use descriptive commit messages
- Include change summaries
- Tag major updates
- Maintain change logs

### 3. Feedback Integration

- *Collecting Feedback*\*
- Use team feedback forms
- Monitor usage metrics
- Track validation errors
- Gather user suggestions

- *Implementing Improvements*\*
- Prioritize feedback
- Update documentation
- Communicate changes
- Measure impact

## Common Validation Issues and Solutions

### 1. Quality Score Issues

**Problem**: Document quality score below 0.7 threshold
**Solution**:
- Increase content depth and detail
- Add more comprehensive examples
- Include troubleshooting sections
- Expand on key concepts
- Target 300-1500 words per document

### 2. Orphaned Sections

**Problem**: Document has too many sections that might be orphaned
**Solution**:
- Reduce heading hierarchy depth (max 4 levels)
- Consolidate related sections
- Use more descriptive section names
- Ensure each section has sufficient content (50+ words)
- Remove placeholder or empty sections

**Note**: Some "orphaned sections" warnings may be false positives from the linter. If sections have meaningful content and proper hierarchy, these warnings can often be safely ignored after verification.

### 3. Cross-Reference Issues

**Problem**: Cross-references may be invalid
**Solution**:
- Verify all internal links point to existing files
- Use relative paths correctly (`../` for parent directories)
- Test links after restructuring documentation
- Use descriptive link text instead of file names
- Update links when moving or renaming files

**Note**: Cross-reference warnings may be false positives if the target files exist. Verify file paths manually using `ls` or file system tools before assuming links are broken.

### 4. Final Newline Issues

**Problem**: Missing final newline character
**Solution**:
- Always end files with a newline character
- Use `echo "" >> filename` to add newline
- Configure editor to automatically add final newline

## Systematic Documentation Rewrite Process

### When to Use Complete Rewrites

Use this process when:
- Multiple validation errors exist across multiple files
- Content is outdated or poorly structured
- Cross-references are broken throughout a directory
- Quality scores are consistently below threshold

### Step-by-Step Process

1. **Initial Assessment**
   - Run `pnpm docs:validate` on target directory
   - Document initial error and warning counts
   - Identify common patterns in issues

2. **File-by-File Rewrite**
   - Rewrite each file completely, one at a time
   - Focus on content quality and proper structure
   - Use descriptive headings and meaningful link text
   - Include comprehensive examples and troubleshooting

3. **Validation After Rewrites**
   - Run validation again after all files are rewritten
   - Compare before/after error counts
   - Document improvement metrics

4. **Best Practices Update**
   - Update documentation best practices based on lessons learned
   - Add specific guidance for common issues encountered
   - Ensure process can be repeated for future directories

### Expected Improvements

- **Error Reduction**: Target 70-90% reduction in validation errors
- **Quality Score**: Achieve scores above 0.7 threshold
- **Content Depth**: Increase word count and detail level
- **Link Quality**: Use descriptive text instead of filenames
- **Structure**: Reduce orphaned sections and improve hierarchy

### Real-World Example: UI Directory Processing

**Initial State**: 13 warnings across 4 files
- High link density warnings
- Invalid cross-references to non-existent files
- Template placeholders like `[DOCUMENT PURPOSE BASED ON FILE PATH]`
- Missing final newlines

**After Complete Rewrite**: 7 warnings remaining
- 46% reduction in warnings (13 → 7)
- Eliminated template placeholders
- Fixed missing final newlines
- Resolved invalid cross-references
- Remaining warnings are mostly false positives (orphaned sections, cross-reference validation)

**Key Lessons**:
- Complete rewrites are highly effective for template-ridden files
- False positive warnings can be safely ignored after manual verification
- Focus on content quality over perfect linter scores

## Common Pitfalls

### 1. Content Issues

- *Avoid:*\*
- Outdated information
- Incomplete sections
- Missing context
- Unclear explanations

- *Instead:*\*
- Regular updates
- Complete information
- Clear background
- Step-by-step guidance

### 2. Formatting Issues

- *Avoid:*\*
- Inconsistent headings
- Broken links
- Poor code formatting
- Missing alt text

- *Instead:*\*
- Follow style guide
- Validate all links
- Use proper code blocks
- Include descriptions

### 3. Organization Issues

- *Avoid:*\*
- Unclear structure
- Missing navigation
- Orphaned content
- Poor file organization

- *Instead:*\*
- Logical hierarchy
- Clear navigation
- Connected content
- Organized directories

## Tools and Resources

### 1. Validation Tools

```bash
# Validate all documentation

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

pnpm docs:validate

# Run maintenance

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

pnpm docs:maintain

# Generate report

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

pnpm docs:report
```

### 2. VS Code Extensions
- Markdown All in One
- markdownlint
- MDX support
- Auto-fix on save

### 3. Reference Materials
- [Remark Workflow Overview](./REMARK_WORKFLOW_OVERVIEW.md)
- [Validation Errors Guide](./VALIDATION_ERRORS_GUIDE.md)
- [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
- [Documentation Guide](../../DOCUMENTATION_GUIDE.md)

## Continuous Improvement

### 1. Metrics to Track
- Validation error rates
- Document usage
- Team feedback scores
- Update frequency

### 2. Regular Reviews
- Monthly quality checks
- Quarterly content reviews
- Annual process evaluation
- Continuous tool improvement

### 3. Team Training
- New member onboarding
- Regular best practices updates
- Tool training sessions
- Process improvements

## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.
- Each section provides clear navigation to related content
- All internal links are validated and point to existing documents
- Cross-references include context for better understanding

## Related Documentation
- [Remark Workflow Overview](./REMARK_WORKFLOW_OVERVIEW.md)
- [Validation Errors Guide](./VALIDATION_ERRORS_GUIDE.md)
- [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
- [Documentation Guide](../../DOCUMENTATION_GUIDE.md)
- [Development Workflow](../architecture/DEVELOPMENT_GUIDE.md)

## Navigation
- [← Tools Overview](README.md)
- [← Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- [← Validation Errors Guide](VALIDATION_ERRORS_GUIDE.md)
- [← Remark Workflow Overview](REMARK_WORKFLOW_OVERVIEW.md)
- [← Documentation Best Practices](DOCUMENTATION_BEST_PRACTICES.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)
