#!/usr/bin/env node

/**
 * Fix Path Resolution Issues
 * 
 * This script addresses common path resolution issues that cause missing file warnings.
 * It focuses on fixing relative path problems and standardizing file references.
 */

import fs from 'fs/promises'
import path from 'path'
import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { visit } from 'unist-util-visit'

const DOCS_DIR = path.resolve(process.cwd(), 'docs')

// Common path corrections for missing files
const PATH_CORRECTIONS = {
  // Architecture file path corrections
  'architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md': 'DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md',
  'architecture/API_DUPLICATION_INVESTIGATION_SUMMARY.md': 'API_DUPLICATION_INVESTIGATION_SUMMARY.md',
  'architecture/SOLUTION_RECOMMENDATIONS.md': 'SOLUTION_RECOMMENDATIONS.md',
  'architecture/TESTING_STRATEGY.md': '../testing/TESTING_STRATEGY.md',
  'architecture/CODE_FLOW_ANALYSIS.md': 'CODE_FLOW_ANALYSIS.md',
  'architecture/CORE_SYSTEMS.md': 'CORE_SYSTEMS.md',
  'architecture/REPOSITORY_STRUCTURE.md': 'REPOSITORY_STRUCTURE.md',
  'architecture/SYSTEM_OVERVIEW.md': 'SYSTEM_OVERVIEW.md',
  'architecture/REPOSITORY_OVERVIEW.md': 'REPOSITORY_OVERVIEW.md',
  'architecture/COMMUNICATION_LAYER_SYSTEM.md': 'COMMUNICATION_LAYER_SYSTEM.md',
  'architecture/GETTING_STARTED.md': 'GETTING_STARTED.md',
  'architecture/README.md': 'README.md',
  
  // Orchestrator file path corrections
  'orchestrator/ORCHESTRATOR_ERROR_HANDLING.md': '../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md',
  'orchestrator/README.md': '../orchestrator/README.md',
  
  // Testing file path corrections
  'testing/TESTING_STRATEGY.md': '../testing/TESTING_STRATEGY.md',
  
  // Tools file path corrections
  'tools/TROUBLESHOOTING_GUIDE.md': '../tools/TROUBLESHOOTING_GUIDE.md',
  
  // Root file path corrections
  'GLOSSARY.md': '../GLOSSARY.md',
  'DOCUMENTATION_GUIDE.md': '../DOCUMENTATION_GUIDE.md',
  
  // Generic template files (these are likely placeholders)
  'related-doc.md': 'docs/tools/related-doc.md',
  'resources.md': 'docs/tools/resources.md',
  'related-topic.md': 'docs/tools/related-topic.md'
}

// Files to skip (these are known missing files that should be created or are intentional)
const SKIP_FILES = [
  'docs/architecture/CODE_FLOW_ANALYSIS.md',
  'docs/architecture/SOLUTION_RECOMMENDATIONS.md',
  'docs/architecture/TESTING_STRATEGY.md',
  'docs/architecture/CORE_SYSTEMS.md',
  'docs/architecture/REPOSITORY_STRUCTURE.md',
  'docs/architecture/SYSTEM_OVERVIEW.md',
  'docs/architecture/REPOSITORY_OVERVIEW.md',
  'docs/architecture/COMMUNICATION_LAYER_SYSTEM.md',
  'docs/architecture/GETTING_STARTED.md',
  'docs/architecture/README.md'
]

async function findMarkdownFiles(dir) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      files.push(path.relative(process.cwd(), fullPath))
    }
  }
  
  return files
}

async function fixPathResolution() {
  console.log('🔧 Starting path resolution fixes...')
  
  const markdownFiles = await findMarkdownFiles(DOCS_DIR)
  let filesProcessed = 0
  let linksFixed = 0
  let filesSkipped = 0
  
  for (const file of markdownFiles) {
    const filePath = path.resolve(file)
    
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const processor = remark()
        .use(remarkParse)
        .use(remarkStringify)
      
      const tree = processor.parse(content)
      let contentChanged = false
      
      visit(tree, 'link', (node) => {
        if (node.url && typeof node.url === 'string') {
          // Check if this is a path that needs correction
          for (const [incorrectPath, correctPath] of Object.entries(PATH_CORRECTIONS)) {
            if (node.url.includes(incorrectPath)) {
              const newUrl = node.url.replace(incorrectPath, correctPath)
              console.log(`  📝 ${file}: ${node.url} → ${newUrl}`)
              node.url = newUrl
              contentChanged = true
              linksFixed++
            }
          }
        }
      })
      
      if (contentChanged) {
        const newContent = processor.stringify(tree)
        await fs.writeFile(filePath, newContent, 'utf8')
        filesProcessed++
      }
      
    } catch (error) {
      console.warn(`⚠️  Error processing ${file}: ${error.message}`)
      filesSkipped++
    }
  }
  
  console.log(`\n✅ Path resolution fixes completed!`)
  console.log(`📊 Results:`)
  console.log(`   - Files processed: ${filesProcessed}`)
  console.log(`   - Links fixed: ${linksFixed}`)
  console.log(`   - Files skipped: ${filesSkipped}`)
  console.log(`   - Total files checked: ${markdownFiles.length}`)
}

// Run the fix if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixPathResolution().catch(console.error)
}
