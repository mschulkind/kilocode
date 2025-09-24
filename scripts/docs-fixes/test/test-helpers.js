/**
 * Custom test assertion helpers for KiloCode Documentation Fixer tests
 */

/**
 * Assert that a fixer applied the expected number of fixes
 * @param {number} actualFixes - Number of fixes actually applied
 * @param {number} expectedFixes - Number of fixes expected
 * @param {string} fixerName - Name of the fixer for error messages
 */
export function assertFixCount(actualFixes, expectedFixes, fixerName = "Fixer") {
	if (actualFixes !== expectedFixes) {
		throw new Error(`${fixerName} expected ${expectedFixes} fixes, got ${actualFixes}`)
	}
}

/**
 * Assert that a boolean condition is true
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message if condition is false
 */
export function assertTrue(condition, message) {
	if (!condition) {
		throw new Error(message)
	}
}

/**
 * Assert that a value is not null or undefined
 * @param {*} value - Value to check
 * @param {string} message - Error message if value is null/undefined
 */
export function assertExists(value, message) {
	if (value == null) {
		throw new Error(message)
	}
}

/**
 * Assert that a value is an array
 * @param {*} value - Value to check
 * @param {string} message - Error message if value is not an array
 */
export function assertArray(value, message) {
	if (!Array.isArray(value)) {
		throw new Error(message)
	}
}

/**
 * Assert that a value is an object
 * @param {*} value - Value to check
 * @param {string} message - Error message if value is not an object
 */
export function assertObject(value, message) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(message)
	}
}

/**
 * Assert that a string contains a substring
 * @param {string} str - String to search in
 * @param {string} substring - Substring to find
 * @param {string} message - Error message if substring not found
 */
export function assertContains(str, substring, message) {
	if (!str.includes(substring)) {
		throw new Error(message)
	}
}

/**
 * Assert that a navigation template contains the expected content
 * @param {string} template - The navigation template to check
 * @param {string} expectedContent - Expected content that should be in the template
 * @param {string} templateType - Type of template for error messages (e.g., "Architecture", "Repository")
 */
export function assertNavigationTemplate(template, expectedContent, templateType) {
	if (!template.includes(expectedContent)) {
		throw new Error(`${templateType} template not selected correctly`)
	}
}

/**
 * Assert multiple navigation templates at once
 * @param {Object} templates - Object with template types as keys and template content as values
 * @param {Object} expectedContents - Object with template types as keys and expected content as values
 */
export function assertNavigationTemplates(templates, expectedContents) {
	for (const [templateType, expectedContent] of Object.entries(expectedContents)) {
		const template = templates[templateType]
		if (template) {
			assertNavigationTemplate(template, expectedContent, templateType)
		} else {
			throw new Error(`${templateType} template is missing`)
		}
	}
}

/**
 * Validate that a fixer function properly resolves linting errors
 * @param {Object} options - Test options
 * @param {string} options.before - Content that should have linting errors
 * @param {string[]} options.linter - Array of linter rule names to test
 * @param {Function} options.fixer - The fixer function to test
 * @param {Array} options.fixerArgs - Additional arguments to pass to fixer
 * @param {string} options.testName - Name of the test
 * @param {string} options.description - Description for documentation
 * @param {Object} options.testExamples - TEST_EXAMPLES registry object to store results
 * @param {string} options.exampleKey - Key in TEST_EXAMPLES to store the results
 * @returns {Promise<Object>} Test results
 */
export async function validateFixerResolvesLintErrors({
	before,
	linter,
	fixer,
	fixerArgs = [],
	testName,
	description,
	testExamples = null,
	exampleKey = null,
}) {
	// Import the lint validator
	const { testFixerWithLinting } = await import("./lint-validator.js")

	// Run the generic test with lint validation
	const result = await testFixerWithLinting(before, linter, fixer, fixerArgs, {
		testName,
		description,
		storeExample: true,
	})

	// Assert that the before content actually had linting errors
	if (result.before.lintingResult.hasErrors) {
		console.log(`✅ Before content has ${result.before.lintingResult.errorTypes.length} linting errors as expected`)
	} else {
		throw new Error(
			`Before content should have linting errors for ${linter.join(", ")} but has none. Test content needs adjustment to actually trigger the linter.`
		)
	}

	// Assert that the after content has no linting errors
	if (result.after.lintingResult.hasErrors) {
		throw new Error(
			`After content should have no linting errors but still has: ${result.after.lintingResult.summary}`,
		)
	} else {
		console.log(`✅ After content has no linting errors as expected`)
	}

	// Store example data for documentation generation if requested
	if (testExamples && exampleKey) {
		testExamples[exampleKey] = {
			testName: result.testName,
			description: result.description,
			before: result.before.content,
			after: result.after.content,
			expectedErrorTypes: result.linterRules,
			fixesApplied: result.fixesApplied,
		}
	}

	// Log test success
	console.log(`✅ ${testName} test passed!`)
	console.log(`   Applied ${result.fixesApplied} fixes`)

	return result
}
