import { inspectTreeStructure, testParseSourceCodeDefinitions } from "./helpers.js"
import { cQuery } from "../queries.js"
import sampleCContent from "./fixtures/sample-c.js"

describe("inspectC", () => {
	const testOptions = {
		language: "c",
		wasmFile: "tree-sitter-c.wasm",
		queryString: cQuery,
		extKey: "c",
	}

	it("should inspect C tree structure", async () => {
		await inspectTreeStructure(sampleCContent, "c")
	})

	it("should parse C definitions", async () => {
		const result = await testParseSourceCodeDefinitions("test.c", sampleCContent, testOptions)
		// Only verify that parsing produces output with line numbers and content
		if (!result || !result.match(/\d+--\d+ \|/)) {
			throw new Error("Failed to parse C definitions with line numbers")
		}
	})
})
