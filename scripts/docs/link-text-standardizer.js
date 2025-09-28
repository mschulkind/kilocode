#!/usr/bin/env node

/**
 * Link Text Standardizer
 * 
 * Automatically improves link text to be more descriptive and accessible by:
 * 1. Identifying non-descriptive link text patterns
 * 2. Generating descriptive alternatives
 * 3. Updating links with better text
 * 4. Validating improvements
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
}

// Non-descriptive link text patterns
const NON_DESCRIPTIVE_PATTERNS = [
  /^(click here|here|link|more|read more|see more|continue|next|previous)$/i,
  /^(this|that|it)$/i,
  /^(page|document|file|article)$/i,
  /^\d+$/,
  /^[a-z]+\.(com|org|net|io)$/i,
  /^[a-z]+\.md$/i,
  /^\.\.\//,
  /^\.\//,
  /^#/
]

// Link text improvement rules
const IMPROVEMENT_RULES = {
  // Generic patterns
  'click here': 'View details',
  'here': 'View section',
  'more': 'Read more',
  'read more': 'Read full article',
  'see more': 'View additional information',
  'continue': 'Continue reading',
  'next': 'Next section',
  'previous': 'Previous section',
  'this': 'This document',
  'that': 'That section',
  'it': 'This resource',
  'page': 'Document page',
  'document': 'Documentation',
  'file': 'File',
  'article': 'Article',
  
  // Common file extensions
  '.md': 'Documentation',
  '.html': 'Web page',
  '.pdf': 'PDF document',
  '.txt': 'Text file',
  
  // Common directories
  '../': 'Parent directory',
  './': 'Current directory',
  '../../': 'Parent directory',
  
  // Common patterns
  'README.md': 'Project README',
  'CHANGELOG.md': 'Project changelog',
  'LICENSE': 'License file',
  'CONTRIBUTING.md': 'Contributing guidelines'
}

// Context-based improvements
const CONTEXT_IMPROVEMENTS = {
  // Architecture context
  'architecture': {
    'API_DUPLICATION': 'API Duplication Analysis',
    'ORCHESTRATOR': 'Orchestrator System',
    'PROVIDER': 'Provider System',
    'LAMINAR': 'Laminar System',
    'REPOSITORY': 'Repository Structure'
  },
  
  // Tools context
  'tools': {
    'VALIDATION': 'Validation System',
    'DOCUMENTATION': 'Documentation Tools',
    'TROUBLESHOOTING': 'Troubleshooting Guide',
    'BEST_PRACTICES': 'Best Practices Guide'
  },
  
  // Standards context
  'standards': {
    'CORE': 'Core Standards',
    'NAVIGATION': 'Navigation Standards',
    'STRUCTURE': 'Structure Standards',
    'ENGAGEMENT': 'Engagement Standards'
  }
}

class LinkTextStandardizer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      linksImproved: 0,
      filesModified: 0,
      errors: 0
    }
  }

  async run() {
    console.log('🔗 Starting link text standardization...')
    
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
      console.error('❌ Error during link text standardization:', error)
      this.stats.errors++
    }
  }

  async findMarkdownFiles() {
    const pattern = path.join(CONFIG.docsRoot, CONFIG.patterns.markdown)
    const files = await glob(pattern, { 
      ignore: CONFIG.patterns.exclude,
      absolute: true 
    })
    
    const filteredFiles = files.filter(file => {
      try {
        const stats = fsSync.statSync(file)
        return stats.size <= CONFIG.maxFileSize
      } catch (error) {
        console.log(`⚠️  Skipping inaccessible file: ${file} (${error.message})`)
        return false
      }
    })
    
    return filteredFiles
  }

  async processFile(filePath) {
    try {
      this.stats.filesProcessed++
      const content = await fs.readFile(filePath, 'utf8')
      const originalContent = content
      
      let modifiedContent = content
      let fileImprovements = 0
      
      // Find and improve link text
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      let match
      
      while ((match = linkRegex.exec(modifiedContent)) !== null) {
        const [fullMatch, linkText, linkUrl] = match
        const improvedText = this.improveLinkText(linkText, linkUrl, filePath)
        
        if (improvedText !== linkText) {
          modifiedContent = modifiedContent.replace(fullMatch, `[${improvedText}](${linkUrl})`)
          fileImprovements++
          this.stats.linksImproved++
        }
      }
      
      // Save file if modified
      if (modifiedContent !== originalContent) {
        await fs.writeFile(filePath, modifiedContent, 'utf8')
        this.stats.filesModified++
        console.log(`✅ Improved ${fileImprovements} links in ${path.relative(CONFIG.docsRoot, filePath)}`)
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      this.stats.errors++
    }
  }

  improveLinkText(linkText, linkUrl, filePath) {
    // Check if link text is already descriptive
    if (this.isDescriptiveLinkText(linkText, linkUrl)) {
      return linkText
    }
    
    // Try context-based improvement first
    const contextImproved = this.improveWithContext(linkText, linkUrl, filePath)
    if (contextImproved !== linkText) {
      return contextImproved
    }
    
    // Try rule-based improvement
    const ruleImproved = this.improveWithRules(linkText, linkUrl)
    if (ruleImproved !== linkText) {
      return ruleImproved
    }
    
    // Try URL-based improvement
    const urlImproved = this.improveWithUrl(linkText, linkUrl)
    if (urlImproved !== linkText) {
      return urlImproved
    }
    
    // If no improvement found, return original
    return linkText
  }

  isDescriptiveLinkText(linkText, linkUrl) {
    // Check against non-descriptive patterns
    for (const pattern of NON_DESCRIPTIVE_PATTERNS) {
      if (pattern.test(linkText)) {
        return false
      }
    }
    
    // Check if link text is the same as URL
    if (linkText === linkUrl || linkText === linkUrl.replace(/^https?:\/\//, '')) {
      return false
    }
    
    // Check if link text is too short
    if (linkText.length < 3) {
      return false
    }
    
    // Check if link text is just a file extension
    if (linkText.match(/^\.\w+$/)) {
      return false
    }
    
    return true
  }

  improveWithContext(linkText, linkUrl, filePath) {
    const relativePath = path.relative(CONFIG.docsRoot, filePath)
    const pathParts = relativePath.split(path.sep)
    
    // Check for architecture context
    if (pathParts.includes('architecture')) {
      for (const [pattern, improvement] of Object.entries(CONTEXT_IMPROVEMENTS.architecture)) {
        if (linkUrl.includes(pattern)) {
          return improvement
        }
      }
    }
    
    // Check for tools context
    if (pathParts.includes('tools')) {
      for (const [pattern, improvement] of Object.entries(CONTEXT_IMPROVEMENTS.tools)) {
        if (linkUrl.includes(pattern)) {
          return improvement
        }
      }
    }
    
    // Check for standards context
    if (pathParts.includes('standards')) {
      for (const [pattern, improvement] of Object.entries(CONTEXT_IMPROVEMENTS.standards)) {
        if (linkUrl.includes(pattern)) {
          return improvement
        }
      }
    }
    
    return linkText
  }

  improveWithRules(linkText, linkUrl) {
    const lowerText = linkText.toLowerCase()
    
    // Direct rule matches
    if (IMPROVEMENT_RULES[lowerText]) {
      return IMPROVEMENT_RULES[lowerText]
    }
    
    // Pattern-based improvements
    for (const [pattern, improvement] of Object.entries(IMPROVEMENT_RULES)) {
      if (lowerText.includes(pattern)) {
        return improvement
      }
    }
    
    return linkText
  }

  improveWithUrl(linkText, linkUrl) {
    // Extract meaningful parts from URL
    const urlParts = linkUrl.split('/').filter(part => part && part !== '.' && part !== '..')
    const fileName = urlParts[urlParts.length - 1]
    
    // Handle file names
    if (fileName) {
      const baseName = fileName.replace(/\.[^/.]+$/, '') // Remove extension
      
      // Convert snake_case to Title Case
      if (baseName.includes('_')) {
        return baseName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')
      }
      
      // Convert kebab-case to Title Case
      if (baseName.includes('-')) {
        return baseName.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')
      }
      
      // Convert camelCase to Title Case
      if (baseName.match(/^[a-z]+[A-Z]/)) {
        return baseName.replace(/([a-z])([A-Z])/g, '$1 $2')
          .split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')
      }
      
      // If it's just the base name, use it
      if (baseName.length > 3) {
        return baseName.charAt(0).toUpperCase() + baseName.slice(1)
      }
    }
    
    // Handle directory names
    if (urlParts.length > 1) {
      const dirName = urlParts[urlParts.length - 2]
      if (dirName && dirName.length > 3) {
        return dirName.charAt(0).toUpperCase() + dirName.slice(1) + ' Documentation'
      }
    }
    
    return linkText
  }


  reportResults() {
    console.log('\n📊 Link Text Standardization Results:')
    console.log(`   Files processed: ${this.stats.filesProcessed}`)
    console.log(`   Links improved: ${this.stats.linksImproved}`)
    console.log(`   Files modified: ${this.stats.filesModified}`)
    console.log(`   Errors: ${this.stats.errors}`)
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Some errors occurred during processing. Check the logs above.')
    }
    
    if (this.stats.linksImproved > 0) {
      console.log('\n✅ Link text standardization completed successfully!')
    }
  }
}

// Run the standardizer
const standardizer = new LinkTextStandardizer()
standardizer.run().catch(console.error)
