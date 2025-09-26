#!/usr/bin/env node

/**
 * TDD Test Suite for Pattern Detection System
 * 
 * Tests the pattern detection functionality for Category 1 cross-reference violations
 * Uses standardized Vitest framework
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync, readFileSync as mockReadFileSync } from 'fs'
import { join, dirname } from 'path'
import PatternDetector from './pattern-detector.js'

describe('PatternDetector', () => {
    let detector
    let mockValidationOutput

    beforeEach(() => {
        detector = new PatternDetector()
        
        // Mock validation output data
        mockValidationOutput = `
[\u000033mdocs/ui/UI_LAYER_SYSTEM.md\u000039m\u000024m]
466:1-466:51    \u000033mwarning\u000039m \u00001mCross-reference "../README.md" may be invalid\u000022m
472:1-472:51    \u000033mwarning\u000039m \u00001mCross-reference "../" may be invalid\u000022m
472:1-472:51    \u000033mwarning\u000039m \u00001mCross-reference "../docs/ui/" may be invalid\u000022m

[\u000033mdocs/orchestrator/README.md\u000039m\u000024m]
23:1-23:51      \u000033mwarning\u000039m \u00001mCross-reference "../../GLOSSARY.md" may be invalid\u000022m
45:1-45:51      \u000033mwarning\u000039m \u00001mCross-reference "../DOCUMENTATION_GUIDE.md" may be invalid\u000022m

[\u000033mdocs/standards/core/PRINCIPLES.md\u000039m\u000024m]
12:1-12:51      \u000033mwarning\u000039m \u00001mCross-reference "../GLOSSARY.md" may be invalid\u000022m
34:1-34:51      \u000033mwarning\u000039m \u00001mCross-reference "../../architecture/README.md" may be invalid\u000022m

[\u000033mdocs/architecture/README.md\u000039m\u000024m]
15:1-15:51      \u000033mwarning\u000039m \u00001mCross-reference "../orchestrator/README.md" may be invalid\u000022m
23:1-23:51      \u000033mwarning\u000039m \u00001mCross-reference "../GLOSSARY.md" may be invalid\u000022m
        `.trim()

        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Constructor and Initialization', () => {
        test('should initialize with pattern detection data structure', () => {
            expect(detector.patterns).toBeDefined()
            expect(detector.patterns.GLOSSARY).toBeDefined()
            expect(detector.patterns.ORCHESTRATOR).toBeDefined()
            expect(detector.patterns.ARCHITECTURE).toBeDefined()
            expect(detector.patterns.STANDARDS_CORE).toBeDefined()
            expect(detector.patterns.DOCUMENTATION_GUIDE).toBeDefined()
        })

        test('should initialize with empty violation maps', () => {
            expect(detector.violationsByPattern).toEqual({})
            expect(detector.violationsByFile).toEqual({})
            expect(detector.totalViolations).toBe(0)
        })
    })

    describe('Pattern Detection', () => {
        test('should detect GLOSSARY.md path patterns', () => {
            const testText = 'Cross-reference "../GLOSSARY.md" may be invalid'
            const result = detector.detectPattern(testText)
            
            expect(result.pattern).toBe('GLOSSARY')
            expect(result.severity).toBeDefined()
        })

        test('should detect orchestrator cross-reference patterns', () => {
            const testText = 'Cross-reference "../orchestrator/README.md" may be invalid'
            const result = detector.detectPattern(testText)
            
            expect(result.pattern).toBe('ORCHESTRATOR')
            expect(result.filePath).toContain('orchestrator')
        })

        test('should detect architecture path patterns', () => {
            const testText = 'Cross-reference "../../architecture/README.md" may be invalid'
            const result = detector.detectPattern(testText)
            
            expect(result.pattern).toBe('ARCHITECTURE')
            expect(result.depth).toBeGreaterThan(1)
        })

        test('should detect standards/core path patterns', () => {
            const testText = 'Cross-reference "../standards/core/PRINCIPLES.md" may be invalid'
            const result = detector.detectPattern(testText)
            
            expect(result.pattern).toBe('STANDARDS_CORE')
            expect(result.targetFile).toBe('PRINCIPLES.md')
        })

        test('should detect DOCUMENTATION_GUIDE patterns', () => {
            const testText = 'Cross-reference "../DOCUMENTATION_GUIDE.md" may be invalid'
            const result = detector.detectPattern(testText)
            
            expect(result.pattern).toBe('DOCUMENTATION_GUIDE')
            expect(result.filePath).toContain('DOCUMENTATION_GUIDE.md')
        })
    })

    describe('Pattern Analysis', () => {
        test('should process validation output to extract all pattern violations', () => {
            const result = detector.processValidationOutput(mockValidationOutput)
            
            expect(detector.totalViolations).toBeGreaterThan(0)
            expect(result.patternSummary).toBeDefined()
            expect(result.topViolations).toBeDefined()
        })

        test('should categorize violations by pattern type', () => {
            detector.processValidationOutput(mockValidationOutput)
            
            expect(detector.violationsByPattern).toBeDefined()
            const patternTypes = Object.keys(detector.violationsByPattern)
            expect(patternTypes.length).toBeGreaterThan(0)
        })

        test('should categorize violations by file location', () => {
            detector.processValidationOutput(mockValidationOutput)
            
            expect(detector.violationsByFile).toBeDefined()
            const fileTypes = Object.keys(detector.violationsByFile)
            expect(fileTypes.length).toBeGreaterThan(0)
        })
    })

    describe('Cross-Reference Issue Location Mapping', () => {
        test('should identify orchestrator cross-reference issues and locations', () => {
            detector.processValidationOutput(mockValidationOutput)
            
            const orchestratorIssues = detector.getPatternViolations('ORCHESTRATOR')
            expect(orchestratorIssues).toBeDefined()
            expect(orchestratorIssues.length).toBeGreaterThanOrEqual(0)
        })

        test('should map architecture path depth violations', () => {
            detector.processValidationOutput(mockValidationOutput)
            
            const architectureIssues = detector.getPatternViolations('ARCHITECTURE')
            expect(architectureIssues).toBeDefined()
            
            for (const issue of architectureIssues) {
                expect(issue.depth).toBeDefined()
                expect(issue.targetFile).toMatch(/architecture/i)
            }
        })

        test('should categorize standards/core/ subdirectory complications', () => {
            detector.processValidationOutput(mockValidationOutput)
            
            const standardsCoreIssues = detector.getPatternViolations('STANDARDS_CORE')
            expect(standardsCoreIssues).toBeDefined()
            
            for (const issue of standardsCoreIssues) {
                expect(issue.targetPath).toMatch(/standards.*core/)
            }
        })

        test('should analyze DOCUMENTATION_GUIDE.md cross-reference challenges', () => {
            detector.processValidationOutput(mockValidationOutput)
            
            const docGuideIssues = detector.getPatternViolations('DOCUMENTATION_GUIDE')
            expect(docGuideIssues).toBeDefined()
            
            for (const issue of docGuideIssues) {
                expect(issue.targetPath).toMatch(/DOCUMENTATION_GUIDE/)
            }
        })
    })

    describe('Violation Analysis Report Generation', () => {
        test('should generate categorized violation analysis report', () => {
            detector.processValidationOutput(mockValidationOutput)
            const analysis = detector.generateViolationAnalysisReport()
            
            expect(analysis.patternFrequency).toBeDefined()
            expect(analysis.fileClusters).toBeDefined()
            expect(analysis.severityAssessment).toBeDefined()
        })

        test('should provide TOP 10 error patterns', () => {
            detector.processValidationOutput(mockValidationOutput)
            const topPatterns = detector.getTopErrorPatterns(10)
            
            expect(topPatterns).toBeDefined()
            expect(Array.isArray(topPatterns)).toBe(true)
            expect(topPatterns.length).toBeLessThanOrEqual(10)
        })

        test('should provide file cluster analysis for problem areas', () => {
            detector.processValidationOutput(mockValidationOutput)
            const clusters = detector.getFileClusters()
            
            expect(clusters).toBeDefined()
            expect(Object.keys(clusters).length).toBeGreaterThan(0)
            
            for (const [clusteredPath, violations] of Object.entries(clusters)) {
                expect(Array.isArray(violations)).toBe(true)
                expect(violations.length).toBeGreaterThan(0)
            }
        })
    })

    describe('Integration with Enhanced Docs-Fixer', () => {
        test('should link analyzer output to enhanced docs-fixer implementation', () => {
            detector.processValidationOutput(mockValidationOutput)
            const fixerInput = detector.getFixerAnalysisInput()
            
            expect(fixerInput.patternMappings).toBeDefined()
            expect(fixerInput.depthCorrections).toBeDefined()
            expect(fixerInput.targetPaths).toBeDefined()
        })

        test('should provide familiarity enhanced categorization for fixPathIssuesAST', () => {
            detector.processValidationOutput(mockValidationOutput)
            const categorizedOutput = detector.getCategorizedForASTFixer()
            
            expect(categorizedOutput.fileCategories).toBeDefined()
            expect(categorizedOutput.pathCorrections).toBeDefined()
        })
    })

    describe('Error Handling and Edge Cases', () => {
        test('should handle empty validation output gracefully', () => {
            const result = detector.processValidationOutput("")
            
            expect(detector.totalViolations).toBe(0)
            expect(result.patternSummary.size).toBe(0)
        })

        test('should handle malformed validation outputs', () => {
            const malformedInput = "some invalid text that doesn't match regex patterns"
            const result = detector.processValidationOutput(malformedInput)
            
            expect(detector.totalViolations).toBe(0)
            expect(result.patternSummary).toBeDefined()
        })

        test('should reduce duplicate pattern detection occurrences', () => {
            const duplicateText = 'warning:Cross-reference "../GLOSSARY.md" may be invalid'
            detector.detectPattern(duplicateText)
            detector.detectPattern(duplicateText)
            
            // Should count each occurrence separately for statistics
            expect(detector.patternCounts).toBeDefined()
        })
    })
})
