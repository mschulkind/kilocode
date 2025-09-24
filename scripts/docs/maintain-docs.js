#!/usr/bin/env node

/**
 * Documentation Maintainer
 *
 * Proactive maintenance tool for KiloCode documentation.
 * Automatically fixes common issues and ensures documentation standards.
 */

import { readFileSync, writeFileSync, existsSync, statSync } from "fs"
import { join, relative, dirname, basename } from "path"
import { fileURLToPath } from "url"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import remarkFrontmatter from "remark-frontmatter"
import remarkToc from "remark-toc"
import { glob } from "glob"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "../..")

/**
 * DocumentationMaintainer Class
 *
 * Handles automatic maintenance of documentation files including:
 * - TOC generation and maintenance
 * - Navigation footer management
 * - Research context section management
 * - Auto-fixing common issues
 */
class DocumentationMaintainer {
	constructor(options = {}) {
		this.options = {
			dryRun: false,
			verbose: true,
			includePatterns: ["docs/**/*.md", "!node_modules/**", "!.git/**"],
			excludePatterns: ["**/node_modules/**", "**/.git/**"],
			...options,
		}

		this.processor = unified()
			.use(remarkParse)
			.use(remarkFrontmatter, ["yaml", "toml"])
			.use(remarkToc, {
				heading: "contents?|toc|table[ -]of[ -]contents?",
				maxDepth: 3,
				tight: true,
			})
			.use(remarkStringify, {
				bullet: "-",
				emphasis: "*",
				fence: "`",
				listItemIndent: "one",
				rule: "-",
				ruleRepetition: 3,
				ruleSpaces: false,
				strong: "*",
			})

		this.log("DocumentationMaintainer initialized", { options: this.options })
	}

	/**
	 * Log messages with timestamp
	 */
	log(message, data = null) {
		if (this.options.verbose) {
			const timestamp = new Date().toISOString()
			console.log(`[${timestamp}] ${message}`)
			if (data) {
				console.log(JSON.stringify(data, null, 2))
			}
		}
	}

	/**
	 * Main entry point - maintain all documentation files
	 */
	async maintainAll() {
		this.log("Starting documentation maintenance...")

		const files = await this.findDocumentationFiles()
		this.log(`Found ${files.length} documentation files to process`)

		let processedCount = 0
		let modifiedCount = 0

		for (const file of files) {
			try {
				const wasModified = await this.maintainDocument(file)
				processedCount++
				if (wasModified) {
					modifiedCount++
					this.log(`Modified: ${file}`)
				} else {
					this.log(`No changes needed: ${file}`)
				}
			} catch (error) {
				console.error(`Error processing ${file}:`, error.message)
			}
		}

		this.log(`Maintenance complete. Processed: ${processedCount}, Modified: ${modifiedCount}`)
		return { processedCount, modifiedCount }
	}

	/**
	 * Find all documentation files to process
	 */
	async findDocumentationFiles() {
		const patterns = Array.isArray(this.options.includePatterns)
			? this.options.includePatterns
			: [this.options.includePatterns]

		let files = []
		for (const pattern of patterns) {
			const matches = await glob(pattern, {
				cwd: projectRoot,
				absolute: true,
				ignore: this.options.excludePatterns,
			})
			files = files.concat(matches)
		}

		// Remove duplicates and filter to markdown files
		return [...new Set(files)].filter((file) => file.endsWith(".md") && existsSync(file) && statSync(file).isFile())
	}

	/**
	 * Maintain a single documentation file
	 */
	async maintainDocument(filePath) {
		this.log(`Maintaining document: ${filePath}`)

		const originalContent = readFileSync(filePath, "utf8")
		let content = originalContent

		// Apply maintenance operations
		content = await this.ensureTOC(content, filePath)
		content = await this.ensureNavigationFooter(content, filePath)
		content = await this.ensureResearchContext(content, filePath)
		content = await this.fixListIndentation(content, filePath)
		content = await this.autoFixIssues(content, filePath)

		// Write back if changed
		if (content !== originalContent) {
			if (!this.options.dryRun) {
				writeFileSync(filePath, content, "utf8")
			}
			return true
		}

		return false
	}

	/**
	 * Ensure Table of Contents is present and up-to-date
	 */
	async ensureTOC(content, filePath) {
		const ast = this.processor.parse(content)
		const hasToc = this.hasTOC(ast)

		if (!hasToc && this.shouldHaveTOC(filePath)) {
			this.log(`Adding TOC to ${filePath}`)
			content = await this.addTOC(content, ast)
		}

		return content
	}

	/**
	 * Check if document already has a TOC
	 */
	hasTOC(ast) {
		let hasToc = false
		this.processor.runSync(ast, {
			visit(node) {
				if (
					node.type === "heading" &&
					node.depth === 2 &&
					/contents?|toc|table[ -]of[ -]contents?/i.test(node.children[0]?.value || "")
				) {
					hasToc = true
					return false
				}
			},
		})
		return hasToc
	}

	/**
	 * Determine if a file should have a TOC
	 */
	shouldHaveTOC(filePath) {
		const content = readFileSync(filePath, "utf8")
		const lines = content.split("\n")

		// Count headings to determine if TOC is needed
		const headingCount = lines.filter((line) => /^#{1,6}\s/.test(line)).length
		const lineCount = lines.length

		// Add TOC if document has 3+ headings and is substantial (>50 lines)
		return headingCount >= 3 && lineCount > 50
	}

	/**
	 * Add TOC to content
	 */
	async addTOC(content, ast) {
		try {
			// Generate TOC markdown and insert it
			const tocMarkdown = this.generateTOCMarkdown(ast)

			// Find the best place to insert the TOC (after the first heading)
			const lines = content.split("\n")
			let insertIndex = 1

			for (let i = 1; i < lines.length; i++) {
				if (lines[i].startsWith("#") && lines[i].trim()) {
					insertIndex = i + 1
					break
				}
			}

			// Insert TOC
			lines.splice(insertIndex, 0, "", tocMarkdown, "")
			return lines.join("\n")
		} catch (error) {
			this.log(`Error adding TOC: ${error.message}`)
			return content
		}
	}

	/**
	 * Generate TOC markdown from AST
	 */
	generateTOCMarkdown(ast) {
		const headings = []

		// Extract headings from AST
		this.processor.runSync(ast, {
			visit(node) {
				if (node.type === "heading" && node.depth >= 2 && node.depth <= 3) {
					const text = node.children.map((child) => child.value || "").join("")
					const anchor = text.toLowerCase().replace(/[^a-z0-9]/g, "-")
					headings.push({
						depth: node.depth,
						text: text,
						anchor: anchor,
					})
				}
			},
		})

		if (headings.length === 0) {
			return ""
		}

		// Generate TOC markdown
		let toc = "## Table of Contents\n\n"

		for (const heading of headings) {
			const indent = "  ".repeat(heading.depth - 2)
			toc += `${indent}- [${heading.text}](#${heading.anchor})\n`
		}

		return toc.trim()
	}

	/**
	 * Ensure navigation footer is present
	 */
	async ensureNavigationFooter(content, filePath) {
		const relativePath = relative(projectRoot, filePath)
		const hasFooter = content.includes("**Navigation**") || content.includes("**Links**")
		const hasFooterHeading = content.includes("## Navigation Footer")

		if (!hasFooter && this.shouldHaveNavigationFooter(filePath)) {
			this.log(`Adding navigation footer to ${filePath}`)
			const footer = this.generateNavigationFooter(filePath)
			content += "\n\n" + footer
		} else if (hasFooter && !hasFooterHeading && this.shouldHaveNavigationFooter(filePath)) {
			this.log(`Adding navigation footer heading to ${filePath}`)
			// Add the heading before the existing navigation footer
			content = content.replace(/(\n---\n\n\*\*Navigation\*\*:)/, "\n## Navigation Footer\n\n$1")
		}

		return content
	}

	/**
	 * Determine if a file should have a navigation footer
	 */
	shouldHaveNavigationFooter(filePath) {
		// Add navigation footer to documentation files but not to specific files
		const relativePath = relative(projectRoot, filePath)
		const excludePatterns = ["README.md", "CHANGELOG.md", "LICENSE", "CONTRIBUTING.md", "node_modules/", ".git/"]

		return !excludePatterns.some((pattern) => relativePath.includes(pattern))
	}

	/**
	 * Fix list item indentation issues
	 */
	async fixListIndentation(content, filePath) {
		// Fix 3-space indentation to 1-space for list items
		if (content.includes("   -")) {
			this.log(`Fixing list indentation in ${filePath}`)
			content = content.replace(/^   -/gm, "-")
		}
		return content
	}

	/**
	 * Generate navigation footer
	 */
	generateNavigationFooter(filePath) {
		const relativePath = relative(projectRoot, filePath)
		const pathParts = relativePath.split("/")

		// Generate context-aware navigation
		const breadcrumbs = pathParts.slice(0, -1)
		const currentFile = pathParts[pathParts.length - 1]

		let navigation = "---\n\n**Navigation**: "

		// Add breadcrumb navigation
		if (breadcrumbs.length > 0) {
			const breadcrumbLinks = breadcrumbs.map((part, index) => {
				const path = breadcrumbs.slice(0, index + 1).join("/")
				return `[${part}](../${"../".repeat(breadcrumbs.length - index - 1)}${path}/)`
			})
			navigation += breadcrumbLinks.join(" · ")
			navigation += " · "
		}

		// Add current file
		navigation += `[↑ Table of Contents](#${currentFile
			.replace(".md", "")
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "-")})`

		return navigation
	}

	/**
	 * Ensure Research Context section is present where appropriate
	 */
	async ensureResearchContext(content, filePath) {
		const hasResearchContext = /## Research Context|## Context|## Background/i.test(content)

		if (!hasResearchContext && this.shouldHaveResearchContext(filePath)) {
			this.log(`Adding research context section to ${filePath}`)
			content = this.addResearchContext(content)
		}

		return content
	}

	/**
	 * Determine if a file should have a research context section
	 */
	shouldHaveResearchContext(filePath) {
		const relativePath = relative(projectRoot, filePath)

		// Add research context to planning and analysis documents
		const contextPatterns = ["context/", "plans/", "docs/architecture/", "docs/standards/"]

		return contextPatterns.some((pattern) => relativePath.includes(pattern))
	}

	/**
	 * Add research context section
	 */
	addResearchContext(content) {
		const researchContext = `\n## Research Context\n\n**Purpose:** [Describe the purpose and scope of this document]\n\n**Background:** [Provide relevant background information]\n\n**Research Questions:** [List key questions this document addresses]\n\n**Methodology:** [Describe the approach or methodology used]\n\n**Findings:** [Summarize key findings or conclusions]\n\n---\n`

		// Insert after the first heading
		const lines = content.split("\n")
		let insertIndex = 1

		// Find the end of the first heading
		for (let i = 1; i < lines.length; i++) {
			if (lines[i].startsWith("#") && lines[i].trim()) {
				insertIndex = i + 1
				break
			}
		}

		lines.splice(insertIndex, 0, researchContext)
		return lines.join("\n")
	}

	/**
	 * Auto-fix common issues
	 */
	async autoFixIssues(content, filePath) {
		let fixedContent = content

		// Fix common markdown issues
		fixedContent = this.fixCommonMarkdownIssues(fixedContent)

		// Fix KiloCode-specific issues
		fixedContent = this.fixKiloCodeIssues(fixedContent, filePath)

		return fixedContent
	}

	/**
	 * Fix common markdown issues
	 */
	fixCommonMarkdownIssues(content) {
		// Fix multiple consecutive blank lines
		content = content.replace(/\n{3,}/g, "\n\n")

		// Fix trailing whitespace
		content = content.replace(/[ \t]+$/gm, "")

		// Fix inconsistent list markers
		content = content.replace(/^\s*\*\s+/gm, "- ")

		// Fix heading spacing
		content = content.replace(/(^#{1,6}\s+.+$)\n+([^#\n])/gm, "$1\n\n$2")

		return content
	}

	/**
	 * Fix KiloCode-specific issues
	 */
	fixKiloCodeIssues(content, filePath) {
		const relativePath = relative(projectRoot, filePath)

		// Add fun facts to planning documents if missing
		if (relativePath.includes("context/doc_automation/") && !content.includes("Fun Fact")) {
			const funFacts = [
				"Like mapping a complex terrain, we'll chart each step of our documentation automation journey with precise coordinates and clear landmarks! 🗺️",
				"Just as a lighthouse guides ships through fog, our documentation automation will guide contributors through the complexity of maintaining high-quality docs! 🚢",
				"Think of documentation automation like having a meticulous librarian who never sleeps, constantly organizing and maintaining our knowledge base! 📚",
				"Like a master cartographer creating detailed maps, we're building a comprehensive system to navigate and maintain our documentation landscape! 🗺️",
			]

			const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]

			// Insert fun fact after the first heading
			const lines = content.split("\n")
			let insertIndex = 1

			for (let i = 1; i < lines.length; i++) {
				if (lines[i].startsWith("#") && lines[i].trim()) {
					insertIndex = i + 1
					break
				}
			}

			const funFactLine = `> **Cartography Fun Fact**: ${randomFact}`
			lines.splice(insertIndex, 0, "", funFactLine, "")

			content = lines.join("\n")
		}

		return content
	}
}

/**
 * CLI Interface
 */
async function main() {
	const args = process.argv.slice(2)
	const options = {
		dryRun: args.includes("--dry-run"),
		verbose: true, // Always verbose
		help: args.includes("--help") || args.includes("-h"),
	}

	if (options.help) {
		console.log(`
Documentation Maintainer - Proactive maintenance tool for KiloCode documentation

Usage: node maintain-docs.js [options]

Options:
  --dry-run    Show what would be changed without making changes
  --help       Show this help message

Examples:
  node maintain-docs.js                    # Run maintenance on all files
  node maintain-docs.js --dry-run          # Preview changes without applying
`)
		return
	}

	try {
		const maintainer = new DocumentationMaintainer(options)
		const result = await maintainer.maintainAll()

		console.log(`✅ Documentation maintenance complete!`)
		console.log(`📊 Processed: ${result.processedCount} files`)
		console.log(`🔧 Modified: ${result.modifiedCount} files`)

		if (options.dryRun && result.modifiedCount > 0) {
			console.log(`\n💡 Run without --dry-run to apply these changes`)
		}
	} catch (error) {
		console.error("❌ Error during documentation maintenance:", error.message)
		process.exit(1)
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main()
}

export default DocumentationMaintainer
