#!/usr/bin/env node

/**
 * Smart auto-fix script for missing-file suggestions
 * 
 * This script applies fixes based on the file's location and the suggestion.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

// Get the correct relative path based on file location
function getCorrectPath(filePath, targetPath, suggestion) {
  const fileDir = path.dirname(filePath);
  const docsDir = 'docs';
  
  // Remove docs/ prefix to get relative path
  const relativeFileDir = path.relative(docsDir, fileDir);
  
  // Calculate how many levels up we need to go
  const levelsUp = relativeFileDir.split(path.sep).length;
  
  // Build the correct path
  if (levelsUp === 0) {
    // File is in docs/ root
    return suggestion;
  } else {
    // File is in subdirectory, need to go up levels
    const upPath = '../'.repeat(levelsUp);
    return suggestion.replace(/^\.\.\//, upPath);
  }
}

// Parse validation output and extract suggestions
function parseValidationOutput(output) {
  const suggestions = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('did you mean')) {
      // Extract file path, line number, and suggestion
      const match = line.match(/([^:]+):(\d+):(\d+)-(\d+):(\d+).*Cannot find file `([^`]+)`.*did you mean `([^`]+)`/);
      if (match) {
        const [, filePath, lineNum, colStart, colEnd, colEnd2, brokenLink, suggestedLink] = match;
        suggestions.push({
          filePath: filePath.trim(),
          line: parseInt(lineNum),
          column: parseInt(colStart),
          brokenLink: brokenLink.trim(),
          suggestedLink: suggestedLink.trim(),
          fullLine: line
        });
      }
    }
  }
  
  return suggestions;
}

// Apply suggestions to files
function applySuggestions(suggestions) {
  const fileGroups = {};
  
  // Group suggestions by file
  for (const suggestion of suggestions) {
    if (!fileGroups[suggestion.filePath]) {
      fileGroups[suggestion.filePath] = [];
    }
    fileGroups[suggestion.filePath].push(suggestion);
  }
  
  // Apply suggestions to each file
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const [filePath, fileSuggestions] of Object.entries(fileGroups)) {
    console.log(`\n🔧 Fixing ${filePath}...`);
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Sort suggestions by line number (descending) to avoid line number shifts
      fileSuggestions.sort((a, b) => b.line - a.line);
      
      let changesApplied = 0;
      for (const suggestion of fileSuggestions) {
        const lineIndex = suggestion.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const originalLine = lines[lineIndex];
          const fixedLine = originalLine.replace(suggestion.brokenLink, suggestion.suggestedLink);
          
          if (originalLine !== fixedLine) {
            lines[lineIndex] = fixedLine;
            changesApplied++;
            console.log(`  ✅ Line ${suggestion.line}: ${suggestion.brokenLink} → ${suggestion.suggestedLink}`);
          }
        }
      }
      
      if (changesApplied > 0) {
        writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log(`  📝 Applied ${changesApplied} fixes to ${filePath}`);
        totalChanges += changesApplied;
        filesChanged++;
      } else {
        console.log(`  ℹ️  No changes needed for ${filePath}`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }
  
  return { totalChanges, filesChanged };
}

// Main function
function main() {
  console.log('🔍 Running documentation validation to get suggestions...');
  
  try {
    // Run validation and capture output
    const { execSync } = await import('child_process');
    const output = execSync('pnpm docs:validate 2>&1', { 
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    console.log('📋 Parsing validation output for suggestions...');
    const suggestions = parseValidationOutput(output);
    
    if (suggestions.length === 0) {
      console.log('✅ No suggestions found - all links are valid!');
      return;
    }
    
    console.log(`🎯 Found ${suggestions.length} suggestions to apply:`);
    
    // Show summary of suggestions
    const uniqueSuggestions = new Map();
    for (const suggestion of suggestions) {
      const key = `${suggestion.brokenLink} → ${suggestion.suggestedLink}`;
      if (!uniqueSuggestions.has(key)) {
        uniqueSuggestions.set(key, 0);
      }
      uniqueSuggestions.set(key, uniqueSuggestions.get(key) + 1);
    }
    
    for (const [suggestion, count] of uniqueSuggestions) {
      console.log(`  ${suggestion} (${count} occurrences)`);
    }
    
    // Apply suggestions
    const { totalChanges, filesChanged } = applySuggestions(suggestions);
    
    console.log(`\n✅ Auto-fix completed!`);
    console.log(`📝 Applied ${totalChanges} fixes across ${filesChanged} files`);
    console.log('🔍 Run "pnpm docs:validate" again to verify fixes.');
    
  } catch (error) {
    console.error('❌ Error running validation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
