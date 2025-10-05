/**
 * OrphanedSectionsDetector Test Suite
 *
 * Tests for the context-aware orphaned sections detection system that identifies
 * truly orphaned content while avoiding false positives for navigation documents.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { OrphanedSectionsDetector, OrphanedSection, DetectionConfig } from "../OrphanedSectionsDetector"
import { DocumentTypeDetector } from "../DocumentTypeDetector"
import { FileIndexBuilder } from "../FileIndexBuilder"

// Mock dependencies
vi.mock("../DocumentTypeDetector")
vi.mock("../FileIndexBuilder")

describe("OrphanedSectionsDetector", () => {
	let detector: OrphanedSectionsDetector
	let mockDocumentTypeDetector: any
	let mockFileIndexBuilder: any

	beforeEach(() => {
		mockDocumentTypeDetector = {
			detectType: vi.fn(),
			getTypeInfo: vi.fn(),
		}

		mockFileIndexBuilder = {
			findFile: vi.fn(),
			findFilesByPattern: vi.fn(),
		}

		detector = new OrphanedSectionsDetector({
			documentTypeDetector: mockDocumentTypeDetector,
			fileIndexBuilder: mockFileIndexBuilder,
		})
	})

	describe("constructor", () => {
		it("should initialize with default configuration", () => {
			expect(detector.getConfig()).toBeDefined()
			expect(detector.getConfig().minSectionLength).toBe(50)
			expect(detector.getConfig().maxOrphanedSections).toBe(5)
		})

		it("should allow custom configuration", () => {
			const customConfig: DetectionConfig = {
				minSectionLength: 100,
				maxOrphanedSections: 10,
				ignoreNavigationDocuments: true,
				ignorePlanningDocuments: false,
				contextWindowSize: 3,
			}

			const customDetector = new OrphanedSectionsDetector({
				documentTypeDetector: mockDocumentTypeDetector,
				fileIndexBuilder: mockFileIndexBuilder,
				config: customConfig,
			})

			expect(customDetector.getConfig()).toEqual(customConfig)
		})
	})

	describe("detectOrphanedSections", () => {
		it("should detect truly orphaned sections", () => {
			const content = `
# Main Document

## Section 1
This is a well-connected section that is referenced elsewhere.

## Orphaned Section
This section appears to be orphaned with no references to it anywhere in the documentation.

## Section 3
Another connected section.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["content-pattern"],
			})

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([])

			const result = detector.detectOrphanedSections("/docs/test.md", content)

			expect(result.orphanedSections).toHaveLength(2)
			expect(result.orphanedSections.map((s) => s.title)).toContain("Orphaned Section")
			expect(result.orphanedSections[0].confidence).toBeGreaterThanOrEqual(0.5)
		})

		it("should not flag navigation documents", () => {
			const content = `
# Getting Started

## Installation
Follow these steps to install.

## Configuration
Set up your configuration.

## Usage
Learn how to use the application.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "navigation",
				confidence: 0.9,
				reasons: ["path-pattern", "content-pattern"],
			})

			const result = detector.detectOrphanedSections("/docs/README.md", content)

			expect(result.orphanedSections).toHaveLength(0)
			expect(result.reason).toContain("navigation document")
		})

		it("should not flag planning documents when configured", () => {
			const content = `
# Project Plan

## Timeline
Week 1: Planning
Week 2: Implementation

## Resources
Team members and budget.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "planning",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const result = detector.detectOrphanedSections("/docs/plan.md", content)

			expect(result.orphanedSections).toHaveLength(0)
		})

		it("should consider document connectivity", () => {
			const content = `
# Technical Reference

## API Overview
Overview of the API.

## Authentication
How to authenticate.

## Endpoints
Available endpoints.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "technical",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([
				{ path: "/docs/api-guide.md" },
				{ path: "/docs/auth-guide.md" },
			])

			const result = detector.detectOrphanedSections("/docs/reference.md", content)

			// Should have fewer orphaned sections due to connectivity
			expect(result.orphanedSections.length).toBeLessThan(3)
		})

		it("should handle sections with minimum length requirement", () => {
			const content = `
# Document

## Short
Too short.

## Long Section
This is a much longer section that meets the minimum length requirement and should be considered for orphaned detection.

## Another Short One
Also too short.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["content-pattern"],
			})

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([])

			const result = detector.detectOrphanedSections("/docs/test.md", content)

			expect(result.orphanedSections).toHaveLength(1)
			expect(result.orphanedSections[0].title).toBe("Long Section")
		})

		it("should respect maximum orphaned sections limit", () => {
			const content = `
# Document

## Section 1
This is an orphaned section with no references.

## Section 2
Another orphaned section.

## Section 3
Yet another orphaned section.

## Section 4
Still another orphaned section.

## Section 5
Another orphaned section.

## Section 6
This should be ignored due to limit.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["content-pattern"],
			})

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([])

			const result = detector.detectOrphanedSections("/docs/test.md", content)

			expect(result.orphanedSections.length).toBeLessThanOrEqual(5)
		})

		it("should provide confidence scores", () => {
			const content = `
# Document

## Definitely Orphaned
This section has no references anywhere and is clearly orphaned.

## Maybe Orphaned
This section might be orphaned but it's less clear.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["content-pattern"],
			})

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([])

			const result = detector.detectOrphanedSections("/docs/test.md", content)

			expect(result.orphanedSections).toHaveLength(2)
			expect(result.orphanedSections[0].confidence).toBeGreaterThanOrEqual(result.orphanedSections[1].confidence)
		})

		it("should handle empty content gracefully", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const result = detector.detectOrphanedSections("/docs/empty.md", "")

			expect(result.orphanedSections).toHaveLength(0)
			expect(result.totalSections).toBe(0)
		})

		it("should handle malformed markdown", () => {
			const content = `
# Document

## Unclosed heading
Content without proper structure

### Another heading
More content

## Missing closing
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const result = detector.detectOrphanedSections("/docs/malformed.md", content)

			expect(result.orphanedSections).toHaveLength(0)
			expect(result.errors).toHaveLength(1)
		})
	})

	describe("analyzeSection", () => {
		it("should analyze individual sections", () => {
			const sectionContent = `
## API Reference
This section provides detailed API documentation.
      `

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([])

			const result = detector.analyzeSection("/docs/test.md", "API Reference", sectionContent, 2)

			expect(result.title).toBe("API Reference")
			expect(result.level).toBe(2)
			expect(result.length).toBeGreaterThan(0)
			expect(result.confidence).toBeGreaterThanOrEqual(0)
		})

		it("should detect references in section content", () => {
			const sectionContent = `
## Getting Started
This section is referenced in the README and other documents.
See also: [Installation Guide](./installation.md)
      `

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([
				{ path: "/docs/README.md" },
				{ path: "/docs/installation.md" },
			])

			const result = detector.analyzeSection("/docs/test.md", "Getting Started", sectionContent, 2)

			expect(result.referenceCount).toBeGreaterThan(0)
			expect(result.confidence).toBeLessThan(0.5) // Lower confidence due to references
		})

		it("should handle sections with code blocks", () => {
			const sectionContent = `
## Code Example
Here's some code:

\`\`\`javascript
function example() {
  return 'hello';
}
\`\`\`

This code demonstrates the concept.
      `

			mockFileIndexBuilder.findFilesByPattern.mockReturnValue([])

			const result = detector.analyzeSection("/docs/test.md", "Code Example", sectionContent, 2)

			expect(result.hasCodeBlocks).toBe(true)
			expect(result.length).toBeGreaterThan(0)
		})
	})

	describe("detectReferences", () => {
		it("should detect cross-references", () => {
			const content = `
## Section 1
This section references [Section 2](#section-2).

## Section 2
This is the referenced section.
      `

			const references = detector.detectReferences("/docs/test.md", content)

			expect(references).toHaveLength(2)
			expect(references[0].target).toBe("#section-2")
			expect(references.map((r) => r.source)).toContain("Section 2")
		})

		it("should detect external references", () => {
			const content = `
## External Links
Check out [the documentation](./docs/guide.md) and [external site](https://example.com).
      `

			const references = detector.detectReferences("/docs/test.md", content)

			expect(references.length).toBeGreaterThan(0)
			expect(references.some((r) => r.target.includes("guide.md"))).toBe(true)
		})

		it("should ignore invalid references", () => {
			const content = `
## Invalid References
This has [invalid](broken-link) and [empty]() references.
      `

			const references = detector.detectReferences("/docs/test.md", content)

			expect(references.length).toBe(0)
		})
	})

	describe("getSectionStats", () => {
		it("should provide section statistics", () => {
			const content = `
# Main Title

## Section 1
Short section.

## Section 2
This is a much longer section with more content that provides detailed information.

## Section 3
Another section.
      `

			const stats = detector.getSectionStats("/docs/test.md", content)

			expect(stats.totalSections).toBe(3)
			expect(stats.averageLength).toBeGreaterThan(0)
			expect(stats.maxLength).toBeGreaterThan(stats.minLength)
		})

		it("should handle documents with no sections", () => {
			const content = `This is just plain text with no sections.`

			const stats = detector.getSectionStats("/docs/test.md", content)

			expect(stats.totalSections).toBe(0)
			expect(stats.averageLength).toBe(0)
		})
	})

	describe("updateConfig", () => {
		it("should update configuration", () => {
			const newConfig: DetectionConfig = {
				minSectionLength: 200,
				maxOrphanedSections: 3,
				ignoreNavigationDocuments: false,
				ignorePlanningDocuments: true,
				contextWindowSize: 5,
			}

			detector.updateConfig(newConfig)
			expect(detector.getConfig()).toEqual(newConfig)
		})

		it("should validate configuration", () => {
			const invalidConfig = {
				minSectionLength: -1,
				maxOrphanedSections: 0,
			}

			expect(() => {
				detector.updateConfig(invalidConfig as any)
			}).toThrow()
		})
	})

	describe("edge cases", () => {
		it("should handle very long documents", () => {
			const content = "# Document\n" + "## Section\nContent\n".repeat(1000)

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const result = detector.detectOrphanedSections("/docs/long.md", content)

			expect(result.orphanedSections.length).toBeLessThanOrEqual(5) // Respect limit
			expect(result.totalSections).toBe(1000)
		})

		it("should handle documents with special characters", () => {
			const content = `
# Document with Special Characters

## Section @#$%^&*()
Content with special characters.

## Section with Unicode 🚀
Content with unicode characters.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const result = detector.detectOrphanedSections("/docs/special.md", content)

			expect(result.orphanedSections.length).toBeGreaterThanOrEqual(0)
		})

		it("should handle deeply nested sections", () => {
			const content = `
# Level 1

## Level 2

### Level 3

#### Level 4

##### Level 5
Content at level 5.
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const result = detector.detectOrphanedSections("/docs/nested.md", content)

			expect(result.totalSections).toBe(4)
		})
	})
})
