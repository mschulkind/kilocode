/**
 * Remark KiloCode Comprehensive Validation Plugin
 *
 * Advanced validation plugin for comprehensive KiloCode documentation standards.
 * Extends the basic standards with additional quality checks and enforcement.
 */

import { visit } from "unist-util-visit"

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

	return (tree, file) => {
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
			hasFunFact: false,
			headings: [],
			links: [],
			sections: [],
			crossReferences: [],
			orphanedSections: [],
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
							rule: "kilocode-line-length",
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

		// Validate cross-references
		if (settings.validateCrossReferences) {
			validateCrossReferences(documentStructure, issues, file)
		}

		// Detect orphaned documents
		if (settings.detectOrphanedDocuments) {
			validateNoOrphanedDocuments(documentStructure, issues, warnings, file)
		}

		// Report issues
		issues.forEach((issue) => {
			const message = file.message(issue.message, {
				start: { line: issue.line, column: issue.column },
				end: { line: issue.line, column: issue.column + 50 },
				ruleId: issue.rule,
				severity: issue.type === "error" ? "error" : "warning",
			})

			if (issue.suggestion) {
				message.note = issue.suggestion
			}
		})

		// Report warnings
		warnings.forEach((warning) => {
			const message = file.message(warning.message, {
				start: { line: warning.line, column: warning.column },
				end: { line: warning.line, column: warning.column + 50 },
				ruleId: warning.rule,
				severity: "warning",
			})

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

	// Required sections (30%)
	if (structure.hasResearchContext) score += 0.1
	if (structure.hasNavigationFooter) score += 0.1
	if (structure.hasNoDeadEndsPolicy) score += 0.1

	// Fun fact presence (5%)
	if (structure.hasFunFact) score += 0.05

	// Link quality (20%)
	const descriptiveLinks = structure.links.filter((link) => !isNonDescriptiveLink(link.text, link.url)).length
	const linkQuality = structure.links.length > 0 ? descriptiveLinks / structure.links.length : 0.5
	score += linkQuality * 0.2

	// Content structure (20%)
	const structureScore = Math.min(metrics.headingCount / 5, 1) * 0.2
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
 * Check if a document should have a fun fact
 */
function shouldHaveFunFact(filePath) {
	const funFactPatterns = ["context/doc_automation/", "plans/", "docs/architecture/", "docs/standards/"]

	return funFactPatterns.some((pattern) => filePath.includes(pattern))
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

export default remarkKiloCodeComprehensive
