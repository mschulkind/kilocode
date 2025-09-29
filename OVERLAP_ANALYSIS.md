# Custom Module Overlap Analysis

## Built-in Rules from `remark-preset-lint-recommended`:

1. **final-newline** - Ensures files end with newline
2. **hard-break-spaces** - Checks hard break spaces
3. **list-item-bullet-indent** - Checks bullet indentation
4. **list-item-indent** - Checks list item indentation
5. **no-blockquote-without-marker** - Ensures blockquotes have markers
6. **no-duplicate-definitions** - Prevents duplicate link definitions
7. **no-heading-content-indent** - Checks heading content indentation
8. **no-literal-urls** - Warns about literal URLs
9. **no-shortcut-reference-image** - Warns about shortcut image references
10. **no-shortcut-reference-link** - Warns about shortcut link references
11. **no-undefined-references** - Warns about undefined references
12. **no-unused-definitions** - Warns about unused definitions
13. **ordered-list-marker-style** - Checks ordered list marker style

## Built-in Rules from `remark-validate-links`:

1. **missing-file** - Checks if linked files exist
2. **missing-heading** - Checks if linked headings exist

## Custom KiloCode Rules Analysis:

### ✅ **NO OVERLAPS** - These are unique KiloCode-specific rules:
- `kilocode-back-navigation` - Custom navigation requirements
- `kilocode-breadcrumb-navigation` - Custom breadcrumb requirements
- `kilocode-glossary-link` - Custom glossary link requirements
- `kilocode-link-density` - Custom link density analysis
- `kilocode-duplicate-sections` - Custom section duplication detection
- `kilocode-toc-link-mismatch` - Custom TOC link validation
- `kilocode-section-naming` - Custom section naming standards
- `kilocode-research-context-required` - Custom research context requirement
- `kilocode-navigation-footer-required` - Custom navigation footer requirement
- `kilocode-no-dead-ends-required` - Custom no dead ends policy requirement
- `kilocode-when-youre-here-required` - Custom "when you're here" requirement
- `kilocode-fun-fact-suggestion` - Custom fun fact suggestions
- `kilocode-content-length` - Custom content length validation
- `kilocode-heading-structure` - Custom heading structure validation
- `kilocode-quality-threshold` - Custom quality threshold validation
- `kilocode-orphaned-document` - Custom orphaned document detection
- `kilocode-orphaned-sections` - Custom orphaned section detection
- `kilocode-heading-hierarchy` - Custom heading hierarchy validation
- `kilocode-heading-progression` - Custom heading progression validation
- `kilocode-no-dead-ends-links` - Custom no dead ends link validation
- `kilocode-non-descriptive-crossref` - Custom cross-reference validation
- `kilocode-navigation-consistency` - Custom navigation consistency validation
- `kilocode-toc-navigation-link` - Custom TOC navigation link validation
- `kilocode-section-length` - Custom section length validation
- `kilocode-required-section` - Custom required section validation
- `kilocode-title-required` - Custom title requirement
- `kilocode-line-length` - Custom line length validation

### ❌ **POTENTIAL OVERLAP** - Already Fixed:
- ~~`kilocode-cross-reference`~~ - **DISABLED** - Was duplicating `missing-file` functionality

## Conclusion:

**No other custom modules overlap with built-in ones.** The KiloCode comprehensive plugin provides entirely custom validation rules that are specific to the KiloCode documentation standards and don't duplicate any built-in remark functionality.

The only overlap was `kilocode-cross-reference` which we already identified and disabled, reducing the error count by 53%.
