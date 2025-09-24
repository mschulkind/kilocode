#!/usr/bin/env node

/**
 * Documentation Validation Report Generator
 *
 * Generates comprehensive validation reports for KiloCode documentation.
 * Provides detailed statistics, issue tracking, and quality metrics.
 */

import { readFileSync, writeFileSync, existsSync, statSync } from "fs"
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
 * ValidationReportGenerator Class
 *
 * Generates comprehensive validation reports including:
 * - Overall statistics and metrics
 * - Issue categorization and tracking
 * - Quality scoring and trends
 * - File-by-file analysis
 * - Recommendations and action items
 */
class ValidationReportGenerator {
	constructor(options = {}) {
		this.options = {
			outputFormat: "console", // 'console', 'json', 'html', 'markdown'
			outputFile: null,
			includeMetrics: true,
			includeTrends: true,
			includeRecommendations: true,
			threshold: {
				quality: 0.7,
				issues: 10,
				warnings: 50,
			},
			...options,
		}

		this.results = {
			summary: {
				totalFiles: 0,
				validFiles: 0,
				filesWithIssues: 0,
				filesWithWarnings: 0,
				totalIssues: 0,
				totalWarnings: 0,
				averageQualityScore: 0,
				validationTime: 0,
			},
			files: [],
			issues: {
				byType: {},
				bySeverity: {},
				byFile: {},
			},
			quality: {
				scores: [],
				trends: [],
				recommendations: [],
			},
			statistics: {
				wordCount: 0,
				linkCount: 0,
				headingCount: 0,
				sectionCount: 0,
				crossReferences: 0,
				orphanedDocuments: 0,
			},
		}
	}

	/**
	 * Generate comprehensive validation report
	 */
	async generateReport() {
		const startTime = Date.now()

		console.log(chalk.blue("🔍 Generating Documentation Validation Report..."))

		// Find all markdown files
		const markdownFiles = await this.findMarkdownFiles()
		console.log(chalk.gray(`Found ${markdownFiles.length} markdown files`))

		// Process each file
		for (const filePath of markdownFiles) {
			await this.processFile(filePath)
		}

		// Calculate summary statistics
		this.calculateSummary()

		// Generate recommendations
		if (this.options.includeRecommendations) {
			this.generateRecommendations()
		}

		// Calculate validation time
		this.results.summary.validationTime = Date.now() - startTime

		// Output report
		await this.outputReport()

		return this.results
	}

	/**
	 * Find all markdown files in the project
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

		const files = await glob(patterns, {
			cwd: projectRoot,
			absolute: true,
		})

		return files.filter((file) => {
			// Skip certain directories
			const relativePath = relative(projectRoot, file)
			const skipPatterns = ["node_modules/", ".git/", "dist/", "build/", "coverage/", ".next/", ".turbo/"]

			return !skipPatterns.some((pattern) => relativePath.includes(pattern))
		})
	}

	/**
	 * Process a single markdown file
	 */
	async processFile(filePath) {
		try {
			const relativePath = relative(projectRoot, filePath)
			const content = readFileSync(filePath, "utf8")

			// Create unified processor with all plugins
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
			const fileResult = {
				path: relativePath,
				absolutePath: filePath,
				issues: [],
				warnings: [],
				metrics: file.data?.kilocodeMetrics || {},
				structure: file.data?.kilocodeStructure || {},
				qualityScore: 0,
				status: "valid",
			}

			// Process messages
			if (file.messages) {
				for (const message of file.messages) {
					const result = {
						line: message.line || 0,
						column: message.column || 0,
						rule: message.ruleId || "unknown",
						message: message.message,
						suggestion: message.note || null,
						severity: message.fatal ? "error" : "warning",
					}

					if (message.fatal) {
						fileResult.issues.push(result)
					} else {
						fileResult.warnings.push(result)
					}
				}
			}

			// Calculate quality score
			fileResult.qualityScore = this.calculateFileQualityScore(fileResult)

			// Determine status
			if (fileResult.issues.length > 0) {
				fileResult.status = "error"
			} else if (fileResult.warnings.length > this.options.threshold.warnings) {
				fileResult.status = "warning"
			} else if (fileResult.qualityScore < this.options.threshold.quality) {
				fileResult.status = "low-quality"
			}

			// Add to results
			this.results.files.push(fileResult)

			// Update statistics
			this.updateStatistics(fileResult)
		} catch (error) {
			console.error(chalk.red(`Error processing ${relative(projectRoot, filePath)}: ${error.message}`))

			this.results.files.push({
				path: relative(projectRoot, filePath),
				absolutePath: filePath,
				issues: [
					{
						line: 0,
						column: 0,
						rule: "processing-error",
						message: `Failed to process file: ${error.message}`,
						suggestion: "Check file syntax and format",
						severity: "error",
					},
				],
				warnings: [],
				metrics: {},
				structure: {},
				qualityScore: 0,
				status: "error",
			})
		}
	}

	/**
	 * Calculate file quality score
	 */
	calculateFileQualityScore(fileResult) {
		const metrics = fileResult.metrics
		const structure = fileResult.structure

		let score = 0

		// Base score from comprehensive plugin
		if (metrics.qualityScore !== undefined) {
			score = metrics.qualityScore
		} else {
			// Fallback calculation
			score = 0.5

			// Title presence
			if (structure.hasTitle) score += 0.1

			// Required sections
			if (structure.hasResearchContext) score += 0.1
			if (structure.hasNavigationFooter) score += 0.1
			if (structure.hasNoDeadEndsPolicy) score += 0.1

			// Fun fact presence
			if (structure.hasFunFact) score += 0.05

			// Link quality
			const links = structure.links || []
			const descriptiveLinks = links.filter((link) => !this.isNonDescriptiveLink(link.text, link.url)).length
			const linkQuality = links.length > 0 ? descriptiveLinks / links.length : 0.5
			score += linkQuality * 0.2

			// Content structure
			const headingCount = metrics.headingCount || 0
			const structureScore = Math.min(headingCount / 5, 1) * 0.2
			score += structureScore

			// Connectivity
			const connectivityScore = Math.min(links.length / 3, 1) * 0.15
			score += connectivityScore
		}

		// Penalize for issues and warnings
		const issuePenalty = Math.min(fileResult.issues.length * 0.1, 0.3)
		const warningPenalty = Math.min(fileResult.warnings.length * 0.02, 0.2)

		score = Math.max(score - issuePenalty - warningPenalty, 0)

		return Math.min(score, 1)
	}

	/**
	 * Check if link text is non-descriptive
	 */
	isNonDescriptiveLink(text, url) {
		const nonDescriptivePatterns = [
			/^(click here|here|link|more|read more|see more|continue|next|previous)$/i,
			/^(this|that|it)$/i,
			/^(page|document|file|article)$/i,
			/^\d+$/,
			/^[a-z]+\.(com|org|net|io)$/i,
		]

		if (text === url || text === url.replace(/^https?:\/\//, "")) {
			return true
		}

		return nonDescriptivePatterns.some((pattern) => pattern.test(text))
	}

	/**
	 * Update global statistics
	 */
	updateStatistics(fileResult) {
		const metrics = fileResult.metrics

		this.results.statistics.wordCount += metrics.wordCount || 0
		this.results.statistics.linkCount += metrics.linkCount || 0
		this.results.statistics.headingCount += metrics.headingCount || 0
		this.results.statistics.sectionCount += metrics.sectionCount || 0
		this.results.statistics.crossReferences += (fileResult.structure.crossReferences || []).length

		if (fileResult.structure.orphanedSections && fileResult.structure.orphanedSections.length > 0) {
			this.results.statistics.orphanedDocuments++
		}
	}

	/**
	 * Calculate summary statistics
	 */
	calculateSummary() {
		const files = this.results.files

		this.results.summary.totalFiles = files.length
		this.results.summary.validFiles = files.filter((f) => f.status === "valid").length
		this.results.summary.filesWithIssues = files.filter((f) => f.issues.length > 0).length
		this.results.summary.filesWithWarnings = files.filter((f) => f.warnings.length > 0).length
		this.results.summary.totalIssues = files.reduce((sum, f) => sum + f.issues.length, 0)
		this.results.summary.totalWarnings = files.reduce((sum, f) => sum + f.warnings.length, 0)

		// Calculate average quality score
		const qualityScores = files.map((f) => f.qualityScore).filter((score) => score > 0)
		this.results.summary.averageQualityScore =
			qualityScores.length > 0 ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0

		// Categorize issues
		this.categorizeIssues()
	}

	/**
	 * Categorize issues by type and severity
	 */
	categorizeIssues() {
		const files = this.results.files

		// Initialize categories
		this.results.issues.byType = {}
		this.results.issues.bySeverity = { error: 0, warning: 0 }
		this.results.issues.byFile = {}

		// Process each file
		for (const file of files) {
			this.results.issues.byFile[file.path] = {
				issues: file.issues.length,
				warnings: file.warnings.length,
				qualityScore: file.qualityScore,
				status: file.status,
			}

			// Process issues
			for (const issue of file.issues) {
				this.results.issues.bySeverity.error++
				this.results.issues.byType[issue.rule] = (this.results.issues.byType[issue.rule] || 0) + 1
			}

			// Process warnings
			for (const warning of file.warnings) {
				this.results.issues.bySeverity.warning++
				this.results.issues.byType[warning.rule] = (this.results.issues.byType[warning.rule] || 0) + 1
			}
		}
	}

	/**
	 * Generate recommendations
	 */
	generateRecommendations() {
		const recommendations = []

		// Quality score recommendations
		if (this.results.summary.averageQualityScore < this.options.threshold.quality) {
			recommendations.push({
				type: "quality",
				priority: "high",
				title: "Improve Overall Documentation Quality",
				description: `Average quality score (${this.results.summary.averageQualityScore.toFixed(2)}) is below threshold (${this.options.threshold.quality})`,
				action: "Focus on adding Research Context sections, navigation footers, and descriptive links",
			})
		}

		// Issue count recommendations
		if (this.results.summary.totalIssues > this.options.threshold.issues) {
			recommendations.push({
				type: "issues",
				priority: "high",
				title: "Address Critical Issues",
				description: `${this.results.summary.totalIssues} critical issues found across ${this.results.summary.filesWithIssues} files`,
				action: "Review and fix critical validation errors",
			})
		}

		// Most common issues
		const topIssues = Object.entries(this.results.issues.byType)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)

		if (topIssues.length > 0) {
			recommendations.push({
				type: "patterns",
				priority: "medium",
				title: "Address Common Issue Patterns",
				description: `Most common issues: ${topIssues.map(([rule, count]) => `${rule} (${count})`).join(", ")}`,
				action: "Focus on fixing the most frequently occurring validation issues",
			})
		}

		// Orphaned documents
		if (this.results.statistics.orphanedDocuments > 0) {
			recommendations.push({
				type: "connectivity",
				priority: "medium",
				title: "Improve Document Connectivity",
				description: `${this.results.statistics.orphanedDocuments} documents appear to be orphaned`,
				action: "Add navigation links and cross-references to improve document connectivity",
			})
		}

		this.results.quality.recommendations = recommendations
	}

	/**
	 * Output the validation report
	 */
	async outputReport() {
		switch (this.options.outputFormat) {
			case "json":
				await this.outputJsonReport()
				break
			case "html":
				await this.outputHtmlReport()
				break
			case "markdown":
				await this.outputMarkdownReport()
				break
			case "console":
			default:
				this.outputConsoleReport()
				break
		}
	}

	/**
	 * Output console report
	 */
	outputConsoleReport() {
		const { summary, issues, quality, statistics } = this.results

		console.log("\n" + chalk.bold.blue("📊 Documentation Validation Report"))
		console.log(chalk.gray("=".repeat(50)))

		// Summary
		console.log("\n" + chalk.bold("📈 Summary"))
		console.log(`Total Files: ${chalk.green(summary.totalFiles)}`)
		console.log(`Valid Files: ${chalk.green(summary.validFiles)}`)
		console.log(`Files with Issues: ${chalk.red(summary.filesWithIssues)}`)
		console.log(`Files with Warnings: ${chalk.yellow(summary.filesWithWarnings)}`)
		console.log(`Total Issues: ${chalk.red(summary.totalIssues)}`)
		console.log(`Total Warnings: ${chalk.yellow(summary.totalWarnings)}`)
		console.log(`Average Quality Score: ${chalk.blue(summary.averageQualityScore.toFixed(2))}`)
		console.log(`Validation Time: ${chalk.gray(summary.validationTime)}ms`)

		// Statistics
		console.log("\n" + chalk.bold("📊 Statistics"))
		console.log(`Total Words: ${chalk.green(statistics.wordCount.toLocaleString())}`)
		console.log(`Total Links: ${chalk.green(statistics.linkCount)}`)
		console.log(`Total Headings: ${chalk.green(statistics.headingCount)}`)
		console.log(`Cross References: ${chalk.green(statistics.crossReferences)}`)
		console.log(`Orphaned Documents: ${chalk.red(statistics.orphanedDocuments)}`)

		// Top issues
		const topIssues = Object.entries(issues.byType)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)

		if (topIssues.length > 0) {
			console.log("\n" + chalk.bold("🔍 Top Issues"))
			topIssues.forEach(([rule, count]) => {
				console.log(`${chalk.red(rule)}: ${count}`)
			})
		}

		// Recommendations
		if (quality.recommendations.length > 0) {
			console.log("\n" + chalk.bold("💡 Recommendations"))
			quality.recommendations.forEach((rec) => {
				const priorityColor =
					rec.priority === "high" ? chalk.red : rec.priority === "medium" ? chalk.yellow : chalk.green
				console.log(`${priorityColor(`[${rec.priority.toUpperCase()}]`)} ${rec.title}`)
				console.log(`  ${rec.description}`)
				console.log(`  ${chalk.gray(rec.action)}`)
			})
		}

		// Files with issues
		const problemFiles = this.results.files.filter((f) => f.issues.length > 0 || f.warnings.length > 5)
		if (problemFiles.length > 0) {
			console.log("\n" + chalk.bold("🚨 Files Needing Attention"))
			problemFiles.slice(0, 10).forEach((file) => {
				const statusColor =
					file.status === "error" ? chalk.red : file.status === "warning" ? chalk.yellow : chalk.green
				console.log(
					`${statusColor(file.status)} ${file.path} (${file.issues.length} issues, ${file.warnings.length} warnings)`,
				)
			})

			if (problemFiles.length > 10) {
				console.log(chalk.gray(`... and ${problemFiles.length - 10} more files`))
			}
		}

		console.log("\n" + chalk.gray("=".repeat(50)))
	}

	/**
	 * Output JSON report
	 */
	async outputJsonReport() {
		const outputFile = this.options.outputFile || "validation-report.json"
		writeFileSync(outputFile, JSON.stringify(this.results, null, 2))
		console.log(chalk.green(`✅ JSON report written to ${outputFile}`))
	}

	/**
	 * Output HTML report
	 */
	async outputHtmlReport() {
		const outputFile = this.options.outputFile || "validation-report.html"
		const html = this.generateHtmlReport()
		writeFileSync(outputFile, html)
		console.log(chalk.green(`✅ HTML report written to ${outputFile}`))
	}

	/**
	 * Generate HTML report
	 */
	generateHtmlReport() {
		const { summary, issues, quality, statistics } = this.results

		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KiloCode Documentation Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2em; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; }
        .summary-card h3 { margin: 0 0 10px 0; color: #374151; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .issues-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .issues-card { background: #f8fafc; padding: 20px; border-radius: 6px; }
        .issues-card h3 { margin: 0 0 15px 0; color: #374151; }
        .issue-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .issue-item:last-child { border-bottom: none; }
        .recommendations { background: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; }
        .recommendations h3 { margin: 0 0 15px 0; color: #92400e; }
        .recommendation { margin-bottom: 15px; padding: 10px; background: white; border-radius: 4px; }
        .recommendation h4 { margin: 0 0 5px 0; color: #92400e; }
        .recommendation p { margin: 0; color: #374151; }
        .timestamp { text-align: center; color: #6b7280; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Documentation Validation Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Files</h3>
                    <div class="value">${summary.totalFiles}</div>
                </div>
                <div class="summary-card">
                    <h3>Valid Files</h3>
                    <div class="value" style="color: #059669;">${summary.validFiles}</div>
                </div>
                <div class="summary-card">
                    <h3>Files with Issues</h3>
                    <div class="value" style="color: #dc2626;">${summary.filesWithIssues}</div>
                </div>
                <div class="summary-card">
                    <h3>Average Quality</h3>
                    <div class="value">${(summary.averageQualityScore * 100).toFixed(1)}%</div>
                </div>
            </div>
            
            <div class="issues-grid">
                <div class="issues-card">
                    <h3>🔍 Top Issues</h3>
                    ${Object.entries(issues.byType)
						.sort(([, a], [, b]) => b - a)
						.slice(0, 10)
						.map(
							([rule, count]) => `
                        <div class="issue-item">
                            <span>${rule}</span>
                            <span style="color: #dc2626; font-weight: bold;">${count}</span>
                        </div>
                    `,
						)
						.join("")}
                </div>
                
                <div class="issues-card">
                    <h3>📊 Statistics</h3>
                    <div class="issue-item">
                        <span>Total Words</span>
                        <span>${statistics.wordCount.toLocaleString()}</span>
                    </div>
                    <div class="issue-item">
                        <span>Total Links</span>
                        <span>${statistics.linkCount}</span>
                    </div>
                    <div class="issue-item">
                        <span>Total Headings</span>
                        <span>${statistics.headingCount}</span>
                    </div>
                    <div class="issue-item">
                        <span>Cross References</span>
                        <span>${statistics.crossReferences}</span>
                    </div>
                    <div class="issue-item">
                        <span>Orphaned Documents</span>
                        <span style="color: #dc2626;">${statistics.orphanedDocuments}</span>
                    </div>
                </div>
            </div>
            
            ${
				quality.recommendations.length > 0
					? `
            <div class="recommendations">
                <h3>💡 Recommendations</h3>
                ${quality.recommendations
					.map(
						(rec) => `
                    <div class="recommendation">
                        <h4>[${rec.priority.toUpperCase()}] ${rec.title}</h4>
                        <p><strong>Issue:</strong> ${rec.description}</p>
                        <p><strong>Action:</strong> ${rec.action}</p>
                    </div>
                `,
					)
					.join("")}
            </div>
            `
					: ""
			}
            
            <div class="timestamp">
                Report generated in ${summary.validationTime}ms
            </div>
        </div>
    </div>
</body>
</html>`
	}

	/**
	 * Output Markdown report
	 */
	async outputMarkdownReport() {
		const outputFile = this.options.outputFile || "validation-report.md"
		const markdown = this.generateMarkdownReport()
		writeFileSync(outputFile, markdown)
		console.log(chalk.green(`✅ Markdown report written to ${outputFile}`))
	}

	/**
	 * Generate Markdown report
	 */
	generateMarkdownReport() {
		const { summary, issues, quality, statistics } = this.results
		const timestamp = new Date().toLocaleString()

		return `# Documentation Validation Report

Generated on: ${timestamp}

## Summary

| Metric | Value |
|--------|-------|
| Total Files | ${summary.totalFiles} |
| Valid Files | ${summary.validFiles} |
| Files with Issues | ${summary.filesWithIssues} |
| Files with Warnings | ${summary.filesWithWarnings} |
| Total Issues | ${summary.totalIssues} |
| Total Warnings | ${summary.totalWarnings} |
| Average Quality Score | ${summary.averageQualityScore.toFixed(2)} |
| Validation Time | ${summary.validationTime}ms |

## Statistics

| Metric | Value |
|--------|-------|
| Total Words | ${statistics.wordCount.toLocaleString()} |
| Total Links | ${statistics.linkCount} |
| Total Headings | ${statistics.headingCount} |
| Cross References | ${statistics.crossReferences} |
| Orphaned Documents | ${statistics.orphanedDocuments} |

## Top Issues

${Object.entries(issues.byType)
	.sort(([, a], [, b]) => b - a)
	.slice(0, 10)
	.map(([rule, count]) => `- **${rule}**: ${count}`)
	.join("\n")}

## Recommendations

${quality.recommendations
	.map(
		(rec) =>
			`### [${rec.priority.toUpperCase()}] ${rec.title}\n\n**Issue:** ${rec.description}\n\n**Action:** ${rec.action}`,
	)
	.join("\n\n")}

## Files Needing Attention

${this.results.files
	.filter((f) => f.issues.length > 0 || f.warnings.length > 5)
	.slice(0, 20)
	.map(
		(file) => `- **${file.status}**: ${file.path} (${file.issues.length} issues, ${file.warnings.length} warnings)`,
	)
	.join("\n")}
`
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2)
	const options = {}

	// Parse command line arguments
	for (let i = 0; i < args.length; i++) {
		const arg = args[i]

		switch (arg) {
			case "--format":
			case "-f":
				options.outputFormat = args[++i] || "console"
				break
			case "--output":
			case "-o":
				options.outputFile = args[++i]
				break
			case "--help":
			case "-h":
				console.log(`
Usage: node validation-report.js [options]

Options:
  -f, --format <format>    Output format: console, json, html, markdown (default: console)
  -o, --output <file>      Output file path
  -h, --help               Show this help message

Examples:
  node validation-report.js
  node validation-report.js --format json --output report.json
  node validation-report.js --format html --output report.html
        `)
				process.exit(0)
				break
		}
	}

	try {
		const generator = new ValidationReportGenerator(options)
		const results = await generator.generateReport()

		// Exit with error code if there are critical issues
		if (results.summary.totalIssues > 0) {
			process.exit(1)
		}
	} catch (error) {
		console.error(chalk.red(`Error generating report: ${error.message}`))
		process.exit(1)
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main()
}

export default ValidationReportGenerator
