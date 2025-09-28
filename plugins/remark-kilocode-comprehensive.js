/**
 * Remark KiloCode Comprehensive Validation Plugin
 *
 * Advanced validation plugin for comprehensive KiloCode documentation standards.
 * Extends the basic standards with additional quality checks and enforcement.
 */

import { visit } from "unist-util-visit"
import { CrossReferenceValidator } from "../src/validation/CrossReferenceValidator.js"
import { FileIndexBuilder } from "../src/validation/FileIndexBuilder.js"
import { DocumentTypeDetector } from "../src/validation/DocumentTypeDetector.js"
import { OrphanedSectionsDetector } from "../src/validation/OrphanedSectionsDetector.js"
import { ValidationRuleConfig } from "../src/validation/ValidationRuleConfig.js"

/**
 * Comprehensive KiloCode Standards Validation Plugin
 *
 * Advanced validation including:
 * - Required sections validation (Research Context, No Dead Ends Policy, etc.)
 * - Fun fact presence detection with warnings
 * - Descriptive link text validation
 * - Heading hierarchy enforcement
 * - Content quality metrics
 * - Cross-reference validation
 * - Orphaned document detection
 */
function remarkKiloCodeComprehensive(options = {}) {
	const settings = {
		strict: true,
		requireResearchContext: true,
		requireNavigationFooter: true,
		requireNoDeadEndsPolicy: true,
		requireWhenYoureHere: true,
		enforceFunFacts: true,
		enforceDescriptiveLinks: true,
		enforceHeadingHierarchy: true,
		validateCrossReferences: true,
		detectOrphanedDocuments: true,
		contentQualityThreshold: 0.7,
		maxLineLength: 100,
		minSectionLength: 50,
		...options,
	}

	// Initialize validation components
	let validationComponents = null
	if (settings.validateCrossReferences || settings.detectOrphanedDocuments) {
		try {
			const fileIndexBuilder = new FileIndexBuilder()
			const documentTypeDetector = new DocumentTypeDetector({})
			const crossReferenceValidator = new CrossReferenceValidator()
			const orphanedSectionsDetector = new OrphanedSectionsDetector({
				documentTypeDetector,
				fileIndexBuilder,
				config: {}
			})
			const validationRuleConfig = new ValidationRuleConfig({
				documentTypeDetector
			})

			validationComponents = {
				fileIndexBuilder,
				crossReferenceValidator,
				documentTypeDetector,
				orphanedSectionsDetector,
				validationRuleConfig
			}
		} catch (error) {
			// Gracefully handle initialization errors
			console.warn('Failed to initialize validation components:', error.message)
			console.warn('Error details:', error)
		}
	}

	return async (tree, file) => {
		const issues = []
		const warnings = []
		const metrics = {
			wordCount: 0,
			linkCount: 0,
			headingCount: 0,
			sectionCount: 0,
			qualityScore: 0,
		}

		// Track document structure
		const documentStructure = {
			hasTitle: false,
			hasResearchContext: false,
			hasNavigationFooter: false,
			hasNoDeadEndsPolicy: false,
			hasWhenYoureHere: false,
			hasFunFact: false,
			headings: [],
			links: [],
			sections: [],
			crossReferences: [],
			orphanedSections: [],
		}

		// Detect document type and get validation rules
		let documentType = { type: 'general', confidence: 0.5, reasons: [] }
		let validationRules = {}
		
		if (validationComponents) {
			try {
				documentType = validationComponents.documentTypeDetector.detectType(
					file.path || '',
					'',
					''
				)
				validationRules = validationComponents.validationRuleConfig.getRulesForDocument(
					file.path || '',
					'',
					''
				)
			} catch (error) {
				console.warn('Failed to detect document type or get validation rules:', error.message)
			}
		} else {
			console.warn('Validation components not initialized, using defaults')
		}

		// Visit all nodes in the AST
		visit(tree, (node, index, parent) => {
			// Track headings and sections
			if (node.type === "heading") {
				documentStructure.headings.push({
					depth: node.depth,
					text: getNodeText(node),
					line: node.position?.start?.line || 0,
				})

				// Check for title
				if (node.depth === 1) {
					documentStructure.hasTitle = true
				}

				// Check for required sections
				const headingText = getNodeText(node)
				if (node.depth === 2) {
					if (/research context|context|background/i.test(headingText)) {
						documentStructure.hasResearchContext = true
					}
					if (/navigation|links/i.test(headingText)) {
						documentStructure.hasNavigationFooter = true
					}
					if (/no dead ends|dead ends|policy/i.test(headingText)) {
						documentStructure.hasNoDeadEndsPolicy = true
					}
					if (/when you're here|when you are here|you can/i.test(headingText)) {
						documentStructure.hasWhenYoureHere = true
					}
				}

				// Track section metrics
				metrics.headingCount++
			}

			// Track links and cross-references
			if (node.type === "link") {
				documentStructure.links.push({
					url: node.url,
					text: getNodeText(node),
					line: node.position?.start?.line || 0,
					isInternal: isInternalLink(node.url),
				})

				// Check for cross-references
				if (isInternalLink(node.url)) {
					documentStructure.crossReferences.push({
						target: node.url,
						text: getNodeText(node),
						line: node.position?.start?.line || 0,
					})
				}

				metrics.linkCount++
			}

			// Check for fun facts
			if (node.type === "blockquote") {
				const text = getNodeText(node)
				if (/fun fact|cartography fun fact/i.test(text)) {
					documentStructure.hasFunFact = true
				}
			}

			// Track content quality
			if (node.type === "paragraph" || node.type === "list") {
				const text = getNodeText(node)
				metrics.wordCount += text.split(/\s+/).length

				// Check for orphaned sections
				if (text.length > settings.minSectionLength && !hasOutgoingLinks(node)) {
					documentStructure.orphanedSections.push({
						line: node.position?.start?.line || 0,
						content: text.substring(0, 100) + "...",
					})
				}
			}

			// Check line length - DISABLED due to bug in line counting logic
			// The getNodeText(node).split("\n") approach doesn't preserve original line structure
			// and causes false positives. Line length checking should be handled by Prettier
			// or a proper line-by-line validation tool.
			/*
			if (node.position) {
				const lines = getNodeText(node).split("\n")
				lines.forEach((line, lineIndex) => {
					if (line.length > settings.maxLineLength) {
						warnings.push({
							type: "warning",
							message: `Line ${lineIndex + 1} exceeds maximum length of ${settings.maxLineLength} characters`,
							line: node.position.start.line + lineIndex,
							column: 1,
							rule: "remark-kilocode-comprehensive:kilocode-line-length",
							suggestion: `Consider breaking this line into shorter segments`,
						})
					}
				})
			}
			*/
		})

		// Calculate quality metrics
		metrics.qualityScore = calculateQualityScore(documentStructure, metrics)

		// Validate comprehensive standards
		validateComprehensiveStandards(documentStructure, issues, warnings, settings, file)

		// Validate content quality
		validateContentQuality(metrics, issues, warnings, settings, file)

		// Validate cross-references using the new validator
		if (settings.validateCrossReferences && validationComponents) {
			try {
				// Build file index if needed
				await validationComponents.fileIndexBuilder.buildIndex(process.cwd())
				
				// Validate each cross-reference
				for (const crossRef of documentStructure.crossReferences) {
					try {
						const result = await validationComponents.crossReferenceValidator.validateCrossReference(
							crossRef.target
						)
						
						if (!result.valid) {
							const message = result.error || `Cross-reference "${crossRef.target}" is invalid`
							issues.push({
								type: "error",
								message: message,
								line: crossRef.line,
								column: 1,
								rule: "kilocode-cross-reference",
								suggestion: "Verify that the referenced document exists and the link is correct"
							})
						}
					} catch (error) {
						// Handle individual validation errors gracefully
						console.warn('Failed to validate cross-reference:', error.message)
					}
				}
			} catch (error) {
				// Handle validation errors gracefully
				console.warn('Failed to validate cross-references:', error.message)
				// Fall back to basic validation
				validateCrossReferences(documentStructure, issues, file)
			}
		}

		// Detect orphaned sections using the new detector
		if (settings.detectOrphanedDocuments && validationComponents) {
			try {
				const content = getTreeText(tree)
				const result = validationComponents.orphanedSectionsDetector.detectOrphanedSections(
					file.path || '',
					content
				)
				
				if (result.orphanedSections.length > 0) {
					result.orphanedSections.forEach(section => {
						warnings.push({
							type: "warning",
							message: `Potential orphaned section: ${section.content.substring(0, 50)}...`,
							line: section.line || 1,
							column: 1,
							rule: "kilocode-orphaned-section",
							suggestion: "Consider adding links or restructuring content to improve connectivity"
						})
					})
				}
				
				// Update document structure with detected orphaned sections
				documentStructure.orphanedSections = result.orphanedSections
			} catch (error) {
				// Handle validation errors gracefully
				console.warn('Failed to detect orphaned sections:', error.message)
				// Fall back to basic validation
				validateNoOrphanedDocuments(documentStructure, issues, warnings, file)
			}
		}

		// Report issues
		issues.forEach((issue) => {
			const message = file.message(issue.message, {
				start: { line: issue.line, column: issue.column },
				end: { line: issue.line, column: issue.column + 50 },
			}, `remark-kilocode-comprehensive:${issue.rule}`)

			// Set fatal flag based on issue type
			message.fatal = issue.type === "error"

			if (issue.suggestion) {
				message.note = issue.suggestion
			}
		})

		// Report warnings
		warnings.forEach((warning) => {
			const message = file.message(warning.message, {
				start: { line: warning.line, column: warning.column },
				end: { line: warning.line, column: warning.column + 50 },
			}, `remark-kilocode-comprehensive:${warning.rule}`)

			// Warnings are never fatal
			message.fatal = false

			if (warning.suggestion) {
				message.note = warning.suggestion
			}
		})

		// Add quality metrics to file data
		if (file.data) {
			file.data.kilocodeMetrics = metrics
			file.data.kilocodeStructure = documentStructure
		}
	}
}

/**
 * Validate comprehensive standards
 */
function validateComprehensiveStandards(structure, issues, warnings, settings, file) {
	const filePath = file.path || "unknown"
	const relativePath = filePath.replace(process.cwd(), "")

	// Check for title
	if (!structure.hasTitle) {
		issues.push({
			type: "error",
			message: "Document must have a main title (H1 heading)",
			line: 1,
			column: 1,
			rule: "kilocode-title-required",
			suggestion: "Add a descriptive main title at the beginning of the document",
		})
	}

	// Check for Research Context section
	if (settings.requireResearchContext && shouldHaveResearchContext(relativePath) && !structure.hasResearchContext) {
		issues.push({
			type: "error",
			message: "Document must have a Research Context section",
			line: 1,
			column: 1,
			rule: "kilocode-research-context-required",
			suggestion: 'Add a "## Research Context" section explaining the purpose, background, and methodology',
		})
	}

	// Check for navigation footer
	if (
		settings.requireNavigationFooter &&
		shouldHaveNavigationFooter(relativePath) &&
		!structure.hasNavigationFooter
	) {
		issues.push({
			type: "error",
			message: "Document must have a navigation footer",
			line: 1,
			column: 1,
			rule: "kilocode-navigation-footer-required",
			suggestion: "Add a navigation footer with relevant links and breadcrumbs",
		})
	}

	// Validate navigation patterns
	validateNavigationPatterns(structure, issues, warnings, settings, file)

	// Validate section organization
	validateSectionOrganization(structure, issues, warnings, settings, file)

	// Check for No Dead Ends Policy
	if (
		settings.requireNoDeadEndsPolicy &&
		shouldHaveNoDeadEndsPolicy(relativePath) &&
		!structure.hasNoDeadEndsPolicy
	) {
		issues.push({
			type: "error",
			message: "Document must include No Dead Ends Policy",
			line: 1,
			column: 1,
			rule: "kilocode-no-dead-ends-required",
			suggestion: "Add a section explaining how this document connects to others and provides value",
		})
	}

	// Check for When You're Here section
	if (
		settings.requireWhenYoureHere &&
		shouldHaveWhenYoureHere(relativePath) &&
		!structure.hasWhenYoureHere
	) {
		issues.push({
			type: "error",
			message: "Document must include When You're Here section",
			line: 1,
			column: 1,
			rule: "kilocode-when-youre-here-required",
			suggestion: "Add a section explaining what users can do when they reach this document",
		})
	}

	// Check for fun facts (warning only)
	if (settings.enforceFunFacts && shouldHaveFunFact(relativePath) && !structure.hasFunFact) {
		warnings.push({
			type: "warning",
			message: "Consider adding a fun fact to make the document more engaging",
			line: 1,
			column: 1,
			rule: "kilocode-fun-fact-suggestion",
			suggestion: "Add a fun fact related to the document topic to improve engagement",
		})
	}

	// Validate heading hierarchy
	if (settings.enforceHeadingHierarchy) {
		validateAdvancedHeadingHierarchy(structure.headings, issues, file)
	}
}

/**
 * Validate content quality metrics
 */
function validateContentQuality(metrics, issues, warnings, settings, file) {
	// Check minimum content length
	if (metrics.wordCount < 100) {
		warnings.push({
			type: "warning",
			message: `Document is quite short (${metrics.wordCount} words). Consider adding more detail.`,
			line: 1,
			column: 1,
			rule: "kilocode-content-length",
			suggestion: "Expand the document with more comprehensive information",
		})
	}

	// Check link density
	const linkDensity = metrics.linkCount / Math.max(metrics.wordCount / 100, 1)
	if (linkDensity < 0.5) {
		warnings.push({
			type: "warning",
			message: "Document has low link density. Consider adding more references.",
			line: 1,
			column: 1,
			rule: "kilocode-link-density",
			suggestion: "Add links to related documents, external resources, or references",
		})
	} else if (linkDensity > 5) {
		warnings.push({
			type: "warning",
			message: "Document has high link density. Consider reducing links or expanding content.",
			line: 1,
			column: 1,
			rule: "kilocode-link-density",
			suggestion: "Reduce the number of links or expand the content to improve balance",
		})
	}

	// Check heading structure
	if (metrics.headingCount < 2) {
		warnings.push({
			type: "warning",
			message: "Document has few headings. Consider adding more structure.",
			line: 1,
			column: 1,
			rule: "kilocode-heading-structure",
			suggestion: "Add more headings to improve document structure and readability",
		})
	}

	// Check overall quality score
	if (metrics.qualityScore < settings.contentQualityThreshold) {
		issues.push({
			type: "error",
			message: `Document quality score (${metrics.qualityScore.toFixed(2)}) is below threshold (${settings.contentQualityThreshold})`,
			line: 1,
			column: 1,
			rule: "kilocode-quality-threshold",
			suggestion: "Improve document quality by addressing the issues identified above",
		})
	}
}

/**
 * Validate cross-references
 */
function validateCrossReferences(structure, issues, file) {
	const filePath = file.path || "unknown"
	const relativePath = filePath.replace(process.cwd(), "")

	// Check for broken cross-references
	structure.crossReferences.forEach((ref) => {
		// This would need to be implemented with actual file system checking
		// For now, we'll just validate the format
		if (!isValidInternalReference(ref.target)) {
			issues.push({
				type: "warning",
				message: `Cross-reference "${ref.target}" may be invalid`,
				line: ref.line,
				column: 1,
				rule: "kilocode-cross-reference",
				suggestion: "Verify that the referenced document exists and the link is correct",
			})
		}
	})
}

/**
 * Validate no orphaned documents
 */
function validateNoOrphanedDocuments(structure, issues, warnings, file) {
	if (structure.orphanedSections.length > 0 && structure.links.length === 0) {
		issues.push({
			type: "error",
			message: "Document appears to be orphaned with no outgoing links",
			line: 1,
			column: 1,
			rule: "kilocode-orphaned-document",
			suggestion: "Add links to related documents or external resources to prevent dead ends",
		})
	}

	// Warn about sections that might be orphaned
	if (structure.orphanedSections.length > 2) {
		warnings.push({
			type: "warning",
			message: `Document has ${structure.orphanedSections.length} sections that might be orphaned`,
			line: 1,
			column: 1,
			rule: "kilocode-orphaned-sections",
			suggestion: "Consider adding links or restructuring content to improve connectivity",
		})
	}
}

/**
 * Validate advanced heading hierarchy
 */
function validateAdvancedHeadingHierarchy(headings, issues, file) {
	let expectedDepth = 1
	let previousDepth = 1

	for (let i = 0; i < headings.length; i++) {
		const heading = headings[i]

		// Skip H1 (title)
		if (heading.depth === 1) {
			expectedDepth = 2
			previousDepth = 1
			continue
		}

		// Check for skipped levels
		if (heading.depth > expectedDepth + 1) {
			issues.push({
				type: "error",
				message: `Heading level ${heading.depth} skips level ${expectedDepth + 1}. Use proper heading hierarchy.`,
				line: heading.line,
				column: 1,
				rule: "kilocode-heading-hierarchy",
				suggestion: `Change to H${expectedDepth + 1} or add intermediate headings`,
			})
		}

		// Check for heading depth consistency
		if (i > 0 && heading.depth > previousDepth + 1) {
			issues.push({
				type: "warning",
				message: `Heading depth increased too quickly from H${previousDepth} to H${heading.depth}`,
				line: heading.line,
				column: 1,
				rule: "kilocode-heading-progression",
				suggestion: "Consider a more gradual progression in heading levels",
			})
		}

		// Update expected depth
		if (heading.depth <= expectedDepth) {
			expectedDepth = heading.depth + 1
		}
		previousDepth = heading.depth
	}
}

/**
 * Calculate content quality score
 */
function calculateQualityScore(structure, metrics) {
	let score = 0

	// Title presence (10%)
	if (structure.hasTitle) score += 0.1

	// Required sections (40%)
	if (structure.hasResearchContext) score += 0.1
	if (structure.hasNavigationFooter) score += 0.1
	if (structure.hasNoDeadEndsPolicy) score += 0.1
	if (structure.hasWhenYoureHere) score += 0.1

	// Fun fact presence (5%)
	if (structure.hasFunFact) score += 0.05

	// Link quality (15%)
	const descriptiveLinks = structure.links.filter((link) => !isNonDescriptiveLink(link.text, link.url)).length
	const linkQuality = structure.links.length > 0 ? descriptiveLinks / structure.links.length : 0.5
	score += linkQuality * 0.15

	// Content structure (15%)
	const structureScore = Math.min(metrics.headingCount / 5, 1) * 0.15
	score += structureScore

	// Connectivity (15%)
	const connectivityScore = Math.min(structure.links.length / 3, 1) * 0.15
	score += connectivityScore

	return Math.min(score, 1)
}

/**
 * Check if a link is internal
 */
function isInternalLink(url) {
	return !url.startsWith("http") && !url.startsWith("mailto:") && !url.startsWith("#")
}

/**
 * Check if an internal reference is valid
 */
function isValidInternalReference(target) {
	// Basic validation - would need file system checking for full validation
	return target && !target.includes("..") && target.length > 0
}

/**
 * Check if link text is non-descriptive
 */
function isNonDescriptiveLink(text, url) {
	const nonDescriptivePatterns = [
		/^(click here|here|link|more|read more|see more|continue|next|previous)$/i,
		/^(this|that|it)$/i,
		/^(page|document|file|article)$/i,
		/^\d+$/,
		/^[a-z]+\.(com|org|net|io)$/i,
	]

	// If link text is the same as URL, it's not descriptive
	if (text === url || text === url.replace(/^https?:\/\//, "")) {
		return true
	}

	// Check against non-descriptive patterns
	return nonDescriptivePatterns.some((pattern) => pattern.test(text))
}

/**
 * Check if a node has outgoing links
 */
function hasOutgoingLinks(node) {
	let hasLinks = false

	visit(node, "link", () => {
		hasLinks = true
		return false // Stop visiting
	})

	return hasLinks
}

/**
 * Check if a document should have a research context section
 */
function shouldHaveResearchContext(filePath) {
	const contextPatterns = ["context/", "plans/", "docs/architecture/", "docs/standards/", "docs/improvements/"]

	return contextPatterns.some((pattern) => filePath.includes(pattern))
}

/**
 * Check if a document should have a navigation footer
 */
function shouldHaveNavigationFooter(filePath) {
	const excludePatterns = ["README.md", "CHANGELOG.md", "LICENSE", "CONTRIBUTING.md", "node_modules/", ".git/"]

	return !excludePatterns.some((pattern) => filePath.includes(pattern))
}

/**
 * Check if a document should have a No Dead Ends Policy
 */
function shouldHaveNoDeadEndsPolicy(filePath) {
	const policyPatterns = ["context/", "plans/", "docs/architecture/", "docs/standards/"]

	return policyPatterns.some((pattern) => filePath.includes(pattern))
}

/**
 * Check if a document should have a When You're Here section
 */
function shouldHaveWhenYoureHere(filePath) {
	const whenYoureHerePatterns = ["context/", "plans/", "docs/architecture/", "docs/standards/", "docs/tools/"]

	return whenYoureHerePatterns.some((pattern) => filePath.includes(pattern))
}

/**
 * Check if a document should have a fun fact
 */
function shouldHaveFunFact(filePath) {
	const funFactPatterns = ["context/doc_automation/", "plans/", "docs/architecture/", "docs/standards/"]

	return funFactPatterns.some((pattern) => filePath.includes(pattern))
}

/**
 * Validate navigation patterns
 */
function validateNavigationPatterns(structure, issues, warnings, settings, file) {
	const filePath = file.path || "unknown"
	const relativePath = filePath.replace(process.cwd(), "")

	// Check for breadcrumb navigation
	if (structure.hasNavigationFooter) {
		validateBreadcrumbNavigation(structure, issues, file)
	}

	// Check for table of contents integration
	validateTableOfContentsIntegration(structure, issues, warnings, file)

	// Check for cross-reference navigation patterns
	validateCrossReferenceNavigation(structure, issues, file)

	// Check for navigation consistency
	validateNavigationConsistency(structure, issues, warnings, file)
}

/**
 * Validate breadcrumb navigation
 */
function validateBreadcrumbNavigation(structure, issues, file) {
	const navigationLinks = structure.links.filter(link => 
		link.text.includes('←') || link.text.includes('→') || link.text.includes('Back to') || link.text.includes('Next:')
	)

	if (navigationLinks.length === 0) {
		issues.push({
			type: "warning",
			message: "Navigation footer should include breadcrumb-style navigation links",
			line: 1,
			column: 1,
			rule: "kilocode-breadcrumb-navigation",
			suggestion: "Add breadcrumb navigation with back/forward links using ← and → symbols",
		})
	}

	// Check for proper breadcrumb format
	const hasBackLink = navigationLinks.some(link => link.text.includes('←') || link.text.includes('Back to'))
	const hasForwardLink = navigationLinks.some(link => link.text.includes('→') || link.text.includes('Next:'))

	if (!hasBackLink) {
		warnings.push({
			type: "warning",
			message: "Navigation footer should include back navigation links",
			line: 1,
			column: 1,
			rule: "kilocode-back-navigation",
			suggestion: "Add back navigation links using '← Back to [Section]' format",
		})
	}
}

/**
 * Validate table of contents integration
 */
function validateTableOfContentsIntegration(structure, issues, warnings, file) {
	const hasTableOfContents = structure.headings.some(heading => 
		heading.text.toLowerCase().includes('table of contents') || 
		heading.text.toLowerCase().includes('contents')
	)

	const headingCount = structure.headings.length
	const shouldHaveTOC = headingCount >= 3

	if (shouldHaveTOC && !hasTableOfContents) {
		warnings.push({
			type: "warning",
			message: "Document with multiple headings should have a Table of Contents",
			line: 1,
			column: 1,
			rule: "kilocode-table-of-contents",
			suggestion: "Add a Table of Contents section with links to all major headings",
		})
	}

	// Check if TOC links match actual headings
	if (hasTableOfContents) {
		validateTableOfContentsLinks(structure, issues, file)
	}
}

/**
 * Validate table of contents links
 */
function validateTableOfContentsLinks(structure, issues, file) {
	const tocLinks = structure.links.filter(link => link.url.startsWith('#'))
	const headingIds = structure.headings.map(heading => 
		heading.text.toLowerCase()
			.replace(/[^\w\s]/g, '')
			.replace(/\s+/g, '-')
	)

	for (const link of tocLinks) {
		const targetId = link.url.substring(1)
		if (!headingIds.includes(targetId)) {
			issues.push({
				type: "error",
				message: `Table of Contents link "${link.url}" does not match any heading`,
				line: link.line,
				column: 1,
				rule: "kilocode-toc-link-mismatch",
				suggestion: "Update the link to match an existing heading or add the missing heading",
			})
		}
	}
}

/**
 * Validate cross-reference navigation patterns
 */
function validateCrossReferenceNavigation(structure, issues, file) {
	const crossRefLinks = structure.crossReferences
	const hasInternalLinks = crossRefLinks.length > 0

	if (!hasInternalLinks && structure.hasNoDeadEndsPolicy) {
		warnings.push({
			type: "warning",
			message: "No Dead Ends Policy section should include connecting links",
			line: 1,
			column: 1,
			rule: "kilocode-no-dead-ends-links",
			suggestion: "Add links to related documents in the No Dead Ends Policy section",
		})
	}

	// Check for descriptive link text in cross-references
	for (const link of crossRefLinks) {
		if (isNonDescriptiveLink(link.text, link.target)) {
			issues.push({
				type: "error",
				message: `Cross-reference "${link.text}" is not descriptive`,
				line: link.line,
				column: 1,
				rule: "kilocode-non-descriptive-crossref",
				suggestion: "Use descriptive text that explains what the linked document contains",
			})
		}
	}
}

/**
 * Validate navigation consistency
 */
function validateNavigationConsistency(structure, issues, warnings, file) {
	const navigationLinks = structure.links.filter(link => 
		link.text.includes('←') || link.text.includes('→') || 
		link.text.includes('Back to') || link.text.includes('Next:') ||
		link.text.includes('Table of Contents')
	)

	// Check for consistent navigation format
	const hasConsistentFormat = navigationLinks.every(link => {
		const text = link.text
		return text.includes('←') || text.includes('→') || text.includes('📚') || text.includes('↑')
	})

	if (navigationLinks.length > 0 && !hasConsistentFormat) {
		warnings.push({
			type: "warning",
			message: "Navigation links should use consistent formatting",
			line: 1,
			column: 1,
			rule: "kilocode-navigation-consistency",
			suggestion: "Use consistent symbols (←, →, 📚, ↑) for navigation links",
		})
	}

	// Check for required navigation elements
	const hasGlossaryLink = navigationLinks.some(link => 
		link.text.includes('📚') && link.text.toLowerCase().includes('glossary')
	)
	const hasTOCLink = navigationLinks.some(link => 
		link.text.includes('↑') && link.text.toLowerCase().includes('table of contents')
	)

	if (!hasGlossaryLink) {
		warnings.push({
			type: "warning",
			message: "Navigation should include a link to the Technical Glossary",
			line: 1,
			column: 1,
			rule: "kilocode-glossary-link",
			suggestion: "Add a link to the Technical Glossary using 📚 Technical Glossary format",
		})
	}

	if (structure.headings.length >= 3 && !hasTOCLink) {
		warnings.push({
			type: "warning",
			message: "Navigation should include a link back to Table of Contents",
			line: 1,
			column: 1,
			rule: "kilocode-toc-navigation-link",
			suggestion: "Add a link back to Table of Contents using ↑ Table of Contents format",
		})
	}
}

/**
 * Validate section organization
 */
function validateSectionOrganization(structure, issues, warnings, settings, file) {
	const filePath = file.path || "unknown"
	const relativePath = filePath.replace(process.cwd(), "")

	// Validate heading hierarchy
	validateHeadingHierarchy(structure.headings, issues, warnings, file)

	// Validate section lengths
	validateSectionLengths(structure, issues, warnings, file)

	// Validate section naming consistency
	validateSectionNaming(structure.headings, issues, warnings, file)

	// Validate required sections for document type
	validateRequiredSections(structure, issues, warnings, file, relativePath)
}

/**
 * Validate heading hierarchy
 */
function validateHeadingHierarchy(headings, issues, warnings, file) {
	let expectedDepth = 1
	let previousDepth = 1

	for (let i = 0; i < headings.length; i++) {
		const heading = headings[i]

		// Skip H1 (title)
		if (heading.depth === 1) {
			expectedDepth = 2
			previousDepth = 1
			continue
		}

		// Check for skipped levels
		if (heading.depth > expectedDepth + 1) {
			issues.push({
				type: "error",
				message: `Heading level ${heading.depth} skips level ${expectedDepth + 1}. Use proper heading hierarchy.`,
				line: heading.line,
				column: 1,
				rule: "kilocode-heading-hierarchy",
				suggestion: `Change to H${expectedDepth + 1} or add intermediate headings`,
			})
		}

		// Check for heading depth consistency
		if (i > 0 && heading.depth > previousDepth + 1) {
			warnings.push({
				type: "warning",
				message: `Heading depth increased too quickly from H${previousDepth} to H${heading.depth}`,
				line: heading.line,
				column: 1,
				rule: "kilocode-heading-progression",
				suggestion: "Consider a more gradual progression in heading levels",
			})
		}

		// Update expected depth
		if (heading.depth <= expectedDepth) {
			expectedDepth = heading.depth + 1
		}
		previousDepth = heading.depth
	}
}

/**
 * Validate section lengths
 */
function validateSectionLengths(structure, issues, warnings, file) {
	const minLengths = { h2: 50, h3: 30, h4: 20, h5: 15, h6: 10 }
	const maxLengths = { h2: 2000, h3: 1000, h4: 500, h5: 300, h6: 200 }

	for (const heading of structure.headings) {
		if (heading.depth === 1) continue // Skip title

		const headingLevel = `h${heading.depth}`
		const minLength = minLengths[headingLevel] || 10
		const maxLength = maxLengths[headingLevel] || 200

		// Estimate section length (this is a simplified approach)
		const estimatedLength = heading.text.length * 10 // Rough estimate

		if (estimatedLength < minLength) {
			warnings.push({
				type: "warning",
				message: `Section "${heading.text}" appears too short (estimated ${estimatedLength} words, minimum ${minLength})`,
				line: heading.line,
				column: 1,
				rule: "kilocode-section-length",
				suggestion: "Consider expanding this section or combining it with related content",
			})
		}

		if (estimatedLength > maxLength) {
			warnings.push({
				type: "warning",
				message: `Section "${heading.text}" appears too long (estimated ${estimatedLength} words, maximum ${maxLength})`,
				line: heading.line,
				column: 1,
				rule: "kilocode-section-length",
				suggestion: "Consider breaking this section into multiple subsections",
			})
		}
	}
}

/**
 * Validate section naming consistency
 */
function validateSectionNaming(headings, issues, warnings, file) {
	const sectionNames = headings.map(h => h.text.toLowerCase())
	
	// Check for duplicate section names
	const duplicates = sectionNames.filter((name, index) => 
		sectionNames.indexOf(name) !== index
	)
	
	if (duplicates.length > 0) {
		warnings.push({
			type: "warning",
			message: `Duplicate section names found: ${[...new Set(duplicates)].join(', ')}`,
			line: 1,
			column: 1,
			rule: "kilocode-duplicate-sections",
			suggestion: "Use unique, descriptive names for each section",
		})
	}

	// Check for non-descriptive section names
	const nonDescriptivePatterns = [
		/^(section|part|chapter|step)\s*\d*$/i,
		/^(intro|conclusion|summary)$/i,
		/^(more|other|additional)$/i
	]

	for (const heading of headings) {
		if (heading.depth === 1) continue // Skip title

		for (const pattern of nonDescriptivePatterns) {
			if (pattern.test(heading.text)) {
				warnings.push({
					type: "warning",
					message: `Section "${heading.text}" has a non-descriptive name`,
					line: heading.line,
					column: 1,
					rule: "kilocode-section-naming",
					suggestion: "Use a more descriptive name that clearly indicates the section content",
				})
				break
			}
		}
	}
}

/**
 * Validate required sections for document type
 */
function validateRequiredSections(structure, issues, warnings, file, relativePath) {
	// Determine document type
	let documentType = 'general'
	if (relativePath.includes('context/') || relativePath.includes('plans/')) {
		documentType = 'planning'
	} else if (relativePath.includes('architecture/') || relativePath.includes('api/')) {
		documentType = 'technical'
	} else if (relativePath.includes('README') || relativePath.includes('getting-started')) {
		documentType = 'navigation'
	}

	// Define required sections for each document type
	const requiredSections = {
		navigation: ['When You\'re Here', 'Research Context', 'No Dead Ends Policy', 'Navigation'],
		technical: ['When You\'re Here', 'Research Context', 'No Dead Ends Policy', 'Navigation'],
		planning: ['When You\'re Here', 'Research Context', 'Progress Summary', 'Success Criteria', 'No Dead Ends Policy', 'Navigation'],
		general: ['When You\'re Here', 'Research Context', 'No Dead Ends Policy', 'Navigation']
	}

	const documentRequiredSections = requiredSections[documentType] || requiredSections.general
	const existingSections = structure.headings.map(h => h.text)

	for (const requiredSection of documentRequiredSections) {
		const hasSection = existingSections.some(section => 
			section.toLowerCase().includes(requiredSection.toLowerCase())
		)

		if (!hasSection) {
			issues.push({
				type: "error",
				message: `Document must include "${requiredSection}" section`,
				line: 1,
				column: 1,
				rule: "kilocode-required-section",
				suggestion: `Add a "${requiredSection}" section following the document template`,
			})
		}
	}
}

/**
 * Extract text content from a node
 */
function getNodeText(node) {
	if (node.value) {
		return node.value
	}

	if (node.children) {
		return node.children.map((child) => getNodeText(child)).join("")
	}

	return ""
}

/**
 * Extract text content from the entire tree
 */
function getTreeText(tree) {
	return getNodeText(tree)
}

export default remarkKiloCodeComprehensive
