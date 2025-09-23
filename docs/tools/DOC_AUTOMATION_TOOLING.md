# Documentation Automation & Tooling Options

**Purpose:** Survey of tools and approaches to automate documentation maintenance (navigation footers, TOCs, link checks, linting, templating). Includes tradeoffs and integration paths.

<details><summary>Table of Contents</summary>

- Executive Summary
- Goals & Scope
- Options Catalog (with tradeoffs)
- Recommended Baseline Stack
- Integration Plan (local + CI)
- Future Enhancements
- Navigation Footer

</details>

## Executive Summary

Automate repetitive doc tasks with a small, composable toolchain:

- TOC generation: doctoc or remark-toc
- Link checking: lychee or markdown-link-check
- Prose/Style linting: Vale + markdownlint
- Templated footers/headers: remark plugins or MkDocs macros
- CI enforcement: GitHub Actions

## Goals & Scope

- Keep Markdown as source of truth in-repo
- Add/rewrite sections (e.g., Research Context) manually; automate repeatable structure
- Provide fast local scripts and CI gating

## Options Catalog

### TOC Generation

- [doctoc](https://github.com/thlorenz/doctoc) (CLI)
    - Pros: Simple, fast, works in-place
    - Cons: Less configurable formatting
- [remark-toc](https://github.com/remarkjs/remark-toc) (Node/remark)
    - Pros: Part of unified/remark pipeline, customizable
    - Cons: Requires Node pipeline setup

### Link Checking

- [lychee](https://github.com/lycheeverse/lychee) (Rust CLI, [GitHub Action](https://github.com/lycheeverse/lychee-action))
    - Pros: Very fast, robust ignore rules, great CI action
    - Cons: Rust binary dependency
- [markdown-link-check](https://github.com/tcort/markdown-link-check) (Node)
    - Pros: Simple, JSON config
    - Cons: Slower, less robust vs lychee

### Prose/Style Linting

- [Vale](https://vale.sh/) (Prose linter)
    - Pros: Customizable styles, tech writing rules, CI ready
    - Cons: Style authoring effort
- [markdownlint](https://github.com/DavidAnson/markdownlint-cli2) (MD style)
    - Pros: Enforces Markdown best practices, quick fixes
    - Cons: Not prose-aware

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
    - Pros: Catch syntax errors early by attempting renders
    - Cons: Requires Node/Playwright deps

### Cross-File Consistency Checks

- Custom remark plugin or Node script
    - Pros: Tailored checks (e.g., ensure Research Context exists, glossary links present)
    - Cons: Maintenance cost, needs tests

## Recommended Baseline Stack

- TOC: doctoc for simplicity (or remark-toc if we adopt unified pipeline)
- Links: lychee in CI (nightly + on PR), cached
- Lint: markdownlint + Vale (with lightweight custom style)
- Footer Injection: remark script to inject/update standard nav footers
- Mermaid: optional validation step where diagrams exist

## Integration Plan

### Local

- scripts/docs/toc.sh → run doctoc on changed files
- scripts/docs/lint.sh → markdownlint + vale
- scripts/docs/footer.js → remark-based footer injector
- scripts/docs/links.sh → optional lychee local run

### CI (GitHub Actions)

- on: pull_request, push
    - Setup Node + (optionally) lychee action
    - Run: toc check, markdownlint, vale, lychee
    - Fail build on broken links or missing required sections

## Future Enhancements

- Directory-level badges from CI (TOC present, footer present, glossary link present)
- Auto-generate index READMEs via templates
- Report of orphaned docs/links

---

**Navigation**: [← Back to Tools Documentation](README.md) · [📚 Technical Glossary](../GLOSSARY.md)
