#!/usr/bin/env node

/**
 * Category 1 Cross-Reference Analyzer
 *
 * Analyzes validation warnings specifically targeting Category 1 cross-reference
 * issues to understand patterns and prioritize fixes for 898 violations.
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join, dirname, relative } from "path"
import { remark } from "remark"
import { visit } from "unist-util-visit"

const CONFIG = {
	docsDir: "docs",
	outputDir: "scripts/docs-fixes/output",
	analysisFile: "scripts/docs-fixes/output/category1-analysis.json",
}

class Category1Analyzer {
	constructor() {
		this.analysisData = {
			timestamp: new Date().toISOString(),
			totalFiles: 0,
			violations: [],
			patternsIdentified: {},
			stats: {
				byPattern: {
					GLOSSARY_REF: 0,
					ORCHESTRATOR: 0,
					ARCHITECTURE: 0,
					STANDARDS_CORE: 0,
					DOCUMENTATION_GUIDE: 0,
					OTHER_REF: 0,
				},
				byDirectory: {},
				byTargetFile: {},
				validationWarnings: 0,
			},
		}
	}

	/**
	 * Main analyzer function to process all documentation files
	 */
	async analyze() {
		console.log("🔍 Starting Category 1 cross-reference analysis...")

		try {
			// Get all markdown files
			const allDocFiles = this.getMarkdownFiles(CONFIG.docsDir)

			console.log(`📄 Processing ${allDocFiles.length} documentation files`)

			// Process each file for Category 1 violations
			for (const filePath of allDocFiles) {
				await this.analyzeFileForCategory1(filePath)
				this.analysisData.totalFiles++
			}

			// Generate pattern analysis summaries
			this.generateCategory1Analysis()

			// Write analysis
			await this.writeAnalysis()

			console.log("✅ Category 1 analysis complete")
			console.log(`📊 Found ${this.analysisData.stats.validationWarnings} Category 1 cross-reference violations`)

			return this.analysisData
		} catch (error) {
			console.error("❌ Category 1 analysis failed:", error)
			throw error
		}
	}

	/**
	 * Recursively get all markdown files
	 */
	getMarkdownFiles(dir) {
		const files = []

		const scanDir = (currentDir) => {
			const entries = readdirSync(currentDir, { withFileTypes: true })

			for (const entry of entries) {
				const fullPath = join(currentDir, entry.name)

				if (entry.isDirectory()) {
					scanDir(fullPath)
				} else if (entry.isFile() && entry.name.endsWith(".md")) {
					files.push(fullPath)
				}
			}
		}

		scanDir(dir)
		return files
	}

	/**
	 * Analyze a single markdown file for Category 1 cross-reference issues
	 */
	async analyzeFileForCategory1(filePath) {
		try {
			const content = readFileSync(filePath, "utf8")
			const processor = remark()
			const tree = processor.parse(content)

			// Get directory context for path depth calculation
			const fileDir = dirname(filePath)
			const pathDepth = this.calculateFileDepth(filePath)

			const analysisResults = {
				file: filePath,
				depth: pathDepth,
				directory: fileDir,
				violations: [],
			}

			// Find Category 1 violations (cross-reference path issues)
			visit(tree, "link", (node) => {
				if (node.url && this.isRelativePath(node.url)) {
					const violation = this.checkForCategory1Violation(
						filePath,
						fileDir,
						node.url,
						node.children?.[0]?.value || node.url,
						pathDepth,
					)

					if (violation) {
						analysisResults.violations.push(violation)
						this.analysisData.violations.push({
							file: filePath,
							...violation,
						})
						this.analysisData.stats.validationWarnings++
					}
				}
			})

			this.analysisData.patternsIdentified[filePath] = analysisResults
		} catch (error) {
			console.warn(`⚠️ Could not analyze ${filePath}: ${error.message}`)
		}
	}

	/**
	 * Check if a specific link constitutes a Category 1 violation
	 */
	checkForCategory1Violation(filePath, fileDir, url, linkText, depth) {
		// Skip external URLs
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return null
		}

		// Focus on relative paths that might have depth issues
		if (this.isRelativePath(url)) {
			const targetPath = join(fileDir, url)
			const correctedPath = this.calculateCorrectPath(filePath, url, depth)

			if (correctedPath && correctedPath !== url) {
				const violation = {
					url,
					linkText,
					depth,
					currentPath: url,
					correctedPath: correctedPath,
					targetPath: targetPath,
					pattern: this.categorizeViolationPattern(url),
					severity: this.calculateSeverity(correctedPath, targetPath),
					fixType: this.determineFixType(url, correctedPath),
				}

				return violation
			}
		}

		return null
	}

	/**
	 * Calculate what the path should actually be for Category 1 fixes
	 */
	calculateCorrectPath(filePath, url, depth) {
		// Handle GLOSSARY.md cross-references
		if (url.includes("GLOSSARY.md")) {
			if (depth <= 2) {
				return url.replace("../../GLOSSARY.md", "../GLOSSARY.md")
			} else {
				return url.replace("../GLOSSARY.md", "../../GLOSSARY.md")
			}
		}

		// Handle DOCUMENTATION_GUIDE.md
		if (url.includes("DOCUMENTATION_GUIDE.md")) {
			return this.fixDocumentationGuidePaths(url, depth)
		}

		// Handle orchestrator paths
		if (url.includes("orchestrator/")) {
			return this.fixOrchestratorPaths(url, depth)
		}

		// Handle architecture paths
		if (url.includes("architecture/")) {
			return this.fixArchitecturePaths(url, depth)
		}

		// Handle standards/core paths
		if (url.includes("standards/core/")) {
			return this.fixStandardsCorePaths(url, depth)
		}

		return null
	}

	/**
	 * Calculate file depth from docs/ root
	 */
	calculateFileDepth(filePath) {
		const pathParts = filePath.split("/")
		let docsIndex = pathParts.indexOf("docs")
		if (docsIndex === -1) return 0

		return pathParts.length - docsIndex - 2 // subtract 'docs' and filename
	}

	/**
	 * Check if URL is relative path
	 */
	isRelativePath(url) {
		return url.startsWith("../") || url.startsWith("./") || url.startsWith("./.")
	}

	/**
	 * Categorize violation pattern type
	 */
	categorizeViolationPattern(url) {
		if (url.includes("GLOSSARY.md")) return "GLOSSARY_REF"
		if (url.includes("orchestrator/")) return "ORCHESTRATOR"
		if (url.includes("architecture/")) return "ARCHITECTURE"
		if (url.includes("standards/core/")) return "STANDARDS_CORE"
		if (url.includes("DOCUMENTATION_GUIDE.md")) return "DOCUMENTATION_GUIDE"
		return "OTHER_REF"
	}

	/**
	 * Fix paths for DOCUMENTATION_GUIDE.md
	 */
	fixDocumentationGuidePaths(url, depth) {
		if (depth > 2 && url.includes("../DOCUMENTATION_GUIDE.md")) {
			return url.replace("../DOCUMENTATION_GUIDE.md", "../../DOCUMENTATION_GUIDE.md")
		}
		return url
	}

	/**
	 * Fix paths for orchestrator references
	 */
	fixOrchestratorPaths(url, depth) {
		if (url.includes("../orchestrator/") && depth <= 2) {
			return url.replace(/\.\.\//g, "../../")
		}
		return url
	}

	/**
	 * Fix paths for architecture references
	 */
	fixArchitecturePaths(url, depth) {
		if (url.includes("../architecture/") && depth > 2) {
			return url.replace("../architecture/", "architecture/")
		}
		return url
	}

	/**
	 * Fix paths for standards/core references
	 */
	fixStandardsCorePaths(url, depth) {
		if (url.includes("../standards/core/") && depth <= 3) {
			return url.replace("../standards/core/", "standards/core/")
		}
		return url
	}

	/**
	 * Calculate violation severity
	 */
	calculateSeverity(correctedPath, targetPath) {
		try {
			statSync(targetPath)
			return "HIGH" // Target exists but path is wrong
		} catch {
			return "CRITICAL" // Target file doesn't exist
		}
	}

	/**
	 * Determine the type of fix needed
	 */
	determineFixType(url, correctedPath) {
		if (correctedPath.length > url.length) {
			return "ADD_DEPTH"
		} else if (correctedPath.length < url.length) {
			return "REDUCE_DEPTH"
		} else {
			return "REORDER_DEPTH"
		}
	}

	/**
	 * Generate analysis summaries for Category 1 patterns
	 */
	generateCategory1Analysis() {
		// Analyze by pattern type
		for (const violation of this.analysisData.violations) {
			const pattern = violation.pattern

			if (this.analysisData.stats.byPattern[pattern] !== undefined) {
				this.analysisData.stats.byPattern[pattern]++
			}

			// Directory analysis
			const fileDir = violation.file.split("/").slice(0, -1).join("/")
			if (!this.analysisData.stats.byDirectory[fileDir]) {
				this.analysisData.stats.byDirectory[fileDir] = 0
			}
			this.analysisData.stats.byDirectory[fileDir]++

			// Target file analysis
			const targetFile = violation.targetPath
			if (targetFile) {
				const filename = targetFile.split("/").pop()
				if (!this.analysisData.stats.byTargetFile[filename]) {
					this.analysisData.stats.byTargetFile[filename] = 0
				}
				this.analysisData.stats.byTargetFile[filename]++
			}
		}

		// Generate TOP 10 patterns
		this.analysisData.topPatterns = Object.entries(this.analysisData.stats.byPattern)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10)
			.map(([pattern, count]) => ({ pattern, count }))
	}

	/**
	 * Write analysis results to output file
	 */
	async writeAnalysis() {
		const { mkdirSync, writeFileSync } = await import("fs")
		try {
			mkdirSync(dirname(CONFIG.analysisFile), { recursive: true })
			writeFileSync(CONFIG.analysisFile, JSON.stringify(this.analysisData, null, 2))
			console.log("📄 Category 1 analysis written to:", CONFIG.analysisFile)
		} catch (error) {
			console.error("❌ Failed to write analysis file:", error)
		}
	}
}

// Export for use in main docs-fixer
export default Category1Analyzer

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	const analyzer = new Category1Analyzer()
	analyzer.analyze().catch(console.error)
}
