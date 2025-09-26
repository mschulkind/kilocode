/**
 * Commit Message Validation System
 * 
 * Validates commit messages according to conventional commit standards
 * and KiloCode-specific requirements.
 */

import fs from 'fs'
import path from 'path'

/**
 * Commit message validation configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	conventionalCommits: true,
	requireScope: false,
	allowedTypes: [
		'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'
	],
	requiredFooter: false,
	footerPatterns: [
		'Closes: #\\d+',
		'Fixes: #\\d+',
		'Refs: #\\d+',
		'Implements: [A-Z]\\d+',
		'Co-authored-by: .+'
	],
	maxLength: 100,
	minLength: 10,
	subjectCase: 'lowercase', // lowercase, uppercase, sentence-case
	subjectEndPeriod: false,
	bodyMaxLength: 1000,
	bodyMinLength: 0,
	bodyLineLength: 100
}

/**
 * Parse commit message
 * @param {string} message - Commit message
 * @returns {Object} Parsed commit message
 */
function parseCommitMessage(message) {
	const lines = message.split('\n')
	const subject = lines[0] || ''
	const body = lines.slice(1).join('\n')
	
	// Parse conventional commit format
	const conventionalMatch = subject.match(/^(\w+)(\(([^)]+)\))?(!)?: (.+)$/)
	
	if (conventionalMatch) {
		return {
			type: conventionalMatch[1],
			scope: conventionalMatch[3] || null,
			breaking: !!conventionalMatch[4],
			description: conventionalMatch[5],
			subject,
			body,
			isConventional: true
		}
	}
	
	return {
		type: null,
		scope: null,
		breaking: false,
		description: subject,
		subject,
		body,
		isConventional: false
	}
}

/**
 * Validate commit message
 * @param {string} message - Commit message
 * @param {Object} config - Validation configuration
 * @returns {Object} Validation result
 */
function validateCommitMessage(message, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const result = {
		valid: true,
		errors: [],
		warnings: [],
		suggestions: [],
		parsed: parseCommitMessage(message)
	}
	
	// Check if validation is enabled
	if (!mergedConfig.enabled) {
		return result
	}
	
	// Basic length validation
	if (message.length < mergedConfig.minLength) {
		result.valid = false
		result.errors.push(`Commit message too short (minimum ${mergedConfig.minLength} characters)`)
	}
	
	if (message.length > mergedConfig.maxLength) {
		result.valid = false
		result.errors.push(`Commit message too long (maximum ${mergedConfig.maxLength} characters)`)
	}
	
	// Subject validation
	const subject = result.parsed.subject
	if (subject.length > 50) {
		result.warnings.push('Subject line is too long (recommended: 50 characters or less)')
	}
	
	// Case validation
	if (mergedConfig.subjectCase === 'lowercase' && subject !== subject.toLowerCase()) {
		result.warnings.push('Subject should be in lowercase')
		result.suggestions.push('Use lowercase for the subject line')
	}
	
	// Period validation
	if (mergedConfig.subjectEndPeriod && !subject.endsWith('.')) {
		result.warnings.push('Subject should end with a period')
	} else if (!mergedConfig.subjectEndPeriod && subject.endsWith('.')) {
		result.warnings.push('Subject should not end with a period')
	}
	
	// Conventional commit validation
	if (mergedConfig.conventionalCommits) {
		if (!result.parsed.isConventional) {
			result.valid = false
			result.errors.push('Commit message must follow conventional commit format')
			result.suggestions.push('Use format: type(scope): description')
		} else {
			// Validate type
			if (!mergedConfig.allowedTypes.includes(result.parsed.type)) {
				result.valid = false
				result.errors.push(`Invalid commit type: ${result.parsed.type}`)
				result.suggestions.push(`Use one of: ${mergedConfig.allowedTypes.join(', ')}`)
			}
			
			// Validate scope requirement
			if (mergedConfig.requireScope && !result.parsed.scope) {
				result.valid = false
				result.errors.push('Commit message must include a scope')
				result.suggestions.push('Add a scope in parentheses: type(scope): description')
			}
		}
	}
	
	// Body validation
	if (result.parsed.body) {
		const bodyLines = result.parsed.body.split('\n')
		
		// Check body length
		if (result.parsed.body.length < mergedConfig.bodyMinLength) {
			result.warnings.push(`Body too short (minimum ${mergedConfig.bodyMinLength} characters)`)
		}
		
		if (result.parsed.body.length > mergedConfig.bodyMaxLength) {
			result.warnings.push(`Body too long (maximum ${mergedConfig.bodyMaxLength} characters)`)
		}
		
		// Check line length
		bodyLines.forEach((line, index) => {
			if (line.length > mergedConfig.bodyLineLength) {
				result.warnings.push(`Body line ${index + 2} is too long (maximum ${mergedConfig.bodyLineLength} characters)`)
			}
		})
		
		// Check footer patterns
		if (mergedConfig.requiredFooter) {
			const hasValidFooter = mergedConfig.footerPatterns.some(pattern => {
				const regex = new RegExp(pattern, 'i')
				return bodyLines.some(line => regex.test(line))
			})
			
			if (!hasValidFooter) {
				result.warnings.push('Body should include a valid footer')
				result.suggestions.push('Add a footer like "Closes: #123" or "Implements: T001"')
			}
		}
	}
	
	return result
}

/**
 * Validate commit message from file
 * @param {string} filePath - Path to commit message file
 * @param {Object} config - Validation configuration
 * @returns {Promise<Object>} Validation result
 */
async function validateCommitMessageFile(filePath, config = {}) {
	try {
		const message = fs.readFileSync(filePath, 'utf8')
		const result = validateCommitMessage(message, config)
		
		return {
			file: filePath,
			...result,
			timestamp: new Date().toISOString()
		}
	} catch (error) {
		return {
			file: filePath,
			valid: false,
			error: error.message,
			errors: [error.message],
			warnings: [],
			suggestions: [],
			timestamp: new Date().toISOString()
		}
	}
}

/**
 * Generate commit message suggestions
 * @param {string} message - Commit message
 * @param {Object} config - Validation configuration
 * @returns {Array} Array of suggestions
 */
function generateCommitMessageSuggestions(message, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	const parsed = parseCommitMessage(message)
	const suggestions = []
	
	if (!parsed.isConventional) {
		suggestions.push('Use conventional commit format: type(scope): description')
		suggestions.push('Example: feat(auth): add user authentication')
	}
	
	if (parsed.type && !mergedConfig.allowedTypes.includes(parsed.type)) {
		suggestions.push(`Use one of these types: ${mergedConfig.allowedTypes.join(', ')}`)
	}
	
	if (mergedConfig.requireScope && !parsed.scope) {
		suggestions.push('Add a scope to describe what area of the codebase is affected')
		suggestions.push('Example: feat(api): add new endpoint')
	}
	
	if (message.length > 50) {
		suggestions.push('Keep the subject line under 50 characters')
		suggestions.push('Use the body for additional details')
	}
	
	if (parsed.body && parsed.body.length < 20) {
		suggestions.push('Consider adding more detail in the body')
		suggestions.push('Explain what changed and why')
	}
	
	return suggestions
}

/**
 * Format commit message according to standards
 * @param {string} message - Commit message
 * @param {Object} config - Formatting configuration
 * @returns {string} Formatted commit message
 */
function formatCommitMessage(message, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	const parsed = parseCommitMessage(message)
	
	let formatted = message
	
	// Apply case formatting
	if (mergedConfig.subjectCase === 'lowercase') {
		const lines = formatted.split('\n')
		lines[0] = lines[0].toLowerCase()
		formatted = lines.join('\n')
	}
	
	// Remove trailing period if not required
	if (!mergedConfig.subjectEndPeriod && formatted.endsWith('.')) {
		formatted = formatted.slice(0, -1)
	}
	
	// Add period if required
	if (mergedConfig.subjectEndPeriod && !formatted.endsWith('.')) {
		formatted += '.'
	}
	
	return formatted
}

export {
	validateCommitMessage,
	validateCommitMessageFile,
	generateCommitMessageSuggestions,
	formatCommitMessage,
	parseCommitMessage,
	DEFAULT_CONFIG
}


