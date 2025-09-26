/**
 * Orphaned Document Detection Tool
 * 
 * Detects documents that are not referenced by any other documents
 * and may be orphaned or unused.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

/**
 * Extract all internal links from a markdown file
 * @param {string} content - Markdown content
 * @param {string} filePath - Path to the file
 * @param {string} baseDir - Base directory for resolution
 * @returns {Array} Array of internal link paths
 */
function extractInternalLinks(content, filePath, baseDir) {
	const links = []
	const processor = remark()
	const tree = processor.parse(content)
	
	visit(tree, 'link', (node) => {
		const url = node.url
		
		// Skip external links
		if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
			return
		}
		
		// Skip anchor-only links
		if (url.startsWith('#')) {
			return
		}
		
		// Resolve relative path
		const fromDir = path.dirname(filePath)
		const resolvedPath = path.resolve(fromDir, url)
		
		// Check if it's within the base directory
		if (resolvedPath.startsWith(baseDir)) {
			links.push(resolvedPath)
		}
	})
	
	return links
}

/**
 * Find all markdown files in a directory
 * @param {string} dirPath - Directory path
 * @param {Array} excludePatterns - Patterns to exclude
 * @returns {Array} Array of file paths
 */
function findMarkdownFiles(dirPath, excludePatterns = []) {
	const files = []
	
	function scanDirectory(dir) {
		try {
			const items = fs.readdirSync(dir)
			
			items.forEach(item => {
				const itemPath = path.join(dir, item)
				const stat = fs.statSync(itemPath)
				
				if (stat.isDirectory()) {
					// Check if directory should be excluded
					const shouldExclude = excludePatterns.some(pattern => {
						const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
						return regex.test(itemPath)
					})
					
					if (!shouldExclude) {
						scanDirectory(itemPath)
					}
				} else if (item.endsWith('.md')) {
					files.push(itemPath)
				}
			})
		} catch (error) {
			// Skip directories that can't be read
		}
	}
	
	scanDirectory(dirPath)
	return files
}

/**
 * Build a reference map of all files
 * @param {Array} filePaths - Array of file paths
 * @param {string} baseDir - Base directory
 * @returns {Map} Map of file paths to their references
 */
function buildReferenceMap(filePaths, baseDir) {
	const referenceMap = new Map()
	
	filePaths.forEach(filePath => {
		try {
			const content = fs.readFileSync(filePath, 'utf8')
			const references = extractInternalLinks(content, filePath, baseDir)
			referenceMap.set(filePath, references)
		} catch (error) {
			referenceMap.set(filePath, [])
		}
	})
	
	return referenceMap
}

/**
 * Find orphaned documents
 * @param {Array} filePaths - Array of file paths
 * @param {string} baseDir - Base directory
 * @param {Object} options - Detection options
 * @returns {Array} Array of orphaned file information
 */
function findOrphanedDocuments(filePaths, baseDir, options = {}) {
	const {
		excludeIndexFiles = true,
		excludeReadmeFiles = true,
		excludePatterns = [],
		minReferences = 0
	} = options
	
	const referenceMap = buildReferenceMap(filePaths, baseDir)
	const referencedFiles = new Set()
	const orphanedFiles = []
	
	// Collect all referenced files
	referenceMap.forEach((references, filePath) => {
		references.forEach(refPath => {
			referencedFiles.add(refPath)
		})
	})
	
	// Find orphaned files
	filePaths.forEach(filePath => {
		const fileName = path.basename(filePath)
		const relativePath = path.relative(baseDir, filePath)
		
		// Check if file should be excluded
		if (excludeIndexFiles && (fileName.toLowerCase().includes('index') || fileName.toLowerCase().includes('readme'))) {
			return
		}
		
		if (excludeReadmeFiles && fileName.toLowerCase().includes('readme')) {
			return
		}
		
		// Check if file matches exclude patterns
		const shouldExclude = excludePatterns.some(pattern => {
			const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
			return regex.test(relativePath)
		})
		
		if (shouldExclude) {
			return
		}
		
		// Check if file is referenced
		if (!referencedFiles.has(filePath)) {
			const references = referenceMap.get(filePath) || []
			
			// Check if file has minimum references
			if (references.length >= minReferences) {
				orphanedFiles.push({
					file: filePath,
					relativePath,
					references: references.length,
					reason: 'not_referenced',
					suggestions: [
						'Add links to this document from other relevant documents',
						'Consider if this document is still needed',
						'Move to an archive directory if no longer relevant'
					]
				})
			}
		}
	})
	
	return orphanedFiles
}

/**
 * Analyze document connectivity
 * @param {Array} filePaths - Array of file paths
 * @param {string} baseDir - Base directory
 * @returns {Object} Connectivity analysis
 */
function analyzeConnectivity(filePaths, baseDir) {
	const referenceMap = buildReferenceMap(filePaths, baseDir)
	const connectivity = {
		totalFiles: filePaths.length,
		referencedFiles: 0,
		unreferencedFiles: 0,
		totalReferences: 0,
		averageReferences: 0,
		mostReferenced: [],
		leastReferenced: []
	}
	
	// Count references
	const referenceCounts = new Map()
	filePaths.forEach(filePath => {
		const references = referenceMap.get(filePath) || []
		referenceCounts.set(filePath, references.length)
		connectivity.totalReferences += references.length
	})
	
	// Calculate averages
	connectivity.averageReferences = connectivity.totalReferences / filePaths.length
	
	// Find most and least referenced files
	const sortedFiles = Array.from(referenceCounts.entries())
		.sort((a, b) => b[1] - a[1])
	
	connectivity.mostReferenced = sortedFiles.slice(0, 5).map(([file, count]) => ({
		file: path.relative(baseDir, file),
		references: count
	}))
	
	connectivity.leastReferenced = sortedFiles.slice(-5).map(([file, count]) => ({
		file: path.relative(baseDir, file),
		references: count
	}))
	
	// Count referenced vs unreferenced
	filePaths.forEach(filePath => {
		const references = referenceMap.get(filePath) || []
		if (references.length > 0) {
			connectivity.referencedFiles++
		} else {
			connectivity.unreferencedFiles++
		}
	})
	
	return connectivity
}

/**
 * Generate orphaned document report
 * @param {string} dirPath - Directory path
 * @param {Object} options - Detection options
 * @returns {Object} Orphaned document report
 */
async function generateOrphanedDocumentReport(dirPath, options = {}) {
	const {
		excludePatterns = ['node_modules/**', '.git/**', '**/node_modules/**'],
		excludeIndexFiles = true,
		excludeReadmeFiles = true,
		minReferences = 0
	} = options
	
	// Find all markdown files
	const filePaths = findMarkdownFiles(dirPath, excludePatterns)
	
	// Find orphaned documents
	const orphanedFiles = findOrphanedDocuments(filePaths, dirPath, {
		excludeIndexFiles,
		excludeReadmeFiles,
		excludePatterns,
		minReferences
	})
	
	// Analyze connectivity
	const connectivity = analyzeConnectivity(filePaths, dirPath)
	
	return {
		directory: dirPath,
		timestamp: new Date().toISOString(),
		summary: {
			totalFiles: filePaths.length,
			orphanedFiles: orphanedFiles.length,
			orphanedPercentage: (orphanedFiles.length / filePaths.length) * 100
		},
		orphanedFiles,
		connectivity,
		recommendations: generateRecommendations(orphanedFiles, connectivity)
	}
}

/**
 * Generate recommendations based on analysis
 * @param {Array} orphanedFiles - Array of orphaned files
 * @param {Object} connectivity - Connectivity analysis
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(orphanedFiles, connectivity) {
	const recommendations = []
	
	if (orphanedFiles.length > 0) {
		recommendations.push({
			priority: 'high',
			message: `${orphanedFiles.length} orphaned documents found`,
			action: 'Review and either link to these documents or remove them'
		})
	}
	
	if (connectivity.unreferencedFiles > connectivity.referencedFiles) {
		recommendations.push({
			priority: 'medium',
			message: 'More than half of documents are unreferenced',
			action: 'Improve document linking and navigation structure'
		})
	}
	
	if (connectivity.averageReferences < 2) {
		recommendations.push({
			priority: 'medium',
			message: 'Low average reference count per document',
			action: 'Add more cross-references between related documents'
		})
	}
	
	return recommendations
}

export {
	findOrphanedDocuments,
	generateOrphanedDocumentReport,
	analyzeConnectivity,
	extractInternalLinks,
	findMarkdownFiles,
	buildReferenceMap
}


