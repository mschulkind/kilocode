# Examples

## Basic Usage Examples

### Fix All Documentation Issues

```bash
# Simple fix
node src/docs-fixer.js

# With validation
node src/docs-fixer.js --validate
```

### Preview Changes (Dry Run)

```bash
# See what would be changed without modifying files
node src/docs-fixer.js --dry-run --verbose
```

### Programmatic Usage

```javascript
import { main } from './src/docs-fixer.js';

// Basic usage
await main();

// With options
await main({
  dryRun: true,
  verbose: true,
  validate: true
});
```

## Advanced Examples

### Custom Path Fixes

```javascript
import { main, PATH_FIXES } from './src/docs-fixer.js';

// Add custom path fixes
const customPathFixes = [
  ...PATH_FIXES,
  {
    pattern: /\/custom-section\/[^\/]+\.md$/,
    fixes: [
      { from: '../old-reference.md', to: 'new-reference.md' }
    ]
  }
];

// Override PATH_FIXES (would need to modify the source)
// This is an example of how you might extend the functionality
```

### Custom Link Text Improvements

```javascript
import { fixLinkText } from './src/docs-fixer.js';

const customLinkImprovements = [
  {
    pattern: /\[([A-Z_]+_SPECIAL\.md)\]/g,
    replacement: (match, filename) => {
      const name = filename
        .replace(/_SPECIAL\.md$/, '')
        .replace(/_/g, ' ')
        .toLowerCase();
      return `[${name.charAt(0).toUpperCase() + name.slice(1)} Special]`;
    }
  }
];

// Apply custom link text fixes
const content = "[MY_SPECIAL_FILE.md](my-special-file.md)";
const result = customLinkImprovements.reduce((content, improvement) => {
  return content.replace(improvement.pattern, improvement.replacement);
}, content);

console.log(result); // "[My special file Special](my-special-file.md)"
```

### Custom Navigation Templates

```javascript
import { NAVIGATION_TEMPLATES } from './src/docs-fixer.js';

// Add custom navigation template
const customTemplates = {
  ...NAVIGATION_TEMPLATES,
  customSection: `
## Navigation

- [← Custom Section](README.md)
- [← Documentation](docs/README.md)
- [← Main Project](../README.md)
- [← Root](../../README.md)

## Quick Links

- [Getting Started](getting-started.md)
- [API Reference](api-reference.md)
- [Examples](examples.md)
`
};

// Use custom template
function getCustomNavigationTemplate(filePath) {
  if (filePath.includes('/custom-section/')) {
    return customTemplates.customSection;
  }
  return customTemplates.default;
}
```

## Integration Examples

### With npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "docs:fix": "cd scripts/docs-fixes && node src/docs-fixer.js",
    "docs:fix:dry": "cd scripts/docs-fixes && node src/docs-fixer.js --dry-run --verbose",
    "docs:fix:validate": "cd scripts/docs-fixes && node src/docs-fixer.js --validate"
  }
}
```

### With GitHub Actions

```yaml
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
```

### With Pre-commit Hooks

```bash
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
```

## Real-World Examples

### Fixing a Specific Issue

If you have a specific documentation issue, you can create a targeted fix:

```javascript
// fix-specific-issue.js
import { readFileSync, writeFileSync } from 'fs';

const filePath = 'docs/architecture/specific-file.md';
const content = readFileSync(filePath, 'utf8');

// Fix specific pattern
const fixedContent = content.replace(
  /\[OLD_REFERENCE\.md\]/g,
  '[New Reference Description]'
);

writeFileSync(filePath, fixedContent, 'utf8');
console.log('Fixed specific issue in', filePath);
```

### Batch Processing Multiple Files

```javascript
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
      fixedContent = fixedContent.replace(/\[README\.md\]/g, '[Overview]');
      fixedContent = fixedContent.replace(/\[([A-Z_]+)\.md\]/g, (match, name) => {
        const readable = name.replace(/_/g, ' ').toLowerCase();
        return `[${readable.charAt(0).toUpperCase() + readable.slice(1)}]`;
      });
      
      if (fixedContent !== content) {
        writeFileSync(filePath, fixedContent, 'utf8');
        console.log('Fixed:', filePath);
      }
    }
  }
}

fixDirectory('docs');
```

### Integration with Other Tools

```javascript
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
```

## Troubleshooting Examples

### Common Issues and Solutions

#### Issue: "Cannot find file" warnings

```javascript
// Debug path issues
import { processFile } from './src/docs-fixer.js';

const testFile = 'docs/architecture/test.md';
const result = processFile(testFile);

console.log('Fixes applied:', result.fixes);
console.log('Path issues fixed:', result.fixes.pathIssues);
```

#### Issue: Navigation footer not added

```javascript
// Check if file already has navigation
import { hasNavigationFooter } from './src/docs-fixer.js';

const content = readFileSync('docs/test.md', 'utf8');
console.log('Has navigation:', hasNavigationFooter(content));
```

#### Issue: Custom patterns not working

```javascript
// Test regex patterns
const pattern = /\/architecture\/[^\/]+\.md$/;
const testPaths = [
  'docs/architecture/test.md',
  'docs/architecture/subdir/test.md',
  'docs/other/test.md'
];

testPaths.forEach(path => {
  console.log(`${path}: ${pattern.test(path)}`);
});
```
