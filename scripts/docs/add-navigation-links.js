#!/usr/bin/env node

/**
 * Add Navigation Links Script
 * 
 * Automatically adds missing navigation links to documentation files:
 * - Technical Glossary links (📚 Technical Glossary)
 * - Table of Contents navigation links (↑ Table of Contents)
 */

import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'

const CONFIG = {
  docsRoot: path.join(process.cwd(), 'docs'),
  reportsDir: path.join(process.cwd(), 'reports')
}

class NavigationLinksAdder {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      glossaryLinksAdded: 0,
      tocLinksAdded: 0,
      errors: 0
    }
  }

  async run() {
    console.log('🧭 Adding missing navigation links to documentation files...')
    
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
      console.error('❌ Error during navigation links addition:', error)
      this.stats.errors++
    }
  }

  async ensureDirectories() {
    await fs.mkdir(CONFIG.reportsDir, { recursive: true })
  }

  async findMarkdownFiles() {
    const pattern = path.join(CONFIG.docsRoot, '**/*.md')
    return await glob(pattern)
  }

  async processFile(filePath) {
    try {
      this.stats.filesProcessed++
      
      const content = await fs.readFile(filePath, 'utf8')
      const modifiedContent = this.addMissingNavigationLinks(content, filePath)
      
      if (modifiedContent !== content) {
        await fs.writeFile(filePath, modifiedContent)
        this.stats.filesModified++
        const relativePath = path.relative(CONFIG.docsRoot, filePath)
        console.log(`✅ Added navigation links to ${relativePath}`)
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      this.stats.errors++
    }
  }

  addMissingNavigationLinks(content, filePath) {
    let modified = content
    let glossaryAdded = false
    let tocAdded = false

    // Check if file needs glossary link
    if (!this.hasGlossaryLink(modified)) {
      modified = this.addGlossaryLink(modified, filePath)
      glossaryAdded = true
      this.stats.glossaryLinksAdded++
    }

    // Check if file needs TOC navigation link (only for files with 3+ headings)
    const headingCount = (modified.match(/^##/gm) || []).length
    if (headingCount >= 3 && !this.hasTOCNavigationLink(modified)) {
      modified = this.addTOCNavigationLink(modified, filePath)
      tocAdded = true
      this.stats.tocLinksAdded++
    }

    return modified
  }

  hasGlossaryLink(content) {
    return /📚.*glossary/i.test(content)
  }

  hasTOCNavigationLink(content) {
    return /↑.*table of contents/i.test(content)
  }

  addGlossaryLink(content, filePath) {
    // Find the best location to add the glossary link
    // Look for existing navigation sections or add to the end
    const lines = content.split('\n')
    
    // Try to find existing navigation section
    let insertIndex = -1
    let foundNavigation = false
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.includes('Navigation') || line.includes('navigation')) {
        // Find the end of this section
        for (let j = i; j < lines.length; j++) {
          if (lines[j].trim() === '' || lines[j].trim().startsWith('##')) {
            insertIndex = j
            foundNavigation = true
            break
          }
        }
        break
      }
    }
    
    if (!foundNavigation) {
      // Add at the end of the document
      insertIndex = lines.length
    }

    const glossaryLink = [
      '',
      '## Navigation',
      '',
      '- 📚 [Technical Glossary](../GLOSSARY.md)',
      ''
    ]

    lines.splice(insertIndex, 0, ...glossaryLink)
    return lines.join('\n')
  }

  addTOCNavigationLink(content, filePath) {
    // Add TOC navigation link in the navigation section
    const lines = content.split('\n')
    
    // Find the navigation section and add the TOC link
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.includes('Navigation') || line.includes('navigation')) {
        // Look for the end of the navigation section
        for (let j = i; j < lines.length; j++) {
          if (lines[j].trim().startsWith('##') && !lines[j].trim().toLowerCase().includes('navigation')) {
            // Insert before the next section
            const tocLink = ['- ↑ [Table of Contents](#table-of-contents)', '']
            lines.splice(j, 0, ...tocLink)
            break
          } else if (lines[j].trim() === '' && j === lines.length - 1) {
            // End of file, add the link
            const tocLink = ['- ↑ [Table of Contents](#table-of-contents)', '']
            lines.splice(j, 0, ...tocLink)
            break
          }
        }
        break
      }
    }

    return lines.join('\n')
  }

  reportResults() {
    console.log('\n🧭 Navigation Links Addition Results:')
    console.log(`   Files processed: ${this.stats.filesProcessed}`)
    console.log(`   Files modified: ${this.stats.filesModified}`)
    console.log(`   Glossary links added: ${this.stats.glossaryLinksAdded}`)
    console.log(`   TOC navigation links added: ${this.stats.tocLinksAdded}`)
    console.log(`   Errors: ${this.stats.errors}`)
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Some errors occurred during processing. Check the logs above.')
    } else {
      console.log('\n✅ Navigation links added successfully!')
    }
  }
}

// Run the script
const adder = new NavigationLinksAdder()
adder.run().catch(console.error)
