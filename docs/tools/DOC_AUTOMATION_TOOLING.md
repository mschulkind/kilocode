# Documentation Automation & Tooling Options

**Purpose:** Comprehensive guide to automate documentation maintenance, enforce style consistency, and implement our documentation standards as automated linters. Includes concrete toolset recommendations and phased implementation approach.

> **Cartography Fun Fact**: Documentation automation is like GPS for your docs - it keeps you on the right path, warns you about roadblocks (broken links), and ensures you never get lost in a maze of inconsistent formatting! 🗺️

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

## Executive Summary

Transform our documentation standards into automated linters and maintenance tools:

**Core Automation:**

- **TOC Generation**: doctoc or remark-toc for consistent table of contents
- **Link Checking**: lychee for broken link detection and validation
- **Prose/Style Linting**: Vale + markdownlint for writing quality and formatting
- **Structure Validation**: Custom linters for Research Context, navigation footers, glossary links
- **Diagram Validation**: mermaid-cli for syntax error detection
- **Templating**: remark plugins for automated footer/header injection

**Concrete Recommendations:**

1. **Minimal Setup**: doctoc + lychee + markdownlint + custom Node script
2. **Advanced Setup**: remark pipeline + Vale + comprehensive custom linters
3. **Enterprise Setup**: MkDocs + macros + full CI/CD pipeline

## Goals & Scope

**Primary Goals:**

- Convert documentation guide rules into automated linters
- Enforce consistent structure (TOCs, footers, Research Context sections)
- Validate link integrity and descriptive anchor text
- Catch Mermaid syntax errors before they reach production
- Automate repetitive formatting tasks

**Scope Boundaries:**

- Keep Markdown as source of truth in-repo
- Manual content creation; automated structure enforcement
- Fast local development + comprehensive CI validation
- Gradual rollout with opt-in phases

## Options Catalog

### TOC Generation

- [doctoc](https://github.com/thlorenz/doctoc) (CLI)
    - **Pros**: Simple, fast, works in-place, supports `--notitle`, `--maxlevel`, `--check` modes
    - **Cons**: Less configurable formatting, limited customization options
    - **Configuration**: `.doctocrc` file for settings, supports GitHub-style TOCs
- [remark-toc](https://github.com/remarkjs/remark-toc) (Node/remark)
    - **Pros**: Part of unified/remark pipeline, highly customizable, supports heading depth control
    - **Cons**: Requires Node pipeline setup, more complex configuration
    - **Configuration**: remark config with `toc: { heading: 'contents', maxDepth: 3 }`

### Link Checking

- [lychee](https://github.com/lycheeverse/lychee) (Rust CLI, [GitHub Action](https://github.com/lycheeverse/lychee-action))
    - **Pros**: Very fast, robust ignore rules, great CI action, supports caching, parallel processing
    - **Cons**: Rust binary dependency, requires installation
    - **Configuration**: `lychee.toml` for ignore patterns, timeout settings, custom headers
- [markdown-link-check](https://github.com/tcort/markdown-link-check) (Node)
    - **Pros**: Simple, JSON config, easy integration, supports authentication
    - **Cons**: Slower than lychee, less robust error handling
    - **Configuration**: `.markdown-link-check.json` for ignore patterns, timeout settings

### Prose/Style Linting

- [Vale](https://vale.sh/) (Prose linter)
    - **Pros**: Customizable styles, tech writing rules, CI ready, supports multiple file formats
    - **Cons**: Style authoring effort, requires `.vale.ini` configuration
    - **Configuration**: `.vale.ini` for styles, rules, and file patterns
- [markdownlint](https://github.com/DavidAnson/markdownlint-cli2) (MD style)
    - **Pros**: Enforces Markdown best practices, quick fixes, GitHub Flavored Markdown support
    - **Cons**: Not prose-aware, limited to Markdown syntax
    - **Configuration**: `.markdownlint.json` for rule customization, supports GFM features

### Templating: Footers/Headers/Blocks

- [remark](https://github.com/remarkjs/remark) + plugins (e.g., remark-directive, remark-frontmatter)
    - Pros: Scriptable Markdown transforms (inject nav footers across files)
    - Cons: Build a small pipeline
- [MkDocs](https://www.mkdocs.org/) + [mkdocs-macros-plugin](https://mkdocs-macros-plugin.readthedocs.io/)
    - Pros: Robust templating, partials, variables, build-time includes
    - Cons: External site build; not in-place file edits
- Static site generators ([Docusaurus](https://docusaurus.io/), [VitePress](https://vitepress.dev/))
    - Pros: Full theme control, powerful plugin ecosystems
    - Cons: Heavier; diverges from plain Markdown in-repo

### Diagram Validation

- [mermaid-cli](https://github.com/mermaid-js/mermaid-cli)
    - **Pros**: Catch syntax errors early by attempting renders, supports multiple output formats
    - **Cons**: Requires Node/Playwright deps, slower validation
    - **Configuration**: Command-line options for theme, output format, and validation mode

### Cross-File Consistency Checks

- Custom remark plugin or Node script
    - Pros: Tailored checks (e.g., ensure Research Context exists, glossary links present)
    - Cons: Maintenance cost, needs tests

### GitHub Flavored Markdown (GFM) Validation

- [markdownlint](https://github.com/DavidAnson/markdownlint-cli2) (Primary GFM validator)
    - **Pros**: Native GFM support, validates tables, task lists, strikethrough, autolinks
    - **Cons**: Limited to syntax validation, not content quality
    - **Configuration**: `.markdownlint.json` with GFM-specific rules (MD013, MD033, etc.)
- [remark-lint](https://github.com/remarkjs/remark-lint) (Comprehensive GFM validation)
    - **Pros**: Extensive plugin ecosystem, validates GFM extensions, customizable
    - **Cons**: Requires remark pipeline setup, more complex configuration
    - **Configuration**: `.remarkrc` with `remark-preset-lint-recommended` and GFM plugins

### Additional Tools

- [textlint](https://textlint.github.io/) (Japanese-focused but extensible)
    - **Pros**: Plugin ecosystem, custom rules, supports multiple languages
    - **Cons**: Primarily Japanese, complex setup, limited English support
- [write-good](https://github.com/btford/write-good) (Simple prose linting)
    - **Pros**: Simple, focused on readability, lightweight
    - **Cons**: Limited customization, basic rule set
- [alex](https://alexjs.com/) (Inclusive language checking)
    - **Pros**: Catches insensitive language, promotes inclusive writing
    - **Cons**: May be overly strict for technical docs, limited customization

## Documentation Standards as Linters

### Automatable Rules from Documentation Guide

**Structure Rules:**

- ✅ **TOC Presence**: Every doc >200 lines must have TOC
- ✅ **Navigation Footer**: Standard footer format with links
- ✅ **Research Context**: "Research Context & Next Steps" section present
- ✅ **Purpose Statement**: Clear purpose in first paragraph
- ✅ **Fun Facts**: Engagement elements present

**Content Rules:**

- ✅ **Descriptive Links**: No bare URLs, descriptive anchor text
- ✅ **Glossary Links**: Technical terms link to glossary
- ✅ **Cross-References**: Related docs linked appropriately
- ✅ **No Dead Ends**: Every page has clear next steps

**Formatting Rules:**

- ✅ **Mermaid Syntax**: Valid diagram syntax
- ✅ **Code Blocks**: Proper language tags
- ✅ **Heading Hierarchy**: Consistent H1-H6 usage
- ✅ **List Formatting**: Consistent bullet/numbering

**Quality Rules:**

- ✅ **Link Integrity**: All internal/external links work
- ✅ **Image Alt Text**: Accessibility compliance
- ✅ **Spelling**: Consistent terminology
- ✅ **Readability**: Appropriate sentence length

**GitHub Flavored Markdown (GFM) Rules:**

- ✅ **Table Syntax**: Proper pipe alignment and formatting
- ✅ **Task Lists**: Correct `- [ ]` and `- [x]` syntax
- ✅ **Strikethrough**: Proper `~~text~~` formatting
- ✅ **Autolinks**: Valid URL and email autolink detection
- ✅ **Code Fences**: Proper triple backtick syntax with language tags
- ✅ **Heading Hierarchy**: Consistent H1-H6 usage without skipping levels

**Real-World Example:**

- ✅ **Race Condition Analysis**: [Orchestrator Load Subtask Changes Analysis](../architecture/branches/ORCHESTATOR_LOAD_SUBTASK_CHANGES_ANALYSIS.md) - Detailed case study of how a specific code change created concurrent API requests and documentation of the fix

### Custom Linter Implementation

**Node.js Script Approach:**

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

**Remark Plugin Approach:**

```javascript
// plugins/remark-doc-standards.js
const visit = require("unist-util-visit")

function remarkDocStandards(options) {
	return (tree, file) => {
		const errors = []

		// Check for Research Context section
		const hasResearchContext = tree.children.some(
			(node) => node.type === "heading" && node.children[0]?.value === "🔍 Research Context & Next Steps",
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

**Tools:**

- [doctoc](https://github.com/thlorenz/doctoc) - TOC generation with `--notitle` and `--check` modes
- [lychee](https://github.com/lycheeverse/lychee) - Fast link checking with caching and parallel processing
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) - GitHub Flavored Markdown validation
- Custom Node script - Structure validation (Research Context, navigation footers)

**Implementation:**

```bash
# package.json scripts
{
  "scripts": {
    "docs:toc": "doctoc docs/ --notitle --maxlevel 3",
    "docs:toc:check": "doctoc docs/ --notitle --check",
    "docs:lint": "markdownlint-cli2 docs/ --fix",
    "docs:links": "lychee docs/ --verbose --cache --threads 4",
    "docs:gfm": "markdownlint-cli2 docs/ --config .markdownlint-gfm.json",
    "docs:structure": "node scripts/docs/structure.js",
    "docs:mermaid": "node scripts/docs/mermaid.js",
    "docs:all": "npm run docs:toc:check && npm run docs:lint && npm run docs:links && npm run docs:structure",
    "docs:fix": "npm run docs:toc && npm run docs:lint"
  }
}
```

**Configuration Files:**

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
[input]
include = ["**/*.md"]
exclude = ["node_modules/**", "dist/**"]

[output]
format = "detailed"
```

**Pros:** Fast setup, minimal dependencies, comprehensive GFM validation, easy to understand
**Cons:** Limited customization, manual rule implementation
**Time to implement:** 1-2 days

### Option 2: Advanced Setup (Recommended)

**Tools:**

- [remark](https://github.com/remarkjs/remark) + custom plugins - Structure validation
- [remark-lint](https://github.com/remarkjs/remark-lint) - Comprehensive GFM validation
- [Vale](https://vale.sh/) - Prose linting with custom styles
- [lychee](https://github.com/lycheeverse/lychee) - Link checking with advanced caching
- [mermaid-cli](https://github.com/mermaid-js/mermaid-cli) - Diagram validation
- Custom remark plugins - KiloCode-specific rules

**Implementation:**

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
StylesPath = styles
MinAlertLevel = suggestion

[*.md]
BasedOnStyles = Vale, Microsoft, write-good
```

**Pros:** Highly customizable, comprehensive validation, extensible, full GFM support
**Cons:** More complex setup, requires Node.js knowledge, multiple configuration files
**Time to implement:** 1-2 weeks

### Option 3: Enterprise Setup (Full Automation)

**Tools:**

- [MkDocs](https://www.mkdocs.org/) + [mkdocs-macros-plugin](https://mkdocs-macros-plugin.readthedocs.io/) - Site generation
- [Vale](https://vale.sh/) - Prose linting
- [lychee](https://github.com/lycheeverse/lychee) - Link checking
- Custom MkDocs plugins - Advanced templating
- GitHub Actions - Full CI/CD pipeline

**Implementation:**

```yaml
# mkdocs.yml
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

**Pros:** Full automation, professional output, advanced features
**Cons:** Complex setup, diverges from plain Markdown
**Time to implement:** 2-4 weeks

## Phased Implementation Approach

### Phase 1: Foundation (Week 1-2)

**Goal:** Basic automation without breaking existing workflow

**Tasks:**

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

**Deliverables:**

- Working local scripts
- Basic CI validation
- Documentation for team

### Phase 2: Standards Enforcement (Week 3-4)

**Goal:** Enforce documentation guide rules

**Tasks:**

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

**Deliverables:**

- Custom linters for all major rules
- Enhanced CI pipeline
- Team training materials

### Phase 3: Advanced Automation (Week 5-6)

**Goal:** Full automation with templating

**Tasks:**

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

**Deliverables:**

- Full templating system
- Advanced validation rules
- Enhanced developer experience

### Phase 4: Optimization (Week 7-8)

**Goal:** Performance and usability improvements

**Tasks:**

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

**Deliverables:**

- Optimized performance
- Analytics dashboard
- Maintenance procedures

## Recommended Baseline Stack

**For Immediate Implementation (Option 1):**

- **TOC**: doctoc for simplicity and speed
- **Links**: lychee in CI (nightly + on PR), cached
- **Lint**: markdownlint + basic custom rules
- **Structure**: Custom Node script for Research Context and footer validation
- **Mermaid**: Optional validation step where diagrams exist

**For Advanced Implementation (Option 2):**

- **Pipeline**: remark + custom plugins for comprehensive validation
- **Prose**: Vale with custom KiloCode style rules
- **Links**: lychee with advanced caching and reporting
- **Templating**: remark plugins for automated footer injection
- **Diagrams**: mermaid-cli with syntax validation

## Integration Plan

### Local Development

**Scripts Structure:**

```
scripts/docs/
├── toc.sh              # Generate TOCs for changed files
├── lint.sh             # Run markdownlint + custom rules
├── links.sh            # Check links locally (optional)
├── structure.js         # Validate Research Context, footers
├── mermaid.js          # Validate Mermaid syntax
└── footer-inject.js    # Inject/update navigation footers
```

**Package.json Scripts:**

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

**Basic Workflow:**

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

**Advanced Workflow:**

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

**High Priority (Week 1-2):**

1. Research Context section validation
2. Navigation footer format checking
3. TOC presence validation
4. Mermaid syntax validation

**Medium Priority (Week 3-4):**

1. Descriptive link enforcement
2. Glossary link validation
3. Cross-reference consistency
4. Fun fact presence checking

**Low Priority (Week 5-6):**

1. Readability scoring
2. Orphaned document detection
3. Quality metrics reporting
4. Advanced templating

### Custom Rule Examples

**Research Context Validation:**

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

**Navigation Footer Validation:**

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

**Analytics & Reporting:**

- Documentation health dashboard
- Quality metrics tracking (readability, completeness)
- Improvement suggestions based on patterns
- Team performance metrics

**Advanced Automation:**

- Auto-generate index READMEs via templates
- Intelligent cross-reference suggestions
- Automated image optimization and alt-text generation
- Smart content recommendations

**Developer Experience:**

- IDE integration (VS Code extension)
- Real-time validation in editor
- Pre-commit hooks with auto-fix
- Interactive documentation generator

**Quality Assurance:**

- A/B testing for documentation effectiveness
- User feedback integration
- Accessibility compliance checking
- Performance impact analysis

## Research Context & Next Steps

### When You're Here, You Can:

**Implementing Documentation Automation:**

- **Next**: Choose implementation option (Minimal/Advanced/Enterprise) → [Integration Plan](#integration-plan) → [Custom Linter Development](#custom-linter-development)
- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Documentation Guide](../DOCUMENTATION_GUIDE.md) for standards

**Understanding Current Documentation Standards:**

- **Next**: [Documentation Guide](../DOCUMENTATION_GUIDE.md) → [Standards Documentation](../standards/README.md) → This automation guide
- **Related**: [Architecture Documentation](../architecture/README.md) for context

**Planning Implementation:**

- **Next**: [Phased Implementation Approach](#phased-implementation-approach) → [Concrete Toolset Recommendations](#concrete-toolset-recommendations) → [Integration Plan](#integration-plan)
- **Related**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) for technical setup

**Troubleshooting Automation Issues:**

- **Next**: [Integration Plan](#integration-plan) → [Custom Linter Development](#custom-linter-development) → [Future Enhancements](#future-enhancements)
- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for debugging patterns

**Understanding Race Conditions in Documentation:**

- **Specific Example**: [Orchestrator Load Subtask Changes Analysis](../architecture/branches/ORCHESTATOR_LOAD_SUBTASK_CHANGES_ANALYSIS.md) - Detailed analysis of how a specific change created a race condition with concurrent API requests
- **Related**: [Race Condition Root Cause Analysis](../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md) for the broader context

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to [Tools Documentation](README.md) for guidance.

---

**Navigation**: [← Back to Tools Documentation](README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#research-context--next-steps)
