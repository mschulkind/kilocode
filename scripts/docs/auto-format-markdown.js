#!/usr/bin/env node

/**
 * Auto-format Markdown Documentation
 *
 * Automatically formats markdown files to fix line length issues and other formatting problems.
 * This script combines Prettier with custom remark plugins to provide comprehensive formatting.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkFrontmatter from "remark-frontmatter"
import remarkToc from "remark-toc"
import remarkStringify from "remark-stringify"
import remarkPresetLintRecommended from "remark-preset-lint-recommended"
import remarkValidateLinks from "remark-validate-links"
import chalk from "chalk"

// Configuration
const CONFIG = {
	maxLineLength: 100,
	tabWidth: 4,
	useTabs: true,
	bullet: "-",
	emphasis: "*",
	fence: "`",
	listItemIndent: "one",
	rule: "-",
	ruleRepetition: 3,
	ruleSpaces: false,
	strong: "*",
	proseWrap: "always", // This is key for line wrapping
}

// Initialize remark processor with formatting plugins
const processor = remark()
	.use(remarkPresetLintRecommended)
	.use(remarkGfm)
	.use(remarkFrontmatter)
	.use(remarkToc)
	.use(remarkValidateLinks, {
		repository: "roo-ai/kilo-code",
		branches: ["main", "master"],
		ignore: ["https://github.com/roo-ai/kilo-code/issues/*", "https://github.com/roo-ai/kilo-code/discussions/*"],
	})
	.use(remarkStringify, {
		...CONFIG,
		// Force line wrapping
		proseWrap: "always",
		// Additional formatting options
		pedantic: false,
		gfm: true,
		commonmark: false,
		// Ensure proper line breaks
		breaks: false,
		// Handle tables properly
		tablePipeAlign: false,
		// Handle lists properly
		bullet: CONFIG.bullet,
		listItemIndent: CONFIG.listItemIndent,
		// Handle emphasis
		emphasis: CONFIG.emphasis,
		strong: CONFIG.strong,
		// Handle code fences
		fence: CONFIG.fence,
		// Handle horizontal rules
		rule: CONFIG.rule,
		ruleRepetition: CONFIG.ruleRepetition,
		ruleSpaces: CONFIG.ruleSpaces,
	})

/**
 * Format a single markdown file
 */
async function formatMarkdownFile(filePath) {
	try {
		console.log(chalk.blue(`Formatting: ${filePath}`))

		// Read the file
		const content = readFileSync(filePath, "utf8")

		// Process with remark
		const result = await processor.process(content)

		// Get the formatted content
		const formattedContent = String(result)

		// Check if content changed
		if (content !== formattedContent) {
			// Write the formatted content back
			writeFileSync(filePath, formattedContent, "utf8")
			console.log(chalk.green(`✓ Formatted: ${filePath}`))
			return true
		} else {
			console.log(chalk.gray(`- No changes needed: ${filePath}`))
			return false
		}
	} catch (error) {
		console.error(chalk.red(`✗ Error formatting ${filePath}:`))
		console.error(chalk.red(error.message))
		return false
	}
}

/**
 * Get all markdown files in a directory recursively
 */
function getMarkdownFiles(dirPath) {
	const files = []

	function traverse(currentPath) {
		const items = readdirSync(currentPath)

		for (const item of items) {
			const fullPath = join(currentPath, item)
			const stat = statSync(fullPath)

			if (stat.isDirectory()) {
				// Skip node_modules and other common directories
				if (!["node_modules", ".git", "dist", "build", "out", ".next", ".turbo"].includes(item)) {
					traverse(fullPath)
				}
			} else if (stat.isFile() && extname(item) === ".md") {
				files.push(fullPath)
			}
		}
	}

	traverse(dirPath)
	return files
}

/**
 * Format all markdown files in a directory
 */
async function formatMarkdownFiles(dirPath) {
	console.log(chalk.cyan(`🔍 Scanning for markdown files in: ${dirPath}`))

	const files = getMarkdownFiles(dirPath)
	console.log(chalk.cyan(`📄 Found ${files.length} markdown files`))

	let formattedCount = 0
	let errorCount = 0

	for (const file of files) {
		const wasFormatted = await formatMarkdownFile(file)
		if (wasFormatted === true) {
			formattedCount++
		} else if (wasFormatted === false && file.includes("Error")) {
			errorCount++
		}
	}

	console.log(chalk.cyan("\n📊 Formatting Summary:"))
	console.log(chalk.green(`✓ Successfully formatted: ${formattedCount} files`))
	if (errorCount > 0) {
		console.log(chalk.red(`✗ Errors: ${errorCount} files`))
	}
	console.log(chalk.gray(`- No changes needed: ${files.length - formattedCount - errorCount} files`))

	return { formattedCount, errorCount, totalFiles: files.length }
}

/**
 * Main function
 */
async function main() {
	const args = process.argv.slice(2)
	const target = args[0] || "docs/"

	console.log(chalk.cyan("🚀 Auto-formatting Markdown Documentation"))
	console.log(chalk.cyan(`📁 Target: ${target}`))
	console.log(chalk.cyan(`📏 Max line length: ${CONFIG.maxLineLength} characters`))
	console.log("")

	try {
		let results

		// Check if target is a file or directory
		const stat = statSync(target)
		if (stat.isFile()) {
			// Single file
			console.log(chalk.cyan(`📄 Formatting single file: ${target}`))
			const wasFormatted = await formatMarkdownFile(target)
			results = {
				formattedCount: wasFormatted ? 1 : 0,
				errorCount: 0,
				totalFiles: 1,
			}
		} else {
			// Directory
			results = await formatMarkdownFiles(target)
		}

		if (results.errorCount > 0) {
			process.exit(1)
		}

		console.log(chalk.green("\n🎉 Formatting completed successfully!"))
	} catch (error) {
		console.error(chalk.red("\n💥 Fatal error:"), error.message)
		process.exit(1)
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main()
}

export { formatMarkdownFile, formatMarkdownFiles, getMarkdownFiles }
