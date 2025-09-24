# Headings & Hierarchy 📋

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️
- *Purpose:*\* Detailed standards for heading structure, hierarchy, and formatting to ensure
  consistent document organization and navigation across all KiloCode documentation.

> **Geology Fun Fact**: Just like how geological strata are organized into distinct layers with
> specific characteristics and relationships, our document headings create a hierarchical structure
> that organizes information into logical, discoverable layers! 🌍

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [Hierarchy Rules](#hierarchy-rules)
- [Heading Case Standards](#heading-case-standards)
- [Single H1 Rule](#single-h1-rule)
- [H4 Usage Guidelines](#h4-usage-guidelines)
- [Hierarchy Validation](#hierarchy-validation)
- [Common Mistakes](#common-mistakes)
- Implementation Examples

</details>

## Executive Summary

## Research Context
- *Purpose:*\* Establish comprehensive standards for heading hierarchy and structure across all
  KiloCode documentation to ensure consistent navigation and accessibility.
- *Background:*\* Inconsistent heading structures across documentation files were creating navigation
  challenges and accessibility issues. This document provides clear guidelines for maintaining proper
  heading hierarchy.
- *Research Questions:*\* How should headings be structured for optimal navigation? What case
  conventions should be used? When is H4 appropriate?
- *Methodology:*\* Analysis of existing documentation patterns, accessibility best practices, and
  markdown standards to create comprehensive guidelines.
- *Findings:*\* Clear hierarchy rules (H1→H2→H3 only, with H4 for tight enumerations), consistent case
  standards (Title case for H1, sentence case for H2/H3), and single H1 rule provide the best
  structure.
- \*\*
- Consistent heading hierarchy is essential for document organization, navigation, and accessibility.
  These standards ensure that all KiloCode documentation follows a predictable structure that helps
  both authors and readers navigate content effectively.\*
- *Key Standards:*\*
- **Allowed Hierarchy**: H1 → H2 → H3 only, with H4 for tight enumerations
- **Heading Case**: H1 Title Case, H2/H3 Sentence case
- **Single H1 Rule**: Every file must contain exactly one H1 at the top
- **Logical Progression**: Headings must follow logical information hierarchy

## Hierarchy Rules
- *Allowed Hierarchy*\*: H1 → H2 → H3 only. H4 may be used only for tightly scoped enumerations in a
  single file.
- *Hierarchy Flow*\*:

```
H1 (Document Title)
├── H2 (Major Section)
│   ├── H3 (Subsection)
│   ├── H3 (Subsection)
│   └── H3 (Subsection)
├── H2 (Major Section)
│   ├── H3 (Subsection)
│   └── H3 (Subsection)
└── H2 (Major Section)
    ├── H3 (Subsection)
    └── H3 (Subsection)
```
- *H4 Usage*\*: H4 may only be used for tightly scoped enumerations within a single file, such as:
- Bullet point lists
- Numbered lists
- Definition lists
- Tightly related sub-items
- *Examples*\*:

```markdown
# Document Title (H1)

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

## Major Section (H2)

This section covers the main topic.

### Subsection (H3)

This subsection covers a specific aspect.

#### Enumerated List (H4 - Only for tight scope)
- Item 1
- Item 2
- Item 3

### Another Subsection (H3)

This subsection covers another aspect.

## Another Major Section (H2)

This section covers another main topic.
```

## Heading Case Standards
- \*H1 (Title Case)\*\*: Capitalize major words, including nouns, verbs, adjectives, and adverbs.
- \*H2/H3 (Sentence case)\*\*: Capitalize only the first word and proper nouns.
- *Case Examples*\*:

```markdown
# Good: Title Case for H1

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

API Duplication Analysis State Machine Design Patterns Build Process Guide Documentation Standards

# Good: Sentence case for H2/H3

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

## Problem description

## Root cause analysis

## Solution recommendations

## Implementation guide

### Technical details

### Common mistakes

### Implementation examples

### Validation checklist
```
- *Case Rules*\*:
- **H1 Title Case**: Capitalize major words (nouns, verbs, adjectives, adverbs)
- **H2/H3 Sentence case**: Capitalize only first word and proper nouns
- **Consistent Application**: Apply case rules consistently throughout document
- **Proper Nouns**: Always capitalize proper nouns regardless of heading level

## Single H1 Rule
- *Rule*\*: Every file MUST contain exactly one H1 at the top.
- *Purpose*\*: The H1 serves as the document title and should be unique within each document.
- *Implementation*\*:
- **Single H1**: Only one H1 per document
- **Top Position**: H1 must be at the very top of the document
- **Title Case**: H1 must use Title Case formatting
- **Descriptive**: H1 should clearly describe the document's content
- *Examples*\*:

```markdown
# Good: Single H1 at top

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

# API Duplication Analysis

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

## Problem Description

Content here.

## Root Cause Analysis

More content here.

# Bad: Multiple H1 headings

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

# Document Title

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

Content here.

# Another Title

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

More content here.

# Bad: H1 not at top

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

## Section heading

Content here.

# Document Title

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

More content here.
```

## H4 Usage Guidelines
- *Rule*\*: H4 may be used only for tightly scoped enumerations in a single file.
- *When to Use H4*\*:
- **Bullet Point Lists**: When listing related items
- **Numbered Lists**: When providing step-by-step instructions
- **Definition Lists**: When defining terms or concepts
- **Tightly Related Sub-items**: When breaking down a single concept
- *When NOT to Use H4*\*:
- **Major Content Sections**: Use H2 or H3 instead
- **Cross-Document Topics**: Create separate documents
- **Broad Concepts**: Use H2 or H3 instead
- **Navigation Elements**: Use H2 or H3 instead
- *H4 Examples*\*:

```markdown
### Implementation Strategies (H3)

This section covers different approaches to solving the problem.

#### Simple Lock-Based (H4 - Tight enumeration)
- Use a mutex to prevent concurrent calls
- Implement timeout handling
- Add error recovery mechanisms

#### Enhanced with Call Tracking (H4 - Tight enumeration)
- Track call state and queue additional calls
- Implement call prioritization
- Add performance monitoring

#### Subtask Completion Coordination (H4 - Tight enumeration)
- Coordinate subtask completion with main loop
- Implement completion callbacks
- Add state synchronization
```

## Hierarchy Validation
- *Pre-Submission Checks*\*: Validate heading hierarchy before submitting.
- *Required Validations*\*:
- \[ ] Single H1 at top
- \[ ] H1 uses Title Case
- \[ ] H2/H3 use Sentence case
- \[ ] H4 only used for tight enumerations
- \[ ] Logical hierarchy progression
- \[ ] Consistent formatting
- *Hierarchy Quality Checks*\*:
- \[ ] Headings follow logical information hierarchy
- \[ ] No skipped heading levels (H1 → H3 without H2)
- \[ ] Consistent case formatting
- \[ ] Descriptive and specific headings
- \[ ] Proper nesting and indentation
- *Common Hierarchy Issues*\*:
- ❌ Multiple H1 headings
- ❌ Skipped heading levels
- ❌ Inconsistent case formatting
- ❌ H4 used for major sections
- ❌ Illogical hierarchy progression

## Common Mistakes
- *Structure Mistakes*\*:
- ❌ Multiple H1 headings in one document
- ❌ H1 not at the top of document
- ❌ Skipped heading levels (H1 → H3 without H2)
- ❌ H4 used for major content sections
- ❌ Inconsistent heading hierarchy
- *Case Mistakes*\*:
- ❌ H1 not using Title Case
- ❌ H2/H3 not using Sentence case
- ❌ Inconsistent case application
- ❌ Wrong capitalization of proper nouns
- ❌ Mixed case within headings
- *Content Mistakes*\*:
- ❌ Generic or unclear headings
- ❌ Headings that don't describe content
- ❌ Missing headings for major sections
- ❌ Overly long or complex headings
- ❌ Headings that don't follow logical flow
- *Examples*\*:

```markdown
# Bad: Multiple H1 headings

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

# Document Title

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

Content here.

# Another Title

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

More content here.

# Good: Single H1 heading

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

# Document Title

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

Content here.

## Section heading

More content here.

# Bad: Skipped heading levels

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

# Document Title

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

Content here.

### Subsection heading

More content here.

# Good: Logical hierarchy

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

# Document Title

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

Content here.

## Section heading

More content here.

### Subsection heading

More content here.
```

## Implementation Examples

### Complete Hierarchy Example

```markdown
# API Duplication Analysis

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧
- *Purpose:** Comprehensive analysis of the API duplication race condition.

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- Problem Description
- Root Cause Analysis
- Solution Recommendations
- [Implementation Guide](#implementation-guide)

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

#### Key Code Locations (H4 - Tight enumeration)
- Line 739: `ask` method definition
- Line 1755: `recursivelyMakeClineRequests` call
- Line 1587: Subtask completion call

## Solution Recommendations

Implement a synchronization mechanism to ensure only one recursive call executes at a time.

### Implementation Strategies

This section covers different approaches to solving the problem.

#### Simple Lock-Based (H4 - Tight enumeration)
- Use a mutex to prevent concurrent calls
- Implement timeout handling
- Add error recovery mechanisms

#### Enhanced with Call Tracking (H4 - Tight enumeration)
- Track call state and queue additional calls
- Implement call prioritization
- Add performance monitoring

#### Subtask Completion Coordination (H4 - Tight enumeration)
- Coordinate subtask completion with main loop
- Implement completion callbacks
- Add state synchronization

## Implementation Guide

Follow these steps to implement the solution:
1. **Add Synchronization**: Implement lock-based synchronization
2. **Add Logging**: Add comprehensive debug logging
3. **Test Thoroughly**: Create automated tests for race conditions
4. **Monitor Performance**: Ensure solution doesn't impact performance

### Testing Strategy

Create comprehensive tests to validate the solution.

### Performance Considerations

Ensure the solution doesn't impact system performance.

<a id="navigation-footer"></a>
- Back: [`README.md`](../architecture/README.md) · Root: [`README.md`](../../README.md) · Source:
  `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`
```

### Minimal Hierarchy Example

```markdown
# Build Process Guide

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️
- *Purpose:** Step-by-step instructions for building the KiloCode project.

<details><summary>Table of Contents</summary>
- [Prerequisites](#prerequisites)
- [Build Steps](#build-steps)
- [Troubleshooting](#troubleshooting)

</details>

## Prerequisites

Ensure you have the following installed:

#### Required Software (H4 - Tight enumeration)
- Node.js 18+
- pnpm
- Git

#### Optional Tools (H4 - Tight enumeration)
- VS Code
- Docker
- GitHub CLI

## Build Steps

Follow these steps to build the project:
1. Clone the repository
2. Install dependencies
3. Run the build command
4. Verify the build

### Verification Steps

Ensure the build completed successfully.

## Troubleshooting

Common issues and solutions:

#### Dependency Issues (H4 - Tight enumeration)
- Dependency conflicts
- Version mismatches
- Network problems

#### Build Errors (H4 - Tight enumeration)
- Compilation errors
- TypeScript errors
- Configuration issues

#### Environment Issues (H4 - Tight enumeration)
- Path problems
- Permission issues
- System requirements

<a id="navigation-footer"></a>
- Back: [`README.md`](README.md) · Root: [`README.md`](README.md) · Source:
  `/docs/BUILD_PROCESS_GUIDE.md#L1`
```

## No Dead Ends Policy

This document is designed to provide value and connect to the broader KiloCode ecosystem:
- **Purpose**: \[Brief description of document purpose]
- **Connections**: Links to related documents and resources
- **Next Steps**: Clear guidance on how to use this information
- **Related Documentation**: References to complementary materials

For questions or suggestions about this documentation, please refer to the [Documentation Guide](../DOCUMENTATION_GUIDE.md) or [Architecture Overview](../architecture/README.md).

## Navigation Footer
- \*\*
- *Navigation*\*: [Back to Structure](README.md) · [Next: Table of Contents](TABLE_OF_CONTENTS.md) ·
  [Source: `/docs/standards/structure/HEADINGS_HIERARCHY.md#L1`](HEADINGS_HIERARCHY.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations -
layer by layer, with an eye for the unexpected fault lines."\* 🗺️

## 🔍 Research Context & Next Steps

### When You're Here, You Can:
- *Understanding Documentation Standards:*\*
- **Next**: Check related standards documentation in the same directory
- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology,
  [Documentation Standards Guide](../DOCUMENTATION_GUIDE.md) for context
- *Implementing Documentation Standards:*\*
- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) →
  [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)
- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns
- *Applying Standards to Documentation:*\*
- **Next**: [Documentation Guide](../DOCUMENTATION_GUIDE.md) →
  [Architecture Documentation](../architecture/README.md) →
  [Orchestrator Documentation](../orchestrator/README.md)
- **Related**: [Race Condition Analysis](../architecture/race-condition/README.md) for current
  issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Standards Documentation](README.md) for guidance.
- \*\*
- *Navigation*\*: [← Back to Standards Documentation](README.md) ·
  [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
