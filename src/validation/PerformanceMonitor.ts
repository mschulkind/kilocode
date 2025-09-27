/**
 * Performance Monitoring and Optimization System
 *
 * Provides comprehensive performance monitoring, profiling, and optimization
 * for the validation system to ensure <30s validation time requirements.
 */

export interface PerformanceMetrics {
	operationName: string
	startTime: number
	endTime: number
	duration: number
	memoryUsage: NodeJS.MemoryUsage
	metadata?: Record<string, any>
}

export interface PerformanceReport {
	totalDuration: number
	operations: PerformanceMetrics[]
	memoryPeak: number
	memoryAverage: number
	slowestOperations: PerformanceMetrics[]
	recommendations: string[]
	summary: {
		totalOperations: number
		averageOperationTime: number
		memoryEfficiency: number
	}
}

export interface OptimizationConfig {
	maxValidationTime: number // milliseconds
	memoryThreshold: number // MB
	enableProfiling: boolean
	enableMemoryMonitoring: boolean
	cacheOptimizations: boolean
	parallelProcessing: boolean
	batchSize: number
}

export class PerformanceMonitor {
	private metrics: PerformanceMetrics[] = []
	private isProfiling = false
	private config: OptimizationConfig
	private startMemory: NodeJS.MemoryUsage
	private peakMemory = 0

	constructor(config: Partial<OptimizationConfig> = {}) {
		this.config = {
			maxValidationTime: 30000, // 30 seconds
			memoryThreshold: 200, // 200 MB
			enableProfiling: true,
			enableMemoryMonitoring: true,
			cacheOptimizations: true,
			parallelProcessing: true,
			batchSize: 10,
			...config,
		}
		this.startMemory = process.memoryUsage()
	}

	/**
	 * Start profiling a performance-sensitive operation
	 */
	startOperation(operationName: string, metadata?: Record<string, any>): () => void {
		if (!this.config.enableProfiling) {
			return () => {} // No-op if profiling disabled
		}

		const startTime = performance.now()
		const memoryUsage = this.config.enableMemoryMonitoring ? process.memoryUsage() : ({} as NodeJS.MemoryUsage)

		return () => {
			const endTime = performance.now()
			const duration = endTime - startTime
			const endMemoryUsage = this.config.enableMemoryMonitoring
				? process.memoryUsage()
				: ({} as NodeJS.MemoryUsage)

			const metric: PerformanceMetrics = {
				operationName,
				startTime,
				endTime,
				duration,
				memoryUsage: endMemoryUsage,
				metadata,
			}

			this.metrics.push(metric)
			if (endMemoryUsage.heapUsed) {
				this.updatePeakMemory(endMemoryUsage.heapUsed)
			}
		}
	}

	/**
	 * Batch multiple operations for parallel processing
	 */
	async batchOperations<T>(
		operations: Array<() => Promise<T>>,
		operationName: string,
		options: { maxConcurrency?: number } = {},
	): Promise<T[]> {
		const maxConcurrency = options.maxConcurrency || this.config.batchSize
		const endOperation = this.startOperation(`${operationName}_batch`, {
			operationCount: operations.length,
			maxConcurrency,
		})

		try {
			// Process operations in batches to control memory usage
			const results: T[] = []
			for (let i = 0; i < operations.length; i += maxConcurrency) {
				const batch = operations.slice(i, i + maxConcurrency)
				const batchResults = await Promise.all(batch.map((op) => op()))
				results.push(...batchResults)

				// Check memory usage between batches
				if (this.config.enableMemoryMonitoring) {
					const currentMemory = process.memoryUsage()
					if (currentMemory.heapUsed > this.config.memoryThreshold * 1024 * 1024) {
						// Force garbage collection if available
						if (global.gc) {
							global.gc()
						}
					}
				}
			}

			return results
		} finally {
			endOperation()
		}
	}

	/**
	 * Optimize cache performance
	 */
	optimizeCache(): void {
		if (!this.config.cacheOptimizations) return

		// Remove expired cache entries
		this.metrics = this.metrics.filter(
			(metric) => Date.now() - metric.startTime < 5 * 60 * 1000, // Keep last 5 minutes
		)

		// Sort metrics by duration for analysis
		this.metrics.sort((a, b) => b.duration - a.duration)
	}

	/**
	 * Check if performance requirements are met
	 */
	checkPerformanceRequirements(): { met: boolean; issues: string[] } {
		const issues: string[] = []
		const totalDuration = this.getTotalDuration()

		if (totalDuration > this.config.maxValidationTime) {
			issues.push(
				`Total validation time (${totalDuration}ms) exceeds requirement (${this.config.maxValidationTime}ms)`,
			)
		}

		if (this.peakMemory > this.config.memoryThreshold * 1024 * 1024) {
			issues.push(
				`Peak memory usage (${this.peakMemory / 1024 / 1024}MB) exceeds threshold (${this.config.memoryThreshold}MB)`,
			)
		}

		const slowOperations = this.getSlowOperations(1000) // Operations > 1s
		if (slowOperations.length > 5) {
			issues.push(`Too many slow operations (${slowOperations.length} > 5)`)
		}

		return {
			met: issues.length === 0,
			issues,
		}
	}

	/**
	 * Generate comprehensive performance report
	 */
	generateReport(): PerformanceReport {
		this.optimizeCache()

		const totalDuration = this.getTotalDuration()
		const operations = [...this.metrics]
		const slowestOperations = this.getSlowOperations(500) // Operations > 500ms

		const memoryUsage = operations.filter((op) => op.memoryUsage.heapUsed).map((op) => op.memoryUsage.heapUsed)

		const memoryAverage =
			memoryUsage.length > 0 ? memoryUsage.reduce((sum, mem) => sum + mem, 0) / memoryUsage.length : 0

		const recommendations = this.generateRecommendations(operations, slowestOperations)

		return {
			totalDuration,
			operations,
			memoryPeak: this.peakMemory,
			memoryAverage,
			slowestOperations,
			recommendations,
			summary: {
				totalOperations: operations.length,
				averageOperationTime: operations.length > 0 ? totalDuration / operations.length : 0,
				memoryEfficiency: this.calculateMemoryEfficiency(),
			},
		}
	}

	/**
	 * Get operations that exceed the specified duration threshold
	 */
	private getSlowOperations(thresholdMs: number): PerformanceMetrics[] {
		return this.metrics.filter((op) => op.duration > thresholdMs).sort((a, b) => b.duration - a.duration)
	}

	/**
	 * Get total duration of all operations
	 */
	private getTotalDuration(): number {
		if (this.metrics.length === 0) return 0

		const startTime = Math.min(...this.metrics.map((op) => op.startTime))
		const endTime = Math.max(...this.metrics.map((op) => op.endTime))

		return endTime - startTime
	}

	/**
	 * Update peak memory usage
	 */
	private updatePeakMemory(currentMemory: number): void {
		if (currentMemory > this.peakMemory) {
			this.peakMemory = currentMemory
		}
	}

	/**
	 * Generate optimization recommendations
	 */
	private generateRecommendations(operations: PerformanceMetrics[], slowOperations: PerformanceMetrics[]): string[] {
		const recommendations: string[] = []

		// Analyze slow operations
		const operationGroups = this.groupOperationsByType(slowOperations)
		for (const [operationType, ops] of Object.entries(operationGroups)) {
			if (ops.length > 2) {
				recommendations.push(`Consider optimizing ${operationType} operations (${ops.length} slow instances)`)
			}
		}

		// Memory usage recommendations
		if (this.peakMemory > this.config.memoryThreshold * 1024 * 1024 * 0.8) {
			recommendations.push("Memory usage is high - consider implementing memory cleanup strategies")
		}

		// Caching recommendations
		const cacheableOperations = operations.filter(
			(op) => op.operationName.includes("file") || op.operationName.includes("validation"),
		)
		if (cacheableOperations.length > 10) {
			recommendations.push("Consider implementing more aggressive caching for file operations")
		}

		// Parallel processing recommendations
		const sequentialOperations = operations.filter((op) => op.metadata?.parallel === false)
		if (sequentialOperations.length > 5) {
			recommendations.push("Consider parallelizing sequential operations")
		}

		return recommendations
	}

	/**
	 * Group operations by type for analysis
	 */
	private groupOperationsByType(operations: PerformanceMetrics[]): Record<string, PerformanceMetrics[]> {
		const groups: Record<string, PerformanceMetrics[]> = {}

		for (const op of operations) {
			const type = op.operationName.split("_")[0] // Get operation type
			if (!groups[type]) {
				groups[type] = []
			}
			groups[type].push(op)
		}

		return groups
	}

	/**
	 * Calculate memory efficiency score
	 */
	private calculateMemoryEfficiency(): number {
		if (this.metrics.length === 0) return 1

		const memoryGrowth = this.peakMemory - this.startMemory.heapUsed
		const maxAllowedGrowth = this.config.memoryThreshold * 1024 * 1024

		return Math.max(0, 1 - memoryGrowth / maxAllowedGrowth)
	}

	/**
	 * Reset all performance metrics
	 */
	reset(): void {
		this.metrics = []
		this.startMemory = process.memoryUsage()
		this.peakMemory = 0
	}

	/**
	 * Get current memory usage
	 */
	getCurrentMemoryUsage(): NodeJS.MemoryUsage {
		return process.memoryUsage()
	}

	/**
	 * Force garbage collection if available
	 */
	forceGarbageCollection(): boolean {
		if (global.gc) {
			global.gc()
			return true
		}
		return false
	}

	/**
	 * Get configuration
	 */
	getConfig(): OptimizationConfig {
		return { ...this.config }
	}

	/**
	 * Update configuration
	 */
	updateConfig(updates: Partial<OptimizationConfig>): void {
		this.config = { ...this.config, ...updates }
	}
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor()
