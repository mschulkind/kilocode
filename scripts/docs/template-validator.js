#!/usr/bin/env node

/**
 * Template Validator
 * 
 * Comprehensive template validation system that:
 * 1. Detects document types automatically
 * 2. Validates against appropriate templates
 * 3. Reports compliance issues with specific fixes
 * 4. Generates detailed validation reports
 * 5. Supports automated template enforcement
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
  templatesRoot: path.join(__dirname, '../../docs/templates'),
  patterns: {
    markdown: '**/*.md',
    exclude: ['!node_modules/**', '!.git/**', '!templates/**']
  },
  maxFileSize: 1024 * 1024, // 1MB
  reportsDir: path.join(__dirname, '../../reports')
}

// Document type detection patterns
const DOCUMENT_TYPE_PATTERNS = {
  navigation: {
    pathPatterns: [
      /README\.md$/i,
      /getting-started/i,
      /guide/i,
      /tutorial/i,
      /index/i
    ],
    contentPatterns: [
      /getting started/i,
      /quick start/i,
      /installation/i,
      /setup/i,
      /table of contents/i,
      /welcome/i,
      /overview/i
    ],
    structurePatterns: [
      /^# .*getting started/i,
      /^# .*installation/i,
      /^# .*quick start/i,
      /^# .*table of contents/i
    ]
  },
  technical: {
    pathPatterns: [
      /\/api\//i,
      /\/reference\//i,
      /\/spec\//i,
      /api-guide/i,
      /reference/i
    ],
    contentPatterns: [
      /api reference/i,
      /endpoints/i,
      /authentication/i,
      /response format/i,
      /request format/i,
      /function reference/i,
      /class reference/i,
      /method reference/i,
      /parameters/i,
      /return value/i
    ],
    structurePatterns: [
      /^# .*api.*reference/i,
      /^## .*endpoints/i,
      /^### .*get /i,
      /^### .*post /i,
      /^### .*put /i,
      /^### .*delete /i,
      /^## .*methods/i,
      /^## .*functions/i
    ]
  },
  planning: {
    pathPatterns: [
      /\/plan/i,
      /\/roadmap/i,
      /\/strategy/i,
      /\/timeline/i,
      /\/context\//i
    ],
    contentPatterns: [
      /project plan/i,
      /roadmap/i,
      /timeline/i,
      /milestones/i,
      /objectives/i,
      /goals/i,
      /strategy/i,
      /budget/i,
      /resources/i,
      /team members/i,
      /phases/i,
      /task id/i,
      /progress summary/i
    ],
    structurePatterns: [
      /^# .*plan/i,
      /^# .*roadmap/i,
      /^## .*timeline/i,
      /^## .*milestones/i,
      /^## .*objectives/i,
      /^## .*phases/i
    ]
  },
  general: {
    pathPatterns: [],
    contentPatterns: [],
    structurePatterns: []
  }
}

// Template requirements for each document type
const TEMPLATE_REQUIREMENTS = {
  navigation: {
    requiredSections: [
      { name: 'When You\'re Here', level: 2, required: true },
      { name: 'Research Context', level: 2, required: true },
      { name: 'Table of Contents', level: 2, required: false },
      { name: 'No Dead Ends Policy', level: 2, required: true },
      { name: 'Navigation', level: 2, required: true }
    ],
    optionalSections: [
      'Getting Started',
      'Installation',
      'Configuration',
      'Usage Examples',
      'Troubleshooting'
    ],
    maxLineLength: 100,
    minSectionLength: 30,
    requireFunFact: false
  },
  technical: {
    requiredSections: [
      { name: 'When You\'re Here', level: 2, required: true },
      { name: 'Research Context', level: 2, required: true },
      { name: 'No Dead Ends Policy', level: 2, required: true },
      { name: 'Navigation', level: 2, required: true }
    ],
    optionalSections: [
      'Architecture',
      'API Reference',
      'Implementation Details',
      'Testing',
      'Troubleshooting',
      'Configuration',
      'Examples'
    ],
    maxLineLength: 80,
    minSectionLength: 50,
    requireFunFact: false
  },
  planning: {
    requiredSections: [
      { name: 'When You\'re Here', level: 2, required: true },
      { name: 'Research Context', level: 2, required: true },
      { name: 'Progress Summary', level: 2, required: true },
      { name: 'Success Criteria', level: 2, required: true },
      { name: 'No Dead Ends Policy', level: 2, required: true },
      { name: 'Navigation', level: 2, required: true }
    ],
    optionalSections: [
      'Objectives',
      'Timeline',
      'Resources',
      'Risk Assessment',
      'Implementation Plan',
      'Milestones',
      'Budget'
    ],
    maxLineLength: 120,
    minSectionLength: 20,
    requireFunFact: false
  },
  general: {
    requiredSections: [
      { name: 'When You\'re Here', level: 2, required: true },
      { name: 'Research Context', level: 2, required: true },
      { name: 'No Dead Ends Policy', level: 2, required: true },
      { name: 'Navigation', level: 2, required: true }
    ],
    optionalSections: [
      'Overview',
      'Details',
      'Examples',
      'Additional Information',
      'Related Topics'
    ],
    maxLineLength: 100,
    minSectionLength: 50,
    requireFunFact: false
  }
}

class TemplateValidator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesValidated: 0,
      violationsFound: 0,
      errors: 0
    }
    this.violations = []
    this.reports = {
      summary: {},
      detailed: [],
      recommendations: []
    }
  }

  async run() {
    console.log('📋 Starting template validation...')
    
    try {
      // Ensure directories exist
      await this.ensureDirectories()
      
      // Find all markdown files
      const files = await this.findMarkdownFiles()
      console.log(`📁 Found ${files.length} markdown files`)
      
      // Process each file
      for (const file of files) {
        await this.validateFile(file)
      }
      
      // Generate reports
      await this.generateReports()
      
      // Report results
      this.reportResults()
      
    } catch (error) {
      console.error('❌ Error during template validation:', error)
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

  async validateFile(filePath) {
    try {
      this.stats.filesProcessed++
      const content = await fs.readFile(filePath, 'utf8')
      const relativePath = path.relative(CONFIG.docsRoot, filePath)
      
      // Detect document type
      const documentType = this.detectDocumentType(filePath, content)
      
      // Parse document structure
      const structure = this.parseDocumentStructure(content)
      
      // Validate against template requirements
      const violations = this.validateTemplateCompliance(
        documentType, 
        structure, 
        relativePath, 
        content
      )
      
      if (violations.length > 0) {
        this.stats.violationsFound += violations.length
        this.violations.push({
          file: relativePath,
          type: documentType,
          violations: violations
        })
        console.log(`⚠️  ${violations.length} violations in ${relativePath} (${documentType})`)
      } else {
        console.log(`✅ ${relativePath} complies with ${documentType} template`)
      }
      
      this.stats.filesValidated++
      
    } catch (error) {
      console.error(`❌ Error validating ${filePath}:`, error.message)
      this.stats.errors++
    }
  }

  detectDocumentType(filePath, content) {
    const relativePath = path.relative(CONFIG.docsRoot, filePath)
    const scores = {}
    
    for (const [type, patterns] of Object.entries(DOCUMENT_TYPE_PATTERNS)) {
      let score = 0
      
      // Path-based scoring
      for (const pattern of patterns.pathPatterns) {
        if (pattern.test(relativePath)) {
          score += 3
        }
      }
      
      // Content-based scoring
      for (const pattern of patterns.contentPatterns) {
        if (pattern.test(content)) {
          score += 2
        }
      }
      
      // Structure-based scoring
      for (const pattern of patterns.structurePatterns) {
        if (pattern.test(content)) {
          score += 1
        }
      }
      
      scores[type] = score
    }
    
    // Return type with highest score, default to 'general'
    const bestType = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0]
    
    return scores[bestType] > 0 ? bestType : 'general'
  }

  parseDocumentStructure(content) {
    const lines = content.split('\n')
    const structure = {
      headings: [],
      sections: [],
      hasTitle: false,
      hasFunFact: false,
      wordCount: 0,
      linkCount: 0
    }
    
    let currentSection = null
    let sectionContent = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Check for headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2].trim()
        
        // Save previous section
        if (currentSection) {
          currentSection.content = sectionContent.join('\n')
          currentSection.wordCount = sectionContent.join(' ').split(/\s+/).length
          structure.sections.push(currentSection)
        }
        
        // Start new section
        currentSection = {
          level: level,
          text: text,
          line: i + 1,
          content: '',
          wordCount: 0
        }
        structure.headings.push(currentSection)
        
        if (level === 1) {
          structure.hasTitle = true
        }
        
        sectionContent = []
      } else {
        sectionContent.push(line)
        
        // Check for fun fact
        if (/fun fact/i.test(line)) {
          structure.hasFunFact = true
        }
        
        // Count links
        const linkMatches = line.match(/\[([^\]]+)\]\(([^)]+)\)/g)
        if (linkMatches) {
          structure.linkCount += linkMatches.length
        }
      }
    }
    
    // Save last section
    if (currentSection) {
      currentSection.content = sectionContent.join('\n')
      currentSection.wordCount = sectionContent.join(' ').split(/\s+/).length
      structure.sections.push(currentSection)
    }
    
    // Calculate word count
    structure.wordCount = content.split(/\s+/).length
    
    return structure
  }

  validateTemplateCompliance(documentType, structure, relativePath, content) {
    const requirements = TEMPLATE_REQUIREMENTS[documentType]
    const violations = []
    
    // Check required sections
    for (const requiredSection of requirements.requiredSections) {
      const hasSection = structure.headings.some(heading => 
        heading.level === requiredSection.level &&
        heading.text.toLowerCase().includes(requiredSection.name.toLowerCase())
      )
      
      if (!hasSection) {
        violations.push({
          type: 'missing_required_section',
          severity: 'error',
          section: requiredSection.name,
          message: `Missing required section: "${requiredSection.name}"`,
          suggestion: `Add a "## ${requiredSection.name}" section following the ${documentType} template`
        })
      }
    }
    
    // Check section lengths
    for (const section of structure.sections) {
      if (section.level >= 2) {
        const minLength = requirements.minSectionLength
        if (section.wordCount < minLength) {
          violations.push({
            type: 'section_too_short',
            severity: 'warning',
            section: section.text,
            line: section.line,
            message: `Section "${section.text}" is too short (${section.wordCount} words, minimum ${minLength})`,
            suggestion: 'Expand this section or combine it with related content'
          })
        }
      }
    }
    
    // Check for title
    if (!structure.hasTitle) {
      violations.push({
        type: 'missing_title',
        severity: 'error',
        message: 'Document must have a main title (H1 heading)',
        suggestion: 'Add a descriptive main title at the beginning of the document'
      })
    }
    
    // Check for fun fact (recommended)
    if (!structure.hasFunFact) {
      violations.push({
        type: 'missing_fun_fact',
        severity: 'info',
        message: 'Consider adding a fun fact to make the document more engaging',
        suggestion: 'Add a fun fact related to the document topic'
      })
    }
    
    // Check for table of contents (for longer documents)
    if (structure.headings.length >= 4) {
      const hasTOC = structure.headings.some(heading => 
        heading.text.toLowerCase().includes('table of contents')
      )
      
      if (!hasTOC) {
        violations.push({
          type: 'missing_table_of_contents',
          severity: 'warning',
          message: 'Document with multiple sections should have a Table of Contents',
          suggestion: 'Add a Table of Contents section with links to all major headings'
        })
      }
    }
    
    // Check navigation links
    const hasNavigation = structure.headings.some(heading => 
      heading.text.toLowerCase().includes('navigation')
    )
    
    if (hasNavigation) {
      const navigationSection = structure.sections.find(section => 
        section.text.toLowerCase().includes('navigation')
      )
      
      if (navigationSection) {
        const hasBackLink = /←.*back/i.test(navigationSection.content)
        const hasGlossaryLink = /📚.*glossary/i.test(navigationSection.content)
        
        if (!hasBackLink) {
          violations.push({
            type: 'missing_back_navigation',
            severity: 'warning',
            message: 'Navigation section should include back navigation links',
            suggestion: 'Add back navigation links using "← Back to [Section]" format'
          })
        }
        
        if (!hasGlossaryLink) {
          violations.push({
            type: 'missing_glossary_link',
            severity: 'warning',
            message: 'Navigation should include a link to the Technical Glossary',
            suggestion: 'Add a link to the Technical Glossary using "📚 Technical Glossary" format'
          })
        }
      }
    }
    
    return violations
  }

  async generateReports() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // Summary report
    this.reports.summary = {
      timestamp: new Date().toISOString(),
      totalFiles: this.stats.filesProcessed,
      filesValidated: this.stats.filesValidated,
      violationsFound: this.stats.violationsFound,
      errors: this.stats.errors,
      complianceRate: ((this.stats.filesValidated - this.violations.length) / this.stats.filesValidated * 100).toFixed(2),
      documentTypes: this.getDocumentTypeStats(),
      violationTypes: this.getViolationTypeStats()
    }
    
    // Detailed report
    this.reports.detailed = this.violations
    
    // Recommendations report
    this.reports.recommendations = this.generateRecommendations()
    
    // Save reports
    const summaryPath = path.join(CONFIG.reportsDir, `template-validation-summary-${timestamp}.json`)
    const detailedPath = path.join(CONFIG.reportsDir, `template-validation-detailed-${timestamp}.json`)
    const recommendationsPath = path.join(CONFIG.reportsDir, `template-validation-recommendations-${timestamp}.json`)
    
    await fs.writeFile(summaryPath, JSON.stringify(this.reports.summary, null, 2))
    await fs.writeFile(detailedPath, JSON.stringify(this.reports.detailed, null, 2))
    await fs.writeFile(recommendationsPath, JSON.stringify(this.reports.recommendations, null, 2))
    
    console.log(`📊 Reports saved to ${CONFIG.reportsDir}`)
  }

  getDocumentTypeStats() {
    const stats = {}
    for (const violation of this.violations) {
      stats[violation.type] = (stats[violation.type] || 0) + 1
    }
    return stats
  }

  getViolationTypeStats() {
    const stats = {}
    for (const violation of this.violations) {
      for (const v of violation.violations) {
        stats[v.type] = (stats[v.type] || 0) + 1
      }
    }
    return stats
  }

  generateRecommendations() {
    const recommendations = []
    
    // Top violation types
    const violationTypes = this.getViolationTypeStats()
    const topViolations = Object.entries(violationTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    for (const [type, count] of topViolations) {
      recommendations.push({
        type: 'violation_pattern',
        priority: 'high',
        description: `Address ${type} violations (${count} occurrences)`,
        action: this.getRecommendationAction(type)
      })
    }
    
    // Document type recommendations
    const documentTypeStats = this.getDocumentTypeStats()
    for (const [type, count] of Object.entries(documentTypeStats)) {
      if (count > 5) {
        recommendations.push({
          type: 'document_type_focus',
          priority: 'medium',
          description: `Focus on ${type} document compliance (${count} files need attention)`,
          action: `Review and update ${type} documents to follow template standards`
        })
      }
    }
    
    return recommendations
  }

  getRecommendationAction(violationType) {
    const actions = {
      'missing_required_section': 'Add missing required sections following document templates',
      'missing_title': 'Add descriptive titles to all documents',
      'section_too_short': 'Expand short sections or combine related content',
      'missing_table_of_contents': 'Add table of contents to longer documents',
      'missing_back_navigation': 'Add back navigation links to navigation sections',
      'missing_glossary_link': 'Add glossary links to navigation sections'
    }
    
    return actions[violationType] || 'Review and address this type of violation'
  }

  async ensureDirectories() {
    await fs.mkdir(CONFIG.reportsDir, { recursive: true })
  }

  reportResults() {
    console.log('\n📊 Template Validation Results:')
    console.log(`   Files processed: ${this.stats.filesProcessed}`)
    console.log(`   Files validated: ${this.stats.filesValidated}`)
    console.log(`   Violations found: ${this.stats.violationsFound}`)
    console.log(`   Errors: ${this.stats.errors}`)
    console.log(`   Compliance rate: ${this.reports.summary.complianceRate}%`)
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Some errors occurred during validation. Check the logs above.')
    }
    
    if (this.stats.violationsFound > 0) {
      console.log('\n⚠️  Template violations found. Check the detailed reports for specific issues.')
    } else {
      console.log('\n✅ All documents comply with template standards!')
    }
    
    console.log(`\n📊 Reports generated in: ${CONFIG.reportsDir}`)
  }
}

// Run the validator
const validator = new TemplateValidator()
validator.run().catch(console.error)
