# Link Text Standards Documentation

## Table of Contents

* [Link Text Standards Documentation](#link-text-standards-documentation)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Overview](#overview)
* [Link Text Principles](#link-text-principles)
* [Accessibility First](#accessibility-first)
* [User Experience](#user-experience)
* [Standards and Guidelines](#standards-and-guidelines)
* [Required Standards](#required-standards)
* [1. Descriptive Text](#1-descriptive-text)
* [2. Context Independence](#2-context-independence)
* [3. Unique Identification](#3-unique-identification)
* [Recommended Guidelines](#recommended-guidelines)
* [1. Action-Oriented Text](#1-action-oriented-text)
* [2. Consistent Formatting](#2-consistent-formatting)
* [3. Appropriate Length](#3-appropriate-length)
* [Common Patterns and Examples](#common-patterns-and-examples)
* [File and Document Links](#file-and-document-links)
* [](#)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation Links](#navigation-links)
* [Cross-Reference Links](#crossreference-links)
* [External Links](#external-links)
* [Context-Specific Guidelines](#context-specific-guidelines)
* [Architecture Documentation](#architecture-documentation)
* [Tools Documentation](#tools-documentation)
* [Standards Documentation](#standards-documentation)
* [Automated Improvements](#automated-improvements)
* [Link Text Standardizer](#link-text-standardizer)
* [Common Improvements](#common-improvements)
* [File Name Improvements](#file-name-improvements)
* [Validation and Enforcement](#validation-and-enforcement)
* [Automated Validation](#automated-validation)
* [Validation Rules](#validation-rules)
* [Error Types](#error-types)
* [Best Practices Summary](#best-practices-summary)
* [Do's](#dos)
* [Don'ts](#donts)
* [Tools and Resources](#tools-and-resources)
* [Automated Tools](#automated-tools)
* [Manual Review](#manual-review)
* [External Resources](#external-resources)
* [Updates and Maintenance](#updates-and-maintenance)
* [Navigation](#navigation)
* [Link Text Standards Documentation](#link-text-standards-documentation)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Overview](#overview)
* [Link Text Principles](#link-text-principles)
* [Accessibility First](#accessibility-first)
* [User Experience](#user-experience)
* [Standards and Guidelines](#standards-and-guidelines)
* [Required Standards](#required-standards)
* [1. Descriptive Text](#1-descriptive-text)
* [2. Context Independence](#2-context-independence)
* [3. Unique Identification](#3-unique-identification)
* [Recommended Guidelines](#recommended-guidelines)
* [1. Action-Oriented Text](#1-action-oriented-text)
* [2. Consistent Formatting](#2-consistent-formatting)
* [3. Appropriate Length](#3-appropriate-length)
* [Common Patterns and Examples](#common-patterns-and-examples)
* [File and Document Links](#file-and-document-links)
* [](#)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation Links](#navigation-links)
* [Cross-Reference Links](#crossreference-links)
* [External Links](#external-links)
* [Context-Specific Guidelines](#context-specific-guidelines)
* [Architecture Documentation](#architecture-documentation)
* [Tools Documentation](#tools-documentation)
* [Standards Documentation](#standards-documentation)
* [Automated Improvements](#automated-improvements)
* [Link Text Standardizer](#link-text-standardizer)
* [Common Improvements](#common-improvements)
* [File Name Improvements](#file-name-improvements)
* [Validation and Enforcement](#validation-and-enforcement)
* [Automated Validation](#automated-validation)
* [Validation Rules](#validation-rules)
* [Error Types](#error-types)
* [Best Practices Summary](#best-practices-summary)
* [Do's](#dos)
* [Don'ts](#donts)
* [Tools and Resources](#tools-and-resources)
* [Automated Tools](#automated-tools)
* [Manual Review](#manual-review)
* [External Resources](#external-resources)
* [Updates and Maintenance](#updates-and-maintenance)
* [Navigation](#navigation)

## When You're Here

💡 **Fun Fact**: \[Interesting fact about the topic]

This document provides \[purpose of document].

* **Purpose**: \[Brief description of what this document covers]
* **Context**: \[How this fits into the broader system/project]
* **Navigation**: Use the table of contents below to jump to specific topics

## Research Context

### Technical Overview

**Component**: \[Component name]
**Version**: \[Version number]
**Architecture**: \[Architecture description]
**Dependencies**: \[Key dependencies]

### Background

\[Background information about the topic]

### Methodology

\[Research or development methodology used]

## Overview

This document defines the standards for descriptive link text in KiloCode documentation. Proper link
text improves accessibility, user experience, and helps users understand what they'll find when they
click a link.

## Link Text Principles

### Accessibility First

Link text should be:

* **Descriptive**: Clearly indicate what the link leads to
* **Self-contained**: Understandable without surrounding context
* **Unique**: Distinguishable from other links on the page
* **Concise**: Brief but informative

### User Experience

Good link text helps users:

* Navigate efficiently through documentation
* Understand the relationship between documents
* Make informed decisions about which links to follow
* Use screen readers and other assistive technologies effectively

## Standards and Guidelines

### Required Standards

#### 1. Descriptive Text

Link text must describe the destination or action, not just the link itself.

```markdown
<!-- ✅ Good -->
[API Documentation](../api/README.md)
[Installation Guide](./installation.md)
[View the complete changelog](../CHANGELOG.md)

<!-- ❌ Bad -->
[here](../api/README.md)
[click here](./installation.md)
[more](../CHANGELOG.md)
```

#### 2. Context Independence

Link text should be understandable when read out of context.

```markdown
<!-- ✅ Good -->
[Validation System Documentation](./VALIDATION_SYSTEM.md)
[Cross-Reference Audit Results](./audit-results.md)
[Performance Optimization Guide](./performance.md)

<!-- ❌ Bad -->
[this](./VALIDATION_SYSTEM.md)
[that](./audit-results.md)
[it](./performance.md)
```

#### 3. Unique Identification

Each link should have distinct, identifiable text.

```markdown
<!-- ✅ Good -->
[Architecture Overview](../architecture/README.md)
[Architecture Standards](../architecture/standards.md)
[Architecture Best Practices](../architecture/best-practices.md)

<!-- ❌ Bad -->
[Architecture](../architecture/README.md)
[Architecture](../architecture/standards.md)
[Architecture](../architecture/best-practices.md)
```

### Recommended Guidelines

#### 1. Action-Oriented Text

Use verbs to indicate actions when appropriate.

```markdown
<!-- ✅ Good -->
[Download the installer](./downloads/)
[View source code on GitHub](https://github.com/kilocode/kilocode)
[Report an issue](./issues/)
[Learn more about configuration](./config.md)
```

#### 2. Consistent Formatting

Use consistent patterns for similar types of links.

```markdown
<!-- ✅ Good - Consistent pattern -->
[API Documentation](../api/README.md)
[User Guide](../user/README.md)
[Developer Guide](../developer/README.md)

<!-- ✅ Good - Consistent action pattern -->
[View API Documentation](../api/README.md)
[Read User Guide](../user/README.md)
[Access Developer Guide](../developer/README.md)
```

#### 3. Appropriate Length

Link text should be long enough to be descriptive but short enough to be scannable.

```markdown
<!-- ✅ Good - Appropriate length -->
[Getting Started Guide](./getting-started.md)
[Advanced Configuration Options](./advanced-config.md)

<!-- ❌ Bad - Too short -->
[Guide](./getting-started.md)
[Options](./advanced-config.md)

<!-- ❌ Bad - Too long -->
[Comprehensive Getting Started Guide for New Users](./getting-started.md)
[Advanced Configuration Options for Power Users](./advanced-config.md)
```

## Common Patterns and Examples

### File and Document Links

```markdown
<!-- ✅ Good patterns -->
[README File](./README.md)
[Configuration File](./config.yaml)
[Changelog](../CHANGELOG.md)
[License](../LICENSE)
[Contributing Guidelines](../CONTRIBUTING.md)

<!-- ❌ Bad patterns -->
[README](./README.md)
[config](./config.yaml)
[changes](../CHANGELOG.md)
[license](../LICENSE)
[contributing](../CONTRIBUTING.md)
```

#

## No Dead Ends Policy

This document connects to:

For more information, see:

* [Documentation Structure](../README.md)
* [Additional Resources](../tools/README.md)

## Navigation Links

```markdown
<!-- ✅ Good patterns -->
[← Back to Main Documentation](../README.md)
[→ Next: Installation Guide](./installation.md)
[📚 Technical Glossary](../../GLOSSARY.md)
[↑ Table of Contents](#table-of-contents)

<!-- ❌ Bad patterns -->
[← Back](../README.md)
[→ Next](./installation.md)
[📚 Glossary](../../GLOSSARY.md)
[↑ TOC](#table-of-contents)
```

### Cross-Reference Links

```markdown
<!-- ✅ Good patterns -->
[Related: Validation System](./VALIDATION_SYSTEM.md)
[See also: Best Practices Guide](./BEST_PRACTICES.md)
[Compare with: Alternative Approach](./alternative.md)

<!-- ❌ Bad patterns -->
[Related](./VALIDATION_SYSTEM.md)
[See also](./BEST_PRACTICES.md)
[Compare](./alternative.md)
```

### External Links

```markdown
<!-- ✅ Good patterns -->
[GitHub Repository](https://github.com/kilocode/kilocode)
[Documentation Website](https://docs.kilocode.com)
[Issue Tracker](https://github.com/kilocode/kilocode/issues)

<!-- ❌ Bad patterns -->
[GitHub](https://github.com/kilocode/kilocode)
[Website](https://docs.kilocode.com)
[Issues](https://github.com/kilocode/kilocode/issues)
```

## Context-Specific Guidelines

### Architecture Documentation

```markdown
<!-- ✅ Good - Architecture context -->
[API Duplication Analysis](../architecture/API_DUPLICATION_ANALYSIS.md)
[Orchestrator System Overview](../../orchestrator/README.md)
[Provider Layer Documentation](../architecture/PROVIDER_LAYER.md)

<!-- ❌ Bad -->
[API_DUPLICATION_ANALYSIS.md](../architecture/API_DUPLICATION_ANALYSIS.md)
[orchestrator](../../orchestrator/README.md)
[provider](../architecture/PROVIDER_LAYER.md)
```

### Tools Documentation

```markdown
<!-- ✅ Good - Tools context -->
[Validation System Documentation](./VALIDATION_SYSTEM.md)
[Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
[Best Practices Guide](./BEST_PRACTICES.md)

<!-- ❌ Bad -->
[VALIDATION_SYSTEM.md](./VALIDATION_SYSTEM.md)
[troubleshooting](./TROUBLESHOOTING_GUIDE.md)
[practices](./BEST_PRACTICES.md)
```

### Standards Documentation

```markdown
<!-- ✅ Good - Standards context -->
[Core Standards](../standards/core/README.md)
[Navigation Standards](../standards/../navigation/README.md)
[Structure Standards](../standards/structure/README.md)

<!-- ❌ Bad -->
[core](../standards/core/README.md)
[navigation](../standards/../navigation/README.md)
[structure](../standards/structure/README.md)
```

## Automated Improvements

### Link Text Standardizer

The project includes an automated link text standardizer that:

1. **Identifies Non-Descriptive Links**: Detects links with poor text
2. **Applies Improvement Rules**: Uses predefined patterns to suggest better text
3. **Context-Aware Improvements**: Considers document context for better suggestions
4. **URL-Based Improvements**: Extracts meaningful information from URLs

### Common Improvements

The standardizer automatically improves:

```markdown
<!-- Before -->
[here](./README.md)
[more](../CHANGELOG.md)
[this](./VALIDATION_SYSTEM.md)

<!-- After -->
[View details](./README.md)
[Read more](../CHANGELOG.md)
[Validation System Documentation](./VALIDATION_SYSTEM.md)
```

### File Name Improvements

```markdown
<!-- Before -->
[API_DUPLICATION_ANALYSIS.md](../architecture/API_DUPLICATION_ANALYSIS.md)
[validation-system.md](./validation-system.md)
[bestPractices.md](./bestPractices.md)

<!-- After -->
[API Duplication Analysis](../architecture/API_DUPLICATION_ANALYSIS.md)
[Validation System](./validation-system.md)
[Best Practices](./bestPractices.md)
```

## Validation and Enforcement

### Automated Validation

The validation system checks for:

* **Non-descriptive patterns**: Generic words like "here", "more", "click"
* **URL duplication**: Link text that matches the URL
* **Context independence**: Links that require context to understand
* **Consistency**: Similar links using different patterns

### Validation Rules

```javascript
// Non-descriptive patterns
const nonDescriptivePatterns = [
  /^(click here|here|link|more|read more|see more|continue|next|previous)$/i,
  /^(this|that|it)$/i,
  /^(page|document|file|article)$/i,
  /^\d+$/,
  /^[a-z]+\.(com|org|net|io)$/i,
  /^[a-z]+\.md$/i,
  /^\.\.\//,
  /^\.\//,
  /^#$/
]
```

### Error Types

* **Errors**: Non-descriptive links that must be fixed
* **Warnings**: Links that could be improved
* **Info**: Suggestions for better alternatives

## Best Practices Summary

### Do's

✅ **Use descriptive, action-oriented text**
✅ **Make links self-contained and context-independent**
✅ **Use consistent patterns for similar link types**
✅ **Include verbs for action-oriented links**
✅ **Keep text concise but informative**
✅ **Test links with screen readers**
✅ **Use meaningful file names and URLs**

### Don'ts

❌ **Don't use generic words like "here", "more", "click"**
❌ **Don't use pronouns like "this", "that", "it"**
❌ **Don't duplicate the URL as link text**
❌ **Don't use file extensions as link text**
❌ **Don't make links dependent on surrounding context**
❌ **Don't use overly long or verbose link text**
❌ **Don't create ambiguous or confusing links**

## Tools and Resources

### Automated Tools

* **Link Text Standardizer**: `scripts/docs/link-text-standardizer.js`
* **Validation System**: Integrated into `remark-kilocode-comprehensive`
* **Link Validator**: `scripts/docs/link-validator.js`

### Manual Review

* **Accessibility Testing**: Test with screen readers
* **User Testing**: Gather feedback from actual users
* **Peer Review**: Have others review link clarity

### External Resources

* [WebAIM Link Text Guidelines](https://webaim.org/techniques/hypertext/link_text)
* [WCAG Link Purpose
  Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html)
* [MDN Link Best
  Practices](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML#Link_text)

## Updates and Maintenance

This standard is maintained as part of the KiloCode documentation automation:

1. **Regular Updates**: Standards are updated based on best practices
2. **Automated Enforcement**: Validation rules are enforced automatically
3. **Community Feedback**: Standards evolve based on user feedback
4. **Tool Improvements**: Automated tools are continuously improved

For questions or issues with link text standards, see the [Validation System
Documentation](./VALIDATION_SYSTEM.md).

## Navigation

* [← Back to Documentation Tools](./)
* [→ Validation System Documentation](./VALIDATION_SYSTEM.md)
* [📚 Technical Glossary](../../GLOSSARY.md)
* [↑ Table of Contents](#link-text-standards-documentation)
