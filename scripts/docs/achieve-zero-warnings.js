#!/usr/bin/env node

/**
 * Achieve Zero Warnings Script
 * 
 * This script addresses remaining validation issues to achieve zero warnings baseline by:
 * 1. Analyzing current validation output for remaining issues
 * 2. Categorizing issues by type and priority
 * 3. Implementing automated fixes for common patterns
 * 4. Creating targeted solutions for specific issues
 * 5. Validating the fixes and measuring progress
 */

import fs from 'fs/promises'
import { execSync } from 'child_process'
import { glob } from 'glob'

// Issue categorization
const ISSUE_CATEGORIES = {
  missingFile: {
    pattern: /Cannot find file `([^`]+)`/,
    priority: 'high',
    description: 'Missing file references'
  },
  missingHeading: {
    pattern: /Cannot find heading for `#([^`]+)`/,
    priority: 'medium',
    description: 'Missing heading references'
  },
  descriptiveLinks: {
    pattern: /Link has no descriptive text/,
    priority: 'high',
    description: 'Links without descriptive text'
  },
  listItemBulletIndent: {
    pattern: /list-item-bullet-indent/,
    priority: 'low',
    description: 'List item bullet indentation'
  },
  listItemIndent: {
    pattern: /list-item-indent/,
    priority: 'low',
    description: 'List item indentation'
  }
}

// Common fixes for different issue types
const COMMON_FIXES = {
  // Remove template placeholder links
  templatePlaceholders: [
    'related-doc.md',
    'resources.md',
    'related-topic'
  ],
  
  // Common path corrections
  pathCorrections: {
    '../../../tools/TROUBLESHOOTING_GUIDE.md': '../tools/TROUBLESHOOTING_GUIDE.md',
    '../../../testing/TESTING_STRATEGY.md': '../testing/TESTING_STRATEGY.md',
    '../GLOSSARY.md': 'GLOSSARY.md',
    'architecture/README.md': '../architecture/README.md',
    'GLOSSARY.md': '../GLOSSARY.md'
  },
  
  // Common heading corrections
  headingCorrections: {
    'highlevel-flow': 'high-level-flow',
    'builtin-performance-monitor': 'built-in-performance-monitor',
    'systemlevel-optimization': 'system-level-optimization',
    'builtin-remarklint-plugins': 'built-in-remark-lint-plugins',
    'builtin-plugins': 'built-in-plugins',
    'enhanced-crossreference-validation': 'enhanced-cross-reference-validation',
    'contextaware-orphaned-sections-detection': 'context-aware-orphaned-sections-detection',
    'architecture-design': 'architecture--design',
    'critical-issues-analysis': 'critical-issues--analysis',
    'standards-guidelines': 'standards--guidelines',
    'immediate-priorities-week-12': 'immediate-priorities-week-1-2',
    'strategic-initiatives-month-13': 'strategic-initiatives-month-1-3',
    'longterm-goals-quarter-12': 'long-term-goals-quarter-1-2',
    'planning-tracking': 'planning--tracking',
    'crossfile-consistency-checks': 'cross-file-consistency-checks',
    'kilocodespecific-remark-setup': 'kilocode-specific-remark-setup',
    'kilocodespecific-recommendations': 'kilocode-specific-recommendations',
    'githubspecific-considerations': 'github-specific-considerations',
    'doctodoc-links': 'doc-to-doc-links',
    'relative-paths-doctodoc': 'relative-paths-doc-to-doc',
    'file-directory-conventions-': 'file--directory-conventions-',
    'research-context-next-steps': 'research-context--next-steps',
    'documentation-automation-tooling-options': 'documentation-automation--tooling-options',
    'goals-scope': 'goals--scope',
    'mkdocs-vs-remark-comparison-integration': 'mkdocs-vs-remark-comparison--integration',
    'phase-1-foundation-week-12': 'phase-1-foundation-week-1-2',
    'phase-2-standards-enforcement-week-34': 'phase-2-standards-enforcement-week-3-4',
    'phase-3-advanced-automation-week-56': 'phase-3-advanced-automation-week-5-6',
    'phase-4-optimization-week-78': 'phase-4-optimization-week-7-8',
    '-navigation-guide': '️-navigation-guide',
    '-crossreferences': '-cross-references',
    '-navigation-map': '️-navigation-map',
    'how-linter-names-make-it-to-the-': 'how-linter-names-make-it-to-the',
    'a-': 'a',
    'b-': 'b'
  }
}

/**
 * Run validation and capture output
 */
async function runValidation() {
  console.log('🔍 Running validation to analyze current issues...')
  
  try {
    const output = execSync('pnpm docs:validate', { 
      timeout: 300000,
      encoding: 'utf8'
    })
    return output
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    return ''
  }
}

/**
 * Analyze validation output and categorize issues
 */
function analyzeIssues(validationOutput) {
  console.log('📊 Analyzing validation output...')
  
  const issues = {
    byCategory: {},
    byFile: {},
    total: 0,
    errors: 0,
    warnings: 0
  }
  
  const lines = validationOutput.split('\n')
  
  for (const line of lines) {
    // Extract file path
    const fileMatch = line.match(/^\[4m\[33m([^\]]+)\[39m\[24m$/)
    if (fileMatch) {
      currentFile = fileMatch[1]
      if (!issues.byFile[currentFile]) {
        issues.byFile[currentFile] = []
      }
      continue
    }
    
    // Extract issue details
    const issueMatch = line.match(/(\d+):(\d+)-(\d+):(\d+)\s+\[33m(warning|error)\[39m\s+\[1m(.+?)\[22m\s+([^\s]+)\s+([^\s]+)/)
    if (issueMatch) {
      const [, lineNum, colStart, colEnd, colEnd2, severity, message, rule, source] = issueMatch
      
      const issue = {
        file: currentFile,
        line: parseInt(lineNum),
        column: parseInt(colStart),
        severity,
        message: message.trim(),
        rule,
        source,
        category: categorizeIssue(message, rule)
      }
      
      // Add to category
      if (!issues.byCategory[issue.category]) {
        issues.byCategory[issue.category] = []
      }
      issues.byCategory[issue.category].push(issue)
      
      // Add to file
      if (currentFile) {
        issues.byFile[currentFile].push(issue)
      }
      
      issues.total++
      if (severity === 'error') issues.errors++
      else issues.warnings++
    }
  }
  
  return issues
}

/**
 * Categorize issue based on message and rule
 */
function categorizeIssue(message, rule) {
  for (const [category, config] of Object.entries(ISSUE_CATEGORIES)) {
    if (config.pattern.test(message) || config.pattern.test(rule)) {
      return category
    }
  }
  return 'other'
}

/**
 * Fix template placeholder links
 */
async function fixTemplatePlaceholders(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    let updatedContent = content
    let changes = 0
    
    // Remove template placeholder links
    for (const placeholder of COMMON_FIXES.templatePlaceholders) {
      const pattern = new RegExp(`\\[([^\\]]+)\\]\\(${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g')
      const matches = updatedContent.match(pattern)
      if (matches) {
        updatedContent = updatedContent.replace(pattern, '$1')
        changes += matches.length
      }
    }
    
    if (changes > 0) {
      await fs.writeFile(filePath, updatedContent, 'utf8')
      console.log(`  ✅ Fixed ${changes} template placeholders in ${path.basename(filePath)}`)
      return changes
    }
    
    return 0
  } catch (error) {
    console.error(`❌ Error fixing template placeholders in ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Fix file path references
 */
async function fixFilePathReferences(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    let updatedContent = content
    let changes = 0
    
    // Fix file path references
    for (const [incorrect, correct] of Object.entries(COMMON_FIXES.pathCorrections)) {
      const pattern = new RegExp(incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const matches = updatedContent.match(pattern)
      if (matches) {
        updatedContent = updatedContent.replace(pattern, correct)
        changes += matches.length
      }
    }
    
    if (changes > 0) {
      await fs.writeFile(filePath, updatedContent, 'utf8')
      console.log(`  ✅ Fixed ${changes} file path references in ${path.basename(filePath)}`)
      return changes
    }
    
    return 0
  } catch (error) {
    console.error(`❌ Error fixing file path references in ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Fix heading references
 */
async function fixHeadingReferences(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    let updatedContent = content
    let changes = 0
    
    // Fix heading references
    for (const [incorrect, correct] of Object.entries(COMMON_FIXES.headingCorrections)) {
      const pattern = new RegExp(`#${incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')
      const matches = updatedContent.match(pattern)
      if (matches) {
        updatedContent = updatedContent.replace(pattern, `#${correct}`)
        changes += matches.length
      }
    }
    
    if (changes > 0) {
      await fs.writeFile(filePath, updatedContent, 'utf8')
      console.log(`  ✅ Fixed ${changes} heading references in ${path.basename(filePath)}`)
      return changes
    }
    
    return 0
  } catch (error) {
    console.error(`❌ Error fixing heading references in ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Process all markdown files with fixes
 */
async function processAllFiles() {
  console.log('🔧 Processing all markdown files...')
  
  const files = await glob('docs/**/*.md', { cwd: process.cwd() })
  let totalChanges = 0
  let filesChanged = 0
  
  for (const file of files) {
    let fileChanges = 0
    
    // Apply all fixes
    fileChanges += await fixTemplatePlaceholders(file)
    fileChanges += await fixFilePathReferences(file)
    fileChanges += await fixHeadingReferences(file)
    
    if (fileChanges > 0) {
      totalChanges += fileChanges
      filesChanged++
    }
  }
  
  console.log(`\n📈 Fix Results:`)
  console.log(`  - Files processed: ${files.length}`)
  console.log(`  - Files changed: ${filesChanged}`)
  console.log(`  - Total fixes applied: ${totalChanges}`)
  
  return { filesProcessed: files.length, filesChanged, totalChanges }
}

/**
 * Generate progress report
 */
async function generateProgressReport(issues, fixResults) {
  console.log('📋 Generating progress report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: issues.total,
      errors: issues.errors,
      warnings: issues.warnings,
      issuesByCategory: Object.keys(issues.byCategory).map(category => ({
        category,
        count: issues.byCategory[category].length,
        priority: ISSUE_CATEGORIES[category]?.priority || 'unknown'
      }))
    },
    detailed: {
      byCategory: issues.byCategory,
      byFile: issues.byFile
    },
    fixes: fixResults,
    recommendations: generateRecommendations(issues)
  }
  
  // Save report to file
  await fs.writeFile(
    'scripts/docs/zero-warnings-progress.json',
    JSON.stringify(report, null, 2),
    'utf8'
  )
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(report)
  await fs.writeFile(
    'docs/tools/ZERO_WARNINGS_PROGRESS.md',
    markdownReport,
    'utf8'
  )
  
  console.log('✅ Progress report generated')
  return report
}

/**
 * Generate recommendations based on issues
 */
function generateRecommendations(issues) {
  const recommendations = []
  
  // High priority issues
  const highPriorityIssues = Object.entries(issues.byCategory)
    .filter(([category, issueList]) => ISSUE_CATEGORIES[category]?.priority === 'high')
    .flatMap(([, issueList]) => issueList)
  
  if (highPriorityIssues.length > 0) {
    recommendations.push({
      type: 'high-priority',
      count: highPriorityIssues.length,
      description: 'Address high-priority issues first',
      action: 'Focus on missing files and descriptive links'
    })
  }
  
  // Missing file issues
  if (issues.byCategory.missingFile && issues.byCategory.missingFile.length > 0) {
    recommendations.push({
      type: 'missing-files',
      count: issues.byCategory.missingFile.length,
      description: 'Create or fix missing file references',
      action: 'Create placeholder files or correct path references'
    })
  }
  
  // Missing heading issues
  if (issues.byCategory.missingHeading && issues.byCategory.missingHeading.length > 0) {
    recommendations.push({
      type: 'missing-headings',
      count: issues.byCategory.missingHeading.length,
      description: 'Fix missing heading references',
      action: 'Update heading references to match actual headings'
    })
  }
  
  return recommendations
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  return `# Zero Warnings Progress Report

> **Quality Fun Fact**: Like a well-maintained garden, good documentation requires regular attention, proper care, and systematic improvement! 🌱

## When You're Here

This document tracks progress toward achieving zero warnings and errors in the documentation validation system.

- **Purpose**: This document shows current validation status and progress toward zero warnings.
- **Context**: Use this as a reference while working toward zero warnings baseline.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Zero Warnings Progress Report](#zero-warnings-progress-report)
- [Summary](#summary)
- [Issue Breakdown](#issue-breakdown)
- [Fix Results](#fix-results)
- [Recommendations](#recommendations)
- [Navigation](#navigation)

## Summary

### Current Status (${report.timestamp})

| Metric | Count | Status |
|--------|-------|--------|
| **Total Issues** | ${report.summary.totalIssues} | ${report.summary.totalIssues === 0 ? '✅ Zero Warnings Achieved!' : '⚠️ Work in Progress'} |
| **Errors** | ${report.summary.errors} | ${report.summary.errors === 0 ? '✅ No Errors' : '❌ Needs Attention'} |
| **Warnings** | ${report.summary.warnings} | ${report.summary.warnings === 0 ? '✅ No Warnings' : '⚠️ Needs Attention'} |

## Issue Breakdown

### Issues by Category

${report.summary.issuesByCategory.map(category => `
#### ${category.category} (${category.priority.toUpperCase()} Priority)
- **Count**: ${category.count}
- **Priority**: ${category.priority}
`).join('\n')}

## Fix Results

- **Files Processed**: ${report.fixes.filesProcessed}
- **Files Changed**: ${report.fixes.filesChanged}
- **Total Fixes Applied**: ${report.fixes.totalChanges}

## Recommendations

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.description}

**Type**: ${rec.type}  
**Count**: ${rec.count}  
**Action**: ${rec.action}
`).join('\n')}

## Navigation

- **Navigation**: [← Back to Documentation Tools](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#zero-warnings-progress-report)
`
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Zero Warnings Achievement Process...\n')
  
  // Step 1: Run validation to get current issues
  console.log('🔍 Step 1: Analyzing current validation issues...')
  const validationOutput = await runValidation()
  
  // Step 2: Analyze issues
  console.log('\n📊 Step 2: Categorizing issues...')
  const issues = analyzeIssues(validationOutput)
  
  console.log(`\n📈 Current Status:`)
  console.log(`  - Total issues: ${issues.total}`)
  console.log(`  - Errors: ${issues.errors}`)
  console.log(`  - Warnings: ${issues.warnings}`)
  console.log(`  - Categories: ${Object.keys(issues.byCategory).length}`)
  
  // Step 3: Apply fixes
  console.log('\n🔧 Step 3: Applying automated fixes...')
  const fixResults = await processAllFiles()
  
  // Step 4: Generate progress report
  console.log('\n📋 Step 4: Generating progress report...')
  const report = await generateProgressReport(issues, fixResults)
  
  // Summary
  console.log('\n🎉 Zero Warnings Achievement Process Complete!')
  console.log(`\n📈 Summary:`)
  console.log(`  - Total issues identified: ${issues.total}`)
  console.log(`  - Fixes applied: ${fixResults.totalChanges}`)
  console.log(`  - Files changed: ${fixResults.filesChanged}`)
  console.log(`  - Recommendations: ${report.recommendations.length}`)
  
  if (issues.total === 0) {
    console.log('\n🎉 Congratulations! Zero warnings achieved!')
  } else {
    console.log(`\n⚠️  ${issues.total} issues remaining - see report for details`)
  }
}

// Global variable for current file tracking
let currentFile = ''

// Run the script
main().catch(console.error)
