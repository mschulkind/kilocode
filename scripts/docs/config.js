#!/usr/bin/env node

/**
 * Centralized Documentation Configuration
 * 
 * This file defines the file patterns and commands used across all
 * documentation automation tools to ensure consistency and prevent divergence.
 */

export const DOCS_CONFIG = {
  // File patterns for documentation processing
  patterns: {
    // Main documentation files
    markdown: "docs/**/*.md",
    // Include MDX files if needed
    markdownExtended: ["docs/**/*.md", "docs/**/*.mdx"],
    // Exclude patterns
    exclude: ["!node_modules/**", "!.git/**", "!dist/**", "!build/**"],
    // Combined include pattern
    include: ["docs/**/*.md", "!node_modules/**", "!.git/**", "!dist/**", "!build/**"]
  },
  
  // Directory paths
  directories: {
    docs: "docs",
    output: "scripts/docs-fixes/output",
    reports: "reports",
    feedback: "feedback"
  },
  
  // Command definitions that match package.json scripts
  commands: {
    validate: "remark docs/",
    fix: "node scripts/docs-fixer.js --validate",
    fixDry: "node scripts/docs-fixer.js --dry-run --verbose",
    fixLegacy: "node scripts/docs/prettier-markdown-formatter.js docs/ && remark docs/ --output",
    format: "node scripts/docs/prettier-markdown-formatter.js docs/",
    maintain: "node scripts/docs/maintain-docs.js",
    report: "node scripts/docs/validation-report.js",
    metrics: "node scripts/docs/metrics.js",
    performance: "node scripts/docs/performance-monitor.js",
    benchmark: "node scripts/docs/performance-monitor.js benchmark"
  },
  
  // File size limits
  limits: {
    maxFileSize: 1024 * 1024, // 1MB
    maxFiles: 1000
  },
  
  // Timeout settings for long-running operations
  timeouts: {
    validation: 60000, // 60 seconds
    metrics: 30000,    // 30 seconds
    performance: 30000, // 30 seconds
    report: 60000      // 60 seconds
  }
};

export default DOCS_CONFIG;
