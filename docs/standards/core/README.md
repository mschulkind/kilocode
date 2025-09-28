# Core Standards 🎯

## Table of Contents
- [Core Standards 🎯](#core-standards)
- [When You're Here](#when-youre-here)
- [Executive Summary](#executive-summary)
- [Research Context](#research-context)
- [Core Principles](#core-principles)
- [File & Directory Conventions](#file-directory-conventions)
- [Linking Policy](#linking-policy)
- [Content Organization](#content-organization)
- [Quick Reference](#quick-reference)
- [](#)
- [](#)
- [Related Standards](#related-standards)
- [Navigation Footer](#navigation-footer)
- [No Dead Ends Policy](#no-dead-ends-policy)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
> this documentation provides structured guidance for understanding and implementing solutions! 🔧

- *Purpose:*\* Essential foundational principles and rules that govern all KiloCode documentation,
  providing the bedrock upon which all other standards are built.

> **Geology Fun Fact**: The Earth's crust is made up of tectonic plates that move slowly over time.
> Our core standards are like the bedrock - the stable foundation that everything else builds upon!
> 🌍

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [Core Principles](#core-principles)
- [File & Directory Conventions](#file--directory-conventions)
- [Linking Policy](#linking-policy)
- [Content Organization](#content-organization)
- [Quick Reference](#quick-reference)
- [Related Standards](#related-standards)

</details>

## Executive Summary

## Research Context

- *Purpose:*\* \[Describe the purpose and scope of this document]

- *Background:*\* \[Provide relevant background information]

- *Research Questions:*\* \[List key questions this document addresses]

- *Methodology:*\* \[Describe the approach or methodology used]

- *Findings:*\* \[Summarize key findings or conclusions]
- \*\*
- These are the fundamental rules that every KiloCode contributor MUST follow. They form the
foundation for all other documentation standards and ensure consistency across the entire project.\*

- *Essential Rules:*\*

- **Purpose-driven**: Every document starts with clear purpose and intended audience

- **Discoverable**: Use predictable filenames, headings, and navigation elements

- **Linkable**: Prefer stable anchors and cross-references

- **Focused**: Single-responsibility documents with clear content splits

- **Accessible**: Semantic structure and descriptive text throughout

## Core Principles

- *Purpose-driven*\*: Every document starts with a clear purpose and intended audience. This is the

- *"compass"*\* that guides all content decisions.

- *Discoverable*\*: Use predictable filenames, headings, and navigation elements. Think of this as
  the

- *"map legend"*\* that helps users navigate the documentation.

- *Linkable*\*: Prefer stable anchors and cross-references. This creates the **"trail system"** that
  connects related concepts.

- *Focused*\*: Single-responsibility documents with clear content splits. Each document should be
  like
  a **"specialized tool"** - good at one thing.

- *Accessible*\*: Semantic structure and descriptive text throughout. This ensures the documentation
  is **"inclusive"** for all users.

## File & Directory Conventions

- *Location*\*: All canonical documentation lives in the `docs/` directory. Ancillary or generated
  artifacts may live elsewhere but must link back to the main documentation.

- *Filename Standard*\*: Use `UPPERCASE_SNAKE_CASE.md` for all file names. Filenames MUST use ASCII
  letters, numbers, and underscores only.

- *Directory Structure*\*:
- Root level: `README.md` as the master navigation hub
- Subdirectories: Each major domain has its own directory with an `README.md`
- Examples: `architecture/`, `services/`, `orchestrator/`, `laminar/`, `ui/`, `tools/`, `testing/`

- *Index Files*\*:
- Maintain a top-level [`README.md`](../README.md) that lists domain indexes
- Use `README.md` in subdirectories when a directory contains multiple topical docs
- Index files should provide clear navigation and categorization

## Linking Policy

- *Doc-to-Doc Links*\*: Use relative paths within the `docs/` directory. Do NOT prefix with `docs/`.

- *Examples*\*:
- `[System Overview](../architecture/SYSTEM_OVERVIEW.md)` (from root docs/)
- `[Architecture Index](../architecture/README.md)` (from subdirectory)
- `[Getting Started](GETTING_STARTED.md)` (same directory)

- *Code References*\*: Use absolute repo-root paths for code files.

- *Examples*\*:
- `/src/services/marketplace/index.ts#L25` (specific line)
- `[FILE_MOVED_OR_RENAMED]` (file reference)

- *External Links*\*: Use absolute HTTPS URLs for external references.

- *GitHub-Specific Considerations*\*:
- All links will be viewed on GitHub.com, so ensure they work in the GitHub markdown renderer
- GitHub supports relative links within the repository
- Code references with line numbers will create clickable links to specific lines in GitHub
- Table of Contents anchors work automatically in GitHub's markdown viewer
- Avoid using features not supported by GitHub's markdown renderer

- *Link Requirements*\*:
- All mentioned filenames must be clickable links
- Use descriptive link text (avoid "click here")
- Include line numbers for code references when relevant
- Do not use reference-style links (`[ref]: url` pattern)

## Content Organization

- *Single Topic Focus*\*: Aim for single-topic documents. If a file exceeds ~1500 words or covers
  more than three distinct concerns, split it.

- *Domain Indexes*\*: Use domain indexes to aggregate short docs rather than creating long
  monoliths.

- *Content Splitting*\*: When splitting content, create a redirecting top-level doc linking to
  subdocs
  and maintain consistent naming.

- *Accessibility Standards*\*:
- Use active voice and imperative instructions
- Provide descriptive link text (avoid "click here")
- Use semantic headings and logical reading order
- Include alt text for any images

## Quick Reference

### **Essential Rules Checklist**
- \[ ] Every document has a clear purpose statement
- \[ ] Filenames use UPPERCASE\_SNAKE\_CASE.md format
- \[ ] All links are clickable and descriptive
- \[ ] Content is focused on a single topic
- \[ ] Structure follows semantic hierarchy

### **Common Mistakes to Avoid**
- ❌ Using "click here" as link text
- ❌ Creating documents that cover multiple unrelated topics
- ❌ Using absolute paths for doc-to-doc links
- ❌ Missing purpose statements
- ❌ Inconsistent filename conventions

## Related Standards

- *Next Steps*\*:
- [Document Structure](../structure/README.md) - How to structure individual documents
- [Navigation & User Experience](../navigation/README.md) - How to create user journeys
- [Code Documentation](../code/README.md) - How to document technical content
- [Engagement & Accessibility](../engagement/README.md) - How to make docs accessible

- *Cross-References*\*:
- [File & Directory Conventions](FILE_CONVENTIONS.md) - Detailed naming rules
- [Linking Policy](LINKING_POLICY.md) - Comprehensive linking standards
- [Content Organization](CONTENT_ORGANIZATION.md) - Organization principles

## Navigation Footer
- \*\*

- *Navigation*\*: [Back to Standards](../../../../README.md) ·
  [Next: Document Structure](../structure/README.md) ·
  [Source: `/docs/standards/core/README.md#L1`](README.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations -
layer by layer, with an eye for the unexpected fault lines."\* 🗺️

## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.
- Each section provides clear navigation to related content
- All internal links are validated and point to existing documents
- Cross-references include context for better understanding
