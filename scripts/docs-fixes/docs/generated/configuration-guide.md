# Configuration Guide

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

## Overview

The KiloCode Documentation Fixer uses a flexible configuration system that allows you to customize behavior, add new fix patterns, and extend functionality.

## Main Configuration

### CONFIG Object

The main configuration object controls the overall behavior of the fixer:

```javascript
const CONFIG = {
  // Directory containing markdown files to process
  docsDir: 'docs',
  
  // Directory for output files (validation results, logs, etc.)
  outputDir: 'scripts/docs-fixes/output',
  
  // Path to validation output file
  validationOutput: 'scripts/docs-fixes/output/validation.txt',
  
  // Whether to run in dry-run mode (no file modifications)
  dryRun: false,
  
  // Whether to show verbose output
  verbose: false,
  
  // Maximum file size to process (in bytes)
  maxFileSize: 1024 * 1024, // 1MB
};
```

### Runtime Configuration

You can override configuration at runtime:

```javascript
import { main } from './src/docs-fixer.js';

await main({
  dryRun: true,      // Override default dryRun setting
  verbose: true,     // Override default verbose setting
  validate: true     // Additional option not in CONFIG
});
```

## Path Fix Configuration

### Adding New Path Fixes

To add new path fixes, extend the `PATH_FIXES` array:

```javascript
const PATH_FIXES = [
  // Existing fixes...
  
  // New fix for a specific directory pattern
  {
    pattern: /\/new-section\/[^\/]+\.md$/,
    fixes: [
      { from: '../old-path.md', to: 'new-path.md' },
      { from: '../../old-reference.md', to: '../new-reference.md' }
    ]
  }
];
```

### Pattern Matching

Path fixes use regular expressions to match file paths:
- `/\/architecture\/[^\/]+\.md$/`: Matches files in `/architecture/` directory
- `/\/architecture\/[^\/]+\/[^\/]+\.md$/`: Matches files in `/architecture/subdir/` directory
- `/.*\.md$/`: Matches all markdown files

### Fix Rules

Each fix rule specifies:
- `from`: The incorrect path pattern to find
- `to`: The correct path to replace it with

- *Example:*\*

```javascript
{
  from: '../GLOSSARY.md',      // Find this pattern
  to: '../../GLOSSARY.md'      // Replace with this
}
```

## Link Text Configuration

### Adding New Link Text Improvements

Extend `LINK_TEXT_IMPROVEMENTS` with new patterns:

```javascript
const LINK_TEXT_IMPROVEMENTS = [
  // Existing improvements...
  
  // New improvement
  {
    pattern: /\[NEW_FILE\.md\]/g,
    replacement: '[New File Description]'
  },
  
  // Dynamic replacement using function
  {
    pattern: /\[([A-Z_]+_FILE\.md)\]/g,
    replacement: (match, filename) => {
      const name = filename.replace(/_FILE\.md$/, '').replace(/_/g, ' ');
      return `[${name}]`;
    }
  }
];
```

### Pattern Types
1. **Static Replacement**: Simple string replacement
   ```javascript
   { pattern: /\[README\.md\]/g, replacement: '[Project Overview]' }
   ```
2. **Dynamic Replacement**: Function-based replacement
   ```javascript
   { 
     pattern: /\[([A-Z_]+)\]/g, 
     replacement: (match, group1) => `[${group1.toLowerCase()}]`
   }
   ```

## Navigation Template Configuration

### Adding New Navigation Templates

Add new templates to `NAVIGATION_TEMPLATES`:

```javascript
const NAVIGATION_TEMPLATES = {
  // Existing templates...
  
  // New template for a specific section
  newSection: `
## Navigation
- [← New Section Overview](README.md)
- [← Subsection](subsection/README.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)
`,
  
  // Template with dynamic content
  dynamicTemplate: (sectionName) => `
## Navigation
- [← ${sectionName} Overview](README.md)
- [← Main Documentation](../README.md)
`
};
```

### Template Selection Logic

The `getNavigationTemplate` function selects templates based on file path:

```javascript
function getNavigationTemplate(filePath) {
  if (filePath.includes('/architecture/repository/')) {
    return NAVIGATION_TEMPLATES.architectureRepository;
  } else if (filePath.includes('/architecture/')) {
    return NAVIGATION_TEMPLATES.architecture;
  } else if (filePath.includes('/orchestrator/')) {
    return NAVIGATION_TEMPLATES.orchestrator;
  }
  // ... more conditions
  return NAVIGATION_TEMPLATES.default;
}
```

## Custom Configuration Files

### Creating Custom Config

Create a custom configuration file:

```javascript
// custom-config.js
export const CUSTOM_PATH_FIXES = [
  {
    pattern: /\/custom-section\/[^\/]+\.md$/,
    fixes: [
      { from: '../custom-reference.md', to: 'custom-reference.md' }
    ]
  }
];

export const CUSTOM_LINK_IMPROVEMENTS = [
  {
    pattern: /\[CUSTOM_FILE\.md\]/g,
    replacement: '[Custom File Description]'
  }
];
```

### Using Custom Configuration

```javascript
import { CUSTOM_PATH_FIXES, CUSTOM_LINK_IMPROVEMENTS } from './custom-config.js';
import { main } from './src/docs-fixer.js';

// Merge custom configuration
const customOptions = {
  customPathFixes: CUSTOM_PATH_FIXES,
  customLinkImprovements: CUSTOM_LINK_IMPROVEMENTS
};

await main(customOptions);
```

## Environment-Specific Configuration

### Development vs Production

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

const CONFIG = {
  docsDir: 'docs',
  dryRun: isDevelopment,        // Always dry-run in development
  verbose: isDevelopment,       // Verbose output in development
  maxFileSize: isDevelopment ? 512 * 1024 : 2 * 1024 * 1024
};
```

### CI/CD Configuration

```javascript
const isCI = process.env.CI === 'true';

const CONFIG = {
  docsDir: 'docs',
  dryRun: false,               // Always make changes in CI
  verbose: true,               // Verbose output for CI logs
  validate: true               // Always validate in CI
};
```

## Validation and Testing

### Configuration Validation

Add validation for your custom configuration:

```javascript
function validateConfig(config) {
  if (!config.docsDir || typeof config.docsDir !== 'string') {
    throw new Error('docsDir must be a string');
  }
  
  if (config.maxFileSize && (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0)) {
    throw new Error('maxFileSize must be a positive number');
  }
  
  // Validate path fixes
  if (config.pathFixes && !Array.isArray(config.pathFixes)) {
    throw new Error('pathFixes must be an array');
  }
  
  return true;
}
```

### Testing Configuration

```javascript
// test/config.test.js
import { CONFIG, PATH_FIXES, LINK_TEXT_IMPROVEMENTS } from '../src/docs-fixer.js';

test('CONFIG is properly configured', () => {
  expect(CONFIG.docsDir).toBeDefined();
  expect(typeof CONFIG.dryRun).toBe('boolean');
  expect(typeof CONFIG.verbose).toBe('boolean');
});

test('PATH_FIXES contains valid patterns', () => {
  PATH_FIXES.forEach(fix => {
    expect(fix.pattern).toBeInstanceOf(RegExp);
    expect(Array.isArray(fix.fixes)).toBe(true);
  });
});
```
