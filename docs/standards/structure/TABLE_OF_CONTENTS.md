# Table of Contents 📑

## When You're Here

This document provides [purpose of document].

- **Purpose**: [Brief description of what this document covers]
- **Context**: [How this fits into the broader system/project]
- **Navigation**: Use the table of contents below to jump to specific topics



> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

- *Purpose:*\* Standards for creating and formatting table of contents (TOC) elements to ensure
  consistent navigation and discoverability across all KiloCode documentation.

> **Cartography Fun Fact**: Just like how a map legend helps you understand the symbols and features
> on a map, our table of contents helps you understand the structure and navigate the content of our
> documents! 🗺️

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [TOC Requirements](#toc-requirements)
- [Format Standards](#format-standards)
- [Content Guidelines](#content-guidelines)
- [Placement Rules](#placement-rules)
- [Optional TOC Criteria](#optional-toc-criteria)
- [TOC Validation](#toc-validation)
- [Common Mistakes](#common-mistakes)
- Implementation Examples

</details>

## Executive Summary

## Research Context

- *Purpose:*\* Define standards for table of contents (TOC) creation and formatting to improve
  document navigation and discoverability across all KiloCode documentation.

- *Background:*\* Inconsistent TOC formatting and missing TOCs in longer documents were making it
  difficult for users to navigate and find information efficiently.

- *Research Questions:*\* What format should TOCs use? When are TOCs required? What content should
be
  included?

- *Methodology:*\* Analysis of documentation length patterns, user navigation needs, and markdown
best
  practices to determine optimal TOC standards.

- *Findings:*\* Collapsible format with H2/H3 entries only, required for documents with 3+ H2s and
  800+ words, provides optimal navigation without cluttering shorter documents.
- \*\*
- Table of contents elements provide essential navigation for readers, helping them understand
  document structure and quickly locate specific information. These standards ensure consistent TOC
  formatting and content across all KiloCode documentation.\*

- *Key Standards:*\*

- **Format**: Collapsible `<details><summary>` format

- **Content**: Include H2 and H3 entries only

- **Placement**: Immediately after purpose statement

- **Optional**: Skip TOC for documents with <3 H2s and <800 words

## TOC Requirements

- *Required Elements*\*: Every document that meets the criteria MUST include a TOC.

- *TOC Criteria*\*:

- **H2 Count**: Document has 3 or more H2 sections

- **Word Count**: Document is 800 words or more

- **Content Complexity**: Document covers multiple distinct topics

- **Navigation Value**: TOC would help readers navigate content

- *TOC Format*\*: Use the standard collapsible format:

```markdown
<details><summary>Table of Contents</summary>
- [Section 1](#section-1)
- [Section 2](#section-2)
- [Subsection 2.1](#subsection-21)
- [Subsection 2.2](#subsection-22)
- [Section 3](#section-3)

</details>
```

## Format Standards

- *Collapsible Format*\*: Use `<details><summary>Table of Contents</summary>` format.

- *Benefits*\*:

- **Space Efficient**: Doesn't take up space when collapsed

- **User Controlled**: Users can expand/collapse as needed

- **Consistent**: Standard format across all documents

- **Accessible**: Works with screen readers and other tools

- *Format Structure*\*:

```markdown
<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [Section 1](#section-1)
- [Section 2](#section-2)
- [Subsection 2.1](#subsection-21)
- [Subsection 2.2](#subsection-22)
- [Section 3](#section-3)

</details>
```

- *Format Elements*\*:

- **Opening Tag**: `<details><summary>Table of Contents</summary>`

- **List Items**: `- [Section Name](#section-anchor)`

- **Closing Tag**: `</details>`

- **Indentation**: Use consistent indentation for readability

## Content Guidelines

- *Include H2 and H3 Entries*\*: TOC should include all H2 and H3 sections.

- *Exclude H4 Entries*\*: Do not include H4 entries in the TOC.

- *Anchor Links*\*: Use proper anchor links that match heading text.

- *Anchor Format*\*: Convert heading text to anchor format:

- **Lowercase**: Convert to lowercase

- **Hyphens**: Replace spaces with hyphens

- **Special Characters**: Remove special characters

- **Numbers**: Keep numbers as-is

- *Anchor Examples*\*:

```markdown
# Heading Text → #heading-text

## Section Name → #section-name

### Subsection Title → #subsection-title

## API Duplication Analysis → #api-duplication-analysis

### Root Cause Analysis → #root-cause-analysis
```

- *Content Examples*\*:

```markdown
<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- Problem Description
- Root Cause Analysis
- Solution Recommendations
- [Implementation Guide](#implementation-guide)
- Testing Strategy
- [Performance Considerations](#performance-considerations)

</details>
```

## Placement Rules

- *Placement*\*: Add the collapsible TOC immediately after the purpose statement.

- *Order of Elements*\*:
1. **H1 Title** - Document title
2. **Purpose Statement** - Document purpose
3. **Collapsible TOC** - Navigation overview
4. **Executive Summary** - Key highlights
5. **Body Content** - Detailed information
6. **Navigation Footer** - Cross-references

- *Placement Examples*\*:

```markdown
# Document Title

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

- *Purpose:** Brief description of the document's purpose and audience.

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [Section 1](#section-1)
- [Section 2](#section-2)

</details>

## Executive Summary

_Key highlights and overview of the document content._

## Section 1

Content here.

## Section 2

More content here.
```

## Optional TOC Criteria

- *Skip TOC When*\*: Document has fewer than three H2s and is under ~800 words.

- *Criteria for Skipping*\*:

- **H2 Count**: Less than 3 H2 sections

- **Word Count**: Under 800 words

- **Content Simplicity**: Single, focused topic

- **Navigation Value**: TOC wouldn't significantly help navigation

- *Examples of Documents That Can Skip TOC*\*:

```markdown
# Build Process Guide (Simple, focused)

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

- *Purpose:** Step-by-step instructions for building the project.

## Prerequisites
- Node.js 18+
- pnpm
- Git

## Build Steps
1. Clone repository
2. Install dependencies
3. Run build command

## Troubleshooting
- Dependency issues
- Build errors
- Environment problems
```

- *Examples of Documents That Need TOC*\*:

```markdown
# API Duplication Analysis (Complex, multiple topics)

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

- *Purpose:** Comprehensive analysis of the API duplication race condition.

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- Problem Description
- Root Cause Analysis
- Solution Recommendations
- [Implementation Guide](#implementation-guide)
- Testing Strategy
- [Performance Considerations](#performance-considerations)

</details>

## Executive Summary

...
```

## TOC Validation

- *Pre-Submission Checks*\*: Validate TOC before submitting.

- *Required Validations*\*:
- \[ ] TOC present (if required by criteria)
- \[ ] Collapsible format used
- \[ ] Includes all H2 sections
- \[ ] Includes all H3 sections
- \[ ] No H4 entries included
- \[ ] Links work correctly
- \[ ] Proper placement after purpose statement

- *TOC Quality Checks*\*:
- \[ ] Anchor links match heading text
- \[ ] Consistent formatting
- \[ ] Logical order of entries
- \[ ] Descriptive section names
- \[ ] Proper indentation

- *Common TOC Issues*\*:
- ❌ Missing TOC when required
- ❌ TOC includes H4 entries
- ❌ Broken anchor links
- ❌ Inconsistent formatting
- ❌ Wrong placement

## Common Mistakes

- *Format Mistakes*\*:
- ❌ Using non-collapsible format
- ❌ Missing opening or closing tags
- ❌ Inconsistent indentation
- ❌ Wrong summary text
- ❌ Missing list item formatting

- *Content Mistakes*\*:
- ❌ Including H4 entries
- ❌ Missing H2 or H3 sections
- ❌ Broken anchor links
- ❌ Inconsistent section names
- ❌ Wrong anchor format

- *Placement Mistakes*\*:
- ❌ TOC not after purpose statement
- ❌ TOC in wrong location
- ❌ Missing TOC when required
- ❌ TOC present when not needed
- ❌ Wrong order of elements

- *Examples*\*:

```markdown
# Bad: Non-collapsible format

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)

# Good: Collapsible format

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

<details><summary>Table of Contents</summary>
- [Section 1](#section-1)
- [Section 2](#section-2)

</details>

# Bad: Including H4 entries

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

<details><summary>Table of Contents</summary>
- [Section 1](#section-1)
- [Subsection 1.1](#subsection-11)
- [Sub-subsection 1.1.1](#sub-subsection-111)
- [Section 2](#section-2)

</details>

# Good: Only H2 and H3 entries

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

<details><summary>Table of Contents</summary>
- [Section 1](#section-1)
- [Subsection 1.1](#subsection-11)
- [Section 2](#section-2)

</details>
```

## Implementation Examples

### Complete TOC Example

```markdown
# API Duplication Analysis

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

- *Purpose:** Comprehensive analysis of the API duplication race condition, including root cause
identification, impact assessment, and solution recommendations.

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- Problem Description
- Root Cause Analysis
- Solution Recommendations
- [Implementation Guide](#implementation-guide)
- Testing Strategy
- [Performance Considerations](#performance-considerations)
- [Common Mistakes](#common-mistakes)
- Implementation Examples

</details>

## Executive Summary

_The API duplication issue is caused by a race condition where multiple API calls are made
simultaneously._

## Problem Description

The issue manifests as multiple API requests with spinners appearing simultaneously in the chat
interface.

### Symptoms
- Multiple API requests with spinners
- Jumbled responses in chat interface
- Confused user experience

### Impact
- Degraded user experience
- Potential data corruption
- System instability

## Root Cause Analysis

The race condition occurs when both the main task loop and subtask completion call
`recursivelyMakeClineRequests` simultaneously.

### Technical Details

The issue is introduced in commit `749f3d22a` where subtask completion triggers a recursive call to
the parent task.

### Code Analysis

The problematic code is located in the `ask` method of `Task.ts`.

## Solution Recommendations

Implement a synchronization mechanism to ensure only one recursive call executes at a time.

### Implementation Strategies

This section covers different approaches to solving the problem.

### Performance Considerations

Ensure the solution doesn't impact system performance.

## Implementation Guide

Follow these steps to implement the solution:
1. **Add Synchronization**: Implement lock-based synchronization
2. **Add Logging**: Add comprehensive debug logging
3. **Test Thoroughly**: Create automated tests for race conditions
4. **Monitor Performance**: Ensure solution doesn't impact performance

## Testing Strategy

Create comprehensive tests to validate the solution.

## Performance Considerations

Ensure the solution doesn't impact system performance.

## Common Mistakes

Common mistakes to avoid when implementing the solution.

## Implementation Examples

Examples of how to implement the solution.

<a id="navigation-footer"></a>
- Back: [`README.md`](../architecture/README.md) · Root: [`README.md`](../README.md) · Source:
  `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`
```

### Minimal TOC Example

```markdown
# Build Process Guide

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

- *Purpose:** Step-by-step instructions for building the KiloCode project from source.

<details><summary>Table of Contents</summary>
- [Prerequisites](#prerequisites)
- [Build Steps](#build-steps)
- [Troubleshooting](#troubleshooting)

</details>

## Prerequisites

Ensure you have the following installed:
- Node.js 18+
- pnpm
- Git

## Build Steps

Follow these steps to build the project:
1. Clone the repository
2. Install dependencies
3. Run the build command
4. Verify the build

## Troubleshooting

Common issues and solutions:
- Dependency conflicts
- Build errors
- Environment issues

<a id="navigation-footer"></a>
- Back: [`README.md`](README.md) · Root: [`README.md`](README.md) · Source:
  `/docs/BUILD_PROCESS_GUIDE.md#L1`
```

### No TOC Example

```markdown
# Quick Reference

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

- *Purpose:** Quick reference for common commands and shortcuts.

## Git Commands
- `git clone` - Clone repository
- `git pull` - Pull latest changes
- `git push` - Push changes

## Build Commands
- `npm install` - Install dependencies
- `npm run build` - Build project
- `npm test` - Run tests

## VS Code Shortcuts
- `Ctrl+Shift+P` - Command palette
- `Ctrl+` - Toggle terminal
- `F5` - Start debugging

<a id="navigation-footer"></a>
- Back: [`README.md`](README.md) · Root: [`README.md`](README.md) · Source:
  `/docs/QUICK_REFERENCE.md#L1`
```

## Navigation Footer
- \*\*

- *Navigation*\*: [Back to Structure](README.md) · [Next: Navigation Footer](NAVIGATION_FOOTER.md) ·
  [Source: `/docs/standards/structure/TABLE_OF_CONTENTS.md#L1`](TABLE_OF_CONTENTS.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations -
layer by layer, with an eye for the unexpected fault lines."\* 🗺️

## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.
- Each section provides clear navigation to related content
- All internal links are validated and point to existing documents
- Cross-references include context for better understanding
