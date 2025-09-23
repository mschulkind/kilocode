// Tests for laminar-config
// Note: vitest globals (vi, describe, test, expect, afterEach) are available via tsconfig

const OLD_ENV = { ...process.env }

afterEach(() => {
	process.env = { ...OLD_ENV }
	vi.resetModules()
})

describe("laminar-config", () => {
	test("does not set ports when env vars missing", async () => {
		vi.resetModules()
		delete process.env.LMNR_HTTP_PORT
		delete process.env.LMNR_GRPC_PORT

		const mod = await import("../laminar-config")
		const { laminarConfig } = mod as any

		expect(laminarConfig).toBeTruthy()
		// Properties should not exist when env vars are not set
		expect(laminarConfig.httpPort).toBeUndefined()
		expect(laminarConfig.grpcPort).toBeUndefined()
		expect(Object.prototype.hasOwnProperty.call(laminarConfig, "httpPort")).toBe(false)
		expect(Object.prototype.hasOwnProperty.call(laminarConfig, "grpcPort")).toBe(false)
	})

	test("sets ports when env vars present", async () => {
		vi.resetModules()
		process.env.LMNR_HTTP_PORT = "1234"
		process.env.LMNR_GRPC_PORT = "4321"

		const mod = await import("../laminar-config")
		const { laminarConfig } = mod as any

		expect(laminarConfig.httpPort).toBe(1234)
		expect(laminarConfig.grpcPort).toBe(4321)
	})
})
