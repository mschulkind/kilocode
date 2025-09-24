#!/usr/bin/env node

/**
 * Simple AST-Based Documentation Fix Script
 *
 * This script uses remark's AST parsing to fix specific documentation issues:
 * 1. Malformed links (missing opening parenthesis)
 * 2. Missing file references
 * 3. Cross-reference issues
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
 * Fix malformed links using AST
 */
function fixMalformedLinks(tree) {
	let changes = 0

	visit(tree, "text", (node, index, parent) => {
		if (parent && parent.type === "paragraph") {
			const text = node.value

			// Look for malformed links like "[text]link)" - missing opening parenthesis
			// Use a simpler approach to avoid regex issues
			if (text.includes("](") && text.includes(")")) {
				// Check for patterns like "[text]link)" where there's no opening parenthesis
				const lines = text.split("\n")
				let modified = false

				for (let i = 0; i < lines.length; i++) {
					const line = lines[i]
					// Look for patterns like "[Root Cause Analysis of Duplicate API Requests]race-condition/ROOT_CAUSE_ANALYSIS.md)"
					if (line.includes("](") && line.includes(")") && !line.includes("](")) {
						// This is a malformed link - fix it
						const fixedLine = line.replace(/\]\(([^)]+)\)/g, "]($1)")
						if (fixedLine !== line) {
							lines[i] = fixedLine
							modified = true
							changes++

							if (VERBOSE) {
								console.log(`  ✅ Fixed malformed link: ${line} -> ${fixedLine}`)
							}
						}
					}
				}

				if (modified) {
					node.value = lines.join("\n")
				}
			}
		}
	})

	return changes
}

/**
 * Fix missing file references using AST
 */
function fixMissingFileReferences(tree, filePath) {
	let changes = 0

	visit(tree, "link", (node) => {
		if (node.url && node.url.endsWith(".md")) {
			// Check if the file exists
			if (!fileExists(node.url)) {
				// Try to find the correct path
				const fileName = path.basename(node.url)
				const possiblePaths = [
					node.url.replace("../../README.md", "../README.md"),
					node.url.replace("../GLOSSARY.md", "../GLOSSARY.md"),
					node.url.replace(
						"../architecture/repository/DEVELOPMENT_GUIDE.md",
						"../architecture/repository/DEVELOPMENT_GUIDE.md",
					),
					node.url.replace(
						"../architecture/repository/TESTING_INFRASTRUCTURE.md",
						"../architecture/repository/TESTING_INFRASTRUCTURE.md",
					),
					node.url.replace("../orchestrator/README.md", "../orchestrator/README.md"),
					node.url.replace(
						"../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md",
						"../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md",
					),
				]

				for (const possiblePath of possiblePaths) {
					if (fileExists(possiblePath)) {
						node.url = possiblePath
						changes++

						if (VERBOSE) {
							console.log(`  ✅ Fixed missing file reference: ${node.url} -> ${possiblePath}`)
						}
						break
					}
				}
			}
		}
	})

	return changes
}

/**
 * Fix cross-reference issues using AST
 */
function fixCrossReferences(tree) {
	let changes = 0

	visit(tree, "link", (node) => {
		if (node.url) {
			// Fix common cross-reference patterns
			const fixes = [
				{ from: "../../README.md", to: "../README.md" },
				{ from: "../GLOSSARY.md", to: "../GLOSSARY.md" },
				{
					from: "../architecture/repository/DEVELOPMENT_GUIDE.md",
					to: "../architecture/repository/DEVELOPMENT_GUIDE.md",
				},
				{
					from: "../architecture/repository/TESTING_INFRASTRUCTURE.md",
					to: "../architecture/repository/TESTING_INFRASTRUCTURE.md",
				},
				{ from: "../orchestrator/README.md", to: "../orchestrator/README.md" },
				{
					from: "../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md",
					to: "../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md",
				},
			]

			for (const fix of fixes) {
				if (node.url === fix.from) {
					node.url = fix.to
					changes++

					if (VERBOSE) {
						console.log(`  ✅ Fixed cross-reference: ${fix.from} -> ${fix.to}`)
					}
				}
			}
		}
	})

	return changes
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
	totalChanges += fixMalformedLinks(tree)
	totalChanges += fixMissingFileReferences(tree, filePath)
	totalChanges += fixCrossReferences(tree)

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
 * Test the script on a single file
 */
function testOnFile(filePath) {
	console.log(`🧪 Testing simple AST fix script on: ${filePath}`)

	if (!fs.existsSync(filePath)) {
		console.error(`❌ File not found: ${filePath}`)
		return
	}

	// Run validation before
	console.log("\n📊 Before fixes:")
	try {
		execSync(`npx remark "${filePath}"`, { stdio: "pipe" })
		console.log("✅ No warnings before fixes")
	} catch (error) {
		const warningCount = (error.stdout || "").split("\n").filter((line) => line.includes("warning")).length
		console.log(`⚠️  ${warningCount} warnings before fixes`)
	}

	// Process the file
	const changes = processFile(filePath)

	// Run validation after
	console.log("\n📊 After fixes:")
	try {
		execSync(`npx remark "${filePath}"`, { stdio: "pipe" })
		console.log("✅ No warnings after fixes")
	} catch (error) {
		const warningCount = (error.stdout || "").split("\n").filter((line) => line.includes("warning")).length
		console.log(`⚠️  ${warningCount} warnings after fixes`)
	}
}

/**
 * Main execution
 */
function main() {
	console.log("🔧 Simple AST-Based Documentation Fix Script")
	console.log("============================================")

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
		console.log("\n📊 Simple AST Fix Statistics")
		console.log("============================")
		console.log(`Total changes: ${totalChanges}`)
	}
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

// Run the script
main()
