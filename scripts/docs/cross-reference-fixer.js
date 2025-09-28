#!/usr/bin/env node

/**
 * Cross-Reference Fixer
 * 
 * Automatically fixes broken cross-references in documentation by:
 * 1. Analyzing broken link patterns
 * 2. Finding correct file paths
 * 3. Updating references with correct paths
 * 4. Validating fixes
 */

import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  docsRoot: path.join(__dirname, '../../docs'),
  patterns: {
    markdown: '**/*.md',
    exclude: ['!node_modules/**', '!.git/**']
  },
  maxFileSize: 1024 * 1024, // 1MB
  backupDir: path.join(__dirname, '../../backups')
}

// Common broken link patterns and their fixes
const COMMON_FIXES = {
  // README files
  '../../README.md': '../README.md',
  '../../../README.md': '../../README.md',
  '../README.md': '../README.md',
  
  // Architecture files
  '../architecture/README.md': '../architecture/README.md',
  '../../architecture/README.md': '../architecture/README.md',
  '../architecture/DEVELOPMENT_GUIDE.md': '../architecture/GETTING_STARTED.md',
  '../architecture/TESTING_INFRASTRUCTURE.md': '../testing/TESTING_STRATEGY.md',
  '../architecture/ROOT_CAUSE_ANALYSIS.md': '../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md',
  
  // Orchestrator files
  '../orchestrator/README.md': '../orchestrator/README.md',
  '../../orchestrator/README.md': '../orchestrator/README.md',
  '../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md': '../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md',
  '../../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md': '../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md',
  
  // Glossary files
  '../GLOSSARY.md': '../GLOSSARY.md',
  '../../GLOSSARY.md': '../GLOSSARY.md',
  '../../../GLOSSARY.md': '../../GLOSSARY.md',
  
  // Documentation files
  '../../DOCUMENTATION_GUIDE.md': '../DOCUMENTATION_GUIDE.md',
  
  // Architecture analysis files
  'API_DUPLICATION_DEBUG_IMPLEMENTATION.md': '../architecture/API_DUPLICATION_DEBUG_IMPLEMENTATION.md',
  'API_DUPLICATION_INVESTIGATION_SUMMARY.md': '../architecture/API_DUPLICATION_INVESTIGATION_SUMMARY.md',
  'API_DUPLICATION_RACE_CONDITION_ANALYSIS.md': '../architecture/API_DUPLICATION_RACE_CONDITION_ANALYSIS.md',
  'DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md': '../architecture/DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md',
  
  // Race condition files
  'race-condition/ROOT_CAUSE_ANALYSIS.md': '../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md',
  'race-condition/TESTING_STRATEGY.md': '../architecture/race-condition/TESTING_STRATEGY.md',
  'race-condition/SOLUTION_RECOMMENDATIONS.md': '../architecture/race-condition/SOLUTION_RECOMMENDATIONS.md',
  'race-condition/CODE_FLOW_ANALYSIS.md': '../architecture/race-condition/CODE_FLOW_ANALYSIS.md',
  
  // Source files
  '/src/core/task/Task.ts': '../../src/core/task/Task.ts',
  
  // Orchestrator index
  'ORCHESTRATOR_INDEX.md': '../orchestrator/ORCHESTRATOR_INDEX.md',
  
  // Architecture directories
  '../../architecture/': '../architecture/',
  '../architecture/': '../architecture/',
  
  // API duplication files
  './API_DUPLICATION_DEBUG_IMPLEMENTATION_SHORT.md': '../architecture/API_DUPLICATION_DEBUG_IMPLEMENTATION_SHORT.md',
  './DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md': '../architecture/DUPLICATE_API_REQUESTS_TROUBLESHOOTING_SHORT.md',
  '../../architecture/API_DUPLICATION_RACE_CONDITION_ANALYSIS.md': '../architecture/API_DUPLICATION_RACE_CONDITION_ANALYSIS.md',
  '../../architecture/TESTING_INFRASTRUCTURE.md': '../testing/TESTING_STRATEGY.md',
  '../../architecture/DEVELOPMENT_GUIDE.md': '../architecture/GETTING_STARTED.md'
}

class CrossReferenceFixer {
  constructor() {
    this.fixes = new Map()
    this.stats = {
      filesProcessed: 0,
      linksFixed: 0,
      filesModified: 0,
      errors: 0
    }
  }

  async run() {
    console.log('🔍 Starting cross-reference audit and fix...')
    
    try {
      // Ensure backup directory exists
      await this.ensureBackupDir()
      
      // Find all markdown files
      const files = await this.findMarkdownFiles()
      console.log(`📁 Found ${files.length} markdown files`)
      
      // Process each file
      for (const file of files) {
        await this.processFile(file)
      }
      
      // Report results
      this.reportResults()
      
    } catch (error) {
      console.error('❌ Error during cross-reference fixing:', error)
      this.stats.errors++
    }
  }

  async findMarkdownFiles() {
    const pattern = path.join(CONFIG.docsRoot, CONFIG.patterns.markdown)
    console.log(`🔍 Looking for files matching: ${pattern}`)
    
    const files = await glob(pattern, { 
      ignore: CONFIG.patterns.exclude,
      absolute: true 
    })
    
    console.log(`📁 Found ${files.length} files with glob pattern`)
    
    const filteredFiles = files.filter(file => {
      // Skip if file is too large
      try {
        const stats = fsSync.statSync(file)
        const isValid = stats.size <= CONFIG.maxFileSize
        if (!isValid) {
          console.log(`⚠️  Skipping large file: ${file} (${stats.size} bytes)`)
        }
        return isValid
      } catch (error) {
        console.log(`⚠️  Skipping inaccessible file: ${file} (${error.message})`)
        return false
      }
    })
    
    console.log(`📁 ${filteredFiles.length} files passed filtering`)
    return filteredFiles
  }

  async processFile(filePath) {
    try {
      this.stats.filesProcessed++
      const content = await fs.readFile(filePath, 'utf8')
      const originalContent = content
      
      let modifiedContent = content
      let fileFixes = 0
      
      // Apply common fixes
      for (const [brokenPath, correctPath] of Object.entries(COMMON_FIXES)) {
        const regex = new RegExp(`\\[([^\\]]+)\\]\\(${this.escapeRegex(brokenPath)}\\)`, 'g')
        const matches = modifiedContent.match(regex)
        
        if (matches) {
          modifiedContent = modifiedContent.replace(regex, `[$1](${correctPath})`)
          fileFixes += matches.length
          this.stats.linksFixed += matches.length
        }
      }
      
      // Fix relative path issues
      modifiedContent = this.fixRelativePaths(modifiedContent, filePath)
      
      // Fix anchor links
      modifiedContent = this.fixAnchorLinks(modifiedContent)
      
      // Save file if modified
      if (modifiedContent !== originalContent) {
        await this.backupFile(filePath)
        await fs.writeFile(filePath, modifiedContent, 'utf8')
        this.stats.filesModified++
        console.log(`✅ Fixed ${fileFixes} links in ${path.relative(CONFIG.docsRoot, filePath)}`)
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      this.stats.errors++
    }
  }

  fixRelativePaths(content, filePath) {
    const relativePath = path.relative(CONFIG.docsRoot, filePath)
    const depth = relativePath.split(path.sep).length - 1
    
    // Fix common relative path patterns
    const patterns = [
      { from: /\]\(\/src\//g, to: '](../../src/' },
      { from: /\]\(\/docs\//g, to: '](../' },
      { from: /\]\(\/scripts\//g, to: '](../../scripts/' },
      { from: /\]\(\/plans\//g, to: '](../../plans/' },
      { from: /\]\(\/context\//g, to: '](../../context/' }
    ]
    
    let modified = content
    for (const pattern of patterns) {
      modified = modified.replace(pattern.from, pattern.to)
    }
    
    return modified
  }

  fixAnchorLinks(content) {
    // Fix common anchor link issues
    const patterns = [
      // Fix malformed anchors
      { from: /\]\(#([^)]+)\)/g, to: (match, anchor) => {
        const fixedAnchor = anchor.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        return `](#${fixedAnchor})`
      }}
    ]
    
    let modified = content
    for (const pattern of patterns) {
      if (typeof pattern.to === 'function') {
        modified = modified.replace(pattern.from, pattern.to)
      } else {
        modified = modified.replace(pattern.from, pattern.to)
      }
    }
    
    return modified
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  async backupFile(filePath) {
    const relativePath = path.relative(CONFIG.docsRoot, filePath)
    const backupPath = path.join(CONFIG.backupDir, relativePath)
    const backupDir = path.dirname(backupPath)
    
    await fs.mkdir(backupDir, { recursive: true })
    await fs.copyFile(filePath, backupPath)
  }

  async ensureBackupDir() {
    await fs.mkdir(CONFIG.backupDir, { recursive: true })
  }

  reportResults() {
    console.log('\n📊 Cross-Reference Fix Results:')
    console.log(`   Files processed: ${this.stats.filesProcessed}`)
    console.log(`   Links fixed: ${this.stats.linksFixed}`)
    console.log(`   Files modified: ${this.stats.filesModified}`)
    console.log(`   Errors: ${this.stats.errors}`)
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Some errors occurred during processing. Check the logs above.')
    }
    
    if (this.stats.linksFixed > 0) {
      console.log('\n✅ Cross-reference fixes completed successfully!')
      console.log(`   Backup files created in: ${CONFIG.backupDir}`)
    }
  }
}

// Run the fixer
const fixer = new CrossReferenceFixer()
fixer.run().catch(console.error)
