/**
 * ValidationRuleConfig Test Suite
 *
 * Tests for the validation rule configuration system that allows different
 * validation rules based on document type and context.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { ValidationRuleConfig, ValidationRule, RuleSet, ValidationRuleConfigOptions } from "../ValidationRuleConfig"
import { DocumentTypeDetector } from "../DocumentTypeDetector"

// Mock dependencies
vi.mock("../DocumentTypeDetector")

describe("ValidationRuleConfig", () => {
	let config: ValidationRuleConfig
	let mockDocumentTypeDetector: any

	beforeEach(() => {
		mockDocumentTypeDetector = {
			detectType: vi.fn(),
			getAllTypes: vi.fn(),
		}

		config = new ValidationRuleConfig({
			documentTypeDetector: mockDocumentTypeDetector,
		})
	})

	describe("constructor", () => {
		it("should initialize with default rule sets", () => {
			expect(config.getRuleSets()).toBeDefined()
			expect(config.getRuleSets()).toHaveProperty("navigation")
			expect(config.getRuleSets()).toHaveProperty("technical")
			expect(config.getRuleSets()).toHaveProperty("planning")
			expect(config.getRuleSets()).toHaveProperty("general")
		})

		it("should allow custom rule sets", () => {
			const customRuleSets: Record<string, RuleSet> = {
				custom: {
					name: "Custom Rules",
					description: "Custom validation rules",
					rules: {
						maxLineLength: { enabled: true, value: 100 },
						requireHeadings: { enabled: true, value: true },
					},
				},
			}

			const customConfig = new ValidationRuleConfig({
				documentTypeDetector: mockDocumentTypeDetector,
				ruleSets: customRuleSets,
			})

			expect(customConfig.getRuleSets()).toEqual(customRuleSets)
		})
	})

	describe("getRulesForDocument", () => {
		it("should return rules for specific document type", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "navigation",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const rules = config.getRulesForDocument("/docs/README.md", "", "")

			expect(rules).toBeDefined()
			expect(rules.maxLineLength).toBeDefined()
			expect(rules.requireHeadings).toBeDefined()
		})

		it("should return general rules for unknown document type", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "unknown",
				confidence: 0.3,
				reasons: ["fallback"],
			})

			const rules = config.getRulesForDocument("/docs/unknown.md", "", "")

			expect(rules).toBeDefined()
			expect(rules).toEqual(config.getRuleSets().general.rules)
		})

		it("should handle document type detection errors gracefully", () => {
			mockDocumentTypeDetector.detectType.mockImplementation(() => {
				throw new Error("Detection failed")
			})

			const rules = config.getRulesForDocument("/docs/test.md", "", "")

			expect(rules).toBeDefined()
			expect(rules).toEqual(config.getRuleSets().general.rules)
		})
	})

	describe("getRuleValue", () => {
		it("should return rule value for document type", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "technical",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const value = config.getRuleValue("/docs/api.md", "", "", "maxLineLength")

			expect(value).toBeDefined()
			expect(typeof value).toBe("number")
		})

		it("should return default value for unknown rule", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "navigation",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const value = config.getRuleValue("/docs/README.md", "", "", "unknownRule")

			expect(value).toBeUndefined()
		})

		it("should return disabled rule as undefined", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "navigation",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			// Disable a rule
			config.updateRuleSet("navigation", {
				name: "Navigation Rules",
				description: "Rules for navigation documents",
				rules: {
					maxLineLength: { enabled: false, value: 120 },
					requireHeadings: { enabled: true, value: true },
				},
			})

			const value = config.getRuleValue("/docs/README.md", "", "", "maxLineLength")

			expect(value).toBeUndefined()
		})
	})

	describe("isRuleEnabled", () => {
		it("should return true for enabled rules", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "technical",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const enabled = config.isRuleEnabled("/docs/api.md", "", "", "maxLineLength")

			expect(enabled).toBe(true)
		})

		it("should return false for disabled rules", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "navigation",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			// Disable a rule
			config.updateRuleSet("navigation", {
				name: "Navigation Rules",
				description: "Rules for navigation documents",
				rules: {
					maxLineLength: { enabled: false, value: 120 },
					requireHeadings: { enabled: true, value: true },
				},
			})

			const enabled = config.isRuleEnabled("/docs/README.md", "", "", "maxLineLength")

			expect(enabled).toBe(false)
		})

		it("should return false for unknown rules", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const enabled = config.isRuleEnabled("/docs/test.md", "", "", "unknownRule")

			expect(enabled).toBe(false)
		})
	})

	describe("updateRuleSet", () => {
		it("should update existing rule set", () => {
			const updatedRules: RuleSet = {
				name: "Updated Navigation Rules",
				description: "Updated rules for navigation documents",
				rules: {
					maxLineLength: { enabled: true, value: 100 },
					requireHeadings: { enabled: false, value: true },
				},
			}

			config.updateRuleSet("navigation", updatedRules)

			const rules = config.getRuleSets().navigation
			expect(rules).toEqual(updatedRules)
		})

		it("should create new rule set", () => {
			const newRules: RuleSet = {
				name: "API Documentation Rules",
				description: "Special rules for API documentation",
				rules: {
					maxLineLength: { enabled: true, value: 80 },
					requireHeadings: { enabled: true, value: true },
					requireCodeExamples: { enabled: true, value: true },
				},
			}

			config.updateRuleSet("api-docs", newRules)

			const rules = config.getRuleSets()["api-docs"]
			expect(rules).toEqual(newRules)
		})

		it("should validate rule set structure", () => {
			const invalidRules = {
				name: "Invalid Rules",
				// Missing description and rules
			}

			expect(() => {
				config.updateRuleSet("invalid", invalidRules as any)
			}).toThrow()
		})
	})

	describe("getRuleSets", () => {
		it("should return all rule sets", () => {
			const ruleSets = config.getRuleSets()

			expect(ruleSets).toBeDefined()
			expect(typeof ruleSets).toBe("object")
			expect(Object.keys(ruleSets).length).toBeGreaterThan(0)
		})

		it("should return copy of rule sets", () => {
			const ruleSets1 = config.getRuleSets()
			const ruleSets2 = config.getRuleSets()

			expect(ruleSets1).not.toBe(ruleSets2) // Different objects
			expect(ruleSets1).toEqual(ruleSets2) // Same content
		})
	})

	describe("getRuleSet", () => {
		it("should return specific rule set", () => {
			const ruleSet = config.getRuleSet("navigation")

			expect(ruleSet).toBeDefined()
			expect(ruleSet?.name).toBe("Navigation Rules")
			expect(ruleSet?.rules).toBeDefined()
		})

		it("should return undefined for unknown rule set", () => {
			const ruleSet = config.getRuleSet("unknown")

			expect(ruleSet).toBeUndefined()
		})
	})

	describe("validateConfiguration", () => {
		it("should validate valid configuration", () => {
			expect(() => {
				config.validateConfiguration()
			}).not.toThrow()
		})

		it("should detect invalid rule values", () => {
			expect(() => {
				config.updateRuleSet("navigation", {
					name: "Invalid Rules",
					description: "Rules with invalid values",
					rules: {
						maxLineLength: { enabled: true, value: -1 }, // Invalid negative value
						requireHeadings: { enabled: true, value: true },
					},
				})
			}).toThrow()
		})

		it("should detect missing required rules", () => {
			expect(() => {
				config.updateRuleSet("navigation", {
					name: "Incomplete Rules",
					description: "Rules missing required properties",
					rules: {
						maxLineLength: { enabled: true, value: 100 },
						// Missing requireHeadings
					},
				})
			}).toThrow()
		})
	})

	describe("rule inheritance", () => {
		it("should inherit from general rules when specific rules are missing", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "custom",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			// Create custom rule set with only some rules
			config.updateRuleSet("custom", {
				name: "Custom Rules",
				description: "Custom validation rules",
				rules: {
					maxLineLength: { enabled: true, value: 100 },
					requireHeadings: { enabled: true, value: true },
					// Missing other rules
				},
			})

			const rules = config.getRulesForDocument("/docs/custom.md", "", "")

			// Should have the custom rule
			expect(rules.maxLineLength.value).toBe(100)

			// Should inherit general rules for missing properties
			expect(rules.requireHeadings).toBeDefined()
		})

		it("should override inherited rules", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "technical",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const rules = config.getRulesForDocument("/docs/api.md", "", "")

			// Technical rules should override general rules
			expect(rules.maxLineLength.value).not.toBe(config.getRuleSets().general.rules.maxLineLength.value)
		})
	})

	describe("dynamic rule application", () => {
		it("should apply rules based on document content", () => {
			const longContent =
				"This is a very long line of content that exceeds the normal line length limit and should trigger different validation rules."

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["content-pattern"],
			})

			const rules = config.getRulesForDocument("/docs/long.md", longContent, "")

			expect(rules).toBeDefined()
			// Should have adjusted rules for long content
			expect(rules.maxLineLength.value).toBeGreaterThan(80)
		})

		it("should adjust rules based on document structure", () => {
			const structuredContent = `
# Title

## Section 1

### Subsection 1.1

## Section 2
      `

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "technical",
				confidence: 0.8,
				reasons: ["structure-pattern"],
			})

			const rules = config.getRulesForDocument("/docs/structured.md", structuredContent, "")

			expect(rules).toBeDefined()
			expect(rules.requireHeadings.enabled).toBe(true)
		})
	})

	describe("configuration validation", () => {
		it("should validate rule value types", () => {
			expect(() => {
				config.updateRuleSet("invalid", {
					name: "Invalid Rules",
					description: "Rules with wrong value types",
					rules: {
						maxLineLength: { enabled: true, value: "not-a-number" },
					},
				})
			}).toThrow()
		})

		it("should validate rule names", () => {
			expect(() => {
				config.updateRuleSet("invalid", {
					name: "Invalid Rules",
					description: "Rules with invalid names",
					rules: {
						"": { enabled: true, value: 100 }, // Empty rule name
					},
				})
			}).toThrow()
		})

		it("should validate rule set names", () => {
			expect(() => {
				config.updateRuleSet("", {
					// Empty rule set name
					name: "Invalid Rules",
					description: "Rules with invalid names",
					rules: {},
				})
			}).toThrow()
		})
	})

	describe("performance", () => {
		it("should cache rule lookups", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "navigation",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const startTime = Date.now()

			// Multiple lookups for same document type
			for (let i = 0; i < 100; i++) {
				config.getRulesForDocument("/docs/README.md", "", "")
			}

			const endTime = Date.now()
			const duration = endTime - startTime

			// Should be fast due to caching
			expect(duration).toBeLessThan(100) // Less than 100ms for 100 lookups
		})

		it("should handle concurrent rule lookups", async () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "technical",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const promises = []
			for (let i = 0; i < 10; i++) {
				promises.push(Promise.resolve(config.getRulesForDocument(`/docs/api${i}.md`, "", "")))
			}

			const results = await Promise.all(promises)

			expect(results).toHaveLength(10)
			results.forEach((rules) => {
				expect(rules).toBeDefined()
				expect(rules.maxLineLength).toBeDefined()
			})
		})
	})

	describe("edge cases", () => {
		it("should handle empty document paths", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.1,
				reasons: ["fallback"],
			})

			const rules = config.getRulesForDocument("", "", "")

			expect(rules).toBeDefined()
			expect(rules).toEqual(config.getRuleSets().general.rules)
		})

		it("should handle very long document content", () => {
			const longContent = "x".repeat(100000) // 100KB of content

			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "general",
				confidence: 0.8,
				reasons: ["content-pattern"],
			})

			const rules = config.getRulesForDocument("/docs/large.md", longContent, "")

			expect(rules).toBeDefined()
			expect(rules.maxLineLength).toBeDefined()
		})

		it("should handle special characters in document paths", () => {
			mockDocumentTypeDetector.detectType.mockReturnValue({
				type: "technical",
				confidence: 0.8,
				reasons: ["path-pattern"],
			})

			const rules = config.getRulesForDocument("/docs/file@#$%^&*().md", "", "")

			expect(rules).toBeDefined()
			expect(rules.maxLineLength).toBeDefined()
		})
	})
})
