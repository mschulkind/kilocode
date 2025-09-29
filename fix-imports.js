#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all TypeScript files
const files = await glob('src/**/*.ts', { ignore: ['**/*.d.ts', '**/node_modules/**'] });

console.log(`Found ${files.length} TypeScript files to process...`);

let totalFixed = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix relative imports that are missing .js extensions
  // Match: import ... from './something' or import ... from '../something'
  // But not: import ... from './something.js' (already has extension)
  const importRegex = /import\s+.*?\s+from\s+['"](\.\/[^'"]*?)(?<!\.js)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if it's a directory import (ends with /)
    if (importPath.endsWith('/')) {
      return match;
    }
    
    // Add .js extension
    modified = true;
    return match.replace(importPath, importPath + '.js');
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
    totalFixed++;
  }
}

console.log(`\nFixed imports in ${totalFixed} files.`);
