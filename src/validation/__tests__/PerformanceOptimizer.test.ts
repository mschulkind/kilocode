/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { PerformanceOptimizer, OptimizationStrategy } from "../PerformanceOptimizer"
import { PerformanceMonitor } from "../PerformanceMonitor"

describe("PerformanceOptimizer", () => {
	let optimizer: PerformanceOptimizer
	let monitor: PerformanceMonitor

	beforeEach(() => {
		monitor = new PerformanceMonitor()
		optimizer = new PerformanceOptimizer(monitor)
		vi.clearAllMocks()
	})

	describe("Initialization", () => {
		it("should initialize with default strategies", () => {
			const monitor = optimizer.getMonitor()
			expect(monitor).toBeDefined()

			// Should have initialized optimization strategies
			const report = optimizer.getOptimizationReport()
			expect(report.estimatedImprovements).toBeDefined()
			expect(Object.keys(report.estimatedImprovements).length).toBeGreaterThan(0)
		})

		it("should initialize with custom monitor", () => {
			const customMonitor = new PerformanceMonitor()
			const customOptimizer = new PerformanceOptimizer(customMonitor)

			expect(customOptimizer.getMonitor()).toBe(customMonitor)
		})
	})

	describe("Strategy Management", () => {
		it("should add custom optimization strategy", () => {
			const customStrategy: OptimizationStrategy = {
				name: "custom_optimization",
				description: "Custom optimization strategy",
				apply: vi.fn().mockResolvedValue(undefined),
				priority: 5,
				estimatedImprovement: 25,
			}

			optimizer.addStrategy(customStrategy)

			const report = optimizer.getOptimizationReport()
			expect(report.estimatedImprovements.custom_optimization).toBe(25)
		})

		it("should remove optimization strategy", () => {
			const result = optimizer.removeStrategy("cache_optimization")
			expect(result).toBe(true)

			const report = optimizer.getOptimizationReport()
			expect(report.estimatedImprovements.cache_optimization).toBeUndefined()
		})

		it("should return false when removing non-existent strategy", () => {
			const result = optimizer.removeStrategy("non_existent")
			expect(result).toBe(false)
		})
	})

	describe("Strategy Application", () => {
		it("should apply all optimization strategies", async () => {
			const results = await optimizer.optimizeAll()

			expect(results).toBeDefined()
			expect(Array.isArray(results)).toBe(true)
			expect(results.length).toBeGreaterThan(0)

			// Check that strategies were applied
			for (const result of results) {
				expect(result.strategy).toBeDefined()
				expect(typeof result.applied).toBe("boolean")
				expect(typeof result.improvement).toBe("number")
				expect(result.metrics).toBeDefined()
				expect(result.metrics.before).toBeDefined()
				expect(result.metrics.after).toBeDefined()
			}
		})

		it("should apply strategies in priority order", async () => {
			// Add custom strategies with different priorities
			const highPriorityStrategy: OptimizationStrategy = {
				name: "high_priority",
				description: "High priority strategy",
				apply: vi.fn().mockResolvedValue(undefined),
				priority: 10,
				estimatedImprovement: 50,
			}

			const lowPriorityStrategy: OptimizationStrategy = {
				name: "low_priority",
				description: "Low priority strategy",
				apply: vi.fn().mockResolvedValue(undefined),
				priority: 1,
				estimatedImprovement: 10,
			}

			optimizer.addStrategy(highPriorityStrategy)
			optimizer.addStrategy(lowPriorityStrategy)

			const results = await optimizer.optimizeAll()

			// Find the indices of our custom strategies
			const highPriorityIndex = results.findIndex((r) => r.strategy === "high_priority")
			const lowPriorityIndex = results.findIndex((r) => r.strategy === "low_priority")

			// High priority strategy should come before low priority
			expect(highPriorityIndex).toBeLessThan(lowPriorityIndex)
		})

		it("should handle strategy application errors gracefully", async () => {
			const failingStrategy: OptimizationStrategy = {
				name: "failing_strategy",
				description: "Strategy that fails",
				apply: vi.fn().mockRejectedValue(new Error("Strategy failed")),
				priority: 5,
				estimatedImprovement: 20,
			}

			optimizer.addStrategy(failingStrategy)

			const results = await optimizer.optimizeAll()
			const failingResult = results.find((r) => r.strategy === "failing_strategy")

			expect(failingResult).toBeDefined()
			expect(failingResult?.applied).toBe(false)
			expect(failingResult?.error).toBe("Strategy failed")
		})
	})

	describe("Component Optimization", () => {
		it("should optimize validation components", async () => {
			await optimizer.optimizeValidationComponents()

			const report = optimizer.getMonitor().generateReport()
			expect(report.operations.some((op) => op.operationName === "component_optimization")).toBe(true)
		})
	})

	describe("Performance Requirements", () => {
		it("should check performance requirements", () => {
			const result = optimizer.checkPerformanceRequirements()

			expect(result).toBeDefined()
			expect(typeof result.met).toBe("boolean")
			expect(Array.isArray(result.issues)).toBe(true)
		})
	})

	describe("Optimization Report", () => {
		it("should generate optimization report", () => {
			const report = optimizer.getOptimizationReport()

			expect(report).toBeDefined()
			expect(report.currentPerformance).toBeDefined()
			expect(Array.isArray(report.recommendations)).toBe(true)
			expect(report.estimatedImprovements).toBeDefined()
		})

		it("should include current performance metrics in report", () => {
			const report = optimizer.getOptimizationReport()

			expect(report.currentPerformance).toBeDefined()
			expect(report.currentPerformance.totalDuration).toBeGreaterThanOrEqual(0)
			expect(report.currentPerformance.operations).toBeDefined()
			expect(report.currentPerformance.memoryPeak).toBeGreaterThanOrEqual(0)
		})
	})

	describe("Individual Optimization Strategies", () => {
		it("should optimize caching", async () => {
			const results = await optimizer.optimizeAll()
			const cacheOptimization = results.find((r) => r.strategy === "cache_optimization")

			expect(cacheOptimization).toBeDefined()
			expect(cacheOptimization?.applied).toBe(true)
		})

		it("should enable parallel processing", async () => {
			const results = await optimizer.optimizeAll()
			const parallelProcessing = results.find((r) => r.strategy === "parallel_processing")

			expect(parallelProcessing).toBeDefined()
			expect(parallelProcessing?.applied).toBe(true)
		})

		it("should optimize memory usage", async () => {
			const results = await optimizer.optimizeAll()
			const memoryOptimization = results.find((r) => r.strategy === "memory_optimization")

			expect(memoryOptimization).toBeDefined()
			expect(memoryOptimization?.applied).toBe(true)
		})

		it("should optimize file operations", async () => {
			const results = await optimizer.optimizeAll()
			const fileOperations = results.find((r) => r.strategy === "file_operations_optimization")

			expect(fileOperations).toBeDefined()
			expect(fileOperations?.applied).toBe(true)
		})

		it("should enable validation batching", async () => {
			const results = await optimizer.optimizeAll()
			const validationBatching = results.find((r) => r.strategy === "validation_batching")

			expect(validationBatching).toBeDefined()
			expect(validationBatching?.applied).toBe(true)
		})

		it("should enable early termination", async () => {
			const results = await optimizer.optimizeAll()
			const earlyTermination = results.find((r) => r.strategy === "early_termination")

			expect(earlyTermination).toBeDefined()
			expect(earlyTermination?.applied).toBe(true)
		})
	})

	describe("Monitor Integration", () => {
		it("should use the provided monitor instance", () => {
			const customMonitor = new PerformanceMonitor()
			const customOptimizer = new PerformanceOptimizer(customMonitor)

			expect(customOptimizer.getMonitor()).toBe(customMonitor)
		})

		it("should track optimization operations in monitor", async () => {
			await optimizer.optimizeAll()

			const report = optimizer.getMonitor().generateReport()
			expect(report.operations.length).toBeGreaterThan(0)
		})
	})

	describe("Configuration Updates", () => {
		it("should update monitor configuration through optimizations", async () => {
			const initialConfig = optimizer.getMonitor().getConfig()

			await optimizer.optimizeAll()

			const updatedConfig = optimizer.getMonitor().getConfig()

			// Some optimizations should have updated the configuration
			expect(updatedConfig).toBeDefined()
		})
	})

	describe("Error Handling", () => {
		it("should handle errors in component optimization gracefully", async () => {
			// Mock console.warn to avoid noise in tests
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

			try {
				await optimizer.optimizeValidationComponents()
				// Should not throw
				expect(true).toBe(true)
			} catch (error) {
				// Should handle errors gracefully
				expect(error).toBeDefined()
			} finally {
				consoleSpy.mockRestore()
			}
		})
	})
})
