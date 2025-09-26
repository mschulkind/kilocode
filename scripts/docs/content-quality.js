/**
 * Content Quality Analysis Module
 * 
 * Provides readability scoring, technical term consistency checking,
 * and content quality metrics for documentation.
 */

import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

/**
 * Calculate Flesch Reading Ease score
 * @param {string} text - The text to analyze
 * @returns {number} Flesch Reading Ease score (0-100)
 */
function calculateFleschReadingEase(text) {
	const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
	const words = text.split(/\s+/).filter(w => w.length > 0)
	const syllables = words.reduce((total, word) => total + countSyllables(word), 0)
	
	if (sentences.length === 0 || words.length === 0) return 0
	
	const avgWordsPerSentence = words.length / sentences.length
	const avgSyllablesPerWord = syllables / words.length
	
	const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
	return Math.max(0, Math.min(100, score))
}

/**
 * Count syllables in a word
 * @param {string} word - The word to count syllables for
 * @returns {number} Number of syllables
 */
function countSyllables(word) {
	word = word.toLowerCase().replace(/[^a-z]/g, '')
	if (word.length === 0) return 0
	
	let syllables = 0
	let previousWasVowel = false
	
	for (let i = 0; i < word.length; i++) {
		const isVowel = /[aeiouy]/.test(word[i])
		if (isVowel && !previousWasVowel) {
			syllables++
		}
		previousWasVowel = isVowel
	}
	
	// Handle silent 'e'
	if (word.endsWith('e') && syllables > 1) {
		syllables--
	}
	
	return Math.max(1, syllables)
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * @param {string} text - The text to analyze
 * @returns {number} Grade level (0-20+)
 */
function calculateFleschKincaidGradeLevel(text) {
	const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
	const words = text.split(/\s+/).filter(w => w.length > 0)
	const syllables = words.reduce((total, word) => total + countSyllables(word), 0)
	
	if (sentences.length === 0 || words.length === 0) return 0
	
	const avgWordsPerSentence = words.length / sentences.length
	const avgSyllablesPerWord = syllables / words.length
	
	const score = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59
	return Math.max(0, score)
}

/**
 * Extract technical terms from text
 * @param {string} text - The text to analyze
 * @returns {Array} Array of technical terms
 */
function extractTechnicalTerms(text) {
	const technicalPatterns = [
		/\b[A-Z]{2,}\b/g, // Acronyms
		/\b[a-z]+[A-Z][a-z]*\b/g, // camelCase
		/\b[A-Z][a-z]+[A-Z][a-z]+\b/g, // PascalCase
		/\b\w*[A-Z]\w*[A-Z]\w*\b/g, // Mixed case technical terms
		/\b(?:API|SDK|UI|UX|HTTP|HTTPS|JSON|XML|SQL|CSS|HTML|JS|TS|JSX|TSX|DOM|BOM|REST|GraphQL|WebSocket|OAuth|JWT|CORS|CSRF|XSS|SQLi|DoS|DDoS|MITM|SSH|SSL|TLS|FTP|SFTP|SMTP|POP|IMAP|LDAP|SAML|OIDC|RBAC|ABAC|ACL|IAM|PKI|CA|CRL|OCSP|HSTS|CSP|SRI|CORS|CSP|HSTS|SRI|CORS|CSP|HSTS|SRI)\b/g, // Common technical acronyms
	]
	
	const terms = new Set()
	technicalPatterns.forEach(pattern => {
		const matches = text.match(pattern)
		if (matches) {
			matches.forEach(match => terms.add(match.toLowerCase()))
		}
	})
	
	return Array.from(terms)
}

/**
 * Check technical term consistency
 * @param {string} text - The text to analyze
 * @returns {Object} Consistency analysis results
 */
function checkTechnicalTermConsistency(text) {
	const terms = extractTechnicalTerms(text)
	const termCounts = {}
	const termVariations = {}
	
	terms.forEach(term => {
		const variations = [
			term,
			term.toUpperCase(),
			term.toLowerCase(),
			term.charAt(0).toUpperCase() + term.slice(1).toLowerCase(),
		]
		
		variations.forEach(variation => {
			const regex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
			const matches = text.match(regex)
			if (matches) {
				termCounts[variation] = (termCounts[variation] || 0) + matches.length
				if (!termVariations[term]) {
					termVariations[term] = new Set()
				}
				termVariations[term].add(variation)
			}
		})
	})
	
	const inconsistencies = []
	Object.entries(termVariations).forEach(([term, variations]) => {
		if (variations.size > 1) {
			const variationsArray = Array.from(variations)
			inconsistencies.push({
				term,
				variations: variationsArray,
				counts: variationsArray.map(v => termCounts[v] || 0)
			})
		}
	})
	
	return {
		totalTerms: terms.length,
		uniqueTerms: Object.keys(termCounts).length,
		inconsistencies,
		consistencyScore: inconsistencies.length === 0 ? 1 : Math.max(0, 1 - (inconsistencies.length / terms.length))
	}
}

/**
 * Analyze content quality
 * @param {string} content - The content to analyze
 * @param {Object} options - Analysis options
 * @returns {Object} Quality analysis results
 */
function analyzeContentQuality(content, options = {}) {
	const {
		minReadabilityScore = 30,
		maxGradeLevel = 12,
		minConsistencyScore = 0.8,
		minWordCount = 100,
		maxWordCount = 5000,
	} = options
	
	// Basic metrics
	const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
	const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length
	const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
	
	// Readability scores
	const fleschScore = calculateFleschReadingEase(content)
	const gradeLevel = calculateFleschKincaidGradeLevel(content)
	
	// Technical term analysis
	const termConsistency = checkTechnicalTermConsistency(content)
	
	// Quality indicators
	const hasTitle = /^#\s+.+$/m.test(content)
	const hasHeadings = /^#{2,}\s+.+$/m.test(content)
	const hasLinks = /\[([^\]]+)\]\([^)]+\)/.test(content)
	const hasCodeBlocks = /```[\s\S]*?```/.test(content)
	const hasLists = /^[\s]*[-*+]\s+.+$/m.test(content)
	
	// Calculate overall quality score
	let qualityScore = 0
	
	// Structure (30%)
	if (hasTitle) qualityScore += 0.1
	if (hasHeadings) qualityScore += 0.1
	if (hasLinks) qualityScore += 0.05
	if (hasCodeBlocks) qualityScore += 0.05
	
	// Readability (25%)
	const readabilityScore = Math.min(1, fleschScore / 100)
	qualityScore += readabilityScore * 0.25
	
	// Consistency (20%)
	qualityScore += termConsistency.consistencyScore * 0.2
	
	// Length appropriateness (15%)
	const lengthScore = wordCount >= minWordCount && wordCount <= maxWordCount ? 1 : 0.5
	qualityScore += lengthScore * 0.15
	
	// Content richness (10%)
	const richnessScore = (hasCodeBlocks ? 0.3 : 0) + (hasLists ? 0.2 : 0) + (hasLinks ? 0.3 : 0) + (hasHeadings ? 0.2 : 0)
	qualityScore += Math.min(1, richnessScore) * 0.1
	
	// Issues
	const issues = []
	
	if (fleschScore < minReadabilityScore) {
		issues.push({
			type: 'warning',
			message: `Readability score (${fleschScore.toFixed(1)}) is below minimum (${minReadabilityScore})`,
			suggestion: 'Simplify language and sentence structure'
		})
	}
	
	if (gradeLevel > maxGradeLevel) {
		issues.push({
			type: 'warning',
			message: `Grade level (${gradeLevel.toFixed(1)}) exceeds maximum (${maxGradeLevel})`,
			suggestion: 'Use simpler words and shorter sentences'
		})
	}
	
	if (termConsistency.consistencyScore < minConsistencyScore) {
		issues.push({
			type: 'warning',
			message: `Technical term consistency (${(termConsistency.consistencyScore * 100).toFixed(1)}%) is below minimum (${minConsistencyScore * 100}%)`,
			suggestion: 'Standardize technical term usage throughout the document'
		})
	}
	
	if (wordCount < minWordCount) {
		issues.push({
			type: 'warning',
			message: `Content is too short (${wordCount} words, minimum ${minWordCount})`,
			suggestion: 'Add more detailed content and explanations'
		})
	}
	
	if (wordCount > maxWordCount) {
		issues.push({
			type: 'warning',
			message: `Content is too long (${wordCount} words, maximum ${maxWordCount})`,
			suggestion: 'Break content into smaller, focused sections'
		})
	}
	
	return {
		metrics: {
			wordCount,
			sentenceCount,
			paragraphCount,
			fleschScore: Math.round(fleschScore * 10) / 10,
			gradeLevel: Math.round(gradeLevel * 10) / 10,
			qualityScore: Math.round(qualityScore * 100) / 100,
		},
		technicalTerms: termConsistency,
		structure: {
			hasTitle,
			hasHeadings,
			hasLinks,
			hasCodeBlocks,
			hasLists,
		},
		issues,
		recommendations: generateRecommendations(qualityScore, issues)
	}
}

/**
 * Generate improvement recommendations
 * @param {number} qualityScore - Overall quality score
 * @param {Array} issues - List of issues
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(qualityScore, issues) {
	const recommendations = []
	
	if (qualityScore < 0.6) {
		recommendations.push('Consider a comprehensive content review and rewrite')
	}
	
	if (issues.some(i => i.type === 'warning' && i.message.includes('Readability'))) {
		recommendations.push('Improve readability by using shorter sentences and simpler words')
	}
	
	if (issues.some(i => i.type === 'warning' && i.message.includes('consistency'))) {
		recommendations.push('Standardize technical terminology throughout the document')
	}
	
	if (issues.some(i => i.type === 'warning' && i.message.includes('too short'))) {
		recommendations.push('Add more detailed explanations and examples')
	}
	
	if (issues.some(i => i.type === 'warning' && i.message.includes('too long'))) {
		recommendations.push('Break content into smaller, more focused sections')
	}
	
	return recommendations
}

/**
 * Analyze a markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {Object} options - Analysis options
 * @returns {Object} Analysis results
 */
async function analyzeMarkdownFile(filePath, options = {}) {
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		const analysis = analyzeContentQuality(content, options)
		
		return {
			file: filePath,
			...analysis,
			timestamp: new Date().toISOString()
		}
	} catch (error) {
		return {
			file: filePath,
			error: error.message,
			timestamp: new Date().toISOString()
		}
	}
}

/**
 * Analyze multiple markdown files
 * @param {Array} filePaths - Array of file paths
 * @param {Object} options - Analysis options
 * @returns {Array} Array of analysis results
 */
async function analyzeMarkdownFiles(filePaths, options = {}) {
	const results = []
	
	for (const filePath of filePaths) {
		const result = await analyzeMarkdownFile(filePath, options)
		results.push(result)
	}
	
	return results
}

export {
	analyzeContentQuality,
	analyzeMarkdownFile,
	analyzeMarkdownFiles,
	calculateFleschReadingEase,
	calculateFleschKincaidGradeLevel,
	checkTechnicalTermConsistency,
	extractTechnicalTerms
}
