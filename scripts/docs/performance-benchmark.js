#!/usr/bin/env node

/**
 * Performance Benchmarking Script
 * 
 * This script establishes performance baselines and optimizes the validation system by:
 * 1. Measuring current validation performance metrics
 * 2. Establishing performance baselines
 * 3. Implementing performance monitoring
 * 4. Creating performance optimization recommendations
 * 5. Generating performance reports
 */

import fs from 'fs/promises'
import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

// Performance measurement configuration
const BENCHMARK_CONFIG = {
  iterations: 3,
  warmupRuns: 1,
  timeoutMs: 300000, // 5 minutes
  memoryCheck: true,
  cpuCheck: true
}

// Performance baselines (to be updated)
let PERFORMANCE_BASELINES = {
  totalValidationTime: null,
  averageFileProcessingTime: null,
  memoryUsage: null,
  cpuUsage: null,
  fileCount: null,
  errorCount: null,
  warningCount: null,
  lastUpdated: null
}

/**
 * Measure validation performance
 */
async function measureValidationPerformance() {
  console.log('📊 Measuring validation performance...')
  
  const results = {
    iterations: [],
    average: {},
    min: {},
    max: {},
    total: {}
  }
  
  // Warmup run
  console.log('🔥 Running warmup...')
  try {
    execSync('pnpm docs:validate > /dev/null 2>&1', { timeout: BENCHMARK_CONFIG.timeoutMs })
  } catch (error) {
    console.warn('⚠️  Warmup failed:', error.message)
  }
  
  // Performance measurement runs
  for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
    console.log(`📈 Running iteration ${i + 1}/${BENCHMARK_CONFIG.iterations}...`)
    
    const startTime = performance.now()
    const startMemory = process.memoryUsage()
    
    try {
      const output = execSync('pnpm docs:validate', { 
        timeout: BENCHMARK_CONFIG.timeoutMs,
        encoding: 'utf8'
      })
      
      const endTime = performance.now()
      const endMemory = process.memoryUsage()
      
      const iteration = {
        iteration: i + 1,
        duration: endTime - startTime,
        memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
        peakMemory: endMemory.heapUsed,
        output: output
      }
      
      // Parse validation results
      const lines = output.split('\n')
      const lastLine = lines[lines.length - 2] // Second to last line contains summary
      
      if (lastLine && lastLine.includes('messages')) {
        const match = lastLine.match(/(\d+) messages.*?(\d+) errors.*?(\d+) warnings/)
        if (match) {
          iteration.totalMessages = parseInt(match[1])
          iteration.errorCount = parseInt(match[2])
          iteration.warningCount = parseInt(match[3])
        }
      }
      
      results.iterations.push(iteration)
      
    } catch (error) {
      console.error(`❌ Iteration ${i + 1} failed:`, error.message)
      results.iterations.push({
        iteration: i + 1,
        duration: BENCHMARK_CONFIG.timeoutMs,
        memoryUsed: 0,
        peakMemory: 0,
        error: error.message
      })
    }
  }
  
  // Calculate statistics
  const durations = results.iterations.filter(r => !r.error).map(r => r.duration)
  const memoryUsages = results.iterations.filter(r => !r.error).map(r => r.memoryUsed)
  const totalMessages = results.iterations.filter(r => r.totalMessages).map(r => r.totalMessages)
  const errorCounts = results.iterations.filter(r => r.errorCount !== undefined).map(r => r.errorCount)
  const warningCounts = results.iterations.filter(r => r.warningCount !== undefined).map(r => r.warningCount)
  
  if (durations.length > 0) {
    results.average.duration = durations.reduce((a, b) => a + b, 0) / durations.length
    results.min.duration = Math.min(...durations)
    results.max.duration = Math.max(...durations)
  }
  
  if (memoryUsages.length > 0) {
    results.average.memoryUsed = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length
    results.min.memoryUsed = Math.min(...memoryUsages)
    results.max.memoryUsed = Math.max(...memoryUsages)
  }
  
  if (totalMessages.length > 0) {
    results.average.totalMessages = totalMessages.reduce((a, b) => a + b, 0) / totalMessages.length
  }
  
  if (errorCounts.length > 0) {
    results.average.errorCount = errorCounts.reduce((a, b) => a + b, 0) / errorCounts.length
  }
  
  if (warningCounts.length > 0) {
    results.average.warningCount = warningCounts.reduce((a, b) => a + b, 0) / warningCounts.length
  }
  
  return results
}

/**
 * Measure file system performance
 */
async function measureFileSystemPerformance() {
  console.log('📁 Measuring file system performance...')
  
  const { glob } = await import('glob')
  
  const startTime = performance.now()
  const files = await glob('docs/**/*.md', { cwd: process.cwd() })
  const endTime = performance.now()
  
  return {
    fileCount: files.length,
    globTime: endTime - startTime,
    averageFileTime: (endTime - startTime) / files.length
  }
}

/**
 * Measure memory usage patterns
 */
function measureMemoryUsage() {
  console.log('🧠 Measuring memory usage patterns...')
  
  const usage = process.memoryUsage()
  
  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers
  }
}

/**
 * Update performance baselines
 */
async function updatePerformanceBaselines(performanceResults) {
  console.log('📊 Updating performance baselines...')
  
  PERFORMANCE_BASELINES = {
    totalValidationTime: performanceResults.average.duration,
    averageFileProcessingTime: performanceResults.average.duration / (performanceResults.average.totalMessages || 1),
    memoryUsage: performanceResults.average.memoryUsed,
    cpuUsage: null, // TODO: Implement CPU usage measurement
    fileCount: performanceResults.average.totalMessages || 0,
    errorCount: performanceResults.average.errorCount || 0,
    warningCount: performanceResults.average.warningCount || 0,
    lastUpdated: new Date().toISOString()
  }
  
  // Save baselines to file
  await fs.writeFile(
    'scripts/docs/performance-baselines.json',
    JSON.stringify(PERFORMANCE_BASELINES, null, 2),
    'utf8'
  )
  
  console.log('✅ Performance baselines updated and saved')
}

/**
 * Generate performance report
 */
async function generatePerformanceReport(performanceResults, fileSystemResults, memoryResults) {
  console.log('📋 Generating performance report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalValidationTime: performanceResults.average.duration,
      memoryUsage: performanceResults.average.memoryUsed,
      fileCount: fileSystemResults.fileCount,
      errorCount: performanceResults.average.errorCount,
      warningCount: performanceResults.average.warningCount
    },
    detailed: {
      validation: performanceResults,
      fileSystem: fileSystemResults,
      memory: memoryResults
    },
    baselines: PERFORMANCE_BASELINES,
    recommendations: generatePerformanceRecommendations(performanceResults, fileSystemResults, memoryResults)
  }
  
  // Save report to file
  await fs.writeFile(
    'scripts/docs/performance-report.json',
    JSON.stringify(report, null, 2),
    'utf8'
  )
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(report)
  await fs.writeFile(
    'docs/tools/PERFORMANCE_BENCHMARK_REPORT.md',
    markdownReport,
    'utf8'
  )
  
  console.log('✅ Performance report generated')
  return report
}

/**
 * Generate performance recommendations
 */
function generatePerformanceRecommendations(performanceResults, fileSystemResults, memoryResults) {
  const recommendations = []
  
  // Time-based recommendations
  if (performanceResults.average.duration > 60000) { // More than 1 minute
    recommendations.push({
      type: 'performance',
      priority: 'high',
      issue: 'Validation time is too long',
      recommendation: 'Consider parallel processing or caching to reduce validation time'
    })
  }
  
  // Memory-based recommendations
  if (performanceResults.average.memoryUsed > 100 * 1024 * 1024) { // More than 100MB
    recommendations.push({
      type: 'memory',
      priority: 'medium',
      issue: 'High memory usage during validation',
      recommendation: 'Optimize memory usage by processing files in smaller batches'
    })
  }
  
  // File count recommendations
  if (fileSystemResults.fileCount > 200) {
    recommendations.push({
      type: 'scalability',
      priority: 'medium',
      issue: 'Large number of files to process',
      recommendation: 'Consider implementing incremental validation for large file sets'
    })
  }
  
  return recommendations
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  return `# Performance Benchmark Report

> **Performance Fun Fact**: Like a well-tuned engine, good performance comes from proper measurement, optimization, and continuous monitoring! 🚀

## When You're Here

This document provides performance benchmarks and recommendations for the documentation validation system.

- **Purpose**: This document shows performance metrics and optimization recommendations.
- **Context**: Use this as a reference while optimizing the validation system.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Performance Benchmark Report](#performance-benchmark-report)
- [Summary](#summary)
- [Detailed Metrics](#detailed-metrics)
- [Performance Baselines](#performance-baselines)
- [Recommendations](#recommendations)
- [Navigation](#navigation)

## Summary

### Current Performance (${report.timestamp})

| Metric | Value | Status |
|--------|-------|--------|
| **Total Validation Time** | ${(report.summary.totalValidationTime / 1000).toFixed(2)}s | ${report.summary.totalValidationTime < 30000 ? '✅ Good' : '⚠️ Needs Optimization'} |
| **Memory Usage** | ${(report.summary.memoryUsage / 1024 / 1024).toFixed(2)}MB | ${report.summary.memoryUsage < 50 * 1024 * 1024 ? '✅ Good' : '⚠️ High'} |
| **File Count** | ${report.summary.fileCount} | ${report.summary.fileCount < 200 ? '✅ Good' : '⚠️ Large'} |
| **Error Count** | ${report.summary.errorCount} | ${report.summary.errorCount < 100 ? '✅ Good' : '⚠️ Needs Attention'} |
| **Warning Count** | ${report.summary.warningCount} | ${report.summary.warningCount < 1000 ? '✅ Good' : '⚠️ High'} |

## Detailed Metrics

### Validation Performance

- **Average Duration**: ${(report.detailed.validation.average.duration / 1000).toFixed(2)}s
- **Min Duration**: ${(report.detailed.validation.min.duration / 1000).toFixed(2)}s
- **Max Duration**: ${(report.detailed.validation.max.duration / 1000).toFixed(2)}s
- **Iterations**: ${report.detailed.validation.iterations.length}

### File System Performance

- **Total Files**: ${report.detailed.fileSystem.fileCount}
- **Glob Time**: ${report.detailed.fileSystem.globTime.toFixed(2)}ms
- **Average File Time**: ${report.detailed.fileSystem.averageFileTime.toFixed(2)}ms

### Memory Usage

- **RSS**: ${(report.detailed.memory.rss / 1024 / 1024).toFixed(2)}MB
- **Heap Total**: ${(report.detailed.memory.heapTotal / 1024 / 1024).toFixed(2)}MB
- **Heap Used**: ${(report.detailed.memory.heapUsed / 1024 / 1024).toFixed(2)}MB
- **External**: ${(report.detailed.memory.external / 1024 / 1024).toFixed(2)}MB

## Performance Baselines

| Metric | Baseline Value | Last Updated |
|--------|---------------|--------------|
| **Total Validation Time** | ${report.baselines.totalValidationTime ? (report.baselines.totalValidationTime / 1000).toFixed(2) + 's' : 'Not Set'} | ${report.baselines.lastUpdated || 'Never'} |
| **Average File Processing Time** | ${report.baselines.averageFileProcessingTime ? report.baselines.averageFileProcessingTime.toFixed(2) + 'ms' : 'Not Set'} | ${report.baselines.lastUpdated || 'Never'} |
| **Memory Usage** | ${report.baselines.memoryUsage ? (report.baselines.memoryUsage / 1024 / 1024).toFixed(2) + 'MB' : 'Not Set'} | ${report.baselines.lastUpdated || 'Never'} |
| **File Count** | ${report.baselines.fileCount || 'Not Set'} | ${report.baselines.lastUpdated || 'Never'} |
| **Error Count** | ${report.baselines.errorCount || 'Not Set'} | ${report.baselines.lastUpdated || 'Never'} |
| **Warning Count** | ${report.baselines.warningCount || 'Not Set'} | ${report.baselines.lastUpdated || 'Never'} |

## Recommendations

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.issue} (${rec.priority.toUpperCase()} Priority)

**Issue**: ${rec.issue}  
**Recommendation**: ${rec.recommendation}  
**Type**: ${rec.type}
`).join('\n')}

## Navigation

- **Navigation**: [← Back to Documentation Tools](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#performance-benchmark-report)
`
}

/**
 * Load existing performance baselines
 */
async function loadPerformanceBaselines() {
  try {
    const data = await fs.readFile('scripts/docs/performance-baselines.json', 'utf8')
    PERFORMANCE_BASELINES = JSON.parse(data)
    console.log('📊 Loaded existing performance baselines')
  } catch (error) {
    console.log('📊 No existing baselines found, will create new ones')
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Performance Benchmarking Process...\n')
  
  // Step 1: Load existing baselines
  console.log('📊 Step 1: Loading existing performance baselines...')
  await loadPerformanceBaselines()
  
  // Step 2: Measure validation performance
  console.log('\n📈 Step 2: Measuring validation performance...')
  const performanceResults = await measureValidationPerformance()
  
  // Step 3: Measure file system performance
  console.log('\n📁 Step 3: Measuring file system performance...')
  const fileSystemResults = await measureFileSystemPerformance()
  
  // Step 4: Measure memory usage
  console.log('\n🧠 Step 4: Measuring memory usage...')
  const memoryResults = measureMemoryUsage()
  
  // Step 5: Update baselines
  console.log('\n📊 Step 5: Updating performance baselines...')
  await updatePerformanceBaselines(performanceResults)
  
  // Step 6: Generate report
  console.log('\n📋 Step 6: Generating performance report...')
  const report = await generatePerformanceReport(performanceResults, fileSystemResults, memoryResults)
  
  // Summary
  console.log('\n🎉 Performance Benchmarking Complete!')
  console.log(`\n📈 Summary:`)
  console.log(`  - Average validation time: ${(performanceResults.average.duration / 1000).toFixed(2)}s`)
  console.log(`  - Memory usage: ${(performanceResults.average.memoryUsed / 1024 / 1024).toFixed(2)}MB`)
  console.log(`  - Files processed: ${fileSystemResults.fileCount}`)
  console.log(`  - Errors: ${performanceResults.average.errorCount}`)
  console.log(`  - Warnings: ${performanceResults.average.warningCount}`)
  console.log(`  - Recommendations: ${report.recommendations.length}`)
  
  if (report.recommendations.length > 0) {
    console.log('\n⚠️  Performance recommendations available - see report for details')
  } else {
    console.log('\n✅ No performance issues detected')
  }
}

// Run the script
main().catch(console.error)
