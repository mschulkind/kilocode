#!/usr/bin/env node

/**
 * Performance Monitoring for Documentation Validation
 *
 * Tracks and reports on validation performance metrics
 */

import { promises as fs } from "fs"
import path from "path"
import os from "os"

class PerformanceMonitor {
	constructor() {
		this.metrics = {
			timestamp: new Date().toISOString(),
			system: {
				platform: os.platform(),
				arch: os.arch(),
				cpus: os.cpus().length,
				totalMemory: os.totalmem(),
				freeMemory: os.freemem(),
				nodeVersion: process.version,
			},
			validation: {
				startTime: null,
				endTime: null,
				duration: 0,
				filesProcessed: 0,
				filesPerSecond: 0,
				errorsFound: 0,
				warningsFound: 0,
				cacheHits: 0,
				cacheMisses: 0,
				cacheHitRate: 0,
			},
			memory: {
				heapUsed: 0,
				heapTotal: 0,
				external: 0,
				rss: 0,
			},
		}
	}

	start() {
		this.metrics.validation.startTime = Date.now()
		this._updateMemoryUsage()
	}

	end() {
		this.metrics.validation.endTime = Date.now()
		this.metrics.validation.duration = this.metrics.validation.endTime - this.metrics.validation.startTime
		this.metrics.validation.filesPerSecond =
			this.metrics.validation.filesProcessed / (this.metrics.validation.duration / 1000)
		this.metrics.validation.cacheHitRate =
			this.metrics.validation.cacheHits > 0
				? (this.metrics.validation.cacheHits /
						(this.metrics.validation.cacheHits + this.metrics.validation.cacheMisses)) *
					100
				: 0
		this._updateMemoryUsage()
	}

	updateFilesProcessed(count) {
		this.metrics.validation.filesProcessed = count
	}

	updateErrorsFound(count) {
		this.metrics.validation.errorsFound = count
	}

	updateWarningsFound(count) {
		this.metrics.validation.warningsFound = count
	}

	updateCacheStats(hits, misses) {
		this.metrics.validation.cacheHits = hits
		this.metrics.validation.cacheMisses = misses
	}

	_updateMemoryUsage() {
		const usage = process.memoryUsage()
		this.metrics.memory = {
			heapUsed: usage.heapUsed,
			heapTotal: usage.heapTotal,
			external: usage.external,
			rss: usage.rss,
		}
	}

	getMetrics() {
		return this.metrics
	}

	async saveMetrics(filePath) {
		const metricsData = JSON.stringify(this.metrics, null, 2)
		await fs.writeFile(filePath, metricsData)
	}

	async loadMetrics(filePath) {
		try {
			const data = await fs.readFile(filePath, "utf8")
			return JSON.parse(data)
		} catch (error) {
			return null
		}
	}

	generateReport() {
		const metrics = this.metrics

		console.log("\n📊 Performance Report")
		console.log("=".repeat(50))

		console.log("\n🖥️  System Information:")
		console.log(`  Platform: ${metrics.system.platform} ${metrics.system.arch}`)
		console.log(`  CPUs: ${metrics.system.cpus}`)
		console.log(
			`  Memory: ${this._formatBytes(metrics.system.totalMemory)} total, ${this._formatBytes(metrics.system.freeMemory)} free`,
		)
		console.log(`  Node.js: ${metrics.system.nodeVersion}`)

		console.log("\n⚡ Validation Performance:")
		console.log(`  Duration: ${metrics.validation.duration}ms`)
		console.log(`  Files processed: ${metrics.validation.filesProcessed}`)
		console.log(`  Files per second: ${metrics.validation.filesPerSecond.toFixed(2)}`)
		console.log(`  Errors found: ${metrics.validation.errorsFound}`)
		console.log(`  Warnings found: ${metrics.validation.warningsFound}`)

		console.log("\n💾 Cache Performance:")
		console.log(`  Cache hits: ${metrics.validation.cacheHits}`)
		console.log(`  Cache misses: ${metrics.validation.cacheMisses}`)
		console.log(`  Cache hit rate: ${metrics.validation.cacheHitRate.toFixed(1)}%`)

		console.log("\n🧠 Memory Usage:")
		console.log(`  Heap used: ${this._formatBytes(metrics.memory.heapUsed)}`)
		console.log(`  Heap total: ${this._formatBytes(metrics.memory.heapTotal)}`)
		console.log(`  External: ${this._formatBytes(metrics.memory.external)}`)
		console.log(`  RSS: ${this._formatBytes(metrics.memory.rss)}`)

		// Performance recommendations
		console.log("\n💡 Performance Recommendations:")
		this._generateRecommendations()
	}

	_generateRecommendations() {
		const metrics = this.metrics

		if (metrics.validation.filesPerSecond < 10) {
			console.log("  ⚠️  Low processing speed - consider increasing worker count or optimizing validation rules")
		}

		if (metrics.validation.cacheHitRate < 50) {
			console.log("  ⚠️  Low cache hit rate - consider improving cache strategy or increasing cache size")
		}

		if (metrics.memory.heapUsed > metrics.memory.heapTotal * 0.8) {
			console.log("  ⚠️  High memory usage - consider reducing batch size or implementing memory optimization")
		}

		if (metrics.validation.duration > 30000) {
			console.log("  ⚠️  Long validation time - consider implementing incremental validation")
		}

		if (metrics.validation.filesPerSecond > 50 && metrics.validation.cacheHitRate > 80) {
			console.log("  ✅ Excellent performance! System is well optimized")
		}
	}

	_formatBytes(bytes) {
		const sizes = ["Bytes", "KB", "MB", "GB"]
		if (bytes === 0) return "0 Bytes"
		const i = Math.floor(Math.log(bytes) / Math.log(1024))
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
	}
}

// Performance comparison utility
class PerformanceComparator {
	constructor() {
		this.baseline = null
		this.current = null
	}

	async loadBaseline(filePath) {
		this.baseline = await this.loadMetrics(filePath)
	}

	async loadCurrent(filePath) {
		this.current = await this.loadMetrics(filePath)
	}

	async loadMetrics(filePath) {
		try {
			const data = await fs.readFile(filePath, "utf8")
			return JSON.parse(data)
		} catch (error) {
			return null
		}
	}

	compare() {
		if (!this.baseline || !this.current) {
			console.log("❌ Cannot compare - missing baseline or current metrics")
			return
		}

		console.log("\n📈 Performance Comparison")
		console.log("=".repeat(50))

		const baseline = this.baseline.validation
		const current = this.current.validation

		console.log("\n⚡ Speed Comparison:")
		this._compareMetric("Files per second", baseline.filesPerSecond, current.filesPerSecond, "higher")
		this._compareMetric("Duration (ms)", baseline.duration, current.duration, "lower")

		console.log("\n💾 Cache Comparison:")
		this._compareMetric("Cache hit rate (%)", baseline.cacheHitRate, current.cacheHitRate, "higher")
		this._compareMetric("Cache hits", baseline.cacheHits, current.cacheHits, "higher")

		console.log("\n📊 Quality Comparison:")
		this._compareMetric("Files processed", baseline.filesProcessed, current.filesProcessed, "same")
		this._compareMetric("Errors found", baseline.errorsFound, current.errorsFound, "lower")
		this._compareMetric("Warnings found", baseline.warningsFound, current.warningsFound, "lower")
	}

	_compareMetric(name, baseline, current, better) {
		const diff = current - baseline
		const percentChange = baseline !== 0 ? (diff / baseline) * 100 : 0

		let status = "➡️"
		if (better === "higher" && diff > 0) status = "📈"
		else if (better === "higher" && diff < 0) status = "📉"
		else if (better === "lower" && diff < 0) status = "📈"
		else if (better === "lower" && diff > 0) status = "📉"
		else if (better === "same" && Math.abs(diff) < 0.01) status = "➡️"

		console.log(
			`  ${status} ${name}: ${baseline.toFixed(2)} → ${current.toFixed(2)} (${percentChange > 0 ? "+" : ""}${percentChange.toFixed(1)}%)`,
		)
	}
}

// Benchmark utility
class PerformanceBenchmark {
	constructor() {
		this.results = []
	}

	async runBenchmark(validator, testCases) {
		console.log("🏁 Running performance benchmark...")

		for (const testCase of testCases) {
			console.log(`\n📋 Test case: ${testCase.name}`)

			const monitor = new PerformanceMonitor()
			monitor.start()

			try {
				const result = await validator.validate(testCase.rootDir)
				monitor.end()

				const metrics = monitor.getMetrics()
				this.results.push({
					name: testCase.name,
					metrics: metrics,
				})

				console.log(`  ✅ Completed in ${metrics.validation.duration}ms`)
				console.log(`  📁 Files: ${metrics.validation.filesProcessed}`)
				console.log(`  🚀 Speed: ${metrics.validation.filesPerSecond.toFixed(2)} files/sec`)
			} catch (error) {
				console.log(`  ❌ Failed: ${error.message}`)
			}
		}

		this.generateBenchmarkReport()
	}

	generateBenchmarkReport() {
		console.log("\n📊 Benchmark Results")
		console.log("=".repeat(50))

		for (const result of this.results) {
			console.log(`\n${result.name}:`)
			console.log(`  Duration: ${result.metrics.validation.duration}ms`)
			console.log(`  Files/sec: ${result.metrics.validation.filesPerSecond.toFixed(2)}`)
			console.log(`  Cache hit rate: ${result.metrics.validation.cacheHitRate.toFixed(1)}%`)
		}

		// Find best performer
		const best = this.results.reduce((best, current) =>
			current.metrics.validation.filesPerSecond > best.metrics.validation.filesPerSecond ? current : best,
		)

		console.log(
			`\n🏆 Best performer: ${best.name} (${best.metrics.validation.filesPerSecond.toFixed(2)} files/sec)`,
		)
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2)
	const command = args[0]

	switch (command) {
		case "monitor":
			const monitor = new PerformanceMonitor()
			monitor.start()

			// Simulate some work
			await new Promise((resolve) => setTimeout(resolve, 1000))
			monitor.updateFilesProcessed(100)
			monitor.updateErrorsFound(5)
			monitor.updateWarningsFound(10)
			monitor.updateCacheStats(80, 20)

			monitor.end()
			monitor.generateReport()
			break

		case "compare":
			const comparator = new PerformanceComparator()
			await comparator.loadBaseline(args[1])
			await comparator.loadCurrent(args[2])
			comparator.compare()
			break

		case "benchmark":
			console.log("Benchmark functionality requires integration with validator")
			break

		default:
			console.log("Usage:")
			console.log("  node performance-monitor.js monitor")
			console.log("  node performance-monitor.js compare <baseline> <current>")
			console.log("  node performance-monitor.js benchmark")
			break
	}
}

// Export for use as module
export { PerformanceMonitor, PerformanceComparator, PerformanceBenchmark }

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}
