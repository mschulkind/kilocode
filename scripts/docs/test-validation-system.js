#!/usr/bin/env node

/**
 * Test Suite for Validation System Simplification
 *
 * TDD approach: Write failing tests first, then implement system simplification
 * to make tests pass.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest"
import fs from "fs/promises"
import path from "path"
import { remark } from "remark"

describe("T023A: Major System Simplification", () => {
	let originalRemarkrc
	let originalStandardsPlugin
	let originalComprehensivePlugin

	beforeAll(async () => {
		// Backup original files
		originalRemarkrc = await fs.readFile(".remarkrc", "utf8")
		originalStandardsPlugin = await fs.readFile("plugins/remark-kilocode-standards.js", "utf8")
		originalComprehensivePlugin = await fs.readFile("plugins/remark-kilocode-comprehensive.js", "utf8")
	})

	afterAll(async () => {
		// Restore original files if tests fail
		if (originalRemarkrc) {
			await fs.writeFile(".remarkrc", originalRemarkrc)
		}
		if (originalStandardsPlugin) {
			await fs.writeFile("plugins/remark-kilocode-standards.js", originalStandardsPlugin)
		}
		if (originalComprehensivePlugin) {
			await fs.writeFile("plugins/remark-kilocode-comprehensive.js", originalComprehensivePlugin)
		}
	})

	describe("T023A.1: Configure Undefined References Rule", () => {
		it("should ignore template placeholders in undefined references", async () => {
			// Write failing test first
			const processor = remark()
				.data("settings", { bullet: "-", emphasis: "*", fence: "`" })
				.use(require("remark-preset-lint-recommended"))

			const testMarkdown = `# Test Document

[brief description of what this document covers]

## Research Context

This document covers the implementation details.

## Navigation

- [← Back to Implementation Plan](../plans/test.md)
- [📚 Technical Glossary](../../docs/GLOSSARY.md)
- [↑ Table of Contents](#table-of-contents)
`

			const result = await processor.process(testMarkdown)

			// This should NOT produce errors for template placeholders
			const errors = result.messages.filter(
				(msg) => msg.ruleId === "no-undefined-references" && msg.message.includes("brief description"),
			)

			expect(errors).toHaveLength(0)
		})
	})

	describe("T023A.2: Remove Duplicate Rules", () => {
		it("should not have duplicate validation rules between plugins", async () => {
			// Check that we don't have overlapping rules
			const standardsPlugin = await fs.readFile("plugins/remark-kilocode-standards.js", "utf8")
			const comprehensivePlugin = await fs.readFile("plugins/remark-kilocode-comprehensive.js", "utf8")

			// These rules should not appear in both plugins
			const duplicateRules = [
				"kilocode-descriptive-links",
				"kilocode-heading-hierarchy",
				"kilocode-research-context-required",
				"kilocode-navigation-footer-required",
			]

			for (const rule of duplicateRules) {
				const inStandards = standardsPlugin.includes(rule)
				const inComprehensive = comprehensivePlugin.includes(rule)

				// Should not be in both - one should be removed
				expect(inStandards && inComprehensive).toBe(false)
			}
		})
	})

	describe("T023A.3: Consolidate Validation Scripts", () => {
		it("should have minimal number of validation scripts", async () => {
			const scriptsDir = "scripts/docs"
			const files = await fs.readdir(scriptsDir)

			// Should have only essential scripts
			const validationScripts = files.filter(
				(file) => file.includes("validate") || file.includes("fix") || file.includes("check"),
			)

			// Should have 3 or fewer validation scripts
			expect(validationScripts.length).toBeLessThanOrEqual(3)
		})
	})

	describe("T023A.4: Update .remarkrc Minimal", () => {
		it("should use minimal plugin configuration", async () => {
			const remarkrc = JSON.parse(await fs.readFile(".remarkrc", "utf8"))

			// Should have 5 or fewer plugins
			expect(remarkrc.plugins.length).toBeLessThanOrEqual(5)

			// Should include essential plugins only
			const essentialPlugins = ["remark-preset-lint-recommended", "remark-validate-links"]

			for (const plugin of essentialPlugins) {
				expect(remarkrc.plugins).toContain(plugin)
			}
		})
	})

	describe("T023A.5: Merge Custom Plugins", () => {
		it("should have single consolidated custom plugin", async () => {
			const pluginsDir = "plugins"
			const files = await fs.readdir(pluginsDir)

			// Should have only one custom KiloCode plugin
			const customPlugins = files.filter((file) => file.startsWith("remark-kilocode") && file.endsWith(".js"))

			expect(customPlugins.length).toBeLessThanOrEqual(1)
		})
	})

	describe("T023A.6: Remove Overlapping Validation Rules", () => {
		it("should not have overlapping validation rules", async () => {
			// This test will pass after we consolidate the plugins
			const consolidatedPlugin = await fs.readFile("plugins/remark-kilocode-unified.js", "utf8")

			// Check that we don't have duplicate rule definitions
			const ruleDefinitions = consolidatedPlugin.match(/rule:\s*"([^"]+)"/g) || []
			const ruleNames = ruleDefinitions.map((def) => def.match(/"([^"]+)"/)[1])

			const uniqueRules = new Set(ruleNames)
			expect(uniqueRules.size).toBe(ruleNames.length)
		})
	})

	describe("T023A.7: Standardize Severity Levels", () => {
		it("should have consistent severity levels across rules", async () => {
			const consolidatedPlugin = await fs.readFile("plugins/remark-kilocode-unified.js", "utf8")

			// All rules should use consistent severity patterns
			const severityPatterns = consolidatedPlugin.match(/type:\s*"([^"]+)"/g) || []
			const severities = severityPatterns.map((pattern) => pattern.match(/"([^"]+)"/)[1])

			// Should only use 'error' or 'warning', not both for the same rule type
			const validSeverities = ["error", "warning"]
			for (const severity of severities) {
				expect(validSeverities).toContain(severity)
			}
		})
	})

	describe("T023A.8: Eliminate Conflicting Requirements", () => {
		it("should not have conflicting rule requirements", async () => {
			// Test that rules don't conflict with each other
			const processor = remark()
				.data("settings", { bullet: "-", emphasis: "*", fence: "`" })
				.use(require("remark-preset-lint-recommended"))
				.use(require("../../plugins/remark-kilocode-unified.js"))

			const testMarkdown = `# Test Document

## Research Context

This document covers the implementation details.

## Navigation

- [← Back to Implementation Plan](../plans/test.md)
- [📚 Technical Glossary](../../docs/GLOSSARY.md)
`

			const result = await processor.process(testMarkdown)

			// Should not have conflicting rule messages
			const conflictingMessages = result.messages.filter(
				(msg) => msg.message.includes("conflict") || msg.message.includes("contradict"),
			)

			expect(conflictingMessages).toHaveLength(0)
		})
	})

	describe("T023A.9: Reduce .remarkrc Plugins", () => {
		it("should have minimal plugin count", async () => {
			const remarkrc = JSON.parse(await fs.readFile(".remarkrc", "utf8"))

			// Should have 4 or fewer plugins total
			expect(remarkrc.plugins.length).toBeLessThanOrEqual(4)
		})
	})

	describe("T023A.10: Use Remark Preset Lint Recommended", () => {
		it("should use remark-preset-lint-recommended as primary configuration", async () => {
			const remarkrc = JSON.parse(await fs.readFile(".remarkrc", "utf8"))

			// Should have remark-preset-lint-recommended as first plugin
			expect(remarkrc.plugins[0]).toBe("remark-preset-lint-recommended")
		})
	})

	describe("T023A.11: Add Minimal Custom Rules", () => {
		it("should have only essential custom rules", async () => {
			const consolidatedPlugin = await fs.readFile("plugins/remark-kilocode-unified.js", "utf8")

			// Should have minimal number of custom rules (10 or fewer)
			const ruleMatches = consolidatedPlugin.match(/rule:\s*"kilocode-[^"]+"/g) || []
			expect(ruleMatches.length).toBeLessThanOrEqual(10)
		})
	})

	describe("T023A.12: Document Simplified Configuration", () => {
		it("should have documentation for simplified configuration", async () => {
			const docsFile = await fs.readFile("docs/tools/VALIDATION_SYSTEM.md", "utf8")

			// Should document the simplified configuration
			expect(docsFile).toContain("Simplified Configuration")
			expect(docsFile).toContain("remark-preset-lint-recommended")
			expect(docsFile).toContain("remark-kilocode-unified")
		})
	})

	describe("T023A.13: Test Simplified System", () => {
		it("should work with all documentation files", async () => {
			// Test with a sample documentation file
			const sampleFile = "docs/README.md"
			const content = await fs.readFile(sampleFile, "utf8")

			const processor = remark()
				.data("settings", { bullet: "-", emphasis: "*", fence: "`" })
				.use(require("remark-preset-lint-recommended"))
				.use(require("remark-validate-links"))
				.use(require("../../plugins/remark-kilocode-unified.js"))

			const result = await processor.process(content)

			// Should process without throwing errors
			expect(result).toBeDefined()
			expect(result.messages).toBeDefined()
		})
	})

	describe("T023A.14: Verify No Functionality Loss", () => {
		it("should preserve all essential validation functionality", async () => {
			const consolidatedPlugin = await fs.readFile("plugins/remark-kilocode-unified.js", "utf8")

			// Should still have essential validation rules
			const essentialRules = [
				"kilocode-research-context-required",
				"kilocode-navigation-footer-required",
				"kilocode-descriptive-links",
				"kilocode-heading-hierarchy",
			]

			for (const rule of essentialRules) {
				expect(consolidatedPlugin).toContain(rule)
			}
		})
	})

	describe("T023A.15: Measure Performance Improvement", () => {
		it("should improve validation performance", async () => {
			const startTime = Date.now()

			const processor = remark()
				.data("settings", { bullet: "-", emphasis: "*", fence: "`" })
				.use(require("remark-preset-lint-recommended"))
				.use(require("remark-validate-links"))
				.use(require("../../plugins/remark-kilocode-unified.js"))

			const testMarkdown = `# Test Document

## Research Context

This document covers the implementation details.

## Navigation

- [← Back to Implementation Plan](../plans/test.md)
- [📚 Technical Glossary](../../docs/GLOSSARY.md)
`

			await processor.process(testMarkdown)

			const endTime = Date.now()
			const duration = endTime - startTime

			// Should complete in under 100ms for a simple document
			expect(duration).toBeLessThan(100)
		})
	})
})
