/**
 * Comprehensive Quality Metrics Collection
 * 
 * Collects and analyzes comprehensive metrics for documentation quality,
 * validation performance, and team adoption.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import { analyzeContentQuality } from './content-quality.js'
import { validateFileLinks } from './link-validator.js'
import { generateOrphanedDocumentReport } from './orphaned-document-detector.js'
import { generateLinkConsistencyReport } from './link-consistency-analyzer.js'

/**
 * Metrics collection configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	outputDir: './metrics',
	includeContentQuality: true,
	includeLinkMetrics: true,
	includeOrphanedDocuments: true,
	includeConsistencyMetrics: true,
	includePerformanceMetrics: true,
	includeAdoptionMetrics: true,
	persistMetrics: true,
	generateReports: true,
	reportFormats: ['json', 'html', 'csv']
}

/**
 * Collect comprehensive metrics for a directory
 * @param {string} dirPath - Directory path
 * @param {Object} config - Metrics configuration
 * @returns {Promise<Object>} Comprehensive metrics
 */
async function collectComprehensiveMetrics(dirPath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const startTime = Date.now()
	const metrics = {
		timestamp: new Date().toISOString(),
		directory: dirPath,
		summary: {
			totalFiles: 0,
			validFiles: 0,
			invalidFiles: 0,
			qualityScore: 0,
			linkHealth: 0,
			consistencyScore: 0,
			adoptionRate: 0
		},
		contentQuality: null,
		linkMetrics: null,
		orphanedDocuments: null,
		consistencyMetrics: null,
		performanceMetrics: null,
		adoptionMetrics: null,
		recommendations: []
	}
	
	try {
		// Find all markdown files
		const filePaths = findMarkdownFiles(dirPath)
		metrics.summary.totalFiles = filePaths.length
		
		// Content quality metrics
		if (mergedConfig.includeContentQuality) {
			console.log('📊 Collecting content quality metrics...')
			metrics.contentQuality = await collectContentQualityMetrics(filePaths, mergedConfig)
			metrics.summary.qualityScore = metrics.contentQuality.averageQualityScore
		}
		
		// Link metrics
		if (mergedConfig.includeLinkMetrics) {
			console.log('🔗 Collecting link metrics...')
			metrics.linkMetrics = await collectLinkMetrics(filePaths, dirPath, mergedConfig)
			metrics.summary.linkHealth = metrics.linkMetrics.healthScore
		}
		
		// Orphaned documents
		if (mergedConfig.includeOrphanedDocuments) {
			console.log('📄 Analyzing orphaned documents...')
			metrics.orphanedDocuments = await generateOrphanedDocumentReport(dirPath, mergedConfig)
		}
		
		// Consistency metrics
		if (mergedConfig.includeConsistencyMetrics) {
			console.log('🔄 Analyzing consistency metrics...')
			metrics.consistencyMetrics = await generateLinkConsistencyReport(dirPath, mergedConfig)
			metrics.summary.consistencyScore = metrics.consistencyMetrics.analysis.consistencyScore || 0
		}
		
		// Performance metrics
		if (mergedConfig.includePerformanceMetrics) {
			console.log('⚡ Collecting performance metrics...')
			metrics.performanceMetrics = await collectPerformanceMetrics(filePaths, mergedConfig)
		}
		
		// Adoption metrics
		if (mergedConfig.includeAdoptionMetrics) {
			console.log('👥 Collecting adoption metrics...')
			metrics.adoptionMetrics = await collectAdoptionMetrics(dirPath, mergedConfig)
			metrics.summary.adoptionRate = metrics.adoptionMetrics.adoptionRate
		}
		
		// Generate recommendations
		metrics.recommendations = generateRecommendations(metrics)
		
		// Calculate overall health score
		metrics.summary.overallHealth = calculateOverallHealthScore(metrics)
		
		// Persist metrics if enabled
		if (mergedConfig.persistMetrics) {
			await persistMetrics(metrics, mergedConfig)
		}
		
		// Generate reports if enabled
		if (mergedConfig.generateReports) {
			await generateReports(metrics, mergedConfig)
		}
		
		metrics.performanceMetrics.collectionTime = Date.now() - startTime
		
		return metrics
		
	} catch (error) {
		return {
			...metrics,
			error: error.message,
			success: false
		}
	}
}

/**
 * Find all markdown files in a directory
 * @param {string} dirPath - Directory path
 * @returns {Array} Array of file paths
 */
function findMarkdownFiles(dirPath) {
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
	
	scanDirectory(dirPath)
	return files
}

/**
 * Collect content quality metrics
 * @param {Array} filePaths - Array of file paths
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Content quality metrics
 */
async function collectContentQualityMetrics(filePaths, config) {
	const metrics = {
		totalFiles: filePaths.length,
		averageQualityScore: 0,
		qualityDistribution: {
			excellent: 0, // 0.8+
			good: 0,      // 0.6-0.8
			fair: 0,      // 0.4-0.6
			poor: 0       // <0.4
		},
		readabilityScores: [],
		gradeLevels: [],
		technicalTermConsistency: [],
		issues: {
			readability: 0,
			consistency: 0,
			length: 0,
			structure: 0
		},
		recommendations: []
	}
	
	let totalQualityScore = 0
	
	for (const filePath of filePaths) {
		try {
			const content = fs.readFileSync(filePath, 'utf8')
			const analysis = analyzeContentQuality(content, {
				minReadabilityScore: 30,
				maxGradeLevel: 12,
				minConsistencyScore: 0.8
			})
			
			const qualityScore = analysis.metrics.qualityScore
			totalQualityScore += qualityScore
			
			// Categorize quality score
			if (qualityScore >= 0.8) {
				metrics.qualityDistribution.excellent++
			} else if (qualityScore >= 0.6) {
				metrics.qualityDistribution.good++
			} else if (qualityScore >= 0.4) {
				metrics.qualityDistribution.fair++
			} else {
				metrics.qualityDistribution.poor++
			}
			
			// Collect readability scores
			metrics.readabilityScores.push(analysis.metrics.fleschScore)
			metrics.gradeLevels.push(analysis.metrics.gradeLevel)
			metrics.technicalTermConsistency.push(analysis.technicalTerms.consistencyScore)
			
			// Count issues
			analysis.issues.forEach(issue => {
				if (issue.message.includes('Readability')) metrics.issues.readability++
				if (issue.message.includes('consistency')) metrics.issues.consistency++
				if (issue.message.includes('too short') || issue.message.includes('too long')) metrics.issues.length++
				if (issue.message.includes('heading') || issue.message.includes('structure')) metrics.issues.structure++
			})
			
		} catch (error) {
			console.error(`Error analyzing ${filePath}:`, error.message)
		}
	}
	
	metrics.averageQualityScore = totalQualityScore / filePaths.length
	
	// Generate recommendations
	if (metrics.issues.readability > 0) {
		metrics.recommendations.push('Improve readability across documentation')
	}
	if (metrics.issues.consistency > 0) {
		metrics.recommendations.push('Standardize technical terminology')
	}
	if (metrics.issues.length > 0) {
		metrics.recommendations.push('Optimize content length and structure')
	}
	
	return metrics
}

/**
 * Collect link metrics
 * @param {Array} filePaths - Array of file paths
 * @param {string} baseDir - Base directory
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Link metrics
 */
async function collectLinkMetrics(filePaths, baseDir, config) {
	const metrics = {
		totalFiles: filePaths.length,
		totalLinks: 0,
		validLinks: 0,
		invalidLinks: 0,
		externalLinks: 0,
		internalLinks: 0,
		anchorLinks: 0,
		healthScore: 0,
		brokenLinks: [],
		recommendations: []
	}
	
	for (const filePath of filePaths) {
		try {
			const result = await validateFileLinks(filePath, baseDir, {
				checkExternal: false,
				checkInternal: true,
				checkAnchors: true
			})
			
			metrics.totalLinks += result.summary.total
			metrics.validLinks += result.summary.valid
			metrics.invalidLinks += result.summary.invalid
			metrics.externalLinks += result.summary.external
			metrics.internalLinks += result.summary.internal
			metrics.anchorLinks += result.summary.anchor
			
			// Collect broken links
			result.links.forEach(link => {
				if (!link.valid) {
					metrics.brokenLinks.push({
						file: filePath,
						link: link.link,
						issues: link.issues
					})
				}
			})
			
		} catch (error) {
			console.error(`Error validating links in ${filePath}:`, error.message)
		}
	}
	
	// Calculate health score
	if (metrics.totalLinks > 0) {
		metrics.healthScore = metrics.validLinks / metrics.totalLinks
	}
	
	// Generate recommendations
	if (metrics.invalidLinks > 0) {
		metrics.recommendations.push(`Fix ${metrics.invalidLinks} broken links`)
	}
	if (metrics.externalLinks > 0) {
		metrics.recommendations.push('Regularly check external links for availability')
	}
	
	return metrics
}

/**
 * Collect performance metrics
 * @param {Array} filePaths - Array of file paths
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Performance metrics
 */
async function collectPerformanceMetrics(filePaths, config) {
	const metrics = {
		totalFiles: filePaths.length,
		averageFileSize: 0,
		largestFile: null,
		smallestFile: null,
		validationTimes: [],
		collectionTime: 0,
		recommendations: []
	}
	
	let totalSize = 0
	let largestSize = 0
	let smallestSize = Infinity
	
	for (const filePath of filePaths) {
		try {
			const stats = fs.statSync(filePath)
			const size = stats.size
			totalSize += size
			
			if (size > largestSize) {
				largestSize = size
				metrics.largestFile = { file: filePath, size }
			}
			
			if (size < smallestSize) {
				smallestSize = size
				metrics.smallestFile = { file: filePath, size }
			}
			
		} catch (error) {
			console.error(`Error getting stats for ${filePath}:`, error.message)
		}
	}
	
	metrics.averageFileSize = totalSize / filePaths.length
	
	// Generate recommendations
	if (metrics.largestFile && metrics.largestFile.size > 100000) {
		metrics.recommendations.push('Consider breaking down large files for better maintainability')
	}
	
	return metrics
}

/**
 * Collect adoption metrics
 * @param {string} dirPath - Directory path
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Adoption metrics
 */
async function collectAdoptionMetrics(dirPath, config) {
	const metrics = {
		adoptionRate: 0,
		standardsCompliance: 0,
		validationUsage: 0,
		recommendations: []
	}
	
	// This would typically integrate with git history, team usage data, etc.
	// For now, we'll provide a basic implementation
	
	metrics.adoptionRate = 0.8 // Placeholder
	metrics.standardsCompliance = 0.75 // Placeholder
	metrics.validationUsage = 0.9 // Placeholder
	
	return metrics
}

/**
 * Generate recommendations based on metrics
 * @param {Object} metrics - Comprehensive metrics
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(metrics) {
	const recommendations = []
	
	// Content quality recommendations
	if (metrics.contentQuality) {
		if (metrics.contentQuality.averageQualityScore < 0.6) {
			recommendations.push({
				priority: 'high',
				category: 'content-quality',
				message: 'Overall content quality is below recommended threshold',
				action: 'Focus on improving readability and consistency across documentation'
			})
		}
		
		if (metrics.contentQuality.issues.readability > 0) {
			recommendations.push({
				priority: 'medium',
				category: 'readability',
				message: `${metrics.contentQuality.issues.readability} readability issues found`,
				action: 'Simplify language and sentence structure'
			})
		}
	}
	
	// Link health recommendations
	if (metrics.linkMetrics) {
		if (metrics.linkMetrics.healthScore < 0.8) {
			recommendations.push({
				priority: 'high',
				category: 'link-health',
				message: 'Link health is below recommended threshold',
				action: 'Fix broken links and improve link structure'
			})
		}
	}
	
	// Orphaned documents recommendations
	if (metrics.orphanedDocuments) {
		if (metrics.orphanedDocuments.summary.orphanedFiles > 0) {
			recommendations.push({
				priority: 'medium',
				category: 'orphaned-documents',
				message: `${metrics.orphanedDocuments.summary.orphanedFiles} orphaned documents found`,
				action: 'Review and either link to or remove orphaned documents'
			})
		}
	}
	
	return recommendations
}

/**
 * Calculate overall health score
 * @param {Object} metrics - Comprehensive metrics
 * @returns {number} Overall health score (0-1)
 */
function calculateOverallHealthScore(metrics) {
	let score = 0
	let factors = 0
	
	if (metrics.contentQuality) {
		score += metrics.contentQuality.averageQualityScore * 0.3
		factors += 0.3
	}
	
	if (metrics.linkMetrics) {
		score += metrics.linkMetrics.healthScore * 0.3
		factors += 0.3
	}
	
	if (metrics.consistencyMetrics) {
		score += metrics.consistencyMetrics.analysis.consistencyScore * 0.2
		factors += 0.2
	}
	
	if (metrics.adoptionMetrics) {
		score += metrics.adoptionMetrics.adoptionRate * 0.2
		factors += 0.2
	}
	
	return factors > 0 ? score / factors : 0
}

/**
 * Persist metrics to file
 * @param {Object} metrics - Metrics to persist
 * @param {Object} config - Configuration
 * @returns {Promise<void>}
 */
async function persistMetrics(metrics, config) {
	const outputDir = config.outputDir || './metrics'
	
	// Ensure output directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}
	
	// Save JSON metrics
	const jsonPath = path.join(outputDir, `metrics-${Date.now()}.json`)
	fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2))
	
	console.log(`📊 Metrics saved to ${jsonPath}`)
}

/**
 * Generate reports
 * @param {Object} metrics - Metrics to report
 * @param {Object} config - Configuration
 * @returns {Promise<void>}
 */
async function generateReports(metrics, config) {
	const outputDir = config.outputDir || './metrics'
	
	// Generate HTML report
	if (config.reportFormats.includes('html')) {
		const htmlReport = generateHTMLReport(metrics)
		const htmlPath = path.join(outputDir, `report-${Date.now()}.html`)
		fs.writeFileSync(htmlPath, htmlReport)
		console.log(`📊 HTML report generated: ${htmlPath}`)
	}
	
	// Generate CSV report
	if (config.reportFormats.includes('csv')) {
		const csvReport = generateCSVReport(metrics)
		const csvPath = path.join(outputDir, `report-${Date.now()}.csv`)
		fs.writeFileSync(csvPath, csvReport)
		console.log(`📊 CSV report generated: ${csvPath}`)
	}
}

/**
 * Generate HTML report
 * @param {Object} metrics - Metrics to report
 * @returns {string} HTML report
 */
function generateHTMLReport(metrics) {
	return `
<!DOCTYPE html>
<html>
<head>
    <title>Documentation Quality Metrics Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .high { background-color: #ffebee; }
        .medium { background-color: #fff3e0; }
        .low { background-color: #e8f5e8; }
    </style>
</head>
<body>
    <h1>Documentation Quality Metrics Report</h1>
    <p>Generated: ${metrics.timestamp}</p>
    
    <div class="metric">
        <h2>Summary</h2>
        <p>Overall Health Score: ${(metrics.summary.overallHealth * 100).toFixed(1)}%</p>
        <p>Total Files: ${metrics.summary.totalFiles}</p>
        <p>Quality Score: ${(metrics.summary.qualityScore * 100).toFixed(1)}%</p>
        <p>Link Health: ${(metrics.summary.linkHealth * 100).toFixed(1)}%</p>
    </div>
    
    <div class="metric">
        <h2>Recommendations</h2>
        <ul>
            ${metrics.recommendations.map(rec => `<li class="${rec.priority}">${rec.message}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
	`
}

/**
 * Generate CSV report
 * @param {Object} metrics - Metrics to report
 * @returns {string} CSV report
 */
function generateCSVReport(metrics) {
	const rows = [
		['Metric', 'Value'],
		['Overall Health Score', metrics.summary.overallHealth],
		['Total Files', metrics.summary.totalFiles],
		['Quality Score', metrics.summary.qualityScore],
		['Link Health', metrics.summary.linkHealth],
		['Consistency Score', metrics.summary.consistencyScore],
		['Adoption Rate', metrics.summary.adoptionRate]
	]
	
	return rows.map(row => row.join(',')).join('\n')
}

export {
	collectComprehensiveMetrics,
	collectContentQualityMetrics,
	collectLinkMetrics,
	collectPerformanceMetrics,
	collectAdoptionMetrics,
	DEFAULT_CONFIG
}


