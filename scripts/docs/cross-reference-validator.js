/**
 * Cross-Reference Validation System
 * 
 * Validates cross-references between markdown files and detects
 * orphaned documents and broken references.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

/**
 * Extract all links from a markdown file
 * @param {string} content - Markdown content
 * @param {string} filePath - Path to the file
 * @returns {Array} Array of link objects
 */
function extractLinks(content, filePath) {
	const links = []
	const processor = remark()
	const tree = processor.parse(content)
	
	visit(tree, 'link', (node) => {
		links.push({
			text: node.children?.[0]?.value || '',
			url: node.url,
			title: node.title,
			line: node.position?.start?.line || 0,
			column: node.position?.start?.column || 0,
			file: filePath
		})
	})
	
	return links
}

/**
 * Extract all headings from a markdown file
 * @param {string} content - Markdown content
 * @param {string} filePath - Path to the file
 * @returns {Array} Array of heading objects
 */
function extractHeadings(content, filePath) {
	const headings = []
	const processor = remark()
	const tree = processor.parse(content)
	
	visit(tree, 'heading', (node) => {
		const text = node.children?.[0]?.value || ''
		const id = text.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
		
		headings.push({
			text,
			id,
			level: node.depth,
			line: node.position?.start?.line || 0,
			column: node.position?.start?.column || 0,
			file: filePath
		})
	})
	
	return headings
}

/**
 * Resolve a link URL relative to a file
 * @param {string} url - The link URL
 * @param {string} fromFile - The file containing the link
 * @param {string} baseDir - Base directory for resolution
 * @returns {string} Resolved file path
 */
function resolveLink(url, fromFile, baseDir) {
	// Skip external links
	if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
		return null
	}
	
	// Skip anchor-only links
	if (url.startsWith('#')) {
		return fromFile
	}
	
	// Resolve relative path
	const fromDir = path.dirname(fromFile)
	const resolvedPath = path.resolve(fromDir, url)
	
	// Check if it's within the base directory
	if (resolvedPath.startsWith(baseDir)) {
		return resolvedPath
	}
	
	return null
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
	try {
		return fs.statSync(filePath).isFile()
	} catch {
		return false
	}
}

/**
 * Check if a heading exists in a file
 * @param {string} filePath - Path to the file
 * @param {string} headingId - Heading ID to check
 * @returns {boolean} True if heading exists
 */
function headingExists(filePath, headingId) {
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		const headings = extractHeadings(content, filePath)
		return headings.some(h => h.id === headingId)
	} catch {
		return false
	}
}

/**
 * Validate a single link
 * @param {Object} link - Link object
 * @param {string} baseDir - Base directory
 * @param {Map} fileCache - Cache of file contents
 * @returns {Object} Validation result
 */
function validateLink(link, baseDir, fileCache = new Map()) {
	const result = {
		link,
		valid: true,
		issues: [],
		suggestions: []
	}
	
	// Check if it's an external link
	if (link.url.startsWith('http://') || link.url.startsWith('https://') || link.url.startsWith('mailto:')) {
		result.valid = true
		result.type = 'external'
		return result
	}
	
	// Check if it's an anchor link
	if (link.url.startsWith('#')) {
		const headingId = link.url.substring(1)
		const filePath = link.file
		
		if (fileCache.has(filePath)) {
			const headings = fileCache.get(filePath).headings
			const headingExists = headings.some(h => h.id === headingId)
			
			if (!headingExists) {
				result.valid = false
				result.issues.push(`Heading '${headingId}' not found in file`)
				result.suggestions.push(`Check if the heading exists or update the link`)
			}
		}
		
		result.type = 'anchor'
		return result
	}
	
	// Check if it's a file link
	const resolvedPath = resolveLink(link.url, link.file, baseDir)
	
	if (!resolvedPath) {
		result.valid = false
		result.issues.push(`Link '${link.url}' points outside the project directory`)
		result.suggestions.push(`Use a relative path within the project`)
		return result
	}
	
	// Check if file exists
	if (!fileExists(resolvedPath)) {
		result.valid = false
		result.issues.push(`File '${resolvedPath}' not found`)
		result.suggestions.push(`Check if the file exists or update the path`)
		return result
	}
	
	// Check if it's a markdown file
	if (resolvedPath.endsWith('.md')) {
		result.type = 'markdown'
		result.targetFile = resolvedPath
	} else {
		result.type = 'file'
		result.targetFile = resolvedPath
	}
	
	return result
}

/**
 * Validate cross-references in a file
 * @param {string} filePath - Path to the file
 * @param {string} baseDir - Base directory
 * @param {Map} fileCache - Cache of file contents
 * @returns {Object} Validation results
 */
function validateCrossReferences(filePath, baseDir, fileCache = new Map()) {
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		const links = extractLinks(content, filePath)
		const headings = extractHeadings(content, filePath)
		
		// Cache file contents
		fileCache.set(filePath, { content, links, headings })
		
		const results = {
			file: filePath,
			valid: true,
			links: [],
			headings,
			issues: [],
			suggestions: []
		}
		
		// Validate each link
		links.forEach(link => {
			const validation = validateLink(link, baseDir, fileCache)
			results.links.push(validation)
			
			if (!validation.valid) {
				results.valid = false
				results.issues.push(...validation.issues)
				results.suggestions.push(...validation.suggestions)
			}
		})
		
		return results
	} catch (error) {
		return {
			file: filePath,
			valid: false,
			error: error.message,
			links: [],
			headings: [],
			issues: [error.message],
			suggestions: ['Check if the file exists and is readable']
		}
	}
}

/**
 * Find orphaned documents
 * @param {Array} filePaths - Array of file paths
 * @param {string} baseDir - Base directory
 * @param {Map} fileCache - Cache of file contents
 * @returns {Array} Array of orphaned file paths
 */
function findOrphanedDocuments(filePaths, baseDir, fileCache = new Map()) {
	const referencedFiles = new Set()
	const orphanedFiles = []
	
	// First pass: collect all referenced files
	filePaths.forEach(filePath => {
		try {
			const content = fs.readFileSync(filePath, 'utf8')
			const links = extractLinks(content, filePath)
			
			links.forEach(link => {
				const resolvedPath = resolveLink(link.url, filePath, baseDir)
				if (resolvedPath && fileExists(resolvedPath)) {
					referencedFiles.add(resolvedPath)
				}
			})
		} catch (error) {
			// Skip files that can't be read
		}
	})
	
	// Second pass: find unreferenced files
	filePaths.forEach(filePath => {
		if (!referencedFiles.has(filePath)) {
			// Check if it's a README or index file
			const fileName = path.basename(filePath)
			const isIndexFile = fileName.toLowerCase().includes('readme') || 
							   fileName.toLowerCase().includes('index')
			
			if (!isIndexFile) {
				orphanedFiles.push(filePath)
			}
		}
	})
	
	return orphanedFiles
}

/**
 * Validate all cross-references in a directory
 * @param {string} dirPath - Directory path
 * @param {Object} options - Validation options
 * @returns {Object} Validation results
 */
async function validateDirectory(dirPath, options = {}) {
	const {
		includePatterns = ['**/*.md'],
		excludePatterns = ['node_modules/**', '.git/**'],
		checkOrphaned = true,
		checkBrokenLinks = true
	} = options
	
	const results = {
		valid: true,
		files: [],
		orphanedFiles: [],
		summary: {
			totalFiles: 0,
			validFiles: 0,
			invalidFiles: 0,
			totalLinks: 0,
			validLinks: 0,
			invalidLinks: 0,
			orphanedFiles: 0
		}
	}
	
	// Find all markdown files
	const filePaths = []
	
	function findFiles(dir) {
		const items = fs.readdirSync(dir)
		
		items.forEach(item => {
			const itemPath = path.join(dir, item)
			const stat = fs.statSync(itemPath)
			
			if (stat.isDirectory()) {
				findFiles(itemPath)
			} else if (item.endsWith('.md')) {
				filePaths.push(itemPath)
			}
		})
	}
	
	findFiles(dirPath)
	
	// Validate each file
	const fileCache = new Map()
	
	for (const filePath of filePaths) {
		const validation = validateCrossReferences(filePath, dirPath, fileCache)
		results.files.push(validation)
		
		if (!validation.valid) {
			results.valid = false
		}
		
		results.summary.totalFiles++
		if (validation.valid) {
			results.summary.validFiles++
		} else {
			results.summary.invalidFiles++
		}
		
		results.summary.totalLinks += validation.links.length
		results.summary.validLinks += validation.links.filter(l => l.valid).length
		results.summary.invalidLinks += validation.links.filter(l => !l.valid).length
	}
	
	// Find orphaned files
	if (checkOrphaned) {
		results.orphanedFiles = findOrphanedDocuments(filePaths, dirPath, fileCache)
		results.summary.orphanedFiles = results.orphanedFiles.length
	}
	
	return results
}

export {
	validateCrossReferences,
	validateDirectory,
	findOrphanedDocuments,
	extractLinks,
	extractHeadings,
	resolveLink
}


