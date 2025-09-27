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
const targets = [];

// Parse options and targets
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
\x1b[0;36mKiloCode Documentation Fixer\x1b[0m

\x1b[1;37mUsage:\x1b[0m node scripts/docs-fixer.js [options] [targets...]

\x1b[1;37mOptions:\x1b[0m
  --dry-run    Run without making changes (preview mode)
  --verbose    Show detailed fix information
  --validate   Run validation after fixes
  --help       Show this help message

\x1b[1;37mTargets:\x1b[0m
  [targets...] Specific files or directories to process (default: docs/)

\x1b[1;37mExamples:\x1b[0m
  node scripts/docs-fixer.js --dry-run --verbose
  node scripts/docs-fixer.js --validate
  node scripts/docs-fixer.js docs/architecture/
  node scripts/docs-fixer.js docs/README.md docs/GLOSSARY.md
  node scripts/docs-fixer.js docs/ tools/

For more information, see: scripts/docs-fixes/README.md
      `);
      process.exit(0);
    default:
      // If it doesn't start with --, it's a target
      if (!arg.startsWith('--')) {
        targets.push(arg);
      }
      break;
  }
}

// Set targets in options
options.targets = targets.length > 0 ? targets : ['docs/'];

// Run the documentation fixer
main(options).catch(error => {
  console.error('❌ Documentation fixer failed:', error.message);
  process.exit(1);
});
