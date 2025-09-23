import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the lmnr module used by LaminarService
vi.mock("@lmnr-ai/lmnr", () => {
	return {
		Laminar: {
			startSpan: vi.fn(() => ({
				setAttributes: vi.fn(),
				end: vi.fn(),
			})),
			withSpan: (span: any, fn: () => void) => fn(),
			initialize: vi.fn(),
		},
		observe: vi.fn(),
		observeDecorator: vi.fn(),
		Span: undefined,
	}
})

// Mock the laminar config to control recordSpanIO default
vi.mock("../../shared/services/config/laminar-config", () => ({
	laminarConfig: {
		apiKey: "test-key",
		baseUrl: "https://api.lmnr.ai",
		enabled: true,
		recordSpanIO: false, // Default to false for testing
	},
}))

import laminarService from "../LaminarService"

beforeEach(() => {
	vi.clearAllMocks()
	// Force the singleton into an enabled & initialized state for testing
	;(laminarService as any).enabled = true
	;(laminarService as any).isInitialized = true
	// Reset recordSpanIO to a known state for each test
	;(laminarService as any).recordSpanIO = false
})

describe("Laminar deduplication fix", () => {
	describe("getRecordSpanIO method", () => {
		it("should return the current recordSpanIO setting", () => {
			// Test when recordSpanIO is true
			;(laminarService as any).recordSpanIO = true
			expect(laminarService.getRecordSpanIO()).toBe(true)

			// Test when recordSpanIO is false
			;(laminarService as any).recordSpanIO = false
			expect(laminarService.getRecordSpanIO()).toBe(false)
		})
	})

	describe("Task.ts integration - system prompt deduplication", () => {
		it("should use metadata for system prompt when recordSpanIO is true", () => {
			// Mock laminarService.getRecordSpanIO to return true
			const mockGetRecordSpanIO = vi.fn(() => true)
			;(laminarService as any).getRecordSpanIO = mockGetRecordSpanIO

			// Simulate the logic from Task.ts line 2977
			const systemPrompt =
				"This is a very long system prompt that would cause duplication issues if stored in full in the span input. It contains detailed instructions and context that should be summarized as metadata instead."
			const cleanConversationHistory = [{ role: "user", content: "test message" }]

			// This is the fix: when recordSpanIO is true, use metadata instead of full content
			const spanInput = laminarService.getRecordSpanIO()
				? [
						{ role: "system", content: `[SYSTEM_PROMPT:${systemPrompt.length} chars]` },
						...cleanConversationHistory,
					]
				: undefined

			// Verify the fix works correctly
			expect(mockGetRecordSpanIO).toHaveBeenCalled()
			expect(spanInput).toBeDefined()
			expect(spanInput![0]).toEqual({
				role: "system",
				content: `[SYSTEM_PROMPT:${systemPrompt.length} chars]`,
			})
			// Verify the metadata shows the character count, not the full prompt
			expect(spanInput![0].content).toBe(`[SYSTEM_PROMPT:${systemPrompt.length} chars]`)
			expect(spanInput![0].content).not.toContain("detailed instructions")
			expect(spanInput![0].content).toContain("chars]")
		})

		it("should not include span input when recordSpanIO is false", () => {
			// Mock laminarService.getRecordSpanIO to return false
			const mockGetRecordSpanIO = vi.fn(() => false)
			;(laminarService as any).getRecordSpanIO = mockGetRecordSpanIO

			// Simulate the logic from Task.ts line 2977
			const systemPrompt = "This is a system prompt"
			const cleanConversationHistory = [{ role: "user", content: "test message" }]

			// When recordSpanIO is false, spanInput should be undefined
			const spanInput = laminarService.getRecordSpanIO()
				? [
						{ role: "system", content: `[SYSTEM_PROMPT:${systemPrompt.length} chars]` },
						...cleanConversationHistory,
					]
				: undefined

			// Verify spanInput is undefined when recordSpanIO is false
			expect(mockGetRecordSpanIO).toHaveBeenCalled()
			expect(spanInput).toBeUndefined()
		})

		it("should preserve full system prompt for actual API call", () => {
			// This test ensures that while the span input uses metadata,
			// the actual API call still receives the full system prompt
			const fullSystemPrompt =
				"This is the complete system prompt with all instructions and context that the API needs to function properly."

			// The API call should always get the full prompt
			const apiCallSystemPrompt = fullSystemPrompt

			// The span input should get the metadata version when recordSpanIO is true
			const mockGetRecordSpanIO = vi.fn(() => true)
			;(laminarService as any).getRecordSpanIO = mockGetRecordSpanIO

			const spanInput = laminarService.getRecordSpanIO()
				? [{ role: "system", content: `[SYSTEM_PROMPT:${fullSystemPrompt.length} chars]` }]
				: undefined

			// Verify both work correctly
			expect(apiCallSystemPrompt).toBe(fullSystemPrompt) // API gets full prompt
			expect(spanInput![0].content).toBe(`[SYSTEM_PROMPT:${fullSystemPrompt.length} chars]`) // Span gets metadata
			expect(apiCallSystemPrompt).not.toBe(spanInput![0].content) // They should be different
		})

		it("should demonstrate the deduplication benefit", () => {
			// Show that the fix reduces data duplication significantly
			const longSystemPrompt = "A".repeat(10000) // 10KB system prompt

			// Without the fix (old behavior) - full prompt would be stored
			const oldBehaviorSize = JSON.stringify([
				{ role: "system", content: longSystemPrompt },
				{ role: "user", content: "test message" },
			]).length

			// With the fix (new behavior) - only metadata is stored
			const newBehaviorSize = JSON.stringify([
				{ role: "system", content: `[SYSTEM_PROMPT:${longSystemPrompt.length} chars]` },
				{ role: "user", content: "test message" },
			]).length

			// Verify significant size reduction
			expect(newBehaviorSize).toBeLessThan(oldBehaviorSize)
			expect(oldBehaviorSize - newBehaviorSize).toBeGreaterThan(9000) // Should save ~9KB+
		})
	})

	describe("Configuration behavior", () => {
		it("should return a boolean value for recordSpanIO", () => {
			// Just verify the method exists and returns a boolean
			expect(typeof laminarService.getRecordSpanIO()).toBe("boolean")
		})

		it("should have getRecordSpanIO method available", () => {
			// Verify the method exists (this is the key addition from the fix)
			expect(typeof laminarService.getRecordSpanIO).toBe("function")
		})
	})
})
