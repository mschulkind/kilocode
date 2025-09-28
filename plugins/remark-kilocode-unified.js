/**
 * Remark KiloCode Unified Validation Plugin
 *
 * Consolidated validation plugin that combines essential KiloCode documentation standards
 * with minimal complexity and maximum performance.
 *
 * This plugin replaces both remark-kilocode-standards.js and remark-kilocode-comprehensive.js
 * with a single, optimized validation system.
 */

import { visit } from "unist-util-visit"

/**
 * Unified KiloCode Standards Validation Plugin
 *
 * Essential validation including:
 * - Required sections validation (Research Context, Navigation)
 * - Fun fact presence detection (warnings only)
 * - Descriptive link text validation
 * - Heading hierarchy enforcement
 * - Basic content quality metrics
 */
function remarkKiloCodeUnified(options = {}) {
	const settings = {
		strict: false,
		requireResearchContext: true,
		requireNavigationFooter: true,
		enforceFunFacts: false, // Warning only
		enforceDescriptiveLinks: true,
		enforceHeadingHierarchy: true,
		contentQualityThreshold: 0.5, // Lowered threshold
		...options,
	}

	return (tree, file) => {
		const issues = []
		const warnings = []

		// Track document structure
		const documentStructure = {
			hasTitle: false,
			hasResearchContext: false,
			hasNavigationFooter: false,
			hasFunFact: false,
			headings: [],
			links: [],
		}

		// Visit all nodes in the AST
		visit(tree, (node, index, parent) => {
			// Track headings
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

				// Check for Research Context section
				if (node.depth === 2 && /research context|context|background/i.test(getNodeText(node))) {
					documentStructure.hasResearchContext = true
				}

				// Check for navigation footer
				if (node.depth === 2 && /navigation|links/i.test(getNodeText(node))) {
					documentStructure.hasNavigationFooter = true
				}
			}

			// Track links
			if (node.type === "link") {
				documentStructure.links.push({
					url: node.url,
					text: getNodeText(node),
					line: node.position?.start?.line || 0,
				})

				// Check for descriptive link text
				if (settings.enforceDescriptiveLinks) {
					if (!node.children || node.children.length === 0) {
						issues.push({
							type: "error",
							message: "Link has no descriptive text",
							line: node.position?.start?.line || 0,
							column: node.position?.start?.column || 0,
							rule: "kilocode-descriptive-links",
						})
					} else {
						const linkText = getNodeText(node)
						if (isNonDescriptiveLink(linkText, node.url)) {
							issues.push({
								type: "warning",
								message: `Link text "${linkText}" is not descriptive. Use meaningful text instead.`,
								line: node.position?.start?.line || 0,
								column: node.position?.start?.column || 0,
								rule: "kilocode-descriptive-links",
							})
						}
					}
				}
			}

			// Check for fun facts (warning only)
			if (node.type === "blockquote") {
				const text = getNodeText(node)
				if (/fun fact|cartography fun fact/i.test(text)) {
					documentStructure.hasFunFact = true
				}
			}
		})

		// Validate document structure
		validateDocumentStructure(documentStructure, issues, warnings, settings, file)

		// Validate heading hierarchy
		if (settings.enforceHeadingHierarchy) {
			validateHeadingHierarchy(documentStructure.headings, issues, file)
		}

		// Report issues
		issues.forEach((issue) => {
			const message = file.message(
				issue.message,
				{
					start: { line: issue.line, column: issue.column },
					end: { line: issue.line, column: issue.column + 50 },
				},
				`remark-kilocode-unified:${issue.rule}`,
			)

			// Set fatal flag based on issue type
			message.fatal = issue.type === "error"

			if (issue.suggestion) {
				message.note = issue.suggestion
			}
		})

		// Report warnings
		warnings.forEach((warning) => {
			const message = file.message(
				warning.message,
				{
					start: { line: warning.line, column: warning.column },
					end: { line: warning.line, column: warning.column + 50 },
				},
				`remark-kilocode-unified:${warning.rule}`,
			)

			// Warnings are never fatal
			message.fatal = false

			if (warning.suggestion) {
				message.note = warning.suggestion
			}
		})
	}
}

/**
 * Validate document structure against KiloCode standards
 */
function validateDocumentStructure(structure, issues, warnings, settings, file) {
	const filePath = file.path || "unknown"
	const relativePath = filePath.replace(process.cwd(), "")

	// Check for title
	if (!structure.hasTitle) {
		issues.push({
			type: "warning",
			message: "Document should have a main title (H1 heading)",
			line: 1,
			column: 1,
			rule: "kilocode-title-required",
			suggestion: "Add a main title at the beginning of the document",
		})
	}

	// Check for Research Context section
	if (settings.requireResearchContext && shouldHaveResearchContext(relativePath) && !structure.hasResearchContext) {
		issues.push({
			type: "error",
			message: "Document should have a Research Context section",
			line: 1,
			column: 1,
			rule: "kilocode-research-context-required",
			suggestion: 'Add a "## Research Context" section explaining the purpose and background',
		})
	}

	// Check for navigation footer
	if (
		settings.requireNavigationFooter &&
		shouldHaveNavigationFooter(relativePath) &&
		!structure.hasNavigationFooter
	) {
		issues.push({
			type: "warning",
			message: "Document should have a navigation footer",
			line: 1,
			column: 1,
			rule: "kilocode-navigation-footer-required",
			suggestion: "Add a navigation footer with relevant links",
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
			suggestion: "Add a fun fact related to the document topic",
		})
	}
}

/**
 * Validate heading hierarchy
 */
function validateHeadingHierarchy(headings, issues, file) {
	let expectedDepth = 1

	for (let i = 0; i < headings.length; i++) {
		const heading = headings[i]

		// Skip H1 (title)
		if (heading.depth === 1) {
			expectedDepth = 2
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

		// Update expected depth
		if (heading.depth <= expectedDepth) {
			expectedDepth = heading.depth + 1
		}
	}
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
 * Check if a document should have a fun fact
 */
function shouldHaveFunFact(filePath) {
	const funFactPatterns = ["context/doc_automation/", "plans/", "docs/architecture/", "docs/standards/"]

	return funFactPatterns.some((pattern) => filePath.includes(pattern))
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
 * Extract text content from a node
 */
function getNodeText(node) {
	if (node.value) {
		return node.value
	}

	if (node.children) {
		return node.children.map((child) => getNodeText(child)).join("")
	}

	// Handle text nodes that might not have a value property
	if (node.type === "text" && node.data && node.data.value) {
		return node.data.value
	}

	return ""
}

export default remarkKiloCodeUnified
