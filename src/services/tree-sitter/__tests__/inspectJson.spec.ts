import { inspectTreeStructure, testParseSourceCodeDefinitions } from "./helpers.js"
import { javascriptQuery } from "../queries.js"
import sampleJsonContent from "./fixtures/sample-json.js"

describe("inspectJson", () => {
	const testOptions = {
		language: "javascript",
		wasmFile: "tree-sitter-javascript.wasm",
		queryString: javascriptQuery,
		extKey: "json",
	}

	it("should inspect JSON tree structure", async () => {
		await inspectTreeStructure(sampleJsonContent, "json")
	})

	it("should parse JSON definitions", async () => {
		await testParseSourceCodeDefinitions("test.json", sampleJsonContent, testOptions)
	})
})
