#!/usr/bin/env node

/**
 * Targeted auto-fix script for specific missing-file patterns
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

// Specific fixes based on observed patterns
const specificFixes = [
  // Fix GLOSSARY.md paths
  { from: /\[([^\]]+)\]\(\.\.\/\.\.\/GLOSSARY\.md\)/g, to: '[$1](../GLOSSARY.md)' },
  
  // Fix testing strategy paths
  { from: /\[([^\]]+)\]\(\.\.\/\.\.\/testing\/TESTING_STRATEGY\.md\)/g, to: '[$1](../testing/TESTING_STRATEGY.md)' },
  
  // Fix tools paths
  { from: /\[([^\]]+)\]\(\.\.\/\.\.\/tools\/TROUBLESHOOTING_GUIDE\.md\)/g, to: '[$1](../tools/TROUBLESHOOTING_GUIDE.md)' },
  
  // Fix architecture file references (from docs/ root)
  { from: /\[([^\]]+)\]\(architecture\/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS\.md\)/g, to: '[$1](DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md)' },
  { from: /\[([^\]]+)\]\(architecture\/PERFORMANCE_OPTIMIZATION\.md\)/g, to: '[$1](PERFORMANCE_OPTIMIZATION.md)' },
  { from: /\[([^\]]+)\]\(architecture\/ARCHITECTURE_OVERVIEW\.md\)/g, to: '[$1](ARCHITECTURE_OVERVIEW.md)' },
  { from: /\[([^\]]+)\]\(architecture\/CORE_SYSTEMS\.md\)/g, to: '[$1](CORE_SYSTEMS.md)' },
  { from: /\[([^\]]+)\]\(architecture\/SYSTEM_OVERVIEW\.md\)/g, to: '[$1](SYSTEM_OVERVIEW.md)' },
];

// Recursively find all markdown files
function findMarkdownFiles(dir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Apply fixes to a file
function applyFixesToFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let changesApplied = 0;
    
    for (const fix of specificFixes) {
      const before = modifiedContent;
      modifiedContent = modifiedContent.replace(fix.from, fix.to);
      if (before !== modifiedContent) {
        changesApplied++;
      }
    }
    
    if (changesApplied > 0) {
      writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`  ✅ Applied ${changesApplied} fixes to ${path.relative(process.cwd(), filePath)}`);
      return changesApplied;
    }
    
    return 0;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Main function
function main() {
  console.log('🔍 Finding markdown files...');
  
  const docsDir = 'docs';
  const files = findMarkdownFiles(docsDir);
  
  console.log(`📋 Found ${files.length} markdown files`);
  console.log('🔧 Applying targeted link fixes...');
  
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const changes = applyFixesToFile(file);
    if (changes > 0) {
      totalChanges += changes;
      filesChanged++;
    }
  }
  
  console.log(`\n✅ Targeted auto-fix completed!`);
  console.log(`📝 Applied ${totalChanges} fixes across ${filesChanged} files`);
  console.log('🔍 Run "pnpm docs:validate" to verify fixes.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
