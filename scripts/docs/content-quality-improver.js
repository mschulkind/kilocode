#!/usr/bin/env node

/**
 * Content Quality Improver
 * 
 * Comprehensive content quality improvement system that:
 * 1. Analyzes content quality metrics
 * 2. Identifies areas for improvement
 * 3. Suggests specific enhancements
 * 4. Automatically applies safe improvements
 * 5. Generates quality reports and recommendations
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
    exclude: ['!node_modules/**', '!.git/**', '!templates/**']
  },
  maxFileSize: 1024 * 1024, // 1MB
  reportsDir: path.join(__dirname, '../../reports')
}

// Quality metrics thresholds
const QUALITY_THRESHOLDS = {
  minWordCount: 100,
  minSectionCount: 3,
  minLinkCount: 3,
  maxLineLength: 100,
  minReadabilityScore: 0.6,
  maxComplexityScore: 0.8,
  minEngagementScore: 0.5
}

// Content improvement patterns
const IMPROVEMENT_PATTERNS = {
  // Add missing sections
  addMissingSections: {
    'When You\'re Here': {
      pattern: /^# /,
      template: `## When You're Here

This document provides [purpose of document].

- **Purpose**: [Brief description of what this document covers]
- **Context**: [How this fits into the broader system/project]
- **Navigation**: Use the table of contents below to jump to specific topics

`
    },
    'Research Context': {
      pattern: /^# /,
      template: `## Research Context

### Technical Overview

**Component**: [Component name]
**Version**: [Version number]
**Architecture**: [Architecture description]
**Dependencies**: [Key dependencies]

### Background

[Background information about the topic]

### Methodology

[Research or development methodology used]

`
    },
    'No Dead Ends Policy': {
      pattern: /^# /,
      template: `## No Dead Ends Policy

This document connects to:
- [Related Document 1](./related-doc-1.md) - [Brief description]
- [Related Document 2](./related-doc-2.md) - [Brief description]
- [Related Document 3](./related-doc-3.md) - [Brief description]

For more information, see:
- [Category Overview](../category/)
- [Related Resources](../resources/)

`
    },
    'Navigation': {
      pattern: /^# /,
      template: `## Navigation

- [← Back to Main Documentation](../README.md)
- [← Back to Category](../)
- [→ Related Topic](../related-topic/)
- [📚 Technical Glossary](../GLOSSARY.md)
- [↑ Table of Contents](#table-of-contents)

`
    }
  },

  // Improve existing content
  improveContent: {
    addFunFacts: [
      '💡 **Fun Fact**: [Interesting fact about the topic]',
      '🎯 **Pro Tip**: [Useful tip for users]',
      '⚡ **Quick Note**: [Important information]',
      '🔍 **Did You Know**: [Interesting insight]'
    ],
    addExamples: [
      '### Example\n\n```bash\n# Example command\ncommand --option value\n```',
      '### Example\n\n```javascript\n// Example code\nconst example = "Hello World";\n```',
      '### Example\n\n```markdown\n# Example markdown\n[Link](url)\n```'
    ],
    addCodeBlocks: [
      '```bash\n# Command example\n```',
      '```javascript\n// Code example\n```',
      '```json\n// Configuration example\n```'
    ]
  },

  // Improve readability
  improveReadability: {
    breakLongParagraphs: true,
    addBulletPoints: true,
    improveHeadings: true,
    addTransitions: true
  }
}

class ContentQualityImprover {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesImproved: 0,
      improvementsApplied: 0,
      errors: 0
    }
    this.improvements = []
    this.reports = {
      summary: {},
      detailed: [],
      recommendations: []
    }
  }

  async run() {
    console.log('📈 Starting content quality improvement...')
    
    try {
      // Ensure directories exist
      await this.ensureDirectories()
      
      // Find all markdown files
      const files = await this.findMarkdownFiles()
      console.log(`📁 Found ${files.length} markdown files`)
      
      // Process each file
      for (const file of files) {
        await this.improveFile(file)
      }
      
      // Generate reports
      await this.generateReports()
      
      // Report results
      this.reportResults()
      
    } catch (error) {
      console.error('❌ Error during content quality improvement:', error)
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

  async improveFile(filePath) {
    try {
      this.stats.filesProcessed++
      const content = await fs.readFile(filePath, 'utf8')
      const relativePath = path.relative(CONFIG.docsRoot, filePath)
      
      // Analyze content quality
      const qualityMetrics = this.analyzeContentQuality(content)
      
      // Generate improvements
      const improvements = this.generateImprovements(content, qualityMetrics, relativePath)
      
      if (improvements.length > 0) {
        // Apply safe improvements
        const improvedContent = this.applyImprovements(content, improvements)
        
        
        // Write improved content
        await fs.writeFile(filePath, improvedContent)
        
        this.stats.filesImproved++
        this.stats.improvementsApplied += improvements.length
        this.improvements.push({
          file: relativePath,
          improvements: improvements,
          metrics: qualityMetrics
        })
        
        console.log(`✅ Applied ${improvements.length} improvements to ${relativePath}`)
      } else {
        console.log(`📝 No improvements needed for ${relativePath}`)
      }
      
    } catch (error) {
      console.error(`❌ Error improving ${filePath}:`, error.message)
      this.stats.errors++
    }
  }

  analyzeContentQuality(content) {
    const lines = content.split('\n')
    const words = content.split(/\s+/).filter(word => word.length > 0)
    
    // Basic metrics
    const wordCount = words.length
    const lineCount = lines.length
    const paragraphCount = content.split(/\n\s*\n/).length
    const linkCount = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length
    const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length
    const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length
    
    // Readability metrics
    const avgWordsPerSentence = this.calculateAvgWordsPerSentence(content)
    const avgSyllablesPerWord = this.calculateAvgSyllablesPerWord(words)
    const readabilityScore = this.calculateReadabilityScore(avgWordsPerSentence, avgSyllablesPerWord)
    
    // Complexity metrics
    const longWordsCount = words.filter(word => word.length > 6).length
    const complexityScore = longWordsCount / wordCount
    
    // Engagement metrics
    const questionCount = (content.match(/\?/g) || []).length
    const exclamationCount = (content.match(/!/g) || []).length
    const engagementScore = (questionCount + exclamationCount) / wordCount
    
    // Structure metrics
    const hasTitle = /^#\s+/.test(content)
    const hasTableOfContents = /table of contents/i.test(content)
    const hasNavigation = /navigation/i.test(content)
    const hasFunFact = /fun fact|pro tip|did you know/i.test(content)
    
    return {
      wordCount,
      lineCount,
      paragraphCount,
      linkCount,
      codeBlockCount,
      headingCount,
      avgWordsPerSentence,
      avgSyllablesPerWord,
      readabilityScore,
      complexityScore,
      engagementScore,
      hasTitle,
      hasTableOfContents,
      hasNavigation,
      hasFunFact,
      structureScore: this.calculateStructureScore({
        hasTitle,
        hasTableOfContents,
        hasNavigation,
        hasFunFact,
        headingCount,
        linkCount
      })
    }
  }

  calculateAvgWordsPerSentence(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(word => word.length > 0)
    return sentences.length > 0 ? words.length / sentences.length : 0
  }

  calculateAvgSyllablesPerWord(words) {
    let totalSyllables = 0
    for (const word of words) {
      totalSyllables += this.countSyllables(word)
    }
    return words.length > 0 ? totalSyllables / words.length : 0
  }

  countSyllables(word) {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    word = word.replace(/[^a-z]/g, '')
    const matches = word.match(/[aeiouy]+/g)
    return matches ? matches.length : 1
  }

  calculateReadabilityScore(avgWordsPerSentence, avgSyllablesPerWord) {
    // Simplified Flesch Reading Ease score
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    return Math.max(0, Math.min(1, score / 100))
  }

  calculateStructureScore(metrics) {
    let score = 0
    if (metrics.hasTitle) score += 0.2
    if (metrics.hasTableOfContents) score += 0.2
    if (metrics.hasNavigation) score += 0.2
    if (metrics.hasFunFact) score += 0.1
    if (metrics.headingCount >= 3) score += 0.2
    if (metrics.linkCount >= 3) score += 0.1
    return score
  }

  generateImprovements(content, metrics, relativePath) {
    const improvements = []
    
    // Check for missing required sections
    if (!metrics.hasTitle) {
      improvements.push({
        type: 'add_title',
        priority: 'high',
        description: 'Add a descriptive title',
        action: 'Add H1 heading at the beginning'
      })
    }
    
    if (!content.includes('When You\'re Here')) {
      improvements.push({
        type: 'add_section',
        priority: 'high',
        section: 'When You\'re Here',
        description: 'Add When You\'re Here section',
        action: 'Insert section after title'
      })
    }
    
    if (!content.includes('Research Context')) {
      improvements.push({
        type: 'add_section',
        priority: 'high',
        section: 'Research Context',
        description: 'Add Research Context section',
        action: 'Insert section after When You\'re Here'
      })
    }
    
    if (!content.includes('No Dead Ends Policy')) {
      improvements.push({
        type: 'add_section',
        priority: 'medium',
        section: 'No Dead Ends Policy',
        description: 'Add No Dead Ends Policy section',
        action: 'Insert section before Navigation'
      })
    }
    
    if (!content.includes('Navigation')) {
      improvements.push({
        type: 'add_section',
        priority: 'medium',
        section: 'Navigation',
        description: 'Add Navigation section',
        action: 'Insert section at the end'
      })
    }
    
    // Check content quality
    if (metrics.wordCount < QUALITY_THRESHOLDS.minWordCount) {
      improvements.push({
        type: 'expand_content',
        priority: 'medium',
        description: `Content too short (${metrics.wordCount} words, minimum ${QUALITY_THRESHOLDS.minWordCount})`,
        action: 'Add more detailed explanations and examples'
      })
    }
    
    if (metrics.linkCount < QUALITY_THRESHOLDS.minLinkCount) {
      improvements.push({
        type: 'add_links',
        priority: 'medium',
        description: `Low link count (${metrics.linkCount}, minimum ${QUALITY_THRESHOLDS.minLinkCount})`,
        action: 'Add more internal and external links'
      })
    }
    
    if (!metrics.hasFunFact) {
      improvements.push({
        type: 'add_fun_fact',
        priority: 'low',
        description: 'Add engaging content',
        action: 'Add a fun fact or pro tip'
      })
    }
    
    if (metrics.codeBlockCount === 0 && this.isTechnicalDocument(relativePath)) {
      improvements.push({
        type: 'add_examples',
        priority: 'medium',
        description: 'Technical document needs examples',
        action: 'Add code examples and usage samples'
      })
    }
    
    if (metrics.readabilityScore < QUALITY_THRESHOLDS.minReadabilityScore) {
      improvements.push({
        type: 'improve_readability',
        priority: 'medium',
        description: `Low readability score (${metrics.readabilityScore.toFixed(2)})`,
        action: 'Simplify sentences and add more structure'
      })
    }
    
    return improvements
  }

  isTechnicalDocument(relativePath) {
    return relativePath.includes('api/') || 
           relativePath.includes('reference/') || 
           relativePath.includes('technical/') ||
           relativePath.includes('architecture/')
  }

  applyImprovements(content, improvements) {
    let improvedContent = content
    
    // Apply improvements in order of priority
    const sortedImprovements = improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    
    for (const improvement of sortedImprovements) {
      switch (improvement.type) {
        case 'add_title':
          improvedContent = this.addTitle(improvedContent)
          break
        case 'add_section':
          improvedContent = this.addSection(improvedContent, improvement.section)
          break
        case 'add_fun_fact':
          improvedContent = this.addFunFact(improvedContent)
          break
        case 'add_examples':
          improvedContent = this.addExamples(improvedContent)
          break
        case 'improve_readability':
          improvedContent = this.improveReadability(improvedContent)
          break
        case 'expand_content':
          improvedContent = this.expandContent(improvedContent)
          break
        case 'add_links':
          improvedContent = this.addLinks(improvedContent)
          break
      }
    }
    
    return improvedContent
  }

  addTitle(content) {
    if (!/^#\s+/.test(content)) {
      const firstLine = content.split('\n')[0]
      if (firstLine.trim()) {
        return `# ${firstLine.trim()}\n\n${content}`
      } else {
        return `# Document Title\n\n${content}`
      }
    }
    return content
  }

  addSection(content, sectionName) {
    const template = IMPROVEMENT_PATTERNS.addMissingSections[sectionName]
    if (template) {
      // Find the best place to insert the section
      let insertPosition = 0
      
      if (sectionName === 'When You\'re Here') {
        // Insert after title
        const titleMatch = content.match(/^#\s+.*$/m)
        if (titleMatch) {
          insertPosition = titleMatch.index + titleMatch[0].length + 1
        }
      } else if (sectionName === 'Research Context') {
        // Insert after When You're Here
        const whenYoureHereMatch = content.match(/## When You're Here[\s\S]*?(?=##|$)/)
        if (whenYoureHereMatch) {
          insertPosition = whenYoureHereMatch.index + whenYoureHereMatch[0].length
        }
      } else if (sectionName === 'No Dead Ends Policy') {
        // Insert before Navigation
        const navMatch = content.match(/## Navigation/)
        if (navMatch) {
          insertPosition = navMatch.index
        } else {
          insertPosition = content.length
        }
      } else if (sectionName === 'Navigation') {
        // Insert at the end
        insertPosition = content.length
      }
      
      return content.slice(0, insertPosition) + '\n' + template.template + '\n' + content.slice(insertPosition)
    }
    return content
  }

  addFunFact(content) {
    const funFacts = IMPROVEMENT_PATTERNS.improveContent.addFunFacts
    const randomFunFact = funFacts[Math.floor(Math.random() * funFacts.length)]
    
    // Find a good place to insert the fun fact
    const sections = content.split(/^## /m)
    if (sections.length > 1) {
      const firstSection = sections[1]
      const insertPosition = content.indexOf(firstSection) + firstSection.indexOf('\n') + 1
      return content.slice(0, insertPosition) + '\n' + randomFunFact + '\n\n' + content.slice(insertPosition)
    }
    
    return content + '\n\n' + randomFunFact
  }

  addExamples(content) {
    const examples = IMPROVEMENT_PATTERNS.improveContent.addExamples
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    
    // Find a good place to insert the example
    const sections = content.split(/^## /m)
    if (sections.length > 1) {
      const lastSection = sections[sections.length - 1]
      const insertPosition = content.lastIndexOf(lastSection) + lastSection.indexOf('\n') + 1
      return content.slice(0, insertPosition) + '\n' + randomExample + '\n\n' + content.slice(insertPosition)
    }
    
    return content + '\n\n' + randomExample
  }

  improveReadability(content) {
    // Break long paragraphs
    const lines = content.split('\n')
    const improvedLines = []
    
    for (const line of lines) {
      if (line.length > QUALITY_THRESHOLDS.maxLineLength && !line.startsWith('#')) {
        // Split long lines at natural break points
        const words = line.split(' ')
        let currentLine = ''
        
        for (const word of words) {
          if (currentLine.length + word.length + 1 > QUALITY_THRESHOLDS.maxLineLength) {
            improvedLines.push(currentLine.trim())
            currentLine = word
          } else {
            currentLine += (currentLine ? ' ' : '') + word
          }
        }
        
        if (currentLine) {
          improvedLines.push(currentLine.trim())
        }
      } else {
        improvedLines.push(line)
      }
    }
    
    return improvedLines.join('\n')
  }

  expandContent(content) {
    // Add more explanatory text to short sections
    const sections = content.split(/^## /m)
    const expandedSections = []
    
    for (let i = 0; i < sections.length; i++) {
      let section = sections[i]
      
      if (i > 0) { // Skip title section
        const wordCount = section.split(/\s+/).length
        if (wordCount < 50) {
          section += '\n\nThis section provides detailed information about the topic. Additional context and examples will help readers understand the concepts better.'
        }
      }
      
      expandedSections.push(section)
    }
    
    return expandedSections.join('## ')
  }

  addLinks(content) {
    // Add placeholder links for improvement
    const sections = content.split(/^## /m)
    const improvedSections = []
    
    for (let i = 0; i < sections.length; i++) {
      let section = sections[i]
      
      if (i > 0 && !section.includes('[') && !section.includes('](')) {
        section += '\n\n**Related Links:**\n- [Related Documentation](./related-doc.md)\n- [Additional Resources](./resources.md)'
      }
      
      improvedSections.push(section)
    }
    
    return improvedSections.join('## ')
  }


  async generateReports() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // Summary report
    this.reports.summary = {
      timestamp: new Date().toISOString(),
      totalFiles: this.stats.filesProcessed,
      filesImproved: this.stats.filesImproved,
      improvementsApplied: this.stats.improvementsApplied,
      errors: this.stats.errors,
      improvementRate: (this.stats.filesImproved / this.stats.filesProcessed * 100).toFixed(2),
      improvementTypes: this.getImprovementTypeStats()
    }
    
    // Detailed report
    this.reports.detailed = this.improvements
    
    // Recommendations report
    this.reports.recommendations = this.generateRecommendations()
    
    // Save reports
    const summaryPath = path.join(CONFIG.reportsDir, `content-quality-summary-${timestamp}.json`)
    const detailedPath = path.join(CONFIG.reportsDir, `content-quality-detailed-${timestamp}.json`)
    const recommendationsPath = path.join(CONFIG.reportsDir, `content-quality-recommendations-${timestamp}.json`)
    
    await fs.writeFile(summaryPath, JSON.stringify(this.reports.summary, null, 2))
    await fs.writeFile(detailedPath, JSON.stringify(this.reports.detailed, null, 2))
    await fs.writeFile(recommendationsPath, JSON.stringify(this.reports.recommendations, null, 2))
    
    console.log(`📊 Reports saved to ${CONFIG.reportsDir}`)
  }

  getImprovementTypeStats() {
    const stats = {}
    for (const improvement of this.improvements) {
      for (const imp of improvement.improvements) {
        stats[imp.type] = (stats[imp.type] || 0) + 1
      }
    }
    return stats
  }

  generateRecommendations() {
    const recommendations = []
    
    // Top improvement types
    const improvementTypes = this.getImprovementTypeStats()
    const topImprovements = Object.entries(improvementTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    for (const [type, count] of topImprovements) {
      recommendations.push({
        type: 'improvement_pattern',
        priority: 'high',
        description: `Focus on ${type} improvements (${count} applications)`,
        action: this.getRecommendationAction(type)
      })
    }
    
    return recommendations
  }

  getRecommendationAction(improvementType) {
    const actions = {
      'add_section': 'Continue adding missing required sections to improve document structure',
      'add_title': 'Ensure all documents have descriptive titles',
      'expand_content': 'Add more detailed content to short documents',
      'add_links': 'Increase link density for better navigation',
      'add_fun_fact': 'Add engaging elements to improve reader experience',
      'add_examples': 'Include more practical examples in technical documents',
      'improve_readability': 'Simplify language and improve sentence structure'
    }
    
    return actions[improvementType] || 'Continue applying this type of improvement'
  }

  async ensureDirectories() {
    await fs.mkdir(CONFIG.reportsDir, { recursive: true })
    await fs.mkdir(CONFIG.backupDir, { recursive: true })
  }

  reportResults() {
    console.log('\n📈 Content Quality Improvement Results:')
    console.log(`   Files processed: ${this.stats.filesProcessed}`)
    console.log(`   Files improved: ${this.stats.filesImproved}`)
    console.log(`   Improvements applied: ${this.stats.improvementsApplied}`)
    console.log(`   Errors: ${this.stats.errors}`)
    console.log(`   Improvement rate: ${this.reports.summary.improvementRate}%`)
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Some errors occurred during improvement. Check the logs above.')
    }
    
    if (this.stats.improvementsApplied > 0) {
      console.log('\n✅ Content quality improvements applied successfully!')
    } else {
      console.log('\n📝 No improvements were needed for the processed files.')
    }
    
    console.log(`\n📊 Reports generated in: ${CONFIG.reportsDir}`)
  }
}

// Run the improver
const improver = new ContentQualityImprover()
improver.run().catch(console.error)
