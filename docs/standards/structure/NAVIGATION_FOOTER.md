# Navigation Footer 🧭

**Purpose:** Standards for creating consistent navigation footers that provide cross-references and enable seamless navigation throughout the KiloCode documentation system.

> **Cartography Fun Fact**: Just like how a compass rose on a map shows you the cardinal directions and helps you navigate, our navigation footer shows you the "cardinal directions" of our documentation system - back, root, and source! 🧭

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Footer Requirements](#footer-requirements)
- [Standard Format](#standard-format)
- [Link Requirements](#link-requirements)
- [Path Conventions](#path-conventions)
- [Footer Examples](#footer-examples)
- [Footer Validation](#footer-validation)
- [Common Mistakes](#common-mistakes)
- [Implementation Examples](#implementation-examples)

</details>

## Executive Summary

_Navigation footers provide essential cross-references that help users navigate the documentation system and understand the relationships between different documents. These standards ensure consistent footer formatting and functionality across all KiloCode documentation._

**Key Standards:**

- **Required**: Every document MUST include a navigation footer
- **Format**: `<a id="navigation-footer"></a>` with back/root/source links
- **Links**: Back to parent index, root to main INDEX.md, source to file
- **Paths**: Use correct relative and absolute paths

## Footer Requirements

**Required**: Every document MUST include a navigation footer at the end.

**Purpose**: Navigation footers provide:

- **Back Navigation**: Link to parent index for context
- **Root Navigation**: Link to main documentation index
- **Source Reference**: Link to source file for maintenance
- **Cross-References**: Enable discovery of related content

**Placement**: Navigation footer must be at the very end of the document, after all content.

**Anchor Tag**: Must include `<a id="navigation-footer"></a>` for programmatic access.

## Standard Format

**Format**: Use the standardized footer format with three links.

**Standard Structure**:

```
<a id="navigation-footer"></a>

- Back: [`PARENT_INDEX.md`](PARENT_INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/FILENAME.md#L1`
```

**Format Elements**:

- **Anchor Tag**: `<a id="navigation-footer"></a>`
- **Back Link**: Link to parent index
- **Root Link**: Link to main INDEX.md
- **Source Link**: Link to source file with #L1
- **Separators**: Use `·` (space-dot-space) between links

**Format Examples**:

```markdown
<a id="navigation-footer"></a>

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/DOCUMENTATION_GUIDE.md#L1`

<a id="navigation-footer"></a>

- Back: [`INDEX.md`](../architecture/README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`

<a id="navigation-footer"></a>

- Back: [`README.md`](../README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/standards/core/PRINCIPLES.md#L1`
```

## Link Requirements

**Three Required Links**: Every footer must include exactly three links.

### Back Link

**Purpose**: Link to parent index for context and navigation.

**Format**: `[`PARENT_INDEX.md`](PARENT_INDEX.md)`

**Path Rules**:

- **Same Directory**: `[`INDEX.md`](INDEX.md)`
- **Parent Directory**: `[`INDEX.md`](../INDEX.md)`
- **Nested Parent**: `[`INDEX.md`](../../INDEX.md)`

### Root Link

**Purpose**: Link to main documentation index.

**Format**: `[`INDEX.md`](INDEX.md)`

**Path Rules**:

- **From Root**: `[`INDEX.md`](INDEX.md)`
- **From Subdirectory**: `[`INDEX.md`](../INDEX.md)`
- **From Nested**: `[`INDEX.md`](../../INDEX.md)`

### Source Link

**Purpose**: Link to source file for maintenance and reference.

**Format**: `/docs/FILENAME.md#L1`

**Path Rules**:

- **Always Absolute**: Use absolute repo-root path
- **Always #L1**: Always include #L1 anchor
- **Always /docs/**: Always start with /docs/

## Path Conventions

### Relative Paths (Back and Root Links)

**From Root `docs/` Directory**:

```markdown
# To same directory

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/FILENAME.md#L1`

# To subdirectory

- Back: [`INDEX.md`](architecture/README.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/architecture/FILENAME.md#L1`
```

**From Subdirectory**:

```markdown
# To parent directory

- Back: [`INDEX.md`](../README.md) · Root: [`INDEX.md`](../INDEX.md) · Source: `/docs/architecture/FILENAME.md#L1`

# To sibling directory

- Back: [`INDEX.md`](../README.md) · Root: [`INDEX.md`](../INDEX.md) · Source: `/docs/architecture/FILENAME.md#L1`
```

**From Nested Subdirectory**:

```markdown
# To parent directory

- Back: [`INDEX.md`](../README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/standards/core/FILENAME.md#L1`

# To grandparent directory

- Back: [`INDEX.md`](../../README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/standards/core/FILENAME.md#L1`
```

### Absolute Paths (Source Links)

**Always Use Absolute Paths**: Source links must always use absolute repo-root paths.

**Path Format**: `/docs/DIRECTORY/FILENAME.md#L1`

**Examples**:

```markdown
# Root level file

- Source: `/docs/DOCUMENTATION_GUIDE.md#L1`

# Subdirectory file

- Source: `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`

# Nested subdirectory file

- Source: `/docs/standards/core/PRINCIPLES.md#L1`

# Deeply nested file

- Source: `/docs/standards/structure/NAVIGATION_FOOTER.md#L1`
```

## Footer Examples

### Root Level Document

```markdown
<a id="navigation-footer"></a>

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/DOCUMENTATION_GUIDE.md#L1`
```

### Subdirectory Document

```markdown
<a id="navigation-footer"></a>

- Back: [`INDEX.md`](../architecture/README.md) · Root: [`INDEX.md`](../INDEX.md) · Source: `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`
```

### Nested Subdirectory Document

```markdown
<a id="navigation-footer"></a>

- Back: [`README.md`](../README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/standards/core/PRINCIPLES.md#L1`
```

### Deeply Nested Document

```markdown
<a id="navigation-footer"></a>

- Back: [`README.md`](../README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/standards/structure/NAVIGATION_FOOTER.md#L1`
```

## Footer Validation

**Pre-Submission Checks**: Validate navigation footer before submitting.

**Required Validations**:

- [ ] Footer present at end of document
- [ ] Anchor tag `<a id="navigation-footer"></a>` present
- [ ] Back link correct and functional
- [ ] Root link correct and functional
- [ ] Source link correct and functional
- [ ] Proper path conventions used
- [ ] Consistent formatting

**Footer Quality Checks**:

- [ ] All three links present
- [ ] Links resolve to correct destinations
- [ ] Paths follow conventions
- [ ] Consistent separator formatting
- [ ] Proper anchor tag placement

**Common Footer Issues**:

- ❌ Missing footer
- ❌ Missing anchor tag
- ❌ Broken links
- ❌ Wrong path conventions
- ❌ Inconsistent formatting

## Common Mistakes

**Structure Mistakes**:

- ❌ Missing navigation footer
- ❌ Footer not at end of document
- ❌ Missing anchor tag
- ❌ Wrong number of links
- ❌ Inconsistent formatting

**Path Mistakes**:

- ❌ Using absolute paths for back/root links
- ❌ Using relative paths for source links
- ❌ Wrong path separators
- ❌ Missing #L1 anchor
- ❌ Incorrect directory references

**Link Mistakes**:

- ❌ Broken or non-functional links
- ❌ Links to wrong destinations
- ❌ Missing link text
- ❌ Inconsistent link formatting
- ❌ Wrong file references

**Examples**:

```markdown
# Bad: Missing footer

Content here.

# Good: Complete footer

Content here.

<a id="navigation-footer"></a>

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/FILENAME.md#L1`

# Bad: Wrong path types

- Back: [`INDEX.md`](/docs/INDEX.md) · Root: [`INDEX.md`](/docs/INDEX.md) · Source: `docs/FILENAME.md#L1`

# Good: Correct path types

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/FILENAME.md#L1`

# Bad: Missing #L1 anchor

- Source: `/docs/FILENAME.md`

# Good: Including #L1 anchor

- Source: `/docs/FILENAME.md#L1`
```

## Implementation Examples

### Complete Document with Footer

```markdown
# API Duplication Analysis

**Purpose:** Comprehensive analysis of the API duplication race condition.

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Problem Description](#problem-description)
- [Root Cause Analysis](#root-cause-analysis)
- [Solution Recommendations](#solution-recommendations)

</details>

## Executive Summary

_The API duplication issue is caused by a race condition where multiple API calls are made simultaneously._

## Problem Description

The issue manifests as multiple API requests with spinners appearing simultaneously in the chat interface.

## Root Cause Analysis

The race condition occurs when both the main task loop and subtask completion call `recursivelyMakeClineRequests` simultaneously.

## Solution Recommendations

Implement a synchronization mechanism to ensure only one recursive call executes at a time.

<a id="navigation-footer"></a>

- Back: [`INDEX.md`](../architecture/README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/architecture/API_DUPLICATION_ANALYSIS.md#L1`
```

### Minimal Document with Footer

```markdown
# Build Process Guide

**Purpose:** Step-by-step instructions for building the KiloCode project.

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

- Back: [`INDEX.md`](INDEX.md) · Root: [`INDEX.md`](INDEX.md) · Source: `/docs/BUILD_PROCESS_GUIDE.md#L1`
```

### Nested Document with Footer

```markdown
# Core Principles

**Purpose:** Detailed explanation of the foundational principles that guide all KiloCode documentation decisions.

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Purpose-Driven Documentation](#purpose-driven-documentation)
- [Discoverable Content](#discoverable-content)
- [Linkable Architecture](#linkable-architecture)

</details>

## Executive Summary

_These principles form the philosophical foundation of our documentation system._

## Purpose-Driven Documentation

Every document starts with a clear purpose and intended audience.

## Discoverable Content

Use predictable filenames, headings, and navigation elements.

## Linkable Architecture

Prefer stable anchors and cross-references.

<a id="navigation-footer"></a>

- Back: [`README.md`](../README.md) · Root: [`INDEX.md`](../../INDEX.md) · Source: `/docs/standards/core/PRINCIPLES.md#L1`
```

---

**Navigation**: [Back to Structure](README.md) · [Next: Structure Validation](STRUCTURE_VALIDATION.md) · [Source: `/docs/standards/structure/NAVIGATION_FOOTER.md#L1`](NAVIGATION_FOOTER.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations - layer by layer, with an eye for the unexpected fault lines."\* 🗺️
