# ## Descriptive Anchor Text (Required)

## Table of Contents

* [## Descriptive Anchor Text (Required)](#-descriptive-anchor-text-required)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Descriptive Anchor Text (Required)](#descriptive-anchor-text-required)
* [Good](#good)
* [Research Context](#research-context)
* [Bad](#bad)
* [Conventions](#conventions)
* [Linking Policy 🔗](#linking-policy-)
* [Executive Summary](#executive-summary)
* [Link Types and Rules](#link-types-and-rules)
* [Doc-to-Doc Links](#doc-to-doc-links)
* [Code References](#code-references)
* [External Links](#external-links)
* [Path Conventions](#path-conventions)
* [Relative Paths (Doc-to-Doc)](#relative-paths-doc-to-doc)
* [Absolute Paths (Code References)](#absolute-paths-code-references)
* [Link Quality Standards](#link-quality-standards)
* [Descriptive Link Text](#descriptive-link-text)
* [Link Value](#link-value)
* [Link Integrity](#link-integrity)
* [GitHub-Specific Considerations](#github-specific-considerations)
* [Link Maintenance](#link-maintenance)
* [Regular Checks](#regular-checks)
* [Link Testing](#link-testing)
* [Common Mistakes](#common-mistakes)
* [Path Mistakes](#path-mistakes)
* [Link Text Mistakes](#link-text-mistakes)
* [Maintenance Mistakes](#maintenance-mistakes)
* [Implementation Examples](#implementation-examples)
* [Good Linking Examples](#good-linking-examples)
* [Bad Linking Examples](#bad-linking-examples)
* [Navigation Footer](#navigation-footer)
* [🔍 Research Context & Next Steps](#-research-context--next-steps)
* [When You're Here, You Can:](#when-youre-here-you-can)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [## Descriptive Anchor Text (Required)](#-descriptive-anchor-text-required)
* [Table of Contents](#table-of-contents)
* [Descriptive Anchor Text (Required)](#descriptive-anchor-text-required)
* [Good](#good)
* [Research Context](#research-context)
* [Bad](#bad)
* [Conventions](#conventions)
* [Linking Policy 🔗](#linking-policy-)
* [Executive Summary](#executive-summary)
* [Link Types and Rules](#link-types-and-rules)
* [Doc-to-Doc Links](#doc-to-doc-links)
* [Code References](#code-references)
* [External Links](#external-links)
* [Path Conventions](#path-conventions)
* [Relative Paths (Doc-to-Doc)](#relative-paths-doc-to-doc)
* [Absolute Paths (Code References)](#absolute-paths-code-references)
* [Link Quality Standards](#link-quality-standards)
* [Descriptive Link Text](#descriptive-link-text)
* [Link Value](#link-value)
* [Link Integrity](#link-integrity)
* [GitHub-Specific Considerations](#github-specific-considerations)
* [Link Maintenance](#link-maintenance)
* [Regular Checks](#regular-checks)
* [Link Testing](#link-testing)
* [Common Mistakes](#common-mistakes)
* [Path Mistakes](#path-mistakes)
* [Link Text Mistakes](#link-text-mistakes)
* [Maintenance Mistakes](#maintenance-mistakes)
* [Implementation Examples](#implementation-examples)
* [Good Linking Examples](#good-linking-examples)
* [Bad Linking Examples](#bad-linking-examples)
* [Navigation Footer](#navigation-footer)
* [🔍 Research Context & Next Steps](#-research-context--next-steps)
* [When You're Here, You Can:](#when-youre-here-you-can)
* [No Dead Ends Policy](#no-dead-ends-policy)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

* **Purpose**: \[Brief description of what this document covers]
* **Audience**: \[Who should read this document]
* **Prerequisites**: \[What you should know before reading]
* **Related Documents**: \[Links to related documentation]

## Descriptive Anchor Text (Required)

* Rule: All links MUST use descriptive anchor text that tells the reader where they are going and
  why it is relevant. Avoid bare file paths and naked URLs.
* Rationale: Improves scanability, accessibility, and navigation context; supports screen readers.

### Good

## Research Context

* *Purpose:*\* \[Describe the purpose and scope of this document]

* *Background:*\* \[Provide relevant background information]

* *Research Questions:*\* \[List key questions this document addresses]

* *Methodology:*\* \[Describe the approach or methodology used]

* *Findings:*\* \[Summarize key findings or conclusions]

* \*\*

* [Root Cause Analysis of Duplicate API Requests](../architecture/ROOT_CAUSE_ANALYSIS.md)

* [Testing Strategy for Race Condition Fixes](../../../testing/TESTING_STRATEGY.md)

* [Repository Structure Overview](../REPOSITORY_STRUCTURE.md)

### Bad

* `race-condition/ROOT_CAUSE_ANALYSIS.md`
* `REPOSITORY_STRUCTURE.md`
* `https://example.com/page`

### Conventions

* Use imperative or descriptive phrasing: “See
  [Orchestrator Lifecycle Overview](../../orchestrator/ORCHESTRATOR_LIFECYCLE.md)”.
* Prefer the shortest relative path that works from the current document.
* When linking multiple related docs, use a short list with each item fully descriptive.

# Linking Policy 🔗

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
> documentation helps us understand how! ⚙️

* *Purpose:*\* Comprehensive standards for creating and maintaining links within KiloCode
  documentation, ensuring consistent navigation and discoverability across all documents.

> **Cartography Fun Fact**: The word "cartography" comes from the Greek words "chartis" (map) and
> "graphein" (to write). Our linking policy is like the "cartographic principles" that guide how we
> map the relationships between different pieces of information! 🗺️

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [Link Types and Rules](#link-types-and-rules)
- [Path Conventions](#path-conventions)
- [Link Quality Standards](#link-quality-standards)
- [GitHub-Specific Considerations](#github-specific-considerations)
- [Link Maintenance](#link-maintenance)
- [Common Mistakes](#common-mistakes)
- Implementation Examples

</details>

## Executive Summary

* Effective linking creates a web of knowledge that helps users understand relationships and
  discover
  related information. These standards ensure consistent, functional, and valuable links throughout
  our documentation.\*

* *Key Standards:*\*

* **Doc-to-Doc Links**: Use relative paths within the `docs/` directory

* **Code References**: Use absolute repo-root paths for code files

* **External Links**: Use absolute HTTPS URLs for external references

* **Link Quality**: All links must be descriptive, functional, and valuable

## Link Types and Rules

### Doc-to-Doc Links

* *Rule*\*: Use relative paths within the `docs/` directory. Do NOT prefix with `docs/`.

* *Examples*\*:

```markdown
# From root docs/

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[System Overview](architecture/SYSTEM_OVERVIEW.md) [Standards Guide](README.md)
[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md)

# From subdirectory

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[Architecture Index](../architecture/README.md) [Core Standards](../standards/core/README.md)
[Back to Root](../README.md)

# Same directory

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

[Next Section](NEXT_SECTION.md) [Related Concept](RELATED_CONCEPT.md)
```

* *Path Rules*\*:

* **Same Directory**: `FILENAME.md`

* **Subdirectory**: `subdirectory/FILENAME.md`

* **Parent Directory**: `../FILENAME.md`

* **Root Directory**: `../FILENAME.md` (from any subdirectory)

### Code References

* *Rule*\*: Use absolute repo-root paths for code files.

* *Examples*\*:

```markdown
# File reference

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

[Task.ts](`[FILE_MOVED_OR_RENAMED]`)

# Specific line

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

[ask method](`[FILE_MOVED_OR_RENAMED]`#L739)

# Multiple lines

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[recursivelyMakeClineRequests](`[FILE_MOVED_OR_RENAMED]`#L1790-1850)

# Directory reference

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

[core directory](../../src/core/)
```

* *Line Number Rules*\*:

* **Single Line**: `#L123`

* **Line Range**: `#L123-456`

* **Multiple Ranges**: `#L123-456,L789-890`

### External Links

* *Rule*\*: Use absolute HTTPS URLs for external references.

* *Examples*\*:

```markdown
[Anthropic API](https://docs.anthropic.com/api)
[GitHub Repository](https://github.com/mschulkind/kilocode)
[TypeScript Documentation](https://www.typescriptlang.org/docs/)
```

* *External Link Standards*\*:

* **HTTPS Only**: Never use HTTP for external links

* **Descriptive Text**: Link text should describe the destination

* **Stable URLs**: Prefer stable, canonical URLs

* **Accessibility**: Ensure links work with screen readers

## Path Conventions

### Relative Paths (Doc-to-Doc)

* *From Root `docs/` Directory*\*:

```markdown
# To subdirectory

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

[Architecture](README.md) [Standards](README.md)
[Services](README.md)

# To specific file

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[Core Principles](standards/core/PRINCIPLES.md)
```

* *From Subdirectory*\*:

```markdown
# To parent directory

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

[Back to Root](../README.md) [Architecture Overview](../architecture/README.md)

# To sibling directory

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

[Standards](../standards/README.md) [Services](../services/README.md)

# To nested subdirectory

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

[State Machines](../architecture/state-machines/README.md)
[Core Standards](../standards/core/README.md)
```

* *From Nested Subdirectory*\*:

```markdown
# To root directory

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[Back to Root](../README.md) [Architecture](../architecture/README.md)

# To parent directory

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

[Back to Architecture](../README.md) [State Machines](../state-machines/README.md)

# To sibling directory

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

[Standards](../../standards/README.md) [Services](../../services/README.md)
```

### Absolute Paths (Code References)

* *File References*\*:

```markdown
# Source files

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[`[FILE_MOVED_OR_RENAMED]`](`[FILE_MOVED_OR_RENAMED]`)
[/src/services/laminar/LaminarService.ts](../../src/services/laminar/LaminarService.ts)

# Configuration files

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[Package](/package.json) [/tsconfig.json](/tsconfig.json)

# Documentation files

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

[/docs/README.md](../README.md) [/docs/standards/README.md](../standards/README.md)
```

## Link Quality Standards

### Descriptive Link Text

* *Good Examples*\*:

```markdown
[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[State Machine Design](README.md)
[ask method in Task.ts](`[FILE_MOVED_OR_RENAMED]`#L739)
[Anthropic API Documentation](https://docs.anthropic.com/api)
```

* *Bad Examples*\*:

```markdown
[View details](architecture/API_DUPLICATION_ANALYSIS.md)
[more info](README.md) [this file](`[FILE_MOVED_OR_RENAMED]`#L739)
[Docs.anthropic.com Documentation](https://docs.anthropic.com/api)
```

### Link Value

* *Every link must add value*\*:

* **Contextual**: Links should be relevant to the current content

* **Informative**: Links should provide additional useful information

* **Actionable**: Links should help users accomplish their goals

* **Current**: Links should point to up-to-date information

### Link Integrity

* *Functional Requirements*\*:

* **Working**: All links must resolve to valid destinations

* **Stable**: Links should not break when content moves

* **Accessible**: Links should work for all users and tools

* **Maintainable**: Links should be easy to update and maintain

## GitHub-Specific Considerations

* *Markdown Renderer*\*: All links will be viewed on GitHub.com, so ensure they work in the GitHub
  markdown renderer.

* *Supported Features*\*:

* **Relative Links**: GitHub supports relative links within the repository

* **Code References**: Line numbers create clickable links to specific lines

* **Table of Contents**: Anchors work automatically in GitHub's markdown viewer

* **Image Links**: Both relative and absolute image links are supported

* *Unsupported Features*\*:

* **Reference-style Links**: Avoid `[ref]: url` pattern

* **Custom HTML**: Stick to standard markdown

* **JavaScript**: No interactive elements

* **Custom CSS**: No styling beyond markdown

* *GitHub Link Examples*\*:

```markdown
# These work in GitHub

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[ask method](`[FILE_MOVED_OR_RENAMED]`#L739) [External API](https://docs.anthropic.com/api)

# These don't work well in GitHub

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

[API Analysis][ref] [Custom HTML](<div>content</div>)
```

## Link Maintenance

### Regular Checks

* *Link Validation*\*: Regularly check that all links are functional and current.

* *Update Triggers*\*:

* **File Moves**: Update all links when files are moved or renamed

* **Content Changes**: Update links when referenced content changes

* **External Changes**: Check external links for availability and relevance

* **Structure Changes**: Update links when directory structure changes

### Link Testing

* *Manual Testing*\*:

* Click all links to verify they work

* Check that links point to the intended content

* Verify that external links are still accessible

* Test links with different tools and browsers

* *Automated Testing*\*:

* Use link checking tools to identify broken links

* Set up CI/CD checks for link integrity

* Monitor external link availability

* Track link usage and effectiveness

## Common Mistakes

### Path Mistakes

* *Wrong Path Types*\*:

* ❌ Using absolute paths for doc-to-doc links

* ❌ Using relative paths for code references

* ❌ Missing `../` for parent directory references

* ❌ Incorrect path separators

* *Path Examples*\*:

```markdown
# Wrong

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

[API Analysis](../architecture/API_DUPLICATION_ANALYSIS.md) [Task.ts](src/core/task/Task.ts)

# Correct

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[API Analysis](architecture/API_DUPLICATION_ANALYSIS.md) [Task.ts](`[FILE_MOVED_OR_RENAMED]`)
```

### Link Text Mistakes

* *Generic Text*\*:

* ❌ "click here", "more info", "read more"

* ❌ "this", "that", "here", "there"

* ❌ Generic file names without context

* *Good Link Text*\*:

```markdown
# Descriptive and specific

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[State Machine Design Patterns](README.md)
[ask method implementation](`[FILE_MOVED_OR_RENAMED]`#L739)
```

### Maintenance Mistakes

* *Broken Links*\*:

* ❌ Links to moved or deleted files

* ❌ Links to renamed files

* ❌ Links to changed line numbers

* ❌ Links to unavailable external resources

* *Outdated Links*\*:

* ❌ Links to deprecated content

* ❌ Links to outdated external resources

* ❌ Links to content that no longer exists

* ❌ Links to changed file structures

## Implementation Examples

### Good Linking Examples

* *Documentation Cross-References*\*:

```markdown
## Related Documentation
- [API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md) - Detailed analysis of the
  race condition
- [State Machines](README.md) - State machine documentation
- [Core Standards](README.md) - Documentation standards
- [ask method](`[FILE_MOVED_OR_RENAMED]`#L739) - Implementation details
```

* *Navigation Examples*\*:

```markdown
- *Navigation**: [Back to Architecture](../architecture/) · [Next: State Machines](state-machines/)
·
[Source: `/docs/standards/core/LINKING_POLICY.md#L1`](LINKING_POLICY.md#L1)
```

* *Code Reference Examples*\*:

```markdown
The `recursivelyMakeClineRequests` method in [Task.ts](`[FILE_MOVED_OR_RENAMED]`#L1790) is called
from both the main task loop and subtask completion, creating a race condition when both execute
simultaneously.
```

### Bad Linking Examples

* *Generic Link Text*\*:

```markdown
# Bad

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[View details](architecture/API_DUPLICATION_ANALYSIS.md)
[more info](README.md) [this file](`[FILE_MOVED_OR_RENAMED]`#L739)

# Good

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[State Machine Documentation](README.md)
[ask method implementation](`[FILE_MOVED_OR_RENAMED]`#L739)
```

* *Wrong Path Types*\*:

```markdown
# Bad

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[/docs/architecture/API_DUPLICATION_ANALYSIS.md](../architecture/API_DUPLICATION_ANALYSIS.md)
[Task](src/core/task/Task.ts)

# Good

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

[API Duplication Analysis](architecture/API_DUPLICATION_ANALYSIS.md)
[Task.ts](`[FILE_MOVED_OR_RENAMED]`)
```

## Navigation Footer

* \*\*

* *Navigation*\*: [Back to Core Standards](README.md) ·
  [Next: Content Organization](CONTENT_ORGANIZATION.md) ·
  [Source: `/docs/standards/core/LINKING_POLICY.md#L1`](LINKING_POLICY.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations -
layer by layer, with an eye for the unexpected fault lines."\* 🗺️

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

* *Understanding Documentation Standards:*\*

* **Next**: Check related standards documentation in the same directory

* **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology,
  [Documentation Standards Guide](../../DOCUMENTATION_GUIDE.md) for context

* *Implementing Documentation Standards:*\*

* **Next**: [Repository Development Guide](../GETTING_STARTED.md) →
  [Testing Infrastructure](../../testing/TESTING_STRATEGY.md)

* **Related**: [Orchestrator Documentation](../../orchestrator/README.md) for integration patterns

* *Applying Standards to Documentation:*\*

* **Next**: [Documentation Guide](../../DOCUMENTATION_GUIDE.md) →
  [Architecture Documentation](../../README.md) →
  [Orchestrator Documentation](../../orchestrator/README.md)

* **Related**: [Race Condition Analysis](../../README.md) for current
  issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Standards Documentation](README.md) for guidance.

* \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

* **If you're new here**: Start with the [When You're Here](#when-youre-here) section

* **If you need context**: Check the [Research Context](#research-context) section

* **If you're ready to implement**: Jump to the implementation sections

* **If you're stuck**: Visit our [Troubleshooting Guide](../../tools/TROUBLESHOOTING_GUIDE.md)

* **If you need help**: Check the [Technical Glossary](../../GLOSSARY.md)

* *Navigation*\*: [← Back to Standards Documentation](README.md) ·
  [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
