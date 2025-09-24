#!/usr/bin/env node

/**
 * Link Management System
 *
 * Comprehensive link validation and management for KiloCode documentation including:
 * - Internal link validation
 * - External link checking
 * - Broken reference detection
 * - Link consistency analysis
 * - Link health scoring
 * - Cross-reference validation
 */

import { readFileSync, existsSync, statSync } from "fs"
import { join, relative, dirname, resolve, extname, basename } from "path"
import { fileURLToPath } from "url"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkFrontmatter from "remark-frontmatter"
import { visit } from "unist-util-visit"
import { glob } from "glob"
import fetch from "node-fetch"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "../..")

/**
 * LinkManager Class
 *
 * Provides comprehensive link management including:
 * - Internal link validation and resolution
 * - External link health checking
 * - Broken reference detection
 * - Link consistency analysis
 * - Cross-reference validation
 * - Link health scoring and reporting
 */
class LinkManager {
	constructor(options = {}) {
		this.options = {
			validateExternalLinks: true,
			validateInternalLinks: true,
			checkBrokenReferences: true,
			analyzeConsistency: true,
			timeout: 5000,
			retries: 2,
			concurrent: 10,
			cache: new Map(),
			ignorePatterns: ["node_modules/", ".git/", "dist/", "build/", "coverage/", ".next/", ".turbo/"],
			...options,
		}

		this.linkCache = new Map()
		this.brokenLinks = new Map()
		this.validLinks = new Map()
		this.statistics = {
			totalLinks: 0,
			internalLinks: 0,
			externalLinks: 0,
			brokenLinks: 0,
			validLinks: 0,
			redirectedLinks: 0,
			timeouts: 0,
			errors: 0,
		}
	}

	/**
	 * Validate all links in a document
	 */
	async validateDocumentLinks(filePath) {
		try {
			const content = readFileSync(filePath, "utf8")
			const relativePath = relative(projectRoot, filePath)

			// Parse the document
			const processor = unified().use(remarkParse).use(remarkFrontmatter)

			const tree = processor.parse(content)

			// Extract links
			const links = this.extractLinks(tree, filePath)

			// Validate each link
			const validationResults = await Promise.all(links.map((link) => this.validateLink(link, filePath)))

			// Analyze link consistency
			const consistencyAnalysis = this.analyzeLinkConsistency(links, filePath)

			// Calculate link health score
			const healthScore = this.calculateLinkHealthScore(validationResults)

			return {
				filePath: relativePath,
				absolutePath: filePath,
				links,
				validationResults,
				consistencyAnalysis,
				healthScore,
				statistics: this.calculateStatistics(validationResults),
			}
		} catch (error) {
			console.error(`Error validating links in ${filePath}: ${error.message}`)
			return {
				filePath: relative(projectRoot, filePath),
				absolutePath: filePath,
				error: error.message,
				links: [],
				validationResults: [],
				healthScore: 0,
			}
		}
	}

	/**
	 * Extract all links from a document
	 */
	extractLinks(tree, filePath) {
		const links = []

		visit(tree, "link", (node) => {
			const link = {
				url: node.url,
				text: this.getNodeText(node),
				title: node.title || null,
				line: node.position?.start?.line || 0,
				column: node.position?.start?.column || 0,
				isInternal: this.isInternalLink(node.url),
				isAnchor: node.url.startsWith("#"),
				isEmail: node.url.startsWith("mailto:"),
				isExternal:
					!this.isInternalLink(node.url) && !node.url.startsWith("#") && !node.url.startsWith("mailto:"),
				resolvedPath: null,
				anchor: null,
			}

			// Resolve internal links
			if (link.isInternal && !link.isAnchor) {
				link.resolvedPath = this.resolveInternalLink(node.url, filePath)
				link.anchor = this.extractAnchor(node.url)
			}

			links.push(link)
		})

		return links
	}

	/**
	 * Validate a single link
	 */
	async validateLink(link, filePath) {
		const cacheKey = `${link.url}:${filePath}`

		// Check cache first
		if (this.linkCache.has(cacheKey)) {
			return this.linkCache.get(cacheKey)
		}

		const result = {
			link,
			status: "unknown",
			valid: false,
			error: null,
			responseTime: 0,
			redirected: false,
			finalUrl: link.url,
			suggestions: [],
		}

		try {
			if (link.isInternal) {
				result.status = await this.validateInternalLink(link, filePath)
				result.valid = result.status === "valid"
			} else if (link.isExternal) {
				result.status = await this.validateExternalLink(link)
				result.valid = result.status === "valid"
			} else if (link.isAnchor) {
				result.status = await this.validateAnchorLink(link, filePath)
				result.valid = result.status === "valid"
			} else if (link.isEmail) {
				result.status = this.validateEmailLink(link)
				result.valid = result.status === "valid"
			}

			// Generate suggestions for broken links
			if (!result.valid) {
				result.suggestions = this.generateLinkSuggestions(link, result.status)
			}
		} catch (error) {
			result.status = "error"
			result.error = error.message
			result.valid = false
		}

		// Cache the result
		this.linkCache.set(cacheKey, result)

		return result
	}

	/**
	 * Validate internal link
	 */
	async validateInternalLink(link, filePath) {
		try {
			if (link.isAnchor) {
				return await this.validateAnchorLink(link, filePath)
			}

			const resolvedPath = link.resolvedPath

			if (!resolvedPath) {
				return "unresolvable"
			}

			// Check if file exists
			if (!existsSync(resolvedPath)) {
				return "missing-file"
			}

			// Check if it's a directory (should have index file)
			if (statSync(resolvedPath).isDirectory()) {
				const indexPath = join(resolvedPath, "index.md")
				if (existsSync(indexPath)) {
					return "valid"
				} else {
					return "missing-index"
				}
			}

			// Check if anchor exists in the target file
			if (link.anchor) {
				const anchorExists = await this.checkAnchorExists(resolvedPath, link.anchor)
				if (!anchorExists) {
					return "missing-anchor"
				}
			}

			return "valid"
		} catch (error) {
			return "error"
		}
	}

	/**
	 * Validate external link
	 */
	async validateExternalLink(link) {
		try {
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), this.options.timeout)

			const startTime = Date.now()

			const response = await fetch(link.url, {
				method: "HEAD",
				signal: controller.signal,
				headers: {
					"User-Agent": "KiloCode-Documentation-Validator/1.0",
				},
				redirect: "follow",
			})

			clearTimeout(timeoutId)

			const responseTime = Date.now() - startTime

			if (response.ok) {
				return "valid"
			} else if (response.status >= 400 && response.status < 500) {
				return "client-error"
			} else if (response.status >= 500) {
				return "server-error"
			} else {
				return "unknown-status"
			}
		} catch (error) {
			if (error.name === "AbortError") {
				return "timeout"
			} else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
				return "network-error"
			} else {
				return "error"
			}
		}
	}

	/**
	 * Validate anchor link
	 */
	async validateAnchorLink(link, filePath) {
		try {
			const anchor = link.anchor || link.url.substring(1)
			const targetFile = link.isInternal ? link.resolvedPath : filePath

			if (!targetFile) {
				return "unresolvable"
			}

			const anchorExists = await this.checkAnchorExists(targetFile, anchor)
			return anchorExists ? "valid" : "missing-anchor"
		} catch (error) {
			return "error"
		}
	}

	/**
	 * Validate email link
	 */
	validateEmailLink(link) {
		const emailRegex = /^mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
		return emailRegex.test(link.url) ? "valid" : "invalid-email"
	}

	/**
	 * Check if anchor exists in a file
	 */
	async checkAnchorExists(filePath, anchor) {
		try {
			const content = readFileSync(filePath, "utf8")
			const processor = unified().use(remarkParse).use(remarkFrontmatter)

			const tree = processor.parse(content)

			let anchorExists = false

			visit(tree, "heading", (node) => {
				if (anchorExists) return

				const headingText = this.getNodeText(node)
				const generatedAnchor = this.generateAnchor(headingText)

				if (generatedAnchor === anchor || headingText.toLowerCase().includes(anchor.toLowerCase())) {
					anchorExists = true
				}
			})

			return anchorExists
		} catch (error) {
			return false
		}
	}

	/**
	 * Analyze link consistency
	 */
	analyzeLinkConsistency(links, filePath) {
		const analysis = {
			duplicateLinks: [],
			inconsistentText: [],
			orphanedLinks: [],
			circularReferences: [],
			issues: [],
			suggestions: [],
		}

		// Check for duplicate links
		const linkCounts = new Map()
		links.forEach((link) => {
			const key = link.url.toLowerCase()
			const count = linkCounts.get(key) || 0
			linkCounts.set(key, count + 1)

			if (count > 0) {
				analysis.duplicateLinks.push({
					url: link.url,
					count: count + 1,
					instances: links.filter((l) => l.url.toLowerCase() === key),
				})
			}
		})

		// Check for inconsistent link text
		const urlTextMap = new Map()
		links.forEach((link) => {
			const key = link.url.toLowerCase()
			if (!urlTextMap.has(key)) {
				urlTextMap.set(key, [])
			}
			urlTextMap.get(key).push(link.text)
		})

		urlTextMap.forEach((texts, url) => {
			if (texts.length > 1) {
				const uniqueTexts = [...new Set(texts)]
				if (uniqueTexts.length > 1) {
					analysis.inconsistentText.push({
						url,
						texts: uniqueTexts,
					})
				}
			}
		})

		// Check for orphaned links (links that don't lead anywhere useful)
		const orphanedLinks = links.filter((link) => {
			if (link.isExternal) return false
			if (link.isEmail) return false

			// Check if internal link points to a meaningful destination
			const resolvedPath = link.resolvedPath
			if (!resolvedPath || !existsSync(resolvedPath)) {
				return true
			}

			// Check if it's a dead-end file (no outgoing links)
			return this.isDeadEndFile(resolvedPath)
		})

		analysis.orphanedLinks = orphanedLinks

		// Generate suggestions
		if (analysis.duplicateLinks.length > 0) {
			analysis.suggestions.push({
				type: "duplicates",
				message: `${analysis.duplicateLinks.length} duplicate links found`,
				suggestion: "Consider consolidating duplicate links or using references",
			})
		}

		if (analysis.inconsistentText.length > 0) {
			analysis.suggestions.push({
				type: "consistency",
				message: `${analysis.inconsistentText.length} links with inconsistent text`,
				suggestion: "Use consistent link text for the same URLs",
			})
		}

		if (analysis.orphanedLinks.length > 0) {
			analysis.suggestions.push({
				type: "orphaned",
				message: `${analysis.orphanedLinks.length} potentially orphaned links`,
				suggestion: "Review orphaned links and add more context or remove them",
			})
		}

		return analysis
	}

	/**
	 * Calculate link health score
	 */
	calculateLinkHealthScore(validationResults) {
		if (validationResults.length === 0) {
			return 100
		}

		let score = 100

		validationResults.forEach((result) => {
			if (!result.valid) {
				switch (result.status) {
					case "missing-file":
					case "missing-anchor":
					case "client-error":
						score -= 20
						break
					case "server-error":
					case "network-error":
						score -= 10
						break
					case "timeout":
					case "error":
						score -= 5
						break
					default:
						score -= 15
				}
			}
		})

		return Math.max(0, score)
	}

	/**
	 * Calculate statistics
	 */
	calculateStatistics(validationResults) {
		const stats = {
			total: validationResults.length,
			valid: 0,
			broken: 0,
			internal: 0,
			external: 0,
			anchors: 0,
			emails: 0,
			byStatus: {},
		}

		validationResults.forEach((result) => {
			const link = result.link

			if (result.valid) {
				stats.valid++
			} else {
				stats.broken++
			}

			if (link.isInternal) stats.internal++
			if (link.isExternal) stats.external++
			if (link.isAnchor) stats.anchors++
			if (link.isEmail) stats.emails++

			stats.byStatus[result.status] = (stats.byStatus[result.status] || 0) + 1
		})

		return stats
	}

	/**
	 * Generate link suggestions
	 */
	generateLinkSuggestions(link, status) {
		const suggestions = []

		switch (status) {
			case "missing-file":
				suggestions.push({
					type: "file",
					message: "File not found",
					suggestion: "Check the file path and ensure the file exists",
				})
				break

			case "missing-anchor":
				suggestions.push({
					type: "anchor",
					message: "Anchor not found",
					suggestion: "Check if the heading exists in the target file",
				})
				break

			case "client-error":
				suggestions.push({
					type: "external",
					message: "External link returned error",
					suggestion: "Check if the URL is correct and accessible",
				})
				break

			case "server-error":
				suggestions.push({
					type: "external",
					message: "Server error",
					suggestion: "The external server may be temporarily unavailable",
				})
				break

			case "timeout":
				suggestions.push({
					type: "external",
					message: "Request timeout",
					suggestion: "The external link may be slow or unavailable",
				})
				break

			case "network-error":
				suggestions.push({
					type: "external",
					message: "Network error",
					suggestion: "Check your internet connection and the URL",
				})
				break
		}

		return suggestions
	}

	/**
	 * Helper methods
	 */
	isInternalLink(url) {
		return !url.startsWith("http") && !url.startsWith("mailto:") && !url.startsWith("tel:")
	}

	resolveInternalLink(url, currentFilePath) {
		try {
			const currentDir = dirname(currentFilePath)
			const resolved = resolve(projectRoot, currentDir, url)

			// Handle different file extensions
			if (!extname(resolved)) {
				const extensions = [".md", ".mdx", ".html", ".txt"]
				for (const ext of extensions) {
					const pathWithExt = resolved + ext
					if (existsSync(pathWithExt)) {
						return pathWithExt
					}
				}

				// Check if it's a directory with index file
				for (const ext of extensions) {
					const indexPath = join(resolved, "index" + ext)
					if (existsSync(indexPath)) {
						return indexPath
					}
				}
			}

			return resolved
		} catch (error) {
			return null
		}
	}

	extractAnchor(url) {
		const anchorIndex = url.indexOf("#")
		return anchorIndex > -1 ? url.substring(anchorIndex + 1) : null
	}

	generateAnchor(text) {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim()
	}

	getNodeText(node) {
		if (node.value) {
			return node.value
		}

		if (node.children) {
			return node.children.map((child) => this.getNodeText(child)).join("")
		}

		return ""
	}

	isDeadEndFile(filePath) {
		try {
			const content = readFileSync(filePath, "utf8")
			const processor = unified().use(remarkParse).use(remarkFrontmatter)

			const tree = processor.parse(content)

			let hasLinks = false
			visit(tree, "link", () => {
				hasLinks = true
				return false // Stop visiting
			})

			return !hasLinks
		} catch (error) {
			return true
		}
	}

	/**
	 * Get comprehensive link report for all documents
	 */
	async getComprehensiveReport(filePaths) {
		const results = []

		for (const filePath of filePaths) {
			const result = await this.validateDocumentLinks(filePath)
			results.push(result)
		}

		// Calculate overall statistics
		const overallStats = {
			totalFiles: results.length,
			totalLinks: 0,
			validLinks: 0,
			brokenLinks: 0,
			averageHealthScore: 0,
			commonIssues: {},
			recommendations: [],
		}

		results.forEach((result) => {
			if (result.statistics) {
				overallStats.totalLinks += result.statistics.total
				overallStats.validLinks += result.statistics.valid
				overallStats.brokenLinks += result.statistics.broken

				// Track common issues
				Object.entries(result.statistics.byStatus).forEach(([status, count]) => {
					overallStats.commonIssues[status] = (overallStats.commonIssues[status] || 0) + count
				})
			}

			if (result.healthScore) {
				overallStats.averageHealthScore += result.healthScore
			}
		})

		overallStats.averageHealthScore = results.length > 0 ? overallStats.averageHealthScore / results.length : 0

		// Generate recommendations
		if (overallStats.brokenLinks > 0) {
			overallStats.recommendations.push({
				type: "broken-links",
				priority: "high",
				message: `${overallStats.brokenLinks} broken links found`,
				suggestion: "Fix broken links to improve documentation quality",
			})
		}

		const topIssues = Object.entries(overallStats.commonIssues)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)

		if (topIssues.length > 0) {
			overallStats.recommendations.push({
				type: "common-issues",
				priority: "medium",
				message: `Most common issues: ${topIssues.map(([status, count]) => `${status} (${count})`).join(", ")}`,
				suggestion: "Focus on fixing the most frequently occurring link issues",
			})
		}

		return {
			results,
			overallStats,
			timestamp: new Date().toISOString(),
		}
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
			case "--file":
			case "-f":
				options.file = args[++i]
				break
			case "--external":
			case "-e":
				options.validateExternalLinks = args[++i] !== "false"
				break
			case "--timeout":
			case "-t":
				options.timeout = parseInt(args[++i]) || 5000
				break
			case "--help":
			case "-h":
				console.log(`
Usage: node link-manager.js [options]

Options:
  -f, --file <path>        Validate links in specific file
  -e, --external <bool>    Validate external links (default: true)
  -t, --timeout <ms>       Timeout for external requests (default: 5000)
  -h, --help               Show this help message

Examples:
  node link-manager.js --file docs/README.md
  node link-manager.js --file docs/README.md --external false
  node link-manager.js --file docs/README.md --timeout 10000
        `)
				process.exit(0)
				break
		}
	}

	try {
		const linkManager = new LinkManager(options)

		if (options.file) {
			const result = await linkManager.validateDocumentLinks(options.file)
			console.log(JSON.stringify(result, null, 2))
		} else {
			console.log("Please specify a file to validate with --file option")
			process.exit(1)
		}
	} catch (error) {
		console.error(`Error: ${error.message}`)
		process.exit(1)
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main()
}

export default LinkManager
