import { inspectTreeStructure, testParseSourceCodeDefinitions, debugLog } from "./helpers.js"
import { luaQuery } from "../queries.js"
import sampleLuaContent from "./fixtures/sample-lua.js"

describe("inspectLua", () => {
	const testOptions = {
		language: "lua",
		wasmFile: "tree-sitter-lua.wasm",
		queryString: luaQuery,
		extKey: "lua",
	}

	it("should inspect Lua tree structure", async () => {
		await inspectTreeStructure(sampleLuaContent, "lua")
	})

	it("should parse Lua definitions", async () => {
		const result = await testParseSourceCodeDefinitions("file.lua", sampleLuaContent, testOptions)
		expect(result).toBeDefined() // Confirm parse succeeded
		debugLog("Lua parse result:", result)
	})
})
