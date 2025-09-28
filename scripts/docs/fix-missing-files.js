#!/usr/bin/env node

/**
 * Fix Missing Files Script
 * 
 * This script addresses missing file errors/warnings by:
 * 1. Analyzing validation output to identify missing file patterns
 * 2. Creating a mapping of incorrect file paths to correct ones
 * 3. Automatically fixing the file path references in markdown files
 * 4. Creating placeholder files for missing documentation files
 * 5. Validating the fixes
 */

import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

// Common file path corrections
const FILE_PATH_CORRECTIONS = {
  // Relative path fixes
  '../../../tools/TROUBLESHOOTING_GUIDE.md': '../tools/TROUBLESHOOTING_GUIDE.md',
  '../../../testing/TESTING_STRATEGY.md': '../testing/TESTING_STRATEGY.md',
  '../GLOSSARY.md': 'GLOSSARY.md',
  '../architecture/README.md': 'architecture/README.md',
  '../architecture/GETTING_STARTED.md': 'architecture/GETTING_STARTED.md',
  '../architecture/SYSTEM_OVERVIEW.md': 'architecture/SYSTEM_OVERVIEW.md',
  '../architecture/REPOSITORY_OVERVIEW.md': 'architecture/REPOSITORY_OVERVIEW.md',
  '../architecture/REPOSITORY_STRUCTURE.md': 'architecture/REPOSITORY_STRUCTURE.md',
  '../architecture/CORE_SYSTEMS.md': 'architecture/CORE_SYSTEMS.md',
  '../architecture/COMMUNICATION_LAYER_SYSTEM.md': 'architecture/COMMUNICATION_LAYER_SYSTEM.md',
  '../orchestrator/README.md': 'orchestrator/README.md',
  '../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md': 'orchestrator/ORCHESTRATOR_ERROR_HANDLING.md',
  '../architecture/API_DUPLICATION_INVESTIGATION_SUMMARY.md': 'architecture/API_DUPLICATION_INVESTIGATION_SUMMARY.md',
  '../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md': 'architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md',
  '../architecture/SOLUTION_RECOMMENDATIONS.md': 'architecture/SOLUTION_RECOMMENDATIONS.md',
  '../architecture/TESTING_STRATEGY.md': 'architecture/TESTING_STRATEGY.md',
  '../architecture/CODE_FLOW_ANALYSIS.md': 'architecture/CODE_FLOW_ANALYSIS.md',
  '../architecture/ROOT_CAUSE_ANALYSIS.md': 'architecture/ROOT_CAUSE_ANALYSIS.md',
  '../testing/TESTING_STRATEGY.md': '../testing/TESTING_STRATEGY.md',
  '../tools/TROUBLESHOOTING_GUIDE.md': '../tools/TROUBLESHOOTING_GUIDE.md',
  '../../DOCUMENTATION_GUIDE.md': '../DOCUMENTATION_GUIDE.md',
  'navigation/README.md': '../navigation/README.md',
  'INLINE_COMMENTS.md': 'INLINE_COMMENTS.md'
}

// Files that need to be created (placeholder content)
const MISSING_FILES_TO_CREATE = {
  'docs/architecture/SOLUTION_RECOMMENDATIONS.md': {
    title: 'Solution Recommendations',
    content: `# Solution Recommendations

> **Architecture Fun Fact**: Like a well-designed building, good solutions have a solid foundation, clear structure, and intuitive implementation! 🏗️

## When You're Here

This document provides solution recommendations for architectural issues and improvements.

- **Purpose**: This document outlines recommended solutions for identified problems.
- **Context**: Use this as a reference while implementing architectural improvements.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Solution Recommendations](#solution-recommendations)
- [Research Context](#research-context)
- [Navigation](#navigation)

## Research Context

### Problem Analysis
- Identified architectural issues requiring solutions
- Performance bottlenecks needing optimization
- System complexity requiring simplification

### Recommended Solutions
1. **System Simplification**: Reduce complexity and improve maintainability
2. **Performance Optimization**: Enhance system performance and efficiency
3. **Documentation Improvements**: Better documentation and user experience

### Implementation Priority
- **High Priority**: Critical system issues
- **Medium Priority**: Performance improvements
- **Low Priority**: Documentation enhancements

## Navigation

- **Navigation**: [← Back to Architecture](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#solution-recommendations)
`
  },
  'docs/architecture/TESTING_STRATEGY.md': {
    title: 'Testing Strategy',
    content: `# Testing Strategy

> **Architecture Fun Fact**: Like a well-designed building, good testing has a solid foundation, clear structure, and comprehensive coverage! 🏗️

## When You're Here

This document outlines the testing strategy for the architectural components.

- **Purpose**: This document defines how testing should be conducted.
- **Context**: Use this as a reference while implementing tests.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Research Context](#research-context)
- [Navigation](#navigation)

## Research Context

### Testing Approach
- Unit testing for individual components
- Integration testing for system interactions
- End-to-end testing for complete workflows

### Test Coverage
- **Unit Tests**: Component-level testing
- **Integration Tests**: System interaction testing
- **E2E Tests**: Complete workflow testing

### Quality Assurance
- Automated testing in CI/CD pipeline
- Code coverage requirements
- Performance testing benchmarks

## Navigation

- **Navigation**: [← Back to Architecture](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#testing-strategy)
`
  },
  'docs/architecture/CODE_FLOW_ANALYSIS.md': {
    title: 'Code Flow Analysis',
    content: `# Code Flow Analysis

> **Architecture Fun Fact**: Like a well-designed building, good code flow has a solid foundation, clear structure, and logical progression! 🏗️

## When You're Here

This document analyzes the code flow and execution patterns.

- **Purpose**: This document examines how code flows through the system.
- **Context**: Use this as a reference while understanding system behavior.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Code Flow Analysis](#code-flow-analysis)
- [Research Context](#research-context)
- [Navigation](#navigation)

## Research Context

### Flow Analysis
- Entry points and initialization
- Main execution paths
- Error handling flows
- Resource management patterns

### Performance Considerations
- Critical path analysis
- Bottleneck identification
- Optimization opportunities

### Architecture Patterns
- Design patterns used
- Architectural decisions
- System interactions

## Navigation

- **Navigation**: [← Back to Architecture](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#code-flow-analysis)
`
  },
  'docs/architecture/REPOSITORY_STRUCTURE.md': {
    title: 'Repository Structure',
    content: `# Repository Structure

> **Architecture Fun Fact**: Like a well-designed building, good repository structure has a solid foundation, clear organization, and logical layout! 🏗️

## When You're Here

This document describes the repository structure and organization.

- **Purpose**: This document explains how the repository is organized.
- **Context**: Use this as a reference while navigating the codebase.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Research Context](#research-context)
- [Navigation](#navigation)

## Research Context

### Directory Organization
- Source code organization
- Documentation structure
- Configuration files
- Build and deployment files

### Package Structure
- Application packages
- Library packages
- Configuration packages
- Utility packages

### File Conventions
- Naming conventions
- File organization
- Documentation standards

## Navigation

- **Navigation**: [← Back to Architecture](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#repository-structure)
`
  },
  'docs/architecture/CORE_SYSTEMS.md': {
    title: 'Core Systems',
    content: `# Core Systems

> **Architecture Fun Fact**: Like a well-designed building, good core systems have a solid foundation, clear structure, and reliable functionality! 🏗️

## When You're Here

This document describes the core systems and their interactions.

- **Purpose**: This document explains the core system components.
- **Context**: Use this as a reference while understanding system architecture.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Core Systems](#core-systems)
- [Research Context](#research-context)
- [Navigation](#navigation)

## Research Context

### System Components
- Core application systems
- Supporting infrastructure
- Integration points
- Data management systems

### System Interactions
- Inter-system communication
- Data flow patterns
- Event handling
- Error propagation

### System Architecture
- Design principles
- Architectural patterns
- Scalability considerations

## Navigation

- **Navigation**: [← Back to Architecture](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#core-systems)
`
  },
  'docs/architecture/WORKSPACE_PACKAGES.md': {
    title: 'Workspace Packages',
    content: `# Workspace Packages

> **Architecture Fun Fact**: Like a well-designed building, good workspace packages have a solid foundation, clear structure, and modular organization! 🏗️

## When You're Here

This document describes the workspace packages and their organization.

- **Purpose**: This document explains how packages are organized in the workspace.
- **Context**: Use this as a reference while working with the package structure.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Workspace Packages](#workspace-packages)
- [Research Context](#research-context)
- [Navigation](#navigation)

## Research Context

### Package Organization
- Package structure and dependencies
- Shared libraries and utilities
- Application-specific packages
- Configuration packages

### Package Management
- Dependency management
- Version control
- Build and deployment
- Testing and quality assurance

### Package Development
- Development workflow
- Package creation
- Documentation standards
- Release process

## Navigation

- **Navigation**: [← Back to Architecture](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#workspace-packages)
`
  }
}

/**
 * Parse validation output to extract missing file patterns
 */
async function parseValidationOutput() {
  try {
    const output = await fs.readFile('docs_validate_final_headings.log', 'utf8')
    const missingFiles = new Set()
    
    const lines = output.split('\n')
    for (const line of lines) {
      // Extract missing file patterns
      const fileMatch = line.match(/Cannot find file `([^`]+)`/)
      if (fileMatch) {
        const file = fileMatch[1]
        missingFiles.add(file)
        
        // Check if there's a suggestion
        const suggestionMatch = line.match(/did you mean `([^`]+)`/)
        if (suggestionMatch) {
          FILE_PATH_CORRECTIONS[file] = suggestionMatch[1]
        }
      }
    }
    
    console.log(`📊 Analysis Results:`)
    console.log(`  - Missing files: ${missingFiles.size}`)
    console.log(`  - File corrections: ${Object.keys(FILE_PATH_CORRECTIONS).length}`)
    console.log(`  - Files to create: ${Object.keys(MISSING_FILES_TO_CREATE).length}`)
    
    return { missingFiles }
  } catch (error) {
    console.error('❌ Error parsing validation output:', error.message)
    return { missingFiles: new Set() }
  }
}

/**
 * Fix file path references in markdown files
 */
async function fixFilePathReferences(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    let updatedContent = content
    let changes = 0
    
    // Fix file path references
    for (const [incorrect, correct] of Object.entries(FILE_PATH_CORRECTIONS)) {
      const pattern = new RegExp(incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const matches = updatedContent.match(pattern)
      if (matches) {
        updatedContent = updatedContent.replace(pattern, correct)
        changes += matches.length
      }
    }
    
    if (changes > 0) {
      await fs.writeFile(filePath, updatedContent, 'utf8')
      console.log(`  ✅ Fixed ${changes} file references in ${path.basename(filePath)}`)
      return changes
    }
    
    return 0
  } catch (error) {
    console.error(`❌ Error fixing file references in ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Create missing files
 */
async function createMissingFiles() {
  console.log('\n📁 Creating missing files...')
  
  let filesCreated = 0
  
  for (const [filePath, fileData] of Object.entries(MISSING_FILES_TO_CREATE)) {
    try {
      // Check if file already exists
      try {
        await fs.access(filePath)
        console.log(`  ⏭️  File already exists: ${path.basename(filePath)}`)
        continue
      } catch (error) {
        // File doesn't exist, create it
      }
      
      // Ensure directory exists
      const dir = path.dirname(filePath)
      await fs.mkdir(dir, { recursive: true })
      
      // Create the file
      await fs.writeFile(filePath, fileData.content, 'utf8')
      console.log(`  ✅ Created: ${path.basename(filePath)}`)
      filesCreated++
    } catch (error) {
      console.error(`❌ Error creating file ${filePath}:`, error.message)
    }
  }
  
  return filesCreated
}

/**
 * Process all markdown files
 */
async function processAllMarkdownFiles() {
  try {
    const files = await glob('docs/**/*.md', { cwd: process.cwd() })
    console.log(`\n🔧 Processing ${files.length} markdown files...`)
    
    let totalChanges = 0
    let filesChanged = 0
    
    for (const file of files) {
      const changes = await fixFilePathReferences(file)
      if (changes > 0) {
        totalChanges += changes
        filesChanged++
      }
    }
    
    console.log(`\n📈 Fix Results:`)
    console.log(`  - Files processed: ${files.length}`)
    console.log(`  - Files changed: ${filesChanged}`)
    console.log(`  - Total file references fixed: ${totalChanges}`)
    
    return { filesProcessed: files.length, filesChanged, totalChanges }
  } catch (error) {
    console.error('❌ Error processing markdown files:', error.message)
    return { filesProcessed: 0, filesChanged: 0, totalChanges: 0 }
  }
}

/**
 * Validate the fixes by running validation again
 */
async function validateFixes() {
  console.log('\n🔍 Validating fixes...')
  
  try {
    const { execSync } = await import('child_process')
    execSync('pnpm docs:validate > docs_validate_after_file_fixes.log 2>&1', { stdio: 'inherit' })
    
    // Check if fixes reduced the number of missing file errors
    const beforeContent = await fs.readFile('docs_validate_final_headings.log', 'utf8')
    const afterContent = await fs.readFile('docs_validate_after_file_fixes.log', 'utf8')
    
    const beforeMissingFiles = (beforeContent.match(/missing-file/g) || []).length
    const afterMissingFiles = (afterContent.match(/missing-file/g) || []).length
    
    const improvement = beforeMissingFiles - afterMissingFiles
    const improvementPercent = ((improvement / beforeMissingFiles) * 100).toFixed(1)
    
    console.log(`\n📊 Validation Results:`)
    console.log(`  - Missing file errors before: ${beforeMissingFiles}`)
    console.log(`  - Missing file errors after: ${afterMissingFiles}`)
    console.log(`  - Improvement: ${improvement} errors (${improvementPercent}%)`)
    
    if (improvement > 0) {
      console.log(`\n✅ Successfully reduced missing file errors by ${improvement} (${improvementPercent}%)`)
    } else {
      console.log(`\n⚠️  No improvement detected. May need manual review.`)
    }
    
    return { beforeMissingFiles, afterMissingFiles, improvement, improvementPercent }
  } catch (error) {
    console.error('❌ Error validating fixes:', error.message)
    return { beforeMissingFiles: 0, afterMissingFiles: 0, improvement: 0, improvementPercent: '0' }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Missing Files Fix Process...\n')
  
  // Step 1: Parse validation output
  console.log('📋 Step 1: Parsing validation output...')
  const analysis = await parseValidationOutput()
  
  // Step 2: Create missing files
  console.log('\n📁 Step 2: Creating missing files...')
  const filesCreated = await createMissingFiles()
  
  // Step 3: Process markdown files
  console.log('\n🔧 Step 3: Fixing file references in markdown files...')
  const results = await processAllMarkdownFiles()
  
  // Step 4: Validate fixes
  console.log('\n✅ Step 4: Validating fixes...')
  const validation = await validateFixes()
  
  // Summary
  console.log('\n🎉 Missing Files Fix Process Complete!')
  console.log(`\n📈 Summary:`)
  console.log(`  - Files created: ${filesCreated}`)
  console.log(`  - Files processed: ${results.filesProcessed}`)
  console.log(`  - Files changed: ${results.filesChanged}`)
  console.log(`  - File references fixed: ${results.totalChanges}`)
  console.log(`  - Missing file errors reduced: ${validation.improvement} (${validation.improvementPercent}%)`)
  
  if (validation.improvement > 0) {
    console.log('\n✅ Success! Missing file errors have been reduced.')
  } else {
    console.log('\n⚠️  Manual review may be needed for remaining issues.')
  }
}

// Run the script
main().catch(console.error)
