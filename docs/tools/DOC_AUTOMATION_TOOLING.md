# Documentation Automation & Tooling Options

## Table of Contents
- [Documentation Automation & Tooling Options](#documentation-automation--tooling-options)
- [Table of Contents](#table-of-contents)
- [When You're Here](#when-youre-here)
- [Executive Summary](#executive-summary)
- [Goals & Scope](#goals--scope)
- [Options Catalog](#options-catalog)
- [Link Checking](#link-checking)
- [Prose/Style Linting](#prosestyle-linting)
- [Templating: Footers/Headers/Blocks](#templating-footersheadersblocks)
- [Diagram Validation](#diagram-validation)
- [Cross-File Consistency Checks](#cross-file-consistency-checks)
- [GitHub Flavored Markdown (GFM) Validation](#github-flavored-markdown-gfm-validation)
- [Additional Tools](#additional-tools)
- [Remark Ecosystem Deep Dive](#remark-ecosystem-deep-dive)
- [What is Remark?](#what-is-remark)
- [Core Remark Tools](#core-remark-tools)
- [KiloCode-Specific Remark Setup](#kilocode-specific-remark-setup)
- [Advanced Remark Tools](#advanced-remark-tools)
- [](#)
- [Remark for KiloCode Use Cases](#remark-for-kilocode-use-cases)
- [Integration with KiloCode Workflow](#integration-with-kilocode-workflow)
- [Remark vs Other Tools](#remark-vs-other-tools)
- [MkDocs vs Remark: Comparison & Integration](#mkdocs-vs-remark-comparison--integration)
- [Are They Mutually Exclusive?](#are-they-mutually-exclusive)
- [Detailed Comparison](#detailed-comparison)
- [Why Different Options Use Different Tools](#why-different-options-use-different-tools)
- [Complementary Integration Strategies](#complementary-integration-strategies)
- [When to Use Each Tool](#when-to-use-each-tool)
- [KiloCode-Specific Recommendations](#kilocode-specific-recommendations)
- [Configuration Examples](#configuration-examples)
- [Documentation Standards as Linters](#documentation-standards-as-linters)
- [Automatable Rules from Documentation Guide](#automatable-rules-from-documentation-guide)
- [Custom Linter Implementation](#custom-linter-implementation)
- [Concrete Toolset Recommendations](#concrete-toolset-recommendations)
- [Option 1: Minimal Setup (Quick Start)](#option-1-minimal-setup-quick-start)
- [Option 2: Advanced Setup (Recommended)](#option-2-advanced-setup-recommended)
- [Option 3: Enterprise Setup (Full Automation)](#option-3-enterprise-setup-full-automation)
- [Phased Implementation Approach](#phased-implementation-approach)
- [Phase 1: Foundation (Week 1-2)](#phase-1-foundation-week-1-2)
- [Phase 2: Standards Enforcement (Week 3-4)](#phase-2-standards-enforcement-week-3-4)
- [Phase 3: Advanced Automation (Week 5-6)](#phase-3-advanced-automation-week-5-6)
- [Phase 4: Optimization (Week 7-8)](#phase-4-optimization-week-7-8)
- [Recommended Baseline Stack](#recommended-baseline-stack)
- [Integration Plan](#integration-plan)
- [Local Development](#local-development)
- [CI (GitHub Actions)](#ci-github-actions)
- [Custom Linter Development](#custom-linter-development)
- [Implementation Priority](#implementation-priority)
- [Custom Rule Examples](#custom-rule-examples)
- [Future Enhancements](#future-enhancements)
- [Phase 2+ Features](#phase-2-features)
- [Research Context & Next Steps](#research-context--next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Documentation Automation & Tooling Options](#documentation-automation--tooling-options)
- [Table of Contents](#table-of-contents)
- [Executive Summary](#executive-summary)
- [Goals & Scope](#goals--scope)
- [Options Catalog](#options-catalog)
- [Link Checking](#link-checking)
- [Prose/Style Linting](#prosestyle-linting)
- [Templating: Footers/Headers/Blocks](#templating-footersheadersblocks)
- [Diagram Validation](#diagram-validation)
- [Cross-File Consistency Checks](#cross-file-consistency-checks)
- [GitHub Flavored Markdown (GFM) Validation](#github-flavored-markdown-gfm-validation)
- [Additional Tools](#additional-tools)
- [Remark Ecosystem Deep Dive](#remark-ecosystem-deep-dive)
- [What is Remark?](#what-is-remark)
- [Core Remark Tools](#core-remark-tools)
- [KiloCode-Specific Remark Setup](#kilocode-specific-remark-setup)
- [Advanced Remark Tools](#advanced-remark-tools)
- [](#)
- [Remark for KiloCode Use Cases](#remark-for-kilocode-use-cases)
- [Integration with KiloCode Workflow](#integration-with-kilocode-workflow)
- [Remark vs Other Tools](#remark-vs-other-tools)
- [MkDocs vs Remark: Comparison & Integration](#mkdocs-vs-remark-comparison--integration)
- [Are They Mutually Exclusive?](#are-they-mutually-exclusive)
- [Detailed Comparison](#detailed-comparison)
- [Why Different Options Use Different Tools](#why-different-options-use-different-tools)
- [Complementary Integration Strategies](#complementary-integration-strategies)
- [When to Use Each Tool](#when-to-use-each-tool)
- [KiloCode-Specific Recommendations](#kilocode-specific-recommendations)
- [Configuration Examples](#configuration-examples)
- [Documentation Standards as Linters](#documentation-standards-as-linters)
- [Automatable Rules from Documentation Guide](#automatable-rules-from-documentation-guide)
- [Custom Linter Implementation](#custom-linter-implementation)
- [Concrete Toolset Recommendations](#concrete-toolset-recommendations)
- [Option 1: Minimal Setup (Quick Start)](#option-1-minimal-setup-quick-start)
- [Option 2: Advanced Setup (Recommended)](#option-2-advanced-setup-recommended)
- [Option 3: Enterprise Setup (Full Automation)](#option-3-enterprise-setup-full-automation)
- [Phased Implementation Approach](#phased-implementation-approach)
- [Phase 1: Foundation (Week 1-2)](#phase-1-foundation-week-1-2)
- [Phase 2: Standards Enforcement (Week 3-4)](#phase-2-standards-enforcement-week-3-4)
- [Phase 3: Advanced Automation (Week 5-6)](#phase-3-advanced-automation-week-5-6)
- [Phase 4: Optimization (Week 7-8)](#phase-4-optimization-week-7-8)
- [Recommended Baseline Stack](#recommended-baseline-stack)
- [Integration Plan](#integration-plan)
- [Local Development](#local-development)
- [CI (GitHub Actions)](#ci-github-actions)
- [Custom Linter Development](#custom-linter-development)
- [Implementation Priority](#implementation-priority)
- [Custom Rule Examples](#custom-rule-examples)
- [Future Enhancements](#future-enhancements)
- [Phase 2+ Features](#phase-2-features)
- [Research Context & Next Steps](#research-context--next-steps)
- [When You're Here, You Can:](#when-youre-here-you-can)
- [No Dead Ends Policy](#no-dead-ends-policy)
- [Navigation Footer](#navigation-footer)

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
> behind the "what"! 💻

- *Purpose:*\* Comprehensive guide to automate documentation maintenance, enforce style consistency,
  and implement our documentation standards as automated linters. Includes concrete toolset
  recommendations and phased implementation approach.

> **Cartography Fun Fact**: Documentation automation is like GPS for your docs - it keeps you on the
> right path, warns you about roadblocks (broken links), and ensures you never get lost in a maze of
> inconsistent formatting! 🗺️

<details><summary>Table of Contents</summary>
- Executive Summary
- Goals & Scope
- Documentation Standards as Linters
- Options Catalog (with tradeoffs)
- Concrete Toolset Recommendations
- Phased Implementation Approach
- Integration Plan (local + CI)
- Custom Linter Development
- Future Enhancements
- Research Context & Next Steps
- Navigation Footer

</details>

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: \[Brief description of what this document covers]
- **Audience**: \[Who should read this document]
- **Prerequisites**: \[What you should know before reading]
- **Related Documents**: \[Links to related documentation]

## Executive Summary

Transform our documentation standards into automated linters and maintenance tools:

- *Core Automation:*\*

- **TOC Generation**: doctoc or remark-toc for consistent table of contents

- **Link Checking**: lychee for broken link detection and validation

- **Prose/Style Linting**: Vale + markdownlint for writing quality and formatting

- **Structure Validation**: Custom linters for Research Context, navigation footers, glossary links

- **Diagram Validation**: mermaid-cli for syntax error detection

- **Templating**: remark plugins for automated footer/header injection

- *Concrete Recommendations:*\*
1. **Minimal Setup**: doctoc + lychee + markdownlint + custom Node script
2. **Advanced Setup**: remark pipeline + Vale + comprehensive custom linters
3. **Enterprise Setup**: MkDocs + macros + full CI/CD pipeline

## Goals & Scope

- *Primary Goals:*\*
- Convert documentation guide rules into automated linters
- Enforce consistent structure (TOCs, footers, Research Context sections)
- Validate link integrity and descriptive anchor text
- Catch Mermaid syntax errors before they reach production
- Automate repetitive formatting tasks

- *Scope Boundaries:*\*
- Keep Markdown as source of truth in-repo
- Manual content creation; automated structure enforcement
- Fast local development + comprehensive CI validation
- Gradual rollout with opt-in phases

## Options Catalog

### Link Checking
- [lychee](https://github.com/lycheeverse/lychee) (Rust CLI,
  [GitHub Action](https://github.com/lycheeverse/lychee-action))
  * **Pros**: Very fast, robust ignore rules, great CI action, supports caching, parallel
    processing
  * **Cons**: Rust binary dependency, requires installation
  * **Configuration**: `lychee.toml` for ignore patterns, timeout settings, custom headers
- [markdown-link-check](https://github.com/tcort/markdown-link-check) (Node)
  * **Pros**: Simple, JSON config, easy integration, supports authentication
  * **Cons**: Slower than lychee, less robust error handling
  * **Configuration**: `.markdown-link-check.json` for ignore patterns, timeout settings

### Prose/Style Linting
- [Vale](https://vale.sh/) (Prose linter)
  * **Pros**: Customizable styles, tech writing rules, CI ready, supports multiple file formats
  * **Cons**: Style authoring effort, requires `.vale.ini` configuration
  * **Configuration**: `.vale.ini` for styles, rules, and file patterns
- [markdownlint](https://github.com/DavidAnson/markdownlint-cli2) (MD style)
  * **Pros**: Enforces Markdown best practices, quick fixes, GitHub Flavored Markdown support
  * **Cons**: Not prose-aware, limited to Markdown syntax
  * **Configuration**: `.markdownlint.json` for rule customization, supports GFM features

### Templating: Footers/Headers/Blocks
- [remark](https://github.com/remarkjs/remark) + plugins (e.g., remark-directive,
  remark-frontmatter)
- Pros: Scriptable Markdown transforms (inject nav footers across files)
- Cons: Build a small pipeline
- [MkDocs](https://www.mkdocs.org/) +
  [mkdocs-macros-plugin](https://mkdocs-macros-plugin.readthedocs.io/)
- Pros: Robust templating, partials, variables, build-time includes
- Cons: External site build; not in-place file edits
- Static site generators ([Docusaurus](https://docusaurus.io/), [VitePress](https://vitepress.dev/))
- Pros: Full theme control, powerful plugin ecosystems
- Cons: Heavier; diverges from plain Markdown in-repo

### Diagram Validation
- [mermaid-cli](https://github.com/mermaid-js/mermaid-cli)
  * **Pros**: Catch syntax errors early by attempting renders, supports multiple output formats
  * **Cons**: Requires Node/Playwright deps, slower validation
  * **Configuration**: Command-line options for theme, output format, and validation mode

### Cross-File Consistency Checks
- Custom remark plugin or Node script
- Pros: Tailored checks (e.g., ensure Research Context exists, glossary links present)
- Cons: Maintenance cost, needs tests

### GitHub Flavored Markdown (GFM) Validation
- [markdownlint](https://github.com/DavidAnson/markdownlint-cli2) (Primary GFM validator)
  * **Pros**: Native GFM support, validates tables, task lists, strikethrough, autolinks
  * **Cons**: Limited to syntax validation, not content quality
  * **Configuration**: `.markdownlint.json` with GFM-specific rules (MD013, MD033, etc.)
- [remark-lint](https://github.com/remarkjs/remark-lint) (Comprehensive GFM validation)
  * **Pros**: Extensive plugin ecosystem, validates GFM extensions, customizable
  * **Cons**: Requires remark pipeline setup, more complex configuration
  * **Configuration**: `.remarkrc` with `remark-preset-lint-recommended` and GFM plugins

### Additional Tools
- [textlint](https://textlint.github.io/) (Japanese-focused but extensible)
  * **Pros**: Plugin ecosystem, custom rules, supports multiple languages
  * **Cons**: Primarily Japanese, complex setup, limited English support
- [write-good](https://github.com/btford/write-good) (Simple prose linting)
  * **Pros**: Simple, focused on readability, lightweight
  * **Cons**: Limited customization, basic rule set
- [alex](https://alexjs.com/) (Inclusive language checking)
  * **Pros**: Catches insensitive language, promotes inclusive writing
  * **Cons**: May be overly strict for technical docs, limited customization

## Remark Ecosystem Deep Dive

### What is Remark?

[Remark](https://github.com/remarkjs/remark) is a powerful, plugin-based Markdown processor built on
the unified ecosystem. It transforms Markdown into an Abstract Syntax Tree (AST) that can be
analyzed, modified, and transformed using plugins.

- *Key Benefits for KiloCode Documentation:*\*

- **Plugin Ecosystem**: Hundreds of plugins for linting, transforming, and analyzing Markdown

- **AST-Based**: Precise control over document structure and content

- **Extensible**: Easy to create custom plugins for KiloCode-specific rules

- **Pipeline Architecture**: Chain multiple transformations and validations

- **GitHub Compatible**: Works seamlessly with GitHub Flavored Markdown

### Core Remark Tools

- *Essential Plugins:*\*
- [remark-lint](https://github.com/remarkjs/remark-lint) - Comprehensive Markdown linting
- [remark-preset-lint-recommended](https://github.com/remarkjs/remark-preset-lint-recommended) -
  Curated set of recommended linting rules
- [remark-validate-links](https://github.com/remarkjs/remark-validate-links) - Validate internal and
  external links
- [remark-toc](https://github.com/remarkjs/remark-toc) - Generate table of contents
- [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter) - Parse YAML frontmatter
- [remark-directive](https://github.com/remarkjs/remark-directive) - Support for custom directives

- *Transformation Plugins:*\*
- [remark-stringify](https://github.com/remarkjs/remark-stringify) - Convert AST back to Markdown
- [remark-html](https://github.com/remarkjs/remark-html) - Convert to HTML
- [remark-gfm](https://github.com/remarkjs/remark-gfm) - GitHub Flavored Markdown support
- [remark-math](https://github.com/remarkjs/remark-math) - Math expressions support

### KiloCode-Specific Remark Setup

- *Configuration Example:*\*

```javascript
// remark.config.js
const remark = require("remark")
const remarkLint = require("remark-lint")
const remarkPresetLintRecommended = require("remark-preset-lint-recommended")
const remarkValidateLinks = require("remark-validate-links")
const remarkToc = require("remark-toc")
const remarkGfm = require("remark-gfm")

module.exports = remark()
	.use(remarkGfm) // GitHub Flavored Markdown support
	.use(remarkPresetLintRecommended) // Recommended linting rules
	.use(remarkValidateLinks) // Link validation
	.use(remarkToc, {
		heading: "contents",
		maxDepth: 3,
		tight: true,
	})
	.use(remarkLint, {
		"list-item-indent": "space",
		"maximum-line-length": 120,
		"no-consecutive-blank-lines": true,
	})
```

- *Custom KiloCode Plugin Example:*\*

```javascript
// plugins/remark-kilocode-standards.js
const visit = require("unist-util-visit")

function remarkKiloCodeStandards(options = {}) {
	return (tree, file) => {
		const errors = []

		// Check for Research Context section
		let hasResearchContext = false
		visit(tree, "heading", (node) => {
			if (node.children[0]?.value === "🔍 Research Context & Next Steps") {
				hasResearchContext = true
			}
		})

		if (!hasResearchContext) {
			errors.push(new Error("Missing Research Context section"))
		}

		// Check for navigation footer
		let hasNavFooter = false
		visit(tree, "paragraph", (node) => {
if (node.children.some((child) => child.type === "text" &&
child.value.includes("**Navigation**:"))) {
				hasNavFooter = true
			}
		})

		if (!hasNavFooter) {
			errors.push(new Error("Missing navigation footer"))
		}

		// Check for fun facts
		let hasFunFact = false
		visit(tree, "blockquote", (node) => {
			if (
				node.children.some(
					(child) =>
						child.type === "paragraph" &&
						child.children.some(
							(grandchild) => grandchild.type === "text" && grandchild.value.includes("Fun Fact"),
						),
				)
			) {
				hasFunFact = true
			}
		})

		if (!hasFunFact) {
			errors.push(new Error("Missing engagement element (fun fact)"))
		}

		if (errors.length > 0) {
			file.message(errors.join(", "))
		}
	}
}

module.exports = remarkKiloCodeStandards
```

### Advanced Remark Tools

- *Linting and Validation:*\*
- [remark-lint-no-dead-urls](https://github.com/remarkjs/remark-lint-no-dead-urls) - Check for dead
  URLs
- ##

[remark-lint-no-undefined-references](https://github.com/remarkjs/remark-lint-no-undefined-references)

Validate reference links
- [remark-lint-heading-increment](https://github.com/remarkjs/remark-lint-heading-increment) -
  Ensure proper heading hierarchy
- [remark-lint-no-duplicate-headings](https://github.com/remarkjs/remark-lint-no-duplicate-headings)
- Prevent duplicate headings

- *Content Enhancement:*\*
- [remark-emoji](https://github.com/rhysd/remark-emoji) - Convert emoji shortcodes to Unicode
- [remark-breaks](https://github.com/remarkjs/remark-breaks) - Support GitHub-style line breaks
- [remark-footnotes](https://github.com/remarkjs/remark-footnotes) - Add footnote support
- [remark-codesandbox](https://github.com/remarkjs/remark-codesandbox) - Embed CodeSandbox examples

- *Analysis and Reporting:*\*
- [remark-metrics](https://github.com/remarkjs/remark-metrics) - Generate document metrics
- [remark-usage](https://github.com/remarkjs/remark-usage) - Extract usage examples
- [remark-contributors](https://github.com/remarkjs/remark-contributors) - Add contributor
  information

### Remark for KiloCode Use Cases

- *1. Documentation Standards Enforcement:*\*

```javascript
// Check for required sections
.use(remarkKiloCodeStandards)
.use(remarkLint, {
  'no-missing-kilo-code-context': true,
  'no-missing-navigation-footer': true,
  'no-missing-fun-facts': true
})
```

- *2. Link Validation and Management:*\*

```javascript
// Comprehensive link checking
.use(remarkValidateLinks, {
  repository: 'mschulkind/kilocode',
  baseUrl: 'https://github.com/mschulkind/kilocode/blob/main'
})
.use(remarkLintNoDeadUrls)
```

- *3. Content Quality Assurance:*\*

```javascript
// Prose and style checking
.use(remarkLint, {
  'maximum-line-length': 120,
  'no-consecutive-blank-lines': true,
  'list-item-indent': 'space'
})
```

- *4. Automated Content Generation:*\*

```javascript
// Generate TOCs and enhance content
.use(remarkToc, { heading: 'contents', maxDepth: 3 })
.use(remarkEmoji)
.use(remarkBreaks)
```

### Integration with KiloCode Workflow

- *Package.json Scripts:*\*

```json
{
	"scripts": {
		"docs:remark": "remark docs/ --frail",
		"docs:remark:fix": "remark docs/ --output",
		"docs:remark:check": "remark docs/ --frail --quiet",
		"docs:remark:report": "remark docs/ --report"
	}
}
```

- *GitHub Actions Integration:*\*

```yaml
- name: Run Remark Linting
  run: npm run docs:remark:check
  continue-on-error: false
```

- *Pre-commit Hook:*\*

```bash
#!/bin/sh
remark docs/ --frail --quiet
```

### Remark vs Other Tools

- *Advantages of Remark:*\*

- **Unified Ecosystem**: Consistent API across all plugins

- **Extensibility**: Easy to create custom plugins

- **Performance**: Fast AST-based processing

- **Flexibility**: Can transform, lint, and analyze in one pipeline

- **Community**: Large ecosystem of maintained plugins

- *When to Use Remark:*\*

- **Complex Validation**: Custom rules beyond basic Markdown linting

- **Content Transformation**: Automated content generation and enhancement

- **Integration**: Need to integrate with other unified tools

- **Customization**: Require KiloCode-specific validation rules

- *When to Use Simpler Tools:*\*

- **Basic Linting**: Simple Markdown style checking

- **Quick Setup**: Need immediate results without configuration

- **Minimal Dependencies**: Want to avoid Node.js ecosystem complexity

## MkDocs vs Remark: Comparison & Integration

### Are They Mutually Exclusive?

- *No, they are NOT mutually exclusive!*\* MkDocs and remark serve different purposes and can
  complement each other effectively:

- **MkDocs**: Static site generator that builds documentation websites

- **Remark**: Markdown processor that analyzes, transforms, and validates Markdown files

- **Integration**: Remark can process Markdown files that MkDocs then builds into a site

### Detailed Comparison

| Aspect               | MkDocs                  | Remark                           |
| -------------------- | ----------------------- | -------------------------------- |
| **Primary Purpose**  | Static site generation  | Markdown processing & validation |
| **Output**           | HTML website            | Processed Markdown or AST        |
| **Validation**       | Basic (via plugins)     | Comprehensive (via plugins)      |
| **Customization**    | Theme-based, templating | Plugin-based, AST manipulation   |
| **Learning Curve**   | Moderate (Python-based) | Steep (Node.js ecosystem)        |
| **CI Integration**   | Build-focused           | Validation-focused               |
| **File Management**  | Site structure          | Individual file processing       |
| **Templating**       | Jinja2 templates        | AST transformations              |
| **Plugin Ecosystem** | Python plugins          | Node.js plugins                  |

### Why Different Options Use Different Tools

- *Option 2 (Advanced Setup) Uses Remark:*\*

- **Focus**: Validation and processing of individual Markdown files

- **Goal**: Enforce documentation standards, validate content, transform files

- **Workflow**: Process files in-place, validate before commit

- **Output**: Enhanced Markdown files that remain in the repository

- *Option 3 (Enterprise Setup) Uses MkDocs:*\*

- **Focus**: Building a complete documentation website

- **Goal**: Professional presentation, site navigation, search functionality

- **Workflow**: Build static site from Markdown source files

- **Output**: Deployable website with advanced features

### Complementary Integration Strategies

- *Strategy 1: Remark → MkDocs Pipeline*\*

```yaml
# .github/workflows/docs.yml

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

name: Documentation Pipeline
on: [push, pull_request]

jobs:
    validate:
        runs-on: ubuntu-latest
        steps:
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
              with:
                  node-version: "18"
- name: Install Remark
              run: npm install -g remark-cli remark-preset-lint-recommended
- name: Validate Markdown
              run: remark docs/ --frail --quiet
- name: Transform Content
              run: remark docs/ --output --use remark-toc,remark-gfm

    build:
        needs: validate
        runs-on: ubuntu-latest
        steps:
- uses: actions/checkout@v3
- uses: actions/setup-python@v3
              with:
                  python-version: "3.9"
- name: Install MkDocs
              run: pip install mkdocs mkdocs-material
- name: Build Site
              run: mkdocs build
- name: Deploy
              run: mkdocs gh-deploy
```

- *Strategy 2: MkDocs with Remark Plugins*\*

```yaml
# mkdocs.yml

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

plugins:
- search
- mkdocs-material
- mkdocs-macros:
          include_dir: docs/
- custom-plugin:
          remark_config: .remarkrc
          validate_on_build: true
```

- *Strategy 3: Hybrid Approach*\*

```javascript
// scripts/docs/hybrid-pipeline.js
const remark = require("remark")
const { execSync } = require("child_process")

async function hybridPipeline() {
	// Step 1: Remark validation and transformation
	const processor = remark()
		.use(require("remark-preset-lint-recommended"))
		.use(require("remark-validate-links"))
		.use(require("remark-toc"))

	// Process all Markdown files
	await processor.process("docs/**/*.md")

	// Step 2: MkDocs build
	execSync("mkdocs build", { stdio: "inherit" })

	// Step 3: Additional validation on built site
	execSync("html-validate site/", { stdio: "inherit" })
}
```

### When to Use Each Tool

- *Use Remark When:*\*

- **Validation Focus**: Need comprehensive Markdown validation

- **File Processing**: Want to transform individual files

- **CI/CD Integration**: Need fast validation in pull requests

- **Custom Rules**: Require KiloCode-specific validation

- **In-Place Editing**: Want to enhance files in the repository

- *Use MkDocs When:*\*

- **Site Generation**: Need a complete documentation website

- **Professional Presentation**: Want advanced theming and navigation

- **Search Functionality**: Need full-text search across documentation

- **Deployment**: Want to deploy to GitHub Pages or other hosting

- **User Experience**: Need advanced features like versioning, translations

- *Use Both When:*\*

- **Enterprise Documentation**: Need both validation and professional presentation

- **Complex Workflows**: Want to validate source files and build a site

- **Quality Assurance**: Need comprehensive validation before site generation

- **Team Collaboration**: Want both developer-focused validation and user-focused presentation

### KiloCode-Specific Recommendations

- *For KiloCode's Current Needs:*\*

- *Phase 1: Start with Remark*\*
- Implement comprehensive validation
- Enforce documentation standards
- Integrate with existing workflow
- Minimal disruption to current process

- *Phase 2: Add MkDocs (Optional)*\*
- Build professional documentation site
- Deploy to GitHub Pages
- Add search and navigation features
- Enhance user experience

- *Phase 3: Full Integration*\*
- Remark validates and transforms source files
- MkDocs builds enhanced site from validated files
- Automated deployment pipeline
- Comprehensive quality assurance

### Configuration Examples

- *Remark Configuration for MkDocs Integration:*\*

```javascript
// .remarkrc
{
  "plugins": [
    "remark-preset-lint-recommended",
    "remark-validate-links",
    "remark-toc",
    "remark-gfm",
    "remark-frontmatter"
  ],
  "settings": {
    "listItemIndent": "space",
    "maximumLineLength": 120
  }
}
```

- *MkDocs Configuration with Remark Integration:*\*

```yaml
# mkdocs.yml

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

site_name: KiloCode Documentation
site_description: Comprehensive documentation for KiloCode

theme:
    name: material
    features:
- navigation.tabs
- navigation.sections
- search.highlight
- content.code.copy

plugins:
- search
- mkdocs-material
- mkdocs-macros:
          include_dir: docs/
- custom-remark:
          config: .remarkrc
          validate: true

markdown_extensions:
- toc:
          permalink: true
- codehilite
- admonition
- pymdownx.superfences
```

## Documentation Standards as Linters

### Automatable Rules from Documentation Guide

- *Structure Rules:*\*
- ✅ **TOC Presence**: Every doc >200 lines must have TOC
- ✅ **Navigation Footer**: Standard footer format with links
- ✅ **Research Context**: "Research Context & Next Steps" section present
- ✅ **Purpose Statement**: Clear purpose in first paragraph
- ✅ **Fun Facts**: Engagement elements present

- *Content Rules:*\*
- ✅ **Descriptive Links**: No bare URLs, descriptive anchor text
- ✅ **Glossary Links**: Technical terms link to glossary
- ✅ **Cross-References**: Related docs linked appropriately
- ✅ **No Dead Ends**: Every page has clear next steps

- *Formatting Rules:*\*
- ✅ **Mermaid Syntax**: Valid diagram syntax
- ✅ **Code Blocks**: Proper language tags
- ✅ **Heading Hierarchy**: Consistent H1-H6 usage
- ✅ **List Formatting**: Consistent bullet/numbering

- *Quality Rules:*\*
- ✅ **Link Integrity**: All internal/external links work
- ✅ **Image Alt Text**: Accessibility compliance
- ✅ **Spelling**: Consistent terminology
- ✅ **Readability**: Appropriate sentence length

- *GitHub Flavored Markdown (GFM) Rules:*\*
- ✅ **Table Syntax**: Proper pipe alignment and formatting
- ✅ **Task Lists**: Correct `- [ ]` and `- [x]` syntax
- ✅ **Strikethrough**: Proper `~~text~~` formatting
- ✅ **Autolinks**: Valid URL and email autolink detection
- ✅ **Code Fences**: Proper triple backtick syntax with language tags
- ✅ **Heading Hierarchy**: Consistent H1-H6 usage without skipping levels

### Custom Linter Implementation

- *Node.js Script Approach:*\*

````javascript
// scripts/docs/lint-custom.js
const fs = require("fs")
const path = require("path")

class DocLinter {
	checkResearchContext(content) {
		return content.includes("## 🔍 Research Context & Next Steps")
	}

	checkNavigationFooter(content) {
		const footerRegex = /\*\*Navigation\*\*:.*\[← Back to.*\].*\[📚 Technical Glossary\]/
		return footerRegex.test(content)
	}

	checkDescriptiveLinks(content) {
		const bareUrlRegex = /\[.*\]\(https?:\/\/[^)]+\)/
		return !bareUrlRegex.test(content)
	}

	checkMermaidSyntax(content) {
		const mermaidBlocks = content.match(/```mermaid\n([\s\S]*?)\n```/g)
		// Validate each block with mermaid-cli
	}
}
````

- *Remark Plugin Approach:*\*

```javascript
// plugins/remark-doc-standards.js
const visit = require("unist-util-visit")

function remarkDocStandards(options) {
	return (tree, file) => {
		const errors = []

		// Check for Research Context section
		const hasResearchContext = tree.children.some(
(node) => node.type === "heading" && node.children[0]?.value === "🔍 Research Context & Next
Steps",
		)

		if (!hasResearchContext) {
			errors.push(new Error("Missing Research Context section"))
		}

		// Check for navigation footer
		const hasNavFooter = tree.children.some(
			(node) =>
				node.type === "paragraph" &&
				node.children.some((child) => child.type === "text" && child.value.includes("**Navigation**:")),
		)

		if (!hasNavFooter) {
			errors.push(new Error("Missing navigation footer"))
		}

		if (errors.length > 0) {
			file.message(errors.join(", "))
		}
	}
}
```

## Concrete Toolset Recommendations

### Option 1: Minimal Setup (Quick Start)

- *Tools:*\*
- [doctoc](https://github.com/thlorenz/doctoc) - TOC generation with `--notitle` and `--check` modes
- [lychee](https://github.com/lycheeverse/lychee) - Fast link checking with caching and parallel
  processing
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) - GitHub Flavored Markdown
  validation
- Custom Node script - Structure validation (Research Context, navigation footers)

- *Implementation:*\*

```bash
# package.json scripts

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

{
  "scripts": {
    "docs:toc": "doctoc docs/ --notitle --maxlevel 3",
    "docs:toc:check": "doctoc docs/ --notitle --check",
    "docs:lint": "markdownlint-cli2 docs/ --fix",
    "docs:links": "lychee docs/ --verbose --cache --threads 4",
    "docs:gfm": "markdownlint-cli2 docs/ --config .markdownlint-gfm.json",
    "docs:structure": "node scripts/docs/structure.js",
    "docs:mermaid": "node scripts/docs/mermaid.js",
"docs:all": "npm run docs:toc:check && npm run docs:lint && npm run docs:links && npm run
docs:structure",
    "docs:fix": "npm run docs:toc && npm run docs:lint"
  }
}
```

- *Configuration Files:*\*

```json
// .markdownlint.json
{
	"default": true,
	"MD013": { "line_length": 120 },
	"MD033": false,
	"MD041": false
}
```

```toml
# lychee.toml

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

[input]
include = ["**/*.md"]
exclude = ["node_modules/**", "dist/**"]

[output]
format = "detailed"
```

- *Pros:*\* Fast setup, minimal dependencies, comprehensive GFM validation, easy to understand
- *Cons:*\* Limited customization, manual rule implementation **Time to implement:** 1-2 days

### Option 2: Advanced Setup (Recommended)

- *Tools:*\*
- [remark](https://github.com/remarkjs/remark) + custom plugins - Structure validation
- [remark-lint](https://github.com/remarkjs/remark-lint) - Comprehensive GFM validation
- [Vale](https://vale.sh/) - Prose linting with custom styles
- [lychee](https://github.com/lycheeverse/lychee) - Link checking with advanced caching
- [mermaid-cli](https://github.com/mermaid-js/mermaid-cli) - Diagram validation
- Custom remark plugins - KiloCode-specific rules

- *Implementation:*\*

```javascript
// remark.config.js
const remark = require("remark")
const remarkDocStandards = require("./plugins/remark-doc-standards")
const remarkMermaid = require("./plugins/remark-mermaid-validate")

module.exports = remark()
	.use(require("remark-preset-lint-recommended"))
	.use(require("remark-lint-no-dead-urls"))
	.use(require("remark-validate-links"))
	.use(remarkDocStandards)
	.use(remarkMermaid)
```

```ini
# .vale.ini

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
this documentation provides structured guidance for understanding and implementing solutions! 🔧

StylesPath = styles
MinAlertLevel = suggestion

[*.md]
BasedOnStyles = Vale, Microsoft, write-good
```

- *Pros:*\* Highly customizable, comprehensive validation, extensible, full GFM support **Cons:**
  More
  complex setup, requires Node.js knowledge, multiple configuration files **Time to implement:** 1-2
  weeks

### Option 3: Enterprise Setup (Full Automation)

- *Tools:*\*
- [MkDocs](https://www.mkdocs.org/) +
  [mkdocs-macros-plugin](https://mkdocs-macros-plugin.readthedocs.io/) - Site generation
- [Vale](https://vale.sh/) - Prose linting
- [lychee](https://github.com/lycheeverse/lychee) - Link checking
- Custom MkDocs plugins - Advanced templating
- GitHub Actions - Full CI/CD pipeline

- *Implementation:*\*

```yaml
# mkdocs.yml

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

plugins:
- macros:
          include_dir: docs/
          include_yaml: ["config.yml"]
- custom-plugin:
          rules:
- research-context
- navigation-footer
- glossary-links
```

- *Pros:*\* Full automation, professional output, advanced features **Cons:** Complex setup,
  diverges
  from plain Markdown **Time to implement:** 2-4 weeks

## Phased Implementation Approach

### Phase 1: Foundation (Week 1-2)

- *Goal:*\* Basic automation without breaking existing workflow

- *Tasks:*\*
1. **Setup Basic Tools**
- Install doctoc, markdownlint, lychee
- Create basic scripts in `scripts/docs/`
- Add npm scripts to package.json
2. **Implement Core Linters**
- TOC presence validation
- Basic link checking
- Mermaid syntax validation
- Simple structure checks
3. **CI Integration**
- Add GitHub Action for basic checks
- Run on PR, fail on broken links
- Optional: run on push

- *Deliverables:*\*
- Working local scripts
- Basic CI validation
- Documentation for team

### Phase 2: Standards Enforcement (Week 3-4)

- *Goal:*\* Enforce documentation guide rules

- *Tasks:*\*
1. **Custom Linter Development**
- Research Context section validation
- Navigation footer format checking
- Glossary link validation
- Descriptive link enforcement
2. **Enhanced CI Pipeline**
- Comprehensive validation on PR
- Detailed error reporting
- Auto-fix for simple issues
3. **Team Training**
- Documentation sessions
- Linter rule explanations
- Best practices guide

- *Deliverables:*\*
- Custom linters for all major rules
- Enhanced CI pipeline
- Team training materials

### Phase 3: Advanced Automation (Week 5-6)

- *Goal:*\* Full automation with templating

- *Tasks:*\*
1. **Templating System**
- Automated footer injection
- TOC generation for new files
- Template-based file creation
2. **Advanced Validation**
- Cross-file consistency checks
- Orphaned document detection
- Quality metrics reporting
3. **Developer Experience**
- Pre-commit hooks
- IDE integration
- Real-time validation

- *Deliverables:*\*
- Full templating system
- Advanced validation rules
- Enhanced developer experience

### Phase 4: Optimization (Week 7-8)

- *Goal:*\* Performance and usability improvements

- *Tasks:*\*
1. **Performance Optimization**
- Caching for link checks
- Parallel processing
- Incremental validation
2. **Reporting & Analytics**
- Documentation health dashboard
- Quality metrics tracking
- Improvement suggestions
3. **Maintenance & Updates**
- Automated dependency updates
- Rule evolution tracking
- Performance monitoring

- *Deliverables:*\*
- Optimized performance
- Analytics dashboard
- Maintenance procedures

## Recommended Baseline Stack

- *For Immediate Implementation (Option 1):*\*

- **TOC**: doctoc for simplicity and speed

- **Links**: lychee in CI (nightly + on PR), cached

- **Lint**: markdownlint + basic custom rules

- **Structure**: Custom Node script for Research Context and footer validation

- **Mermaid**: Optional validation step where diagrams exist

- *For Advanced Implementation (Option 2):*\*

- **Pipeline**: remark + custom plugins for comprehensive validation

- **Prose**: Vale with custom KiloCode style rules

- **Links**: lychee with advanced caching and reporting

- **Templating**: remark plugins for automated footer injection

- **Diagrams**: mermaid-cli with syntax validation

## Integration Plan

### Local Development

- *Scripts Structure:*\*

```
scripts/docs/
├── toc.sh              # Generate TOCs for changed files
├── lint.sh             # Run markdownlint + custom rules
├── links.sh            # Check links locally (optional)
├── structure.js         # Validate Research Context, footers
├── mermaid.js          # Validate Mermaid syntax
└── footer-inject.js    # Inject/update navigation footers
```

- *Package.json Scripts:*\*

```json
{
	"scripts": {
		"docs:toc": "doctoc docs/ --notitle",
		"docs:lint": "markdownlint docs/ --fix",
		"docs:links": "lychee docs/ --verbose --cache",
		"docs:structure": "node scripts/docs/structure.js",
		"docs:mermaid": "node scripts/docs/mermaid.js",
		"docs:all": "npm run docs:toc && npm run docs:lint && npm run docs:structure",
		"docs:fix": "npm run docs:toc && npm run docs:lint"
	}
}
```

### CI (GitHub Actions)

- *Basic Workflow:*\*

```yaml
name: Documentation Validation
on: [pull_request, push]

jobs:
    docs:
        runs-on: ubuntu-latest
        steps:
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
              with:
                  node-version: "18"
- name: Install dependencies
              run: npm ci
- name: Check TOCs
              run: npm run docs:toc -- --check
- name: Lint Markdown
              run: npm run docs:lint
- name: Check Links
              run: npm run docs:links
- name: Validate Structure
              run: npm run docs:structure
- name: Validate Mermaid
              run: npm run docs:mermaid
```

- *Advanced Workflow:*\*

```yaml
name: Advanced Documentation Validation
on: [pull_request, push]

jobs:
    docs:
        runs-on: ubuntu-latest
        steps:
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
              with:
                  node-version: "18"
- name: Install dependencies
              run: npm ci
- name: Run Remark Pipeline
              run: npm run docs:remark
- name: Run Vale Prose Linting
              run: npm run docs:vale
- name: Check Links with Lychee
              uses: lycheeverse/lychee-action@v1
              with:
                  args: --verbose --cache docs/
- name: Generate Documentation Report
              run: npm run docs:report
```

## Custom Linter Development

### Implementation Priority

- *High Priority (Week 1-2):*\*
1. Research Context section validation
2. Navigation footer format checking
3. TOC presence validation
4. Mermaid syntax validation

- *Medium Priority (Week 3-4):*\*
1. Descriptive link enforcement
2. Glossary link validation
3. Cross-reference consistency
4. Fun fact presence checking

- *Low Priority (Week 5-6):*\*
1. Readability scoring
2. Orphaned document detection
3. Quality metrics reporting
4. Advanced templating

### Custom Rule Examples

- *Research Context Validation:*\*

```javascript
function validateResearchContext(content, filePath) {
	const hasResearchContext = content.includes("## 🔍 Research Context & Next Steps")
	const hasNoDeadEnds = content.includes("### No Dead Ends Policy")
	const hasNextSteps = content.includes("### When You're Here, You Can:")

	if (!hasResearchContext) {
		return { error: "Missing Research Context section", file: filePath }
	}

	if (!hasNoDeadEnds) {
		return { warning: "Missing No Dead Ends Policy", file: filePath }
	}

	if (!hasNextSteps) {
		return { warning: "Missing next steps guidance", file: filePath }
	}

	return { success: true }
}
```

- *Navigation Footer Validation:*\*

```javascript
function validateNavigationFooter(content, filePath) {
	const footerRegex = /\*\*Navigation\*\*:.*\[← Back to.*\].*\[📚 Technical Glossary\]/
	const hasFooter = footerRegex.test(content)

	if (!hasFooter) {
		return { error: "Missing or malformed navigation footer", file: filePath }
	}

	return { success: true }
}
```

## Future Enhancements

### Phase 2+ Features

- *Analytics & Reporting:*\*
- Documentation health dashboard
- Quality metrics tracking (readability, completeness)
- Improvement suggestions based on patterns
- Team performance metrics

- *Advanced Automation:*\*
- Auto-generate index READMEs via templates
- Intelligent cross-reference suggestions
- Automated image optimization and alt-text generation
- Smart content recommendations

- *Developer Experience:*\*
- IDE integration (VS Code extension)
- Real-time validation in editor
- Pre-commit hooks with auto-fix
- Interactive documentation generator

- *Quality Assurance:*\*
- A/B testing for documentation effectiveness
- User feedback integration
- Accessibility compliance checking
- Performance impact analysis

## Research Context & Next Steps

### When You're Here, You Can:

- *Implementing Documentation Automation:*\*

- **Next**: Choose implementation option (Minimal/Advanced/Enterprise) →
  [Integration Plan](#integration-plan) → [Custom Linter Development](#custom-linter-development)

- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Documentation Guide](../DOCUMENTATION_GUIDE.md) for standards

- *Understanding Current Documentation Standards:*\*

- **Next**: [Documentation Guide](../DOCUMENTATION_GUIDE.md) →
  [Standards Documentation](../standards/README.md) → This automation guide

- **Related**: [Architecture Documentation](../architecture/README.md) for context

- *Planning Implementation:*\*

- **Next**: [Phased Implementation Approach](#phased-implementation-approach) →
  [Concrete Toolset Recommendations](#concrete-toolset-recommendations) →
  [Integration Plan](#integration-plan)

- **Related**: [Repository Development Guide](architecture/GETTING_STARTED.md) for
  technical setup

- *Troubleshooting Automation Issues:*\*

- **Next**: [Integration Plan](#integration-plan) →
  [Custom Linter Development](#custom-linter-development) →
  [Future Enhancements](#future-enhancements)

- **Related**: [Orchestrator Error Handling](orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  debugging patterns

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Tools Documentation](README.md) for guidance.

## Navigation Footer
- \*\*

## No Dead Ends Policy

Every section in this document connects you to your next step:

- **If you're new here**: Start with the [When You're Here](#when-youre-here) section

- **If you need context**: Check the [Research Context](#research-context) section

- **If you're ready to implement**: Jump to the implementation sections

- **If you're stuck**: Visit our [Troubleshooting Guide](../tools/TROUBLESHOOTING_GUIDE.md)

- **If you need help**: Check the [Technical Glossary](../GLOSSARY.md)

- *Navigation*\*: [← Back to Tools Documentation](README.md) ·
  [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#research-context--next-steps)
