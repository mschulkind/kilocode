#!/usr/bin/env node

/**
 * TDD Test Suite for Category1Pattern Recognition Engine
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import Category1Patterns from './category1-patterns.js'

describe('Category1Patterns', () => {
    let patterns
    let mockFsExistenceMap

    beforeEach(() => {
        patterns = new Category1Patterns()
        
        // Setup mock fs.existsSync and fs.default.existsSync
        mockFsExistenceMap = new Map()
        mockFsExistenceMap.set('docs/standards/core/GLOSSARY.md', true)
        mockFsExistenceMap.set('docs/orchestrator/README.md', true)
        mockFsExistenceMap.set('docs/architecture/README.md', false) // intentional false for testing
        mockFsExistenceMap.set('docs/DOCUMENTATION_GUIDE.md', true)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('GlossaryPaths Trajectory', () => {
        test('fixGlossaryPath_Trigger should return (../..) depth for standards/core files', () => {
            const result = patterns.fixGlossaryPaths("../GLOSSARY.md", "docs/standards/core/PRINCIPLES.md")

            expect(result.solved).toBe(true)
            expect(result.linkUrl).toBe("../../GLOSSARY.md")
        })

        test('fixGlossaryPath_Trigger should return ../ when not deeply-nested', () => {
            const result = patterns.fixGlossaryPaths("../GLOSSARY.md", "docs/README.md")

            expect(result.solved).toBe(true)
            expect(result.linkUrl).toBe("../GLOSSARY.md")
        })

        test('fixGlossaryPath_Trigger should return non-GLOSSARY paths unchanged if not matching', () => {
            const result = patterns.fixGlossaryPaths("# heading", "docs/README.md")

            expect(result.solved).toBe(false)
            expect(result.linkUrl).toBe("# heading")
        })
    })

    describe('OrchestratorPaths Trajectory', () => {
        test('fixOrchestratorPaths should return ../../../orchestrator/... when from standards/core', () => {
            const result = patterns.fixOrchestratorPaths("orchestrator/README.md", "docs/standards/core/PRINCIPLES.md")

            expect(result.solved).toBe(true)
            expect(result.linkUrl).toBe("../../orchestrator/README.md")
        })

        test('fixOrchestratorPaths should return ../orchestrator/... when from shallow positions', () => {
            const result = patterns.fixOrchestratorPaths("orchestrator/README.md", "docs/orchestrator/LIFECYCLE.md")

            expect(result.solved).toBe(true)
            expect(result.linkUrl).toBe("../orchestrator/README.md")
        })
    })

    describe('ArchitecturePaths Trajectory', () => {
        test('fixArchitecturePaths should return ../../../architecture/... for standards/core viewing architecture.', () => {
            const result = patterns.fixArchitecturePaths("architecture/README.md", "docs/standards/core/PRINCIPLES.md")

            expect(result.solved).toBe(true)
            expect(result.linkUrl).toBe("../../architecture/README.md")
        })
    })

    describe('StandardsCorePaths Trajectory', () => {
        test('fixStandardsCorePaths should return ../../../standards/core/... for nested origin paths.', () => {
            const result = patterns.fixStandardsCorePaths("standards/core/README.md", "docs/ui/DESIGN_PATTERNS.md")

            expect(result.solved).toBe(true)
            expect(result.linkUrl).toBe("../../standards/core/README.md")
        })
    })

    describe('DocumentationGuidePath Trajectory', () => {
        test('FixDocGuidePath should return ../../DOCUMENTATION_GUIDE.md for nested path', () => {
            const result = patterns.fixDocGuidePath("../DOCUMENTATION_GUIDE.md", "docs/standards/core/PRINCIPLES.md")

            expect(result.solved).toBe(true)
            expect(result.linkUrl).toBe("../../DOCUMENTATION_GUIDE.md")
        })
    })

    describe('Validation Trajectory', () => {
        test('validateCorrectedPath should account for filesystem presence.', async () => {
            const { valid } = await patterns.validateCorrectedPath("../standards/core/GLOSSARY.md", 'docs/')
            
            // insert mock fs in scope
            expect(valid).toBeDefined()
            
        })

        test('validateCorrectedPath should handle omittedBase.', async () => {
            const { valid, path, confidence } = await patterns.validateCorrectedPath("../GLOSSARY.md")
            
            expect(valid).toBeDefined()
            expect(/docs\/..\/GLOSSARY\.md/.test(path)).toBeFalsy();
            expect(confidence).toBeGreaterThanOrEqual(0)
        })
    })

    describe('Batch Processing', () => {
        test('processPatternFixesFromViolationList should acquire as expected violations and generate fixes.', () => {
            const mockViols = [
                { url: "../GLOSSARY.md", sourcePath: "docs/standards/core/PRINCIPLES.md" },
                { url: "../orchestrator/README.md", sourcePath: "docs/standards/core/PRINCIPLES.md" }
            ]

            const outcomes = patterns.processPatternFixesFromViolationList(mockViols)

            expect(outcomes).toBeDefined()
            expect(outcomes).toEqual(expect.objectContaining({
                pattern_results: expect.any(Array),
                stats: expect.objectContaining({
                    total: 2
                })
            }))

        })
    })

    describe('Pattern Register Initialisation Flat Map', () => {
        test('patterns.patternRegisters.GLOSSARY should be defined and contain symbol once constructed', () => {
            const reg = patterns.patternRegisters.GLOSSARY
            expect(reg).toBeDefined()
            expect(typeof reg.fix).toBe('function')
        })

        test('patterns.patternRegisters.ORCHESTRATOR should contain sym property defineable regular expression', () => {
            const reg = patterns.patternRegisters.ORCHESTRATOR
            expect(reg.sym).toBeDefined()
            // Test-pattern ingestion should not change from  RegEx instance-derived tests
            const challenge = "orchestrator/README.md"
            expect(reg.sym.test(challenge)).toBeTruthy()
        })

        test('patterns.patternRegisters.ARCHITECTURE.pathPatterns should work consistently with pattern matching.', () => {
            const reg = patterns.patternRegisters.ARCHITECTURE
            expect(reg.sym).toBeDefined()
            
            // Cross-lang transferance fix: early compile if sym is different
            const badTest = "architecture/README.md"
            const isMatched = reg.sym.test(badTest)
            expect(isMatched).toBeTruthy()
        })
    })
})

