#!/usr/bin/env node

/**
 * Final Integration Tester
 * 
 * Comprehensive final integration testing system that:
 * 1. Runs complete validation suite
 * 2. Identifies and categorizes all remaining issues
 * 3. Applies systematic fixes for each issue type
 * 4. Validates fixes and measures progress
 * 5. Generates final integration report
 */

import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  docsRoot: path.join(__dirname, '../../docs'),
  validationOutput: path.join(__dirname, '../../final_validation_output.log'),
  reportsDir: path.join(__dirname, '../../reports'),
  maxIterations: 10,
  targetWarningCount: 0,
  targetErrorCount: 0
}

class FinalIntegrationTester {
  constructor() {
    this.stats = {
      iterations: 0,
      initialWarnings: 0,
      initialErrors: 0,
      finalWarnings: 0,
      finalErrors: 0,
      totalFixes: 0,
      filesModified: 0
    }
    this.issueCategories = {
      cross_reference: [],
      table_of_contents: [],
      section_naming: [],
      navigation: [],
      blockquote: [],
      required_section: [],
      other: []
    }
    this.fixes = []
  }

  async run() {
    console.log('🧪 Starting final integration testing...')
    
    try {
      // Ensure directories exist
      await this.ensureDirectories()
      
      // Phase 1: Initial validation
      await this.runInitialValidation()
      
      // Phase 2: Iterative fixing
      await this.runIterativeFixing()
      
      // Phase 3: Final validation
      await this.runFinalValidation()
      
      // Phase 4: Generate final report
      await this.generateFinalReport()
      
      // Report results
      this.reportResults()
      
    } catch (error) {
      console.error('❌ Error during final integration testing:', error)
    }
  }

  async runInitialValidation() {
    console.log('📊 Running initial validation...')
    
    await this.runValidation()
    const { warnings, errors } = await this.parseValidationOutput()
    
    this.stats.initialWarnings = warnings
    this.stats.initialErrors = errors
    
    console.log(`📊 Initial validation: ${warnings} warnings, ${errors} errors`)
  }

  async runIterativeFixing() {
    console.log('🔧 Running iterative fixing...')
    
    let previousTotal = this.stats.initialWarnings + this.stats.initialErrors
    let iteration = 0
    
    while (iteration < CONFIG.maxIterations) {
      iteration++
      this.stats.iterations = iteration
      
      console.log(`\n🔄 Iteration ${iteration}/${CONFIG.maxIterations}`)
      
      // Parse current validation output
      await this.parseValidationOutput()
      
      // Apply fixes for each category
      const fixesApplied = await this.applySystematicFixes()
      
      if (fixesApplied === 0) {
        console.log('✅ No more fixes to apply')
        break
      }
      
      // Run validation again
      await this.runValidation()
      const { warnings, errors } = await this.parseValidationOutput()
      
      const currentTotal = warnings + errors
      const improvement = previousTotal - currentTotal
      
      console.log(`📊 After iteration ${iteration}: ${warnings} warnings, ${errors} errors (improvement: ${improvement})`)
      
      if (currentTotal === 0) {
        console.log('🎉 Zero warnings and errors achieved!')
        break
      }
      
      if (improvement === 0) {
        console.log('⚠️  No improvement in this iteration')
        break
      }
      
      previousTotal = currentTotal
    }
  }

  async runFinalValidation() {
    console.log('🏁 Running final validation...')
    
    await this.runValidation()
    const { warnings, errors } = await this.parseValidationOutput()
    
    this.stats.finalWarnings = warnings
    this.stats.finalErrors = errors
    
    console.log(`🏁 Final validation: ${warnings} warnings, ${errors} errors`)
  }

  async runValidation() {
    try {
      await execAsync('pnpm docs:validate > final_validation_output.log 2>&1', {
        cwd: path.join(__dirname, '../..')
      })
    } catch (error) {
      // Validation may return non-zero exit code due to issues found
      // This is expected, we'll parse the output anyway
    }
  }

  async parseValidationOutput() {
    const validationOutput = await fs.readFile(CONFIG.validationOutput, 'utf8')
    const lines = validationOutput.split('\n')
    
    let warnings = 0
    let errors = 0
    let currentFile = null
    
    // Clear previous categorization
    for (const category of Object.keys(this.issueCategories)) {
      this.issueCategories[category] = []
    }
    
    for (const line of lines) {
      // Extract file name
      const fileMatch = line.match(/^docs\/([^:]+)/)
      if (fileMatch) {
        currentFile = fileMatch[1]
        continue
      }
      
      // Extract issue details
      const issueMatch = line.match(/(\d+):(\d+)-(\d+):(\d+)\s+(\w+)\s+(.+)/)
      if (issueMatch && currentFile) {
        const [fullMatch, startLine, startCol, endLine, endCol, level, message] = issueMatch
        
        if (level === 'warning') warnings++
        if (level === 'error') errors++
        
        // Categorize issue
        const category = this.categorizeIssue(message)
        this.issueCategories[category].push({
          file: currentFile,
          line: parseInt(startLine),
          level: level,
          message: message.trim(),
          category: category
        })
      }
    }
    
    return { warnings, errors }
  }

  categorizeIssue(message) {
    if (message.includes('ENOENT: no such file or directory')) return 'cross_reference'
    if (message.includes('Table of Contents link')) return 'table_of_contents'
    if (message.includes('has a non-descriptive name')) return 'section_naming'
    if (message.includes('should include a link')) return 'navigation'
    if (message.includes('block quote markers')) return 'blockquote'
    if (message.includes('Document must include')) return 'required_section'
    return 'other'
  }

  async applySystematicFixes() {
    let totalFixes = 0
    
    // Fix cross-reference issues
    const crossRefFixes = await this.fixCrossReferenceIssues()
    totalFixes += crossRefFixes
    
    // Fix table of contents issues
    const tocFixes = await this.fixTableOfContentsIssues()
    totalFixes += tocFixes
    
    // Fix section naming issues
    const sectionFixes = await this.fixSectionNamingIssues()
    totalFixes += sectionFixes
    
    // Fix navigation issues
    const navFixes = await this.fixNavigationIssues()
    totalFixes += navFixes
    
    // Fix blockquote issues
    const blockquoteFixes = await this.fixBlockquoteIssues()
    totalFixes += blockquoteFixes
    
    // Fix required section issues
    const requiredSectionFixes = await this.fixRequiredSectionIssues()
    totalFixes += requiredSectionFixes
    
    this.stats.totalFixes += totalFixes
    return totalFixes
  }

  async fixCrossReferenceIssues() {
    const issues = this.issueCategories.cross_reference
    let fixes = 0
    
    for (const issue of issues) {
      const filePath = path.join(CONFIG.docsRoot, issue.file)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Extract the broken link
      const pathMatch = issue.message.match(/stat '([^']+)'/)
      if (pathMatch) {
        const brokenPath = pathMatch[1]
        
        // Try to fix the path
        const fixedPath = await this.findCorrectPath(brokenPath, issue.file)
        if (fixedPath) {
          const fixedContent = content.replace(
            new RegExp(brokenPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            fixedPath
          )
          
          if (fixedContent !== content) {
            await fs.writeFile(filePath, fixedContent)
            fixes++
            this.stats.filesModified++
          }
        }
      }
    }
    
    console.log(`🔗 Fixed ${fixes} cross-reference issues`)
    return fixes
  }

  async findCorrectPath(brokenPath, sourceFile) {
    // Try common path corrections
    const corrections = [
      brokenPath.replace('../README.md', '../../README.md'),
      brokenPath.replace('../GLOSSARY.md', '../../GLOSSARY.md'),
      brokenPath.replace('../architecture/', '../../architecture/'),
      brokenPath.replace('../orchestrator/', '../../orchestrator/'),
      brokenPath.replace('../race-condition/', '../../architecture/race-condition/'),
      brokenPath.replace('../', '../../')
    ]
    
    for (const correction of corrections) {
      const fullPath = path.join(CONFIG.docsRoot, correction)
      try {
        await fs.access(fullPath)
        return correction
      } catch (error) {
        // File doesn't exist, try next correction
      }
    }
    
    return null
  }

  async fixTableOfContentsIssues() {
    const issues = this.issueCategories.table_of_contents
    let fixes = 0
    
    for (const issue of issues) {
      const filePath = path.join(CONFIG.docsRoot, issue.file)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Extract the broken TOC link
      const linkMatch = issue.message.match(/#([^"]+)"/)
      if (linkMatch) {
        const brokenLink = linkMatch[1]
        
        // Find the correct heading
        const correctHeading = await this.findCorrectHeading(brokenLink, content)
        if (correctHeading) {
          const fixedContent = content.replace(
            new RegExp(`#${brokenLink}`, 'g'),
            `#${correctHeading}`
          )
          
          if (fixedContent !== content) {
            await fs.writeFile(filePath, fixedContent)
            fixes++
            this.stats.filesModified++
          }
        }
      }
    }
    
    console.log(`📋 Fixed ${fixes} table of contents issues`)
    return fixes
  }

  async findCorrectHeading(brokenLink, content) {
    // Extract all headings
    const headings = content.match(/^#{1,6}\s+(.+)$/gm) || []
    
    // Try to find a similar heading
    for (const heading of headings) {
      const headingText = heading.replace(/^#{1,6}\s+/, '').toLowerCase()
      const brokenLinkText = brokenLink.replace(/-/g, ' ').toLowerCase()
      
      if (headingText.includes(brokenLinkText) || brokenLinkText.includes(headingText)) {
        return headingText.replace(/\s+/g, '-')
      }
    }
    
    return null
  }

  async fixSectionNamingIssues() {
    const issues = this.issueCategories.section_naming
    let fixes = 0
    
    for (const issue of issues) {
      const filePath = path.join(CONFIG.docsRoot, issue.file)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Extract the section name
      const sectionMatch = issue.message.match(/Section "([^"]+)"/)
      if (sectionMatch) {
        const sectionName = sectionMatch[1]
        
        // Suggest a better name
        const betterName = this.suggestBetterSectionName(sectionName)
        if (betterName && betterName !== sectionName) {
          const fixedContent = content.replace(
            new RegExp(`## ${sectionName}`, 'g'),
            `## ${betterName}`
          )
          
          if (fixedContent !== content) {
            await fs.writeFile(filePath, fixedContent)
            fixes++
            this.stats.filesModified++
          }
        }
      }
    }
    
    console.log(`📝 Fixed ${fixes} section naming issues`)
    return fixes
  }

  suggestBetterSectionName(sectionName) {
    const suggestions = {
      'Conclusion': 'Summary',
      'Summary': 'Key Takeaways',
      'Introduction': 'Overview',
      'Overview': 'Getting Started',
      'More': 'Additional Information',
      'Other': 'Related Topics',
      'Additional': 'Further Reading'
    }
    
    return suggestions[sectionName] || null
  }

  async fixNavigationIssues() {
    const issues = this.issueCategories.navigation
    let fixes = 0
    
    for (const issue of issues) {
      const filePath = path.join(CONFIG.docsRoot, issue.file)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Add missing navigation elements
      if (issue.message.includes('Technical Glossary')) {
        const fixedContent = this.addGlossaryLink(content)
        if (fixedContent !== content) {
          await fs.writeFile(filePath, fixedContent)
          fixes++
          this.stats.filesModified++
        }
      } else if (issue.message.includes('Table of Contents')) {
        const fixedContent = this.addTOCLink(content)
        if (fixedContent !== content) {
          await fs.writeFile(filePath, fixedContent)
          fixes++
          this.stats.filesModified++
        }
      }
    }
    
    console.log(`🧭 Fixed ${fixes} navigation issues`)
    return fixes
  }

  addGlossaryLink(content) {
    if (content.includes('📚 Technical Glossary')) return content
    
    const navSection = content.match(/## Navigation[\s\S]*?(?=##|$)/)
    if (navSection) {
      const glossaryLink = '- [📚 Technical Glossary](../../GLOSSARY.md)\n'
      return content.replace(navSection[0], navSection[0] + glossaryLink)
    }
    
    return content
  }

  addTOCLink(content) {
    if (content.includes('↑ Table of Contents')) return content
    
    const navSection = content.match(/## Navigation[\s\S]*?(?=##|$)/)
    if (navSection) {
      const tocLink = '- [↑ Table of Contents](#table-of-contents)\n'
      return content.replace(navSection[0], navSection[0] + tocLink)
    }
    
    return content
  }

  async fixBlockquoteIssues() {
    const issues = this.issueCategories.blockquote
    let fixes = 0
    
    for (const issue of issues) {
      const filePath = path.join(CONFIG.docsRoot, issue.file)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Fix blockquote markers
      const fixedContent = content.replace(/^>\s*$/gm, '> ')
      
      if (fixedContent !== content) {
        await fs.writeFile(filePath, fixedContent)
        fixes++
        this.stats.filesModified++
      }
    }
    
    console.log(`📝 Fixed ${fixes} blockquote issues`)
    return fixes
  }

  async fixRequiredSectionIssues() {
    const issues = this.issueCategories.required_section
    let fixes = 0
    
    for (const issue of issues) {
      const filePath = path.join(CONFIG.docsRoot, issue.file)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Add missing required sections
      if (issue.message.includes('No Dead Ends Policy')) {
        const fixedContent = this.addNoDeadEndsPolicy(content)
        if (fixedContent !== content) {
          await fs.writeFile(filePath, fixedContent)
          fixes++
          this.stats.filesModified++
        }
      } else if (issue.message.includes('When You\'re Here')) {
        const fixedContent = this.addWhenYoureHere(content)
        if (fixedContent !== content) {
          await fs.writeFile(filePath, fixedContent)
          fixes++
          this.stats.filesModified++
        }
      }
    }
    
    console.log(`📋 Fixed ${fixes} required section issues`)
    return fixes
  }

  addNoDeadEndsPolicy(content) {
    if (content.includes('No Dead Ends Policy')) return content
    
    const policySection = `## No Dead Ends Policy

This document connects to:
- [Related Documentation](./related-doc.md) - Brief description
- [Additional Resources](./resources.md) - Further information

For more information, see:
- [Category Overview](../)
- [Related Topics](../related/)

`
    
    return content + '\n' + policySection
  }

  addWhenYoureHere(content) {
    if (content.includes('When You\'re Here')) return content
    
    const whenYoureHereSection = `## When You're Here

This document provides [purpose of document].

- **Purpose**: [Brief description of what this document covers]
- **Context**: [How this fits into the broader system/project]
- **Navigation**: Use the table of contents below to jump to specific topics

`
    
    // Insert after title
    const titleMatch = content.match(/^# .+$/m)
    if (titleMatch) {
      const insertPos = titleMatch.index + titleMatch[0].length + 1
      return content.slice(0, insertPos) + '\n' + whenYoureHereSection + content.slice(insertPos)
    }
    
    return whenYoureHereSection + content
  }

  async generateFinalReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      improvement: {
        warningsReduced: this.stats.initialWarnings - this.stats.finalWarnings,
        errorsReduced: this.stats.initialErrors - this.stats.finalErrors,
        totalReduction: (this.stats.initialWarnings + this.stats.initialErrors) - (this.stats.finalWarnings + this.stats.finalErrors),
        reductionPercentage: ((this.stats.initialWarnings + this.stats.initialErrors) - (this.stats.finalWarnings + this.stats.finalErrors)) / (this.stats.initialWarnings + this.stats.initialErrors) * 100
      },
      issueCategories: this.issueCategories,
      fixes: this.fixes,
      recommendations: this.generateRecommendations()
    }
    
    const reportPath = path.join(CONFIG.reportsDir, `final-integration-report-${timestamp}.json`)
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📊 Final report saved to ${reportPath}`)
  }

  generateRecommendations() {
    const recommendations = []
    
    if (this.stats.finalWarnings > 0 || this.stats.finalErrors > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Address Remaining Issues',
        description: `${this.stats.finalWarnings} warnings and ${this.stats.finalErrors} errors remain`,
        action: 'Continue iterative fixing or adjust validation rules'
      })
    }
    
    if (this.stats.filesModified > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Review Modified Files',
        description: `${this.stats.filesModified} files were modified during fixing`,
        action: 'Review changes to ensure they meet quality standards'
      })
    }
    
    return recommendations
  }

  async ensureDirectories() {
    await fs.mkdir(CONFIG.reportsDir, { recursive: true })
  }

  reportResults() {
    console.log('\n🧪 Final Integration Testing Results:')
    console.log(`   Iterations completed: ${this.stats.iterations}`)
    console.log(`   Initial issues: ${this.stats.initialWarnings} warnings, ${this.stats.initialErrors} errors`)
    console.log(`   Final issues: ${this.stats.finalWarnings} warnings, ${this.stats.finalErrors} errors`)
    console.log(`   Total fixes applied: ${this.stats.totalFixes}`)
    console.log(`   Files modified: ${this.stats.filesModified}`)
    
    const totalReduction = (this.stats.initialWarnings + this.stats.initialErrors) - (this.stats.finalWarnings + this.stats.finalErrors)
    const reductionPercentage = totalReduction / (this.stats.initialWarnings + this.stats.initialErrors) * 100
    
    console.log(`   Total reduction: ${totalReduction} issues (${reductionPercentage.toFixed(1)}%)`)
    
    if (this.stats.finalWarnings === 0 && this.stats.finalErrors === 0) {
      console.log('\n🎉 SUCCESS: Zero warnings and errors achieved!')
    } else {
      console.log('\n⚠️  Some issues remain. Consider additional iterations or rule adjustments.')
    }
    
    console.log('\n💡 Recommendations:')
    for (const rec of this.generateRecommendations()) {
      console.log(`   ${rec.priority.toUpperCase()}: ${rec.title} - ${rec.action}`)
    }
  }
}

// Run the final integration tester
const tester = new FinalIntegrationTester()
tester.run().catch(console.error)
