#!/usr/bin/env node

/**
 * Systematic Documentation Fix Script
 *
 * This script fixes common documentation validation issues systematically:
 * 1. Missing file references (ORCHESTRATOR_README.md -> ORCHESTRATOR_INDEX.md)
 * 2. Path issues (double ../architecture/, wrong relative paths)
 * 3. Link text issues (filename -> descriptive text)
 * 4. List indentation issues
 * 5. Cross-reference path fixes
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

// Fix patterns
const FIXES = [
	// 1. Missing file references
	{
		name: "Fix ORCHESTRATOR_README.md references",
		pattern: /ORCHESTRATOR_README\.md/g,
		replacement: "ORCHESTRATOR_INDEX.md",
		description: "Replace ORCHESTRATOR_README.md with ORCHESTRATOR_INDEX.md",
	},

	// 2. Path fixes
	{
		name: "Fix double ../architecture/ paths",
		pattern: /\.\.\/architecture\/\.\.\/architecture\//g,
		replacement: "../architecture/",
		description: "Remove double ../architecture/ paths",
	},

	{
		name: "Fix ./../architecture/ paths",
		pattern: /\.\/\.\.\/architecture\//g,
		replacement: "../architecture/",
		description: "Fix ./../architecture/ to ../architecture/",
	},

	{
		name: "Fix ../../docs/ paths",
		pattern: /\.\.\/\.\.\/docs\//g,
		replacement: "../",
		description: "Fix ../../docs/ to ../",
	},

	{
		name: "Fix ../docs/orchestrator/ paths",
		pattern: /\.\.\/docs\/orchestrator\//g,
		replacement: "../orchestrator/",
		description: "Fix ../docs/orchestrator/ to ../orchestrator/",
	},

	// 3. Link text improvements
	{
		name: "Fix README.md link text",
		pattern: /\[README\.md\]\(([^)]+README\.md)\)/g,
		replacement: "[Architecture Documentation]($1)",
		description: "Make README.md links descriptive",
	},

	{
		name: "Fix GLOSSARY.md link text",
		pattern: /\[\.\.\/GLOSSARY\.md\]\(\.\.\/GLOSSARY\.md\)/g,
		replacement: "[Technical Glossary](../GLOSSARY.md)",
		description: "Make GLOSSARY.md links descriptive",
	},

	{
		name: "Fix ORCHESTRATOR_INDEX.md link text",
		pattern: /\[ORCHESTRATOR_INDEX\.md\]\(ORCHESTRATOR_INDEX\.md\)/g,
		replacement: "[Orchestrator Master Index](ORCHESTRATOR_INDEX.md)",
		description: "Make ORCHESTRATOR_INDEX.md links descriptive",
	},

	{
		name: "Fix ORCHESTRATOR_ARCHITECTURE.md link text",
		pattern: /\[ORCHESTRATOR_ARCHITECTURE\.md\]\(ORCHESTRATOR_ARCHITECTURE\.md\)/g,
		replacement: "[Orchestrator Architecture](ORCHESTRATOR_ARCHITECTURE.md)",
		description: "Make ORCHESTRATOR_ARCHITECTURE.md links descriptive",
	},

	{
		name: "Fix ORCHESTRATOR_TASK_DELEGATION.md link text",
		pattern: /\[ORCHESTRATOR_TASK_DELEGATION\.md\]\(ORCHESTRATOR_TASK_DELEGATION\.md\)/g,
		replacement: "[Task Delegation Guide](ORCHESTRATOR_TASK_DELEGATION.md)",
		description: "Make ORCHESTRATOR_TASK_DELEGATION.md links descriptive",
	},

	{
		name: "Fix ORCHESTRATOR_ERROR_HANDLING.md link text",
		pattern: /\[ORCHESTRATOR_ERROR_HANDLING\.md\]\(ORCHESTRATOR_ERROR_HANDLING\.md\)/g,
		replacement: "[Error Handling Guide](ORCHESTRATOR_ERROR_HANDLING.md)",
		description: "Make ORCHESTRATOR_ERROR_HANDLING.md links descriptive",
	},

	{
		name: "Fix ORCHESTRATOR_SECURITY_GOVERNANCE.md link text",
		pattern: /\[ORCHESTRATOR_SECURITY_GOVERNANCE\.md\]\(ORCHESTRATOR_SECURITY_GOVERNANCE\.md\)/g,
		replacement: "[Security & Governance](ORCHESTRATOR_SECURITY_GOVERNANCE.md)",
		description: "Make ORCHESTRATOR_SECURITY_GOVERNANCE.md links descriptive",
	},

	{
		name: "Fix ORCHESTRATOR_EXTENSIBILITY.md link text",
		pattern: /\[ORCHESTRATOR_EXTENSIBILITY\.md\]\(ORCHESTRATOR_EXTENSIBILITY\.md\)/g,
		replacement: "[Extensibility Guide](ORCHESTRATOR_EXTENSIBILITY.md)",
		description: "Make ORCHESTRATOR_EXTENSIBILITY.md links descriptive",
	},

	// 4. List indentation fixes
	{
		name: "Fix list indentation (3 spaces to 1)",
		pattern: /^(\s*)-   (\d+\.\s+[^[]+)$/gm,
		replacement: (match, indent, content) => {
			return `${indent}- [${content.trim()}](${content
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")})`
		},
		description: "Fix list indentation and add proper links",
	},

	// 5. Cross-reference path fixes
	{
		name: "Fix GLOSSARY.md cross-references",
		pattern: /\.\.\/GLOSSARY\.md/g,
		replacement: "../GLOSSARY.md",
		description: "Ensure consistent GLOSSARY.md paths",
	},

	{
		name: "Fix architecture README cross-references",
		pattern: /\.\.\/architecture\/README\.md/g,
		replacement: "../architecture/README.md",
		description: "Ensure consistent architecture README paths",
	},

	{
		name: "Fix orchestrator README cross-references",
		pattern: /\.\.\/orchestrator\/README\.md/g,
		replacement: "../orchestrator/README.md",
		description: "Ensure consistent orchestrator README paths",
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
	for (const fix of FIXES) {
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
	console.log(`🧪 Testing script on: ${filePath}`)

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
	console.log("🔧 Systematic Documentation Fix Script")
	console.log("=====================================")

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
		console.log("\n📊 Fix Statistics")
		console.log("==================")
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
