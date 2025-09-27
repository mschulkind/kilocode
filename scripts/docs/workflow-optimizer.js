/**
 * Workflow Optimization System
 * 
 * Analyzes and optimizes documentation validation workflows,
 * reduces false positives, and improves developer experience.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

/**
 * Workflow optimization configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	analyzeBottlenecks: true,
	reduceFalsePositives: true,
	improveErrorMessages: true,
	optimizePerformance: true,
	enhanceDeveloperExperience: true,
	outputDir: './workflow-optimization',
	generateReports: true
}

/**
 * Analyze workflow bottlenecks
 * @param {string} dirPath - Directory path
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Bottleneck analysis
 */
async function analyzeWorkflowBottlenecks(dirPath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const analysis = {
		timestamp: new Date().toISOString(),
		directory: dirPath,
		bottlenecks: [],
		performance: {
			validationTime: 0,
			fileProcessingTime: 0,
			linkValidationTime: 0,
			contentAnalysisTime: 0
		},
		recommendations: []
	}
	
	try {
		const filePaths = findMarkdownFiles(dirPath)
		
		// Measure validation performance
		const startTime = Date.now()
		
		for (const filePath of filePaths) {
			const fileStartTime = Date.now()
			
			// Basic validation
			const content = fs.readFileSync(filePath, 'utf8')
			const processor = remark()
			const tree = processor.parse(content)
			
			const fileProcessingTime = Date.now() - fileStartTime
			analysis.performance.fileProcessingTime += fileProcessingTime
			
			// Identify bottlenecks
			if (fileProcessingTime > 1000) {
				analysis.bottlenecks.push({
					type: 'slow-file-processing',
					file: filePath,
					time: fileProcessingTime,
					severity: 'high',
					description: 'File processing took longer than 1 second'
				})
			}
			
			// Check for large files
			const stats = fs.statSync(filePath)
			if (stats.size > 100000) {
				analysis.bottlenecks.push({
					type: 'large-file',
					file: filePath,
					size: stats.size,
					severity: 'medium',
					description: 'File is larger than 100KB'
				})
			}
			
			// Check for complex structure
			const headingCount = countHeadings(tree)
			if (headingCount > 50) {
				analysis.bottlenecks.push({
					type: 'complex-structure',
					file: filePath,
					headingCount,
					severity: 'medium',
					description: 'File has more than 50 headings'
				})
			}
		}
		
		analysis.performance.validationTime = Date.now() - startTime
		
		// Generate recommendations
		analysis.recommendations = generateBottleneckRecommendations(analysis)
		
		return analysis
		
	} catch (error) {
		return {
			...analysis,
			error: error.message,
			success: false
		}
	}
}

/**
 * Reduce false positive validation results
 * @param {string} dirPath - Directory path
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} False positive reduction results
 */
async function reduceFalsePositives(dirPath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const results = {
		timestamp: new Date().toISOString(),
		directory: dirPath,
		falsePositives: [],
		improvements: [],
		recommendations: []
	}
	
	try {
		const filePaths = findMarkdownFiles(dirPath)
		
		for (const filePath of filePaths) {
			const content = fs.readFileSync(filePath, 'utf8')
			const processor = remark()
			const tree = processor.parse(content)
			
			// Identify potential false positives
			const falsePositives = identifyFalsePositives(tree, filePath)
			results.falsePositives.push(...falsePositives)
			
			// Suggest improvements
			const improvements = suggestImprovements(tree, filePath)
			results.improvements.push(...improvements)
		}
		
		// Generate recommendations
		results.recommendations = generateFalsePositiveRecommendations(results)
		
		return results
		
	} catch (error) {
		return {
			...results,
			error: error.message,
			success: false
		}
	}
}

/**
 * Improve error message clarity and actionability
 * @param {string} dirPath - Directory path
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Error message improvements
 */
async function improveErrorMessages(dirPath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const improvements = {
		timestamp: new Date().toISOString(),
		directory: dirPath,
		errorMessages: [],
		improvements: [],
		recommendations: []
	}
	
	try {
		const filePaths = findMarkdownFiles(dirPath)
		
		for (const filePath of filePaths) {
			const content = fs.readFileSync(filePath, 'utf8')
			const processor = remark()
			const tree = processor.parse(content)
			
			// Analyze error messages
			const errorMessages = analyzeErrorMessages(tree, filePath)
			improvements.errorMessages.push(...errorMessages)
			
			// Suggest improvements
			const messageImprovements = suggestErrorMessageImprovements(errorMessages)
			improvements.improvements.push(...messageImprovements)
		}
		
		// Generate recommendations
		improvements.recommendations = generateErrorMessageRecommendations(improvements)
		
		return improvements
		
	} catch (error) {
		return {
			...improvements,
			error: error.message,
			success: false
		}
	}
}

/**
 * Optimize developer experience workflows
 * @param {string} dirPath - Directory path
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Developer experience optimizations
 */
async function optimizeDeveloperExperience(dirPath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const optimizations = {
		timestamp: new Date().toISOString(),
		directory: dirPath,
		workflowIssues: [],
		optimizations: [],
		recommendations: []
	}
	
	try {
		const filePaths = findMarkdownFiles(dirPath)
		
		// Analyze workflow issues
		const workflowIssues = analyzeWorkflowIssues(filePaths, dirPath)
		optimizations.workflowIssues = workflowIssues
		
		// Suggest optimizations
		const suggestedOptimizations = suggestWorkflowOptimizations(workflowIssues)
		optimizations.optimizations = suggestedOptimizations
		
		// Generate recommendations
		optimizations.recommendations = generateDeveloperExperienceRecommendations(optimizations)
		
		return optimizations
		
	} catch (error) {
		return {
			...optimizations,
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
 * Count headings in a tree
 * @param {Object} tree - AST tree
 * @returns {number} Number of headings
 */
function countHeadings(tree) {
	let count = 0
	visit(tree, 'heading', () => {
		count++
	})
	return count
}

/**
 * Identify false positives
 * @param {Object} tree - AST tree
 * @param {string} filePath - File path
 * @returns {Array} Array of false positives
 */
function identifyFalsePositives(tree, filePath) {
	const falsePositives = []
	
	// Check for common false positive patterns
	visit(tree, 'link', (node) => {
		const url = node.url
		const text = node.children?.[0]?.value || ''
		
		// Check for false positive link warnings
		if (url.startsWith('http') && text === url) {
			falsePositives.push({
				type: 'link-text-warning',
				file: filePath,
				line: node.position?.start?.line || 0,
				description: 'Link text matches URL (may be intentional)',
				severity: 'low'
			})
		}
	})
	
	visit(tree, 'heading', (node) => {
		const text = node.children?.[0]?.value || ''
		
		// Check for false positive heading warnings
		if (text.length < 3) {
			falsePositives.push({
				type: 'short-heading-warning',
				file: filePath,
				line: node.position?.start?.line || 0,
				description: 'Very short heading (may be intentional)',
				severity: 'low'
			})
		}
	})
	
	return falsePositives
}

/**
 * Suggest improvements
 * @param {Object} tree - AST tree
 * @param {string} filePath - File path
 * @returns {Array} Array of improvements
 */
function suggestImprovements(tree, filePath) {
	const improvements = []
	
	// Suggest structural improvements
	const headings = []
	visit(tree, 'heading', (node) => {
		headings.push({
			level: node.depth,
			text: node.children?.[0]?.value || '',
			line: node.position?.start?.line || 0
		})
	})
	
	// Check heading hierarchy
	for (let i = 1; i < headings.length; i++) {
		const prev = headings[i - 1]
		const curr = headings[i]
		
		if (curr.level > prev.level + 1) {
			improvements.push({
				type: 'heading-hierarchy',
				file: filePath,
				line: curr.line,
				description: 'Heading level jumps too many levels',
				suggestion: 'Consider using sequential heading levels'
			})
		}
	}
	
	return improvements
}

/**
 * Analyze error messages
 * @param {Object} tree - AST tree
 * @param {string} filePath - File path
 * @returns {Array} Array of error messages
 */
function analyzeErrorMessages(tree, filePath) {
	const errorMessages = []
	
	// This would typically analyze actual validation errors
	// For now, we'll provide a basic implementation
	
	visit(tree, 'link', (node) => {
		const url = node.url
		const text = node.children?.[0]?.value || ''
		
		if (text === url) {
			errorMessages.push({
				type: 'link-text-error',
				file: filePath,
				line: node.position?.start?.line || 0,
				message: 'Link text should be descriptive',
				severity: 'warning'
			})
		}
	})
	
	return errorMessages
}

/**
 * Suggest error message improvements
 * @param {Array} errorMessages - Array of error messages
 * @returns {Array} Array of improvements
 */
function suggestErrorMessageImprovements(errorMessages) {
	const improvements = []
	
	errorMessages.forEach(error => {
		if (error.message === 'Link text should be descriptive') {
			improvements.push({
				type: 'error-message-improvement',
				file: error.file,
				line: error.line,
				currentMessage: error.message,
				improvedMessage: 'Link text should describe the destination (e.g., "Read more about X" instead of "click here")',
				suggestion: 'Provide more specific guidance'
			})
		}
	})
	
	return improvements
}

/**
 * Analyze workflow issues
 * @param {Array} filePaths - Array of file paths
 * @param {string} dirPath - Directory path
 * @returns {Array} Array of workflow issues
 */
function analyzeWorkflowIssues(filePaths, dirPath) {
	const issues = []
	
	// Check for common workflow issues
	if (filePaths.length > 100) {
		issues.push({
			type: 'large-documentation-set',
			description: 'Large number of files may slow validation',
			severity: 'medium',
			suggestion: 'Consider parallel processing or file batching'
		})
	}
	
	// Check for deeply nested directories
	const maxDepth = Math.max(...filePaths.map(fp => fp.split('/').length))
	if (maxDepth > 5) {
		issues.push({
			type: 'deep-nesting',
			description: 'Deep directory nesting may complicate navigation',
			severity: 'low',
			suggestion: 'Consider flattening directory structure'
		})
	}
	
	return issues
}

/**
 * Suggest workflow optimizations
 * @param {Array} workflowIssues - Array of workflow issues
 * @returns {Array} Array of optimizations
 */
function suggestWorkflowOptimizations(workflowIssues) {
	const optimizations = []
	
	workflowIssues.forEach(issue => {
		if (issue.type === 'large-documentation-set') {
			optimizations.push({
				type: 'parallel-processing',
				description: 'Implement parallel file processing',
				priority: 'high',
				implementation: 'Use Promise.all() for concurrent validation'
			})
		}
		
		if (issue.type === 'deep-nesting') {
			optimizations.push({
				type: 'directory-restructuring',
				description: 'Restructure directories for better navigation',
				priority: 'low',
				implementation: 'Move deeply nested files to higher levels'
			})
		}
	})
	
	return optimizations
}

/**
 * Generate bottleneck recommendations
 * @param {Object} analysis - Bottleneck analysis
 * @returns {Array} Array of recommendations
 */
function generateBottleneckRecommendations(analysis) {
	const recommendations = []
	
	if (analysis.performance.validationTime > 10000) {
		recommendations.push({
			priority: 'high',
			category: 'performance',
			message: 'Validation is taking too long',
			action: 'Implement parallel processing and caching'
		})
	}
	
	if (analysis.bottlenecks.some(b => b.type === 'large-file')) {
		recommendations.push({
			priority: 'medium',
			category: 'file-size',
			message: 'Large files detected',
			action: 'Consider breaking large files into smaller sections'
		})
	}
	
	return recommendations
}

/**
 * Generate false positive recommendations
 * @param {Object} results - False positive reduction results
 * @returns {Array} Array of recommendations
 */
function generateFalsePositiveRecommendations(results) {
	const recommendations = []
	
	if (results.falsePositives.length > 0) {
		recommendations.push({
			priority: 'medium',
			category: 'false-positives',
			message: `${results.falsePositives.length} potential false positives found`,
			action: 'Review and adjust validation rules to reduce false positives'
		})
	}
	
	return recommendations
}

/**
 * Generate error message recommendations
 * @param {Object} improvements - Error message improvements
 * @returns {Array} Array of recommendations
 */
function generateErrorMessageRecommendations(improvements) {
	const recommendations = []
	
	if (improvements.improvements.length > 0) {
		recommendations.push({
			priority: 'high',
			category: 'error-messages',
			message: 'Error messages need improvement',
			action: 'Implement more descriptive and actionable error messages'
		})
	}
	
	return recommendations
}

/**
 * Generate developer experience recommendations
 * @param {Object} optimizations - Developer experience optimizations
 * @returns {Array} Array of recommendations
 */
function generateDeveloperExperienceRecommendations(optimizations) {
	const recommendations = []
	
	if (optimizations.workflowIssues.length > 0) {
		recommendations.push({
			priority: 'high',
			category: 'developer-experience',
			message: 'Workflow issues detected',
			action: 'Implement suggested optimizations to improve developer experience'
		})
	}
	
	return recommendations
}

/**
 * Run comprehensive workflow optimization
 * @param {string} dirPath - Directory path
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Comprehensive optimization results
 */
async function runWorkflowOptimization(dirPath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const results = {
		timestamp: new Date().toISOString(),
		directory: dirPath,
		bottleneckAnalysis: null,
		falsePositiveReduction: null,
		errorMessageImprovements: null,
		developerExperienceOptimizations: null,
		overallRecommendations: []
	}
	
	try {
		// Run all optimization analyses
		if (mergedConfig.analyzeBottlenecks) {
			results.bottleneckAnalysis = await analyzeWorkflowBottlenecks(dirPath, mergedConfig)
		}
		
		if (mergedConfig.reduceFalsePositives) {
			results.falsePositiveReduction = await reduceFalsePositives(dirPath, mergedConfig)
		}
		
		if (mergedConfig.improveErrorMessages) {
			results.errorMessageImprovements = await improveErrorMessages(dirPath, mergedConfig)
		}
		
		if (mergedConfig.enhanceDeveloperExperience) {
			results.developerExperienceOptimizations = await optimizeDeveloperExperience(dirPath, mergedConfig)
		}
		
		// Combine all recommendations
		results.overallRecommendations = [
			...(results.bottleneckAnalysis?.recommendations || []),
			...(results.falsePositiveReduction?.recommendations || []),
			...(results.errorMessageImprovements?.recommendations || []),
			...(results.developerExperienceOptimizations?.recommendations || [])
		]
		
		// Generate reports if enabled
		if (mergedConfig.generateReports) {
			await generateOptimizationReports(results, mergedConfig)
		}
		
		return results
		
	} catch (error) {
		return {
			...results,
			error: error.message,
			success: false
		}
	}
}

/**
 * Generate optimization reports
 * @param {Object} results - Optimization results
 * @param {Object} config - Configuration
 * @returns {Promise<void>}
 */
async function generateOptimizationReports(results, config) {
	const outputDir = config.outputDir || './workflow-optimization'
	
	// Ensure output directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}
	
	// Save JSON report
	const jsonPath = path.join(outputDir, `workflow-optimization-${Date.now()}.json`)
	fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2))
	
	console.log(`📊 Workflow optimization report saved to ${jsonPath}`)
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
KiloCode Workflow Optimizer

Usage: node scripts/docs/workflow-optimizer.js [targets...]

Targets:
  [targets...] Specific files or directories to process (default: docs/)

Examples:
  node scripts/docs/workflow-optimizer.js
  node scripts/docs/workflow-optimizer.js docs/README.md
  node scripts/docs/workflow-optimizer.js docs/ui/
  node scripts/docs/workflow-optimizer.js docs/architecture/ docs/tools/
`)
			process.exit(0)
		} else if (!arg.startsWith('--')) {
			targets.push(arg)
		}
	}
	
	// Default to docs/ if no targets provided
	const finalTargets = targets.length > 0 ? targets : ['docs/']
	
	console.log('🔧 Running workflow optimization...')
	
	try {
		// Process each target
		for (const target of finalTargets) {
			if (!fs.existsSync(target)) {
				console.warn(`Warning: Target "${target}" does not exist, skipping...`)
				continue
			}
			
			const stats = fs.statSync(target)
			
			if (stats.isFile() && target.endsWith('.md')) {
				// Single file - process its directory
				const dirPath = path.dirname(target)
				console.log(`Processing directory: ${dirPath}`)
				await runWorkflowOptimization(dirPath)
			} else if (stats.isDirectory()) {
				// Directory
				console.log(`Processing directory: ${target}`)
				await runWorkflowOptimization(target)
			} else {
				console.warn(`Warning: "${target}" is not a markdown file or directory, skipping...`)
			}
		}
		
		console.log('✅ Workflow optimization completed')
		
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
	runWorkflowOptimization,
	analyzeWorkflowBottlenecks,
	reduceFalsePositives,
	improveErrorMessages,
	optimizeDeveloperExperience,
	DEFAULT_CONFIG
}


