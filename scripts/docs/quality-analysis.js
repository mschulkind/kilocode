#!/usr/bin/env node

/**
 * Content Quality Analysis System
 *
 * Analyzes documentation content for quality metrics including:
 * - Readability scoring (Flesch Reading Ease, Flesch-Kincaid Grade Level)
 * - Technical term consistency
 * - Cross-reference validation
 * - Orphaned document detection
 * - Content structure analysis
 * - Writing style consistency
 */

import { readFileSync, existsSync } from "fs"
import { join, relative, dirname } from "path"
import { fileURLToPath } from "url"
import { syllable } from "syllable"
import textstat from "textstat"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkFrontmatter from "remark-frontmatter"
import { visit } from "unist-util-visit"
import { glob } from "glob"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "../..")

/**
 * ContentQualityAnalyzer Class
 *
 * Provides comprehensive content quality analysis including:
 * - Readability metrics calculation
 * - Technical term consistency checking
 * - Cross-reference validation
 * - Orphaned document detection
 * - Content structure analysis
 * - Writing style assessment
 */
class ContentQualityAnalyzer {
	constructor(options = {}) {
		this.options = {
			readabilityThreshold: 60, // Flesch Reading Ease threshold
			gradeLevelThreshold: 12, // Flesch-Kincaid Grade Level threshold
			technicalTermsFile: join(__dirname, "technical-terms.json"),
			crossReferenceValidation: true,
			orphanedDocumentDetection: true,
			structureAnalysis: true,
			styleConsistency: true,
			...options,
		}

		this.technicalTerms = this.loadTechnicalTerms()
		this.documentMap = new Map()
		this.crossReferences = new Map()
		this.qualityMetrics = {
			readability: {},
			consistency: {},
			structure: {},
			connectivity: {},
			style: {},
		}
	}

	/**
	 * Analyze content quality for a single document
	 */
	async analyzeDocument(filePath) {
		try {
			const content = readFileSync(filePath, "utf8")
			const relativePath = relative(projectRoot, filePath)

			// Parse the document
			const processor = unified().use(remarkParse).use(remarkFrontmatter)

			const tree = processor.parse(content)

			// Extract text content
			const textContent = this.extractTextContent(tree)

			// Calculate readability metrics
			const readability = this.calculateReadabilityMetrics(textContent)

			// Analyze technical terms
			const consistency = this.analyzeTechnicalConsistency(textContent, relativePath)

			// Analyze structure
			const structure = this.analyzeStructure(tree, content)

			// Analyze connectivity
			const connectivity = this.analyzeConnectivity(tree, relativePath)

			// Analyze writing style
			const style = this.analyzeWritingStyle(textContent)

			const analysis = {
				filePath: relativePath,
				absolutePath: filePath,
				readability,
				consistency,
				structure,
				connectivity,
				style,
				overallScore: this.calculateOverallScore(readability, consistency, structure, connectivity, style),
				recommendations: this.generateRecommendations(readability, consistency, structure, connectivity, style),
			}

			// Store for cross-reference analysis
			this.documentMap.set(relativePath, analysis)

			return analysis
		} catch (error) {
			console.error(`Error analyzing ${filePath}: ${error.message}`)
			return {
				filePath: relative(projectRoot, filePath),
				absolutePath: filePath,
				error: error.message,
				overallScore: 0,
			}
		}
	}

	/**
	 * Calculate readability metrics
	 */
	calculateReadabilityMetrics(text) {
		// Remove markdown syntax for readability calculation
		const cleanText = text
			.replace(/```[\s\S]*?```/g, "") // Remove code blocks
			.replace(/`[^`]+`/g, "") // Remove inline code
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove link syntax, keep text
			.replace(/[#*_~]/g, "") // Remove markdown formatting
			.replace(/\n+/g, " ") // Replace newlines with spaces
			.trim()

		if (cleanText.length < 100) {
			return {
				fleschReadingEase: 0,
				fleschKincaidGrade: 0,
				averageWordsPerSentence: 0,
				averageSyllablesPerWord: 0,
				wordCount: cleanText.split(/\s+/).length,
				sentenceCount: 0,
				score: 0,
				grade: "Insufficient Content",
			}
		}

		// Calculate basic metrics
		const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0)
		const words = cleanText.split(/\s+/).filter((w) => w.length > 0)
		const syllables = words.reduce((sum, word) => sum + syllable(word), 0)

		const sentenceCount = sentences.length
		const wordCount = words.length
		const averageWordsPerSentence = wordCount / sentenceCount
		const averageSyllablesPerWord = syllables / wordCount

		// Calculate Flesch Reading Ease
		const fleschReadingEase = 206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord

		// Calculate Flesch-Kincaid Grade Level
		const fleschKincaidGrade = 0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59

		// Determine readability grade
		let grade
		if (fleschReadingEase >= 90) grade = "Very Easy"
		else if (fleschReadingEase >= 80) grade = "Easy"
		else if (fleschReadingEase >= 70) grade = "Fairly Easy"
		else if (fleschReadingEase >= 60) grade = "Standard"
		else if (fleschReadingEase >= 50) grade = "Fairly Difficult"
		else if (fleschReadingEase >= 30) grade = "Difficult"
		else grade = "Very Difficult"

		return {
			fleschReadingEase: Math.round(fleschReadingEase * 100) / 100,
			fleschKincaidGrade: Math.round(fleschKincaidGrade * 100) / 100,
			averageWordsPerSentence: Math.round(averageWordsPerSentence * 100) / 100,
			averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 100) / 100,
			wordCount,
			sentenceCount,
			score: fleschReadingEase,
			grade,
		}
	}

	/**
	 * Analyze technical term consistency
	 */
	analyzeTechnicalConsistency(text, filePath) {
		const issues = []
		const suggestions = []

		// Check for consistent terminology
		for (const [term, variants] of Object.entries(this.technicalTerms)) {
			const termRegex = new RegExp(`\\b${term}\\b`, "gi")
			const variantRegexes = variants.map((variant) => new RegExp(`\\b${variant}\\b`, "gi"))

			const termMatches = (text.match(termRegex) || []).length
			const variantMatches = variantRegexes.reduce((sum, regex) => sum + (text.match(regex) || []).length, 0)

			if (termMatches > 0 && variantMatches > 0) {
				issues.push({
					type: "terminology",
					severity: "warning",
					term,
					variants: variants.filter((variant) => new RegExp(`\\b${variant}\\b`, "gi").test(text)),
					message: `Inconsistent terminology: "${term}" and its variants used in the same document`,
					suggestion: `Use "${term}" consistently throughout the document`,
				})
			}
		}

		// Check for jargon and complex terms
		const complexTerms = [
			"utilize",
			"utilization",
			"facilitate",
			"facilitation",
			"leverage",
			"synergy",
			"paradigm",
			"methodology",
			"optimization",
			"implementation",
			"infrastructure",
		]

		const foundComplexTerms = complexTerms.filter((term) => new RegExp(`\\b${term}\\b`, "gi").test(text))

		if (foundComplexTerms.length > 5) {
			suggestions.push({
				type: "clarity",
				severity: "info",
				message: "Consider using simpler alternatives to complex terms",
				suggestion: "Replace complex terms with simpler alternatives where possible",
				examples: foundComplexTerms.slice(0, 3),
			})
		}

		return {
			issues,
			suggestions,
			score: Math.max(0, 100 - issues.length * 10 - suggestions.length * 5),
		}
	}

	/**
	 * Analyze document structure
	 */
	analyzeStructure(tree, content) {
		const structure = {
			hasTitle: false,
			hasTableOfContents: false,
			hasIntroduction: false,
			hasConclusion: false,
			headingCount: 0,
			maxHeadingDepth: 0,
			sectionCount: 0,
			listCount: 0,
			codeBlockCount: 0,
			linkCount: 0,
			imageCount: 0,
			issues: [],
			suggestions: [],
		}

		visit(tree, (node, index, parent) => {
			switch (node.type) {
				case "heading":
					structure.headingCount++
					structure.maxHeadingDepth = Math.max(structure.maxHeadingDepth, node.depth)

					if (node.depth === 1) {
						structure.hasTitle = true
					}

					// Check for introduction/conclusion
					const headingText = this.getNodeText(node).toLowerCase()
					if (headingText.includes("introduction") || headingText.includes("overview")) {
						structure.hasIntroduction = true
					}
					if (headingText.includes("conclusion") || headingText.includes("summary")) {
						structure.hasConclusion = true
					}
					break

				case "list":
					structure.listCount++
					break

				case "code":
					structure.codeBlockCount++
					break

				case "link":
					structure.linkCount++
					break

				case "image":
					structure.imageCount++
					break
			}
		})

		// Check for table of contents
		if (content.includes("[TOC]") || content.includes("## Table of Contents") || content.includes("## Contents")) {
			structure.hasTableOfContents = true
		}

		// Calculate section count (H2 headings)
		visit(tree, "heading", (node) => {
			if (node.depth === 2) {
				structure.sectionCount++
			}
		})

		// Generate structure recommendations
		if (!structure.hasTitle) {
			structure.issues.push({
				type: "structure",
				severity: "error",
				message: "Document lacks a main title (H1 heading)",
				suggestion: "Add a descriptive main title at the beginning of the document",
			})
		}

		if (!structure.hasIntroduction && structure.headingCount > 3) {
			structure.suggestions.push({
				type: "structure",
				severity: "info",
				message: "Consider adding an introduction section",
				suggestion: "Add an introduction to provide context for the document",
			})
		}

		if (!structure.hasConclusion && structure.headingCount > 5) {
			structure.suggestions.push({
				type: "structure",
				severity: "info",
				message: "Consider adding a conclusion section",
				suggestion: "Add a conclusion to summarize key points",
			})
		}

		if (structure.headingCount < 3) {
			structure.suggestions.push({
				type: "structure",
				severity: "info",
				message: "Document has few headings",
				suggestion: "Add more headings to improve structure and readability",
			})
		}

		// Calculate structure score
		let score = 100
		score -= structure.issues.length * 20
		score -= structure.suggestions.length * 5
		if (!structure.hasTitle) score -= 30
		if (!structure.hasIntroduction && structure.headingCount > 3) score -= 10
		if (!structure.hasConclusion && structure.headingCount > 5) score -= 10

		structure.score = Math.max(0, score)

		return structure
	}

	/**
	 * Analyze document connectivity
	 */
	analyzeConnectivity(tree, filePath) {
		const connectivity = {
			internalLinks: [],
			externalLinks: [],
			crossReferences: [],
			orphanedSections: [],
			issues: [],
			suggestions: [],
		}

		visit(tree, "link", (node) => {
			const url = node.url
			const linkText = this.getNodeText(node)

			if (url.startsWith("http") || url.startsWith("https")) {
				connectivity.externalLinks.push({ url, text: linkText })
			} else if (url.startsWith("#") || url.includes(".md") || url.includes(".html")) {
				connectivity.internalLinks.push({ url, text: linkText })
				connectivity.crossReferences.push({ target: url, text: linkText })
			}
		})

		// Check for orphaned sections (sections with no outgoing links)
		visit(tree, "heading", (node, index, parent) => {
			if (node.depth === 2) {
				const sectionText = this.getNodeText(node)
				const hasLinks = this.sectionHasLinks(node, parent)

				if (!hasLinks && connectivity.internalLinks.length === 0) {
					connectivity.orphanedSections.push({
						heading: sectionText,
						line: node.position?.start?.line || 0,
					})
				}
			}
		})

		// Generate connectivity recommendations
		if (connectivity.internalLinks.length === 0 && connectivity.externalLinks.length === 0) {
			connectivity.issues.push({
				type: "connectivity",
				severity: "warning",
				message: "Document has no links",
				suggestion: "Add links to related documents or external resources",
			})
		}

		if (connectivity.orphanedSections.length > 2) {
			connectivity.suggestions.push({
				type: "connectivity",
				severity: "info",
				message: "Multiple sections appear to be orphaned",
				suggestion: "Add cross-references to improve document connectivity",
			})
		}

		// Calculate connectivity score
		let score = 100
		score -= connectivity.issues.length * 20
		score -= connectivity.suggestions.length * 5
		score -= connectivity.orphanedSections.length * 10

		connectivity.score = Math.max(0, score)

		return connectivity
	}

	/**
	 * Analyze writing style
	 */
	analyzeWritingStyle(text) {
		const style = {
			passiveVoiceCount: 0,
			longSentenceCount: 0,
			repetitiveWords: [],
			issues: [],
			suggestions: [],
		}

		const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
		const words = text
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w.length > 2)

		// Count long sentences (more than 25 words)
		style.longSentenceCount = sentences.filter((sentence) => sentence.split(/\s+/).length > 25).length

		// Check for passive voice (basic detection)
		const passiveVoicePatterns = [
			/\bis\s+\w+\s+by\b/gi,
			/\bare\s+\w+\s+by\b/gi,
			/\bwas\s+\w+\s+by\b/gi,
			/\bwere\s+\w+\s+by\b/gi,
			/\bwill\s+be\s+\w+\s+by\b/gi,
		]

		style.passiveVoiceCount = passiveVoicePatterns.reduce(
			(count, pattern) => count + (text.match(pattern) || []).length,
			0,
		)

		// Check for repetitive words
		const wordCounts = {}
		words.forEach((word) => {
			wordCounts[word] = (wordCounts[word] || 0) + 1
		})

		style.repetitiveWords = Object.entries(wordCounts)
			.filter(([, count]) => count > 5)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)

		// Generate style recommendations
		if (style.passiveVoiceCount > 3) {
			style.suggestions.push({
				type: "style",
				severity: "info",
				message: "High use of passive voice",
				suggestion: "Consider using active voice for clearer communication",
			})
		}

		if (style.longSentenceCount > sentences.length * 0.3) {
			style.suggestions.push({
				type: "style",
				severity: "info",
				message: "Many long sentences detected",
				suggestion: "Break long sentences into shorter, clearer sentences",
			})
		}

		if (style.repetitiveWords.length > 0) {
			style.suggestions.push({
				type: "style",
				severity: "info",
				message: "Some words are used frequently",
				suggestion: "Consider using synonyms to improve variety",
				examples: style.repetitiveWords.slice(0, 3).map(([word]) => word),
			})
		}

		// Calculate style score
		let score = 100
		score -= style.passiveVoiceCount * 5
		score -= style.longSentenceCount * 3
		score -= style.repetitiveWords.length * 2
		score -= style.suggestions.length * 5

		style.score = Math.max(0, score)

		return style
	}

	/**
	 * Calculate overall quality score
	 */
	calculateOverallScore(readability, consistency, structure, connectivity, style) {
		const weights = {
			readability: 0.25,
			consistency: 0.2,
			structure: 0.25,
			connectivity: 0.15,
			style: 0.15,
		}

		const scores = {
			readability: this.normalizeReadabilityScore(readability.score),
			consistency: consistency.score,
			structure: structure.score,
			connectivity: connectivity.score,
			style: style.score,
		}

		const weightedScore = Object.entries(weights).reduce((sum, [key, weight]) => sum + scores[key] * weight, 0)

		return Math.round(weightedScore * 100) / 100
	}

	/**
	 * Normalize readability score to 0-100 scale
	 */
	normalizeReadabilityScore(fleschScore) {
		// Flesch Reading Ease is 0-100, but we want higher scores for better readability
		return fleschScore
	}

	/**
	 * Generate recommendations based on analysis
	 */
	generateRecommendations(readability, consistency, structure, connectivity, style) {
		const recommendations = []

		// Readability recommendations
		if (readability.fleschReadingEase < this.options.readabilityThreshold) {
			recommendations.push({
				category: "readability",
				priority: "high",
				title: "Improve Readability",
				description: `Flesch Reading Ease score: ${readability.fleschReadingEase} (target: ${this.options.readabilityThreshold}+)`,
				suggestion: "Use shorter sentences and simpler words to improve readability",
			})
		}

		if (readability.fleschKincaidGrade > this.options.gradeLevelThreshold) {
			recommendations.push({
				category: "readability",
				priority: "medium",
				title: "Reduce Complexity",
				description: `Grade level: ${readability.fleschKincaidGrade} (target: ${this.options.gradeLevelThreshold} or below)`,
				suggestion: "Simplify language and sentence structure",
			})
		}

		// Consistency recommendations
		if (consistency.issues.length > 0) {
			recommendations.push({
				category: "consistency",
				priority: "medium",
				title: "Fix Terminology Issues",
				description: `${consistency.issues.length} terminology consistency issues found`,
				suggestion: "Use consistent terminology throughout the document",
			})
		}

		// Structure recommendations
		if (structure.issues.length > 0) {
			recommendations.push({
				category: "structure",
				priority: "high",
				title: "Improve Document Structure",
				description: `${structure.issues.length} structural issues found`,
				suggestion: "Address structural issues to improve document organization",
			})
		}

		// Connectivity recommendations
		if (connectivity.issues.length > 0) {
			recommendations.push({
				category: "connectivity",
				priority: "medium",
				title: "Improve Document Connectivity",
				description: `${connectivity.issues.length} connectivity issues found`,
				suggestion: "Add links and cross-references to improve document connectivity",
			})
		}

		// Style recommendations
		if (style.suggestions.length > 2) {
			recommendations.push({
				category: "style",
				priority: "low",
				title: "Improve Writing Style",
				description: `${style.suggestions.length} style suggestions`,
				suggestion: "Consider the style suggestions to improve clarity and engagement",
			})
		}

		return recommendations
	}

	/**
	 * Helper methods
	 */
	extractTextContent(tree) {
		let text = ""
		visit(tree, (node) => {
			if (node.type === "text" || node.type === "inlineCode") {
				text += node.value + " "
			}
		})
		return text.trim()
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

	sectionHasLinks(heading, parent) {
		let hasLinks = false

		// Check if the section content has links
		visit(parent, "link", () => {
			hasLinks = true
			return false // Stop visiting
		})

		return hasLinks
	}

	loadTechnicalTerms() {
		try {
			if (existsSync(this.options.technicalTermsFile)) {
				const content = readFileSync(this.options.technicalTermsFile, "utf8")
				return JSON.parse(content)
			}
		} catch (error) {
			console.warn(`Could not load technical terms file: ${error.message}`)
		}

		// Default technical terms
		return {
			API: ["api", "Api", "Application Programming Interface"],
			CLI: ["cli", "command-line interface", "command line interface"],
			IDE: ["ide", "Integrated Development Environment"],
			UI: ["ui", "User Interface", "user interface"],
			UX: ["ux", "User Experience", "user experience"],
			GitHub: ["github", "Github", "Git Hub"],
			"Node.js": ["nodejs", "node.js", "NodeJS", "node"],
			TypeScript: ["typescript", "Type Script", "TS"],
			JavaScript: ["javascript", "Java Script", "JS"],
			React: ["react", "React.js", "ReactJS"],
			"VS Code": ["vscode", "VS Code", "Visual Studio Code", "visual studio code"],
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
			case "--threshold":
			case "-t":
				options.readabilityThreshold = parseInt(args[++i]) || 60
				break
			case "--grade":
			case "-g":
				options.gradeLevelThreshold = parseInt(args[++i]) || 12
				break
			case "--help":
			case "-h":
				console.log(`
Usage: node quality-analysis.js [options]

Options:
  -f, --file <path>        Analyze specific file
  -t, --threshold <score>  Flesch Reading Ease threshold (default: 60)
  -g, --grade <level>      Grade level threshold (default: 12)
  -h, --help               Show this help message

Examples:
  node quality-analysis.js --file docs/README.md
  node quality-analysis.js --file docs/README.md --threshold 70 --grade 10
        `)
				process.exit(0)
				break
		}
	}

	try {
		const analyzer = new ContentQualityAnalyzer(options)

		if (options.file) {
			const analysis = await analyzer.analyzeDocument(options.file)
			console.log(JSON.stringify(analysis, null, 2))
		} else {
			console.log("Please specify a file to analyze with --file option")
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

export default ContentQualityAnalyzer
