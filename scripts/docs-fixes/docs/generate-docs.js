#!/usr/bin/env node

/**
 * Documentation Generator for KiloCode Documentation Fixer
 * 
 * Generates comprehensive documentation including API reference,
 * configuration guide, and examples.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = 'docs/generated';

/**
 * Generate API documentation
 */
function generateAPIDocs() {
  const apiDocs = `# API Reference

## Main Functions

### main(options)

Main function to run the documentation fixer.

**Parameters:**
- \`options\` (Object): Configuration options
  - \`dryRun\` (boolean): Run without making changes
  - \`verbose\` (boolean): Show detailed output
  - \`validate\` (boolean): Run validation after fixes

**Returns:** Promise<void>

**Example:**
\`\`\`javascript
import { main } from './src/docs-fixer.js';

await main({
  dryRun: true,
  verbose: true,
  validate: false
});
\`\`\`

## Configuration Objects

### CONFIG

Main configuration object for the documentation fixer.

\`\`\`javascript
const CONFIG = {
  docsDir: 'docs',                    // Documentation directory
  outputDir: 'scripts/docs-fixes/output', // Output directory
  validationOutput: 'scripts/docs-fixes/output/validation.txt',
  dryRun: false,                      // Dry run mode
  verbose: false,                     // Verbose output
  maxFileSize: 1024 * 1024,          // Maximum file size (1MB)
};
\`\`\`

### PATH_FIXES

Array of path fix configurations.

\`\`\`javascript
const PATH_FIXES = [
  {
    pattern: /\\/architecture\\/[^\\/]+\\.md$/,
    fixes: [
      { from: '../../GLOSSARY.md', to: '../GLOSSARY.md' }
    ]
  }
];
\`\`\`

### LINK_TEXT_IMPROVEMENTS

Array of link text improvement configurations.

\`\`\`javascript
const LINK_TEXT_IMPROVEMENTS = [
  {
    pattern: /\\[README\\.md\\]/g,
    replacement: '[Project Overview]'
  }
];
\`\`\`

### NAVIGATION_TEMPLATES

Object containing navigation footer templates.

\`\`\`javascript
const NAVIGATION_TEMPLATES = {
  architecture: \`
## Navigation

- [← Architecture Overview](README.md)
- [← Main Documentation](../README.md)
\`,
  // ... other templates
};
\`\`\`

## Utility Functions

### fixPathIssues(content, filePath)

Fixes path issues in markdown content.

**Parameters:**
- \`content\` (string): Markdown content
- \`filePath\` (string): File path for context

**Returns:** Object with \`content\` and \`fixesApplied\` properties

### fixLinkText(content)

Fixes link text issues in markdown content.

**Parameters:**
- \`content\` (string): Markdown content

**Returns:** Object with \`content\` and \`fixesApplied\` properties

### addNavigationFooter(content, filePath)

Adds navigation footer to markdown content.

**Parameters:**
- \`content\` (string): Markdown content
- \`filePath\` (string): File path for template selection

**Returns:** Object with \`content\` and \`added\` properties

### hasNavigationFooter(content)

Checks if content already has a navigation footer.

**Parameters:**
- \`content\` (string): Markdown content

**Returns:** boolean

### getNavigationTemplate(filePath)

Gets appropriate navigation template for file path.

**Parameters:**
- \`filePath\` (string): File path

**Returns:** string (navigation template)
`;

  return apiDocs;
}

/**
 * Generate configuration guide
 */
function generateConfigGuide() {
  const configGuide = `# Configuration Guide

## Overview

The KiloCode Documentation Fixer uses a flexible configuration system that allows you to customize behavior, add new fix patterns, and extend functionality.

## Main Configuration

### CONFIG Object

The main configuration object controls the overall behavior of the fixer:

\`\`\`javascript
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
\`\`\`

### Runtime Configuration

You can override configuration at runtime:

\`\`\`javascript
import { main } from './src/docs-fixer.js';

await main({
  dryRun: true,      // Override default dryRun setting
  verbose: true,     // Override default verbose setting
  validate: true     // Additional option not in CONFIG
});
\`\`\`

## Path Fix Configuration

### Adding New Path Fixes

To add new path fixes, extend the \`PATH_FIXES\` array:

\`\`\`javascript
const PATH_FIXES = [
  // Existing fixes...
  
  // New fix for a specific directory pattern
  {
    pattern: /\\/new-section\\/[^\\/]+\\.md$/,
    fixes: [
      { from: '../old-path.md', to: 'new-path.md' },
      { from: '../../old-reference.md', to: '../new-reference.md' }
    ]
  }
];
\`\`\`

### Pattern Matching

Path fixes use regular expressions to match file paths:

- \`/\\/architecture\\/[^\\/]+\\.md$/\`: Matches files in \`/architecture/\` directory
- \`/\\/architecture\\/[^\\/]+\\/[^\\/]+\\.md$/\`: Matches files in \`/architecture/subdir/\` directory
- \`/.*\\.md$/\`: Matches all markdown files

### Fix Rules

Each fix rule specifies:
- \`from\`: The incorrect path pattern to find
- \`to\`: The correct path to replace it with

**Example:**
\`\`\`javascript
{
  from: '../GLOSSARY.md',      // Find this pattern
  to: '../../GLOSSARY.md'      // Replace with this
}
\`\`\`

## Link Text Configuration

### Adding New Link Text Improvements

Extend \`LINK_TEXT_IMPROVEMENTS\` with new patterns:

\`\`\`javascript
const LINK_TEXT_IMPROVEMENTS = [
  // Existing improvements...
  
  // New improvement
  {
    pattern: /\\[NEW_FILE\\.md\\]/g,
    replacement: '[New File Description]'
  },
  
  // Dynamic replacement using function
  {
    pattern: /\\[([A-Z_]+_FILE\\.md)\\]/g,
    replacement: (match, filename) => {
      const name = filename.replace(/_FILE\\.md$/, '').replace(/_/g, ' ');
      return \`[\${name}]\`;
    }
  }
];
\`\`\`

### Pattern Types

1. **Static Replacement**: Simple string replacement
   \`\`\`javascript
   { pattern: /\\[README\\.md\\]/g, replacement: '[Project Overview]' }
   \`\`\`

2. **Dynamic Replacement**: Function-based replacement
   \`\`\`javascript
   { 
     pattern: /\\[([A-Z_]+)\\]/g, 
     replacement: (match, group1) => \`[\${group1.toLowerCase()}]\`
   }
   \`\`\`

## Navigation Template Configuration

### Adding New Navigation Templates

Add new templates to \`NAVIGATION_TEMPLATES\`:

\`\`\`javascript
const NAVIGATION_TEMPLATES = {
  // Existing templates...
  
  // New template for a specific section
  newSection: \`
## Navigation

- [← New Section Overview](README.md)
- [← Subsection](subsection/README.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)
\`,
  
  // Template with dynamic content
  dynamicTemplate: (sectionName) => \`
## Navigation

- [← \${sectionName} Overview](README.md)
- [← Main Documentation](../README.md)
\`
};
\`\`\`

### Template Selection Logic

The \`getNavigationTemplate\` function selects templates based on file path:

\`\`\`javascript
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
\`\`\`

## Custom Configuration Files

### Creating Custom Config

Create a custom configuration file:

\`\`\`javascript
// custom-config.js
export const CUSTOM_PATH_FIXES = [
  {
    pattern: /\\/custom-section\\/[^\\/]+\\.md$/,
    fixes: [
      { from: '../custom-reference.md', to: 'custom-reference.md' }
    ]
  }
];

export const CUSTOM_LINK_IMPROVEMENTS = [
  {
    pattern: /\\[CUSTOM_FILE\\.md\\]/g,
    replacement: '[Custom File Description]'
  }
];
\`\`\`

### Using Custom Configuration

\`\`\`javascript
import { CUSTOM_PATH_FIXES, CUSTOM_LINK_IMPROVEMENTS } from './custom-config.js';
import { main } from './src/docs-fixer.js';

// Merge custom configuration
const customOptions = {
  customPathFixes: CUSTOM_PATH_FIXES,
  customLinkImprovements: CUSTOM_LINK_IMPROVEMENTS
};

await main(customOptions);
\`\`\`

## Environment-Specific Configuration

### Development vs Production

\`\`\`javascript
const isDevelopment = process.env.NODE_ENV === 'development';

const CONFIG = {
  docsDir: 'docs',
  dryRun: isDevelopment,        // Always dry-run in development
  verbose: isDevelopment,       // Verbose output in development
  maxFileSize: isDevelopment ? 512 * 1024 : 2 * 1024 * 1024
};
\`\`\`

### CI/CD Configuration

\`\`\`javascript
const isCI = process.env.CI === 'true';

const CONFIG = {
  docsDir: 'docs',
  dryRun: false,               // Always make changes in CI
  verbose: true,               // Verbose output for CI logs
  validate: true               // Always validate in CI
};
\`\`\`

## Validation and Testing

### Configuration Validation

Add validation for your custom configuration:

\`\`\`javascript
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
\`\`\`

### Testing Configuration

\`\`\`javascript
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
\`\`\`
`;

  return configGuide;
}

/**
 * Generate examples documentation
 */
function generateExamples() {
  const examples = `# Examples

## Basic Usage Examples

### Fix All Documentation Issues

\`\`\`bash
# Simple fix
node src/docs-fixer.js

# With validation
node src/docs-fixer.js --validate
\`\`\`

### Preview Changes (Dry Run)

\`\`\`bash
# See what would be changed without modifying files
node src/docs-fixer.js --dry-run --verbose
\`\`\`

### Programmatic Usage

\`\`\`javascript
import { main } from './src/docs-fixer.js';

// Basic usage
await main();

// With options
await main({
  dryRun: true,
  verbose: true,
  validate: true
});
\`\`\`

## Advanced Examples

### Custom Path Fixes

\`\`\`javascript
import { main, PATH_FIXES } from './src/docs-fixer.js';

// Add custom path fixes
const customPathFixes = [
  ...PATH_FIXES,
  {
    pattern: /\\/custom-section\\/[^\\/]+\\.md$/,
    fixes: [
      { from: '../old-reference.md', to: 'new-reference.md' }
    ]
  }
];

// Override PATH_FIXES (would need to modify the source)
// This is an example of how you might extend the functionality
\`\`\`

### Custom Link Text Improvements

\`\`\`javascript
import { fixLinkText } from './src/docs-fixer.js';

const customLinkImprovements = [
  {
    pattern: /\\[([A-Z_]+_SPECIAL\\.md)\\]/g,
    replacement: (match, filename) => {
      const name = filename
        .replace(/_SPECIAL\\.md$/, '')
        .replace(/_/g, ' ')
        .toLowerCase();
      return \`[\${name.charAt(0).toUpperCase() + name.slice(1)} Special]\`;
    }
  }
];

// Apply custom link text fixes
const content = "[MY_SPECIAL_FILE.md](my-special-file.md)";
const result = customLinkImprovements.reduce((content, improvement) => {
  return content.replace(improvement.pattern, improvement.replacement);
}, content);

console.log(result); // "[My special file Special](my-special-file.md)"
\`\`\`

### Custom Navigation Templates

\`\`\`javascript
import { NAVIGATION_TEMPLATES } from './src/docs-fixer.js';

// Add custom navigation template
const customTemplates = {
  ...NAVIGATION_TEMPLATES,
  customSection: \`
## Navigation

- [← Custom Section](README.md)
- [← Documentation](docs/README.md)
- [← Main Project](../README.md)
- [← Root](../../README.md)

## Quick Links

- [Getting Started](getting-started.md)
- [API Reference](api-reference.md)
- [Examples](examples.md)
\`
};

// Use custom template
function getCustomNavigationTemplate(filePath) {
  if (filePath.includes('/custom-section/')) {
    return customTemplates.customSection;
  }
  return customTemplates.default;
}
\`\`\`

## Integration Examples

### With npm Scripts

Add to \`package.json\`:

\`\`\`json
{
  "scripts": {
    "docs:fix": "cd scripts/docs-fixes && node src/docs-fixer.js",
    "docs:fix:dry": "cd scripts/docs-fixes && node src/docs-fixer.js --dry-run --verbose",
    "docs:fix:validate": "cd scripts/docs-fixes && node src/docs-fixer.js --validate"
  }
}
\`\`\`

### With GitHub Actions

\`\`\`yaml
name: Fix Documentation

on:
  push:
    paths:
      - 'docs/**'
      - 'scripts/docs-fixes/**'

jobs:
  fix-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Fix documentation issues
        run: |
          cd scripts/docs-fixes
          node src/docs-fixer.js --validate
          
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/
          git diff --staged --quiet || git commit -m "Fix documentation issues [skip ci]"
          git push
\`\`\`

### With Pre-commit Hooks

\`\`\`bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running documentation fixes..."

cd scripts/docs-fixes
node src/docs-fixer.js --dry-run

if [ $? -ne 0 ]; then
  echo "Documentation issues found. Run 'npm run docs:fix' to fix them."
  exit 1
fi

echo "Documentation checks passed!"
\`\`\`

## Real-World Examples

### Fixing a Specific Issue

If you have a specific documentation issue, you can create a targeted fix:

\`\`\`javascript
// fix-specific-issue.js
import { readFileSync, writeFileSync } from 'fs';

const filePath = 'docs/architecture/specific-file.md';
const content = readFileSync(filePath, 'utf8');

// Fix specific pattern
const fixedContent = content.replace(
  /\\[OLD_REFERENCE\\.md\\]/g,
  '[New Reference Description]'
);

writeFileSync(filePath, fixedContent, 'utf8');
console.log('Fixed specific issue in', filePath);
\`\`\`

### Batch Processing Multiple Files

\`\`\`javascript
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

function fixDirectory(directory) {
  const files = readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = join(directory, file.name);
    
    if (file.isDirectory()) {
      fixDirectory(filePath);
    } else if (file.name.endsWith('.md')) {
      const content = readFileSync(filePath, 'utf8');
      
      // Apply specific fixes
      let fixedContent = content;
      fixedContent = fixedContent.replace(/\\[README\\.md\\]/g, '[Overview]');
      fixedContent = fixedContent.replace(/\\[([A-Z_]+)\\.md\\]/g, (match, name) => {
        const readable = name.replace(/_/g, ' ').toLowerCase();
        return \`[\${readable.charAt(0).toUpperCase() + readable.slice(1)}]\`;
      });
      
      if (fixedContent !== content) {
        writeFileSync(filePath, fixedContent, 'utf8');
        console.log('Fixed:', filePath);
      }
    }
  }
}

fixDirectory('docs');
\`\`\`

### Integration with Other Tools

\`\`\`javascript
// integrate-with-other-tools.js
import { execSync } from 'child_process';
import { main } from './src/docs-fixer.js';

async function fullDocumentationWorkflow() {
  console.log('1. Running documentation fixes...');
  await main({ validate: true });
  
  console.log('2. Running markdown linting...');
  execSync('markdownlint docs/**/*.md', { stdio: 'inherit' });
  
  console.log('3. Running spell checking...');
  execSync('cspell "docs/**/*.md"', { stdio: 'inherit' });
  
  console.log('4. Generating documentation site...');
  execSync('mkdocs build', { stdio: 'inherit' });
  
  console.log('Documentation workflow completed!');
}

fullDocumentationWorkflow().catch(console.error);
\`\`\`

## Troubleshooting Examples

### Common Issues and Solutions

#### Issue: "Cannot find file" warnings

\`\`\`javascript
// Debug path issues
import { processFile } from './src/docs-fixer.js';

const testFile = 'docs/architecture/test.md';
const result = processFile(testFile);

console.log('Fixes applied:', result.fixes);
console.log('Path issues fixed:', result.fixes.pathIssues);
\`\`\`

#### Issue: Navigation footer not added

\`\`\`javascript
// Check if file already has navigation
import { hasNavigationFooter } from './src/docs-fixer.js';

const content = readFileSync('docs/test.md', 'utf8');
console.log('Has navigation:', hasNavigationFooter(content));
\`\`\`

#### Issue: Custom patterns not working

\`\`\`javascript
// Test regex patterns
const pattern = /\\/architecture\\/[^\\/]+\\.md$/;
const testPaths = [
  'docs/architecture/test.md',
  'docs/architecture/subdir/test.md',
  'docs/other/test.md'
];

testPaths.forEach(path => {
  console.log(\`\${path}: \${pattern.test(path)}\`);
});
\`\`\`
`;

  return examples;
}

/**
 * Generate all documentation
 */
function generateAllDocs() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const docs = [
    { name: 'api-reference.md', content: generateAPIDocs() },
    { name: 'configuration-guide.md', content: generateConfigGuide() },
    { name: 'examples.md', content: generateExamples() }
  ];
  
  docs.forEach(doc => {
    const filePath = join(OUTPUT_DIR, doc.name);
    writeFileSync(filePath, doc.content, 'utf8');
    console.log(`Generated: ${filePath}`);
  });
  
  console.log(`\\n📚 Documentation generated in: ${OUTPUT_DIR}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllDocs();
}

export { generateAPIDocs, generateConfigGuide, generateExamples, generateAllDocs };
