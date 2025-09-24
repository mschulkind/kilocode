#!/usr/bin/env node

/**
 * Documentation Metrics Collector
 *
 * Collects comprehensive metrics about the documentation system including:
 * - File statistics and quality metrics
 * - Validation performance metrics
 * - Content analysis metrics
 * - Link health metrics
 * - Maintenance metrics
 */

import { readFileSync, existsSync, statSync } from "fs"
import { join, relative, dirname, basename } from "path"
import { fileURLToPath } from "url"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkToc from "remark-toc"
import remarkValidateLinks from "remark-validate-links"
import remarkStringify from "remark-stringify"
import remarkKiloCodeStandards from "../../plugins/remark-kilocode-standards.js"
import remarkKiloCodeComprehensive from "../../plugins/remark-kilocode-comprehensive.js"
import { glob } from "glob"
import chalk from "chalk"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "../..")

/**
 * DocumentationMetricsCollector Class
 *
 * Collects comprehensive metrics about the documentation system
 */
class DocumentationMetricsCollector {
	constructor(options = {}) {
		this.options = {
			outputFormat: "console", // 'console', 'json', 'csv'
			outputFile: null,
			includePerformance: true,
			includeQuality: true,
			includeContent: true,
			includeLinks: true,
			includeMaintenance: true,
			...options,
		}
		this.metrics = {
			timestamp: new Date().toISOString(),
			fileStats: {},
			qualityMetrics: {},
			performanceMetrics: {},
			contentMetrics: {},
			linkMetrics: {},
			maintenanceMetrics: {},
		}
	}

	/**
	 * Main execution method
	 */
	async run() {
		try {
			console.log(chalk.blue("📊 Collecting Documentation Metrics..."))

			// Find all markdown files
			const files = await this.findMarkdownFiles()
			console.log(chalk.gray(`Found ${files.length} markdown files`))

			// Collect file statistics
			await this.collectFileStats(files)

			// Collect quality metrics
			if (this.options.includeQuality) {
				await this.collectQualityMetrics(files)
			}

			// Collect performance metrics
			if (this.options.includePerformance) {
				await this.collectPerformanceMetrics(files)
			}

			// Collect content metrics
			if (this.options.includeContent) {
				await this.collectContentMetrics(files)
			}

			// Collect link metrics
			if (this.options.includeLinks) {
				await this.collectLinkMetrics(files)
			}

			// Collect maintenance metrics
			if (this.options.includeMaintenance) {
				await this.collectMaintenanceMetrics(files)
			}

			// Output results
			await this.outputResults()

			console.log(chalk.green("✅ Metrics collection complete!"))
		} catch (error) {
			console.error(chalk.red("❌ Error collecting metrics:"), error.message)
			process.exit(1)
		}
	}

	/**
	 * Find all markdown files in the docs directory
	 */
	async findMarkdownFiles() {
		const patterns = [
			"docs/**/*.md",
			"docs/**/*.mdx",
			"!node_modules/**",
			"!.git/**",
			"!dist/**",
			"!build/**",
			"!coverage/**",
		]

		const files = await glob(patterns, { cwd: projectRoot })
		return files.map((file) => join(projectRoot, file))
	}

	/**
	 * Collect basic file statistics
	 */
	async collectFileStats(files) {
		console.log(chalk.gray("📁 Collecting file statistics..."))

		const stats = {
			totalFiles: files.length,
			fileSizes: [],
			fileTypes: {},
			directoryStructure: {},
			lastModified: [],
		}

		for (const file of files) {
			try {
				const stat = statSync(file)
				const relativePath = relative(projectRoot, file)
				const ext = file.split(".").pop()
				const dir = dirname(relativePath)

				stats.fileSizes.push(stat.size)
				stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1
				stats.directoryStructure[dir] = (stats.directoryStructure[dir] || 0) + 1
				stats.lastModified.push({
					file: relativePath,
					mtime: stat.mtime,
					size: stat.size,
				})
			} catch (error) {
				console.warn(chalk.yellow(`Warning: Could not stat ${file}: ${error.message}`))
			}
		}

		// Calculate derived statistics
		stats.fileSizes.sort((a, b) => a - b)
		stats.averageFileSize = stats.fileSizes.reduce((a, b) => a + b, 0) / stats.fileSizes.length
		stats.medianFileSize = stats.fileSizes[Math.floor(stats.fileSizes.length / 2)]
		stats.largestFile = Math.max(...stats.fileSizes)
		stats.smallestFile = Math.min(...stats.fileSizes)

		// Sort by modification time
		stats.lastModified.sort((a, b) => b.mtime - a.mtime)

		this.metrics.fileStats = stats
	}

	/**
	 * Collect quality metrics
	 */
	async collectQualityMetrics(files) {
		console.log(chalk.gray("🔍 Collecting quality metrics..."))

		const quality = {
			totalWarnings: 0,
			totalErrors: 0,
			warningsByType: {},
			errorsByType: {},
			qualityScores: [],
			filesWithIssues: 0,
			filesWithoutIssues: 0,
		}

		for (const file of files) {
			try {
				const result = await this.processFile(file)
				if (result.issues.length > 0) {
					quality.filesWithIssues++
					quality.totalErrors += result.issues.length
					result.issues.forEach((issue) => {
						quality.errorsByType[issue.type] = (quality.errorsByType[issue.type] || 0) + 1
					})
				} else {
					quality.filesWithoutIssues++
				}

				if (result.warnings.length > 0) {
					quality.totalWarnings += result.warnings.length
					result.warnings.forEach((warning) => {
						quality.warningsByType[warning.type] = (quality.warningsByType[warning.type] || 0) + 1
					})
				}

				if (result.qualityScore !== undefined) {
					quality.qualityScores.push(result.qualityScore)
				}
			} catch (error) {
				console.warn(chalk.yellow(`Warning: Could not process ${file}: ${error.message}`))
			}
		}

		// Calculate average quality score
		if (quality.qualityScores.length > 0) {
			quality.averageQualityScore =
				quality.qualityScores.reduce((a, b) => a + b, 0) / quality.qualityScores.length
		}

		this.metrics.qualityMetrics = quality
	}

	/**
	 * Collect performance metrics
	 */
	async collectPerformanceMetrics(files) {
		console.log(chalk.gray("⚡ Collecting performance metrics..."))

		const startTime = Date.now()
		const performance = {
			processingTimes: [],
			totalProcessingTime: 0,
			averageProcessingTime: 0,
			filesPerSecond: 0,
		}

		// Process a sample of files to measure performance
		const sampleSize = Math.min(10, files.length)
		const sampleFiles = files.slice(0, sampleSize)

		for (const file of sampleFiles) {
			const fileStartTime = Date.now()
			try {
				await this.processFile(file)
				const fileEndTime = Date.now()
				performance.processingTimes.push(fileEndTime - fileStartTime)
			} catch (error) {
				console.warn(chalk.yellow(`Warning: Could not process ${file}: ${error.message}`))
			}
		}

		const endTime = Date.now()
		performance.totalProcessingTime = endTime - startTime
		performance.averageProcessingTime =
			performance.processingTimes.reduce((a, b) => a + b, 0) / performance.processingTimes.length
		performance.filesPerSecond = (sampleFiles.length / performance.totalProcessingTime) * 1000

		this.metrics.performanceMetrics = performance
	}

	/**
	 * Collect content metrics
	 */
	async collectContentMetrics(files) {
		console.log(chalk.gray("📝 Collecting content metrics..."))

		const content = {
			totalWords: 0,
			totalLines: 0,
			totalCharacters: 0,
			averageWordsPerFile: 0,
			averageLinesPerFile: 0,
			averageCharactersPerFile: 0,
			headingCount: 0,
			linkCount: 0,
			imageCount: 0,
			codeBlockCount: 0,
		}

		for (const file of files) {
			try {
				const fileContent = readFileSync(file, "utf8")
				const lines = fileContent.split("\n")
				const words = fileContent.split(/\s+/).filter((word) => word.length > 0)
				const characters = fileContent.length

				content.totalWords += words.length
				content.totalLines += lines.length
				content.totalCharacters += characters

				// Count specific elements
				content.headingCount += (fileContent.match(/^#+\s/gm) || []).length
				content.linkCount += (fileContent.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length
				content.imageCount += (fileContent.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length
				content.codeBlockCount += (fileContent.match(/```[\s\S]*?```/g) || []).length
			} catch (error) {
				console.warn(chalk.yellow(`Warning: Could not read ${file}: ${error.message}`))
			}
		}

		content.averageWordsPerFile = content.totalWords / files.length
		content.averageLinesPerFile = content.totalLines / files.length
		content.averageCharactersPerFile = content.totalCharacters / files.length

		this.metrics.contentMetrics = content
	}

	/**
	 * Collect link metrics
	 */
	async collectLinkMetrics(files) {
		console.log(chalk.gray("🔗 Collecting link metrics..."))

		const links = {
			totalLinks: 0,
			internalLinks: 0,
			externalLinks: 0,
			brokenLinks: 0,
			linkTypes: {},
		}

		for (const file of files) {
			try {
				const fileContent = readFileSync(file, "utf8")

				// Count all links in the file
				const linkMatches = fileContent.match(/\[([^\]]+)\]\([^)]+\)/g) || []
				links.totalLinks += linkMatches.length

				// Categorize links
				linkMatches.forEach((link) => {
					const urlMatch = link.match(/\[([^\]]+)\]\(([^)]+)\)/)
					if (urlMatch) {
						const url = urlMatch[2]
						if (url.startsWith("http://") || url.startsWith("https://")) {
							links.externalLinks++
						} else {
							links.internalLinks++
						}
					}
				})

				// Count broken links from validation results
				const result = await this.processFile(file)
				result.warnings.forEach((warning) => {
					if (warning.type === "missing-file") {
						links.brokenLinks++
					}
				})
			} catch (error) {
				console.warn(chalk.yellow(`Warning: Could not process ${file}: ${error.message}`))
			}
		}

		this.metrics.linkMetrics = links
	}

	/**
	 * Collect maintenance metrics
	 */
	async collectMaintenanceMetrics(files) {
		console.log(chalk.gray("🔧 Collecting maintenance metrics..."))

		const maintenance = {
			filesNeedingToc: 0,
			filesNeedingNavigation: 0,
			filesNeedingResearchContext: 0,
			orphanedFiles: 0,
		}

		for (const file of files) {
			try {
				const result = await this.processFile(file)
				result.warnings.forEach((warning) => {
					if (warning.message.includes("Table of Contents")) {
						maintenance.filesNeedingToc++
					}
					if (warning.message.includes("navigation footer")) {
						maintenance.filesNeedingNavigation++
					}
					if (warning.message.includes("Research Context")) {
						maintenance.filesNeedingResearchContext++
					}
					if (warning.message.includes("orphaned")) {
						maintenance.orphanedFiles++
					}
				})
			} catch (error) {
				console.warn(chalk.yellow(`Warning: Could not process ${file}: ${error.message}`))
			}
		}

		this.metrics.maintenanceMetrics = maintenance
	}

	/**
	 * Process a single file
	 */
	async processFile(filePath) {
		const relativePath = relative(projectRoot, filePath)
		const content = readFileSync(filePath, "utf8")

		// Create unified processor
		const processor = unified()
			.use(remarkParse)
			.use(remarkFrontmatter)
			.use(remarkGfm)
			.use(remarkToc)
			.use(remarkValidateLinks)
			.use(remarkStringify)
			.use(remarkKiloCodeStandards)
			.use(remarkKiloCodeComprehensive)

		// Process the file
		const file = await processor.process(content)
		file.path = filePath

		// Extract results
		const result = {
			path: relativePath,
			issues: [],
			warnings: [],
			qualityScore: 0.5, // Default score
		}

		// Extract warnings and issues from the processed file
		if (file.messages) {
			file.messages.forEach((message) => {
				const item = {
					type: message.ruleId || "unknown",
					message: message.message,
					line: message.line,
					column: message.column,
				}

				if (message.fatal) {
					result.issues.push(item)
				} else {
					result.warnings.push(item)
				}
			})
		}

		return result
	}

	/**
	 * Output the collected metrics
	 */
	async outputResults() {
		if (this.options.outputFormat === "json") {
			console.log(JSON.stringify(this.metrics, null, 2))
		} else if (this.options.outputFormat === "csv") {
			this.outputCsv()
		} else {
			this.outputConsole()
		}

		if (this.options.outputFile) {
			const output =
				this.options.outputFormat === "json"
					? JSON.stringify(this.metrics, null, 2)
					: this.formatConsoleOutput()

			writeFileSync(this.options.outputFile, output)
			console.log(chalk.green(`📄 Metrics saved to ${this.options.outputFile}`))
		}
	}

	/**
	 * Output metrics to console
	 */
	outputConsole() {
		console.log(chalk.blue("\n📊 Documentation Metrics Report"))
		console.log(chalk.blue("=".repeat(50)))

		// File Statistics
		console.log(chalk.yellow("\n📁 File Statistics"))
		console.log(`Total Files: ${this.metrics.fileStats.totalFiles}`)
		console.log(`Average File Size: ${Math.round(this.metrics.fileStats.averageFileSize)} bytes`)
		console.log(`Largest File: ${this.metrics.fileStats.largestFile} bytes`)
		console.log(`Smallest File: ${this.metrics.fileStats.smallestFile} bytes`)

		// Quality Metrics
		if (this.options.includeQuality) {
			console.log(chalk.yellow("\n🔍 Quality Metrics"))
			console.log(`Total Warnings: ${this.metrics.qualityMetrics.totalWarnings}`)
			console.log(`Total Errors: ${this.metrics.qualityMetrics.totalErrors}`)
			console.log(`Files with Issues: ${this.metrics.qualityMetrics.filesWithIssues}`)
			console.log(`Files without Issues: ${this.metrics.qualityMetrics.filesWithoutIssues}`)
			if (this.metrics.qualityMetrics.averageQualityScore) {
				console.log(`Average Quality Score: ${this.metrics.qualityMetrics.averageQualityScore.toFixed(2)}`)
			}
		}

		// Performance Metrics
		if (this.options.includePerformance) {
			console.log(chalk.yellow("\n⚡ Performance Metrics"))
			console.log(
				`Average Processing Time: ${this.metrics.performanceMetrics.averageProcessingTime.toFixed(2)}ms`,
			)
			console.log(`Files per Second: ${this.metrics.performanceMetrics.filesPerSecond.toFixed(2)}`)
		}

		// Content Metrics
		if (this.options.includeContent) {
			console.log(chalk.yellow("\n📝 Content Metrics"))
			console.log(`Total Words: ${this.metrics.contentMetrics.totalWords.toLocaleString()}`)
			console.log(`Total Lines: ${this.metrics.contentMetrics.totalLines.toLocaleString()}`)
			console.log(`Total Characters: ${this.metrics.contentMetrics.totalCharacters.toLocaleString()}`)
			console.log(`Average Words per File: ${Math.round(this.metrics.contentMetrics.averageWordsPerFile)}`)
			console.log(`Headings: ${this.metrics.contentMetrics.headingCount}`)
			console.log(`Links: ${this.metrics.contentMetrics.linkCount}`)
			console.log(`Images: ${this.metrics.contentMetrics.imageCount}`)
			console.log(`Code Blocks: ${this.metrics.contentMetrics.codeBlockCount}`)
		}

		// Link Metrics
		if (this.options.includeLinks) {
			console.log(chalk.yellow("\n🔗 Link Metrics"))
			console.log(`Total Links: ${this.metrics.linkMetrics.totalLinks}`)
			console.log(`Broken Links: ${this.metrics.linkMetrics.brokenLinks}`)
		}

		// Maintenance Metrics
		if (this.options.includeMaintenance) {
			console.log(chalk.yellow("\n🔧 Maintenance Metrics"))
			console.log(`Files Needing TOC: ${this.metrics.maintenanceMetrics.filesNeedingToc}`)
			console.log(`Files Needing Navigation: ${this.metrics.maintenanceMetrics.filesNeedingNavigation}`)
			console.log(
				`Files Needing Research Context: ${this.metrics.maintenanceMetrics.filesNeedingResearchContext}`,
			)
			console.log(`Orphaned Files: ${this.metrics.maintenanceMetrics.orphanedFiles}`)
		}

		console.log(chalk.blue("\n" + "=".repeat(50)))
	}

	/**
	 * Output metrics as CSV
	 */
	outputCsv() {
		const headers = [
			"timestamp",
			"totalFiles",
			"averageFileSize",
			"totalWarnings",
			"totalErrors",
			"averageQualityScore",
			"filesPerSecond",
			"totalWords",
			"totalLinks",
			"brokenLinks",
		]

		const values = [
			this.metrics.timestamp,
			this.metrics.fileStats.totalFiles,
			Math.round(this.metrics.fileStats.averageFileSize),
			this.metrics.qualityMetrics.totalWarnings,
			this.metrics.qualityMetrics.totalErrors,
			this.metrics.qualityMetrics.averageQualityScore?.toFixed(2) || "N/A",
			this.metrics.performanceMetrics.filesPerSecond?.toFixed(2) || "N/A",
			this.metrics.contentMetrics.totalWords,
			this.metrics.linkMetrics.totalLinks,
			this.metrics.linkMetrics.brokenLinks,
		]

		console.log(headers.join(","))
		console.log(values.join(","))
	}

	/**
	 * Format console output for file writing
	 */
	formatConsoleOutput() {
		// This would be a more detailed version of the console output
		// For now, return JSON as fallback
		return JSON.stringify(this.metrics, null, 2)
	}
}

/**
 * Main execution
 */
async function main() {
	const args = process.argv.slice(2)
	const options = {}

	// Parse command line arguments
	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--format":
			case "-f":
				options.outputFormat = args[++i] || "console"
				break
			case "--output":
			case "-o":
				options.outputFile = args[++i]
				break
			case "--json":
				options.outputFormat = "json"
				break
			case "--csv":
				options.outputFormat = "csv"
				break
			case "--help":
			case "-h":
				console.log(`
Usage: node metrics.js [options]

Options:
  --format, -f <format>  Output format (console, json, csv)
  --output, -o <file>    Output file path
  --json                 Output as JSON
  --csv                  Output as CSV
  --help, -h             Show this help
				`)
				process.exit(0)
				break
		}
	}

	const collector = new DocumentationMetricsCollector(options)
	await collector.run()
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}

export default DocumentationMetricsCollector
