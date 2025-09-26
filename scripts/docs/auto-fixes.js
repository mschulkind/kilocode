/**
 * Automated Fixes Implementation
 * 
 * Provides automated fixes for common markdown issues including
 * TOC generation, formatting standardization, and link fixes.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

/**
 * Auto-fix configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	fixes: {
		toc: true,
		formatting: true,
		links: true,
		headings: true,
		lists: true,
		code: true
	},
	toc: {
		levels: '1..6',
		orderedList: false,
		updateOnSave: true,
		plaintext: false,
		detectIndentation: true,
		omittedFromToc: ['# Table of Contents', '# TOC', '# Contents']
	},
	formatting: {
		lineLength: 100,
		indentSize: 2,
		trimTrailingWhitespace: true,
		insertFinalNewline: true,
		ensureConsistentLineEndings: true
	},
	links: {
		fixBrokenLinks: true,
		standardizeLinkText: true,
		removeDuplicateLinks: true
	},
	headings: {
		standardizeCase: true,
		ensureConsistentSpacing: true,
		removeExtraSpaces: true
	}
}

/**
 * Generate Table of Contents for a markdown file
 * @param {string} content - Markdown content
 * @param {Object} config - TOC configuration
 * @returns {string} Updated content with TOC
 */
function generateTOC(content, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG.toc, ...config }
	
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
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '')
			
			headings.push({
				level,
				text,
				id,
				line: node.position?.start?.line || 0
			})
		}
	})
	
	// Generate TOC
	let toc = ''
	if (headings.length > 0) {
		toc = '## Table of Contents\n\n'
		
		headings.forEach(heading => {
			const indent = '  '.repeat(heading.level - 1)
			const bullet = mergedConfig.orderedList ? '1.' : '-'
			toc += `${indent}${bullet} [${heading.text}](#${heading.id})\n`
		})
		
		toc += '\n'
	}
	
	// Insert TOC after the first heading
	const lines = content.split('\n')
	let insertIndex = 0
	
	// Find the first heading
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].match(/^#+\s+/)) {
			insertIndex = i + 1
			break
		}
	}
	
	// Insert TOC
	lines.splice(insertIndex, 0, toc)
	
	return lines.join('\n')
}

/**
 * Fix common formatting issues
 * @param {string} content - Markdown content
 * @param {Object} config - Formatting configuration
 * @returns {string} Fixed content
 */
function fixFormatting(content, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG.formatting, ...config }
	
	let lines = content.split('\n')
	
	// Trim trailing whitespace
	if (mergedConfig.trimTrailingWhitespace) {
		lines = lines.map(line => line.replace(/\s+$/, ''))
	}
	
	// Ensure consistent line endings
	if (mergedConfig.ensureConsistentLineEndings) {
		lines = lines.map(line => line.replace(/\r\n/g, '\n').replace(/\r/g, '\n'))
	}
	
	// Insert final newline
	if (mergedConfig.insertFinalNewline && lines.length > 0) {
		const lastLine = lines[lines.length - 1]
		if (lastLine && !lastLine.endsWith('\n')) {
			lines.push('')
		}
	}
	
	// Fix line length (basic implementation)
	if (mergedConfig.lineLength > 0) {
		lines = lines.map(line => {
			if (line.length > mergedConfig.lineLength) {
				// Simple word wrapping
				const words = line.split(' ')
				if (words.length > 1) {
					let wrapped = ''
					let currentLine = ''
					
					words.forEach(word => {
						if (currentLine.length + word.length + 1 <= mergedConfig.lineLength) {
							currentLine += (currentLine ? ' ' : '') + word
						} else {
							if (currentLine) {
								wrapped += currentLine + '\n'
								currentLine = word
							} else {
								wrapped += word + '\n'
							}
						}
					})
					
					if (currentLine) {
						wrapped += currentLine
					}
					
					return wrapped
				}
			}
			return line
		})
	}
	
	return lines.join('\n')
}

/**
 * Fix common link issues
 * @param {string} content - Markdown content
 * @param {Object} config - Link configuration
 * @returns {string} Fixed content
 */
function fixLinks(content, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG.links, ...config }
	
	const processor = remark()
	const tree = processor.parse(content)
	
	const linkFixes = []
	
	visit(tree, 'link', (node) => {
		const text = node.children?.[0]?.value || ''
		const url = node.url
		
		// Fix non-descriptive link text
		if (mergedConfig.standardizeLinkText) {
			if (text === url || text === '') {
				const descriptiveText = generateDescriptiveText(url)
				linkFixes.push({
					line: node.position?.start?.line || 0,
					column: node.position?.start?.column || 0,
					oldText: text,
					newText: descriptiveText,
					type: 'link-text'
				})
			}
		}
		
		// Fix common link patterns
		if (mergedConfig.fixBrokenLinks) {
			const fixedUrl = fixCommonLinkPatterns(url)
			if (fixedUrl !== url) {
				linkFixes.push({
					line: node.position?.start?.line || 0,
					column: node.position?.start?.column || 0,
					oldText: url,
					newText: fixedUrl,
					type: 'link-url'
				})
			}
		}
	})
	
	// Apply fixes
	let lines = content.split('\n')
	linkFixes.forEach(fix => {
		const lineIndex = fix.line - 1
		if (lineIndex >= 0 && lineIndex < lines.length) {
			lines[lineIndex] = lines[lineIndex].replace(fix.oldText, fix.newText)
		}
	})
	
	return lines.join('\n')
}

/**
 * Generate descriptive text for a link
 * @param {string} url - The URL
 * @returns {string} Descriptive text
 */
function generateDescriptiveText(url) {
	// Extract filename or last part of path
	const parts = url.split('/')
	const lastPart = parts[parts.length - 1]
	
	// Remove file extension
	const name = lastPart.replace(/\.[^/.]+$/, '')
	
	// Convert to title case
	return name
		.split(/[-_]/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

/**
 * Fix common link patterns
 * @param {string} url - The URL
 * @returns {string} Fixed URL
 */
function fixCommonLinkPatterns(url) {
	// Fix double slashes
	let fixed = url.replace(/\/\/+/g, '/')
	
	// Fix relative path issues
	if (fixed.startsWith('./') && !fixed.startsWith('../')) {
		fixed = fixed.substring(2)
	}
	
	// Fix common typos
	fixed = fixed.replace(/README\.md$/i, 'README.md')
	fixed = fixed.replace(/readme\.md$/i, 'README.md')
	
	return fixed
}

/**
 * Fix common heading issues
 * @param {string} content - Markdown content
 * @param {Object} config - Heading configuration
 * @returns {string} Fixed content
 */
function fixHeadings(content, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG.headings, ...config }
	
	const processor = remark()
	const tree = processor.parse(content)
	
	const headingFixes = []
	
	visit(tree, 'heading', (node) => {
		const text = node.children?.[0]?.value || ''
		const level = node.depth
		
		// Fix extra spaces
		if (mergedConfig.removeExtraSpaces) {
			const trimmed = text.trim()
			if (trimmed !== text) {
				headingFixes.push({
					line: node.position?.start?.line || 0,
					column: node.position?.start?.column || 0,
					oldText: text,
					newText: trimmed,
					type: 'heading-spaces'
				})
			}
		}
		
		// Standardize case
		if (mergedConfig.standardizeCase) {
			const standardized = standardizeHeadingCase(text)
			if (standardized !== text) {
				headingFixes.push({
					line: node.position?.start?.line || 0,
					column: node.position?.start?.column || 0,
					oldText: text,
					newText: standardized,
					type: 'heading-case'
				})
			}
		}
	})
	
	// Apply fixes
	let lines = content.split('\n')
	headingFixes.forEach(fix => {
		const lineIndex = fix.line - 1
		if (lineIndex >= 0 && lineIndex < lines.length) {
			lines[lineIndex] = lines[lineIndex].replace(fix.oldText, fix.newText)
		}
	})
	
	return lines.join('\n')
}

/**
 * Standardize heading case
 * @param {string} text - Heading text
 * @returns {string} Standardized text
 */
function standardizeHeadingCase(text) {
	// Don't change if it's all caps (likely an acronym)
	if (text === text.toUpperCase() && text.length > 3) {
		return text
	}
	
	// Title case for most headings
	return text
		.split(' ')
		.map(word => {
			// Keep certain words lowercase
			const lowercaseWords = ['a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
			if (lowercaseWords.includes(word.toLowerCase())) {
				return word.toLowerCase()
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		})
		.join(' ')
}

/**
 * Fix common list issues
 * @param {string} content - Markdown content
 * @param {Object} config - List configuration
 * @returns {string} Fixed content
 */
function fixLists(content, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const processor = remark()
	const tree = processor.parse(content)
	
	const listFixes = []
	
	visit(tree, 'list', (node) => {
		const ordered = node.ordered
		const start = node.start || 1
		
		// Fix list item numbering
		if (ordered) {
			let currentNumber = start
			node.children.forEach((item, index) => {
				const line = item.position?.start?.line || 0
				const column = item.position?.start?.column || 0
				
				// Check if numbering is correct
				const expectedNumber = start + index
				if (currentNumber !== expectedNumber) {
					listFixes.push({
						line,
						column,
						oldText: `${currentNumber}.`,
						newText: `${expectedNumber}.`,
						type: 'list-numbering'
					})
				}
				currentNumber++
			})
		}
	})
	
	// Apply fixes
	let lines = content.split('\n')
	listFixes.forEach(fix => {
		const lineIndex = fix.line - 1
		if (lineIndex >= 0 && lineIndex < lines.length) {
			lines[lineIndex] = lines[lineIndex].replace(fix.oldText, fix.newText)
		}
	})
	
	return lines.join('\n')
}

/**
 * Apply all automated fixes to a file
 * @param {string} filePath - Path to the file
 * @param {Object} config - Fix configuration
 * @returns {Promise<Object>} Fix results
 */
async function applyAutoFixes(filePath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		let fixedContent = content
		const fixes = []
		
		// Apply TOC generation
		if (mergedConfig.fixes.toc) {
			const originalContent = fixedContent
			fixedContent = generateTOC(fixedContent, mergedConfig.toc)
			if (fixedContent !== originalContent) {
				fixes.push('Generated Table of Contents')
			}
		}
		
		// Apply formatting fixes
		if (mergedConfig.fixes.formatting) {
			const originalContent = fixedContent
			fixedContent = fixFormatting(fixedContent, mergedConfig.formatting)
			if (fixedContent !== originalContent) {
				fixes.push('Fixed formatting issues')
			}
		}
		
		// Apply link fixes
		if (mergedConfig.fixes.links) {
			const originalContent = fixedContent
			fixedContent = fixLinks(fixedContent, mergedConfig.links)
			if (fixedContent !== originalContent) {
				fixes.push('Fixed link issues')
			}
		}
		
		// Apply heading fixes
		if (mergedConfig.fixes.headings) {
			const originalContent = fixedContent
			fixedContent = fixHeadings(fixedContent, mergedConfig.headings)
			if (fixedContent !== originalContent) {
				fixes.push('Fixed heading issues')
			}
		}
		
		// Apply list fixes
		if (mergedConfig.fixes.lists) {
			const originalContent = fixedContent
			fixedContent = fixLists(fixedContent, mergedConfig.lists)
			if (fixedContent !== originalContent) {
				fixes.push('Fixed list issues')
			}
		}
		
		// Write fixed content if changes were made
		if (fixedContent !== content) {
			fs.writeFileSync(filePath, fixedContent, 'utf8')
		}
		
		return {
			file: filePath,
			success: true,
			fixes: fixes,
			changed: fixedContent !== content,
			timestamp: new Date().toISOString()
		}
		
	} catch (error) {
		return {
			file: filePath,
			success: false,
			error: error.message,
			fixes: [],
			changed: false,
			timestamp: new Date().toISOString()
		}
	}
}

/**
 * Apply auto-fixes to multiple files
 * @param {Array} filePaths - Array of file paths
 * @param {Object} config - Fix configuration
 * @returns {Promise<Array>} Array of fix results
 */
async function applyAutoFixesToFiles(filePaths, config = {}) {
	const results = []
	
	for (const filePath of filePaths) {
		const result = await applyAutoFixes(filePath, config)
		results.push(result)
	}
	
	return results
}

export {
	applyAutoFixes,
	applyAutoFixesToFiles,
	generateTOC,
	fixFormatting,
	fixLinks,
	fixHeadings,
	fixLists,
	DEFAULT_CONFIG
}


