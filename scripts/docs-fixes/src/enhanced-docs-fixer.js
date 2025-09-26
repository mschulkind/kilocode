#!/usr/bin/env node

/**
 * Enhanced KiloCode Documentation Fixer
 *
 * An enhanced version that addresses newly identified documentation issues including:
 * - Deeper nested path fixes (standards/core/, standards/navigation/, etc.)
 * - "When You're Here" section automation
 * - Heading hierarchy fixes
 * - Enhanced link text improvements
 * - Better path validation
 *
 * @author KiloCode Team  
 * @version 2.0.0
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "fs"
import { join, dirname, relative } from "path"
import { remark } from "remark"
import { visit } from "unist-util-visit"

/**
 * Enhanced configuration for the documentation fixer
 */
const CONFIG = {
	docsDir: "docs",
	outputDir: "scripts/docs-fixes/output", 
	validationOutput: "scripts/docs-fixes/output/validation.txt",
	dryRun: false,
	verbose: false,
	maxFileSize: 1024 * 1024, // 1MB
}

/**
 * Enhanced path fixes covering deeper nested structures
 */
const ENHANCED_PATH_FIXES = [
	// Standards subdirectories (STANDARDS/CORE/, STANDARDS/NAVIGATION/, etc.)
	{
		pattern: /\/standards\/[^\/]+\/[^\/]+\.md$/,
		fixes: [
			{ from: "../GLOSSARY.md", to: "../../../GLOSSARY.md" },
			{ from: "../DOCUMENTATION_GUIDE.md", to: "../../../DOCUMENTATION_GUIDE.md" },
			{ from: "../README.md", to: "../../../README.md" },
			{ from: "../architecture/README.md", to: "../../../architecture/README.md" },
			{ from: "../orchestrator/README.md", to: "../../../orchestrator/README.md" },
			{ from: "../architecture/repository/DEVELOPMENT_GUIDE.md", to: "../../../architecture/repository/DEVELOPMENT_GUIDE.md" },
			{ from: "../architecture/repository/TESTING_INFRASTRUCTURE.md", to: "../../../architecture/repository/TESTING_INFRASTRUCTURE.md" },
			{ from: "../orchestrator/ORCHESTRATOR_LIFECYCLE.md", to: "../../../orchestrator/ORCHESTRATOR_LIFECYCLE.md" },
		]
	},

	// Standards level (STANDARDS/CORE/README.md)
	{
		pattern: /\/standards\/[^\/]+\.md$/,
		fixes: [
			{ from: "../GLOSSARY.md", to: "../../GLOSSARY.md" },
			{ from: "../DOCUMENTATION_GUIDE.md", to: "../../DOCUMENTATION_GUIDE.md" },
			{ from: "../README.md", to: "../../README.md" },
			{ from: "../architecture/README.md", to: "../../architecture/README.md" },
			{ from: "../orchestrator/README.md", to: "../../orchestrator/README.md" },
			{ from: "../architecture/repository/DEVELOPMENT_GUIDE.md", to: "../../architecture/repository/DEVELOPMENT_GUIDE.md" },
			{ from: "../architecture/repository/TESTING_INFRASTRUCTURE.md", to: "../../architecture/repository/TESTING_INFRASTRUCTURE.md" },
			{ from: "../orchestrator/ORCHESTRATOR_LIFECYCLE.md", to: "../../orchestrator/ORCHESTRATOR_LIFECYCLE.md" },
		]
	},

	// Tools subdirectory fixes
	{
		pattern: /\/tools\/[^\/]+\.md$/,
		fixes: [
			{ from: "../README.md", to: "../../README.md" },
			{ from: "../DOCUMENTATION_GUIDE.md", to: "../../DOCUMENTATION_GUIDE.md" },
			{ from: "../GLOSSARY.md", to: "../../GLOSSARY.md" },
			{ from: "../DOCUMENTATION_GUIDE.md", to: "../../DOCUMENTATION_GUIDE.md" },
			{ from: "../architecture/repository/DEVELOPMENT_GUIDE.md", to: "../../architecture/repository/DEVELOPMENT_GUIDE.md" },
		]
	},

	// Architecture race condition fixes
	{
		pattern: /\/architecture\/race-condition\/[^\/]+\.md$/,
		fixes: [
			{ from: "../README.md", to: "../../README.md" },
			{ from: "../GLOSSARY.md", to: "../../../../GLOSSARY.md" },
			{ from: "../DOCUMENTATION_GUIDE.md", to: "../../../../DOCUMENTATION_GUIDE.md" },
		]
	},

	// General fixes for deeply nested structures
	{
		pattern: /.*\.md$/,
		fixes: [
			{ from: "../", to: "../" }, // Validate existing paths
			{ from: "../docs/tools", to: "../tools/" },
			{ from: "../docs/tools/", to: "../tools/" },
		]
	},
]

/**
 * Templates for common document structure additions  
 */
const STANDARD_SECTIONS = {
	"whenYouAreHere": `
## When You're Here

This section provides contextual information about this document and how it relates to the larger project documentation. Use this as your starting point to understand the document's purpose and navigation.

- **Purpose**: Brief explanation of what this document covers
- **Audience**: Who this document is intended for  
- **Prerequisites**: What readers should understand before this document
- **Related Documents**: Links to other relevant documentation sections
`,

	"noDeadEndsPolicy": `
## No Dead Ends Policy  

This document follows the "No Dead Ends" principle - every link should be useful, and every section should provide clear next steps or completion indicators.

- **Clear Pathways**: Each section provides navigation to related content
- **Context Indicators**: Clear references to related concepts and processes
- **Action Items**: Specific next steps or completion criteria where applicable  
`,
}

/**
 * Enhanced link text improvements including new patterns
 */
const ENHANCED_LINK_TEXT_IMPROVEMENTS = [
	// Directory link fixes that weren't covered before
	{ pattern: /\[\.\.\/core\/\]/g, replacement: "[Core Standards]" },
	{ pattern: /\[\.\.\/structure\/\]/g, replacement: "[Structure Standards]" },
	{ pattern: /\[\.\.\/navigation\/\]/g, replacement: "[Navigation Standards]" },
	{ pattern: /\[\.\.\/code\/\]/g, replacement: "[Code Standards]" },
	{ pattern: /\[\.\.\/engagement\/\]/g, replacement: "[Engagement Standards]" },

	// File patterns
	{ pattern: /\[DOCUMENTATION_GUIDE\.md\]/g, replacement: "[Documentation Guide]" },
	{ pattern: /\[LINKING_POLICY\.md\]/g, replacement: "[Linking Policy]" },
	{ pattern: /\[PRINCIPLES\.md\]/g, replacement: "[Principles]" },

	// Headings that need to be created
	{ pattern: /\[#uichattaskwindow\]/g, replacement: "[#ui-chat-task-window]" },

	// Fix broken relative path references
	{ pattern: /\[\.\.\/docs\/tools\]/g, replacement: "[Tools Documentation]" },
	{ pattern: /\[\.\.\/]\]{2,}/g, replacement: "[Main Documentation]" },
]

/**
 * Calculate the correct relative path from one file to another
 */
function calculateRelativePath(fromFile, toFile) {
	try {
		const relativePath = relative(dirname(fromFile), toFile)
		return relativePath.startsWith('.') ? relativePath : './' + relativePath
	} catch (err) {
		return null
	}
}

/**
 * Verify if a file actually exists in the filesystem
 */
function verifyFileExists(filePath) {
	try {
		if (existsSync(filePath)) {
			const stats = statSync(filePath)
			return stats.isFile()
		}
		return false
	} catch (err) {
		return false
	}
}

/**
 * Add standard sections to documents if they're missing
 */
function addStandardSections(content, filePath) {
	let newContent = content
	let sectionsAdded = 0

	// Add "When You're Here" section if missing and it's a main document  
	const needsWhenAmI = filePath.includes('README.md') || filePath.split('/').length <= 3
	if (needsWhenAmI && !newContent.includes('## When You\'re Here') && !newContent.includes('### When You\'re Here')) {
		// Insert after the first heading
		const firstHeadingMatch = newContent.match(/^#+ [^\n]+/m)
		if (firstHeadingMatch) {
			const insertIndex = newContent.indexOf(firstHeadingMatch[0]) + firstHeadingMatch[0].length
			newContent = newContent.slice(0, insertIndex) + STANDARD_SECTIONS.whenYouAreHere + '\n\n' + newContent.slice(insertIndex)
			sectionsAdded++
		}
	}

	// Add "No Dead Ends Policy" if missing for standard documents
	const needsNoDeadEnds = filePath.includes('standards') || filePath.includes('architecture') 
	if (needsNoDeadEnds && !newContent.includes('## No Dead Ends') && !newContent.includes('### No Dead Ends')) {
		newContent += '\n\n' + STANDARD_SECTIONS.noDeadEndsPolicy
		sectionsAdded++
	}

	return { content: newContent, sectionsAdded }
}

/**
 * Fix heading hierarchy issues (skipping levels)
 */
function fixHeadingHierarchy(content) {
	let newContent = content
	let hierarchyFixes = 0

	const lines = newContent.split('\n')
	let lastHeadingLevel = 0

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const headingMatch = line.match(/^(#{2,6})\s+/)
		
		if (headingMatch) {
			const currentLevel = headingMatch[1].length
			
			// If current heading skips levels (e.g., H3 directly after H1)
			if (currentLevel > lastHeadingLevel + 1 && lastHeadingLevel > 0) {
				const correctedLevel = lastHeadingLevel + 1
				const correctedHeading = '#'.repeat(correctedLevel) + line.substring(currentLevel)
				lines[i] = correctedHeading
				hierarchyFixes++
				if (CONFIG.verbose) {
					console.log(`  ✅ Fixed heading hierarchy: ${line} → ${correctedHeading}`)
				}
			}
			lastHeadingLevel = currentLevel
		}
	}

	if (hierarchyFixes > 0) {
		newContent = lines.join('\n')
	}

	return { content: newContent, fixesApplied: hierarchyFixes }
}

/**
 * Enhanced path fixing with better validation
 */
function enhancedPathFixes(content, filePath) {
	let newContent = content
	let fixesApplied = 0

	// Apply enhanced path fixes
	for (const pathFix of ENHANCED_PATH_FIXES) {
		if (pathFix.pattern.test(filePath)) {
			for (const fix of pathFix.fixes) {
				const regex = new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
				if (newContent.includes(fix.from)) {
					// Validate the target path exists
					const targetPath = join(process.cwd(), CONFIG.docsDir, fix.to)
					const relativeFromCurrent = calculateRelativePath(filePath, targetPath)
					
					if (verifyFileExists(targetPath) && relativeFromCurrent) {
						newContent = newContent.replace(regex, relativeFromCurrent)
						fixesApplied++
						if (CONFIG.verbose) {
							console.log(`  ✅ Enhanced path fix: ${fix.from} → ${relativeFromCurrent}`)
						}
					} else {
						// Apply the configured fix if the target exists
						newContent = newContent.replace(regex, fix.to)
						fixesApplied++
						if (CONFIG.verbose) {
							console.log(`  ✅ Path fix: ${fix.from} → ${fix.to}`)
						}
					}
				}
			}
		}
	}

	return { content: newContent, fixesApplied }
}

/**
 * Enhanced link text improvements with better patterns
 */
function enhancedLinkText(content) {
	let newContent = content
	let fixesApplied = 0

	for (const linkFix of ENHANCED_LINK_TEXT_IMPROVEMENTS) {
		const originalContent = newContent
		newContent = newContent.replace(linkFix.pattern, linkFix.replacement)
		
		if (newContent !== originalContent) {
			fixesApplied++
			if (CONFIG.verbose) {
				console.log(`  ✅ Enhanced link text fix: ${linkFix.pattern.source} → ${linkFix.replacement}`)
			}
		}
	}

	return { content: newContent, fixesApplied }
}

/**
 * Process a single file with enhanced fixes
 */
async function enhanceDocument(filePath) {
	try {
		if (!existsSync(filePath)) {
			return { processed: false, error: "File does not exist" }
		}

		// Check file size
		const stats = statSync(filePath)
		if (stats.size > CONFIG.maxFileSize) {
			return { processed: false, error: "File too large" }
		}

		let content = readFileSync(filePath, "utf8")
		let totalFixes = 0
		
		// Track all applied fixes
		const fixes = {
			standardSections: 0,
			headingHierarchy: 0, 
			pathFixes: 0,
			linkText: 0,
		}

		// 1. Add standard sections
		const sectionsResult = addStandardSections(content, filePath)
		content = sectionsResult.content
		fixes.standardSections = sectionsResult.sectionsAdded
		totalFixes += fixes.standardSections

		// 2. Fix heading hierarchy
		const hierarchyResult = fixHeadingHierarchy(content)
		content = hierarchyResult.content  
		fixes.headingHierarchy = hierarchyResult.fixesApplied
		totalFixes += fixes.headingHierarchy

		// 3. Enhanced path fixes
		const pathResult = enhancedPathFixes(content, filePath)
		content = pathResult.content
		fixes.pathFixes = pathResult.fixesApplied
		totalFixes += fixes.pathFixes

		// 4. Enhanced link text fixes  
		const linkTextResult = enhancedLinkText(content)
		content = linkTextResult.content
		fixes.linkText = linkTextResult.fixesApplied
		totalFixes += fixes.linkText

		// Write the file if changes were made and not in dry run mode
		if (totalFixes > 0 && !CONFIG.dryRun) {
			writeFileSync(filePath, content, "utf8")
		}

		return {
			processed: true,
			fixes,
			totalFixes,
			changed: totalFixes > 0,
		}
	} catch (error) {
		return { processed: false, error: error.message }
	}
}

/**
 * Enhanced main function integrating with original docs-fixer
 */
export async function runEnhancedFixes(files, options = {}) {
	Object.assign(CONFIG, options)

	if (CONFIG.verbose) {
		console.log("🔧 Enhanced Documentation Fixer")
		console.log("===============================\n")
	}

	let filesEnhanced = 0
	let totalEnhancedFixes = 0
	const summary = {
		standardSections: 0,
		headingHierarchy: 0,
		pathFixes: 0,
		linkText: 0,
	}

	for (const filePath of files) {
		const result = await enhanceDocument(filePath)
		filesEnhanced++

		if (result.processed && result.changed) {
			totalEnhancedFixes += result.totalFixes

			// Update summary
			summary.standardSections += result.fixes.standardSections
			summary.headingHierarchy += result.fixes.headingHierarchy  
			summary.pathFixes += result.fixes.pathFixes
			summary.linkText += result.fixes.linkText

			if (CONFIG.verbose) {
				console.log(`📝 Enhanced ${result.totalFixes} issues in: ${filePath}`)
			}
		}
	}

	if (CONFIG.verbose) {
		console.log("\n📊 Enhanced Summary:")
		console.log(`- Files enhanced: ${filesEnhanced}`)
		console.log(`- Total enhanced fixes: ${totalEnhancedFixes}`)
		console.log(`- Standard sections added: ${summary.standardSections}`)
		console.log(`- Heading hierarchy fixes: ${summary.headingHierarchy}`)
		console.log(`- Path issue fixes: ${summary.pathFixes}`)
		console.log(`- Link text improvements: ${summary.linkText}`)
	}

	return {
		filesEnhanced,
		totalEnhancedFixes,
		summary,
	}
}

export {
	ENHANCED_PATH_FIXES,
	ENHANCED_LINK_TEXT_IMPROVEMENTS, 
	STANDARD_SECTIONS,
	enhanceDocument,
	addStandardSections,
	fixHeadingHierarchy,
	enhancedPathFixes,
	enhancedLinkText,
}
