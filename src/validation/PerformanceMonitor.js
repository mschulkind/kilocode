/**
 * Performance Monitoring and Optimization System
 *
 * Provides comprehensive performance monitoring, profiling, and optimization
 * for the validation system to ensure <30s validation time requirements.
 */
export class PerformanceMonitor {
    constructor(config = {}) {
        this.metrics = [];
        this.isProfiling = false;
        this.peakMemory = 0;
        this.config = {
            maxValidationTime: 30000, // 30 seconds
            memoryThreshold: 200, // 200 MB
            enableProfiling: true,
            enableMemoryMonitoring: true,
            cacheOptimizations: true,
            parallelProcessing: true,
            batchSize: 10,
            ...config,
        };
        this.startMemory = process.memoryUsage();
    }
    /**
     * Start profiling a performance-sensitive operation
     */
    startOperation(operationName, metadata) {
        if (!this.config.enableProfiling) {
            return () => { }; // No-op if profiling disabled
        }
        const startTime = performance.now();
        const memoryUsage = this.config.enableMemoryMonitoring ? process.memoryUsage() : {};
        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            const endMemoryUsage = this.config.enableMemoryMonitoring
                ? process.memoryUsage()
                : {};
            const metric = {
                operationName,
                startTime,
                endTime,
                duration,
                memoryUsage: endMemoryUsage,
                metadata,
            };
            this.metrics.push(metric);
            if (endMemoryUsage.heapUsed) {
                this.updatePeakMemory(endMemoryUsage.heapUsed);
            }
        };
    }
    /**
     * Batch multiple operations for parallel processing
     */
    async batchOperations(operations, operationName, options = {}) {
        const maxConcurrency = options.maxConcurrency || this.config.batchSize;
        const endOperation = this.startOperation(`${operationName}_batch`, {
            operationCount: operations.length,
            maxConcurrency,
        });
        try {
            // Process operations in batches to control memory usage
            const results = [];
            for (let i = 0; i < operations.length; i += maxConcurrency) {
                const batch = operations.slice(i, i + maxConcurrency);
                const batchResults = await Promise.all(batch.map((op) => op()));
                results.push(...batchResults);
                // Check memory usage between batches
                if (this.config.enableMemoryMonitoring) {
                    const currentMemory = process.memoryUsage();
                    if (currentMemory.heapUsed > this.config.memoryThreshold * 1024 * 1024) {
                        // Force garbage collection if available
                        if (global.gc) {
                            global.gc();
                        }
                    }
                }
            }
            return results;
        }
        finally {
            endOperation();
        }
    }
    /**
     * Optimize cache performance
     */
    optimizeCache() {
        if (!this.config.cacheOptimizations)
            return;
        // Remove expired cache entries
        this.metrics = this.metrics.filter((metric) => Date.now() - metric.startTime < 5 * 60 * 1000);
        // Sort metrics by duration for analysis
        this.metrics.sort((a, b) => b.duration - a.duration);
    }
    /**
     * Check if performance requirements are met
     */
    checkPerformanceRequirements() {
        const issues = [];
        const totalDuration = this.getTotalDuration();
        if (totalDuration > this.config.maxValidationTime) {
            issues.push(`Total validation time (${totalDuration}ms) exceeds requirement (${this.config.maxValidationTime}ms)`);
        }
        if (this.peakMemory > this.config.memoryThreshold * 1024 * 1024) {
            issues.push(`Peak memory usage (${this.peakMemory / 1024 / 1024}MB) exceeds threshold (${this.config.memoryThreshold}MB)`);
        }
        const slowOperations = this.getSlowOperations(1000); // Operations > 1s
        if (slowOperations.length > 5) {
            issues.push(`Too many slow operations (${slowOperations.length} > 5)`);
        }
        return {
            met: issues.length === 0,
            issues,
        };
    }
    /**
     * Generate comprehensive performance report
     */
    generateReport() {
        this.optimizeCache();
        const totalDuration = this.getTotalDuration();
        const operations = [...this.metrics];
        const slowestOperations = this.getSlowOperations(500); // Operations > 500ms
        const memoryUsage = operations.filter((op) => op.memoryUsage.heapUsed).map((op) => op.memoryUsage.heapUsed);
        const memoryAverage = memoryUsage.length > 0 ? memoryUsage.reduce((sum, mem) => sum + mem, 0) / memoryUsage.length : 0;
        const recommendations = this.generateRecommendations(operations, slowestOperations);
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
        };
    }
    /**
     * Get operations that exceed the specified duration threshold
     */
    getSlowOperations(thresholdMs) {
        return this.metrics.filter((op) => op.duration > thresholdMs).sort((a, b) => b.duration - a.duration);
    }
    /**
     * Get total duration of all operations
     */
    getTotalDuration() {
        if (this.metrics.length === 0)
            return 0;
        const startTime = Math.min(...this.metrics.map((op) => op.startTime));
        const endTime = Math.max(...this.metrics.map((op) => op.endTime));
        return endTime - startTime;
    }
    /**
     * Update peak memory usage
     */
    updatePeakMemory(currentMemory) {
        if (currentMemory > this.peakMemory) {
            this.peakMemory = currentMemory;
        }
    }
    /**
     * Generate optimization recommendations
     */
    generateRecommendations(operations, slowOperations) {
        const recommendations = [];
        // Analyze slow operations
        const operationGroups = this.groupOperationsByType(slowOperations);
        for (const [operationType, ops] of Object.entries(operationGroups)) {
            if (ops.length > 2) {
                recommendations.push(`Consider optimizing ${operationType} operations (${ops.length} slow instances)`);
            }
        }
        // Memory usage recommendations
        if (this.peakMemory > this.config.memoryThreshold * 1024 * 1024 * 0.8) {
            recommendations.push("Memory usage is high - consider implementing memory cleanup strategies");
        }
        // Caching recommendations
        const cacheableOperations = operations.filter((op) => op.operationName.includes("file") || op.operationName.includes("validation"));
        if (cacheableOperations.length > 10) {
            recommendations.push("Consider implementing more aggressive caching for file operations");
        }
        // Parallel processing recommendations
        const sequentialOperations = operations.filter((op) => op.metadata?.parallel === false);
        if (sequentialOperations.length > 5) {
            recommendations.push("Consider parallelizing sequential operations");
        }
        return recommendations;
    }
    /**
     * Group operations by type for analysis
     */
    groupOperationsByType(operations) {
        const groups = {};
        for (const op of operations) {
            const type = op.operationName.split("_")[0]; // Get operation type
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(op);
        }
        return groups;
    }
    /**
     * Calculate memory efficiency score
     */
    calculateMemoryEfficiency() {
        if (this.metrics.length === 0)
            return 1;
        const memoryGrowth = this.peakMemory - this.startMemory.heapUsed;
        const maxAllowedGrowth = this.config.memoryThreshold * 1024 * 1024;
        return Math.max(0, 1 - memoryGrowth / maxAllowedGrowth);
    }
    /**
     * Reset all performance metrics
     */
    reset() {
        this.metrics = [];
        this.startMemory = process.memoryUsage();
        this.peakMemory = 0;
    }
    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage() {
        return process.memoryUsage();
    }
    /**
     * Force garbage collection if available
     */
    forceGarbageCollection() {
        if (global.gc) {
            global.gc();
            return true;
        }
        return false;
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
}
/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor();
