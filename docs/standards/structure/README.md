# Document Structure 🏗️

**Purpose:** Comprehensive standards for structuring individual documents, ensuring consistent anatomy and hierarchy across all KiloCode documentation.

> **Architecture Fun Fact**: Just like how buildings have a foundation, framework, and finishing details, our documents have a standardized structure that provides stability, organization, and usability! 🏗️

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Document Anatomy](#document-anatomy)
- [Headings & Hierarchy](#headings--hierarchy)
- [Table of Contents](#table-of-contents)
- [Navigation Footer](#navigation-footer)
- [Structure Validation](#structure-validation)
- [Common Mistakes](#common-mistakes)
- [Implementation Examples](#implementation-examples)

</details>

## Executive Summary

_Every KiloCode document follows a standardized structure that ensures consistency, discoverability, and usability. This structure provides a predictable framework that helps both authors and readers navigate content effectively._

**Key Components:**

- **Document Anatomy**: Standardized format with required elements
- **Headings & Hierarchy**: Consistent heading structure and case
- **Table of Contents**: Collapsible TOC with H2/H3 entries
- **Navigation Footer**: Consistent footer with back/root/source links

## Document Anatomy

**Standardized Format**: Every document MUST follow this anatomy:

1. **H1 Title** (single, Title Case)
2. **Purpose Statement** (`**Purpose:**` format with brief description)
3. **Collapsible TOC** (`<details><summary>Table of Contents</summary>` format)
4. **Executive Summary** (italic text with key highlights)
5. **Body Content** (H2/H3 sections with detailed information)
6. **Navigation Footer** (standardized footer with links)

**Visual Structure**:

```markdown
# Document Title

**Purpose:** Brief description of the document's purpose and audience.

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

- Back: [`PARENT_INDEX.md`](PARENT_INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/FILENAME.md#L1`
```

## Headings & Hierarchy

**Allowed Hierarchy**: H1 → H2 → H3 only. H4 may be used only for tightly scoped enumerations in a single file.

**Heading Case**:

- **H1**: Title Case
- **H2/H3**: Sentence case

**Single H1 Rule**: Every file MUST contain exactly one H1 at the top.

**Hierarchy Examples**:

```markdown
# Document Title (H1 - Title Case)

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

## Table of Contents

**Placement**: Add the collapsible TOC immediately after the purpose statement.

**Content**: Include H2 and H3 entries only. Do not list H4.

**Format**: Use the standard `<details><summary>Table of Contents</summary>` format.

**Optional**: If the document has fewer than three H2s and is under ~800 words, a TOC is optional.

**TOC Examples**:

```markdown
<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Document Anatomy](#document-anatomy)
- [Headings & Hierarchy](#headings--hierarchy)
- [Table of Contents](#table-of-contents)
- [Navigation Footer](#navigation-footer)
- [Structure Validation](#structure-validation)
- [Common Mistakes](#common-mistakes)
- [Implementation Examples](#implementation-examples)

</details>
```

## Navigation Footer

**Required**: Every document MUST include a navigation footer at the end with the anchor `<a id="navigation-footer"></a>`.

**Standard Format**:

```
<a id="navigation-footer"></a>

- Back: [`PARENT_INDEX.md`](PARENT_INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/FILENAME.md#L1`
```

**Link Requirements**:

1. **Back**: Link to parent index (relative path)
2. **Root**: Link to main [`INDEX.md`](INDEX.md) (relative path)
3. **Source**: Link to source file (absolute repo-root path with `#L1`)

**Footer Examples**:

```markdown
# From root docs/

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/DOCUMENTATION_GUIDE.md#L1`

# From subdirectory

- Back: [`INDEX.md`](../INDEX.md) · Root: [`INDEX.md`](../INDEX.md) · Source: `/docs/architecture/SYSTEM_OVERVIEW.md#L1`

# From nested subdirectory

- Back: [`INDEX.md`](../README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/standards/core/PRINCIPLES.md#L1`
```

## Structure Validation

**Pre-Submission Checks**: Validate document structure before submitting.

**Required Elements**:

- [ ] Single H1 at top
- [ ] Purpose statement with `**Purpose:**` format
- [ ] Collapsible TOC present (if required)
- [ ] Headings follow H1→H2→H3 hierarchy
- [ ] Navigation footer present and correct

**Structure Quality**:

- [ ] Purpose statement is clear and specific
- [ ] TOC includes all H2 and H3 sections
- [ ] Headings use correct case (H1 Title Case, H2/H3 Sentence case)
- [ ] Navigation footer links are correct and functional
- [ ] Document follows logical flow and organization

## Common Mistakes

**Structure Mistakes**:

- ❌ Multiple H1 headings in one document
- ❌ Missing purpose statement
- ❌ TOC includes H4 entries
- ❌ Missing navigation footer
- ❌ Incorrect heading case

**Content Mistakes**:

- ❌ Purpose statement doesn't match content
- ❌ TOC doesn't match actual headings
- ❌ Navigation footer links are broken
- ❌ Inconsistent heading hierarchy
- ❌ Missing required elements

**Examples**:

```markdown
# Bad: Multiple H1 headings

# Document Title

Content here.

# Another Title

More content here.

# Good: Single H1 heading

# Document Title

Content here.

## Section heading

More content here.
```

## Implementation Examples

### Complete Document Example

```markdown
# API Duplication Analysis

**Purpose:** Comprehensive analysis of the API duplication race condition, including root cause identification, impact assessment, and solution recommendations.

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Problem Description](#problem-description)
- [Root Cause Analysis](#root-cause-analysis)
- [Solution Recommendations](#solution-recommendations)
- [Implementation Guide](#implementation-guide)

</details>

## Executive Summary

_The API duplication issue is caused by a race condition where multiple API calls are made simultaneously, resulting in jumbled responses and confused user experience._

## Problem Description

The issue manifests as multiple API requests with spinners appearing simultaneously in the chat interface.

### Symptoms

- Multiple API requests with spinners
- Jumbled responses in chat interface
- Confused user experience

### Impact

- Degraded user experience
- Potential data corruption
- System instability

## Root Cause Analysis

The race condition occurs when both the main task loop and subtask completion call `recursivelyMakeClineRequests` simultaneously.

### Technical Details

The issue is introduced in commit `749f3d22a` where subtask completion triggers a recursive call to the parent task.

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

- Back: [`INDEX.md`](../architecture/README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`
```

### Minimal Document Example

```markdown
# Build Process Guide

**Purpose:** Step-by-step instructions for building the KiloCode project from source.

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

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/BUILD_PROCESS_GUIDE.md#L1`
```

---

**Navigation**: [Back to Standards](../README.md) · [Next: Document Anatomy](DOCUMENT_ANATOMY.md) · [Source: `/docs/standards/structure/README.md#L1`](README.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations - layer by layer, with an eye for the unexpected fault lines."\* 🗺️
