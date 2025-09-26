/**
 * Performance Monitoring System
 * 
 * Monitors and optimizes documentation validation performance,
 * tracks metrics, and provides performance insights.
 */

import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

/**
 * Performance monitoring configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	monitorValidation: true,
	monitorFileProcessing: true,
	monitorLinkValidation: true,
	monitorContentAnalysis: true,
	trackMemoryUsage: true,
	generateReports: true,
	outputDir: './performance-monitoring',
	reportInterval: 1000, // ms
	maxHistorySize: 1000
}

/**
 * Performance metrics storage
 */
const performanceMetrics = {
	validation: [],
	fileProcessing: [],
	linkValidation: [],
	contentAnalysis: [],
	memoryUsage: [],
	overall: []
}

/**
 * Start performance monitoring
 * @param {Object} config - Configuration
 * @returns {Object} Monitoring instance
 */
function startPerformanceMonitoring(config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const monitoring = {
		config: mergedConfig,
		startTime: performance.now(),
		active: true,
		metrics: performanceMetrics,
		stop: () => stopPerformanceMonitoring(monitoring),
		report: () => generatePerformanceReport(monitoring)
	}
	
	// Start memory monitoring if enabled
	if (mergedConfig.trackMemoryUsage) {
		startMemoryMonitoring(monitoring)
	}
	
	return monitoring
}

/**
 * Stop performance monitoring
 * @param {Object} monitoring - Monitoring instance
 * @returns {Object} Final metrics
 */
function stopPerformanceMonitoring(monitoring) {
	monitoring.active = false
	monitoring.endTime = performance.now()
	monitoring.totalTime = monitoring.endTime - monitoring.startTime
	
	// Generate final report
	const report = generatePerformanceReport(monitoring)
	
	return {
		monitoring,
		report,
		success: true
	}
}

/**
 * Monitor validation performance
 * @param {Function} validationFn - Validation function
 * @param {string} filePath - File path
 * @param {Object} monitoring - Monitoring instance
 * @returns {Promise<Object>} Validation result with performance data
 */
async function monitorValidation(validationFn, filePath, monitoring) {
	if (!monitoring.active) {
		return await validationFn()
	}
	
	const startTime = performance.now()
	const startMemory = process.memoryUsage()
	
	try {
		const result = await validationFn()
		
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			success: true,
			error: null
		}
		
		monitoring.metrics.validation.push(metric)
		trimMetrics(monitoring.metrics.validation, monitoring.config.maxHistorySize)
		
		return {
			...result,
			performance: metric
		}
		
	} catch (error) {
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			success: false,
			error: error.message
		}
		
		monitoring.metrics.validation.push(metric)
		trimMetrics(monitoring.metrics.validation, monitoring.config.maxHistorySize)
		
		throw error
	}
}

/**
 * Monitor file processing performance
 * @param {Function} processingFn - Processing function
 * @param {string} filePath - File path
 * @param {Object} monitoring - Monitoring instance
 * @returns {Promise<Object>} Processing result with performance data
 */
async function monitorFileProcessing(processingFn, filePath, monitoring) {
	if (!monitoring.active) {
		return await processingFn()
	}
	
	const startTime = performance.now()
	const startMemory = process.memoryUsage()
	
	try {
		const result = await processingFn()
		
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			fileSize: fs.statSync(filePath).size,
			success: true,
			error: null
		}
		
		monitoring.metrics.fileProcessing.push(metric)
		trimMetrics(monitoring.metrics.fileProcessing, monitoring.config.maxHistorySize)
		
		return {
			...result,
			performance: metric
		}
		
	} catch (error) {
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			fileSize: fs.statSync(filePath).size,
			success: false,
			error: error.message
		}
		
		monitoring.metrics.fileProcessing.push(metric)
		trimMetrics(monitoring.metrics.fileProcessing, monitoring.config.maxHistorySize)
		
		throw error
	}
}

/**
 * Monitor link validation performance
 * @param {Function} linkValidationFn - Link validation function
 * @param {string} filePath - File path
 * @param {Object} monitoring - Monitoring instance
 * @returns {Promise<Object>} Link validation result with performance data
 */
async function monitorLinkValidation(linkValidationFn, filePath, monitoring) {
	if (!monitoring.active) {
		return await linkValidationFn()
	}
	
	const startTime = performance.now()
	const startMemory = process.memoryUsage()
	
	try {
		const result = await linkValidationFn()
		
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			linkCount: result.links?.length || 0,
			success: true,
			error: null
		}
		
		monitoring.metrics.linkValidation.push(metric)
		trimMetrics(monitoring.metrics.linkValidation, monitoring.config.maxHistorySize)
		
		return {
			...result,
			performance: metric
		}
		
	} catch (error) {
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			linkCount: 0,
			success: false,
			error: error.message
		}
		
		monitoring.metrics.linkValidation.push(metric)
		trimMetrics(monitoring.metrics.linkValidation, monitoring.config.maxHistorySize)
		
		throw error
	}
}

/**
 * Monitor content analysis performance
 * @param {Function} analysisFn - Analysis function
 * @param {string} filePath - File path
 * @param {Object} monitoring - Monitoring instance
 * @returns {Promise<Object>} Analysis result with performance data
 */
async function monitorContentAnalysis(analysisFn, filePath, monitoring) {
	if (!monitoring.active) {
		return await analysisFn()
	}
	
	const startTime = performance.now()
	const startMemory = process.memoryUsage()
	
	try {
		const result = await analysisFn()
		
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			contentLength: result.contentLength || 0,
			success: true,
			error: null
		}
		
		monitoring.metrics.contentAnalysis.push(metric)
		trimMetrics(monitoring.metrics.contentAnalysis, monitoring.config.maxHistorySize)
		
		return {
			...result,
			performance: metric
		}
		
	} catch (error) {
		const endTime = performance.now()
		const endMemory = process.memoryUsage()
		
		const metric = {
			timestamp: new Date().toISOString(),
			filePath,
			duration: endTime - startTime,
			memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
			contentLength: 0,
			success: false,
			error: error.message
		}
		
		monitoring.metrics.contentAnalysis.push(metric)
		trimMetrics(monitoring.metrics.contentAnalysis, monitoring.config.maxHistorySize)
		
		throw error
	}
}

/**
 * Start memory monitoring
 * @param {Object} monitoring - Monitoring instance
 * @returns {void}
 */
function startMemoryMonitoring(monitoring) {
	const interval = setInterval(() => {
		if (!monitoring.active) {
			clearInterval(interval)
			return
		}
		
		const memoryUsage = process.memoryUsage()
		const metric = {
			timestamp: new Date().toISOString(),
			heapUsed: memoryUsage.heapUsed,
			heapTotal: memoryUsage.heapTotal,
			external: memoryUsage.external,
			rss: memoryUsage.rss
		}
		
		monitoring.metrics.memoryUsage.push(metric)
		trimMetrics(monitoring.metrics.memoryUsage, monitoring.config.maxHistorySize)
		
	}, monitoring.config.reportInterval)
}

/**
 * Generate performance report
 * @param {Object} monitoring - Monitoring instance
 * @returns {Object} Performance report
 */
function generatePerformanceReport(monitoring) {
	const report = {
		timestamp: new Date().toISOString(),
		summary: {
			totalTime: monitoring.totalTime || 0,
			validationCount: monitoring.metrics.validation.length,
			fileProcessingCount: monitoring.metrics.fileProcessing.length,
			linkValidationCount: monitoring.metrics.linkValidation.length,
			contentAnalysisCount: monitoring.metrics.contentAnalysis.length
		},
		performance: {
			validation: calculatePerformanceStats(monitoring.metrics.validation),
			fileProcessing: calculatePerformanceStats(monitoring.metrics.fileProcessing),
			linkValidation: calculatePerformanceStats(monitoring.metrics.linkValidation),
			contentAnalysis: calculatePerformanceStats(monitoring.metrics.contentAnalysis),
			memory: calculateMemoryStats(monitoring.metrics.memoryUsage)
		},
		recommendations: generatePerformanceRecommendations(monitoring)
	}
	
	// Save report if enabled
	if (monitoring.config.generateReports) {
		savePerformanceReport(report, monitoring.config)
	}
	
	return report
}

/**
 * Calculate performance statistics
 * @param {Array} metrics - Array of metrics
 * @returns {Object} Performance statistics
 */
function calculatePerformanceStats(metrics) {
	if (metrics.length === 0) {
		return {
			count: 0,
			averageDuration: 0,
			minDuration: 0,
			maxDuration: 0,
			successRate: 0,
			totalDuration: 0
		}
	}
	
	const durations = metrics.map(m => m.duration)
	const successes = metrics.filter(m => m.success)
	
	return {
		count: metrics.length,
		averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
		minDuration: Math.min(...durations),
		maxDuration: Math.max(...durations),
		successRate: successes.length / metrics.length,
		totalDuration: durations.reduce((a, b) => a + b, 0)
	}
}

/**
 * Calculate memory statistics
 * @param {Array} metrics - Array of memory metrics
 * @returns {Object} Memory statistics
 */
function calculateMemoryStats(metrics) {
	if (metrics.length === 0) {
		return {
			count: 0,
			averageHeapUsed: 0,
			maxHeapUsed: 0,
			averageRSS: 0,
			maxRSS: 0
		}
	}
	
	const heapUsed = metrics.map(m => m.heapUsed)
	const rss = metrics.map(m => m.rss)
	
	return {
		count: metrics.length,
		averageHeapUsed: heapUsed.reduce((a, b) => a + b, 0) / heapUsed.length,
		maxHeapUsed: Math.max(...heapUsed),
		averageRSS: rss.reduce((a, b) => a + b, 0) / rss.length,
		maxRSS: Math.max(...rss)
	}
}

/**
 * Generate performance recommendations
 * @param {Object} monitoring - Monitoring instance
 * @returns {Array} Array of recommendations
 */
function generatePerformanceRecommendations(monitoring) {
	const recommendations = []
	
	// Check validation performance
	const validationStats = calculatePerformanceStats(monitoring.metrics.validation)
	if (validationStats.averageDuration > 1000) {
		recommendations.push({
			priority: 'high',
			category: 'performance',
			message: 'Validation is taking too long on average',
			action: 'Consider optimizing validation logic or implementing caching'
		})
	}
	
	// Check file processing performance
	const fileProcessingStats = calculatePerformanceStats(monitoring.metrics.fileProcessing)
	if (fileProcessingStats.averageDuration > 500) {
		recommendations.push({
			priority: 'medium',
			category: 'performance',
			message: 'File processing is taking too long on average',
			action: 'Consider optimizing file reading and parsing logic'
		})
	}
	
	// Check memory usage
	const memoryStats = calculateMemoryStats(monitoring.metrics.memoryUsage)
	if (memoryStats.maxHeapUsed > 100 * 1024 * 1024) { // 100MB
		recommendations.push({
			priority: 'high',
			category: 'memory',
			message: 'High memory usage detected',
			action: 'Consider implementing memory optimization strategies'
		})
	}
	
	// Check success rates
	if (validationStats.successRate < 0.9) {
		recommendations.push({
			priority: 'high',
			category: 'reliability',
			message: 'Low validation success rate',
			action: 'Investigate and fix validation errors'
		})
	}
	
	return recommendations
}

/**
 * Save performance report
 * @param {Object} report - Performance report
 * @param {Object} config - Configuration
 * @returns {void}
 */
function savePerformanceReport(report, config) {
	const outputDir = config.outputDir || './performance-monitoring'
	
	// Ensure output directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}
	
	// Save JSON report
	const jsonPath = path.join(outputDir, `performance-report-${Date.now()}.json`)
	fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
	
	console.log(`📊 Performance report saved to ${jsonPath}`)
}

/**
 * Trim metrics array to maximum size
 * @param {Array} metrics - Metrics array
 * @param {number} maxSize - Maximum size
 * @returns {void}
 */
function trimMetrics(metrics, maxSize) {
	if (metrics.length > maxSize) {
		metrics.splice(0, metrics.length - maxSize)
	}
}

/**
 * Get current performance metrics
 * @param {Object} monitoring - Monitoring instance
 * @returns {Object} Current metrics
 */
function getCurrentMetrics(monitoring) {
	return {
		timestamp: new Date().toISOString(),
		active: monitoring.active,
		totalTime: monitoring.active ? performance.now() - monitoring.startTime : monitoring.totalTime,
		metrics: {
			validation: monitoring.metrics.validation.length,
			fileProcessing: monitoring.metrics.fileProcessing.length,
			linkValidation: monitoring.metrics.linkValidation.length,
			contentAnalysis: monitoring.metrics.contentAnalysis.length,
			memoryUsage: monitoring.metrics.memoryUsage.length
		}
	}
}

export {
	startPerformanceMonitoring,
	stopPerformanceMonitoring,
	monitorValidation,
	monitorFileProcessing,
	monitorLinkValidation,
	monitorContentAnalysis,
	generatePerformanceReport,
	getCurrentMetrics,
	DEFAULT_CONFIG
}


