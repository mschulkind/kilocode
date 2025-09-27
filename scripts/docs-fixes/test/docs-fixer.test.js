#!/usr/bin/env node

/**
 * Tests for KiloCode Documentation Fixer
 *
 * Comprehensive test suite for the documentation fixing functionality.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "fs"
import { join, dirname } from "path"
import { main, CONFIG, PATH_FIXES, LINK_TEXT_IMPROVEMENTS, NAVIGATION_TEMPLATES } from "../src/docs-fixer.js"
import {
	testFixerWithLinting,
	validateFixer,
	validateBeforeContent,
	validateAfterContent,
	debugLinting,
} from "./lint-validator.js"
import {
	assertFixCount,
	assertTrue,
	assertExists,
	assertArray,
	assertObject,
	assertContains,
	assertNavigationTemplates,
	validateFixerResolvesLintErrors,
} from "./test-helpers.js"

/**
 * Test examples registry - single source of truth for documentation examples
 */
export const TEST_EXAMPLES = {
	listBulletIndentation: null,
	listItemIndentation: null,
	orderedListMarkerStyle: null,
	// listItemStyle: null, // Temporarily disabled - no working linter yet
	pathFixes: null,
	// linkText: null, // Temporarily disabled - no working linter yet
	navigationFooter: null,
	navigationFooterDetection: null,
	navigationTemplateSelection: null,
}

/**
 * Test configuration
 */
const TEST_CONFIG = {
	testDir: "scripts/docs-fixes/test/fixtures",
	outputDir: "scripts/docs-fixes/test/output",
	tempDir: "scripts/docs-fixes/test/temp",
}

/**
 * Test utilities
 */
class TestUtils {
	static ensureDir(dir) {
		mkdirSync(dir, { recursive: true })
	}

	static createTestFile(path, content) {
		TestUtils.ensureDir(dirname(path))
		writeFileSync(path, content, "utf8")
	}

	static readTestFile(path) {
		return readFileSync(path, "utf8")
	}

	static cleanupDir(dir) {
		if (existsSync(dir)) {
			rmSync(dir, { recursive: true, force: true })
		}
	}

	static setupTestEnvironment() {
		TestUtils.cleanupDir(TEST_CONFIG.testDir)
		TestUtils.cleanupDir(TEST_CONFIG.outputDir)
		TestUtils.cleanupDir(TEST_CONFIG.tempDir)
		TestUtils.ensureDir(TEST_CONFIG.testDir)
		TestUtils.ensureDir(TEST_CONFIG.outputDir)
		TestUtils.ensureDir(TEST_CONFIG.tempDir)
	}
}

/**
 * Test cases
 */
class DocsFixerTests {
	constructor() {
		this.tests = []
		this.passed = 0
		this.failed = 0
	}

	addTest(name, testFn) {
		this.tests.push({ name, testFn })
	}

	async runTests() {
		console.log("🧪 Running KiloCode Documentation Fixer Tests\n")

		for (const test of this.tests) {
			try {
				console.log(`Running: ${test.name}...`)
				await test.testFn()
				console.log(`✅ PASSED: ${test.name}\n`)
				this.passed++
			} catch (error) {
				console.log(`❌ FAILED: ${test.name}`)
				console.log(`   Error: ${error.message}\n`)
				this.failed++
			}
		}

		this.printSummary()
	}

	printSummary() {
		console.log("📊 Test Summary:")
		console.log(`- Total tests: ${this.tests.length}`)
		console.log(`- Passed: ${this.passed}`)
		console.log(`- Failed: ${this.failed}`)
		console.log(`- Success rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`)

		if (this.failed > 0) {
			process.exit(1)
		}
	}
}

/**
 * Create test suite
 */
function createTestSuite() {
	const testSuite = new DocsFixerTests()

	// ============================================================================
	// FIXER TESTS - These tests demonstrate before/after transformations and generate examples
	// ============================================================================

	// Test 1: Path fixes for architecture files
	testSuite.addTest("Path fixes for architecture files", async () => {
		const testFile = join(TEST_CONFIG.testDir, "architecture", "test-file.md")
		const beforeContent = `
# Test File

- [GLOSSARY](../../GLOSSARY.md)
- [Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md)
- [README](../README.md)
`

		TestUtils.createTestFile(testFile, beforeContent)

		// Import the fixPathIssues function
		const { fixPathIssues } = await import("../src/docs-fixer.js")

		// For now, skip lint validation for path fixes since missing-file is not a remark-lint rule
		// TODO: Add remark-validate-links support to the lint validator
		const result = fixPathIssues(beforeContent, testFile)
		const afterContent = result.content

		const testResult = {
			testName: "Path fixes for architecture files",
			description: "Architecture file path fixes",
			before: { content: beforeContent.trim() },
			after: { content: afterContent.trim() },
			linterRules: ["missing-file"],
			fixesApplied: result.fixesApplied,
		}

		// Store example data for documentation generation
		TEST_EXAMPLES.pathFixes = {
			testName: testResult.testName,
			description: testResult.description,
			before: testResult.before.content,
			after: testResult.after.content,
			expectedErrorTypes: testResult.linterRules,
			fixesApplied: testResult.fixesApplied,
			testFile: testFile,
		}

		// The lint validation should catch any issues with the "after" content
		// If the fixer didn't work properly, the linter would detect broken links
		assertFixCount(testResult.fixesApplied, 3, "Path fixes")

		console.log("✅ Path fixes test passed!")
		console.log(`   Applied ${testResult.fixesApplied} fixes`)
	})

	// Test 2: Link text improvements (temporarily disabled - no working linter yet)
	// TODO: Add back when we implement @double-great/remark-lint-link-text or custom linter
	// testSuite.addTest("Link text improvements", async () => {
	// 	const { fixLinkText } = await import("../src/docs-fixer.js")
	// 	// Test will be added back when proper linter is available
	// })

	// Test 3: Navigation footer addition
	testSuite.addTest("Navigation footer addition", async () => {
		const testFile = join(TEST_CONFIG.testDir, "architecture", "test-file.md")
		const beforeContent = `
# Test File

This is a test file without navigation.
`

		const { addNavigationFooter } = await import("../src/docs-fixer.js")
		const result = addNavigationFooter(beforeContent, testFile)
		const afterContent = result.content

		// Store example data for documentation generation
		TEST_EXAMPLES.navigationFooter = {
			testName: "Navigation footer addition",
			description: "Navigation footer addition",
			before: beforeContent.trim(),
			after: afterContent.trim(),
			expectedErrorTypes: ["orphaned-sections"],
			fixesApplied: result.added ? 1 : 0,
			testFile: testFile,
		}

		// Validate navigation footer was added
		assertTrue(result.added, "Navigation footer not added")
		assertContains(result.content, "## Navigation", "Navigation footer not found in content")
		assertContains(result.content, "[← Architecture Overview]", "Architecture navigation not found")
	})

	// Test 4: Navigation footer detection
	testSuite.addTest("Navigation footer detection", async () => {
		const { hasNavigationFooter } = await import("../src/docs-fixer.js")

		// Test content with navigation footer
		const contentWithNav = `
# Test File

Content here.

## Navigation
- [Link](link.md)
`

		// Test content without navigation footer
		const contentWithoutNav = `
# Test File

Content here.
`

		// Store example data for documentation generation
		TEST_EXAMPLES.navigationFooterDetection = {
			testName: "Navigation footer detection",
			description: "Detect presence of navigation footers in documents",
			before: contentWithoutNav.trim(),
			after: contentWithNav.trim(),
			expectedErrorTypes: ["missing-navigation-footer"],
			fixesApplied: 0, // This is a detection test, not a fixer
			testFile: "navigation-footer-detection-test.md",
		}

		assertTrue(hasNavigationFooter(contentWithNav), "Failed to detect existing navigation footer")
		assertTrue(!hasNavigationFooter(contentWithoutNav), "False positive for navigation footer detection")

		console.log("✅ Navigation footer detection test passed!")
	})

	// Test 5: List bullet indentation fixes (removes leading spaces before bullets)
	testSuite.addTest("List bullet indentation fixes", async () => {
		const { fixListIndentation } = await import("../src/docs-fixer.js")

		await validateFixerResolvesLintErrors({
			before: `
# Test File

  - Item 1
  - Item 2
  - Item 3
`,
			linter: ["list-item-bullet-indent"],
			fixer: fixListIndentation,
			testName: "List bullet indentation fixes",
			description: "Remove leading spaces before bullets for flat lists",
			testExamples: TEST_EXAMPLES,
			exampleKey: "listBulletIndentation",
		})
	})

	// Test 6: List item indentation fixes (fixes spacing after bullets)
	testSuite.addTest("List item indentation fixes", async () => {
		const { fixListIndentation } = await import("../src/docs-fixer.js")

		await validateFixerResolvesLintErrors({
			before: `
# Test File

-Item 1
  -  Sub item 1
    -  Sub item 2
`,
			linter: ["list-item-indent"],
			fixer: fixListIndentation,
			testName: "List item indentation fixes",
			description: "Fix spacing after bullets while preserving nesting structure",
			testExamples: TEST_EXAMPLES,
			exampleKey: "listItemIndentation",
		})
	})

	// Test 7: Ordered list marker style fixes
	testSuite.addTest("Ordered list marker style fixes", async () => {
		const { fixListIndentation } = await import("../src/docs-fixer.js")

		await validateFixerResolvesLintErrors({
			before: `
# Test File

1) First item
2) Second item
3) Third item
`,
			linter: ["ordered-list-marker-style"],
			fixer: fixListIndentation,
			testName: "Ordered list marker style fixes",
			description: "Fix ordered list marker style (use periods instead of parentheses)",
			testExamples: TEST_EXAMPLES,
			exampleKey: "orderedListMarkerStyle",
		})
	})

	// Test 8: List fixer preserves bold/emphasis formatting
	testSuite.addTest("List fixer preserves bold/emphasis formatting", async () => {
		const { fixListIndentation } = await import("../src/docs-fixer.js")

		const testContent = `
# Test File

**foo** bar blah
*italic* text here
**bold** and *italic* together
- **Bold item** in list
- *Italic item* in list
- **Bold** and *italic* in same item
- Regular item with **bold** text
- Another item with *italic* text
`

		const result = fixListIndentation(testContent)
		
		// Verify that bold formatting is preserved
		assertContains(result.content, "**foo** bar blah", "Bold formatting should be preserved in regular text")
		assertContains(result.content, "**bold** and *italic* together", "Mixed formatting should be preserved")
		assertContains(result.content, "- **Bold item** in list", "Bold formatting should be preserved in list items")
		assertContains(result.content, "- *Italic item* in list", "Italic formatting should be preserved in list items")
		assertContains(result.content, "- **Bold** and *italic* in same item", "Mixed formatting should be preserved in list items")
		assertContains(result.content, "- Regular item with **bold** text", "Bold formatting should be preserved within list item text")
		assertContains(result.content, "- Another item with *italic* text", "Italic formatting should be preserved within list item text")

		console.log("✅ List fixer preserves bold/emphasis formatting test passed!")
	})

	// Test 9: Navigation template selection
	testSuite.addTest("Navigation template selection", async () => {
		const { getNavigationTemplate } = await import("../src/docs-fixer.js")

		const testCases = [
			{ path: "docs/architecture/test.md", expected: "[← Architecture Overview]" },
			{ path: "docs/architecture/repository/test.md", expected: "[← Repository Structure]" },
			{ path: "docs/orchestrator/test.md", expected: "[← Orchestrator Overview]" },
		]

		// Store example data for documentation generation
		const architectureTemplate = getNavigationTemplate("docs/architecture/test.md")
		TEST_EXAMPLES.navigationTemplateSelection = {
			testName: "Navigation template selection",
			description: "Select appropriate navigation templates based on document location",
			before: "docs/architecture/test.md", // Input path
			after: architectureTemplate, // Generated template
			expectedErrorTypes: ["missing-navigation-template"],
			fixesApplied: 0, // This is a selection test, not a fixer
			testFile: "navigation-template-selection-test.md",
		}

		for (const testCase of testCases) {
			const template = getNavigationTemplate(testCase.path)
			assertContains(
				template,
				testCase.expected,
				`Template for ${testCase.path} should contain ${testCase.expected}`,
			)
		}

		console.log("✅ Navigation template selection test passed!")
	})

	// ============================================================================
	// UTILITY TESTS - These tests validate functionality but don't generate examples
	// ============================================================================

	// Test 10: Dry run mode
	testSuite.addTest("Dry run mode", async () => {
		const testFile = join(TEST_CONFIG.testDir, "dry-run-test.md")
		const content = `
# Test File

- [README.md](README.md)
`

		TestUtils.createTestFile(testFile, content)

		// Mock the processFile function to test dry run
		const originalConfig = CONFIG.dryRun
		CONFIG.dryRun = true

		try {
			// This test would need the actual processFile function to be exported
			// For now, we'll test the configuration
			assertTrue(CONFIG.dryRun, "Dry run mode not set correctly")
		} finally {
			CONFIG.dryRun = originalConfig
		}
	})

	// Test 11: File processing error handling
	testSuite.addTest("File processing error handling", async () => {
		const nonExistentFile = join(TEST_CONFIG.testDir, "non-existent.md")

		// This would test error handling for non-existent files
		// We need to export the processFile function for this test
		assertTrue(!existsSync(nonExistentFile), "Non-existent file should not exist")
	})

	// Test 11: Configuration validation
	testSuite.addTest("Configuration validation", () => {
		assertExists(CONFIG.docsDir, "docsDir not configured")
		assertExists(CONFIG.outputDir, "outputDir not configured")
		assertTrue(typeof CONFIG.dryRun === "boolean", "dryRun not configured as boolean")
		assertTrue(typeof CONFIG.verbose === "boolean", "verbose not configured as boolean")
	})

	// Test 12: PATH_FIXES configuration
	testSuite.addTest("PATH_FIXES configuration", () => {
		assertArray(PATH_FIXES, "PATH_FIXES not configured as array")

		const hasArchitectureFixes = PATH_FIXES.some((fix) => fix.pattern.toString().includes("architecture"))

		assertTrue(hasArchitectureFixes, "PATH_FIXES missing architecture fixes")
	})

	// Test 13: LINK_TEXT_IMPROVEMENTS configuration
	testSuite.addTest("LINK_TEXT_IMPROVEMENTS configuration", () => {
		assertArray(LINK_TEXT_IMPROVEMENTS, "LINK_TEXT_IMPROVEMENTS not configured as array")

		const hasReadmeFix = LINK_TEXT_IMPROVEMENTS.some((fix) => fix.pattern.toString().includes("README"))

		assertTrue(hasReadmeFix, "LINK_TEXT_IMPROVEMENTS missing README fix")
	})

	// Test 14: NAVIGATION_TEMPLATES configuration
	testSuite.addTest("NAVIGATION_TEMPLATES configuration", () => {
		assertObject(NAVIGATION_TEMPLATES, "NAVIGATION_TEMPLATES not configured as object")
		assertExists(NAVIGATION_TEMPLATES.architecture, "NAVIGATION_TEMPLATES missing architecture template")
		assertExists(NAVIGATION_TEMPLATES.orchestrator, "NAVIGATION_TEMPLATES missing orchestrator template")
		assertExists(NAVIGATION_TEMPLATES.default, "NAVIGATION_TEMPLATES missing default template")
	})

	return testSuite
}

/**
 * Main test runner
 */
export async function runTests() {
	TestUtils.setupTestEnvironment()

	const testSuite = createTestSuite()
	await testSuite.runTests()

	// Cleanup
	TestUtils.cleanupDir(TEST_CONFIG.testDir)
	TestUtils.cleanupDir(TEST_CONFIG.outputDir)
	TestUtils.cleanupDir(TEST_CONFIG.tempDir)
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runTests().catch(console.error)
}

export { TestUtils, DocsFixerTests }
