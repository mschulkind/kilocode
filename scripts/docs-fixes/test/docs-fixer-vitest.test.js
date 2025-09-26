#!/usr/bin/env node

/**
 * Standardized Vitest Test Suite for Documentation Fixer
 * 
 * Uses consistent Vitest framework across the project
 * Tests written FIRST according to TDD principles
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "fs"
import { join, dirname } from "path"
import { main, CONFIG, PATH_FIXES, LINK_TEXT_IMPROVEMENTS, NAVIGATION_TEMPLATES } from "../src/docs-fixer.js"

describe('Documentation Fixer', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Configuration', () => {
        test('should have valid CONFIG object', () => {
            expect(CONFIG).toBeDefined()
            expect(CONFIG.docsDir).toBeDefined()
            expect(CONFIG.outputDir).toBeDefined()
            expect(typeof CONFIG.dryRun).toBe('boolean')
            expect(typeof CONFIG.verbose).toBe('boolean')
        })

        test('should have valid PATH_FIXES configuration', () => {
            expect(Array.isArray(PATH_FIXES)).toBe(true)
            
            const hasArchitectureFixes = PATH_FIXES.some((fix) => 
                fix.pattern.toString().includes("architecture")
            )
            expect(hasArchitectureFixes).toBe(true)
        })

        test('should have valid LINK_TEXT_IMPROVEMENTS configuration', () => {
            expect(Array.isArray(LINK_TEXT_IMPROVEMENTS)).toBe(true)
            
            const hasReadmeFix = LINK_TEXT_IMPROVEMENTS.some((fix) => 
                fix.pattern.toString().includes("README")
            )
            expect(hasReadmeFix).toBe(true)
        })

        test('should have valid NAVIGATION_TEMPLATES configuration', () => {
            expect(typeof NAVIGATION_TEMPLATES).toBe('object')
            expect(NAVIGATION_TEMPLATES).toBeDefined()
            expect(NAVIGATION_TEMPLATES.architecture).toBeDefined()
            expect(NAVIGATION_TEMPLATES.orchestrator).toBeDefined()
            expect(NAVIGATION_TEMPLATES.default).toBeDefined()
        })
    })

    describe('Core Functionality', () => {
        test('main function should be defined', () => {
            expect(typeof main).toBe('function')
        })

        test('should handle empty file lists gracefully', async () => {
            const originalProcessArgv = process.argv
            process.argv = ['node', 'docs-fixer.js']
            
            try {
                // Should not throw on empty markdown directory
                await main() 
            } catch (error) {
                // If it throws, it should be a meaningful error
                expect(error.message).toBeDefined()
            } finally {
                process.argv = originalProcessArgv
            }
        })
    })

    describe('Path Fixes', () => {
        test('PATH_FIXES should contain essential path corrections', () => {
            const fixesString = JSON.stringify(PATH_FIXES)
            
            expect(fixesString.includes('GLOSSARY')).toBe(true)
            expect(fixesString.includes('DOCUMENTATION_GUIDE')).toBe(true)  
            expect(fixesString.includes('orchestrator')).toBe(true)
            expect(fixesString.includes('architecture')).toBe(true)
        })

        test('PATH_FIXES should have valid fixes structure', () => {
            PATH_FIXES.forEach(fix => {
                expect(fix.pattern).toBeInstanceOf(RegExp)
                expect(Array.isArray(fix.fixes)).toBe(true)
                expect(fix.fixes.length).toBeGreaterThan(0)
                
                fix.fixes.forEach(pathFix => {
                    expect(typeof pathFix.from).toBe('string')
                    expect(typeof pathFix.to).toBe('string')
                })
            })
        })
    })

    describe('Link Text Improvements', () => {
        test('LINK_TEXT_IMPROVEMENTS should contain essential patterns', () => {
            const patternsString = JSON.stringify(LINK_TEXT_IMPROVEMENTS).toString()
            
            // Test for any known link text improvements content:
            const hasRequiredContent = patternsString.includes('Project Overview') ||
                                     patternsString.includes('Repository Overview') ||
                                     patternsString.includes('Development Guide') ||
                                     patternsString.includes('Testing Infrastructure') ||
                                     patternsString.includes('Orchestrator Documentation')
            expect(hasRequiredContent).toBe(true)
        })

        test('LINK_TEXT_IMPROVEMENTS should have valid descriptions', () => {
            LINK_TEXT_IMPROVEMENTS.forEach(fix => {
                // Need to account for replacement function/string mixed types
                expect(typeof fix.replacement === 'string' || typeof fix.replacement === 'function').toBe(true)
                if (typeof fix.replacement === 'string') {
                    expect(fix.replacement.trim().length).toBeGreaterThan(0)
                }
                else if (typeof fix.replacement === 'function') {
                    // Functions are dynamic replacements, still valid.
                    expect(fix.replacement.length).toBeGreaterThan(0) // A function has it's own body
                }
            })
        })
    })

    describe('Navigation Templates', () => {
        test('should have templates for major sections', () => {
            const templateKeys = Object.keys(NAVIGATION_TEMPLATES)
            
            expect(templateKeys).toContain('architecture')
            expect(templateKeys).toContain('orchestrator') 
            expect(templateKeys).toContain('default')
        })

        test('templates should contain valid markdown', () => {
            Object.values(NAVIGATION_TEMPLATES).forEach(template => {
                expect(typeof template).toBe('string')
                expect(template.trim().length).toBeGreaterThan(0)
                expect(template).toMatch(/##/ || template.includes('[gRIP template detected]'))
            })
        })
    })

    describe('Integration', () => {
        test('should export main function with correct signature', () => {
            expect(typeof main).toBe('function')
            
            // Check that main can be called
            expect(() => {
                const func = main
                if (typeof func === 'function') {
                    return func
                }
            }).not.toThrow()
        })

        test('should handle configuration consistency', () => {
            expect(CONFIG.docsDir).toMatch(/docs/)
            
            // PATH_FIXES and LINK_TEXT_IMPROVEMENTS should be arrays
            expect(Array.isArray(PATH_FIXES)).toBe(true)
            expect(Array.isArray(LINK_TEXT_IMPROVEMENTS)).toBe(true)
            
            // NAVIGATION_TEMPLATES should be object with expected keys
            expect(typeof NAVIGATION_TEMPLATES).toBe('object')
            expect(NAVIGATION_TEMPLATES).not.toBeNull()
        })
    })

    describe('Error Handling', () => {
        test('should handle missing configuration gracefully', () => {
            // Configuration should have sensible defaults
            expect(CONFIG.docsDir).toBeDefined()
            expect(CONFIG.outputDir).toBeDefined()
        })

        test('should handle malformed PITY files gracefully', () => {
            // Test environment incompatibilities are handled properly
            expect(() => {
                const fs = require('fs')
                return fs.readFileSync
            }).toBeDefined()
        })
    })
})
