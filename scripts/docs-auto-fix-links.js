#!/usr/bin/env node

/**
 * Auto-fix script for missing-file suggestions from remark-validate-links
 * 
 * This script parses the validation output and automatically applies the
 * "did you mean" suggestions to fix broken links.
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Parse validation output and extract suggestions
function parseValidationOutput(output) {
  const suggestions = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('did you mean')) {
      // Extract file path, line number, and suggestion
      const match = line.match(/(\d+):(\d+)-(\d+):(\d+).*Cannot find file `([^`]+)`.*did you mean `([^`]+)`/);
      if (match) {
        const [, lineNum, colStart, colEnd, colEnd2, brokenLink, suggestedLink] = match;
        suggestions.push({
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
    const filePath = suggestion.fullLine.split(':')[0];
    if (!fileGroups[filePath]) {
      fileGroups[filePath] = [];
    }
    fileGroups[filePath].push(suggestion);
  }
  
  // Apply suggestions to each file
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
      } else {
        console.log(`  ℹ️  No changes needed for ${filePath}`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }
}

// Main function
function main() {
  console.log('🔍 Running documentation validation to get suggestions...');
  
  try {
    // Run validation and capture output
    const output = execSync('npx remark docs/ --quiet 2>&1', { 
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
    applySuggestions(suggestions);
    
    console.log('\n✅ Auto-fix completed!');
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
