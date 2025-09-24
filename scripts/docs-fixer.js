#!/usr/bin/env node

/**
 * KiloCode Documentation Fixer - Main Entry Point
 * 
 * This is the main entry point for the KiloCode documentation fixer.
 * It provides a simple interface to run the documentation fixing tool
 * from the project root.
 */

import { main } from './docs-fixes/src/docs-fixer.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

// Parse options
for (const arg of args) {
  switch (arg) {
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--verbose':
      options.verbose = true;
      break;
    case '--validate':
      options.validate = true;
      break;
    case '--help':
      console.log(`
KiloCode Documentation Fixer

Usage: node scripts/docs-fixer.js [options]

Options:
  --dry-run    Run without making changes (preview mode)
  --verbose    Show detailed fix information
  --validate   Run validation after fixes
  --help       Show this help message

Examples:
  node scripts/docs-fixer.js --dry-run --verbose
  node scripts/docs-fixer.js --validate

For more information, see: scripts/docs-fixes/README.md
      `);
      process.exit(0);
  }
}

// Run the documentation fixer
main(options).catch(error => {
  console.error('❌ Documentation fixer failed:', error.message);
  process.exit(1);
});
