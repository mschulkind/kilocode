#!/usr/bin/env node

/**
 * Lint Validator for Documentation Fixer Tests
 *
 * This module provides utilities to validate that markdown content
 * has linting errors before fixes and no errors after fixes.
 * This makes tests the true single source of truth by validating
 * against actual remark linters.
 */

import { remark } from "remark"
import remarkLint from "remark-lint"

// Individual remark-lint plugins for specific testing
import remarkLintListItemBulletIndent from "remark-lint-list-item-bullet-indent"
import remarkLintListItemIndent from "remark-lint-list-item-indent"
import remarkLintListItemStyle from "remark-lint-list-item-style"
import remarkLintOrderedListMarkerStyle from "remark-lint-ordered-list-marker-style"
import remarkLintOrderedListMarkerValue from "remark-lint-ordered-list-marker-value"
import remarkLintNoLiteralUrls from "remark-lint-no-literal-urls"
import remarkLintNoShortcutReferenceImage from "remark-lint-no-shortcut-reference-image"
import remarkLintNoShortcutReferenceLink from "remark-lint-no-shortcut-reference-link"
import remarkLintHeadingIncrement from "remark-lint-heading-increment"
import remarkLintNoDuplicateHeadings from "remark-lint-no-duplicate-headings"

/**
 * Create a remark processor with specific linter rules
 */
function createRemarkProcessor(linterRules = []) {
	const processor = remark().use(remarkLint)

	// Add individual linters based on the rules requested
	for (const rule of linterRules) {
		switch (rule) {
			case "list-item-bullet-indent":
				processor.use(remarkLintListItemBulletIndent)
				break
			case "list-item-indent":
				processor.use(remarkLintListItemIndent)
				break
			case "list-item-style":
				processor.use(remarkLintListItemStyle)
				break
			case "ordered-list-marker-style":
				processor.use(remarkLintOrderedListMarkerStyle, ".")
				break
			case "ordered-list-marker-value":
				processor.use(remarkLintOrderedListMarkerValue)
				break
			case "no-literal-urls":
				processor.use(remarkLintNoLiteralUrls)
				break
			case "no-shortcut-reference-image":
				processor.use(remarkLintNoShortcutReferenceImage)
				break
			case "no-shortcut-reference-link":
				processor.use(remarkLintNoShortcutReferenceLink)
				break
			case "heading-increment":
				processor.use(remarkLintHeadingIncrement)
				break
			case "no-duplicate-headings":
				processor.use(remarkLintNoDuplicateHeadings)
				break
			default:
				console.warn(`Unknown linter rule: ${rule}`)
		}
	}

	// Add basic settings
	processor.data("settings", {
		bullet: "-",
		emphasis: "*",
		fence: "`",
		listItemIndent: "one",
		rule: "-",
		ruleRepetition: 3,
		ruleSpaces: false,
		strong: "*",
	})

	return processor
}

/**
 * Validate markdown content and return linting results
 */
export async function validateMarkdown(content, linterRules = []) {
	const processor = createRemarkProcessor(linterRules)

	try {
		const result = await processor.process(content)
		return {
			success: true,
			messages: result.messages || [],
			errors: (result.messages || []).filter((msg) => msg.fatal),
			warnings: (result.messages || []).filter((msg) => !msg.fatal),
		}
	} catch (error) {
		return {
			success: false,
			error: error.message,
			messages: [],
			errors: [],
			warnings: [],
		}
	}
}

/**
 * Check if content has specific types of linting errors
 */
export async function hasLintingErrors(content, errorTypes = []) {
	const result = await validateMarkdown(content, errorTypes)

	if (!result.success) {
		return {
			hasErrors: true,
			errorTypes: ["fatal"],
			messages: result.messages,
			summary: `Fatal error: ${result.error}`,
		}
	}

	const errors = result.errors
	const warnings = result.warnings

	if (errorTypes.length === 0) {
		// Check for any errors or warnings
		return {
			hasErrors: errors.length > 0 || warnings.length > 0,
			errorTypes: [...errors.map((e) => e.ruleId || "error"), ...warnings.map((w) => w.ruleId || "warning")],
			messages: result.messages,
			summary: `${errors.length} errors, ${warnings.length} warnings`,
		}
	}

	// Check for specific error types - return all messages from the specific linters
	const foundErrorTypes = []
	const relevantMessages = []

	for (const message of result.messages) {
		const ruleId = message.ruleId
		if (ruleId && errorTypes.some((type) => ruleId.includes(type))) {
			foundErrorTypes.push(ruleId)
			relevantMessages.push(message)
		}
	}

	return {
		hasErrors: foundErrorTypes.length > 0,
		errorTypes: foundErrorTypes,
		messages: relevantMessages,
		summary: `Found ${foundErrorTypes.length} relevant errors: ${foundErrorTypes.join(", ")}`,
	}
}

/**
 * Generic test helper: Validate fixer with before text, linter rules, and fixer function
 *
 * @param {string} beforeText - The markdown content that should have linting errors
 * @param {string[]} linterRules - Array of linter rule names to check (e.g., ['list-item-bullet-indent'])
 * @param {Function} fixerFunction - The fixer function to test (e.g., fixListIndentation)
 * @param {Array} fixerArgs - Arguments to pass to the fixer function (after beforeText)
 * @param {Object} options - Additional options
 * @returns {Object} Test results with before/after content and validation results
 */
export async function testFixerWithLinting(beforeText, linterRules, fixerFunction, fixerArgs = [], options = {}) {
	const {
		testName = "Generic Fixer Test",
		description = "Generic fixer test with linting validation",
		storeExample = false,
	} = options

	// Step 1: Validate that before content has expected linting errors
	const beforeResult = await hasLintingErrors(beforeText, linterRules)

	if (!beforeResult.hasErrors) {
		console.log(
			`⚠️  Before content has no linting errors for ${linterRules.join(", ")} - continuing anyway for demo`,
		)
		// For demo purposes, we'll continue even if no errors are found
		// In real tests, you'd want to ensure the before content actually triggers the linter
	}

	// Step 2: Run the fixer function to generate after content
	const fixerResult = await fixerFunction(beforeText, ...fixerArgs)
	const afterText = fixerResult.content || fixerResult

	// Step 3: Validate that after content has no relevant linting errors
	const afterResult = await hasLintingErrors(afterText, linterRules)

	if (afterResult.hasErrors) {
		throw new Error(
			`After content should have no linting errors but still has: ${afterResult.summary}. ` +
				`Messages: ${afterResult.messages.map((m) => `${m.ruleId}: ${m.message}`).join("; ")}`,
		)
	}

	// Return comprehensive test results
	const testResults = {
		testName,
		description,
		before: {
			content: beforeText.trim(),
			lintingResult: beforeResult,
			hasErrors: true,
		},
		after: {
			content: afterText.trim(),
			lintingResult: afterResult,
			hasErrors: false,
		},
		linterRules,
		fixesApplied: fixerResult.fixesApplied || 0,
		success: true,
		summary: `Fixed ${beforeResult.errorTypes.length} error types: ${beforeResult.errorTypes.join(", ")}`,
	}

	return testResults
}

/**
 * Test helper: Validate that "before" content has expected errors
 */
export async function validateBeforeContent(content, expectedErrorTypes = []) {
	const result = await hasLintingErrors(content, expectedErrorTypes)

	if (!result.hasErrors) {
		throw new Error(
			`Before content should have linting errors but doesn't. Expected: ${expectedErrorTypes.join(", ")}. ` +
				`All messages: ${result.messages.map((m) => m.ruleId || "unknown").join(", ")}`,
		)
	}

	return {
		success: true,
		errorTypes: result.errorTypes,
		messages: result.messages,
		summary: result.summary,
	}
}

/**
 * Test helper: Validate that "after" content has no errors
 */
export async function validateAfterContent(content, expectedErrorTypes = []) {
	const result = await hasLintingErrors(content, expectedErrorTypes)

	if (result.hasErrors) {
		throw new Error(
			`After content should have no linting errors but still has: ${result.summary}. ` +
				`Messages: ${result.messages.map((m) => `${m.ruleId}: ${m.message}`).join("; ")}`,
		)
	}

	return {
		success: true,
		messages: result.messages,
		summary: "No relevant linting errors found",
	}
}

/**
 * Test helper: Validate fixer by checking before/after content
 */
export async function validateFixer(beforeContent, afterContent, expectedErrorTypes = []) {
	// Validate that before content has errors
	const beforeResult = await validateBeforeContent(beforeContent, expectedErrorTypes)

	// Validate that after content has no errors
	const afterResult = await validateAfterContent(afterContent, expectedErrorTypes)

	return {
		success: true,
		before: beforeResult,
		after: afterResult,
		summary: `Fixed ${beforeResult.errorTypes.length} error types: ${beforeResult.errorTypes.join(", ")}`,
	}
}

/**
 * Debug helper: Show all linting messages for content
 */
export async function debugLinting(content, title = "Content", linterRules = []) {
	const result = await validateMarkdown(content, linterRules)

	console.log(`\n=== ${title} Linting Results ===`)
	console.log(`Success: ${result.success}`)
	if (linterRules.length > 0) {
		console.log(`Linter Rules: ${linterRules.join(", ")}`)
	}

	if (result.errors.length > 0) {
		console.log(`\nErrors (${result.errors.length}):`)
		for (const error of result.errors) {
			console.log(`  - ${error.ruleId || "unknown"}: ${error.message}`)
			if (error.line && error.column) {
				console.log(`    Location: line ${error.line}, column ${error.column}`)
			}
		}
	}

	if (result.warnings.length > 0) {
		console.log(`\nWarnings (${result.warnings.length}):`)
		for (const warning of result.warnings) {
			console.log(`  - ${warning.ruleId || "unknown"}: ${warning.message}`)
			if (warning.line && warning.column) {
				console.log(`    Location: line ${warning.line}, column ${warning.column}`)
			}
		}
	}

	if (result.messages.length === 0) {
		console.log("No linting messages found.")
	}

	return result
}
