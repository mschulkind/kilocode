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

import laminarService from "../LaminarService"

beforeEach(() => {
	vi.clearAllMocks()
	// Force the singleton into an enabled & initialized state for testing
	;(laminarService as any).enabled = true
	;(laminarService as any).isInitialized = true
})

describe("LaminarService.testConnection", () => {
	it("returns success when service enabled and startSpan works", async () => {
		const result = await laminarService.testConnection()
		expect(result.success).toBe(true)
		expect(result.details).toBeDefined()
	})
})
