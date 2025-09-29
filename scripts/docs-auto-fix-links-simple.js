#!/usr/bin/env node

/**
 * Simple auto-fix script for common missing-file suggestions
 * 
 * This script applies common link fixes based on patterns we've observed.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

// Common fixes based on observed patterns
const commonFixes = [
  // Fix relative path issues
  { from: /\[([^\]]+)\]\(\.\.\/GLOSSARY\.md\)/g, to: '[$1](../GLOSSARY.md)' },
  { from: /\[([^\]]+)\]\(\.\.\/\.\.\/GLOSSARY\.md\)/g, to: '[$1](../../GLOSSARY.md)' },
  
  // Fix architecture file references
  { from: /\[([^\]]+)\]\(DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS\.md\)/g, to: '[$1](architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md)' },
  { from: /\[([^\]]+)\]\(PERFORMANCE_OPTIMIZATION\.md\)/g, to: '[$1](architecture/PERFORMANCE_OPTIMIZATION.md)' },
  { from: /\[([^\]]+)\]\(ARCHITECTURE_OVERVIEW\.md\)/g, to: '[$1](architecture/ARCHITECTURE_OVERVIEW.md)' },
  { from: /\[([^\]]+)\]\(CORE_SYSTEMS\.md\)/g, to: '[$1](architecture/CORE_SYSTEMS.md)' },
  { from: /\[([^\]]+)\]\(SYSTEM_OVERVIEW\.md\)/g, to: '[$1](architecture/SYSTEM_OVERVIEW.md)' },
  
  // Fix incorrect relative paths
  { from: /\[([^\]]+)\]\(\.\.\/architecture\/PERFORMANCE_OPTIMIZATION\.md\)/g, to: '[$1](architecture/PERFORMANCE_OPTIMIZATION.md)' },
  { from: /\[([^\]]+)\]\(\.\.\/architecture\/ARCHITECTURE_OVERVIEW\.md\)/g, to: '[$1](architecture/ARCHITECTURE_OVERVIEW.md)' },
  { from: /\[([^\]]+)\]\(\.\.\/architecture\/CORE_SYSTEMS\.md\)/g, to: '[$1](architecture/CORE_SYSTEMS.md)' },
  { from: /\[([^\]]+)\]\(\.\.\/architecture\/SYSTEM_OVERVIEW\.md\)/g, to: '[$1](architecture/SYSTEM_OVERVIEW.md)' },
  
  // Fix testing strategy references
  { from: /\[([^\]]+)\]\(\.\.\/testing\/TESTING_STRATEGY\.md\)/g, to: '[$1](../../testing/TESTING_STRATEGY.md)' },
  { from: /\[([^\]]+)\]\(\.\.\/\.\.\/testing\/TESTING_STRATEGY\.md\)/g, to: '[$1](../../testing/TESTING_STRATEGY.md)' },
  
  // Fix tools references
  { from: /\[([^\]]+)\]\(\.\.\/tools\/TROUBLESHOOTING_GUIDE\.md\)/g, to: '[$1](../../tools/TROUBLESHOOTING_GUIDE.md)' },
  { from: /\[([^\]]+)\]\(\.\.\/\.\.\/tools\/TROUBLESHOOTING_GUIDE\.md\)/g, to: '[$1](../../tools/TROUBLESHOOTING_GUIDE.md)' },
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
    
    for (const fix of commonFixes) {
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
  console.log('🔧 Applying common link fixes...');
  
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const changes = applyFixesToFile(file);
    if (changes > 0) {
      totalChanges += changes;
      filesChanged++;
    }
  }
  
  console.log(`\n✅ Auto-fix completed!`);
  console.log(`📝 Applied ${totalChanges} fixes across ${filesChanged} files`);
  console.log('🔍 Run "pnpm docs:validate" to verify fixes.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
