#!/usr/bin/env node

/**
 * TDD Test Suite for Category1 Cross-Reference Analyzer
 * 
 * Uses standardized Vitest framework for consistent testing across the project
 * Tests written FIRST, implementation written to pass
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolve } from 'path'
import Category1Analyzer from './category1-analyzer.js'

describe('Category1Analyzer', () => {
    let analyzer

    beforeEach(() => {
        analyzer = new Category1Analyzer()
        
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Constructor and Initialization', () => {
        test('should initialize with valid analysis data structure', () => {
            expect(analyzer.analysisData).toBeDefined()
            expect(analyzer.analysisData.timestamp).toBeDefined()
            expect(analyzer.analysisData.totalFiles).toBe(0)
            expect(Array.isArray(analyzer.analysisData.violations)).toBe(true)
            
            const patterns = ['GLOSSARY_REF', 'ORCHESTRATOR', 'ARCHITECTURE', 'STANDARDS_CORE']
            patterns.forEach(pattern => {
                expect(analyzer.analysisData.stats.byPattern[pattern]).toBe(0)
            })
            
            expect(analyzer.analysisData.stats.validationWarnings).toBe(0)
        })
    })

    describe('File Depth Calculation', () => {
        test('should calculate correct depths for typical file paths', () => {
            expect(analyzer.calculateFileDepth('docs/README.md')).toBe(0)
            expect(analyzer.calculateFileDepth('docs/standards/core/PRINCIPLES.md')).toBe(1)
            expect(analyzer.calculateFileDepth('docs/standards/core/patterns/NESTED.md')).toBe(2)
        })

        test('should handle files outside docs directory', () => {
            expect(analyzer.calculateFileDepth('src/utils.ts')).toBe(0)
            expect(analyzer.calculateFileDepth('README.md')).toBe(0)
        })
    })

    describe('Relative Path Detection', () => {
        test('should correctly identify relative paths', () => {
            expect(analyzer.isRelativePath('../README.md')).toBe(true)
            expect(analyzer.isRelativePath('./test.md')).toBe(true) 
            expect(analyzer.isRelativePath('./../test.md')).toBe(true)
        })

        test('should reject external URLs and absolute paths', () => {
            expect(analyzer.isRelativePath('https://example.com')).toBe(false)
            expect(analyzer.isRelativePath('http://example.com')).toBe(false)
            expect(analyzer.isRelativePath('/absolute/path.md')).toBe(false)
        })
    })

    describe('Violation Pattern Categorization', () => {
        test('should categorize GLOSSARY references correctly', () => {
            expect(analyzer.categorizeViolationPattern('GLOSSARY.md')).toBe('GLOSSARY_REF')
            expect(analyzer.categorizeViolationPattern('../GLOSSARY.md')).toBe('GLOSSARY_REF')
            expect(analyzer.categorizeViolationPattern('../../GLOSSARY.md')).toBe('GLOSSARY_REF')
        })

        test('should categorize ORCHESTRATOR references correctly', () => {
            expect(analyzer.categorizeViolationPattern('orchestrator/README.md')).toBe('ORCHESTRATOR')
            expect(analyzer.categorizeViolationPattern('../orchestrator/README.md')).toBe('ORCHESTRATOR')
        })

        test('should categorize ARCHITECTURE references correctly', () => {
            expect(analyzer.categorizeViolationPattern('architecture/README.md')).toBe('ARCHITECTURE')
            expect(analyzer.categorizeViolationPattern('../architecture/README.md')).toBe('ARCHITECTURE')
        })

        test('should categorize STANDARDS_CORE references correctly', () => {
            expect(analyzer.categorizeViolationPattern('standards/core/PRINCIPLES.md')).toBe('STANDARDS_CORE')
            expect(analyzer.categorizeViolationPattern('../standards/core/PRINCIPLES.md')).toBe('STANDARDS_CORE')
        })

        test('should categorize DOCUMENTATION_GUIDE references correctly', () => {
            expect(analyzer.categorizeViolationPattern('DOCUMENTATION_GUIDE.md')).toBe('DOCUMENTATION_GUIDE')
            expect(analyzer.categorizeViolationPattern('../DOCUMENTATION_GUIDE.md')).toBe('DOCUMENTATION_GUIDE')
        })

        test('should categorize unrecognized patterns as OTHER_REF', () => {
            expect(analyzer.categorizeViolationPattern('../integrations/slack.md')).toBe('OTHER_REF')
            expect(analyzer.categorizeViolationPattern('random-file.md')).toBe('OTHER_REF')
        })
    })

    describe('Path Correction Logic', () => {
        test('should fix GLOSSARY.md paths based on depth', () => {
            const corrected1 = analyzer.calculateCorrectPath('docs/tools/README.md', '../../GLOSSARY.md', 1)
            expect(corrected1).toBe('../GLOSSARY.md')
            
            const corrected2 = analyzer.calculateCorrectPath('docs/standards/core/nested/README.md', '../GLOSSARY.md', 3)
            expect(corrected2).toBe('../../GLOSSARY.md')
        })

        test('should fix DOCUMENTATION_GUIDE paths correctly', () => {
            const corrected = analyzer.fixDocumentationGuidePaths('../DOCUMENTATION_GUIDE.md', 3)
            expect(corrected).toBe('../../DOCUMENTATION_GUIDE.md')
        })
    })

    describe('Violation Detection Logic', () => {
        test('should detect violations with correct patterns', () => {
            const violation = analyzer.checkForCategory1Violation(
                'docs/tools/README.md',
                'docs/tools',
                '../orchestrator/README.md',
                'Orchestrator Docs',
                1
            )
            
            expect(violation).toBeDefined()
            expect(violation.pattern).toBe('ORCHESTRATOR')
            expect(violation.fixType).toBe('ADD_DEPTH')
        })

        test('should return null for external URLs', () => {
            const violation = analyzer.checkForCategory1Violation(
                'docs/tools/README.md',
                'docs/tools',
                'https://example.com',
                'External Link',
                1
            )
            
            expect(violation).toBeNull()
        })

        test('should determine fix types correctly', () => {
            expect(analyzer.determineFixType('../GLOSSARY.md', '../../GLOSSARY.md')).toBe('ADD_DEPTH')
            expect(analyzer.determineFixType('../../GLOSSARY.md', '../GLOSSARY.md')).toBe('REDUCE_DEPTH')
            expect(analyzer.determineFixType('../a/b.md', '../b/a.md')).toBe('REORDER_DEPTH')
        })
    })

    describe('Analysis Summary Generation', () => {
        test('should correctly count violations by pattern', () => {
            analyzer.analysisData.violations = [
                { file: 'docs/tools/README.md', pattern: 'ORCHESTRATOR' },
                { file: 'docs/standards/core/README.md', pattern: 'GLOSSARY_REF' },
                { file: 'docs/standards/core/README.md', pattern: 'ORCHESTRATOR' },
                { file: 'docs/README.md', pattern: 'DOCUMENTATION_GUIDE' }
            ]
            
            analyzer.generateCategory1Analysis()
            
            expect(analyzer.analysisData.stats.byPattern.ORCHESTRATOR).toBe(2)
            expect(analyzer.analysisData.stats.byPattern.GLOSSARY_REF).toBe(1)
            expect(analyzer.analysisData.stats.byPattern.DOCUMENTATION_GUIDE).toBe(1)
            expect(analyzer.analysisData.stats.validationWarnings).toBe(4)
        })

        test('should generate TOP patterns in correct order', () => {
            analyzer.analysisData.violations = [
                { file: 'a.md', pattern: 'ORCHESTRATOR' },
                { file: 'b.md', pattern: 'ORCHESTRATOR' },
                { file: 'c.md', pattern: 'ORCHESTRATOR' },
                { file: 'd.md', pattern: 'GLOSSARY_REF' },
                { file: 'e.md', pattern: 'GLOSSARY_REF' },
                { file: 'f.md', pattern: 'ARCHITECTURE' }
            ]
            
            analyzer.generateCategory1Analysis()
            
            expect(analyzer.analysisData.topPatterns).toBeDefined()
            expect(analyzer.analysisData.topPatterns[0].pattern).toBe('ORCHESTRATOR')
            expect(analyzer.analysisData.topPatterns[0].count).toBe(3)
            expect(analyzer.analysisData.topPatterns[1].pattern).toBe('GLOSSARY_REF')
            expect(analyzer.analysisData.topPatterns[1].count).toBe(2)
        })
    })

    describe('Error Handling', () => {
        test('should handle file parsing errors gracefully', () => {
            expect(() => analyzer.getMarkdownFiles('nonexistent')).not.toThrow()
        })

        test('should handle deeply nested directory structures', () => {
            const depth = analyzer.calculateFileDepth('docs/standards/core/patterns/advanced/nested/test.md')
            expect(depth).toBeGreaterThanOrEqual(3)
        })
    })
})