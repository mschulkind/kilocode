/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { PerformanceMonitor, PerformanceMetrics, OptimizationConfig } from "../PerformanceMonitor.js"

describe("PerformanceMonitor", () => {
	let monitor: PerformanceMonitor

	beforeEach(() => {
		monitor = new PerformanceMonitor()
		vi.clearAllMocks()
	})

	describe("Initialization", () => {
		it("should initialize with default configuration", () => {
			const config = monitor.getConfig()

			expect(config.maxValidationTime).toBe(30000) // 30 seconds
			expect(config.memoryThreshold).toBe(200) // 200 MB
			expect(config.enableProfiling).toBe(true)
			expect(config.enableMemoryMonitoring).toBe(true)
			expect(config.cacheOptimizations).toBe(true)
			expect(config.parallelProcessing).toBe(true)
			expect(config.batchSize).toBe(10)
		})

		it("should initialize with custom configuration", () => {
			const customConfig: Partial<OptimizationConfig> = {
				maxValidationTime: 15000,
				memoryThreshold: 100,
				enableProfiling: false,
				batchSize: 5,
			}

			const customMonitor = new PerformanceMonitor(customConfig)
			const config = customMonitor.getConfig()

			expect(config.maxValidationTime).toBe(15000)
			expect(config.memoryThreshold).toBe(100)
			expect(config.enableProfiling).toBe(false)
			expect(config.batchSize).toBe(5)
		})
	})

	describe("Operation Tracking", () => {
		it("should track operation start and end", async () => {
			const endOperation = monitor.startOperation("test_operation", { test: true })

			// Simulate some work
			await new Promise((resolve) => setTimeout(resolve, 10))

			endOperation()

			// Give a moment for the metric to be added
			await new Promise((resolve) => setTimeout(resolve, 1))

			const report = monitor.generateReport()
			expect(report.operations).toHaveLength(1)
			expect(report.operations[0].operationName).toBe("test_operation")
			expect(report.operations[0].metadata?.test).toBe(true)
			expect(report.operations[0].duration).toBeGreaterThan(0)
		})

		it("should not track operations when profiling is disabled", () => {
			monitor.updateConfig({ enableProfiling: false })

			const endOperation = monitor.startOperation("test_operation")
			endOperation()

			const report = monitor.generateReport()
			expect(report.operations).toHaveLength(0)
		})

		it("should track memory usage when enabled", async () => {
			const endOperation = monitor.startOperation("memory_test")
			endOperation()

			// Give a moment for the metric to be added
			await new Promise((resolve) => setTimeout(resolve, 1))

			const report = monitor.generateReport()
			expect(report.operations).toHaveLength(1)
			expect(report.operations[0].memoryUsage).toBeDefined()
			expect(report.operations[0].memoryUsage.heapUsed).toBeGreaterThan(0)
		})
	})

	describe("Batch Operations", () => {
		it("should process operations in batches", async () => {
			const operations = Array.from({ length: 5 }, (_, i) => async () => {
				await new Promise((resolve) => setTimeout(resolve, 10))
				return `result_${i}`
			})

			const results = await monitor.batchOperations(operations, "batch_test", { maxConcurrency: 2 })

			expect(results).toHaveLength(5)
			expect(results).toEqual(["result_0", "result_1", "result_2", "result_3", "result_4"])

			// Give a moment for the metrics to be added
			await new Promise((resolve) => setTimeout(resolve, 1))

			const report = monitor.generateReport()
			expect(report.operations.some((op) => op.operationName === "batch_test_batch")).toBe(true)
		})

		it("should respect maxConcurrency limit", async () => {
			const operations = Array.from({ length: 10 }, (_, i) => async () => {
				await new Promise((resolve) => setTimeout(resolve, 10))
				return i
			})

			const startTime = performance.now()
			await monitor.batchOperations(operations, "concurrency_test", { maxConcurrency: 3 })
			const endTime = performance.now()

			// With maxConcurrency of 3, 10 operations should take at least 30ms (3 batches)
			expect(endTime - startTime).toBeGreaterThan(25)
		})
	})

	describe("Performance Requirements", () => {
		it("should pass when performance requirements are met", () => {
			const endOperation = monitor.startOperation("fast_operation")
			endOperation()

			const result = monitor.checkPerformanceRequirements()
			expect(result.met).toBe(true)
			expect(result.issues).toHaveLength(0)
		})

		it("should fail when validation time exceeds limit", () => {
			monitor.updateConfig({ maxValidationTime: 100 }) // Very low limit

			// Simulate slow operation
			const endOperation = monitor.startOperation("slow_operation")
			// Manually set a high duration for testing
			monitor["metrics"].push({
				operationName: "slow_operation",
				startTime: performance.now() - 200,
				endTime: performance.now(),
				duration: 200,
				memoryUsage: process.memoryUsage(),
				metadata: {},
			})

			const result = monitor.checkPerformanceRequirements()
			expect(result.met).toBe(false)
			expect(result.issues.length).toBeGreaterThan(0)
			expect(result.issues[0]).toContain("exceeds requirement")
		})
	})

	describe("Performance Report", () => {
		it("should generate comprehensive performance report", async () => {
			// Add some test operations
			const endOperation1 = monitor.startOperation("operation_1")
			endOperation1()

			const endOperation2 = monitor.startOperation("operation_2")
			endOperation2()

			// Give a moment for the metrics to be added
			await new Promise((resolve) => setTimeout(resolve, 1))

			const report = monitor.generateReport()

			expect(report.totalDuration).toBeGreaterThanOrEqual(0)
			expect(report.operations).toHaveLength(2)
			expect(report.memoryPeak).toBeGreaterThan(0)
			expect(report.memoryAverage).toBeGreaterThan(0)
			expect(report.slowestOperations).toBeDefined()
			expect(report.recommendations).toBeDefined()
			expect(report.summary.totalOperations).toBe(2)
			expect(report.summary.averageOperationTime).toBeGreaterThanOrEqual(0)
			expect(report.summary.memoryEfficiency).toBeGreaterThanOrEqual(0)
		})

		it("should identify slow operations", () => {
			// Add a slow operation
			const slowOp: PerformanceMetrics = {
				operationName: "slow_operation",
				startTime: performance.now() - 1500,
				endTime: performance.now(),
				duration: 1500,
				memoryUsage: process.memoryUsage(),
				metadata: {},
			}

			monitor["metrics"].push(slowOp)

			const report = monitor.generateReport()
			expect(report.slowestOperations).toHaveLength(1)
			expect(report.slowestOperations[0].operationName).toBe("slow_operation")
		})

		it("should generate optimization recommendations", () => {
			// Add multiple slow operations of the same type
			for (let i = 0; i < 5; i++) {
				const slowOp: PerformanceMetrics = {
					operationName: "file_operation",
					startTime: performance.now() - 1000,
					endTime: performance.now(),
					duration: 1000,
					memoryUsage: process.memoryUsage(),
					metadata: {},
				}
				monitor["metrics"].push(slowOp)
			}

			const report = monitor.generateReport()
			expect(report.recommendations.length).toBeGreaterThan(0)
		})
	})

	describe("Memory Management", () => {
		it("should track peak memory usage", () => {
			const initialMemory = monitor.getCurrentMemoryUsage()

			// Simulate memory usage
			const largeArray = new Array(100000).fill("test")

			const endOperation = monitor.startOperation("memory_test")
			endOperation()

			const currentMemory = monitor.getCurrentMemoryUsage()
			const report = monitor.generateReport()

			expect(report.memoryPeak).toBeGreaterThanOrEqual(currentMemory.heapUsed)
		})

		it("should force garbage collection when available", () => {
			const result = monitor.forceGarbageCollection()

			// In test environment, gc might not be available
			expect(typeof result).toBe("boolean")
		})
	})

	describe("Cache Optimization", () => {
		it("should optimize cache by removing old entries", () => {
			// Add old metrics
			const oldMetric: PerformanceMetrics = {
				operationName: "old_operation",
				startTime: Date.now() - 10 * 60 * 1000, // 10 minutes ago
				endTime: Date.now() - 10 * 60 * 1000 + 100,
				duration: 100,
				memoryUsage: process.memoryUsage(),
				metadata: {},
			}

			monitor["metrics"].push(oldMetric)

			monitor.optimizeCache()

			const report = monitor.generateReport()
			expect(report.operations).toHaveLength(0) // Old metric should be removed
		})
	})

	describe("Configuration Updates", () => {
		it("should update configuration", () => {
			const updates = {
				maxValidationTime: 20000,
				memoryThreshold: 150,
				batchSize: 15,
			}

			monitor.updateConfig(updates)

			const config = monitor.getConfig()
			expect(config.maxValidationTime).toBe(20000)
			expect(config.memoryThreshold).toBe(150)
			expect(config.batchSize).toBe(15)
		})
	})

	describe("Reset Functionality", () => {
		it("should reset all metrics", async () => {
			// Add some metrics
			const endOperation = monitor.startOperation("test")
			endOperation()

			// Give a moment for the metric to be added
			await new Promise((resolve) => setTimeout(resolve, 1))

			expect(monitor.generateReport().operations).toHaveLength(1)

			monitor.reset()

			expect(monitor.generateReport().operations).toHaveLength(0)
			expect(monitor["peakMemory"]).toBe(0)
		})
	})

	describe("Memory Efficiency Calculation", () => {
		it("should calculate memory efficiency correctly", () => {
			const report = monitor.generateReport()
			expect(report.summary.memoryEfficiency).toBeGreaterThanOrEqual(0)
			expect(report.summary.memoryEfficiency).toBeLessThanOrEqual(1)
		})
	})
})
