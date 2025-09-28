#!/usr/bin/env node

/**
 * Fix Missing Headings Script
 * 
 * This script addresses missing heading errors/warnings by:
 * 1. Analyzing validation output to identify missing heading patterns
 * 2. Creating a mapping of incorrect heading references to correct ones
 * 3. Automatically fixing the references in markdown files
 * 4. Validating the fixes
 */

import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'
import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { visit } from 'unist-util-visit'

// Common heading reference corrections
const HEADING_CORRECTIONS = {
  // Hyphenation fixes
  'longterm-solutions': 'long-term-solutions',
  'longterm-enhancements': 'long-term-enhancements',
  'longterm-strategy': 'long-term-strategy',
  'longterm-benefits': 'long-term-benefits',
  'providerspecific-issues': 'provider-specific-issues',
  'sidebyside-conceptual-diffs': 'side-by-side-conceptual-diffs',
  'orchestratorsubtask-flow': 'orchestrator-subtask-flow',
  'security-authentication': 'security--authentication',
  'kilo-vs-roo-comparison-subtask-resume-orchestrator-continuation': 'kilo-vs-roo-comparison-subtask-resume--orchestrator-continuation',
  'branch-analysis-catrielmullerorchestatorloadsubtask': 'branch-analysis-catrielmullerorchestator-load-subtask',
  'crossreference-strategy': 'cross-reference-strategy',
  'crossreference-validation': 'cross-reference-validation',
  
  // Number formatting fixes
  '11-tasklevel-request-tracker': '11-task-level-request-tracker',
  'phase-1-immediate-fixes-week-12': 'phase-1-immediate-fixes-week-1-2',
  'phase-1-analysis-and-planning-week-12': 'phase-1-analysis-and-planning-week-1-2',
  'phase-2-content-consolidation-week-36': 'phase-2-content-consolidation-week-3-6',
  'phase-3-longterm-enhancements-month-23': 'phase-3-long-term-enhancements-month-2-3',
  'phase-3-quality-assurance-week-78': 'phase-3-quality-assurance-week-7-8',
  'phase-4-deployment-and-monitoring-week-910': 'phase-4-deployment-and-monitoring-week-9-10',
  
  // Task numbering fixes
  '2-task-wrap-recursion-in-arbiteraware-executor': '2-task-wrap-recursion-in-arbiter-aware-executor',
  '4-executor-idempotent-recursion-parent-init-intent': '4-executor-idempotent-recursion--parent-init-intent',
  
  // Research context fixes
  '-research-context-next-steps': '-research-context--next-steps',
  
  // Special cases
  'changes-before-after': 'changes-before--after',
  'change-1-': 'change-1',
  'cleanup-proposal-replace-': 'cleanup-proposal-replace'
}

// Common file path corrections
const FILE_PATH_CORRECTIONS = {
  '../../../GLOSSARY.md': '../../GLOSSARY.md',
  '../testing/TESTING_STRATEGY.md': '../../testing/TESTING_STRATEGY.md',
  '../tools/TROUBLESHOOTING_GUIDE.md': '../../tools/TROUBLESHOOTING_GUIDE.md'
}

/**
 * Parse validation output to extract missing heading patterns
 */
async function parseValidationOutput() {
  try {
    const output = await fs.readFile('docs_validate_heading_analysis.log', 'utf8')
    const missingHeadings = new Set()
    const missingFiles = new Set()
    
    const lines = output.split('\n')
    for (const line of lines) {
      // Extract missing heading patterns
      const headingMatch = line.match(/Cannot find heading for `#([^`]+)`/)
      if (headingMatch) {
        const heading = headingMatch[1]
        missingHeadings.add(heading)
        
        // Check if there's a suggestion
        const suggestionMatch = line.match(/did you mean `([^`]+)`/)
        if (suggestionMatch) {
          HEADING_CORRECTIONS[heading] = suggestionMatch[1]
        }
      }
      
      // Extract missing file patterns
      const fileMatch = line.match(/Cannot find file `([^`]+)`/)
      if (fileMatch) {
        const file = fileMatch[1]
        missingFiles.add(file)
        
        // Check if there's a suggestion
        const suggestionMatch = line.match(/did you mean `([^`]+)`/)
        if (suggestionMatch) {
          FILE_PATH_CORRECTIONS[file] = suggestionMatch[1]
        }
      }
    }
    
    console.log(`📊 Analysis Results:`)
    console.log(`  - Missing headings: ${missingHeadings.size}`)
    console.log(`  - Missing files: ${missingFiles.size}`)
    console.log(`  - Heading corrections: ${Object.keys(HEADING_CORRECTIONS).length}`)
    console.log(`  - File corrections: ${Object.keys(FILE_PATH_CORRECTIONS).length}`)
    
    return { missingHeadings, missingFiles }
  } catch (error) {
    console.error('❌ Error parsing validation output:', error.message)
    return { missingHeadings: new Set(), missingFiles: new Set() }
  }
}

/**
 * Fix heading references in markdown files
 */
async function fixHeadingReferences(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    let updatedContent = content
    let changes = 0
    
    // Fix heading references
    for (const [incorrect, correct] of Object.entries(HEADING_CORRECTIONS)) {
      const pattern = new RegExp(`#${incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')
      const matches = updatedContent.match(pattern)
      if (matches) {
        updatedContent = updatedContent.replace(pattern, `#${correct}`)
        changes += matches.length
      }
    }
    
    // Fix file path references
    for (const [incorrect, correct] of Object.entries(FILE_PATH_CORRECTIONS)) {
      const pattern = new RegExp(incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const matches = updatedContent.match(pattern)
      if (matches) {
        updatedContent = updatedContent.replace(pattern, correct)
        changes += matches.length
      }
    }
    
    if (changes > 0) {
      await fs.writeFile(filePath, updatedContent, 'utf8')
      console.log(`  ✅ Fixed ${changes} references in ${path.basename(filePath)}`)
      return changes
    }
    
    return 0
  } catch (error) {
    console.error(`❌ Error fixing references in ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Process all markdown files
 */
async function processAllMarkdownFiles() {
  try {
    const files = await glob('docs/**/*.md', { cwd: process.cwd() })
    console.log(`\n🔧 Processing ${files.length} markdown files...`)
    
    let totalChanges = 0
    let filesChanged = 0
    
    for (const file of files) {
      const changes = await fixHeadingReferences(file)
      if (changes > 0) {
        totalChanges += changes
        filesChanged++
      }
    }
    
    console.log(`\n📈 Fix Results:`)
    console.log(`  - Files processed: ${files.length}`)
    console.log(`  - Files changed: ${filesChanged}`)
    console.log(`  - Total references fixed: ${totalChanges}`)
    
    return { filesProcessed: files.length, filesChanged, totalChanges }
  } catch (error) {
    console.error('❌ Error processing markdown files:', error.message)
    return { filesProcessed: 0, filesChanged: 0, totalChanges: 0 }
  }
}

/**
 * Validate the fixes by running validation again
 */
async function validateFixes() {
  console.log('\n🔍 Validating fixes...')
  
  try {
    const { execSync } = await import('child_process')
    execSync('pnpm docs:validate > docs_validate_after_fixes.log 2>&1', { stdio: 'inherit' })
    
    // Check if fixes reduced the number of missing heading errors
    const beforeContent = await fs.readFile('docs_validate_heading_analysis.log', 'utf8')
    const afterContent = await fs.readFile('docs_validate_after_fixes.log', 'utf8')
    
    const beforeMissingHeadings = (beforeContent.match(/missing-heading/g) || []).length
    const afterMissingHeadings = (afterContent.match(/missing-heading/g) || []).length
    
    const improvement = beforeMissingHeadings - afterMissingHeadings
    const improvementPercent = ((improvement / beforeMissingHeadings) * 100).toFixed(1)
    
    console.log(`\n📊 Validation Results:`)
    console.log(`  - Missing heading errors before: ${beforeMissingHeadings}`)
    console.log(`  - Missing heading errors after: ${afterMissingHeadings}`)
    console.log(`  - Improvement: ${improvement} errors (${improvementPercent}%)`)
    
    if (improvement > 0) {
      console.log(`\n✅ Successfully reduced missing heading errors by ${improvement} (${improvementPercent}%)`)
    } else {
      console.log(`\n⚠️  No improvement detected. May need manual review.`)
    }
    
    return { beforeMissingHeadings, afterMissingHeadings, improvement, improvementPercent }
  } catch (error) {
    console.error('❌ Error validating fixes:', error.message)
    return { beforeMissingHeadings: 0, afterMissingHeadings: 0, improvement: 0, improvementPercent: '0' }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Missing Headings Fix Process...\n')
  
  // Step 1: Parse validation output
  console.log('📋 Step 1: Parsing validation output...')
  const analysis = await parseValidationOutput()
  
  // Step 2: Process markdown files
  console.log('\n🔧 Step 2: Fixing references in markdown files...')
  const results = await processAllMarkdownFiles()
  
  // Step 3: Validate fixes
  console.log('\n✅ Step 3: Validating fixes...')
  const validation = await validateFixes()
  
  // Summary
  console.log('\n🎉 Missing Headings Fix Process Complete!')
  console.log(`\n📈 Summary:`)
  console.log(`  - Files processed: ${results.filesProcessed}`)
  console.log(`  - Files changed: ${results.filesChanged}`)
  console.log(`  - References fixed: ${results.totalChanges}`)
  console.log(`  - Missing heading errors reduced: ${validation.improvement} (${validation.improvementPercent}%)`)
  
  if (validation.improvement > 0) {
    console.log('\n✅ Success! Missing heading errors have been reduced.')
  } else {
    console.log('\n⚠️  Manual review may be needed for remaining issues.')
  }
}

// Run the script
main().catch(console.error)
