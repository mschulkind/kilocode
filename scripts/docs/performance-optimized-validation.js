#!/usr/bin/env node

/**
 * Performance Optimized Documentation Validation
 *
 * Features:
 * - Parallel processing for large documentation sets
 * - Caching for validation results
 * - Incremental validation for changed files
 * - Performance monitoring and metrics
 */

import { promises as fs } from "fs"
import path from "path"
import { remark } from "remark"
import remarkPresetLintRecommended from "remark-preset-lint-recommended"
import remarkValidateLinks from "remark-validate-links"
import remarkToc from "remark-toc"
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify"
import { Worker } from "worker_threads"
import os from "os"
import stringWidth from "string-width"

// Performance monitoring
class PerformanceMonitor {
	constructor() {
		this.metrics = {
			startTime: Date.now(),
			filesProcessed: 0,
			errorsFound: 0,
			warningsFound: 0,
			cacheHits: 0,
			cacheMisses: 0,
			processingTime: 0,
			validationTime: 0,
		}
	}

	startTimer(name) {
		this[`${name}Start`] = Date.now()
	}

	endTimer(name) {
		const duration = Date.now() - this[`${name}Start`]
		this.metrics[`${name}Time`] = (this.metrics[`${name}Time`] || 0) + duration
		return duration
	}

	getMetrics() {
		this.metrics.totalTime = Date.now() - this.metrics.startTime
		this.metrics.filesPerSecond = this.metrics.filesProcessed / (this.metrics.totalTime / 1000)
		return this.metrics
	}
}

// Cache for validation results
class ValidationCache {
	constructor(cacheFile = ".validation-cache.json") {
		this.cacheFile = cacheFile
		this.cache = new Map()
		this.loadCache()
	}

	async loadCache() {
		try {
			const data = await fs.readFile(this.cacheFile, "utf8")
			const cacheData = JSON.parse(data)
			this.cache = new Map(Object.entries(cacheData))
		} catch (error) {
			// Cache file doesn't exist or is invalid, start fresh
			this.cache = new Map()
		}
	}

	async saveCache() {
		const cacheData = Object.fromEntries(this.cache)
		await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2))
	}

	getCacheKey(filePath, mtime) {
		return `${filePath}:${mtime}`
	}

	get(filePath, mtime) {
		const key = this.getCacheKey(filePath, mtime)
		return this.cache.get(key)
	}

	set(filePath, mtime, result) {
		const key = this.getCacheKey(filePath, mtime)
		this.cache.set(key, result)
	}

	clear() {
		this.cache.clear()
	}
}

// File discovery with filtering
class FileDiscovery {
	constructor(options = {}) {
		this.includePatterns = options.include || ["**/*.md", "**/*.mdx"]
		this.excludePatterns = options.exclude || [
			"**/node_modules/**",
			"**/dist/**",
			"**/out/**",
			"**/.git/**",
			"**/coverage/**",
		]
	}

	async discoverFiles(rootDir) {
		const files = []
		await this._scanDirectory(rootDir, files)
		return files
	}

	async _scanDirectory(dir, files) {
		try {
			const entries = await fs.readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name)

				if (entry.isDirectory()) {
					if (!this._shouldExclude(fullPath)) {
						await this._scanDirectory(fullPath, files)
					}
				} else if (entry.isFile()) {
					if (this._shouldInclude(fullPath) && !this._shouldExclude(fullPath)) {
						const stats = await fs.stat(fullPath)
						files.push({
							path: fullPath,
							mtime: stats.mtime.getTime(),
							size: stats.size,
						})
					}
				}
			}
		} catch (error) {
			console.warn(`Warning: Could not scan directory ${dir}:`, error.message)
		}
	}

	_shouldInclude(filePath) {
		// Only process markdown files in the docs/ directory
		return (
			(filePath.endsWith(".md") || filePath.endsWith(".mdx")) &&
			(filePath.includes("/docs/") || filePath.startsWith("docs/"))
		)
	}

	_shouldExclude(filePath) {
		return this.excludePatterns.some((pattern) => this._matchesPattern(filePath, pattern))
	}

	_matchesPattern(filePath, pattern) {
		const normalizedPath = filePath.replace(/\\/g, "/")
		const regex = new RegExp(
			"^" + pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\./g, "\\.") + "$",
		)
		return regex.test(normalizedPath)
	}
}

// Parallel validation worker
class ParallelValidator {
	constructor(options = {}) {
		this.maxWorkers = options.maxWorkers || Math.min(os.cpus().length, 8)
		this.workers = []
		this.workerQueue = []
	}

	async validateFiles(files, cache) {
		const results = []
		const chunks = this._chunkArray(files, Math.ceil(files.length / this.maxWorkers))

		const promises = chunks.map((chunk, index) => this._validateChunk(chunk, index, cache))

		const chunkResults = await Promise.all(promises)

		// Flatten results
		for (const chunkResult of chunkResults) {
			results.push(...chunkResult)
		}

		return results
	}

	_chunkArray(array, chunkSize) {
		const chunks = []
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize))
		}
		return chunks
	}

	async _validateChunk(files, workerId, cache) {
		const results = []

		for (const file of files) {
			try {
				// Check cache first
				const cachedResult = cache.get(file.path, file.mtime)
				if (cachedResult) {
					results.push({
						file: file.path,
						...cachedResult,
						fromCache: true,
					})
					continue
				}

				// Validate file
				const result = await this._validateFile(file)
				cache.set(file.path, file.mtime, result)

				results.push({
					file: file.path,
					...result,
					fromCache: false,
				})
			} catch (error) {
				results.push({
					file: file.path,
					error: error.message,
					fromCache: false,
				})
			}
		}

		return results
	}

	async _validateFile(file) {
		const processor = remark()
			.use(remarkPresetLintRecommended)
			.use(remarkValidateLinks)
			.use(remarkToc)
			.use(remarkGfm)
			.use(remarkStringify)

		const content = await fs.readFile(file.path, "utf8")
		const result = await processor.process(content)

		const errors = []
		const warnings = []

		if (result.messages) {
			for (const message of result.messages) {
				if (message.fatal) {
					errors.push({
						line: message.line,
						column: message.column,
						message: message.message,
						rule: message.ruleId,
					})
				} else {
					warnings.push({
						line: message.line,
						column: message.column,
						message: message.message,
						rule: message.ruleId,
					})
				}
			}
		}

		return {
			errors,
			warnings,
			errorCount: errors.length,
			warningCount: warnings.length,
			valid: errors.length === 0,
		}
	}
}

// Incremental validation
class IncrementalValidator {
	constructor(cache) {
		this.cache = cache
	}

	async getChangedFiles(rootDir, since) {
		const fileDiscovery = new FileDiscovery()
		const allFiles = await fileDiscovery.discoverFiles(rootDir)

		return allFiles.filter((file) => file.mtime > since)
	}

	async validateChangedFiles(rootDir, since) {
		const changedFiles = await this.getChangedFiles(rootDir, since)
		const validator = new ParallelValidator()

		return await validator.validateFiles(changedFiles, this.cache)
	}
}

// Main validation class
class PerformanceOptimizedValidator {
	constructor(options = {}) {
		this.options = {
			maxWorkers: options.maxWorkers || Math.min(os.cpus().length, 8),
			cacheFile: options.cacheFile || ".validation-cache.json",
			incremental: options.incremental || false,
			since: options.since || null,
			...options,
		}

		this.monitor = new PerformanceMonitor()
		this.cache = new ValidationCache(this.options.cacheFile)
		this.validator = new ParallelValidator({ maxWorkers: this.options.maxWorkers })
		this.incrementalValidator = new IncrementalValidator(this.cache)
	}

	async validate(rootDir) {
		this.monitor.startTimer("validation")

		try {
			let files
			let results

			if (this.options.incremental && this.options.since) {
				// Incremental validation
				results = await this.incrementalValidator.validateChangedFiles(rootDir, this.options.since)
				files = results.map((r) => ({ path: r.file }))
			} else {
				// Full validation
				const fileDiscovery = new FileDiscovery()
				files = await fileDiscovery.discoverFiles(rootDir)
				results = await this.validator.validateFiles(files, this.cache)
			}

			// Update metrics
			this.monitor.metrics.filesProcessed = files.length
			this.monitor.metrics.cacheHits = results.filter((r) => r.fromCache).length
			this.monitor.metrics.cacheMisses = results.filter((r) => !r.fromCache).length

			for (const result of results) {
				this.monitor.metrics.errorsFound += result.errorCount || 0
				this.monitor.metrics.warningsFound += result.warningCount || 0
			}

			// Save cache
			await this.cache.saveCache()

			this.monitor.endTimer("validation")

			return {
				results,
				metrics: this.monitor.getMetrics(),
				summary: this._generateSummary(results),
			}
		} catch (error) {
			this.monitor.endTimer("validation")
			throw error
		}
	}

	_generateSummary(results) {
		const totalFiles = results.length
		const validFiles = results.filter((r) => r.valid).length
		const invalidFiles = totalFiles - validFiles
		const totalErrors = results.reduce((sum, r) => sum + (r.errorCount || 0), 0)
		const totalWarnings = results.reduce((sum, r) => sum + (r.warningCount || 0), 0)

		return {
			totalFiles,
			validFiles,
			invalidFiles,
			totalErrors,
			totalWarnings,
			successRate: totalFiles > 0 ? (validFiles / totalFiles) * 100 : 100,
		}
	}

	async clearCache() {
		this.cache.clear()
		await this.cache.saveCache()
	}

	getMetrics() {
		return this.monitor.getMetrics()
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2)
	const rootDir = args[0] || "docs"

	const options = {
		incremental: args.includes("--incremental"),
		since: args.includes("--since") ? parseInt(args[args.indexOf("--since") + 1]) : null,
		maxWorkers: args.includes("--workers")
			? parseInt(args[args.indexOf("--workers") + 1])
			: Math.min(os.cpus().length, 8),
		cacheFile: args.includes("--cache") ? args[args.indexOf("--cache") + 1] : ".validation-cache.json",
	}

	const validator = new PerformanceOptimizedValidator(options)

	try {
		// Color codes
		const colors = {
			reset: "\x1b[0m",
			bright: "\x1b[1m",
			dim: "\x1b[2m",
			red: "\x1b[31m",
			green: "\x1b[32m",
			yellow: "\x1b[33m",
			blue: "\x1b[34m",
			magenta: "\x1b[35m",
			cyan: "\x1b[36m",
			white: "\x1b[37m",
			bgBlue: "\x1b[44m",
			bgGreen: "\x1b[42m",
			bgRed: "\x1b[41m",
			bgYellow: "\x1b[43m",
		}

		// Header
		const boxWidth = 83

		// Header content
		const title = "📚 DOCUMENTATION VALIDATOR"
		const subtitle = "Performance-Optimized Edition"

		// Calculate visual width using the string-width package
		const getVisualWidth = (text) => {
			// Remove ANSI color codes first
			const cleanText = text.replace(/\x1b\[[0-9;]*m/g, "")

			// Use string-width package for accurate display width calculation
			return stringWidth(cleanText)
		}

		// Bulletproof centering function for all boxes
		const createCenteredBox = (text, borderColor, boxWidth = 83) => {
			const headerLine = "─".repeat(boxWidth - 2)
			const textVisualWidth = getVisualWidth(text)
			// Account for: │ + space + text + space + │ = boxWidth
			// So: space + text + space = boxWidth - 2 (just the │ characters)
			const availableWidth = boxWidth - 2 // │ + │
			const leftPadding = Math.floor((availableWidth - textVisualWidth) / 2)
			const rightPadding = availableWidth - textVisualWidth - leftPadding

			// Paranoid verification
			const totalWidth = leftPadding + textVisualWidth + rightPadding
			if (totalWidth !== availableWidth) {
				console.error(`Width mismatch: ${totalWidth} vs ${availableWidth}`)
			}

			const top = `${borderColor}┌${headerLine}┐${colors.reset}`
			const content = `${borderColor}│${colors.reset}${" ".repeat(leftPadding)}${text}${" ".repeat(rightPadding)}${borderColor}│${colors.reset}`
			const bottom = `${borderColor}└${headerLine}┘${colors.reset}`

			// Assert all parts have equal length - crash on mismatch
			const topLength = getVisualWidth(top)
			const contentLength = getVisualWidth(content)
			const bottomLength = getVisualWidth(bottom)

			if (topLength !== contentLength || contentLength !== bottomLength) {
				throw new Error(
					`Box length mismatch: top=${topLength}, content=${contentLength}, bottom=${bottomLength}\n` +
						`Top: "${top}"\n` +
						`Content: "${content}"\n` +
						`Bottom: "${bottom}"`,
				)
			}

			return { top, content, bottom }
		}

		// Create header box with title and subtitle
		const titleText = `${colors.bright}${title}${colors.reset}`
		const subtitleText = `${colors.dim}${subtitle}${colors.reset}`

		const headerBox = createCenteredBox(titleText, colors.cyan)
		const subtitleBox = createCenteredBox(subtitleText, colors.cyan)

		console.log(headerBox.top)
		console.log(headerBox.content)
		console.log(subtitleBox.content)
		console.log(headerBox.bottom)
		console.log()

		// Configuration
		console.log(`${colors.blue}🔧 Configuration:${colors.reset}`)
		console.log(`   📁 Root directory: ${colors.white}${rootDir}${colors.reset}`)
		console.log(`   👥 Max workers: ${colors.white}${validator.options.maxWorkers}${colors.reset}`)
		console.log(`   💾 Cache file: ${colors.white}${validator.options.cacheFile}${colors.reset}`)

		if (options.incremental) {
			console.log(
				`   🔄 Incremental validation since: ${colors.white}${new Date(options.since).toISOString()}${colors.reset}`,
			)
		}

		console.log()
		console.log(`${colors.yellow}🔍 Starting validation...${colors.reset}`)

		const result = await validator.validate(rootDir)

		// Results header
		console.log()
		const resultsBox = createCenteredBox(`${colors.bright}📊 RESULTS${colors.reset}`, colors.green)
		console.log(resultsBox.top)
		console.log(resultsBox.content)
		console.log(resultsBox.bottom)

		// Validation results with better formatting
		const statusIcon = result.summary.totalErrors === 0 ? "✅" : "❌"
		const warningIcon = result.summary.totalWarnings === 0 ? "✅" : "⚠️"

		console.log()
		console.log(`${colors.blue}📋 Validation Summary:${colors.reset}`)
		console.log(
			`   ${colors.green}${statusIcon} Valid files:     ${colors.white}${result.summary.validFiles.toString().padStart(3)}${colors.dim}/${result.summary.totalFiles}${colors.reset}`,
		)
		console.log(
			`   ${result.summary.invalidFiles === 0 ? colors.green + "✅" : colors.red + "❌"} Invalid files:   ${colors.white}${result.summary.invalidFiles.toString().padStart(3)}${colors.reset}`,
		)
		console.log(
			`   ${result.summary.totalWarnings === 0 ? colors.green + "✅" : colors.yellow + "⚠️"} Total warnings:  ${colors.white}${result.summary.totalWarnings.toString().padStart(3)}${colors.reset}`,
		)
		console.log(
			`   ${result.summary.totalErrors === 0 ? colors.green + "✅" : colors.red + "❌"} Total errors:    ${colors.white}${result.summary.totalErrors.toString().padStart(3)}${colors.reset}`,
		)
		console.log(
			`   ${colors.cyan}📈 Success rate:    ${colors.white}${result.summary.successRate.toFixed(1)}%${colors.reset}`,
		)

		// Performance metrics with better formatting
		console.log()
		console.log(`${colors.magenta}⚡ Performance Metrics:${colors.reset}`)
		const timeFormatted =
			result.metrics.totalTime < 1000
				? `${result.metrics.totalTime}ms`
				: `${(result.metrics.totalTime / 1000).toFixed(2)}s`
		console.log(`   ${colors.cyan}⏱️  Total time:      ${colors.white}${timeFormatted.padStart(8)}${colors.reset}`)
		console.log(
			`   ${colors.blue}📁 Files processed: ${colors.white}${result.metrics.filesProcessed.toString().padStart(3)}${colors.reset}`,
		)
		console.log(
			`   ${colors.green}🏃 Files per second: ${colors.white}${result.metrics.filesPerSecond.toFixed(0).padStart(6)}${colors.reset}`,
		)
		console.log(
			`   ${colors.yellow}💾 Cache hits:      ${colors.white}${result.metrics.cacheHits.toString().padStart(3)}${colors.reset}`,
		)
		console.log(
			`   ${colors.red}🔄 Cache misses:    ${colors.white}${result.metrics.cacheMisses.toString().padStart(3)}${colors.reset}`,
		)

		const cacheHitRate =
			result.metrics.cacheHits > 0
				? ((result.metrics.cacheHits / (result.metrics.cacheHits + result.metrics.cacheMisses)) * 100).toFixed(
						1,
					)
				: 0
		const cacheColor = cacheHitRate >= 90 ? colors.green : cacheHitRate >= 70 ? colors.yellow : colors.red
		console.log(`   ${colors.cyan}📊 Cache hit rate:  ${cacheColor}${cacheHitRate}%${colors.reset}`)

		// Display errors and warnings with better formatting
		const filesWithErrors = result.results.filter((r) => !r.valid)
		const filesWithWarnings = result.results.filter((r) => (r.warningCount || 0) > 0)

		if (filesWithErrors.length > 0) {
			console.log()
			const errorsBox = createCenteredBox(`${colors.bright}❌ FILES WITH ERRORS${colors.reset}`, colors.red)
			console.log(errorsBox.top)
			console.log(errorsBox.content)
			console.log(errorsBox.bottom)
			for (const file of filesWithErrors) {
				console.log()
				console.log(`${colors.blue}📄 ${colors.white}${file.file}${colors.reset}:`)
				for (const error of file.errors || []) {
					console.log(
						`   ${colors.red}🚨 Line ${colors.white}${error.line}:${error.column}${colors.reset} - ${colors.yellow}${error.message}${colors.reset}`,
					)
					console.log(`      ${colors.dim}Rule: ${colors.cyan}${error.rule}${colors.reset}`)
				}
			}
		}

		if (filesWithWarnings.length > 0) {
			console.log()
			const warningsBox = createCenteredBox(
				`${colors.bright}⚠️ FILES WITH WARNINGS${colors.reset}`,
				colors.yellow,
			)
			console.log(warningsBox.top)
			console.log(warningsBox.content)
			console.log(warningsBox.bottom)
			for (const file of filesWithWarnings) {
				console.log()
				console.log(`${colors.blue}📄 ${colors.white}${file.file}${colors.reset}:`)
				for (const warning of file.warnings || []) {
					console.log(
						`   ${colors.yellow}⚠️  Line ${colors.white}${warning.line}:${warning.column}${colors.reset} - ${colors.yellow}${warning.message}${colors.reset}`,
					)
					console.log(`      ${colors.dim}Rule: ${colors.cyan}${warning.rule}${colors.reset}`)
				}
			}
		}

		// Footer
		console.log()
		const overallStatus = result.summary.totalErrors === 0 ? "✅ ALL GOOD!" : "❌ ISSUES FOUND"
		const footerColor = result.summary.totalErrors === 0 ? colors.green : colors.red
		const footerBox = createCenteredBox(`${colors.bright}${overallStatus}${colors.reset}`, footerColor)
		console.log(footerBox.top)
		console.log(footerBox.content)
		console.log(footerBox.bottom)

		// Exit with error code if there are validation errors
		if (result.summary.totalErrors > 0) {
			process.exit(1)
		}
	} catch (error) {
		console.error("[ERROR] Validation failed:", error.message)
		process.exit(1)
	}
}

// Export for use as module
export { PerformanceOptimizedValidator, ValidationCache, ParallelValidator, IncrementalValidator, PerformanceMonitor }

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}
