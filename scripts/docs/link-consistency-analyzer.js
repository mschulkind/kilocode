/**
 * Link Consistency Analysis Tool
 * 
 * Analyzes link consistency across documentation files and provides
 * recommendations for improving link structure and navigation.
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
 * Build a link index for all files
 * @param {Array} filePaths - Array of file paths
 * @param {string} baseDir - Base directory
 * @returns {Map} Map of file paths to their links and headings
 */
function buildLinkIndex(filePaths, baseDir) {
	const index = new Map()
	
	filePaths.forEach(filePath => {
		try {
			const content = fs.readFileSync(filePath, 'utf8')
			const links = extractLinks(content, filePath)
			const headings = extractHeadings(content, filePath)
			
			index.set(filePath, {
				links,
				headings,
				relativePath: path.relative(baseDir, filePath)
			})
		} catch (error) {
			index.set(filePath, {
				links: [],
				headings: [],
				relativePath: path.relative(baseDir, filePath),
				error: error.message
			})
		}
	})
	
	return index
}

/**
 * Analyze link consistency
 * @param {Map} linkIndex - Link index
 * @param {string} baseDir - Base directory
 * @returns {Object} Consistency analysis results
 */
function analyzeLinkConsistency(linkIndex, baseDir) {
	const analysis = {
		totalFiles: linkIndex.size,
		totalLinks: 0,
		totalHeadings: 0,
		linkPatterns: new Map(),
		headingPatterns: new Map(),
		inconsistencies: [],
		recommendations: []
	}
	
	// Analyze link patterns
	linkIndex.forEach((fileData, filePath) => {
		analysis.totalLinks += fileData.links.length
		analysis.totalHeadings += fileData.headings.length
		
		// Analyze link text patterns
		fileData.links.forEach(link => {
			const pattern = analyzeLinkPattern(link)
			if (!analysis.linkPatterns.has(pattern.type)) {
				analysis.linkPatterns.set(pattern.type, [])
			}
			analysis.linkPatterns.get(pattern.type).push({
				file: fileData.relativePath,
				link,
				pattern
			})
		})
		
		// Analyze heading patterns
		fileData.headings.forEach(heading => {
			const pattern = analyzeHeadingPattern(heading)
			if (!analysis.headingPatterns.has(pattern.type)) {
				analysis.headingPatterns.set(pattern.type, [])
			}
			analysis.headingPatterns.get(pattern.type).push({
				file: fileData.relativePath,
				heading,
				pattern
			})
		})
	})
	
	// Find inconsistencies
	analysis.inconsistencies = findInconsistencies(analysis.linkPatterns, analysis.headingPatterns)
	
	// Generate recommendations
	analysis.recommendations = generateConsistencyRecommendations(analysis)
	
	return analysis
}

/**
 * Analyze link pattern
 * @param {Object} link - Link object
 * @returns {Object} Pattern analysis
 */
function analyzeLinkPattern(link) {
	const pattern = {
		type: 'unknown',
		text: link.text,
		url: link.url,
		characteristics: []
	}
	
	// Check if external link
	if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
		pattern.type = 'external'
		pattern.characteristics.push('external')
	} else if (link.url.startsWith('#')) {
		pattern.type = 'anchor'
		pattern.characteristics.push('anchor')
	} else if (link.url.startsWith('./') || link.url.startsWith('../')) {
		pattern.type = 'relative'
		pattern.characteristics.push('relative')
	} else if (link.url.startsWith('/')) {
		pattern.type = 'absolute'
		pattern.characteristics.push('absolute')
	} else {
		pattern.type = 'implicit'
		pattern.characteristics.push('implicit')
	}
	
	// Analyze text characteristics
	if (link.text === link.url) {
		pattern.characteristics.push('text-equals-url')
	}
	
	if (link.text.length < 3) {
		pattern.characteristics.push('short-text')
	}
	
	if (link.text.length > 50) {
		pattern.characteristics.push('long-text')
	}
	
	if (/^[A-Z]/.test(link.text)) {
		pattern.characteristics.push('title-case')
	}
	
	if (/^[a-z]/.test(link.text)) {
		pattern.characteristics.push('lower-case')
	}
	
	if (link.text.includes(' ')) {
		pattern.characteristics.push('multi-word')
	}
	
	return pattern
}

/**
 * Analyze heading pattern
 * @param {Object} heading - Heading object
 * @returns {Object} Pattern analysis
 */
function analyzeHeadingPattern(heading) {
	const pattern = {
		type: 'unknown',
		text: heading.text,
		level: heading.level,
		characteristics: []
	}
	
	// Determine heading type
	if (heading.level === 1) {
		pattern.type = 'h1'
	} else if (heading.level === 2) {
		pattern.type = 'h2'
	} else if (heading.level === 3) {
		pattern.type = 'h3'
	} else if (heading.level === 4) {
		pattern.type = 'h4'
	} else if (heading.level === 5) {
		pattern.type = 'h5'
	} else if (heading.level === 6) {
		pattern.type = 'h6'
	}
	
	// Analyze text characteristics
	if (heading.text.length < 3) {
		pattern.characteristics.push('short')
	}
	
	if (heading.text.length > 100) {
		pattern.characteristics.push('long')
	}
	
	if (/^[A-Z]/.test(heading.text)) {
		pattern.characteristics.push('title-case')
	}
	
	if (/^[a-z]/.test(heading.text)) {
		pattern.characteristics.push('lower-case')
	}
	
	if (heading.text.includes(' ')) {
		pattern.characteristics.push('multi-word')
	}
	
	if (heading.text.includes(':')) {
		pattern.characteristics.push('colon')
	}
	
	if (heading.text.includes('?')) {
		pattern.characteristics.push('question')
	}
	
	return pattern
}

/**
 * Find inconsistencies in link and heading patterns
 * @param {Map} linkPatterns - Link patterns
 * @param {Map} headingPatterns - Heading patterns
 * @returns {Array} Array of inconsistencies
 */
function findInconsistencies(linkPatterns, headingPatterns) {
	const inconsistencies = []
	
	// Check for inconsistent link text patterns
	linkPatterns.forEach((links, type) => {
		if (links.length > 1) {
			const textPatterns = links.map(l => l.pattern.characteristics)
			const uniquePatterns = [...new Set(textPatterns.map(p => JSON.stringify(p)))]
			
			if (uniquePatterns.length > 1) {
				inconsistencies.push({
					type: 'link-text-inconsistency',
					severity: 'medium',
					message: `Inconsistent link text patterns for ${type} links`,
					details: {
						linkType: type,
						count: links.length,
						patterns: uniquePatterns.length
					},
					suggestions: [
						'Standardize link text formatting',
						'Use consistent capitalization',
						'Maintain consistent text length'
					]
				})
			}
		}
	})
	
	// Check for inconsistent heading patterns
	headingPatterns.forEach((headings, type) => {
		if (headings.length > 1) {
			const textPatterns = headings.map(h => h.pattern.characteristics)
			const uniquePatterns = [...new Set(textPatterns.map(p => JSON.stringify(p)))]
			
			if (uniquePatterns.length > 1) {
				inconsistencies.push({
					type: 'heading-text-inconsistency',
					severity: 'medium',
					message: `Inconsistent heading text patterns for ${type} headings`,
					details: {
						headingType: type,
						count: headings.length,
						patterns: uniquePatterns.length
					},
					suggestions: [
						'Standardize heading text formatting',
						'Use consistent capitalization',
						'Maintain consistent text length'
					]
				})
			}
		}
	})
	
	// Check for missing navigation patterns
	const hasNavigation = linkPatterns.has('relative') || linkPatterns.has('absolute')
	if (!hasNavigation) {
		inconsistencies.push({
			type: 'missing-navigation',
			severity: 'high',
			message: 'No internal navigation links found',
			details: {
				totalFiles: linkPatterns.size
			},
			suggestions: [
				'Add internal links between related documents',
				'Create a navigation structure',
				'Link to parent and sibling documents'
			]
		})
	}
	
	return inconsistencies
}

/**
 * Generate consistency recommendations
 * @param {Object} analysis - Analysis results
 * @returns {Array} Array of recommendations
 */
function generateConsistencyRecommendations(analysis) {
	const recommendations = []
	
	// Link density recommendations
	const avgLinksPerFile = analysis.totalLinks / analysis.totalFiles
	if (avgLinksPerFile < 2) {
		recommendations.push({
			priority: 'medium',
			message: 'Low link density across documentation',
			action: 'Add more cross-references between related documents'
		})
	}
	
	// Heading structure recommendations
	const avgHeadingsPerFile = analysis.totalHeadings / analysis.totalFiles
	if (avgHeadingsPerFile < 3) {
		recommendations.push({
			priority: 'medium',
			message: 'Low heading density across documentation',
			action: 'Add more headings to improve document structure'
		})
	}
	
	// Pattern consistency recommendations
	if (analysis.inconsistencies.length > 0) {
		recommendations.push({
			priority: 'high',
			message: `${analysis.inconsistencies.length} consistency issues found`,
			action: 'Review and fix inconsistent patterns'
		})
	}
	
	return recommendations
}

/**
 * Generate link consistency report
 * @param {string} dirPath - Directory path
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Consistency report
 */
async function generateLinkConsistencyReport(dirPath, options = {}) {
	const {
		includePatterns = ['**/*.md'],
		excludePatterns = ['node_modules/**', '.git/**']
	} = options
	
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
	
	// Build link index
	const linkIndex = buildLinkIndex(filePaths, dirPath)
	
	// Analyze consistency
	const analysis = analyzeLinkConsistency(linkIndex, dirPath)
	
	return {
		directory: dirPath,
		timestamp: new Date().toISOString(),
		analysis,
		recommendations: analysis.recommendations
	}
}

export {
	generateLinkConsistencyReport,
	analyzeLinkConsistency,
	buildLinkIndex,
	extractLinks,
	extractHeadings,
	analyzeLinkPattern,
	analyzeHeadingPattern
}


