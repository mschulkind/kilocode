#!/usr/bin/env node

/**
 * Add Required Sections Script
 * 
 * Automatically adds missing required sections to documentation files:
 * - "When You're Here" section
 * - "No Dead Ends Policy" section
 */

import { promises as fs } from 'fs'
import fsSync from 'fs'
import path from 'path'
import { glob } from 'glob'

const CONFIG = {
  docsRoot: path.join(process.cwd(), 'docs'),
  reportsDir: path.join(process.cwd(), 'reports')
}

class RequiredSectionsAdder {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      sectionsAdded: 0,
      errors: 0
    }
  }

  async run() {
    console.log('📝 Adding required sections to documentation files...')
    
    try {
      await this.ensureDirectories()
      
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
      console.error('❌ Error during required sections addition:', error)
      this.stats.errors++
    }
  }

  async ensureDirectories() {
    await fs.mkdir(CONFIG.reportsDir, { recursive: true })
  }

  async findMarkdownFiles() {
    const pattern = path.join(CONFIG.docsRoot, '**/*.md')
    const files = await glob(pattern)
    return files.filter(file => {
      // Filter out files that are too large or in excluded directories
      const stat = fsSync.statSync(file)
      return stat.size < 500000 // Skip files larger than 500KB
    })
  }

  async processFile(filePath) {
    try {
      this.stats.filesProcessed++
      
      const content = await fs.readFile(filePath, 'utf8')
      const modifiedContent = this.addMissingSections(content, filePath)
      
      if (modifiedContent !== content) {
        await fs.writeFile(filePath, modifiedContent)
        this.stats.filesModified++
        const relativePath = path.relative(CONFIG.docsRoot, filePath)
        console.log(`✅ Added required sections to ${relativePath}`)
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      this.stats.errors++
    }
  }

  addMissingSections(content, filePath) {
    let modified = content
    let sectionsAdded = 0

    // Check if file needs "When You're Here" section
    if (!this.hasWhenYoureHereSection(content)) {
      modified = this.addWhenYoureHereSection(modified)
      sectionsAdded++
    }

    // Check if file needs "No Dead Ends Policy" section
    if (!this.hasNoDeadEndsPolicy(content)) {
      modified = this.addNoDeadEndsPolicy(modified)
      sectionsAdded++
    }

    if (sectionsAdded > 0) {
      this.stats.sectionsAdded += sectionsAdded
    }

    return modified
  }

  hasWhenYoureHereSection(content) {
    return /^##\s+When You're Here/mi.test(content)
  }

  hasNoDeadEndsPolicy(content) {
    return /^##\s+No Dead Ends Policy/mi.test(content)
  }

  addWhenYoureHereSection(content) {
    // Find the first ## heading after the title and TOC
    const lines = content.split('\n')
    let insertIndex = -1
    let foundTitle = false
    let foundTOC = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Skip the main title (# heading)
      if (line.startsWith('# ') && !foundTitle) {
        foundTitle = true
        continue
      }

      // Skip TOC section
      if (line.startsWith('## Table of Contents') || line.startsWith('## TOC')) {
        foundTOC = true
        continue
      }

      // Find first ## heading after title and TOC
      if (line.startsWith('## ') && foundTitle && !line.includes('Table of Contents') && !line.includes('TOC')) {
        insertIndex = i
        break
      }
    }

    if (insertIndex === -1) {
      // If no suitable location found, add after TOC or title
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('# ')) {
          insertIndex = i + 1
          break
        }
      }
    }

    if (insertIndex !== -1) {
      const whenYoureHereSection = [
        '',
        '## When You\'re Here',
        '',
        'This document is part of the KiloCode project documentation. If you\'re not familiar with this',
        'document\'s role or purpose, this section helps orient you.',
        '',
        '- **Purpose**: [Brief description of what this document covers]',
        '- **Audience**: [Who should read this document]',
        '- **Prerequisites**: [What you should know before reading]',
        '- **Related Documents**: [Links to related documentation]',
        '',
      ]

      lines.splice(insertIndex, 0, ...whenYoureHereSection)
    }

    return lines.join('\n')
  }

  addNoDeadEndsPolicy(content) {
    // Add "No Dead Ends Policy" section near the end of the document
    const lines = content.split('\n')
    
    // Find a good location (before navigation footer if it exists, otherwise at the end)
    let insertIndex = lines.length
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.includes('Navigation') || line.includes('navigation')) {
        insertIndex = i
        break
      }
    }

    const noDeadEndsSection = [
      '',
      '## No Dead Ends Policy',
      '',
      'Every section in this document connects you to your next step:',
      '',
      '- **If you\'re new here**: Start with the [When You\'re Here](#when-youre-here) section',
      '- **If you need context**: Check the [Research Context](#research-context) section',
      '- **If you\'re ready to implement**: Jump to the implementation sections',
      '- **If you\'re stuck**: Visit our [Troubleshooting Guide](../tools/TROUBLESHOOTING_GUIDE.md)',
      '- **If you need help**: Check the [Technical Glossary](../GLOSSARY.md)',
      '',
    ]

    lines.splice(insertIndex, 0, ...noDeadEndsSection)
    return lines.join('\n')
  }

  reportResults() {
    console.log('\n📝 Required Sections Addition Results:')
    console.log(`   Files processed: ${this.stats.filesProcessed}`)
    console.log(`   Files modified: ${this.stats.filesModified}`)
    console.log(`   Sections added: ${this.stats.sectionsAdded}`)
    console.log(`   Errors: ${this.stats.errors}`)
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Some errors occurred during processing. Check the logs above.')
    } else {
      console.log('\n✅ Required sections added successfully!')
    }
  }
}

// Run the script
const adder = new RequiredSectionsAdder()
adder.run().catch(console.error)
