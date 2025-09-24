/**
 * Custom remark-lint plugin for KiloCode navigation footer validation
 *
 * This plugin checks that documents have proper navigation footers
 * based on KiloCode documentation standards.
 */

import { visit } from "unist-util-visit"

/**
 * Remark plugin for validating navigation footers
 */
function remarkLintKilocodeNavigation() {
	return (tree, file) => {
		// Get file path from the file object
		const filePath = file.path || file.filename || ""

		// Skip validation for certain files
		if (shouldSkipFile(filePath)) {
			return
		}

		// Check if document has navigation footer
		const hasNavigation = hasNavigationFooter(tree)

		if (!hasNavigation) {
			file.message("Document should have a navigation footer for better discoverability", {
				ruleId: "kilocode-navigation-footer",
				source: "remark-lint-kilocode-navigation",
			})
		} else {
			// Validate navigation footer structure if it exists
			validateNavigationStructure(tree, file)
		}
	}
}

/**
 * Check if file should be skipped for navigation validation
 */
function shouldSkipFile(filePath) {
	// Skip README files, index files, and certain special documents
	const skipPatterns = [
		/README\.md$/i,
		/index\.md$/i,
		/GLOSSARY\.md$/i,
		/CONTRIBUTING\.md$/i,
		/LICENSE\.md$/i,
		/CHANGELOG\.md$/i,
	]

	return skipPatterns.some((pattern) => pattern.test(filePath))
}

/**
 * Check if document has a navigation footer
 */
function hasNavigationFooter(tree) {
	let hasNavigationSection = false
	let hasNavigationLinks = false

	visit(tree, "heading", (node) => {
		if (node.depth === 2 && getTextContent(node).toLowerCase().includes("navigation")) {
			hasNavigationSection = true
		}
	})

	if (hasNavigationSection) {
		visit(tree, "link", (node) => {
			const linkText = getTextContent(node)
			if (linkText.includes("←") || linkText.includes("→") || linkText.includes("↑")) {
				hasNavigationLinks = true
			}
		})
	}

	return hasNavigationSection && hasNavigationLinks
}

/**
 * Validate navigation footer structure
 */
function validateNavigationStructure(tree, file) {
	let inNavigationSection = false
	let navigationLinks = []

	visit(tree, "heading", (node) => {
		if (node.depth === 2 && getTextContent(node).toLowerCase().includes("navigation")) {
			inNavigationSection = true
			return
		}
		if (inNavigationSection && node.depth <= 2) {
			inNavigationSection = false
		}
	})

	if (inNavigationSection) {
		visit(tree, "link", (node) => {
			if (inNavigationSection) {
				const linkText = getTextContent(node)
				const linkUrl = node.url || ""

				// Check for proper navigation link format
				if (!linkText.includes("←") && !linkText.includes("→") && !linkText.includes("↑")) {
					file.message("Navigation links should use arrows (←, →, ↑) for better UX", {
						ruleId: "kilocode-navigation-arrow",
						source: "remark-lint-kilocode-navigation",
					})
				}

				// Check for descriptive link text
				if (linkText.length < 3) {
					file.message("Navigation links should have descriptive text", {
						ruleId: "kilocode-navigation-descriptive",
						source: "remark-lint-kilocode-navigation",
					})
				}

				navigationLinks.push({ text: linkText, url: linkUrl })
			}
		})
	}

	// Validate minimum navigation links
	if (navigationLinks.length < 1) {
		file.message("Navigation footer should have at least one navigation link", {
			ruleId: "kilocode-navigation-minimum",
			source: "remark-lint-kilocode-navigation",
		})
	}
}

/**
 * Extract text content from a node and its children
 */
function getTextContent(node) {
	if (node.type === "text") {
		return node.value
	}

	if (node.children) {
		return node.children.map((child) => getTextContent(child)).join("")
	}

	return ""
}

export default remarkLintKilocodeNavigation
