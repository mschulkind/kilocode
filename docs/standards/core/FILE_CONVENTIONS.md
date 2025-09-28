# File & Directory Conventions 📁

## Table of Contents
- [File & Directory Conventions 📁](#file-directory-conventions-)
- [Table of Contents](#table-of-contents)
- [When You're Here](#when-youre-here)
- [Executive Summary](#executive-summary)
- [Research Context](#research-context)
- [Filename Standards](#filename-standards)
- [Directory Structure](#directory-structure)
- [Index File Conventions](#index-file-conventions)
- [Naming Patterns](#naming-patterns)
- [Organization Principles](#organization-principles)
- [Common Mistakes](#common-mistakes)
- [Implementation Examples](#implementation-examples)
- [Navigation Footer](#navigation-footer)
- [🔍 Research Context & Next Steps](#-research-context--next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [File & Directory Conventions 📁](#file-directory-conventions-)
- [Table of Contents](#table-of-contents)
- [Executive Summary](#executive-summary)
- [Research Context](#research-context)
- [Filename Standards](#filename-standards)
- [Directory Structure](#directory-structure)
- [Index File Conventions](#index-file-conventions)
- [Naming Patterns](#naming-patterns)
- [Organization Principles](#organization-principles)
- [Common Mistakes](#common-mistakes)
- [Implementation Examples](#implementation-examples)
- [Navigation Footer](#navigation-footer)
- [🔍 Research Context & Next Steps](#-research-context--next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
> foundation, clear structure, and intuitive navigation! 🏗️

- *Purpose:*\* Comprehensive rules for naming, organizing, and structuring documentation files and
  directories to ensure consistency and discoverability across the KiloCode project.

> **Geology Fun Fact**: The Earth's crust is organized into distinct layers and formations, each
> with its own characteristics and purpose. Our file conventions are like the "geological
> classification system" that helps us organize our documentation into logical, discoverable
> structures! 🌍

<details><summary>Table of Contents</summary>
- [Executive Summary](#executive-summary)
- [Filename Standards](#filename-standards)
- [Directory Structure](#directory-structure)
- [Index File Conventions](#index-file-conventions)
- [Naming Patterns](#naming-patterns)
- [Organization Principles](#organization-principles)
- [Common Mistakes](#common-mistakes)
- Implementation Examples

</details>

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: \[Brief description of what this document covers]
- **Audience**: \[Who should read this document]
- **Prerequisites**: \[What you should know before reading]
- **Related Documents**: \[Links to related documentation]

## Executive Summary

## Research Context

- *Purpose:*\* \[Describe the purpose and scope of this document]

- *Background:*\* \[Provide relevant background information]

- *Research Questions:*\* \[List key questions this document addresses]

- *Methodology:*\* \[Describe the approach or methodology used]

- *Findings:*\* \[Summarize key findings or conclusions]
- \*\*
- Consistent file and directory conventions are essential for discoverability and maintainability.
  These rules ensure that contributors can quickly find and understand the organization of our
  documentation system.\*

- *Key Standards:*\*

- **Filename Format**: UPPERCASE\_SNAKE\_CASE.md for all documentation files

- **Directory Structure**: Hierarchical organization with clear domain boundaries

- **Index Files**: Navigation hubs at each level of the hierarchy

- **Naming Patterns**: Descriptive, searchable names that indicate content purpose

## Filename Standards

- *Format*\*: Use `UPPERCASE_SNAKE_CASE.md` for all file names. Filenames MUST use ASCII letters,
  numbers, and underscores only.

- *Character Rules*\*:

- **Allowed**: A-Z, 0-9, underscore (\_)

- **Forbidden**: Spaces, hyphens, special characters, non-ASCII characters

- **Case**: All uppercase letters

- **Separators**: Underscores only

- *Examples*\*:
- ✅ `API_DUPLICATION_ANALYSIS.md`
- ✅ `STATE_MACHINE_DESIGN.md`
- ✅ `BUILD_PROCESS_GUIDE.md`
- ❌ `api-duplication-analysis.md` (hyphens not allowed)
- ❌ `ApiDuplicationAnalysis.md` (mixed case not allowed)
- ❌ `API Duplication Analysis.md` (spaces not allowed)

- *Length Guidelines*\*:

- **Minimum**: 5 characters (e.g., `README.md`)

- **Maximum**: 50 characters (including .md extension)

- **Optimal**: 20-40 characters for readability

## Directory Structure

- *Root Level*\*: All canonical documentation lives in the `docs/` directory.

- *Hierarchical Organization*\*:

```
docs/
├── README.md                    # Master navigation hub
├── standards/                  # Documentation standards
│   ├── README.md
│   ├── core/
│   ├── structure/
│   └── navigation/
├── architecture/               # System architecture
│   ├── README.md
│   ├── state-machines/
│   └── orchestrator/
├── services/                   # Service documentation
│   ├── README.md
│   └── laminar/
└── ui/                        # User interface docs
    ├── README.md
    └── components/
```

- *Domain Boundaries*\*: Each major domain has its own directory with clear boundaries:

- **Architecture**: System design, patterns, and high-level concepts

- **Services**: Individual service documentation and APIs

- **Standards**: Documentation standards and guidelines

- **UI**: User interface components and patterns

## Index File Conventions

- *Purpose*\*: Index files serve as navigation hubs and content aggregators.

- *Naming*\*: Always use `README.md` (not `index.md` or `Index.md`)

- *Placement*\*:

- **Root Level**: `docs/README.md` as the master navigation hub

- **Subdirectories**: `README.md` in each subdirectory when it contains multiple topical docs

- **Optional**: Skip `README.md` for directories with only 1-2 files

- *Content Requirements*\*:

- **Navigation Overview**: Clear description of the directory's purpose

- **Content Listing**: Links to all documents in the directory

- **Quick Start Paths**: Different user journey options

- **Cross-References**: Links to related directories and concepts

- *Example Structure*\*:

```markdown
# Architecture Documentation

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

- *Purpose:** System architecture and design patterns for KiloCode.

## Quick Start Paths
- [Emergency Response](#emergency-response)
- [Deep Dive Research](#deep-dive-research)

## Core Systems
- [API Duplication Analysis](./API_DUPLICATION_ANALYSIS.md)
- [State Machines](./state-machines/)

## Related Areas
- [Services](../services/) - Service-specific documentation
- [Standards](../standards/) - Documentation standards
```

## Naming Patterns

- *Descriptive Names*\*: Filenames should clearly indicate the document's content and purpose.

- *Pattern Categories*\*:

- **Analysis**: `PROBLEM_ANALYSIS.md`, `ROOT_CAUSE_ANALYSIS.md`

- **Guides**: `IMPLEMENTATION_GUIDE.md`, `DEPLOYMENT_GUIDE.md`

- **Standards**: `CODING_STANDARDS.md`, `DOCUMENTATION_STANDARDS.md`

- **Processes**: `BUILD_PROCESS.md`, `TESTING_PROCESS.md`

- **Architecture**: `SYSTEM_ARCHITECTURE.md`, `DATA_FLOW_DIAGRAM.md`

- *Avoid Generic Names*\*:
- ❌ `README.md` (use `README.md` instead)
- ❌ `GUIDE.md` (too generic)
- ❌ `DOCS.md` (too generic)
- ❌ `INFO.md` (too generic)

- *Use Specific Names*\*:
- ✅ `API_DUPLICATION_ANALYSIS.md`
- ✅ `STATE_MACHINE_DESIGN.md`
- ✅ `BUILD_PROCESS_GUIDE.md`
- ✅ `DEPLOYMENT_CHECKLIST.md`

## Organization Principles

- *Single Responsibility*\*: Each directory should have a clear, focused purpose.

- *Logical Grouping*\*: Group related documents together in the same directory.

- *Hierarchical Depth*\*: Limit directory depth to 3-4 levels maximum.

- *Scalability*\*: Structure should accommodate growth without becoming unwieldy.

- *Examples*\*:

```
# Good: Clear, focused purpose

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

docs/architecture/state-machines/
├── README.md
├── TASK_STATE_MACHINE.md
├── SESSION_STATE_MACHINE.md
└── RECURSIVE_CALL_STATE_MACHINE.md

# Bad: Too many levels, unclear purpose

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

docs/architecture/state-machines/task-states/individual-states/
```

## Common Mistakes

- *Filename Issues*\*:
- ❌ Using hyphens instead of underscores
- ❌ Mixed case instead of all uppercase
- ❌ Spaces in filenames
- ❌ Special characters or non-ASCII characters
- ❌ Generic names that don't describe content

- *Directory Issues*\*:
- ❌ Too many nested levels
- ❌ Unclear directory purposes
- ❌ Missing index files
- ❌ Inconsistent naming patterns
- ❌ Mixing unrelated content

- *Organization Issues*\*:
- ❌ Documents in wrong directories
- ❌ Missing cross-references
- ❌ Inconsistent structure
- ❌ Poor navigation design

## Implementation Examples

- *Good Examples*\*:

```
docs/standards/
├── README.md                           # Clear navigation hub
├── core/
│   ├── README.md                       # Subdirectory index
│   ├── PRINCIPLES.md                  # Descriptive name
│   ├── FILE_CONVENTIONS.md            # Clear purpose
│   └── LINKING_POLICY.md              # Specific topic
└── structure/
    ├── README.md
    ├── DOCUMENT_ANATOMY.md
    └── HEADINGS_HIERARCHY.md
```

- *Bad Examples*\*:

```
docs/standards/
├── readme.md                          # Wrong case
├── core/
│   ├── index.md                       # Wrong case
│   ├── principles.md                  # Wrong case
│   ├── file-conventions.md            # Wrong separator
│   └── linking policy.md              # Spaces not allowed
└── structure/
    ├── docs.md                        # Too generic
    └── guide.md                       # Too generic
```

- *Migration Example*\*:

```bash
# Before (incorrect)

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

docs/standards/core/principles.md

# After (correct)

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

docs/standards/core/PRINCIPLES.md
```

## Navigation Footer
- \*\*

- *Navigation*\*: [Back to Core Standards](README.md) · [Next: Linking Policy](LINKING_POLICY.md) ·
  [Source: `/docs/standards/core/FILE_CONVENTIONS.md#L1`](FILE_CONVENTIONS.md#L1)

\_"The best way to understand a complex system is to map it like a geologist maps rock formations -
layer by layer, with an eye for the unexpected fault lines."\* 🗺️

## 🔍 Research Context & Next Steps

### When You're Here, You Can:

- *Understanding Documentation Standards:*\*

- **Next**: Check related standards documentation in the same directory

- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology,
  [Documentation Standards Guide](../../DOCUMENTATION_GUIDE.md) for context

- *Implementing Documentation Standards:*\*

- **Next**: [Repository Development Guide](../../architecture/GETTING_STARTED.md) →
  [Testing Infrastructure](../../../testing/TESTING_STRATEGY.md)

- **Related**: [Orchestrator Documentation](../../orchestrator/README.md) for integration patterns

- *Applying Standards to Documentation:*\*

- **Next**: [Documentation Guide](../../DOCUMENTATION_GUIDE.md) →
  [Architecture Documentation](../../architecture/README.md) →
  [Orchestrator Documentation](../../orchestrator/README.md)

- **Related**: [Race Condition Analysis](../../architecture/README.md) for current
  issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Standards Documentation](README.md) for guidance.
- \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

- **If you're new here**: Start with the [When You're Here](#when-youre-here) section

- **If you need context**: Check the [Research Context](#research-context) section

- **If you're ready to implement**: Jump to the implementation sections

- **If you're stuck**: Visit our [Troubleshooting Guide](../../../tools/TROUBLESHOOTING_GUIDE.md)

- **If you need help**: Check the [Technical Glossary](../../GLOSSARY.md)

- *Navigation*\*: [← Back to Standards Documentation](README.md) ·
  [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
