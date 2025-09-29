import { inspectTreeStructure, testParseSourceCodeDefinitions } from "./helpers.js"
import { typescriptQuery } from "../queries.js"
import sampleTypeScriptContent from "./fixtures/sample-typescript.js"

describe("inspectTypeScript", () => {
	const testOptions = {
		language: "typescript",
		wasmFile: "tree-sitter-typescript.wasm",
		queryString: typescriptQuery,
		extKey: "ts",
	}

	it("should successfully inspect TypeScript tree structure", async () => {
		// Should execute without throwing
		await expect(inspectTreeStructure(sampleTypeScriptContent, "typescript")).resolves.not.toThrow()
	})

	it("should successfully parse TypeScript definitions", async () => {
		const result = await testParseSourceCodeDefinitions("test.ts", sampleTypeScriptContent, testOptions)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/) // Verify line number format
		expect(result).toMatch(/interface TestInterfaceDefinition/) // Verify some content
	})
})
