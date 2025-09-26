/**
 * Developer Experience Enhancement System
 * 
 * Improves developer experience with better error messages,
 * helpful suggestions, and streamlined workflows.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'

/**
 * Developer experience configuration
 */
const DEFAULT_CONFIG = {
	enabled: true,
	improveErrorMessages: true,
	provideSuggestions: true,
	streamlineWorkflows: true,
	enhanceFeedback: true,
	generateGuides: true,
	outputDir: './developer-experience',
	generateReports: true
}

/**
 * Error message templates
 */
const ERROR_MESSAGES = {
	missingSection: {
		template: 'Missing required section: {section}',
		description: 'This section is required for KiloCode documentation standards',
		suggestion: 'Add a {section} section to improve documentation structure',
		example: 'Example: ## {section}\n\nYour content here...'
	},
	invalidHeading: {
		template: 'Invalid heading: {heading}',
		description: 'Headings should follow proper hierarchy and formatting',
		suggestion: 'Use proper heading levels (##, ###, etc.) and descriptive text',
		example: 'Example: ## Section Title (not # Section Title)'
	},
	brokenLink: {
		template: 'Broken link: {link}',
		description: 'This link cannot be resolved or is invalid',
		suggestion: 'Check the link URL and ensure the target exists',
		example: 'Example: [Link Text](valid-url)'
	},
	lowQuality: {
		template: 'Low content quality: {score}%',
		description: 'Content quality is below the recommended threshold',
		suggestion: 'Improve readability, add more context, or enhance structure',
		example: 'Consider adding examples, explanations, or breaking up long sections'
	}
}

/**
 * Suggestion templates
 */
const SUGGESTIONS = {
	structure: {
		title: 'Improve Document Structure',
		description: 'Your document could benefit from better structure',
		actions: [
			'Add a clear introduction',
			'Use descriptive headings',
			'Include a conclusion or summary',
			'Add navigation links'
		]
	},
	content: {
		title: 'Enhance Content Quality',
		description: 'Content quality can be improved',
		actions: [
			'Add more examples',
			'Improve readability',
			'Add context and background',
			'Use consistent terminology'
		]
	},
	links: {
		title: 'Improve Link Quality',
		description: 'Links can be more descriptive and useful',
		actions: [
			'Use descriptive link text',
			'Add context around links',
			'Ensure all links work',
			'Add internal navigation'
		]
	}
}

/**
 * Workflow templates
 */
const WORKFLOWS = {
	quickFix: {
		title: 'Quick Fix Workflow',
		description: 'Fast way to fix common documentation issues',
		steps: [
			'Run validation to identify issues',
			'Review error messages and suggestions',
			'Apply automated fixes where possible',
			'Manually fix remaining issues',
			'Re-run validation to confirm fixes'
		]
	},
	comprehensive: {
		title: 'Comprehensive Review Workflow',
		description: 'Thorough documentation review and improvement',
		steps: [
			'Run all validation checks',
			'Review quality metrics',
			'Check link health',
			'Improve content structure',
			'Enhance readability',
			'Add missing sections',
			'Final validation and review'
		]
	}
}

/**
 * Improve error messages with better context and suggestions
 * @param {Array} errors - Array of errors
 * @param {string} filePath - File path
 * @param {Object} config - Configuration
 * @returns {Array} Enhanced error messages
 */
function improveErrorMessages(errors, filePath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	if (!mergedConfig.improveErrorMessages) {
		return errors
	}
	
	return errors.map(error => {
		const enhanced = { ...error }
		
		// Add better descriptions
		if (error.type && ERROR_MESSAGES[error.type]) {
			const template = ERROR_MESSAGES[error.type]
			enhanced.description = template.description
			enhanced.suggestion = template.suggestion
			enhanced.example = template.example
		}
		
		// Add context-specific suggestions
		enhanced.context = getErrorContext(error, filePath)
		
		// Add severity assessment
		enhanced.severity = assessErrorSeverity(error)
		
		// Add fix priority
		enhanced.priority = assessFixPriority(error)
		
		return enhanced
	})
}

/**
 * Provide helpful suggestions for improvement
 * @param {string} filePath - File path
 * @param {Object} analysis - Analysis results
 * @param {Object} config - Configuration
 * @returns {Array} Array of suggestions
 */
function provideSuggestions(filePath, analysis, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	if (!mergedConfig.provideSuggestions) {
		return []
	}
	
	const suggestions = []
	
	// Analyze file content
	const content = fs.readFileSync(filePath, 'utf8')
	const processor = remark()
	const tree = processor.parse(content)
	
	// Structure suggestions
	if (needsStructureImprovement(tree)) {
		suggestions.push({
			...SUGGESTIONS.structure,
			file: filePath,
			priority: 'medium',
			actions: SUGGESTIONS.structure.actions.map(action => ({
				action,
				description: getActionDescription(action),
				implementation: getActionImplementation(action, filePath)
			}))
		})
	}
	
	// Content suggestions
	if (analysis.qualityScore < 0.7) {
		suggestions.push({
			...SUGGESTIONS.content,
			file: filePath,
			priority: 'high',
			actions: SUGGESTIONS.content.actions.map(action => ({
				action,
				description: getActionDescription(action),
				implementation: getActionImplementation(action, filePath)
			}))
		})
	}
	
	// Link suggestions
	if (analysis.linkHealth < 0.8) {
		suggestions.push({
			...SUGGESTIONS.links,
			file: filePath,
			priority: 'medium',
			actions: SUGGESTIONS.links.actions.map(action => ({
				action,
				description: getActionDescription(action),
				implementation: getActionImplementation(action, filePath)
			}))
		})
	}
	
	return suggestions
}

/**
 * Streamline workflows for common tasks
 * @param {string} task - Task type
 * @param {Object} config - Configuration
 * @returns {Object} Streamlined workflow
 */
function streamlineWorkflow(task, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	if (!mergedConfig.streamlineWorkflows) {
		return null
	}
	
	const workflow = WORKFLOWS[task]
	if (!workflow) {
		return null
	}
	
	return {
		...workflow,
		steps: workflow.steps.map((step, index) => ({
			step: index + 1,
			description: step,
			command: getStepCommand(step),
			estimatedTime: getStepTime(step)
		}))
	}
}

/**
 * Enhance feedback with better formatting and context
 * @param {Object} feedback - Feedback object
 * @param {Object} config - Configuration
 * @returns {Object} Enhanced feedback
 */
function enhanceFeedback(feedback, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	if (!mergedConfig.enhanceFeedback) {
		return feedback
	}
	
	const enhanced = { ...feedback }
	
	// Add visual indicators
	enhanced.visual = {
		status: getStatusIcon(feedback.status),
		priority: getPriorityIcon(feedback.priority),
		category: getCategoryIcon(feedback.category)
	}
	
	// Add progress tracking
	enhanced.progress = {
		completed: feedback.completed || 0,
		total: feedback.total || 1,
		percentage: Math.round((feedback.completed || 0) / (feedback.total || 1) * 100)
	}
	
	// Add next steps
	enhanced.nextSteps = getNextSteps(feedback)
	
	// Add helpful links
	enhanced.links = getHelpfulLinks(feedback)
	
	return enhanced
}

/**
 * Generate developer guides
 * @param {string} topic - Guide topic
 * @param {Object} config - Configuration
 * @returns {Object} Developer guide
 */
function generateDeveloperGuide(topic, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	if (!mergedConfig.generateGuides) {
		return null
	}
	
	const guides = {
		'getting-started': {
			title: 'Getting Started with Documentation Automation',
			description: 'Learn how to use the documentation automation system',
			sections: [
				{
					title: 'Installation',
					content: 'Install the required dependencies and configure the system'
				},
				{
					title: 'Basic Usage',
					content: 'Run validation and quality checks on your documentation'
				},
				{
					title: 'Configuration',
					content: 'Customize the system to fit your needs'
				},
				{
					title: 'Troubleshooting',
					content: 'Common issues and how to resolve them'
				}
			]
		},
		'best-practices': {
			title: 'Documentation Best Practices',
			description: 'Guidelines for creating high-quality documentation',
			sections: [
				{
					title: 'Structure',
					content: 'How to structure your documentation effectively'
				},
				{
					title: 'Content',
					content: 'Writing clear and engaging content'
				},
				{
					title: 'Links',
					content: 'Creating useful and descriptive links'
				},
				{
					title: 'Maintenance',
					content: 'Keeping your documentation up to date'
				}
			]
		}
	}
	
	return guides[topic] || null
}

/**
 * Get error context
 * @param {Object} error - Error object
 * @param {string} filePath - File path
 * @returns {Object} Error context
 */
function getErrorContext(error, filePath) {
	const context = {
		file: filePath,
		line: error.line || 0,
		column: error.column || 0,
		surrounding: getSurroundingContent(filePath, error.line || 0)
	}
	
	return context
}

/**
 * Get surrounding content
 * @param {string} filePath - File path
 * @param {number} line - Line number
 * @returns {Array} Surrounding lines
 */
function getSurroundingContent(filePath, line) {
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		const lines = content.split('\n')
		const start = Math.max(0, line - 3)
		const end = Math.min(lines.length, line + 3)
		
		return lines.slice(start, end).map((lineContent, index) => ({
			lineNumber: start + index + 1,
			content: lineContent,
			isErrorLine: start + index === line - 1
		}))
	} catch (error) {
		return []
	}
}

/**
 * Assess error severity
 * @param {Object} error - Error object
 * @returns {string} Severity level
 */
function assessErrorSeverity(error) {
	if (error.type === 'brokenLink') return 'high'
	if (error.type === 'missingSection') return 'medium'
	if (error.type === 'invalidHeading') return 'low'
	return 'medium'
}

/**
 * Assess fix priority
 * @param {Object} error - Error object
 * @returns {string} Priority level
 */
function assessFixPriority(error) {
	if (error.severity === 'high') return 'high'
	if (error.severity === 'medium') return 'medium'
	return 'low'
}

/**
 * Check if structure needs improvement
 * @param {Object} tree - AST tree
 * @returns {boolean} Needs improvement
 */
function needsStructureImprovement(tree) {
	let headingCount = 0
	let hasIntroduction = false
	let hasConclusion = false
	
	// This would typically use a proper AST visitor
	// For now, we'll provide a basic implementation
	const content = JSON.stringify(tree)
	
	// Count headings (basic implementation)
	headingCount = (content.match(/"type":"heading"/g) || []).length
	
	// Check for introduction/conclusion (basic implementation)
	hasIntroduction = content.includes('introduction') || content.includes('overview')
	hasConclusion = content.includes('conclusion') || content.includes('summary')
	
	return headingCount < 3 || !hasIntroduction || !hasConclusion
}

/**
 * Get action description
 * @param {string} action - Action name
 * @returns {string} Description
 */
function getActionDescription(action) {
	const descriptions = {
		'Add a clear introduction': 'Provide context and overview for the document',
		'Use descriptive headings': 'Make headings clear and informative',
		'Include a conclusion or summary': 'Wrap up the document with key points',
		'Add navigation links': 'Help readers navigate between sections',
		'Add more examples': 'Provide concrete examples to illustrate concepts',
		'Improve readability': 'Make text easier to read and understand',
		'Add context and background': 'Provide necessary background information',
		'Use consistent terminology': 'Maintain consistent language throughout',
		'Use descriptive link text': 'Make link text informative and clear',
		'Add context around links': 'Explain why links are relevant',
		'Ensure all links work': 'Verify that all links are valid and accessible',
		'Add internal navigation': 'Help readers move between related content'
	}
	
	return descriptions[action] || 'Improve this aspect of your documentation'
}

/**
 * Get action implementation
 * @param {string} action - Action name
 * @param {string} filePath - File path
 * @returns {string} Implementation guidance
 */
function getActionImplementation(action, filePath) {
	const implementations = {
		'Add a clear introduction': 'Add an ## Introduction section at the beginning of your document',
		'Use descriptive headings': 'Replace generic headings with specific, descriptive ones',
		'Include a conclusion or summary': 'Add a ## Summary or ## Conclusion section at the end',
		'Add navigation links': 'Add links to other relevant sections or documents',
		'Add more examples': 'Include code examples, screenshots, or step-by-step instructions',
		'Improve readability': 'Break up long paragraphs, use bullet points, and simplify language',
		'Add context and background': 'Explain the purpose and background of the content',
		'Use consistent terminology': 'Choose specific terms and use them consistently throughout',
		'Use descriptive link text': 'Replace generic link text like "click here" with descriptive text',
		'Add context around links': 'Add a sentence explaining why the link is relevant',
		'Ensure all links work': 'Test all links and fix any that are broken',
		'Add internal navigation': 'Add links to related sections within the same document'
	}
	
	return implementations[action] || 'Implement this improvement in your documentation'
}

/**
 * Get step command
 * @param {string} step - Step description
 * @returns {string} Command
 */
function getStepCommand(step) {
	const commands = {
		'Run validation to identify issues': 'pnpm docs:validate',
		'Review error messages and suggestions': 'Review the validation output',
		'Apply automated fixes where possible': 'pnpm docs:fix',
		'Manually fix remaining issues': 'Edit files manually',
		'Re-run validation to confirm fixes': 'pnpm docs:validate',
		'Run all validation checks': 'pnpm docs:validate && pnpm docs:quality && pnpm docs:links',
		'Review quality metrics': 'pnpm docs:quality',
		'Check link health': 'pnpm docs:links',
		'Improve content structure': 'Review and restructure content',
		'Enhance readability': 'Improve writing and formatting',
		'Add missing sections': 'Add required sections',
		'Final validation and review': 'Run final validation checks'
	}
	
	return commands[step] || 'Review and implement this step'
}

/**
 * Get step time
 * @param {string} step - Step description
 * @returns {string} Estimated time
 */
function getStepTime(step) {
	const times = {
		'Run validation to identify issues': '1-2 minutes',
		'Review error messages and suggestions': '5-10 minutes',
		'Apply automated fixes where possible': '2-5 minutes',
		'Manually fix remaining issues': '10-30 minutes',
		'Re-run validation to confirm fixes': '1-2 minutes',
		'Run all validation checks': '3-5 minutes',
		'Review quality metrics': '5-10 minutes',
		'Check link health': '2-5 minutes',
		'Improve content structure': '15-30 minutes',
		'Enhance readability': '10-20 minutes',
		'Add missing sections': '5-15 minutes',
		'Final validation and review': '2-5 minutes'
	}
	
	return times[step] || '5-10 minutes'
}

/**
 * Get status icon
 * @param {string} status - Status
 * @returns {string} Icon
 */
function getStatusIcon(status) {
	const icons = {
		success: '✅',
		error: '❌',
		warning: '⚠️',
		info: 'ℹ️',
		progress: '🔄'
	}
	
	return icons[status] || 'ℹ️'
}

/**
 * Get priority icon
 * @param {string} priority - Priority
 * @returns {string} Icon
 */
function getPriorityIcon(priority) {
	const icons = {
		high: '🔴',
		medium: '🟡',
		low: '🟢'
	}
	
	return icons[priority] || '🟡'
}

/**
 * Get category icon
 * @param {string} category - Category
 * @returns {string} Icon
 */
function getCategoryIcon(category) {
	const icons = {
		structure: '📋',
		content: '📝',
		links: '🔗',
		quality: '⭐',
		performance: '⚡'
	}
	
	return icons[category] || '📝'
}

/**
 * Get next steps
 * @param {Object} feedback - Feedback object
 * @returns {Array} Next steps
 */
function getNextSteps(feedback) {
	const steps = []
	
	if (feedback.errors && feedback.errors.length > 0) {
		steps.push('Fix the identified errors')
	}
	
	if (feedback.warnings && feedback.warnings.length > 0) {
		steps.push('Address the warnings')
	}
	
	if (feedback.suggestions && feedback.suggestions.length > 0) {
		steps.push('Consider implementing the suggestions')
	}
	
	if (feedback.qualityScore < 0.8) {
		steps.push('Improve content quality')
	}
	
	return steps
}

/**
 * Get helpful links
 * @param {Object} feedback - Feedback object
 * @returns {Array} Helpful links
 */
function getHelpfulLinks(feedback) {
	const links = [
		{
			title: 'Documentation Standards',
			url: '/docs/standards',
			description: 'Learn about KiloCode documentation standards'
		},
		{
			title: 'Best Practices',
			url: '/docs/best-practices',
			description: 'Guidelines for creating high-quality documentation'
		},
		{
			title: 'Troubleshooting',
			url: '/docs/troubleshooting',
			description: 'Common issues and solutions'
		}
	]
	
	return links
}

/**
 * Run comprehensive developer experience enhancement
 * @param {string} dirPath - Directory path
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Enhancement results
 */
async function runDeveloperExperienceEnhancement(dirPath, config = {}) {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }
	
	const results = {
		timestamp: new Date().toISOString(),
		directory: dirPath,
		enhancements: {
			errorMessages: [],
			suggestions: [],
			workflows: [],
			feedback: [],
			guides: []
		},
		recommendations: []
	}
	
	try {
		// Find markdown files
		const filePaths = findMarkdownFiles(dirPath)
		
		// Process each file
		for (const filePath of filePaths) {
			const content = fs.readFileSync(filePath, 'utf8')
			const processor = remark()
			const tree = processor.parse(content)
			
			// Enhance error messages
			const errors = [] // This would come from actual validation
			const enhancedErrors = improveErrorMessages(errors, filePath, mergedConfig)
			results.enhancements.errorMessages.push(...enhancedErrors)
			
			// Provide suggestions
			const analysis = { qualityScore: 0.8, linkHealth: 0.9 } // Mock analysis
			const suggestions = provideSuggestions(filePath, analysis, mergedConfig)
			results.enhancements.suggestions.push(...suggestions)
			
			// Enhance feedback
			const feedback = { status: 'success', priority: 'medium', category: 'content' }
			const enhancedFeedback = enhanceFeedback(feedback, mergedConfig)
			results.enhancements.feedback.push(enhancedFeedback)
		}
		
		// Generate workflows
		results.enhancements.workflows = [
			streamlineWorkflow('quickFix', mergedConfig),
			streamlineWorkflow('comprehensive', mergedConfig)
		].filter(Boolean)
		
		// Generate guides
		results.enhancements.guides = [
			generateDeveloperGuide('getting-started', mergedConfig),
			generateDeveloperGuide('best-practices', mergedConfig)
		].filter(Boolean)
		
		// Generate recommendations
		results.recommendations = generateEnhancementRecommendations(results)
		
		// Save reports if enabled
		if (mergedConfig.generateReports) {
			await saveEnhancementReports(results, mergedConfig)
		}
		
		return results
		
	} catch (error) {
		return {
			...results,
			error: error.message,
			success: false
		}
	}
}

/**
 * Find markdown files
 * @param {string} dirPath - Directory path
 * @returns {Array} Array of file paths
 */
function findMarkdownFiles(dirPath) {
	const files = []
	
	function scanDirectory(dir) {
		try {
			const items = fs.readdirSync(dir)
			
			items.forEach(item => {
				const itemPath = path.join(dir, item)
				const stat = fs.statSync(itemPath)
				
				if (stat.isDirectory()) {
					scanDirectory(itemPath)
				} else if (item.endsWith('.md')) {
					files.push(itemPath)
				}
			})
		} catch (error) {
			// Skip directories that can't be read
		}
	}
	
	scanDirectory(dirPath)
	return files
}

/**
 * Generate enhancement recommendations
 * @param {Object} results - Enhancement results
 * @returns {Array} Array of recommendations
 */
function generateEnhancementRecommendations(results) {
	const recommendations = []
	
	if (results.enhancements.errorMessages.length > 0) {
		recommendations.push({
			priority: 'high',
			category: 'error-handling',
			message: 'Error messages have been enhanced',
			action: 'Review and implement the improved error messages'
		})
	}
	
	if (results.enhancements.suggestions.length > 0) {
		recommendations.push({
			priority: 'medium',
			category: 'improvements',
			message: 'Suggestions have been generated',
			action: 'Consider implementing the suggested improvements'
		})
	}
	
	return recommendations
}

/**
 * Save enhancement reports
 * @param {Object} results - Enhancement results
 * @param {Object} config - Configuration
 * @returns {Promise<void>}
 */
async function saveEnhancementReports(results, config) {
	const outputDir = config.outputDir || './developer-experience'
	
	// Ensure output directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}
	
	// Save JSON report
	const jsonPath = path.join(outputDir, `developer-experience-${Date.now()}.json`)
	fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2))
	
	console.log(`📊 Developer experience enhancement report saved to ${jsonPath}`)
}

export {
	runDeveloperExperienceEnhancement,
	improveErrorMessages,
	provideSuggestions,
	streamlineWorkflow,
	enhanceFeedback,
	generateDeveloperGuide,
	DEFAULT_CONFIG
}


