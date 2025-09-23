## Descriptive Anchor Text (Required)

- Rule: All links MUST use descriptive anchor text that tells the reader where they are going and why it is relevant. Avoid bare file paths and naked URLs.
- Rationale: Improves scanability, accessibility, and navigation context; supports screen readers.

### Good

- [Root Cause Analysis of Duplicate API Requests](../../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md)
- [Testing Strategy for Race Condition Fixes](../../architecture/race-condition/TESTING_STRATEGY.md)
- [Repository Structure Overview](../../architecture/repository/REPOSITORY_STRUCTURE.md)

### Bad

- `race-condition/ROOT_CAUSE_ANALYSIS.md`
- `REPOSITORY_STRUCTURE.md`
- `https://example.com/page`

### Conventions

- Use imperative or descriptive phrasing: “See [Orchestrator Lifecycle Overview](../../orchestrator/ORCHESTRATOR_LIFECYCLE.md)”.
- Prefer the shortest relative path that works from the current document.
- When linking multiple related docs, use a short list with each item fully descriptive.

# Linking Policy 🔗

**Purpose:** Comprehensive standards for creating and maintaining links within KiloCode documentation, ensuring consistent navigation and discoverability across all documents.

> **Cartography Fun Fact**: The word "cartography" comes from the Greek words "chartis" (map) and "graphein" (to write). Our linking policy is like the "cartographic principles" that guide how we map the relationships between different pieces of information! 🗺️

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [Link Types and Rules](#link-types-and-rules)
- [Path Conventions](#path-conventions)
- [Link Quality Standards](#link-quality-standards)
- [GitHub-Specific Considerations](#github-specific-considerations)
- [Link Maintenance](#link-maintenance)
- [Common Mistakes](#common-mistakes)
- [Implementation Examples](#implementation-examples)

</details>

## Executive Summary

_Effective linking creates a web of knowledge that helps users understand relationships and discover related information. These standards ensure consistent, functional, and valuable links throughout our documentation._

**Key Standards:**

- **Doc-to-Doc Links**: Use relative paths within the `docs/` directory
- **Code References**: Use absolute repo-root paths for code files
- **External Links**: Use absolute HTTPS URLs for external references
- **Link Quality**: All links must be descriptive, functional, and valuable

## Link Types and Rules

### Doc-to-Doc Links

**Rule**: Use relative paths within the `docs/` directory. Do NOT prefix with `docs/`.

**Examples**:

```markdown
# From root docs/

[System Overview](architecture/SYSTEM_OVERVIEW.md)
[Standards Guide](standards/README.md)
[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md)

# From subdirectory

[Architecture Index](../architecture/INDEX.md)
[Core Standards](../standards/core/README.md)
[Back to Root](../README.md)

# Same directory

[Next Section](NEXT_SECTION.md)
[Related Concept](RELATED_CONCEPT.md)
```

**Path Rules**:

- **Same Directory**: `FILENAME.md`
- **Subdirectory**: `subdirectory/FILENAME.md`
- **Parent Directory**: `../FILENAME.md`
- **Root Directory**: `../FILENAME.md` (from any subdirectory)

### Code References

**Rule**: Use absolute repo-root paths for code files.

**Examples**:

```markdown
# File reference

[Task.ts](/src/core/task/Task.ts)

# Specific line

[ask method](/src/core/task/Task.ts#L739)

# Multiple lines

[recursivelyMakeClineRequests](/src/core/task/Task.ts#L1790-1850)

# Directory reference

[core directory](/src/core/)
```

**Line Number Rules**:

- **Single Line**: `#L123`
- **Line Range**: `#L123-456`
- **Multiple Ranges**: `#L123-456,L789-890`

### External Links

**Rule**: Use absolute HTTPS URLs for external references.

**Examples**:

```markdown
[Anthropic API](https://docs.anthropic.com/api)
[GitHub Repository](https://github.com/mschulkind/kilocode)
[TypeScript Documentation](https://www.typescriptlang.org/docs/)
```

**External Link Standards**:

- **HTTPS Only**: Never use HTTP for external links
- **Descriptive Text**: Link text should describe the destination
- **Stable URLs**: Prefer stable, canonical URLs
- **Accessibility**: Ensure links work with screen readers

## Path Conventions

### Relative Paths (Doc-to-Doc)

**From Root `docs/` Directory**:

```markdown
# To subdirectory

[Architecture](architecture/README.md)
[Standards](standards/README.md)
[Services](services/README.md)

# To specific file

[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[Core Principles](standards/core/PRINCIPLES.md)
```

**From Subdirectory**:

```markdown
# To parent directory

[Back to Root](../README.md)
[Architecture Overview](../architecture/README.md)

# To sibling directory

[Standards](../standards/README.md)
[Services](../services/README.md)

# To nested subdirectory

[State Machines](../architecture/state-machines/README.md)
[Core Standards](../standards/core/README.md)
```

**From Nested Subdirectory**:

```markdown
# To root directory

[Back to Root](../../README.md)
[Architecture](../../architecture/README.md)

# To parent directory

[Back to Architecture](../README.md)
[State Machines](../state-machines/README.md)

# To sibling directory

[Standards](../../standards/README.md)
[Services](../../services/README.md)
```

### Absolute Paths (Code References)

**File References**:

```markdown
# Source files

[/src/core/task/Task.ts](/src/core/task/Task.ts)
[/src/services/laminar/LaminarService.ts](/src/services/laminar/LaminarService.ts)

# Configuration files

[/package.json](/package.json)
[/tsconfig.json](/tsconfig.json)

# Documentation files

[/docs/README.md](/docs/README.md)
[/docs/standards/README.md](/docs/standards/README.md)
```

## Link Quality Standards

### Descriptive Link Text

**Good Examples**:

```markdown
[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[State Machine Design](architecture/state-machines/README.md)
[ask method in Task.ts](/src/core/task/Task.ts#L739)
[Anthropic API Documentation](https://docs.anthropic.com/api)
```

**Bad Examples**:

```markdown
[click here](architecture/API_DUPLICATION_ANALYSIS.md)
[more info](architecture/state-machines/README.md)
[this file](/src/core/task/Task.ts#L739)
[link](https://docs.anthropic.com/api)
```

### Link Value

**Every link must add value**:

- **Contextual**: Links should be relevant to the current content
- **Informative**: Links should provide additional useful information
- **Actionable**: Links should help users accomplish their goals
- **Current**: Links should point to up-to-date information

### Link Integrity

**Functional Requirements**:

- **Working**: All links must resolve to valid destinations
- **Stable**: Links should not break when content moves
- **Accessible**: Links should work for all users and tools
- **Maintainable**: Links should be easy to update and maintain

## GitHub-Specific Considerations

**Markdown Renderer**: All links will be viewed on GitHub.com, so ensure they work in the GitHub markdown renderer.

**Supported Features**:

- **Relative Links**: GitHub supports relative links within the repository
- **Code References**: Line numbers create clickable links to specific lines
- **Table of Contents**: Anchors work automatically in GitHub's markdown viewer
- **Image Links**: Both relative and absolute image links are supported

**Unsupported Features**:

- **Reference-style Links**: Avoid `[ref]: url` pattern
- **Custom HTML**: Stick to standard markdown
- **JavaScript**: No interactive elements
- **Custom CSS**: No styling beyond markdown

**GitHub Link Examples**:

```markdown
# These work in GitHub

[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[ask method](/src/core/task/Task.ts#L739)
[External API](https://docs.anthropic.com/api)

# These don't work well in GitHub

[API Analysis][ref]
[Custom HTML](<div>content</div>)
```

## Link Maintenance

### Regular Checks

**Link Validation**: Regularly check that all links are functional and current.

**Update Triggers**:

- **File Moves**: Update all links when files are moved or renamed
- **Content Changes**: Update links when referenced content changes
- **External Changes**: Check external links for availability and relevance
- **Structure Changes**: Update links when directory structure changes

### Link Testing

**Manual Testing**:

- Click all links to verify they work
- Check that links point to the intended content
- Verify that external links are still accessible
- Test links with different tools and browsers

**Automated Testing**:

- Use link checking tools to identify broken links
- Set up CI/CD checks for link integrity
- Monitor external link availability
- Track link usage and effectiveness

## Common Mistakes

### Path Mistakes

**Wrong Path Types**:

- ❌ Using absolute paths for doc-to-doc links
- ❌ Using relative paths for code references
- ❌ Missing `../` for parent directory references
- ❌ Incorrect path separators

**Path Examples**:

```markdown
# Wrong

[API Analysis](/docs/architecture/API_DUPLICATION_ANALYSIS.md)
[Task.ts](src/core/task/Task.ts)

# Correct

[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[Task.ts](/src/core/task/Task.ts)
```

### Link Text Mistakes

**Generic Text**:

- ❌ "click here", "more info", "read more"
- ❌ "this", "that", "here", "there"
- ❌ Generic file names without context

**Good Link Text**:

```markdown
# Descriptive and specific

[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[State Machine Design Patterns](architecture/state-machines/README.md)
[ask method implementation](/src/core/task/Task.ts#L739)
```

### Maintenance Mistakes

**Broken Links**:

- ❌ Links to moved or deleted files
- ❌ Links to renamed files
- ❌ Links to changed line numbers
- ❌ Links to unavailable external resources

**Outdated Links**:

- ❌ Links to deprecated content
- ❌ Links to outdated external resources
- ❌ Links to content that no longer exists
- ❌ Links to changed file structures

## Implementation Examples

### Good Linking Examples

**Documentation Cross-References**:

```markdown
## Related Documentation

- [API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md) - Detailed analysis of the race condition
- [State Machines](architecture/state-machines/README.md) - State machine documentation
- [Core Standards](standards/core/README.md) - Documentation standards
- [ask method](/src/core/task/Task.ts#L739) - Implementation details
```

**Navigation Examples**:

```markdown
**Navigation**: [Back to Architecture](../architecture/) · [Next: State Machines](state-machines/) · [Source: `/docs/standards/core/LINKING_POLICY.md#L1`](LINKING_POLICY.md#L1)
```

**Code Reference Examples**:

```markdown
The `recursivelyMakeClineRequests` method in [Task.ts](/src/core/task/Task.ts#L1790) is called from both the main task loop and subtask completion, creating a race condition when both execute simultaneously.
```

### Bad Linking Examples

**Generic Link Text**:

```markdown
# Bad

[click here](architecture/API_DUPLICATION_ANALYSIS.md)
[more info](architecture/state-machines/README.md)
[this file](/src/core/task/Task.ts#L739)

# Good

[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[State Machine Documentation](architecture/state-machines/README.md)
[ask method implementation](/src/core/task/Task.ts#L739)
```

**Wrong Path Types**:

```markdown
# Bad

[/docs/architecture/API_DUPLICATION_ANALYSIS.md](/docs/architecture/API_DUPLICATION_ANALYSIS.md)
[src/core/task/Task.ts](src/core/task/Task.ts)

# Good

[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[Task.ts](/src/core/task/Task.ts)
```

---

**Navigation**: [Back to Core Standards](README.md) · [Next: Content Organization](CONTENT_ORGANIZATION.md) · [Source: `/docs/standards/core/LINKING_POLICY.md#L1`](LINKING_POLICY.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations - layer by layer, with an eye for the unexpected fault lines."\* 🗺️
