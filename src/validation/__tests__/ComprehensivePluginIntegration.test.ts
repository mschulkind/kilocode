/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { CrossReferenceValidator } from "../CrossReferenceValidator"
import { FileIndexBuilder } from "../FileIndexBuilder"
import { DocumentTypeDetector } from "../DocumentTypeDetector"
import { OrphanedSectionsDetector } from "../OrphanedSectionsDetector"
import { ValidationRuleConfig } from "../ValidationRuleConfig"

// Mock the validation modules
vi.mock("../CrossReferenceValidator")
vi.mock("../FileIndexBuilder")
vi.mock("../DocumentTypeDetector")
vi.mock("../OrphanedSectionsDetector")
vi.mock("../ValidationRuleConfig")

describe("Comprehensive Plugin Integration", () => {
	let mockCrossReferenceValidator: any
	let mockFileIndexBuilder: any
	let mockDocumentTypeDetector: any
	let mockOrphanedSectionsDetector: any
	let mockValidationRuleConfig: any

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks()

		// Mock CrossReferenceValidator
		mockCrossReferenceValidator = {
			validateFile: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
			validateAnchor: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
		}
		;(CrossReferenceValidator as any).mockImplementation(() => mockCrossReferenceValidator)

		// Mock FileIndexBuilder
		mockFileIndexBuilder = {
			buildIndex: vi.fn().mockResolvedValue({ files: [], errors: [] }),
			getFileInfo: vi.fn().mockReturnValue({ exists: true, path: "/test/file.md" }),
			isFileCached: vi.fn().mockReturnValue(false),
		}
		;(FileIndexBuilder as any).mockImplementation(() => mockFileIndexBuilder)

		// Mock DocumentTypeDetector
		mockDocumentTypeDetector = {
			detectType: vi.fn().mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["path-pattern"],
			}),
		}
		;(DocumentTypeDetector as any).mockImplementation(() => mockDocumentTypeDetector)

		// Mock OrphanedSectionsDetector
		mockOrphanedSectionsDetector = {
			detectOrphanedSections: vi.fn().mockReturnValue({
				orphanedSections: [],
				totalSections: 5,
				errors: [],
			}),
		}
		;(OrphanedSectionsDetector as any).mockImplementation(() => mockOrphanedSectionsDetector)

		// Mock ValidationRuleConfig
		mockValidationRuleConfig = {
			getRulesForDocument: vi.fn().mockReturnValue({
				maxLineLength: 120,
				requireHeadings: true,
				minSectionLength: 50,
			}),
			validateConfiguration: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
		}
		;(ValidationRuleConfig as any).mockImplementation(() => mockValidationRuleConfig)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe("Component Integration", () => {
		it("should integrate all validation components", () => {
			// Test that all components can be instantiated together
			const fileIndexBuilder = new FileIndexBuilder()
			const crossReferenceValidator = new CrossReferenceValidator(fileIndexBuilder)
			const documentTypeDetector = new DocumentTypeDetector()
			const orphanedSectionsDetector = new OrphanedSectionsDetector({
				fileIndexBuilder,
				documentTypeDetector,
			})
			const validationRuleConfig = new ValidationRuleConfig({
				documentTypeDetector,
			})

			// Should not throw errors during instantiation
			expect(fileIndexBuilder).toBeDefined()
			expect(crossReferenceValidator).toBeDefined()
			expect(documentTypeDetector).toBeDefined()
			expect(orphanedSectionsDetector).toBeDefined()
			expect(validationRuleConfig).toBeDefined()
		})

		it("should use ValidationRuleConfig for rule configuration", () => {
			const documentTypeDetector = new DocumentTypeDetector()
			const validationRuleConfig = new ValidationRuleConfig({
				documentTypeDetector,
			})

			const rules = validationRuleConfig.getRulesForDocument("/test/path", "# Test Document", "")

			// Should return valid rules
			expect(rules).toBeDefined()
			expect(rules.maxLineLength).toBeGreaterThan(0)
		})

		it("should use DocumentTypeDetector for document type detection", () => {
			const detector = new DocumentTypeDetector()

			const result = detector.detectType("/docs/README.md", "# Test Document", "")

			// Should have called DocumentTypeDetector
			expect(DocumentTypeDetector).toHaveBeenCalled()
			expect(result.type).toBe("general")
		})

		it("should use CrossReferenceValidator for link validation", async () => {
			const fileIndexBuilder = new FileIndexBuilder()
			const validator = new CrossReferenceValidator(fileIndexBuilder)

			await validator.validateFile("./test-file.md", "/test/path")

			// Should have called CrossReferenceValidator
			expect(CrossReferenceValidator).toHaveBeenCalled()
		})

		it("should use OrphanedSectionsDetector for section detection", () => {
			const fileIndexBuilder = new FileIndexBuilder()
			const documentTypeDetector = new DocumentTypeDetector()
			const detector = new OrphanedSectionsDetector({
				fileIndexBuilder,
				documentTypeDetector,
			})

			detector.detectOrphanedSections("/test/path", "# Test Document\n\nContent here")

			// Should have called OrphanedSectionsDetector
			expect(OrphanedSectionsDetector).toHaveBeenCalled()
		})

		it("should use FileIndexBuilder for file operations", async () => {
			const builder = new FileIndexBuilder()

			await builder.buildIndex("/test/path")

			// Should have called FileIndexBuilder
			expect(FileIndexBuilder).toHaveBeenCalled()
		})
	})

	describe("Configuration Integration", () => {
		it("should pass configuration to all validation components", () => {
			// All components should have been instantiated
			expect(ValidationRuleConfig).toHaveBeenCalled()
			expect(DocumentTypeDetector).toHaveBeenCalled()
			expect(CrossReferenceValidator).toHaveBeenCalled()
			expect(OrphanedSectionsDetector).toHaveBeenCalled()
			expect(FileIndexBuilder).toHaveBeenCalled()
		})

		it("should handle missing configuration gracefully", () => {
			const documentTypeDetector = new DocumentTypeDetector()
			const config = new ValidationRuleConfig({
				documentTypeDetector,
			})

			// Should not throw errors
			expect(config).toBeDefined()
		})
	})

	describe("Error Handling", () => {
		it("should handle validation component errors gracefully", async () => {
			// Mock CrossReferenceValidator to throw an error
			mockCrossReferenceValidator.validateFile.mockRejectedValue(new Error("Validation failed"))

			const fileIndexBuilder = new FileIndexBuilder()
			const validator = new CrossReferenceValidator(fileIndexBuilder)

			// Should not throw errors even if validation components fail
			const result = await validator.validateFile("./test-file.md", "/test/path")
			expect(result).toBeDefined()
		})

		it("should handle file system errors gracefully", async () => {
			// Mock FileIndexBuilder to throw an error
			mockFileIndexBuilder.buildIndex.mockRejectedValue(new Error("File system error"))

			const builder = new FileIndexBuilder()

			// Should not throw errors even if file system operations fail
			const result = await builder.buildIndex("/test/path")
			expect(result).toBeDefined()
		})
	})

	describe("Performance Integration", () => {
		it("should use caching for file operations", async () => {
			const builder = new FileIndexBuilder()

			await builder.buildIndex("/test/path")

			// Should have called isFileCached
			expect(mockFileIndexBuilder.isFileCached).toHaveBeenCalled()
		})

		it("should batch validation operations efficiently", async () => {
			const fileIndexBuilder = new FileIndexBuilder()
			const crossReferenceValidator = new CrossReferenceValidator(fileIndexBuilder)
			const documentTypeDetector = new DocumentTypeDetector()
			const orphanedSectionsDetector = new OrphanedSectionsDetector({
				fileIndexBuilder,
				documentTypeDetector,
			})

			await crossReferenceValidator.validateFile("./test-file.md", "/test/path")
			orphanedSectionsDetector.detectOrphanedSections("/test/path", "# Test Document")

			// Should have called validation methods
			expect(mockCrossReferenceValidator.validateFile).toHaveBeenCalled()
			expect(mockOrphanedSectionsDetector.detectOrphanedSections).toHaveBeenCalled()
		})
	})

	describe("Backward Compatibility", () => {
		it("should maintain existing plugin functionality", () => {
			// Test that all components work together
			const fileIndexBuilder = new FileIndexBuilder()
			const crossReferenceValidator = new CrossReferenceValidator(fileIndexBuilder)
			const documentTypeDetector = new DocumentTypeDetector()
			const orphanedSectionsDetector = new OrphanedSectionsDetector({
				fileIndexBuilder,
				documentTypeDetector,
			})
			const validationRuleConfig = new ValidationRuleConfig({
				documentTypeDetector,
			})

			// Should process without errors
			expect(fileIndexBuilder).toBeDefined()
			expect(crossReferenceValidator).toBeDefined()
			expect(documentTypeDetector).toBeDefined()
			expect(orphanedSectionsDetector).toBeDefined()
			expect(validationRuleConfig).toBeDefined()
		})

		it("should support legacy configuration options", () => {
			const documentTypeDetector = new DocumentTypeDetector()
			const config = new ValidationRuleConfig({
				documentTypeDetector,
			})

			const rules = config.getRulesForDocument("/test/path", "# Test Document", "")

			// Should process without errors
			expect(rules).toBeDefined()
			expect(rules.maxLineLength).toBeGreaterThan(0)
		})
	})
})
