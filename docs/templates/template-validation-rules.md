# Document Template Validation Rules

## Table of Contents
- [Document Template Validation Rules](#document-template-validation-rules)
- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Template Types](#template-types)
- [Navigation Documents](#navigation-documents)
- [Technical Documents](#technical-documents)
- [Planning Documents](#planning-documents)
- [General Documents](#general-documents)
- [Section Requirements](#section-requirements)
- ["When You're Here" Section](#when-youre-here-section)
- [Research Context Section](#research-context-section)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)
- [Validation Implementation](#validation-implementation)
- [Template Compliance Checking](#template-compliance-checking)
- [Error Handling](#error-handling)
- [Performance Requirements](#performance-requirements)
- [Best Practices](#best-practices)
- [Document Creation](#document-creation)
- [Maintenance](#maintenance)
- [Quality Assurance](#quality-assurance)
- [Examples](#examples)
- [Good Example - Navigation Document](#good-example-navigation-document)
- [Bad Example - Missing Required Sections](#bad-example-missing-required-sections)
- [Migration Guide](#migration-guide)
- [Converting Existing Documents](#converting-existing-documents)
- [Common Issues and Fixes](#common-issues-and-fixes)
- [Updates and Maintenance](#updates-and-maintenance)
- [Navigation](#navigation)
- [Document Template Validation Rules](#document-template-validation-rules)
- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Template Types](#template-types)
- [Navigation Documents](#navigation-documents)
- [Technical Documents](#technical-documents)
- [Planning Documents](#planning-documents)
- [General Documents](#general-documents)
- [Section Requirements](#section-requirements)
- ["When You're Here" Section](#when-youre-here-section)
- [Research Context Section](#research-context-section)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)
- [Validation Implementation](#validation-implementation)
- [Template Compliance Checking](#template-compliance-checking)
- [Error Handling](#error-handling)
- [Performance Requirements](#performance-requirements)
- [Best Practices](#best-practices)
- [Document Creation](#document-creation)
- [Maintenance](#maintenance)
- [Quality Assurance](#quality-assurance)
- [Examples](#examples)
- [Good Example - Navigation Document](#good-example-navigation-document)
- [Bad Example - Missing Required Sections](#bad-example-missing-required-sections)
- [Migration Guide](#migration-guide)
- [Converting Existing Documents](#converting-existing-documents)
- [Common Issues and Fixes](#common-issues-and-fixes)
- [Updates and Maintenance](#updates-and-maintenance)
- [Navigation](#navigation)

## Overview

This document defines the validation rules for standardized document templates to ensure consistent
structure and eliminate validation warnings across all documentation. The validation system
automatically checks documents against these rules to maintain high quality and consistency
throughout the KiloCode project documentation.

The template validation system is designed to:
- Ensure all documents follow consistent structural patterns
- Eliminate common validation warnings and errors
- Improve document quality and readability
- Provide clear guidance for document creation and maintenance
- Support automated quality assurance processes

## Template Types

### Navigation Documents

**Required Sections:**
- Title (H1)
- "When You're Here" section
- Research Context section
- Table of Contents
- Main content sections
- No Dead Ends Policy
- Navigation footer

**Validation Rules:**
- Must have H1 title
- Must include "When You're Here" section with purpose, context, and navigation info
- Must include Research Context with project information
- Must have Table of Contents if document has 3+ sections
- Must include No Dead Ends Policy with connecting links
- Must have Navigation footer with relevant links
- Maximum line length: 100 characters
- Minimum section length: 30 characters
- Must have descriptive link text
- Fun fact is recommended but not required

### Technical Documents

**Required Sections:**
- Title (H1)
- "When You're Here" section
- Research Context section
- Technical sections (Architecture, API Reference, etc.)
- No Dead Ends Policy
- Navigation footer

**Validation Rules:**
- Must have H1 title
- Must include "When You're Here" section
- Must include Research Context with technical overview
- Must have at least one technical section (Architecture, API Reference, Implementation, Testing, or
  Troubleshooting)
- Must include No Dead Ends Policy
- Must have Navigation footer
- Maximum line length: 80 characters
- Must have code blocks if documenting APIs or implementations
- Must have descriptive link text
- Fun fact is recommended

### Planning Documents

**Required Sections:**
- Title (H1)
- "When You're Here" section
- Research Context section
- Progress Summary with task tracking
- Planning sections (Objectives, Timeline, Resources, etc.)
- Success Criteria
- No Dead Ends Policy
- Navigation footer

**Validation Rules:**
- Must have H1 title
- Must include "When You're Here" section
- Must include Research Context with project information
- Must have Progress Summary with task tracking table
- Must include at least Objectives and Timeline sections
- Must have Success Criteria checklist
- Must include No Dead Ends Policy
- Must have Navigation footer
- Maximum line length: 120 characters
- Must have task tracking format (T###, status indicators)
- Must have descriptive link text
- Fun fact is recommended

### General Documents

**Required Sections:**
- Title (H1)
- "When You're Here" section
- Research Context section
- Main content sections
- No Dead Ends Policy
- Navigation footer

**Validation Rules:**
- Must have H1 title
- Must include "When You're Here" section
- Must include Research Context with overview
- Must have at least 2 main content sections
- Must include No Dead Ends Policy
- Must have Navigation footer
- Maximum line length: 100 characters
- Must have descriptive link text
- Fun fact is recommended

## Section Requirements

### "When You're Here" Section

Must include:
- Brief description of purpose
- Context information
- Navigation guidance
- Optional fun fact

### Research Context Section

Must include:
- Project/topic information
- Background
- Key points or questions
- Methodology (for planning documents)

### No Dead Ends Policy

Must include:
- At least 2 connecting links to related documents
- Brief descriptions for each link
- Links to parent categories or related topics

### Navigation Footer

Must include:
- Back navigation links
- Related topic links
- Link to Technical Glossary
- Link to Table of Contents

## Validation Implementation

### Template Compliance Checking

The validation system checks:
1. Document type detection based on path and content
2. Required sections presence
3. Section content requirements
4. Link text descriptiveness
5. Navigation structure
6. Line length compliance
7. Fun fact presence (warning only)

### Error Handling

- **Errors**: Missing required sections, invalid structure
- **Warnings**: Missing recommended sections, non-descriptive links
- **Info**: Suggestions for improvement

### Performance Requirements
- Template validation must complete within 30 seconds
- Must handle documents up to 1MB in size
- Must provide clear error messages with suggestions

## Best Practices

### Document Creation
1. Choose appropriate template based on document type
2. Fill in all required sections
3. Use descriptive link text
4. Include relevant fun facts
5. Ensure proper navigation structure

### Maintenance
1. Keep templates up to date
2. Validate against template rules
3. Update cross-references when moving documents
4. Maintain consistent formatting

### Quality Assurance
1. Run template validation before committing
2. Check for broken links
3. Verify navigation structure
4. Ensure compliance with standards

## Examples

### Good Example - Navigation Document

```markdown
# Getting Started Guide

## When You're Here

This document provides a comprehensive getting started guide for new users.

- **Purpose**: Help new users understand the system and get up and running quickly
- **Context**: Essential for onboarding new team members
- **Navigation**: Use the table of contents below to jump to specific topics

> **Onboarding Fun Fact**: Studies show that good documentation can reduce onboarding time by 60%!
🚀

## Research Context

### Project Information

**Name**: KiloCode System  
**Type**: Development Tool  
**Priority**: High  
**Dependencies**: Node.js, TypeScript  
**Risk Level**: Low

## No Dead Ends Policy

This document connects to:
- [Installation Guide](./installation.md) - Step-by-step installation instructions
- [Configuration Guide](./configuration.md) - System configuration options
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions

## Navigation
- [← Back to Main Documentation](../README.md)
- [→ Next: Installation Guide](./installation.md)
- [📚 Technical Glossary](GLOSSARY.md)
```

See also: [Validation System Documentation](../tools/VALIDATION_SYSTEM.md), [Best Practices
Guide](../tools/DOCUMENTATION_BEST_PRACTICES.md)

### Bad Example - Missing Required Sections

```markdown
# Getting Started Guide

This document helps new users get started.

## Installation

[Content without required sections...]
```

This would fail validation due to missing "When You're Here", Research Context, and other required
sections.

## Migration Guide

### Converting Existing Documents
1. **Identify Document Type**: Use the DocumentTypeDetector to determine the appropriate template
2. **Add Required Sections**: Add missing required sections following the template structure
3. **Update Navigation**: Ensure proper navigation structure and links
4. **Validate**: Run template validation to ensure compliance
5. **Test**: Verify all links work and document is properly structured

### Common Issues and Fixes

- **Missing "When You're Here"**: Add the section with purpose, context, and navigation info
- **Missing Research Context**: Add section with project information and background
- **Missing Navigation Footer**: Add footer with back links and related topics
- **Non-descriptive Links**: Update link text to be more descriptive
- **Missing Fun Facts**: Add relevant fun facts to improve engagement

## Updates and Maintenance

This validation system is maintained as part of the KiloCode documentation automation. Updates to
template rules should be:
1. Documented in this file
2. Implemented in the validation system
3. Tested with sample documents
4. Applied to existing documentation

For questions or issues with template validation, see the [Validation System
Documentation](../tools/VALIDATION_SYSTEM.md).

## Navigation
- [← Back to Documentation Tools](../tools/)
- [→ Template Examples](./README.md)
- [📚 Technical Glossary](GLOSSARY.md)
- [↑ Table of Contents](#document-template-validation-rules)
