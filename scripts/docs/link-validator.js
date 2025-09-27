/**
 * Link Management System
 * 
 * Comprehensive link validation including internal link validation,
 * external link checking, and link consistency analysis.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import https from 'https'
import http from 'http'
import { URL } from 'url'

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
 * Check if a link is external
 * @param {string} url - The URL to check
 * @returns {boolean} True if external
 */
function isExternalLink(url) {
	return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')
}

/**
 * Check if a link is an anchor link
 * @param {string} url - The URL to check
 * @returns {boolean} True if anchor link
 */
function isAnchorLink(url) {
	return url.startsWith('#')
}

/**
 * Resolve a link URL relative to a file
 * @param {string} url - The link URL
 * @param {string} fromFile - The file containing the link
 * @param {string} baseDir - Base directory for resolution
 * @returns {string|null} Resolved file path or null
 */
function resolveLink(url, fromFile, baseDir) {
	// Skip external and anchor links
	if (isExternalLink(url) || isAnchorLink(url)) {
		return null
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
 * Check external link with timeout
 * @param {string} url - The URL to check
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Check result
 */
function checkExternalLink(url, timeout = 10000) {
	return new Promise((resolve) => {
		const startTime = Date.now()
		let resolved = false
		
		const timeoutId = setTimeout(() => {
			if (!resolved) {
				resolved = true
				resolve({
					url,
					valid: false,
					status: 'timeout',
					error: 'Request timeout',
					responseTime: Date.now() - startTime
				})
			}
		}, timeout)
		
		try {
			const urlObj = new URL(url)
			const options = {
				hostname: urlObj.hostname,
				port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
				path: urlObj.pathname + urlObj.search,
				method: 'HEAD',
				timeout: timeout
			}
			
			const client = urlObj.protocol === 'https:' ? https : http
			
			const req = client.request(options, (res) => {
				if (!resolved) {
					resolved = true
					clearTimeout(timeoutId)
					resolve({
						url,
						valid: res.statusCode < 400,
						status: res.statusCode,
						responseTime: Date.now() - startTime,
						headers: res.headers
					})
				}
			})
			
			req.on('error', (error) => {
				if (!resolved) {
					resolved = true
					clearTimeout(timeoutId)
					resolve({
						url,
						valid: false,
						status: 'error',
						error: error.message,
						responseTime: Date.now() - startTime
					})
				}
			})
			
			req.setTimeout(timeout, () => {
				if (!resolved) {
					resolved = true
					clearTimeout(timeoutId)
					resolve({
						url,
						valid: false,
						status: 'timeout',
						error: 'Request timeout',
						responseTime: Date.now() - startTime
					})
				}
			})
			
			req.end()
		} catch (error) {
			if (!resolved) {
				resolved = true
				clearTimeout(timeoutId)
				resolve({
					url,
					valid: false,
					status: 'error',
					error: error.message,
					responseTime: Date.now() - startTime
				})
			}
		}
	})
}

/**
 * Validate a single link
 * @param {Object} link - Link object
 * @param {string} baseDir - Base directory
 * @param {Map} fileCache - Cache of file contents
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation result
 */
async function validateLink(link, baseDir, fileCache = new Map(), options = {}) {
	const {
		checkExternal = true,
		externalTimeout = 10000,
		checkInternal = true,
		checkAnchors = true
	} = options
	
	const result = {
		link,
		valid: true,
		issues: [],
		suggestions: [],
		type: 'unknown'
	}
	
	// Check external links
	if (isExternalLink(link.url)) {
		result.type = 'external'
		
		if (checkExternal) {
			const checkResult = await checkExternalLink(link.url, externalTimeout)
			result.externalCheck = checkResult
			
			if (!checkResult.valid) {
				result.valid = false
				result.issues.push(`External link failed: ${checkResult.error || 'Unknown error'}`)
				result.suggestions.push('Check if the URL is correct and accessible')
			}
		}
		
		return result
	}
	
	// Check anchor links
	if (isAnchorLink(link.url)) {
		result.type = 'anchor'
		
		if (checkAnchors) {
			const headingId = link.url.substring(1)
			const filePath = link.file
			
			if (fileCache.has(filePath)) {
				const headings = fileCache.get(filePath).headings
				const headingExists = headings.some(h => h.id === headingId)
				
				if (!headingExists) {
					result.valid = false
					result.issues.push(`Heading '${headingId}' not found in file`)
					result.suggestions.push('Check if the heading exists or update the link')
				}
			}
		}
		
		return result
	}
	
	// Check internal file links
	if (checkInternal) {
		result.type = 'internal'
		const resolvedPath = resolveLink(link.url, link.file, baseDir)
		
		if (!resolvedPath) {
			result.valid = false
			result.issues.push(`Link '${link.url}' points outside the project directory`)
			result.suggestions.push('Use a relative path within the project')
			return result
		}
		
		// Check if file exists
		if (!fileExists(resolvedPath)) {
			result.valid = false
			result.issues.push(`File '${resolvedPath}' not found`)
			result.suggestions.push('Check if the file exists or update the path')
			return result
		}
		
		result.targetFile = resolvedPath
	}
	
	return result
}

/**
 * Validate all links in a file
 * @param {string} filePath - Path to the file
 * @param {string} baseDir - Base directory
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation results
 */
async function validateFileLinks(filePath, baseDir, options = {}) {
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		const links = extractLinks(content, filePath)
		const headings = extractHeadings(content, filePath)
		
		// Cache file contents
		const fileCache = new Map()
		fileCache.set(filePath, { content, links, headings })
		
		const results = {
			file: filePath,
			valid: true,
			links: [],
			headings,
			issues: [],
			suggestions: [],
			summary: {
				total: links.length,
				valid: 0,
				invalid: 0,
				external: 0,
				internal: 0,
				anchor: 0
			}
		}
		
		// Validate each link
		for (const link of links) {
			const validation = await validateLink(link, baseDir, fileCache, options)
			results.links.push(validation)
			
			// Update summary
			results.summary[validation.type]++
			if (validation.valid) {
				results.summary.valid++
			} else {
				results.summary.invalid++
				results.valid = false
				results.issues.push(...validation.issues)
				results.suggestions.push(...validation.suggestions)
			}
		}
		
		return results
	} catch (error) {
		return {
			file: filePath,
			valid: false,
			error: error.message,
			links: [],
			headings: [],
			issues: [error.message],
			suggestions: ['Check if the file exists and is readable'],
			summary: {
				total: 0,
				valid: 0,
				invalid: 0,
				external: 0,
				internal: 0,
				anchor: 0
			}
		}
	}
}

/**
 * Validate all links in a directory
 * @param {string} dirPath - Directory path
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation results
 */
async function validateDirectoryLinks(dirPath, options = {}) {
	const {
		includePatterns = ['**/*.md'],
		excludePatterns = ['node_modules/**', '.git/**'],
		checkExternal = true,
		externalTimeout = 10000,
		checkInternal = true,
		checkAnchors = true,
		maxConcurrent = 10
	} = options
	
	const results = {
		valid: true,
		files: [],
		summary: {
			totalFiles: 0,
			validFiles: 0,
			invalidFiles: 0,
			totalLinks: 0,
			validLinks: 0,
			invalidLinks: 0,
			externalLinks: 0,
			internalLinks: 0,
			anchorLinks: 0
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
	
	// Validate files in batches
	const batches = []
	for (let i = 0; i < filePaths.length; i += maxConcurrent) {
		batches.push(filePaths.slice(i, i + maxConcurrent))
	}
	
	for (const batch of batches) {
		const batchResults = await Promise.all(
			batch.map(filePath => validateFileLinks(filePath, dirPath, options))
		)
		
		results.files.push(...batchResults)
		
		// Update summary
		batchResults.forEach(fileResult => {
			results.summary.totalFiles++
			if (fileResult.valid) {
				results.summary.validFiles++
			} else {
				results.summary.invalidFiles++
				results.valid = false
			}
			
			results.summary.totalLinks += fileResult.summary.total
			results.summary.validLinks += fileResult.summary.valid
			results.summary.invalidLinks += fileResult.summary.invalid
			results.summary.externalLinks += fileResult.summary.external
			results.summary.internalLinks += fileResult.summary.internal
			results.summary.anchorLinks += fileResult.summary.anchor
		})
	}
	
	return results
}

/**
 * Generate link validation report
 * @param {Object} results - Validation results
 * @returns {Object} Formatted report
 */
function generateLinkReport(results) {
	const report = {
		summary: results.summary,
		valid: results.valid,
		timestamp: new Date().toISOString(),
		recommendations: []
	}
	
	// Generate recommendations
	if (results.summary.invalidLinks > 0) {
		report.recommendations.push({
			priority: 'high',
			message: `${results.summary.invalidLinks} invalid links found`,
			action: 'Fix broken links and update file paths'
		})
	}
	
	if (results.summary.externalLinks > 0) {
		report.recommendations.push({
			priority: 'medium',
			message: `${results.summary.externalLinks} external links found`,
			action: 'Regularly check external links for availability'
		})
	}
	
	if (results.summary.anchorLinks > 0) {
		report.recommendations.push({
			priority: 'low',
			message: `${results.summary.anchorLinks} anchor links found`,
			action: 'Ensure anchor links point to existing headings'
		})
	}
	
	return report
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
\x1b[0;36mKiloCode Link Validator\x1b[0m

\x1b[1;37mUsage:\x1b[0m node scripts/docs/link-validator.js [targets...]

\x1b[1;37mTargets:\x1b[0m
  [targets...] Specific files or directories to process (default: docs/)

\x1b[1;37mExamples:\x1b[0m
  node scripts/docs/link-validator.js
  node scripts/docs/link-validator.js docs/README.md
  node scripts/docs/link-validator.js docs/ui/
  node scripts/docs/link-validator.js docs/architecture/ docs/tools/
`)
			process.exit(0)
		} else if (!arg.startsWith('--')) {
			targets.push(arg)
		}
	}
	
	// Default to docs/ if no targets provided
	const finalTargets = targets.length > 0 ? targets : ['docs/']
	
	console.log('🔗 Validating links...')
	
	try {
		const markdownFiles = getMarkdownFiles(finalTargets)
		
		if (markdownFiles.length === 0) {
			console.log('No markdown files found in specified targets')
			return
		}
		
		console.log(`Processing ${markdownFiles.length} files...`)
		
		let totalValid = 0
		let totalInvalid = 0
		let totalExternal = 0
		let totalAnchor = 0
		
		for (const filePath of markdownFiles) {
			try {
				const result = await validateFileLinks(filePath)
				
				if (result.valid) {
					totalValid++
					console.log(`✅ ${filePath}: All links valid`)
				} else {
					totalInvalid++
					console.log(`❌ ${filePath}: ${result.summary.invalidLinks} invalid links`)
				}
				
				totalExternal += result.summary.externalLinks
				totalAnchor += result.summary.anchorLinks
				
			} catch (error) {
				console.error(`❌ ${filePath}: Error - ${error.message}`)
			}
		}
		
		console.log(`\n📊 Summary:`)
		console.log(`- Files processed: ${markdownFiles.length}`)
		console.log(`- Valid files: ${totalValid}`)
		console.log(`- Files with invalid links: ${totalInvalid}`)
		console.log(`- External links found: ${totalExternal}`)
		console.log(`- Anchor links found: ${totalAnchor}`)
		
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
	validateFileLinks,
	validateDirectoryLinks,
	validateLink,
	checkExternalLink,
	extractLinks,
	extractHeadings,
	generateLinkReport,
	isExternalLink,
	isAnchorLink,
	resolveLink,
	getMarkdownFiles
}


