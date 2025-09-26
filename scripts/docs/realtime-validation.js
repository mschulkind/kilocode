/**
 * Real-time Validation Configuration
 * 
 * Provides real-time validation for markdown files with debouncing,
 * performance optimization, and comprehensive error reporting.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import { analyzeContentQuality } from './content-quality.js'
import { validateFileLinks } from './link-validator.js'

/**
 * Real-time validation configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	debounce: 500,
	maxErrors: 100,
	showWarnings: true,
	showInfo: false,
	performance: {
		maxFileSize: 1048576, // 1MB
		timeout: 5000, // 5 seconds
		concurrent: 5
	},
	quality: {
		enabled: true,
		readabilityThreshold: 30,
		gradeLevelThreshold: 12,
		consistencyThreshold: 0.8
	},
	links: {
		realtime: true,
		checkExternal: false,
		checkInternal: true,
		checkAnchors: true,
		timeout: 3000
	},
	notifications: {
		showErrors: true,
		showWarnings: true,
		showInfo: false,
		popup: false,
		statusBar: true
	}
}

/**
 * Real-time validation cache
 */
const validationCache = new Map()
const pendingValidations = new Map()

/**
 * Debounce function for validation
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
	let timeoutId
	return function (...args) {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => func.apply(this, args), delay)
	}
}

/**
 * Validate a markdown file in real-time
 * @param {string} filePath - Path to the file
 * @param {Object} config - Validation configuration
 * @returns {Promise<Object>} Validation results
 */
async function validateRealtime(filePath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	// Check if validation is enabled
	if (!mergedConfig.enabled) {
		return { file: filePath, valid: true, skipped: true }
	}
	
	// Check file size and get stats
	let stats
	try {
		stats = fs.statSync(filePath)
		if (stats.size > mergedConfig.performance.maxFileSize) {
			return {
				file: filePath,
				valid: false,
				error: 'File too large for real-time validation',
				issues: ['File exceeds maximum size limit'],
				suggestions: ['Consider breaking the file into smaller sections']
			}
		}
	} catch (error) {
		return {
			file: filePath,
			valid: false,
			error: error.message,
			issues: [error.message],
			suggestions: ['Check if the file exists and is readable']
		}
	}
	
	// Check cache
	const cacheKey = `${filePath}:${stats.mtime.getTime()}`
	if (validationCache.has(cacheKey)) {
		return validationCache.get(cacheKey)
	}
	
	// Check if validation is already pending
	if (pendingValidations.has(filePath)) {
		return pendingValidations.get(filePath)
	}
	
	// Create validation promise
	const validationPromise = performValidation(filePath, mergedConfig)
	pendingValidations.set(filePath, validationPromise)
	
	try {
		const result = await validationPromise
		validationCache.set(cacheKey, result)
		return result
	} finally {
		pendingValidations.delete(filePath)
	}
}

/**
 * Perform the actual validation
 * @param {string} filePath - Path to the file
 * @param {Object} config - Validation configuration
 * @returns {Promise<Object>} Validation results
 */
async function performValidation(filePath, config) {
	const results = {
		file: filePath,
		valid: true,
		issues: [],
		warnings: [],
		info: [],
		suggestions: [],
		quality: null,
		links: null,
		timestamp: new Date().toISOString()
	}
	
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		
		// Basic markdown validation
		const basicValidation = await validateBasicMarkdown(content, filePath)
		results.issues.push(...basicValidation.issues)
		results.warnings.push(...basicValidation.warnings)
		results.info.push(...basicValidation.info)
		results.suggestions.push(...basicValidation.suggestions)
		
		// Content quality analysis
		if (config.quality.enabled) {
			const qualityResult = analyzeContentQuality(content, {
				minReadabilityScore: config.quality.readabilityThreshold,
				maxGradeLevel: config.quality.gradeLevelThreshold,
				minConsistencyScore: config.quality.consistencyThreshold
			})
			
			results.quality = qualityResult
			results.issues.push(...qualityResult.issues.map(i => i.message))
			results.suggestions.push(...qualityResult.recommendations)
		}
		
		// Link validation
		if (config.links.realtime) {
			const linkResult = await validateFileLinks(filePath, path.dirname(filePath), {
				checkExternal: config.links.checkExternal,
				checkInternal: config.links.checkInternal,
				checkAnchors: config.links.checkAnchors,
				externalTimeout: config.links.timeout
			})
			
			results.links = linkResult
			results.issues.push(...linkResult.issues)
			results.suggestions.push(...linkResult.suggestions)
		}
		
		// Determine overall validity
		results.valid = results.issues.length === 0
		
		// Limit number of issues
		if (results.issues.length > config.maxErrors) {
			results.issues = results.issues.slice(0, config.maxErrors)
			results.issues.push(`... and ${results.issues.length - config.maxErrors} more issues`)
		}
		
		return results
		
	} catch (error) {
		return {
			file: filePath,
			valid: false,
			error: error.message,
			issues: [error.message],
			suggestions: ['Check if the file exists and is readable'],
			timestamp: new Date().toISOString()
		}
	}
}

/**
 * Validate basic markdown structure
 * @param {string} content - Markdown content
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object>} Validation results
 */
async function validateBasicMarkdown(content, filePath) {
	const issues = []
	const warnings = []
	const info = []
	const suggestions = []
	
	try {
		const processor = remark()
		const tree = processor.parse(content)
		
		// Check for title
		let hasTitle = false
		visit(tree, 'heading', (node) => {
			if (node.depth === 1) {
				hasTitle = true
			}
		})
		
		if (!hasTitle) {
			warnings.push('Document should have a main title (H1)')
			suggestions.push('Add a main title at the beginning of the document')
		}
		
		// Check for headings
		let headingCount = 0
		visit(tree, 'heading', (node) => {
			headingCount++
		})
		
		if (headingCount < 2) {
			warnings.push('Document should have multiple headings for better structure')
			suggestions.push('Add more headings to organize the content')
		}
		
		// Check for links
		let linkCount = 0
		visit(tree, 'link', (node) => {
			linkCount++
		})
		
		if (linkCount === 0) {
			warnings.push('Document has no links')
			suggestions.push('Add links to related documents and resources')
		}
		
		// Check for code blocks
		let codeBlockCount = 0
		visit(tree, 'code', (node) => {
			if (node.lang) {
				codeBlockCount++
			}
		})
		
		if (codeBlockCount === 0) {
			info.push('Consider adding code examples')
		}
		
		// Check for lists
		let listCount = 0
		visit(tree, 'list', (node) => {
			listCount++
		})
		
		if (listCount === 0) {
			info.push('Consider adding lists for better readability')
		}
		
	} catch (error) {
		issues.push(`Markdown parsing error: ${error.message}`)
		suggestions.push('Check markdown syntax')
	}
	
	return { issues, warnings, info, suggestions }
}

/**
 * Create a debounced validation function
 * @param {Object} config - Validation configuration
 * @returns {Function} Debounced validation function
 */
function createDebouncedValidator(config = {}) {
	return debounce(async (filePath) => {
		return await validateRealtime(filePath, config)
	}, config.debounce || DEFAULT_CONFIG.debounce)
}

/**
 * Clear validation cache
 * @param {string} filePath - Optional file path to clear from cache
 */
function clearCache(filePath = null) {
	if (filePath) {
		const keysToDelete = Array.from(validationCache.keys()).filter(key => key.startsWith(filePath))
		keysToDelete.forEach(key => validationCache.delete(key))
	} else {
		validationCache.clear()
	}
}

/**
 * Get validation statistics
 * @returns {Object} Validation statistics
 */
function getValidationStats() {
	return {
		cacheSize: validationCache.size,
		pendingValidations: pendingValidations.size,
		timestamp: new Date().toISOString()
	}
}

export {
	validateRealtime,
	createDebouncedValidator,
	clearCache,
	getValidationStats,
	DEFAULT_CONFIG
}
