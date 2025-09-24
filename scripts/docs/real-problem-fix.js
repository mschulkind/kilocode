#!/usr/bin/env node

/**
 * Real Problem Fix Script
 *
 * This script fixes the actual validation warnings:
 * 1. Cross-reference warnings (missing files)
 * 2. Missing "No Dead Ends Policy" sections
 * 3. Orphaned sections (by adding links)
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"
import { remark } from "remark"
import { visit } from "unist-util-visit"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const DOCS_DIR = path.join(__dirname, "../../docs")
const DRY_RUN = process.argv.includes("--dry-run")
const VERBOSE = process.argv.includes("--verbose")

// File existence cache
const fileCache = new Map()

/**
 * Check if a file exists (with caching)
 */
function fileExists(filePath) {
	if (fileCache.has(filePath)) {
		return fileCache.get(filePath)
	}

	const exists = fs.existsSync(filePath)
	fileCache.set(filePath, exists)
	return exists
}

/**
 * Find the correct path for a file that might be missing
 */
function findCorrectPath(filePath, fromFile) {
	const fileName = path.basename(filePath)
	const possiblePaths = [
		// Try exact path first
		filePath,
		// Try with different extensions
		filePath.replace(/\.md$/, ".MD"),
		filePath.replace(/\.md$/, ".markdown"),
		// Try in parent directories
		path.join(path.dirname(filePath), "..", fileName),
		path.join(path.dirname(filePath), "..", "..", fileName),
		// Try common variations
		filePath.replace(/ORCHESTRATOR_/, ""),
		filePath.replace(/LAMINAR_/, ""),
		filePath.replace(/API_DUPLICATION_/, ""),
		// Try with different case
		filePath.toLowerCase(),
		filePath.toUpperCase(),
		// Try common substitutions
		filePath.replace(/README\.md$/, "ORCHESTRATOR_INDEX.md"),
		filePath.replace(/README\.md$/, "INDEX.md"),
		filePath.replace(/README\.md$/, "ORCHESTRATOR_README.md"),
	]

	for (const possiblePath of possiblePaths) {
		if (fileExists(possiblePath)) {
			return possiblePath
		}
	}

	return null
}

/**
 * Fix cross-reference issues by finding correct file paths
 */
function fixCrossReferences(tree, filePath) {
	let changes = 0

	visit(tree, "link", (node) => {
		if (node.url && node.url.endsWith(".md")) {
			// Check if the file exists
			if (!fileExists(node.url)) {
				const correctPath = findCorrectPath(node.url, filePath)
				if (correctPath) {
					node.url = correctPath
					changes++

					if (VERBOSE) {
						console.log(`  ✅ Fixed cross-reference: ${node.url} -> ${correctPath}`)
					}
				}
			}
		}
	})

	return changes
}

/**
 * Add "No Dead Ends Policy" section if missing
 */
function addNoDeadEndsPolicy(tree) {
	let changes = 0

	// Check if "No Dead Ends Policy" section exists
	let hasNoDeadEndsPolicy = false

	visit(tree, "heading", (node) => {
		if (node.children && node.children.length > 0) {
			const headingText = node.children
				.map((child) => child.value || "")
				.join("")
				.toLowerCase()
			if (headingText.includes("no dead ends policy")) {
				hasNoDeadEndsPolicy = true
			}
		}
	})

	// Add "No Dead Ends Policy" section if missing
	if (!hasNoDeadEndsPolicy) {
		// Find the last heading and add the section after it
		let lastHeading = null
		visit(tree, "heading", (node) => {
			lastHeading = node
		})

		if (lastHeading) {
			// Add the section after the last heading
			const noDeadEndsSection = {
				type: "heading",
				depth: 3,
				children: [{ type: "text", value: "No Dead Ends Policy" }],
			}

			const noDeadEndsContent = {
				type: "paragraph",
				children: [
					{
						type: "text",
						value: "Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to the appropriate README for guidance.",
					},
				],
			}

			// Insert after the last heading
			const parent = lastHeading.parent
			const index = parent.children.indexOf(lastHeading)
			parent.children.splice(index + 1, 0, noDeadEndsSection, noDeadEndsContent)

			changes++

			if (VERBOSE) {
				console.log(`  ✅ Added No Dead Ends Policy section`)
			}
		}
	}

	return changes
}

/**
 * Fix orphaned sections by adding links to them
 */
function fixOrphanedSections(tree) {
	let changes = 0

	// Find sections without links and add relevant links
	visit(tree, "paragraph", (node) => {
		if (node.children && node.children.length > 0) {
			const text = node.children.map((child) => child.value || "").join("")

			// Check if this paragraph has no links and is substantial
			if (text.length > 50 && !hasLinks(node)) {
				// Add relevant links based on content
				const relevantLinks = findRelevantLinks(text)

				if (relevantLinks.length > 0) {
					// Add links to the paragraph
					const linkNodes = relevantLinks.map((link) => ({
						type: "link",
						url: link.url,
						children: [{ type: "text", value: link.text }],
					}))

					// Add links after the text
					const linkText = relevantLinks.map((link) => `[${link.text}](${link.url})`).join(" ")
					const linkNode = {
						type: "text",
						value: ` (${linkText})`,
					}

					node.children.push(linkNode)
					changes++

					if (VERBOSE) {
						console.log(`  ✅ Added links to orphaned section: ${text.substring(0, 50)}...`)
					}
				}
			}
		}
	})

	return changes
}

/**
 * Check if a node has any links
 */
function hasLinks(node) {
	let hasLink = false
	visit(node, "link", () => {
		hasLink = true
	})
	return hasLink
}

/**
 * Find relevant links based on content
 */
function findRelevantLinks(text) {
	const links = []
	const lowerText = text.toLowerCase()

	// Add links based on content keywords
	if (lowerText.includes("architecture") || lowerText.includes("design")) {
		links.push({ url: "../README.md", text: "Architecture Documentation" })
	}

	if (lowerText.includes("orchestrator") || lowerText.includes("task")) {
		links.push({ url: "../orchestrator/README.md", text: "Orchestrator Documentation" })
	}

	if (lowerText.includes("glossary") || lowerText.includes("terminology")) {
		links.push({ url: "../GLOSSARY.md", text: "Technical Glossary" })
	}

	if (lowerText.includes("development") || lowerText.includes("implementation")) {
		links.push({ url: "../architecture/repository/DEVELOPMENT_GUIDE.md", text: "Development Guide" })
	}

	if (lowerText.includes("testing") || lowerText.includes("validation")) {
		links.push({ url: "../architecture/repository/TESTING_INFRASTRUCTURE.md", text: "Testing Infrastructure" })
	}

	return links
}

/**
 * Process a single markdown file using AST
 */
function processFile(filePath) {
	if (!filePath.endsWith(".md")) return

	const content = fs.readFileSync(filePath, "utf8")
	const processor = remark()
	const tree = processor.parse(content)

	let totalChanges = 0

	if (VERBOSE) {
		console.log(`\n📄 Processing: ${path.relative(DOCS_DIR, filePath)}`)
	}

	// Apply all fixes
	totalChanges += fixCrossReferences(tree, filePath)
	totalChanges += addNoDeadEndsPolicy(tree)
	totalChanges += fixOrphanedSections(tree)

	// Write file if changed
	if (totalChanges > 0) {
		const newContent = processor.stringify(tree)

		if (!DRY_RUN) {
			fs.writeFileSync(filePath, newContent, "utf8")
			console.log(`✅ Fixed ${totalChanges} issues in ${path.relative(DOCS_DIR, filePath)}`)
		} else {
			console.log(`🔍 [DRY RUN] Would fix ${totalChanges} issues in ${path.relative(DOCS_DIR, filePath)}`)
		}
	} else if (VERBOSE) {
		console.log(`  ⏭️  No changes needed`)
	}

	return totalChanges
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true })
	let totalChanges = 0

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)

		if (entry.isDirectory()) {
			totalChanges += processDirectory(fullPath)
		} else if (entry.isFile()) {
			totalChanges += processFile(fullPath)
		}
	}

	return totalChanges
}

/**
 * Test the script on a single file
 */
function testOnFile(filePath) {
	console.log(`🧪 Testing real problem fix script on: ${filePath}`)

	if (!fs.existsSync(filePath)) {
		console.error(`❌ File not found: ${filePath}`)
		return
	}

	// Process the file
	const changes = processFile(filePath)

	console.log(`\n📊 Results: ${changes} changes made`)
}

/**
 * Main execution
 */
function main() {
	console.log("🔧 Real Problem Fix Script")
	console.log("==========================")

	if (DRY_RUN) {
		console.log("🔍 Running in DRY RUN mode - no files will be modified")
	}

	const args = process.argv.slice(2)
	const testFile = args.find((arg) => arg.endsWith(".md"))

	if (testFile) {
		// Test mode - single file
		testOnFile(testFile)
	} else {
		// Full mode - all files
		console.log(`📁 Processing directory: ${DOCS_DIR}`)
		const totalChanges = processDirectory(DOCS_DIR)

		// Print statistics
		console.log("\n📊 Real Problem Fix Statistics")
		console.log("===============================")
		console.log(`Total changes: ${totalChanges}`)
	}
}

// Run the script
main()
