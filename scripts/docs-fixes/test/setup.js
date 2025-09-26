/**
 * Vitest Setup for KiloCode Documentation Fixer Tests
 * 
 * Sets up test environment with consistent mocking and environment configuration
 */

import { beforeEach, afterEach, vi } from 'vitest'
import { mkdirSync, rmSync } from 'fs'
import { resolve } from 'path' 

/**
 * Test environment management
 */
export class TestEnvironment {
    constructor() {
        this.tempDir = 'scripts/docs-fixes/test-temp'
        this.setupCompleted = false
    }

    setup() {
        if (this.setupCompleted) return

        try {
            mkdirSync(resolve(this.tempDir), { recursive: true })
        } catch (error) {
            console.warn('Could not create test temp directory:', error.message)
        }
        
        this.setupCompleted = true
    }

    cleanup() {
        try {
            rmSync(resolve(this.tempDir), { recursive: true, force: true })
        } catch (error) {
            // Directory might not exist, that's okay
        }
        this.setupCompleted = false
    }
}

const testEnv = new TestEnvironment()

beforeEach(() => {
    testEnv.setup()
})

afterEach(() => {
    testEnv.cleanup()
})

/**
 * Test utilities for documentation fixer tests
 */
export const testHelpers = {
    createTestFile(path, content) {
        const fs = require('fs').promises
        
        return import('path').then((path) => {
            fs.mkdir(path.dirname(resolve(path)), { recursive: true })
            return fs.writeFile(resolve(path), content, 'utf8')
        })
    },

    cleanupTestFile(path) {
        const fs = require('fs')
        
        return fs.promises.unlink(resolve(path)).catch(() => {})
    },

    mockAsyncFunction() {
        return vi.fn().mockResolvedValue()
    },

    suppressConsole() {
        const originalLog = console.log
        const originalWarn = console.warn
        const originalError = console.error
        
        console.log = vi.fn()
        console.warn = vi.fn()
        console.error = vi.fn()
        
        return () => {
            console.log = originalLog
            console.warn = originalWarn
            console.error = originalError
        }
    }
}

/**
 * Vitest test utility imports 
 */
export { 
    describe, 
    test, 
    it, 
    expect, 
    beforeEach, 
    afterEach, 
    beforeAll, 
    afterAll, 
    vi 
} from 'vitest'