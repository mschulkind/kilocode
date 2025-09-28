/**
 * TOC Generation on Save
 * 
 * Provides automatic Table of Contents generation for markdown files
 * with configurable options and smart detection.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

/**
 * TOC generation configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	levels: '1..6',
	orderedList: false,
	plaintext: false,
	detectIndentation: true,
	omittedFromToc: ['# Table of Contents', '# TOC', '# Contents', '# Navigation'],
	insertAfterFirstHeading: true,
	updateExisting: true,
	backupOriginal: false
}

/**
 * Generate Table of Contents for a markdown file
 * @param {string} content - Markdown content
 * @param {Object} config - TOC configuration
 * @returns {Object} TOC generation result
 */
function generateTOC(content, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const processor = remark()
	const tree = processor.parse(content)
	
	const headings = []
	visit(tree, 'heading', (node) => {
		const level = node.depth
		const text = node.children?.[0]?.value || ''
		
		// Check if heading should be omitted
		const shouldOmit = mergedConfig.omittedFromToc.some(omit => 
			text.toLowerCase().includes(omit.toLowerCase())
		)
		
		if (!shouldOmit) {
			const id = text.toLowerCase()
				.replace(/[^\w\s]/g, '')
				.replace(/\s+/g, '-')
			
			headings.push({
				level,
				text,
				id,
				line: node.position?.start?.line || 0
			})
		}
	})
	
	// Filter headings by level
	const levelRange = parseLevelRange(mergedConfig.levels)
	const filteredHeadings = headings.filter(heading => 
		heading.level >= levelRange.min && heading.level <= levelRange.max
	)
	
	// Generate TOC
	let toc = ''
	if (filteredHeadings.length > 0) {
		toc = '## Table of Contents\n\n'
		
		filteredHeadings.forEach(heading => {
			const indent = '  '.repeat(heading.level - levelRange.min)
			const bullet = mergedConfig.orderedList ? '1.' : '-'
			const linkText = mergedConfig.plaintext ? heading.text : `[${heading.text}](#${heading.id})`
			toc += `${indent}${bullet} ${linkText}\n`
		})
		
		toc += '\n'
	}
	
	return {
		toc,
		headings: filteredHeadings,
		hasTOC: toc.length > 0
	}
}

/**
 * Parse level range from string
 * @param {string} levels - Level range string (e.g., "1..6")
 * @returns {Object} Min and max levels
 */
function parseLevelRange(levels) {
	const match = levels.match(/(\d+)\.\.(\d+)/)
	if (match) {
		return {
			min: parseInt(match[1]),
			max: parseInt(match[2])
		}
	}
	
	// Default range
	return { min: 1, max: 6 }
}

/**
 * Insert TOC into content
 * @param {string} content - Original content
 * @param {string} toc - Generated TOC
 * @param {Object} config - TOC configuration
 * @returns {string} Content with TOC inserted
 */
function insertTOC(content, toc, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	if (!toc) {
		return content
	}
	
	const lines = content.split('\n')
	
	// Find existing TOC
	let existingTOCStart = -1
	let existingTOCEnd = -1
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		if (line.match(/^#+\s*Table\s+of\s+Contents/i) || 
			line.match(/^#+\s*TOC/i) || 
			line.match(/^#+\s*Contents/i)) {
			existingTOCStart = i
			// Find end of TOC (next heading or empty line)
			for (let j = i + 1; j < lines.length; j++) {
				if (lines[j].match(/^#+\s+/) || lines[j].trim() === '') {
					existingTOCEnd = j
					break
				}
			}
			break
		}
	}
	
	// Remove existing TOC if updating
	if (existingTOCStart !== -1 && mergedConfig.updateExisting) {
		lines.splice(existingTOCStart, existingTOCEnd - existingTOCStart)
	}
	
	// Find insertion point
	let insertIndex = 0
	
	if (mergedConfig.insertAfterFirstHeading) {
		// Find the first heading
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].match(/^#+\s+/)) {
				insertIndex = i + 1
				break
			}
		}
	}
	
	// Insert TOC
	lines.splice(insertIndex, 0, toc)
	
	return lines.join('\n')
}

/**
 * Generate TOC for a file and update it
 * @param {string} filePath - Path to the file
 * @param {Object} config - TOC configuration
 * @returns {Promise<Object>} TOC generation result
 */
async function generateTOCForFile(filePath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		
		// Generate TOC
		const tocResult = generateTOC(content, mergedConfig)
		
		if (!tocResult.hasTOC) {
			return {
				file: filePath,
				success: true,
				message: 'No headings found for TOC generation',
				changed: false,
				timestamp: new Date().toISOString()
			}
		}
		
		// Insert TOC into content
		const updatedContent = insertTOC(content, tocResult.toc, mergedConfig)
		
		// Check if content changed
		const changed = updatedContent !== content
		
		if (changed) {
			
			// Write updated content
			fs.writeFileSync(filePath, updatedContent, 'utf8')
		}
		
		return {
			file: filePath,
			success: true,
			message: changed ? 'TOC generated and inserted' : 'TOC already up to date',
			changed,
			headings: tocResult.headings.length,
			timestamp: new Date().toISOString()
		}
		
	} catch (error) {
		return {
			file: filePath,
			success: false,
			error: error.message,
			changed: false,
			timestamp: new Date().toISOString()
		}
	}
}

/**
 * Generate TOC for multiple files
 * @param {Array} filePaths - Array of file paths
 * @param {Object} config - TOC configuration
 * @returns {Promise<Array>} Array of TOC generation results
 */
async function generateTOCForFiles(filePaths, config = {}) {
	const results = []
	
	for (const filePath of filePaths) {
		const result = await generateTOCForFile(filePath, config)
		results.push(result)
	}
	
	return results
}

/**
 * Watch files for changes and auto-generate TOC
 * @param {Array} filePaths - Array of file paths to watch
 * @param {Object} config - TOC configuration
 * @returns {Object} Watcher instance
 */
function watchFilesForTOC(filePaths, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	if (!mergedConfig.enabled) {
		return { stop: () => {} }
	}
	
	const watchers = new Map()
	
	filePaths.forEach(filePath => {
		try {
			const watcher = fs.watch(filePath, async (eventType) => {
				if (eventType === 'change') {
					// Debounce file changes
					setTimeout(async () => {
						try {
							await generateTOCForFile(filePath, mergedConfig)
						} catch (error) {
							console.error(`Error generating TOC for ${filePath}:`, error.message)
						}
					}, 1000)
				}
			})
			
			watchers.set(filePath, watcher)
		} catch (error) {
			console.error(`Error watching file ${filePath}:`, error.message)
		}
	})
	
	return {
		stop: () => {
			watchers.forEach(watcher => watcher.close())
			watchers.clear()
		}
	}
}

/**
 * Get all markdown files from specified targets
 * @param {Array} targets - Array of file/directory paths
 * @returns {Array} Array of markdown file paths
 */
function getMarkdownFiles(targets = ['docs/']) {
	const files = []
	
	function scanDirectory(dir) {
		try {
			const items = fs.readdirSync(dir)
			
			items.forEach(item => {
				const itemPath = path.join(dir, item)
				const stat = fs.statSync(itemPath)
				
				if (stat.isDirectory()) {
					scanDirectory(itemPath)
				} else if (item.endsWith('.md')) {
					files.push(itemPath)
				}
			})
		} catch (error) {
			// Skip directories that can't be read
		}
	}
	
	for (const target of targets) {
		if (!fs.existsSync(target)) {
			console.warn(`Warning: Target "${target}" does not exist, skipping...`)
			continue
		}
		
		const stats = fs.statSync(target)
		
		if (stats.isFile()) {
			// Single file
			if (target.endsWith('.md')) {
				files.push(target)
			} else {
				console.warn(`Warning: "${target}" is not a markdown file, skipping...`)
			}
		} else if (stats.isDirectory()) {
			// Directory - scan for markdown files
			scanDirectory(target)
		}
	}
	
	// Remove duplicates and sort
	return [...new Set(files)].sort()
}

/**
 * Main CLI function
 */
async function main() {
	const args = process.argv.slice(2)
	const targets = []
	
	// Parse arguments
	for (const arg of args) {
		if (arg === '--help' || arg === '-h') {
			console.log(`
\x1b[0;36mKiloCode TOC Generator\x1b[0m

\x1b[1;37mUsage:\x1b[0m node scripts/docs/toc-generator.js [targets...]

\x1b[1;37mTargets:\x1b[0m
  [targets...] Specific files or directories to process (default: docs/)

\x1b[1;37mExamples:\x1b[0m
  node scripts/docs/toc-generator.js
  node scripts/docs/toc-generator.js docs/README.md
  node scripts/docs/toc-generator.js docs/ui/
  node scripts/docs/toc-generator.js docs/architecture/ docs/tools/
`)
			process.exit(0)
		} else if (!arg.startsWith('--')) {
			targets.push(arg)
		}
	}
	
	// Default to docs/ if no targets provided
	const finalTargets = targets.length > 0 ? targets : ['docs/']
	
	console.log('📋 Generating Table of Contents...')
	
	try {
		const markdownFiles = getMarkdownFiles(finalTargets)
		
		if (markdownFiles.length === 0) {
			console.log('No markdown files found in specified targets')
			return
		}
		
		console.log(`Processing ${markdownFiles.length} files...`)
		
		const results = await generateTOCForFiles(markdownFiles)
		
		let successCount = 0
		let changedCount = 0
		
		results.forEach(result => {
			if (result.success) {
				successCount++
				if (result.changed) {
					changedCount++
					console.log(`✅ ${result.file}: ${result.message}`)
				}
			} else {
				console.error(`❌ ${result.file}: ${result.message}`)
			}
		})
		
		console.log(`\n📊 Summary: ${successCount}/${results.length} files processed, ${changedCount} files updated`)
		
	} catch (error) {
		console.error('❌ Error:', error.message)
		process.exit(1)
	}
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}

export {
	generateTOC,
	generateTOCForFile,
	generateTOCForFiles,
	watchFilesForTOC,
	insertTOC,
	getMarkdownFiles,
	DEFAULT_CONFIG
}


