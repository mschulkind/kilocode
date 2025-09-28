#!/usr/bin/env node

/**
 * Documentation Structure Auditor
 * 
 * Comprehensive documentation structure audit system that:
 * 1. Analyzes overall documentation architecture
 * 2. Identifies structural inconsistencies
 * 3. Maps document relationships and dependencies
 * 4. Evaluates navigation patterns and user journeys
 * 5. Generates comprehensive structure reports and recommendations
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

// Structure analysis criteria
const STRUCTURE_CRITERIA = {
  // Directory structure standards
  directoryStructure: {
    requiredRootDirs: ['architecture', 'tools', 'standards', 'services'],
    recommendedRootDirs: ['build', 'testing', 'improvements', 'integrations'],
    maxDepth: 4,
    maxFilesPerDir: 20
  },
  
  // Document relationship standards
  relationships: {
    minInternalLinks: 3,
    maxInternalLinks: 50,
    minExternalLinks: 1,
    maxExternalLinks: 20,
    requireBidirectionalLinks: true
  },
  
  // Navigation standards
  navigation: {
    requireBreadcrumbs: true,
    requireTableOfContents: true,
    requireNavigationFooter: true,
    requireBackLinks: true,
    requireGlossaryLinks: true
  },
  
  // Content structure standards
  content: {
    minWordCount: 100,
    maxWordCount: 10000,
    minSectionCount: 3,
    maxSectionCount: 20,
    requireTitle: true,
    requireIntroduction: true,
    requireConclusion: true
  }
}

class StructureAuditor {
  constructor() {
    this.stats = {
      filesAnalyzed: 0,
      directoriesAnalyzed: 0,
      issuesFound: 0,
      errors: 0
    }
    this.auditResults = {
      directoryStructure: {},
      documentRelationships: {},
      navigationPatterns: {},
      contentStructure: {},
      userJourneys: {},
      recommendations: []
    }
    this.fileMap = new Map()
    this.linkGraph = new Map()
  }

  async run() {
    console.log('🔍 Starting documentation structure audit...')
    
    try {
      // Ensure directories exist
      await this.ensureDirectories()
      
      // Phase 1: Directory structure analysis
      await this.analyzeDirectoryStructure()
      
      // Phase 2: Document relationship mapping
      await this.mapDocumentRelationships()
      
      // Phase 3: Navigation pattern analysis
      await this.analyzeNavigationPatterns()
      
      // Phase 4: Content structure evaluation
      await this.evaluateContentStructure()
      
      // Phase 5: User journey analysis
      await this.analyzeUserJourneys()
      
      // Phase 6: Generate recommendations
      await this.generateRecommendations()
      
      // Phase 7: Generate reports
      await this.generateReports()
      
      // Report results
      this.reportResults()
      
    } catch (error) {
      console.error('❌ Error during structure audit:', error)
      this.stats.errors++
    }
  }

  async analyzeDirectoryStructure() {
    console.log('📁 Analyzing directory structure...')
    
    const directories = await this.getDirectoryStructure()
    this.auditResults.directoryStructure = {
      totalDirectories: directories.length,
      maxDepth: this.getMaxDepth(directories),
      directoryStats: this.analyzeDirectoryStats(directories),
      issues: this.findDirectoryIssues(directories)
    }
    
    this.stats.directoriesAnalyzed = directories.length
  }

  async getDirectoryStructure() {
    const directories = []
    const stack = [{ path: CONFIG.docsRoot, depth: 0 }]
    
    while (stack.length > 0) {
      const { path: dirPath, depth } = stack.pop()
      
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        const subdirs = entries.filter(entry => entry.isDirectory())
        const files = entries.filter(entry => entry.isFile() && entry.name.endsWith('.md'))
        
        directories.push({
          path: path.relative(CONFIG.docsRoot, dirPath),
          depth: depth,
          subdirCount: subdirs.length,
          fileCount: files.length,
          totalFiles: files.length,
          subdirs: subdirs.map(d => d.name),
          files: files.map(f => f.name)
        })
        
        // Add subdirectories to stack
        for (const subdir of subdirs) {
          if (depth < STRUCTURE_CRITERIA.directoryStructure.maxDepth) {
            stack.push({
              path: path.join(dirPath, subdir.name),
              depth: depth + 1
            })
          }
        }
      } catch (error) {
        console.log(`⚠️  Cannot read directory ${dirPath}: ${error.message}`)
      }
    }
    
    return directories
  }

  getMaxDepth(directories) {
    return Math.max(...directories.map(d => d.depth))
  }

  analyzeDirectoryStats(directories) {
    const stats = {
      byDepth: {},
      byFileCount: {},
      averageFilesPerDir: 0,
      totalFiles: 0,
      totalDirs: directories.length
    }
    
    for (const dir of directories) {
      // Group by depth
      if (!stats.byDepth[dir.depth]) {
        stats.byDepth[dir.depth] = { count: 0, totalFiles: 0 }
      }
      stats.byDepth[dir.depth].count++
      stats.byDepth[dir.depth].totalFiles += dir.fileCount
      
      // Group by file count
      const fileCountRange = this.getFileCountRange(dir.fileCount)
      if (!stats.byFileCount[fileCountRange]) {
        stats.byFileCount[fileCountRange] = 0
      }
      stats.byFileCount[fileCountRange]++
      
      stats.totalFiles += dir.fileCount
    }
    
    stats.averageFilesPerDir = stats.totalFiles / stats.totalDirs
    
    return stats
  }

  getFileCountRange(fileCount) {
    if (fileCount === 0) return '0 files'
    if (fileCount <= 5) return '1-5 files'
    if (fileCount <= 10) return '6-10 files'
    if (fileCount <= 20) return '11-20 files'
    return '20+ files'
  }

  findDirectoryIssues(directories) {
    const issues = []
    
    for (const dir of directories) {
      // Check depth
      if (dir.depth > STRUCTURE_CRITERIA.directoryStructure.maxDepth) {
        issues.push({
          type: 'excessive_depth',
          severity: 'warning',
          directory: dir.path,
          message: `Directory depth ${dir.depth} exceeds maximum ${STRUCTURE_CRITERIA.directoryStructure.maxDepth}`,
          suggestion: 'Consider flattening the directory structure'
        })
      }
      
      // Check file count
      if (dir.fileCount > STRUCTURE_CRITERIA.directoryStructure.maxFilesPerDir) {
        issues.push({
          type: 'too_many_files',
          severity: 'warning',
          directory: dir.path,
          message: `Directory has ${dir.fileCount} files, maximum recommended is ${STRUCTURE_CRITERIA.directoryStructure.maxFilesPerDir}`,
          suggestion: 'Consider splitting into subdirectories'
        })
      }
      
      // Check for empty directories
      if (dir.fileCount === 0 && dir.subdirCount === 0) {
        issues.push({
          type: 'empty_directory',
          severity: 'info',
          directory: dir.path,
          message: 'Directory is empty',
          suggestion: 'Add content or remove if unnecessary'
        })
      }
    }
    
    return issues
  }

  async mapDocumentRelationships() {
    console.log('🔗 Mapping document relationships...')
    
    const files = await this.findMarkdownFiles()
    const relationships = {
      totalFiles: files.length,
      linkStats: { internal: 0, external: 0, broken: 0 },
      documentGraph: {},
      orphanedDocuments: [],
      highlyConnectedDocuments: [],
      linkPatterns: {}
    }
    
    // Build file map and link graph
    for (const file of files) {
      const relativePath = path.relative(CONFIG.docsRoot, file)
      const content = await fs.readFile(file, 'utf8')
      
      this.fileMap.set(relativePath, {
        path: relativePath,
        content: content,
        wordCount: content.split(/\s+/).length,
        linkCount: (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length
      })
      
      this.linkGraph.set(relativePath, [])
    }
    
    // Analyze links in each document
    for (const [filePath, fileData] of this.fileMap) {
      const links = this.extractLinks(fileData.content, filePath)
      relationships.documentGraph[filePath] = links
      
      for (const link of links) {
        relationships.linkStats.internal += link.type === 'internal' ? 1 : 0
        relationships.linkStats.external += link.type === 'external' ? 1 : 0
        relationships.linkStats.broken += link.type === 'broken' ? 1 : 0
        
        if (link.type === 'internal' && this.fileMap.has(link.target)) {
          this.linkGraph.get(filePath).push(link.target)
        }
      }
    }
    
    // Find orphaned and highly connected documents
    relationships.orphanedDocuments = this.findOrphanedDocuments()
    relationships.highlyConnectedDocuments = this.findHighlyConnectedDocuments()
    relationships.linkPatterns = this.analyzeLinkPatterns()
    
    this.auditResults.documentRelationships = relationships
    this.stats.filesAnalyzed = files.length
  }

  async findMarkdownFiles() {
    const pattern = path.join(CONFIG.docsRoot, CONFIG.patterns.markdown)
    const files = await glob(pattern, { 
      ignore: CONFIG.patterns.exclude,
      absolute: true 
    })
    
    return files.filter(file => {
      try {
        const stats = fsSync.statSync(file)
        return stats.size <= CONFIG.maxFileSize
      } catch (error) {
        return false
      }
    })
  }

  extractLinks(content, sourcePath) {
    const links = []
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match
    
    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, text, url] = match
      const link = {
        text: text,
        url: url,
        source: sourcePath,
        type: this.classifyLink(url, sourcePath)
      }
      links.push(link)
    }
    
    return links
  }

  classifyLink(url, sourcePath) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return 'external'
    } else if (url.startsWith('#')) {
      return 'anchor'
    } else if (url.startsWith('./') || url.startsWith('../') || !url.includes('://')) {
      // Check if internal link exists
      const targetPath = this.resolveLinkPath(url, sourcePath)
      return this.fileMap.has(targetPath) ? 'internal' : 'broken'
    }
    return 'unknown'
  }

  resolveLinkPath(url, sourcePath) {
    const sourceDir = path.dirname(sourcePath)
    const resolvedPath = path.resolve(sourceDir, url)
    return path.relative(CONFIG.docsRoot, resolvedPath)
  }

  findOrphanedDocuments() {
    const orphaned = []
    const incomingLinks = new Set()
    
    // Collect all incoming links
    for (const links of this.linkGraph.values()) {
      for (const link of links) {
        incomingLinks.add(link)
      }
    }
    
    // Find documents with no incoming links
    for (const filePath of this.fileMap.keys()) {
      if (!incomingLinks.has(filePath) && filePath !== 'README.md') {
        orphaned.push(filePath)
      }
    }
    
    return orphaned
  }

  findHighlyConnectedDocuments() {
    const connections = []
    
    for (const [filePath, links] of this.linkGraph) {
      const incomingCount = Array.from(this.linkGraph.values())
        .flat()
        .filter(link => link === filePath).length
      
      const outgoingCount = links.length
      const totalConnections = incomingCount + outgoingCount
      
      if (totalConnections > 10) { // Threshold for highly connected
        connections.push({
          file: filePath,
          incoming: incomingCount,
          outgoing: outgoingCount,
          total: totalConnections
        })
      }
    }
    
    return connections.sort((a, b) => b.total - a.total)
  }

  analyzeLinkPatterns() {
    const patterns = {
      bidirectionalLinks: 0,
      unidirectionalLinks: 0,
      brokenLinkPatterns: {},
      commonLinkTargets: {}
    }
    
    for (const [source, links] of this.linkGraph) {
      for (const target of links) {
        // Check for bidirectional links
        const targetLinks = this.linkGraph.get(target) || []
        if (targetLinks.includes(source)) {
          patterns.bidirectionalLinks++
        } else {
          patterns.unidirectionalLinks++
        }
        
        // Count common link targets
        patterns.commonLinkTargets[target] = (patterns.commonLinkTargets[target] || 0) + 1
      }
    }
    
    return patterns
  }

  async analyzeNavigationPatterns() {
    console.log('🧭 Analyzing navigation patterns...')
    
    const navigationAnalysis = {
      totalDocuments: this.fileMap.size,
      navigationCompliance: {},
      breadcrumbPatterns: {},
      tocPatterns: {},
      footerPatterns: {},
      issues: []
    }
    
    for (const [filePath, fileData] of this.fileMap) {
      const navAnalysis = this.analyzeDocumentNavigation(fileData.content, filePath)
      
      // Aggregate navigation compliance
      for (const [pattern, compliant] of Object.entries(navAnalysis)) {
        if (!navigationAnalysis.navigationCompliance[pattern]) {
          navigationAnalysis.navigationCompliance[pattern] = { compliant: 0, total: 0 }
        }
        navigationAnalysis.navigationCompliance[pattern].total++
        if (compliant) {
          navigationAnalysis.navigationCompliance[pattern].compliant++
        }
      }
      
      // Check for navigation issues
      if (!navAnalysis.hasBreadcrumbs) {
        navigationAnalysis.issues.push({
          type: 'missing_breadcrumbs',
          severity: 'warning',
          file: filePath,
          message: 'Document lacks breadcrumb navigation',
          suggestion: 'Add breadcrumb navigation for better user orientation'
        })
      }
      
      if (!navAnalysis.hasTOC) {
        navigationAnalysis.issues.push({
          type: 'missing_toc',
          severity: 'warning',
          file: filePath,
          message: 'Document lacks table of contents',
          suggestion: 'Add table of contents for longer documents'
        })
      }
      
      if (!navAnalysis.hasNavigationFooter) {
        navigationAnalysis.issues.push({
          type: 'missing_navigation_footer',
          severity: 'warning',
          file: filePath,
          message: 'Document lacks navigation footer',
          suggestion: 'Add navigation footer with relevant links'
        })
      }
    }
    
    this.auditResults.navigationPatterns = navigationAnalysis
  }

  analyzeDocumentNavigation(content, filePath) {
    const analysis = {
      hasBreadcrumbs: /←.*back/i.test(content) || /breadcrumb/i.test(content),
      hasTOC: /table of contents/i.test(content) || /## table of contents/i.test(content),
      hasNavigationFooter: /## navigation/i.test(content),
      hasBackLinks: /←.*back/i.test(content),
      hasGlossaryLinks: /📚.*glossary/i.test(content) || /glossary/i.test(content),
      hasForwardLinks: /→.*next/i.test(content) || /next/i.test(content),
      linkCount: (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length
    }
    
    return analysis
  }

  async evaluateContentStructure() {
    console.log('📝 Evaluating content structure...')
    
    const contentAnalysis = {
      totalDocuments: this.fileMap.size,
      structureCompliance: {},
      contentMetrics: {},
      issues: []
    }
    
    for (const [filePath, fileData] of this.fileMap) {
      const structureAnalysis = this.analyzeDocumentStructure(fileData.content, filePath)
      
      // Aggregate structure compliance
      for (const [metric, value] of Object.entries(structureAnalysis)) {
        if (!contentAnalysis.structureCompliance[metric]) {
          contentAnalysis.structureCompliance[metric] = { compliant: 0, total: 0 }
        }
        contentAnalysis.structureCompliance[metric].total++
        if (value) {
          contentAnalysis.structureCompliance[metric].compliant++
        }
      }
      
      // Check for content structure issues
      if (fileData.wordCount < STRUCTURE_CRITERIA.content.minWordCount) {
        contentAnalysis.issues.push({
          type: 'content_too_short',
          severity: 'warning',
          file: filePath,
          message: `Content too short (${fileData.wordCount} words, minimum ${STRUCTURE_CRITERIA.content.minWordCount})`,
          suggestion: 'Expand content with more detailed information'
        })
      }
      
      if (fileData.wordCount > STRUCTURE_CRITERIA.content.maxWordCount) {
        contentAnalysis.issues.push({
          type: 'content_too_long',
          severity: 'warning',
          file: filePath,
          message: `Content too long (${fileData.wordCount} words, maximum ${STRUCTURE_CRITERIA.content.maxWordCount})`,
          suggestion: 'Consider splitting into multiple documents'
        })
      }
      
      if (structureAnalysis.sectionCount < STRUCTURE_CRITERIA.content.minSectionCount) {
        contentAnalysis.issues.push({
          type: 'too_few_sections',
          severity: 'warning',
          file: filePath,
          message: `Too few sections (${structureAnalysis.sectionCount}, minimum ${STRUCTURE_CRITERIA.content.minSectionCount})`,
          suggestion: 'Add more sections to improve document structure'
        })
      }
    }
    
    this.auditResults.contentStructure = contentAnalysis
  }

  analyzeDocumentStructure(content, filePath) {
    const lines = content.split('\n')
    const headings = lines.filter(line => /^#{1,6}\s+/.test(line))
    
    return {
      hasTitle: /^#\s+/.test(content),
      hasIntroduction: /## introduction/i.test(content) || /## overview/i.test(content),
      hasConclusion: /## conclusion/i.test(content) || /## summary/i.test(content),
      sectionCount: headings.length,
      hasProperHierarchy: this.checkHeadingHierarchy(headings),
      hasRequiredSections: this.checkRequiredSections(content),
      averageSectionLength: this.calculateAverageSectionLength(content, headings.length)
    }
  }

  checkHeadingHierarchy(headings) {
    let expectedLevel = 1
    for (const heading of headings) {
      const level = heading.match(/^(#{1,6})/)[1].length
      if (level > expectedLevel + 1) {
        return false
      }
      expectedLevel = level
    }
    return true
  }

  checkRequiredSections(content) {
    const requiredSections = ['When You\'re Here', 'Research Context', 'No Dead Ends Policy', 'Navigation']
    return requiredSections.every(section => 
      content.toLowerCase().includes(section.toLowerCase())
    )
  }

  calculateAverageSectionLength(content, sectionCount) {
    if (sectionCount === 0) return 0
    const wordCount = content.split(/\s+/).length
    return Math.round(wordCount / sectionCount)
  }

  async analyzeUserJourneys() {
    console.log('👤 Analyzing user journeys...')
    
    const journeyAnalysis = {
      entryPoints: this.findEntryPoints(),
      commonPaths: this.findCommonPaths(),
      deadEnds: this.findDeadEnds(),
      navigationGaps: this.findNavigationGaps(),
      recommendations: []
    }
    
    this.auditResults.userJourneys = journeyAnalysis
  }

  findEntryPoints() {
    const entryPoints = []
    
    for (const [filePath, fileData] of this.fileMap) {
      if (filePath === 'README.md' || 
          filePath.includes('getting-started') || 
          filePath.includes('index') ||
          filePath.includes('overview')) {
        entryPoints.push({
          file: filePath,
          type: 'primary',
          incomingLinks: this.getIncomingLinkCount(filePath)
        })
      }
    }
    
    return entryPoints
  }

  findCommonPaths() {
    const paths = []
    const visited = new Set()
    
    // Start from entry points and trace common paths
    for (const entryPoint of this.findEntryPoints()) {
      const path = this.tracePath(entryPoint.file, visited)
      if (path.length > 1) {
        paths.push(path)
      }
    }
    
    return paths
  }

  tracePath(startFile, visited) {
    const path = [startFile]
    visited.add(startFile)
    
    const links = this.linkGraph.get(startFile) || []
    for (const link of links) {
      if (!visited.has(link)) {
        const subPath = this.tracePath(link, visited)
        path.push(...subPath)
      }
    }
    
    return path
  }

  findDeadEnds() {
    const deadEnds = []
    
    for (const [filePath, links] of this.linkGraph) {
      if (links.length === 0 && filePath !== 'README.md') {
        deadEnds.push(filePath)
      }
    }
    
    return deadEnds
  }

  findNavigationGaps() {
    const gaps = []
    
    for (const [filePath, links] of this.linkGraph) {
      const incomingCount = this.getIncomingLinkCount(filePath)
      const outgoingCount = links.length
      
      if (incomingCount === 0 && outgoingCount === 0) {
        gaps.push({
          file: filePath,
          type: 'isolated',
          message: 'Document is completely isolated'
        })
      } else if (incomingCount === 0) {
        gaps.push({
          file: filePath,
          type: 'no_incoming',
          message: 'Document has no incoming links'
        })
      } else if (outgoingCount === 0) {
        gaps.push({
          file: filePath,
          type: 'no_outgoing',
          message: 'Document has no outgoing links'
        })
      }
    }
    
    return gaps
  }

  getIncomingLinkCount(filePath) {
    let count = 0
    for (const links of this.linkGraph.values()) {
      if (links.includes(filePath)) {
        count++
      }
    }
    return count
  }

  async generateRecommendations() {
    console.log('💡 Generating recommendations...')
    
    const recommendations = []
    
    // Directory structure recommendations
    const dirIssues = this.auditResults.directoryStructure.issues
    if (dirIssues.length > 0) {
      recommendations.push({
        category: 'directory_structure',
        priority: 'high',
        title: 'Improve Directory Structure',
        description: `${dirIssues.length} directory structure issues found`,
        actions: dirIssues.map(issue => issue.suggestion)
      })
    }
    
    // Document relationship recommendations
    const orphanedDocs = this.auditResults.documentRelationships.orphanedDocuments
    if (orphanedDocs.length > 0) {
      recommendations.push({
        category: 'document_relationships',
        priority: 'high',
        title: 'Address Orphaned Documents',
        description: `${orphanedDocs.length} orphaned documents found`,
        actions: ['Add incoming links to orphaned documents', 'Remove unused documents', 'Improve document discovery']
      })
    }
    
    // Navigation recommendations
    const navIssues = this.auditResults.navigationPatterns.issues
    if (navIssues.length > 0) {
      recommendations.push({
        category: 'navigation',
        priority: 'medium',
        title: 'Improve Navigation Patterns',
        description: `${navIssues.length} navigation issues found`,
        actions: ['Add missing breadcrumbs', 'Implement table of contents', 'Add navigation footers']
      })
    }
    
    // Content structure recommendations
    const contentIssues = this.auditResults.contentStructure.issues
    if (contentIssues.length > 0) {
      recommendations.push({
        category: 'content_structure',
        priority: 'medium',
        title: 'Improve Content Structure',
        description: `${contentIssues.length} content structure issues found`,
        actions: ['Expand short documents', 'Split long documents', 'Add required sections']
      })
    }
    
    // User journey recommendations
    const deadEnds = this.auditResults.userJourneys.deadEnds
    if (deadEnds.length > 0) {
      recommendations.push({
        category: 'user_journeys',
        priority: 'high',
        title: 'Fix Dead Ends',
        description: `${deadEnds.length} dead ends found`,
        actions: ['Add outgoing links to dead-end documents', 'Improve navigation flow', 'Create better user paths']
      })
    }
    
    this.auditResults.recommendations = recommendations
  }

  async generateReports() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // Summary report
    const summary = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      auditResults: {
        directoryStructure: {
          totalDirectories: this.auditResults.directoryStructure.totalDirectories,
          maxDepth: this.auditResults.directoryStructure.maxDepth,
          issues: this.auditResults.directoryStructure.issues.length
        },
        documentRelationships: {
          totalFiles: this.auditResults.documentRelationships.totalFiles,
          linkStats: this.auditResults.documentRelationships.linkStats,
          orphanedDocuments: this.auditResults.documentRelationships.orphanedDocuments.length
        },
        navigationPatterns: {
          totalDocuments: this.auditResults.navigationPatterns.totalDocuments,
          issues: this.auditResults.navigationPatterns.issues.length
        },
        contentStructure: {
          totalDocuments: this.auditResults.contentStructure.totalDocuments,
          issues: this.auditResults.contentStructure.issues.length
        },
        userJourneys: {
          entryPoints: this.auditResults.userJourneys.entryPoints.length,
          deadEnds: this.auditResults.userJourneys.deadEnds.length,
          navigationGaps: this.auditResults.userJourneys.navigationGaps.length
        }
      },
      recommendations: this.auditResults.recommendations
    }
    
    // Save reports
    const summaryPath = path.join(CONFIG.reportsDir, `structure-audit-summary-${timestamp}.json`)
    const detailedPath = path.join(CONFIG.reportsDir, `structure-audit-detailed-${timestamp}.json`)
    
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
    await fs.writeFile(detailedPath, JSON.stringify(this.auditResults, null, 2))
    
    console.log(`📊 Reports saved to ${CONFIG.reportsDir}`)
  }

  async ensureDirectories() {
    await fs.mkdir(CONFIG.reportsDir, { recursive: true })
  }

  reportResults() {
    console.log('\n🔍 Documentation Structure Audit Results:')
    console.log(`   Files analyzed: ${this.stats.filesAnalyzed}`)
    console.log(`   Directories analyzed: ${this.stats.directoriesAnalyzed}`)
    console.log(`   Issues found: ${this.stats.issuesFound}`)
    console.log(`   Errors: ${this.stats.errors}`)
    
    console.log('\n📊 Structure Overview:')
    console.log(`   Total directories: ${this.auditResults.directoryStructure.totalDirectories}`)
    console.log(`   Max directory depth: ${this.auditResults.directoryStructure.maxDepth}`)
    console.log(`   Total documents: ${this.auditResults.documentRelationships.totalFiles}`)
    console.log(`   Orphaned documents: ${this.auditResults.documentRelationships.orphanedDocuments.length}`)
    console.log(`   Dead ends: ${this.auditResults.userJourneys.deadEnds.length}`)
    
    console.log('\n💡 Recommendations:')
    for (const rec of this.auditResults.recommendations) {
      console.log(`   ${rec.priority.toUpperCase()}: ${rec.title} (${rec.description})`)
    }
    
    console.log(`\n📊 Reports generated in: ${CONFIG.reportsDir}`)
  }
}

// Run the auditor
const auditor = new StructureAuditor()
auditor.run().catch(console.error)
