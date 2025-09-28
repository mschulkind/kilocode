# Document Structure 🏗️

## Table of Contents

* [Document Structure 🏗️](#document-structure-)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Executive Summary](#executive-summary)
* [Research Context](#research-context)
* [Document Anatomy](#document-anatomy)
* [Headings & Hierarchy](#headings-hierarchy)
* [Navigation Footer](#navigation-footer)
* [Structure Validation](#structure-validation)
* [Common Mistakes](#common-mistakes)
* [Implementation Examples](#implementation-examples)
* [Complete Document Example](#complete-document-example)
* [Minimal Document Example](#minimal-document-example)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation](#navigation)
* [Document Structure 🏗️](#document-structure-)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Executive Summary](#executive-summary)
* [Research Context](#research-context)
* [Document Anatomy](#document-anatomy)
* [Headings & Hierarchy](#headings-hierarchy)
* [Navigation Footer](#navigation-footer)
* [Structure Validation](#structure-validation)
* [Common Mistakes](#common-mistakes)
* [Implementation Examples](#implementation-examples)
* [Complete Document Example](#complete-document-example)
* [Minimal Document Example](#minimal-document-example)
* [No Dead Ends Policy](#no-dead-ends-policy)
* ↑ [Table of Contents](#table-of-contents)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

* **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
* **Context**: Use this as a starting point or reference while navigating the project.
* **Navigation**: Use the table of contents below to jump to specific topics.

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
> foundation, clear structure, and intuitive navigation! 🏗️

* *Purpose:*\* Comprehensive standards for structuring individual documents, ensuring consistent
  anatomy and hierarchy across all KiloCode documentation.

> **Architecture Fun Fact**: Just like how buildings have a foundation, framework, and finishing
> details, our documents have a standardized structure that provides stability, organization, and
> usability! 🏗️

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [Document Anatomy](#document-anatomy)
- [Headings & Hierarchy](#headings--hierarchy)
- [Table of Contents](#table-of-contents)
- Navigation Footer
- [Structure Validation](#structure-validation)
- [Common Mistakes](#common-mistakes)
- Implementation Examples

</details>

## Executive Summary

## Research Context

* *Purpose:*\* \[Describe the purpose and scope of this document]

* *Background:*\* \[Provide relevant background information]

* *Research Questions:*\* \[List key questions this document addresses]

* *Methodology:*\* \[Describe the approach or methodology used]

* *Findings:*\* \[Summarize key findings or conclusions]

* \*\*

* Every KiloCode document follows a standardized structure that ensures consistency,
  discoverability,
  and usability. This structure provides a predictable framework that helps both authors and readers
  navigate content effectively.\*

* *Key Components:*\*

* **Document Anatomy**: Standardized format with required elements

* **Headings & Hierarchy**: Consistent heading structure and case

* **Table of Contents**: Collapsible TOC with H2/H3 entries

* **Navigation Footer**: Consistent footer with back/root/source links

## Document Anatomy

* *Standardized Format*\*: Every document MUST follow this anatomy:

1. **H1 Title** (single, Title Case)
2. **Purpose Statement** (`**Purpose:**` format with brief description)
3. **Collapsible TOC** (`<details><summary>Table of Contents</summary>` format)
4. **Executive Summary** (italic text with key highlights)
5. **Body Content** (H2/H3 sections with detailed information)
6. **Navigation Footer** (standardized footer with links)

* *Visual Structure*\*:

```markdown
# Document Title

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

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

<a id="navigation-footer"></a>
- Back: [`PARENT_README.md`](PARENT_README.md) · Root: [`README.md`](README.md) · Source:
  `/docs/FILENAME.md#L1`
```

## Headings & Hierarchy

* *Allowed Hierarchy*\*: H1 → H2 → H3 only. H4 may be used only for tightly scoped enumerations in a
  single file.

* *Heading Case*\*:

* **H1**: Title Case

* **H2/H3**: Sentence case

* *Single H1 Rule*\*: Every file MUST contain exactly one H1 at the top.

* *Hierarchy Examples*\*:

```markdown
# Document Title (H1 - Title Case)

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

## Major section heading (H2 - Sentence case)

This section covers the main topic.

### Subsection heading (H3 - Sentence case)

This subsection covers a specific aspect.

#### Enumerated list (H4 - Only for tight scope)
- Item 1
- Item 2
- Item 3

### Another subsection (H3 - Sentence case)

This subsection covers another aspect.

## Another major section (H2 - Sentence case)

This section covers another main topic.
```

## Navigation Footer

* *Required*\*: Every document MUST include a navigation footer at the end with the anchor
  `<a id="navigation-footer"></a>`.

* *Standard Format*\*:

```
<a id="navigation-footer"></a>
- Back: [`PARENT_README.md`](PARENT_README.md) · Root: [`README.md`](README.md) · Source:
`/docs/FILENAME.md#L1`
```

* *Link Requirements*\*:

1. **Back**: Link to parent index (relative path)
2. **Root**: Link to main [`README.md`](README.md) (relative path)
3. **Source**: Link to source file (absolute repo-root path with `#L1`)

* *Footer Examples*\*:

```markdown
# From root docs/

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️
- Back: [`README.md`](README.md) · Root: [`README.md`](README.md) · Source:
  `/docs/DOCUMENTATION_GUIDE.md#L1`

# From subdirectory

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧
- Back: [`README.md`](../README.md) · Root: [`README.md`](../README.md) · Source:
  `/docs/architecture/SYSTEM_OVERVIEW.md#L1`

# From nested subdirectory

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️
- Back: [`README.md`](../README.md) · Root: [`README.md`](../README.md) · Source:
  `/docs/standards/core/PRINCIPLES.md#L1`
```

## Structure Validation

* *Pre-Submission Checks*\*: Validate document structure before submitting.

* *Required Elements*\*:

* \[ ] Single H1 at top

* \[ ] Purpose statement with `**Purpose:**` format

* \[ ] Collapsible TOC present (if required)

* \[ ] Headings follow H1→H2→H3 hierarchy

* \[ ] Navigation footer present and correct

* *Structure Quality*\*:

* \[ ] Purpose statement is clear and specific

* \[ ] TOC includes all H2 and H3 sections

* \[ ] Headings use correct case (H1 Title Case, H2/H3 Sentence case)

* \[ ] Navigation footer links are correct and functional

* \[ ] Document follows logical flow and organization

## Common Mistakes

* *Structure Mistakes*\*:

* ❌ Multiple H1 headings in one document

* ❌ Missing purpose statement

* ❌ TOC includes H4 entries

* ❌ Missing navigation footer

* ❌ Incorrect heading case

* *Content Mistakes*\*:

* ❌ Purpose statement doesn't match content

* ❌ TOC doesn't match actual headings

* ❌ Navigation footer links are broken

* ❌ Inconsistent heading hierarchy

* ❌ Missing required elements

* *Examples*\*:

```markdown
# Bad: Multiple H1 headings

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

# Document Title

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

Content here.

# Another Title

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

More content here.

# Good: Single H1 heading

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

# Document Title

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

Content here.

## Section heading

More content here.
```

## Implementation Examples

### Complete Document Example

```markdown
# API Duplication Analysis

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

- *Purpose:** Comprehensive analysis of the API duplication race condition, including root cause
identification, impact assessment, and solution recommendations.

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- Problem Description
- Root Cause Analysis
- Solution Recommendations
- [Implementation Guide](#implementation-guide)

</details>

## Executive Summary

_The API duplication issue is caused by a race condition where multiple API calls are made
simultaneously, resulting in jumbled responses and confused user experience._

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

## Solution Recommendations

Implement a synchronization mechanism to ensure only one recursive call executes at a time.

### Implementation Strategies
1. **Simple Lock-Based**: Use a mutex to prevent concurrent calls
2. **Enhanced with Call Tracking**: Track call state and queue additional calls
3. **Subtask Completion Coordination**: Coordinate subtask completion with main loop

## Implementation Guide

Follow these steps to implement the solution:
1. **Add Synchronization**: Implement lock-based synchronization
2. **Add Logging**: Add comprehensive debug logging
3. **Test Thoroughly**: Create automated tests for race conditions
4. **Monitor Performance**: Ensure solution doesn't impact performance

<a id="navigation-footer"></a>
- Back: [`README.md`](../architecture/README.md) · Root: [`README.md`](../README.md) · Source:
  `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`
```

### Minimal Document Example

```markdown
# Build Process Guide

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

- *Purpose:** Step-by-step instructions for building the KiloCode project from source.

## Prerequisites

Ensure you have the following installed:
- Node.js 18+
- pnpm
- Git

## Build Steps
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

* \*\*

* *Navigation*\*: [Back to Standards](../../../README.md) · [Next: Document
  Anatomy](DOCUMENT_ANATOMY.md) ·
  [Source: `/docs/standards/structure/README.md#L1`](README.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations -
layer by layer, with an eye for the unexpected fault lines."\* 🗺️

## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.

* Each section provides clear navigation to related content
* All internal links are validated and point to existing documents
* Cross-references include context for better understanding

## Navigation

* 📚 [Technical Glossary](../../GLOSSARY.md)
