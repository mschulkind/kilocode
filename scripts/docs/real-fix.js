#!/usr/bin/env node

/**
 * Real Documentation Fix Script
 *
 * This script fixes the actual validation warnings that are showing up:
 * 1. Undefined references (malformed links)
 * 2. Missing file references
 * 3. Cross-reference issues
 * 4. Document structure issues
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const DOCS_DIR = path.join(__dirname, "../../docs")
const DRY_RUN = process.argv.includes("--dry-run")
const VERBOSE = process.argv.includes("--verbose")

// Real fix patterns based on actual warnings
const REAL_FIXES = [
	// 1. Fix malformed links (undefined references)
	{
		name: "Fix malformed links - add missing brackets",
		pattern: /\[([^\]]+)\]\(([^)]+\)/g,
		replacement: (match, text, link) => {
			// Fix malformed links like "[text]link)" -> "[text](link)"
			if (link.endsWith(")") && !link.includes("(")) {
				return `[${text}](${link}`
			}
			return match
		},
		description: "Fix malformed links with missing opening parenthesis",
	},

	// 2. Fix specific malformed links I saw in the warnings
	{
		name: "Fix specific malformed links",
		pattern: /\[([^\]]+)\]\(([^)]+\)/g,
		replacement: (match, text, link) => {
			// Fix patterns like "[Root Cause Analysis of Duplicate API Requests]race-condition/ROOT_CAUSE_ANALYSIS.md)"
			if (link.includes("race-condition/") && link.endsWith(")")) {
				const cleanLink = link.replace(/\)$/, "")
				return `[${text}](${cleanLink})`
			}
			return match
		},
		description: "Fix specific malformed race-condition links",
	},

	// 3. Fix missing file references
	{
		name: "Fix missing file references",
		pattern: /\[([^\]]+)\]\(([^)]+\.md)\)/g,
		replacement: (match, text, filePath) => {
			// Fix common missing file patterns
			if (filePath === "../../README.md") {
				return `[${text}](../README.md)`
			}
			if (filePath === "../GLOSSARY.md" && !fs.existsSync(path.join(DOCS_DIR, filePath))) {
				return `[${text}](../GLOSSARY.md)`
			}
			return match
		},
		description: "Fix missing file references",
	},

	// 4. Fix cross-reference issues
	{
		name: "Fix GLOSSARY.md cross-references",
		pattern: /\.\.\/GLOSSARY\.md/g,
		replacement: "../GLOSSARY.md",
		description: "Ensure consistent GLOSSARY.md paths",
	},

	{
		name: "Fix architecture repository cross-references",
		pattern: /\.\.\/architecture\/repository\/DEVELOPMENT_GUIDE\.md/g,
		replacement: "../architecture/repository/DEVELOPMENT_GUIDE.md",
		description: "Fix architecture repository cross-references",
	},

	{
		name: "Fix architecture repository testing cross-references",
		pattern: /\.\.\/architecture\/repository\/TESTING_INFRASTRUCTURE\.md/g,
		replacement: "../architecture/repository/TESTING_INFRASTRUCTURE.md",
		description: "Fix architecture repository testing cross-references",
	},

	{
		name: "Fix orchestrator README cross-references",
		pattern: /\.\.\/orchestrator\/README\.md/g,
		replacement: "../orchestrator/README.md",
		description: "Fix orchestrator README cross-references",
	},

	{
		name: "Fix orchestrator error handling cross-references",
		pattern: /\.\.\/orchestrator\/ORCHESTRATOR_ERROR_HANDLING\.md/g,
		replacement: "../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md",
		description: "Fix orchestrator error handling cross-references",
	},
]

// Statistics tracking
let stats = {
	filesProcessed: 0,
	filesChanged: 0,
	totalChanges: 0,
	changesByType: {},
}

/**
 * Process a single markdown file
 */
function processFile(filePath) {
	if (!filePath.endsWith(".md")) return

	stats.filesProcessed++
	let content = fs.readFileSync(filePath, "utf8")
	let originalContent = content
	let fileChanges = 0

	if (VERBOSE) {
		console.log(`\n📄 Processing: ${path.relative(DOCS_DIR, filePath)}`)
	}

	// Apply all fixes
	for (const fix of REAL_FIXES) {
		const beforeLength = content.length

		if (typeof fix.replacement === "function") {
			content = content.replace(fix.pattern, fix.replacement)
		} else {
			content = content.replace(fix.pattern, fix.replacement)
		}

		const changes = content.length !== beforeLength
		if (changes) {
			fileChanges++
			stats.totalChanges++
			stats.changesByType[fix.name] = (stats.changesByType[fix.name] || 0) + 1

			if (VERBOSE) {
				console.log(`  ✅ ${fix.name}`)
			}
		}
	}

	// Write file if changed
	if (content !== originalContent) {
		stats.filesChanged++

		if (!DRY_RUN) {
			fs.writeFileSync(filePath, content, "utf8")
			console.log(`✅ Fixed ${fileChanges} issues in ${path.relative(DOCS_DIR, filePath)}`)
		} else {
			console.log(`🔍 [DRY RUN] Would fix ${fileChanges} issues in ${path.relative(DOCS_DIR, filePath)}`)
		}
	} else if (VERBOSE) {
		console.log(`  ⏭️  No changes needed`)
	}
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)

		if (entry.isDirectory()) {
			processDirectory(fullPath)
		} else if (entry.isFile()) {
			processFile(fullPath)
		}
	}
}

/**
 * Test the script on a single file
 */
function testOnFile(filePath) {
	console.log(`🧪 Testing real fix script on: ${filePath}`)

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
	processFile(filePath)

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
	console.log("🔧 Real Documentation Fix Script")
	console.log("=================================")

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
		processDirectory(DOCS_DIR)

		// Print statistics
		console.log("\n📊 Real Fix Statistics")
		console.log("======================")
		console.log(`Files processed: ${stats.filesProcessed}`)
		console.log(`Files changed: ${stats.filesChanged}`)
		console.log(`Total changes: ${stats.totalChanges}`)

		if (Object.keys(stats.changesByType).length > 0) {
			console.log("\nChanges by type:")
			for (const [type, count] of Object.entries(stats.changesByType)) {
				console.log(`  ${type}: ${count}`)
			}
		}
	}
}

// Run the script
main()
