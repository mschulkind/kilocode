#!/usr/bin/env node

/**
 * Test Runner for KiloCode Documentation Fixer
 * 
 * Runs the comprehensive test suite and provides detailed reporting.
 */

import { runTests } from './docs-fixer.test.js';

async function main() {
  const args = process.argv.slice(2);
  const watch = args.includes('--watch');
  
  console.log('🚀 KiloCode Documentation Fixer Test Runner\n');
  
  try {
    await runTests();
    
    if (watch) {
      console.log('\n👀 Watching for changes... (Press Ctrl+C to stop)');
      // In a real implementation, you'd use a file watcher here
    }
    
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
