#!/usr/bin/env node

/**
 * Fix Placeholder Links Script
 * 
 * Fixes broken placeholder links in documentation files by:
 * - Removing or replacing broken placeholder links
 * - Fixing references to non-existent files/directories
 */

import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'

const CONFIG = {
  docsRoot: path.join(process.cwd(), 'docs'),
  placeholderPatterns: [
    // Common placeholder patterns
    /\[.*\]\(\.\.\/category\/?\)/g,
    /\[.*\]\(\.\.\/resources\/?\)/g,
    /\[.*\]\(\.\/related-doc-\d+\.md\)/g,
    /\[.*\]\(\.\.\/tools\/resources\.md\)/g,
    /\[.*\]\(\.\.\/tools\/related-doc\.md\)/g,
    /\[.*\]\(\.\.\/architecture\/architecture\)/g,
  ]
}

class PlaceholderLinksFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      linksFixed: 0,
      errors: 0
    }
  }

  async run() {
    console.log('🔧 Fixing placeholder links in documentation files...')
    
    try {
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
      console.error('❌ Error during placeholder link fixing:', error)
      this.stats.errors++
    }
  }

  async findMarkdownFiles() {
    const pattern = path.join(CONFIG.docsRoot, '**/*.md')
    return await glob(pattern)
  }

  async processFile(filePath) {
    try {
      this.stats.filesProcessed++
      
      const content = await fs.readFile(filePath, 'utf8')
      const modifiedContent = this.fixPlaceholderLinks(content)
      
      if (modifiedContent !== content) {
        await fs.writeFile(filePath, modifiedContent)
        this.stats.filesModified++
        const relativePath = path.relative(CONFIG.docsRoot, filePath)
        console.log(`✅ Fixed placeholder links in ${relativePath}`)
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      this.stats.errors++
    }
  }

  fixPlaceholderLinks(content) {
    let modified = content
    let linksFixed = 0

    // Fix common placeholder patterns
    const fixes = [
      {
        pattern: /\[Category Overview\]\(\.\.\/category\/?\)/g,
        replacement: '[Documentation Structure](../architecture/README.md)'
      },
      {
        pattern: /\[Related Resources\]\(\.\.\/resources\/?\)/g,
        replacement: '[Additional Resources](../tools/README.md)'
      },
      {
        pattern: /\[.*\]\(\.\/related-doc-\d+\.md\)/g,
        replacement: '[Related Documentation](../README.md)'
      },
      {
        pattern: /\[.*\]\(\.\.\/tools\/resources\.md\)/g,
        replacement: '[Tools Documentation](../tools/README.md)'
      },
      {
        pattern: /\[.*\]\(\.\.\/tools\/related-doc\.md\)/g,
        replacement: '[Tools Documentation](../tools/README.md)'
      },
      {
        pattern: /\[.*\]\(\.\.\/architecture\/architecture\)/g,
        replacement: '[Architecture Documentation](../architecture/README.md)'
      },
      {
        pattern: /\[.*\]\(\.\.\/laminar\/src\/core\/task\/Task\.ts\)/g,
        replacement: '[Laminar Task System](../laminar/LAMINAR_TASK_SYSTEM.md)'
      }
    ]

    for (const fix of fixes) {
      const matches = modified.match(fix.pattern)
      if (matches) {
        modified = modified.replace(fix.pattern, fix.replacement)
        linksFixed += matches.length
      }
    }

    // Remove empty list items that might be left after fixing links
    modified = modified.replace(/^\s*-\s*\[.*\]\(.*\)\s*-\s*\\\[.*\]\s*$/gm, '')
    
    // Clean up extra whitespace
    modified = modified.replace(/\n{3,}/g, '\n\n')

    if (linksFixed > 0) {
      this.stats.linksFixed += linksFixed
    }

    return modified
  }

  reportResults() {
    console.log('\n🔧 Placeholder Links Fix Results:')
    console.log(`   Files processed: ${this.stats.filesProcessed}`)
    console.log(`   Files modified: ${this.stats.filesModified}`)
    console.log(`   Links fixed: ${this.stats.linksFixed}`)
    console.log(`   Errors: ${this.stats.errors}`)
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Some errors occurred during processing. Check the logs above.')
    } else {
      console.log('\n✅ Placeholder links fixed successfully!')
    }
  }
}

// Run the script
const fixer = new PlaceholderLinksFixer()
fixer.run().catch(console.error)
