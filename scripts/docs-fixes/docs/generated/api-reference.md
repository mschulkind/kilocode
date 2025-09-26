# API Reference

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

## Main Functions

### main(options)

Main function to run the documentation fixer.

- *Parameters:*\*
- `options` (Object): Configuration options
- `dryRun` (boolean): Run without making changes
- `verbose` (boolean): Show detailed output
- `validate` (boolean): Run validation after fixes

- *Returns:*\* Promise<void>

- *Example:*\*

```javascript
import { main } from './src/docs-fixer.js';

await main({
  dryRun: true,
  verbose: true,
  validate: false
});
```

## Configuration Objects

### CONFIG

Main configuration object for the documentation fixer.

```javascript
const CONFIG = {
  docsDir: 'docs',                    // Documentation directory
  outputDir: 'scripts/docs-fixes/output', // Output directory
  validationOutput: 'scripts/docs-fixes/output/validation.txt',
  dryRun: false,                      // Dry run mode
  verbose: false,                     // Verbose output
  maxFileSize: 1024 * 1024,          // Maximum file size (1MB)
};
```

### PATH\_FIXES

Array of path fix configurations.

```javascript
const PATH_FIXES = [
  {
    pattern: /\/architecture\/[^\/]+\.md$/,
    fixes: [
      { from: '../../GLOSSARY.md', to: '../GLOSSARY.md' }
    ]
  }
];
```

### LINK\_TEXT\_IMPROVEMENTS

Array of link text improvement configurations.

```javascript
const LINK_TEXT_IMPROVEMENTS = [
  {
    pattern: /\[README\.md\]/g,
    replacement: '[Project Overview]'
  }
];
```

### NAVIGATION\_TEMPLATES

Object containing navigation footer templates.

```javascript
const NAVIGATION_TEMPLATES = {
  architecture: `
## Navigation
- [← Architecture Overview](README.md)
- [← Main Documentation](../README.md)
`,
  // ... other templates
};
```

## Utility Functions

### fixPathIssues(content, filePath)

Fixes path issues in markdown content.

- *Parameters:*\*
- `content` (string): Markdown content
- `filePath` (string): File path for context

- *Returns:*\* Object with `content` and `fixesApplied` properties

### fixLinkText(content)

Fixes link text issues in markdown content.

- *Parameters:*\*
- `content` (string): Markdown content

- *Returns:*\* Object with `content` and `fixesApplied` properties

### addNavigationFooter(content, filePath)

Adds navigation footer to markdown content.

- *Parameters:*\*
- `content` (string): Markdown content
- `filePath` (string): File path for template selection

- *Returns:*\* Object with `content` and `added` properties

### hasNavigationFooter(content)

Checks if content already has a navigation footer.

- *Parameters:*\*
- `content` (string): Markdown content

- *Returns:*\* boolean

### getNavigationTemplate(filePath)

Gets appropriate navigation template for file path.

- *Parameters:*\*
- `filePath` (string): File path

- *Returns:*\* string (navigation template)
