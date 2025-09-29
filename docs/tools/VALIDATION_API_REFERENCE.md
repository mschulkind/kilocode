# Validation System API Reference

## Table of Contents

* [Validation System API Reference](#validation-system-api-reference)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Overview](#overview)
* [CrossReferenceValidator](#crossreferencevalidator)
* [Constructor](#constructor)
* [Methods](#methods)
* [validateFile(filePath: string): Promise](#validatefilefilepath-string-promise)
* [validateAnchor(filePath: string, anchor: string): Promise](#validateanchorfilepath-string-anchor-string-promise)
* [validateCrossReference(reference: string): Promise](#validatecrossreferencereference-string-promise)
* [Interfaces](#interfaces)
* [FileIndexBuilder](#fileindexbuilder)
* [Constructor](#constructor)
* [Methods](#methods)
* [buildIndex(rootPath?: string): Promise](#buildindexrootpath-string-promise)
* [getFileInfo(filePath: string): FileInfo | null](#getfileinfofilepath-string-fileinfo-null)
* [isFileCached(filePath: string): boolean](#isfilecachedfilepath-string-boolean)
* [updateFile(filePath: string): Promise](#updatefilefilepath-string-promise)
* [Interfaces](#interfaces)
* [DocumentTypeDetector](#documenttypedetector)
* [Constructor](#constructor)
* [Methods](#methods)
* [detectType(filePath: string, content: string, structure: string): DocumentTypeResult](#detecttypefilepath-string-content-string-structure-string-documenttyperesult)
* [getTypeInfo(type: string): TypeInfo | null](#gettypeinfotype-string-typeinfo-null)
* [Interfaces](#interfaces)
* [OrphanedSectionsDetector](#orphanedsectionsdetector)
* [Constructor](#constructor)
* [Methods](#methods)
* [detectOrphanedSections(filePath: string, content: string): DetectionResult](#detectorphanedsectionsfilepath-string-content-string-detectionresult)
* [Interfaces](#interfaces)
* [ValidationRuleConfig](#validationruleconfig)
* [Constructor](#constructor)
* [Methods](#methods)
* [getRulesForDocument(filePath: string, content: string, structure: string): Record\<string, ValidationRule>](#getrulesfordocumentfilepath-string-content-string-structure-string-recordstring-validationrule)
* [getRuleValue(ruleName: string, filePath: string, content: string, structure: string): any](#getrulevaluerulename-string-filepath-string-content-string-structure-string-any)
* [isRuleEnabled(ruleName: string, filePath: string, content: string, structure: string): boolean](#isruleenabledrulename-string-filepath-string-content-string-structure-string-boolean)
* [updateRuleSet(type: string, ruleSet: RuleSet): void](#updaterulesettype-string-ruleset-ruleset-void)
* [Interfaces](#interfaces)
* [PerformanceMonitor](#performancemonitor)
* [Constructor](#constructor)
* [Methods](#methods)
* [startOperation(operationName: string, metadata?: Record\<string, any>): () => void](#startoperationoperationname-string-metadata-recordstring-any-void)
* [batchOperations](#batchoperations)
* [generateReport(): PerformanceReport](#generatereport-performancereport)
* [checkPerformanceRequirements(): { met: boolean; issues: string\[\] }](#checkperformancerequirements-met-boolean-issues-string-)
* [Interfaces](#interfaces)
* [PerformanceOptimizer](#performanceoptimizer)
* [Constructor](#constructor)
* [Methods](#methods)
* [optimizeAll(): Promise\<OptimizationResult\[\]>](#optimizeall-promiseoptimizationresult)
* [optimizeValidationComponents(): Promise](#optimizevalidationcomponents-promise)
* [getOptimizationReport(): { currentPerformance: any; recommendations: string\[\]; estimatedImprovements: Record\<string, number> }](#getoptimizationreport-currentperformance-any-recommendations-string-estimatedimprovements-recordstring-number-)
* [addStrategy(strategy: OptimizationStrategy): void](#addstrategystrategy-optimizationstrategy-void)
* [removeStrategy(strategyName: string): boolean](#removestrategystrategyname-string-boolean)
* [Interfaces](#interfaces)
* [Global Instances](#global-instances)
* [globalPerformanceMonitor](#globalperformancemonitor)
* [globalPerformanceOptimizer](#globalperformanceoptimizer)
* [Common Error Types](#common-error-types)
* [ValidationError](#validationerror)
* [PerformanceError](#performanceerror)
* [Error Handling Examples](#error-handling-examples)
* [Common Types](#common-types)
* [Utility Types](#utility-types)
* [Constants](#constants)
* [Default Configuration](#default-configuration)
* [Supported File Extensions](#supported-file-extensions)
* [Document Type Patterns](#document-type-patterns)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation](#navigation)
* [Navigation](#navigation)
* [Validation System API Reference](#validation-system-api-reference)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Overview](#overview)
* [CrossReferenceValidator](#crossreferencevalidator)
* [Constructor](#constructor)
* [Methods](#methods)
* [validateFile(filePath: string): Promise](#validatefilefilepath-string-promise)
* [validateAnchor(filePath: string, anchor: string): Promise](#validateanchorfilepath-string-anchor-string-promise)
* [validateCrossReference(reference: string): Promise](#validatecrossreferencereference-string-promise)
* [Interfaces](#interfaces)
* [FileIndexBuilder](#fileindexbuilder)
* [Constructor](#constructor)
* [Methods](#methods)
* [buildIndex(rootPath?: string): Promise](#buildindexrootpath-string-promise)
* [getFileInfo(filePath: string): FileInfo | null](#getfileinfofilepath-string-fileinfo-null)
* [isFileCached(filePath: string): boolean](#isfilecachedfilepath-string-boolean)
* [updateFile(filePath: string): Promise](#updatefilefilepath-string-promise)
* [Interfaces](#interfaces)
* [DocumentTypeDetector](#documenttypedetector)
* [Constructor](#constructor)
* [Methods](#methods)
* [detectType(filePath: string, content: string, structure: string): DocumentTypeResult](#detecttypefilepath-string-content-string-structure-string-documenttyperesult)
* [getTypeInfo(type: string): TypeInfo | null](#gettypeinfotype-string-typeinfo-null)
* [Interfaces](#interfaces)
* [OrphanedSectionsDetector](#orphanedsectionsdetector)
* [Constructor](#constructor)
* [Methods](#methods)
* [detectOrphanedSections(filePath: string, content: string): DetectionResult](#detectorphanedsectionsfilepath-string-content-string-detectionresult)
* [Interfaces](#interfaces)
* [ValidationRuleConfig](#validationruleconfig)
* [Constructor](#constructor)
* [Methods](#methods)
* [getRulesForDocument(filePath: string, content: string, structure: string): Record\<string, ValidationRule>](#getrulesfordocumentfilepath-string-content-string-structure-string-recordstring-validationrule)
* [getRuleValue(ruleName: string, filePath: string, content: string, structure: string): any](#getrulevaluerulename-string-filepath-string-content-string-structure-string-any)
* [isRuleEnabled(ruleName: string, filePath: string, content: string, structure: string): boolean](#isruleenabledrulename-string-filepath-string-content-string-structure-string-boolean)
* [updateRuleSet(type: string, ruleSet: RuleSet): void](#updaterulesettype-string-ruleset-ruleset-void)
* [Interfaces](#interfaces)
* [PerformanceMonitor](#performancemonitor)
* [Constructor](#constructor)
* [Methods](#methods)
* [startOperation(operationName: string, metadata?: Record\<string, any>): () => void](#startoperationoperationname-string-metadata-recordstring-any-void)
* [batchOperations](#batchoperations)
* [generateReport(): PerformanceReport](#generatereport-performancereport)
* [checkPerformanceRequirements(): { met: boolean; issues: string\[\] }](#checkperformancerequirements-met-boolean-issues-string-)
* [Interfaces](#interfaces)
* [PerformanceOptimizer](#performanceoptimizer)
* [Constructor](#constructor)
* [Methods](#methods)
* [optimizeAll(): Promise\<OptimizationResult\[\]>](#optimizeall-promiseoptimizationresult)
* [optimizeValidationComponents(): Promise](#optimizevalidationcomponents-promise)
* [getOptimizationReport(): { currentPerformance: any; recommendations: string\[\]; estimatedImprovements: Record\<string, number> }](#getoptimizationreport-currentperformance-any-recommendations-string-estimatedimprovements-recordstring-number-)
* [addStrategy(strategy: OptimizationStrategy): void](#addstrategystrategy-optimizationstrategy-void)
* [removeStrategy(strategyName: string): boolean](#removestrategystrategyname-string-boolean)
* [Interfaces](#interfaces)
* [Global Instances](#global-instances)
* [globalPerformanceMonitor](#globalperformancemonitor)
* [globalPerformanceOptimizer](#globalperformanceoptimizer)
* [Common Error Types](#common-error-types)
* [ValidationError](#validationerror)
* [PerformanceError](#performanceerror)
* [Error Handling Examples](#error-handling-examples)
* [Common Types](#common-types)
* [Utility Types](#utility-types)
* [Constants](#constants)
* [Default Configuration](#default-configuration)
* [Supported File Extensions](#supported-file-extensions)
* [Document Type Patterns](#document-type-patterns)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation](#navigation)
* ↑ [Table of Contents](#table-of-contents)

## When You're Here

🔍 **Did You Know**: \[Interesting insight]

This document provides \[purpose of document].

* **Purpose**: \[Brief description of what this document covers]
* **Context**: \[How this fits into the broader system/project]
* **Navigation**: Use the table of contents below to jump to specific topics

## Research Context

### Technical Overview

**Component**: \[Component name]
**Version**: \[Version number]
**Architecture**: \[Architecture description]
**Dependencies**: \[Key dependencies]

### Background

\[Background information about the topic]

### Methodology

\[Research or development methodology used]

## Overview

This document provides comprehensive API reference for the Zero Warnings Validation System
components and interfaces.

**Related Links:**

* [Related Documentation](./docs/tools/related-doc.md)
* [Additional Resources](./docs/tools/resources.md)## Core Components

### CrossReferenceValidator

Validates file references and anchor links within documents.

#### Constructor

```typescript
constructor(options: ValidationOptions = {})
```

**Parameters:**

* `options` (optional): Configuration options for the validator

**Example:**

```javascript
import { CrossReferenceValidator } from './src/validation/CrossReferenceValidator.js'

const validator = new CrossReferenceValidator({
  ttl: 5 * 60 * 1000, // 5 minutes cache TTL
  maxCacheSize: 1000 // Maximum cache entries
})
```

#### Methods

##### validateFile(filePath: string): Promise<FileValidationResult>

Validates if a file exists and returns file metadata.

**Parameters:**

* `filePath`: Path to the file to validate

**Returns:** Promise resolving to `FileValidationResult`

**Example:**

```javascript
const result = await validator.validateFile('./docs/guide.md')
console.log(`File exists: ${result.exists}`)
console.log(`Last modified: ${result.lastModified}`)
```

##### validateAnchor(filePath: string, anchor: string): Promise<AnchorValidationResult>

Validates if an anchor exists within a file.

**Parameters:**

* `filePath`: Path to the file containing the anchor
* `anchor`: Anchor name to validate

**Returns:** Promise resolving to `AnchorValidationResult`

**Example:**

```javascript
const result = await validator.validateAnchor('./docs/guide.md', 'installation')
console.log(`Anchor exists: ${result.exists}`)
```

##### validateCrossReference(reference: string): Promise<CrossReferenceResult>

Validates a complete cross-reference (file + optional anchor).

**Parameters:**

* `reference`: Cross-reference string (e.g., "./file.md#anchor")

**Returns:** Promise resolving to `CrossReferenceResult`

**Example:**

```javascript
const result = await validator.validateCrossReference('./docs/guide.md#installation')
console.log(`File exists: ${result.fileExists}`)
console.log(`Anchor exists: ${result.anchorExists}`)
```

#### Interfaces

```typescript
interface ValidationOptions {
  ttl?: number // Cache TTL in milliseconds
  maxCacheSize?: number // Maximum cache entries
}

interface FileValidationResult {
  exists: boolean
  isFile: boolean
  lastModified: Date | null
  cached: boolean
  error?: string
}

interface AnchorValidationResult {
  exists: boolean
  anchor: string
  filePath: string
  cached: boolean
  error?: string
}

interface CrossReferenceResult {
  reference: string
  filePath: string
  anchor: string | null
  fileExists: boolean
  anchorExists: boolean
  cached: boolean
  error?: string
}
```

### FileIndexBuilder

Maintains an index of all markdown files for efficient lookup.

#### Constructor

```typescript
constructor(options: FileIndexBuilderOptions = {})
```

**Parameters:**

* `options` (optional): Configuration options for the index builder

**Example:**

```javascript
import { FileIndexBuilder } from './src/validation/FileIndexBuilder.js'

const builder = new FileIndexBuilder({
  maxDepth: 10,
  excludePatterns: ['node_modules', '.git'],
  includeExtensions: ['.md', '.markdown']
})
```

#### Methods

##### buildIndex(rootPath?: string): Promise<BuildIndexResult>

Builds an index of all markdown files in the specified directory.

**Parameters:**

* `rootPath` (optional): Root directory to index (defaults to current directory)

**Returns:** Promise resolving to `BuildIndexResult`

**Example:**

```javascript
const result = await builder.buildIndex('/path/to/docs')
console.log(`Indexed ${result.files.length} files`)
console.log(`Found ${result.totalDirectories} directories`)
```

##### getFileInfo(filePath: string): FileInfo | null

Gets information about a specific file from the index.

**Parameters:**

* `filePath`: Path to the file

**Returns:** `FileInfo` object or `null` if not found

**Example:**

```javascript
const fileInfo = builder.getFileInfo('./docs/guide.md')
if (fileInfo) {
  console.log(`File size: ${fileInfo.size} bytes`)
  console.log(`Last modified: ${fileInfo.lastModified}`)
}
```

##### isFileCached(filePath: string): boolean

Checks if file information is cached.

**Parameters:**

* `filePath`: Path to the file

**Returns:** `true` if cached, `false` otherwise

**Example:**

```javascript
const isCached = builder.isFileCached('./docs/guide.md')
console.log(`File is cached: ${isCached}`)
```

##### updateFile(filePath: string): Promise<UpdateResult>

Updates information for a specific file in the index.

**Parameters:**

* `filePath`: Path to the file to update

**Returns:** Promise resolving to `UpdateResult`

**Example:**

```javascript
const result = await builder.updateFile('./docs/guide.md')
console.log(`File updated: ${result.changed}`)
```

#### Interfaces

```typescript
interface FileIndexBuilderOptions {
  maxDepth?: number
  excludePatterns?: string[]
  includeExtensions?: string[]
  enableCaching?: boolean
}

interface BuildIndexResult {
  files: FileEntry[]
  errors: BuildError[]
  totalDirectories: number
  totalFiles: number
}

interface FileEntry {
  path: string
  directory: string
  extension: string
  size: number
  lastModified: Date
}

interface BuildError {
  path: string
  error: string
}

interface FileInfo {
  path: string
  directory: string
  extension: string
  size: number
  lastModified: Date
}

interface UpdateResult {
  changed: boolean
  file: FileInfo | null
  error?: string
}
```

### DocumentTypeDetector

Intelligently detects document types based on various factors.

#### Constructor

```typescript
constructor()
```

**Example:**

```javascript
import { DocumentTypeDetector } from './src/validation/DocumentTypeDetector.js'

const detector = new DocumentTypeDetector()
```

#### Methods

##### detectType(filePath: string, content: string, structure: string): DocumentTypeResult

Detects the type of a document based on path, content, and structure.

**Parameters:**

* `filePath`: Path to the document file
* `content`: Document content
* `structure`: Document structure information

**Returns:** `DocumentTypeResult` object

**Example:**

```javascript
const result = detector.detectType(
  '/docs/README.md',
  '# Project Documentation\n\nThis is the main documentation...',
  'h1, h2, h3'
)

console.log(`Document type: ${result.type}`)
console.log(`Confidence: ${result.confidence}`)
console.log(`Reasons: ${result.reasons.join(', ')}`)
```

##### getTypeInfo(type: string): TypeInfo | null

Gets information about a specific document type.

**Parameters:**

* `type`: Document type name

**Returns:** `TypeInfo` object or `null` if not found

**Example:**

```javascript
const typeInfo = detector.getTypeInfo('navigation')
if (typeInfo) {
  console.log(`Type name: ${typeInfo.name}`)
  console.log(`Description: ${typeInfo.description}`)
}
```

#### Interfaces

```typescript
interface DocumentTypeResult {
  type: string
  confidence: number
  reasons: string[]
}

interface TypeInfo {
  name: string
  description: string
  patterns: string[]
  characteristics: string[]
}
```

### OrphanedSectionsDetector

Identifies orphaned sections with context-aware logic.

#### Constructor

```typescript
constructor(options: OrphanedSectionsDetectorOptions)
```

**Parameters:**

* `options`: Configuration options for the detector

**Example:**

```javascript
import { OrphanedSectionsDetector } from './src/validation/OrphanedSectionsDetector.js'

const detector = new OrphanedSectionsDetector({
  fileIndexBuilder: fileIndexBuilder,
  documentTypeDetector: documentTypeDetector,
  minSectionLength: 50,
  maxOrphanedSections: 10
})
```

#### Methods

##### detectOrphanedSections(filePath: string, content: string): DetectionResult

Detects orphaned sections in a document.

**Parameters:**

* `filePath`: Path to the document file
* `content`: Document content

**Returns:** `DetectionResult` object

**Example:**

```javascript
const result = detector.detectOrphanedSections(
  '/docs/guide.md',
  '# Guide\n\n## Introduction\n\nThis is an introduction...'
)

console.log(`Found ${result.orphanedSections.length} orphaned sections`)
console.log(`Total sections: ${result.totalSections}`)
```

#### Interfaces

```typescript
interface OrphanedSectionsDetectorOptions {
  fileIndexBuilder: FileIndexBuilder
  documentTypeDetector: DocumentTypeDetector
  minSectionLength?: number
  maxOrphanedSections?: number
  ignoreNavigationDocuments?: boolean
  ignorePlanningDocuments?: boolean
  contextWindowSize?: number
}

interface DetectionResult {
  orphanedSections: OrphanedSection[]
  totalSections: number
  documentType: string
  confidence: number
  reason: string
  errors: string[]
}

interface OrphanedSection {
  title: string
  level: number
  startLine: number
  endLine: number
  length: number
  confidence: number
  reasons: string[]
  hasCodeBlocks: boolean
  referenceCount: number
}
```

### ValidationRuleConfig

Manages validation rules based on document type.

#### Constructor

```typescript
constructor(options: ValidationRuleConfigOptions)
```

**Parameters:**

* `options`: Configuration options for the rule config

**Example:**

```javascript
import { ValidationRuleConfig } from './src/validation/ValidationRuleConfig.js'

const config = new ValidationRuleConfig({
  documentTypeDetector: documentTypeDetector,
  ruleSets: {
    navigation: {
      name: 'Navigation Rules',
      rules: {
        maxLineLength: { enabled: true, value: 120 },
        requireHeadings: { enabled: true, value: true }
      }
    }
  }
})
```

#### Methods

##### getRulesForDocument(filePath: string, content: string, structure: string): Record\<string, ValidationRule>

Gets validation rules for a specific document.

**Parameters:**

* `filePath`: Path to the document file
* `content`: Document content
* `structure`: Document structure information

**Returns:** Object containing validation rules

**Example:**

```javascript
const rules = config.getRulesForDocument(
  '/docs/README.md',
  '# Project Documentation',
  'h1, h2'
)

console.log(`Max line length: ${rules.maxLineLength.value}`)
console.log(`Require headings: ${rules.requireHeadings.value}`)
```

##### getRuleValue(ruleName: string, filePath: string, content: string, structure: string): any

Gets the value of a specific validation rule for a document.

**Parameters:**

* `ruleName`: Name of the rule
* `filePath`: Path to the document file
* `content`: Document content
* `structure`: Document structure information

**Returns:** Rule value or `undefined` if not found

**Example:**

```javascript
const maxLineLength = config.getRuleValue(
  'maxLineLength',
  '/docs/README.md',
  '# Project Documentation',
  'h1, h2'
)

console.log(`Max line length: ${maxLineLength}`)
```

##### isRuleEnabled(ruleName: string, filePath: string, content: string, structure: string): boolean

Checks if a specific validation rule is enabled for a document.

**Parameters:**

* `ruleName`: Name of the rule
* `filePath`: Path to the document file
* `content`: Document content
* `structure`: Document structure information

**Returns:** `true` if enabled, `false` otherwise

**Example:**

```javascript
const isEnabled = config.isRuleEnabled(
  'requireHeadings',
  '/docs/README.md',
  '# Project Documentation',
  'h1, h2'
)

console.log(`Rule enabled: ${isEnabled}`)
```

##### updateRuleSet(type: string, ruleSet: RuleSet): void

Updates a rule set for a specific document type.

**Parameters:**

* `type`: Document type name
* `ruleSet`: New rule set configuration

**Example:**

```javascript
config.updateRuleSet('technical', {
  name: 'Technical Rules',
  rules: {
    maxLineLength: { enabled: true, value: 100 },
    requireHeadings: { enabled: true, value: true }
  }
})
```

#### Interfaces

```typescript
interface ValidationRuleConfigOptions {
  documentTypeDetector: DocumentTypeDetector
  ruleSets?: Record<string, RuleSet>
}

interface ValidationRule {
  enabled: boolean
  value: any
}

interface RuleSet {
  name: string
  rules: Record<string, ValidationRule>
}

interface ValidationRuleConfigOptions {
  documentTypeDetector: DocumentTypeDetector
  ruleSets?: Record<string, RuleSet>
}
```

### PerformanceMonitor

Tracks and monitors validation performance.

#### Constructor

```typescript
constructor(config: Partial<OptimizationConfig> = {})
```

**Parameters:**

* `config` (optional): Configuration options for the monitor

**Example:**

```javascript
import { PerformanceMonitor } from './src/validation/PerformanceMonitor.js'

const monitor = new PerformanceMonitor({
  maxValidationTime: 30000,
  memoryThreshold: 200,
  enableProfiling: true
})
```

#### Methods

##### startOperation(operationName: string, metadata?: Record\<string, any>): () => void

Starts tracking a performance-sensitive operation.

**Parameters:**

* `operationName`: Name of the operation
* `metadata` (optional): Additional metadata for the operation

**Returns:** Function to call when the operation ends

**Example:**

```javascript
const endOperation = monitor.startOperation('validation', {
  fileCount: 100,
  documentType: 'technical'
})

// ... perform validation ...

endOperation()
```

##### batchOperations<T>(operations: Array<() => Promise<T>>, operationName: string, options?: { maxConcurrency?: number }): Promise\<T\[]>

Processes multiple operations in parallel batches.

**Parameters:**

* `operations`: Array of operation functions
* `operationName`: Name for the batch operation
* `options` (optional): Configuration options

**Returns:** Promise resolving to array of results

**Example:**

```javascript
const operations = files.map(file => () => validateFile(file))
const results = await monitor.batchOperations(
  operations,
  'parallel_validation',
  { maxConcurrency: 5 }
)
```

##### generateReport(): PerformanceReport

Generates a comprehensive performance report.

**Returns:** `PerformanceReport` object

**Example:**

```javascript
const report = monitor.generateReport()
console.log(`Total duration: ${report.totalDuration}ms`)
console.log(`Memory peak: ${report.memoryPeak / 1024 / 1024}MB`)
console.log(`Recommendations: ${report.recommendations.join(', ')}`)
```

##### checkPerformanceRequirements(): { met: boolean; issues: string\[] }

Checks if performance requirements are met.

**Returns:** Object indicating if requirements are met and any issues

**Example:**

```javascript
const requirements = monitor.checkPerformanceRequirements()
if (!requirements.met) {
  console.error('Performance requirements not met:', requirements.issues)
}
```

#### Interfaces

```typescript
interface OptimizationConfig {
  maxValidationTime: number
  memoryThreshold: number
  enableProfiling: boolean
  enableMemoryMonitoring: boolean
  cacheOptimizations: boolean
  parallelProcessing: boolean
  batchSize: number
}

interface PerformanceReport {
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

interface PerformanceMetrics {
  operationName: string
  startTime: number
  endTime: number
  duration: number
  memoryUsage: NodeJS.MemoryUsage
  metadata?: Record<string, any>
}
```

### PerformanceOptimizer

Applies optimization strategies for better performance.

#### Constructor

```typescript
constructor(monitor?: PerformanceMonitor)
```

**Parameters:**

* `monitor` (optional): Performance monitor instance

**Example:**

```javascript
import { PerformanceOptimizer } from './src/validation/PerformanceOptimizer.js'

const optimizer = new PerformanceOptimizer(monitor)
```

#### Methods

##### optimizeAll(): Promise\<OptimizationResult\[]>

Applies all available optimization strategies.

**Returns:** Promise resolving to array of optimization results

**Example:**

```javascript
const results = await optimizer.optimizeAll()
results.forEach(result => {
  console.log(`${result.strategy}: ${result.applied ? 'Applied' : 'Failed'}`)
})
```

##### optimizeValidationComponents(): Promise<void>

Optimizes all validation components.

**Returns:** Promise that resolves when optimization is complete

**Example:**

```javascript
await optimizer.optimizeValidationComponents()
console.log('Validation components optimized')
```

##### getOptimizationReport(): { currentPerformance: any; recommendations: string\[]; estimatedImprovements: Record\<string, number> }

Gets a report on current performance and optimization recommendations.

**Returns:** Object containing performance data and recommendations

**Example:**

```javascript
const report = optimizer.getOptimizationReport()
console.log('Current performance:', report.currentPerformance)
console.log('Recommendations:', report.recommendations)
console.log('Estimated improvements:', report.estimatedImprovements)
```

##### addStrategy(strategy: OptimizationStrategy): void

Adds a custom optimization strategy.

**Parameters:**

* `strategy`: Optimization strategy to add

**Example:**

```javascript
const customStrategy = {
  name: 'custom_optimization',
  description: 'Custom optimization strategy',
  apply: async () => {
    // Custom optimization logic
  },
  priority: 5,
  estimatedImprovement: 20
}

optimizer.addStrategy(customStrategy)
```

##### removeStrategy(strategyName: string): boolean

Removes an optimization strategy.

**Parameters:**

* `strategyName`: Name of the strategy to remove

**Returns:** `true` if removed, `false` if not found

**Example:**

```javascript
const removed = optimizer.removeStrategy('custom_optimization')
console.log(`Strategy removed: ${removed}`)
```

#### Interfaces

```typescript
interface OptimizationStrategy {
  name: string
  description: string
  apply: () => Promise<void> | void
  priority: number
  estimatedImprovement: number
}

interface OptimizationResult {
  strategy: string
  applied: boolean
  improvement: number
  error?: string
  metrics: {
    before: PerformanceMetrics[]
    after: PerformanceMetrics[]
  }
}
```

## Global Instances

### globalPerformanceMonitor

Global performance monitor instance.

```javascript
import { globalPerformanceMonitor } from './src/validation/PerformanceMonitor.js'

// Use global instance
const endOperation = globalPerformanceMonitor.startOperation('validation')
// ... perform validation ...
endOperation()

const report = globalPerformanceMonitor.generateReport()
```

### globalPerformanceOptimizer

Global performance optimizer instance.

```javascript
import { globalPerformanceOptimizer } from './src/validation/PerformanceOptimizer.js'

// Use global instance
await globalPerformanceOptimizer.optimizeAll()
const report = globalPerformanceOptimizer.getOptimizationReport()
```

**Related Links:**

* [Related Documentation](./docs/tools/related-doc.md)
* [Additional Resources](./docs/tools/resources.md)## Error Handling

### Common Error Types

#### ValidationError

Errors that occur during validation operations.

```typescript
interface ValidationError {
  message: string
  code: string
  filePath?: string
  line?: number
  column?: number
}
```

#### PerformanceError

Errors that occur during performance monitoring or optimization.

```typescript
interface PerformanceError {
  message: string
  operation: string
  timestamp: Date
  metrics?: PerformanceMetrics
}
```

### Error Handling Examples

```javascript
try {
  const result = await validator.validateFile('./docs/guide.md')
  if (result.error) {
    console.error('Validation error:', result.error)
  }
} catch (error) {
  console.error('Unexpected error:', error.message)
}
```

**Related Links:**

* [Related Documentation](./docs/tools/related-doc.md)
* [Additional Resources](./docs/tools/resources.md)## Type Definitions

### Common Types

```typescript
type DocumentType = 'navigation' | 'technical' | 'planning' | 'general'
type ValidationLevel = 'strict' | 'moderate' | 'lenient'
type CacheStrategy = 'memory' | 'disk' | 'hybrid'
```

### Utility Types

```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
type Required<T, K extends keyof T> = T & Required<Pick<T, K>>
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

## Constants

### Default Configuration

```javascript
export const DEFAULT_CONFIG = {
  maxValidationTime: 30000,
  memoryThreshold: 200,
  enableProfiling: true,
  enableMemoryMonitoring: true,
  cacheOptimizations: true,
  parallelProcessing: true,
  batchSize: 10
}
```

### Supported File Extensions

```javascript
export const SUPPORTED_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkdn']
```

### Document Type Patterns

```javascript
export const DOCUMENT_TYPE_PATTERNS = {
  navigation: ['README', 'index', 'nav', 'navigation'],
  technical: ['api', 'docs', 'guide', 'tutorial'],
  planning: ['plan', 'roadmap', 'milestone', 'checklist']
}
```

This API reference provides comprehensive documentation for all components of the Zero Warnings
Validation System. Use this reference to understand the available interfaces, methods, and
configuration options for each component.

## No Dead Ends Policy

This document connects to:

For more information, see:

* [Documentation Structure](../README.md)
* [Additional Resources](../tools/README.md)

## Navigation

* 📚 [Technical Glossary](../GLOSSARY.md)

## Navigation

* [← Tools Overview](README.md)
* [← Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
* [← Validation Errors Guide](VALIDATION_ERRORS_GUIDE.md)
* [← Remark Workflow Overview](REMARK_WORKFLOW_OVERVIEW.md)
* [← Documentation Best Practices](DOCUMENTATION_BEST_PRACTICES.md)
* [← Main Documentation](../README.md)
* [← Project Root](../README.md)
