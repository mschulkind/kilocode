/**
 * CrossReferenceValidator Test Suite
 * 
 * Tests for the enhanced cross-reference validator that provides robust
 * file system checking, caching, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import { CrossReferenceValidator } from '../CrossReferenceValidator.js'

// Mock fs.promises
vi.mock('fs', () => ({
  promises: {
    stat: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn()
  }
}))

describe('CrossReferenceValidator', () => {
  let validator: CrossReferenceValidator
  const mockFs = vi.mocked(fs)

  beforeEach(() => {
    validator = new CrossReferenceValidator()
    vi.clearAllMocks()
  })

  afterEach(() => {
    validator.clearCache()
  })

  describe('constructor', () => {
    it('should initialize with empty cache', () => {
      expect(validator.getCacheSize()).toBe(0)
    })

    it('should use default TTL of 5 minutes', () => {
      expect(validator.getCacheTTL()).toBe(5 * 60 * 1000)
    })

    it('should allow custom TTL', () => {
      const customValidator = new CrossReferenceValidator({ ttl: 10000 })
      expect(customValidator.getCacheTTL()).toBe(10000)
    })
  })

  describe('validateFile', () => {
    it('should validate existing files correctly', async () => {
      const filePath = '/path/to/existing/file.md'
      const stats = { isFile: () => true, mtime: new Date() }
      mockFs.stat.mockResolvedValueOnce(stats as any)

      const result = await validator.validateFile(filePath)

      expect(result).toEqual({
        exists: true,
        isFile: true,
        lastModified: stats.mtime,
        cached: false
      })
      expect(mockFs.stat).toHaveBeenCalledWith(filePath)
    })

    it('should reject non-existent files', async () => {
      const filePath = '/path/to/nonexistent/file.md'
      mockFs.stat.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'))

      const result = await validator.validateFile(filePath)

      expect(result).toEqual({
        exists: false,
        isFile: false,
        lastModified: null,
        cached: false,
        error: 'ENOENT: no such file or directory'
      })
    })

    it('should handle permission errors gracefully', async () => {
      const filePath = '/path/to/restricted/file.md'
      mockFs.stat.mockRejectedValueOnce(new Error('EACCES: permission denied'))

      const result = await validator.validateFile(filePath)

      expect(result).toEqual({
        exists: false,
        isFile: false,
        lastModified: null,
        cached: false,
        error: 'EACCES: permission denied'
      })
    })

    it('should cache results for performance', async () => {
      const filePath = '/path/to/cached/file.md'
      const stats = { isFile: () => true, mtime: new Date() }
      mockFs.stat.mockResolvedValueOnce(stats as any)

      // First call
      await validator.validateFile(filePath)
      expect(mockFs.stat).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result = await validator.validateFile(filePath)
      expect(mockFs.stat).toHaveBeenCalledTimes(1) // Still only called once
      expect(result.cached).toBe(true)
    })

    it('should handle relative paths correctly', async () => {
      const relativePath = './docs/file.md'
      const stats = { isFile: () => true, mtime: new Date() }
      mockFs.stat.mockResolvedValueOnce(stats as any)

      const result = await validator.validateFile(relativePath)

      expect(result.exists).toBe(true)
      expect(mockFs.stat).toHaveBeenCalledWith(relativePath)
    })

    it('should handle absolute paths correctly', async () => {
      const absolutePath = '/absolute/path/to/file.md'
      const stats = { isFile: () => true, mtime: new Date() }
      mockFs.stat.mockResolvedValueOnce(stats as any)

      const result = await validator.validateFile(absolutePath)

      expect(result.exists).toBe(true)
      expect(mockFs.stat).toHaveBeenCalledWith(absolutePath)
    })
  })

  describe('validateAnchor', () => {
    it('should validate anchor links within documents', async () => {
      const filePath = '/path/to/document.md'
      const anchor = '#section-1'
      const fileContent = '# Title\n\n## Section 1\n\nContent here...'
      
      mockFs.readFile.mockResolvedValueOnce(Buffer.from(fileContent, 'utf-8'))

      const result = await validator.validateAnchor(filePath, anchor)

      expect(result).toEqual({
        exists: true,
        anchor: anchor,
        found: true,
        cached: false
      })
      expect(mockFs.readFile).toHaveBeenCalledWith(filePath, 'utf-8')
    })

    it('should reject non-existent anchors', async () => {
      const filePath = '/path/to/document.md'
      const anchor = '#nonexistent-section'
      const fileContent = '# Title\n\n## Section 1\n\nContent here...'
      
      mockFs.readFile.mockResolvedValueOnce(Buffer.from(fileContent, 'utf-8'))

      const result = await validator.validateAnchor(filePath, anchor)

      expect(result).toEqual({
        exists: true,
        anchor: anchor,
        found: false,
        cached: false
      })
    })

    it('should handle file read errors', async () => {
      const filePath = '/path/to/document.md'
      const anchor = '#section-1'
      
      mockFs.readFile.mockRejectedValueOnce(new Error('EACCES: permission denied'))

      const result = await validator.validateAnchor(filePath, anchor)

      expect(result).toEqual({
        exists: false,
        anchor: anchor,
        found: false,
        cached: false,
        error: 'EACCES: permission denied'
      })
    })

    it('should cache anchor validation results', async () => {
      const filePath = '/path/to/document.md'
      const anchor = '#section-1'
      const fileContent = '# Title\n\n## Section 1\n\nContent here...'
      
      mockFs.readFile.mockResolvedValueOnce(Buffer.from(fileContent, 'utf-8'))

      // First call
      await validator.validateAnchor(filePath, anchor)
      expect(mockFs.readFile).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result = await validator.validateAnchor(filePath, anchor)
      expect(mockFs.readFile).toHaveBeenCalledTimes(1) // Still only called once
      expect(result.cached).toBe(true)
    })

    it('should handle various heading formats', async () => {
      const filePath = '/path/to/document.md'
      const fileContent = `# Main Title
## Section 1
### Subsection 1.1
#### Subsection 1.1.1
## Section 2
### Subsection 2.1`

      // Mock readFile for each call
      mockFs.readFile.mockResolvedValue(Buffer.from(fileContent, 'utf-8'))

      // Test different anchor formats
      expect((await validator.validateAnchor(filePath, '#main-title')).found).toBe(true)
      expect((await validator.validateAnchor(filePath, '#section-1')).found).toBe(true)
      expect((await validator.validateAnchor(filePath, '#subsection-11')).found).toBe(true)
      expect((await validator.validateAnchor(filePath, '#subsection-111')).found).toBe(true)
      expect((await validator.validateAnchor(filePath, '#section-2')).found).toBe(true)
      expect((await validator.validateAnchor(filePath, '#subsection-21')).found).toBe(true)
    })
  })

  describe('validateCrossReference', () => {
    it('should validate complete cross-reference with file and anchor', async () => {
      const reference = '/path/to/document.md#section-1'
      const stats = { isFile: () => true, mtime: new Date() }
      const fileContent = '# Title\n\n## Section 1\n\nContent here...'
      
      mockFs.stat.mockResolvedValueOnce(stats as any)
      mockFs.readFile.mockResolvedValueOnce(Buffer.from(fileContent, 'utf-8'))

      const result = await validator.validateCrossReference(reference)

      expect(result).toEqual({
        reference: reference,
        filePath: '/path/to/document.md',
        anchor: '#section-1',
        fileExists: true,
        anchorExists: true,
        valid: true,
        cached: false
      })
    })

    it('should validate cross-reference with only file', async () => {
      const reference = '/path/to/document.md'
      const stats = { isFile: () => true, mtime: new Date() }
      
      mockFs.stat.mockResolvedValueOnce(stats as any)

      const result = await validator.validateCrossReference(reference)

      expect(result).toEqual({
        reference: reference,
        filePath: '/path/to/document.md',
        anchor: null,
        fileExists: true,
        anchorExists: true, // null anchor is considered valid
        valid: true,
        cached: false
      })
    })

    it('should reject cross-reference with non-existent file', async () => {
      const reference = '/path/to/nonexistent.md#section-1'
      mockFs.stat.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'))

      const result = await validator.validateCrossReference(reference)

      expect(result).toEqual({
        reference: reference,
        filePath: '/path/to/nonexistent.md',
        anchor: '#section-1',
        fileExists: false,
        anchorExists: false,
        valid: false,
        cached: false,
        error: 'ENOENT: no such file or directory'
      })
    })

    it('should reject cross-reference with non-existent anchor', async () => {
      const reference = '/path/to/document.md#nonexistent-section'
      const stats = { isFile: () => true, mtime: new Date() }
      const fileContent = '# Title\n\n## Section 1\n\nContent here...'
      
      mockFs.stat.mockResolvedValueOnce(stats as any)
      mockFs.readFile.mockResolvedValueOnce(Buffer.from(fileContent, 'utf-8'))

      const result = await validator.validateCrossReference(reference)

      expect(result).toEqual({
        reference: reference,
        filePath: '/path/to/document.md',
        anchor: '#nonexistent-section',
        fileExists: true,
        anchorExists: false,
        valid: false,
        cached: false
      })
    })
  })

  describe('cache management', () => {
    it('should clear cache when requested', async () => {
      const filePath = '/path/to/file.md'
      const stats = { isFile: () => true, mtime: new Date() }
      mockFs.stat.mockResolvedValueOnce(stats as any)

      await validator.validateFile(filePath)
      expect(validator.getCacheSize()).toBe(1)

      validator.clearCache()
      expect(validator.getCacheSize()).toBe(0)
    })

    it('should expire cache entries after TTL', async () => {
      const shortTTLValidator = new CrossReferenceValidator({ ttl: 100 }) // 100ms
      const filePath = '/path/to/file.md'
      const stats = { isFile: () => true, mtime: new Date() }
      
      mockFs.stat.mockResolvedValue(stats as any)

      await shortTTLValidator.validateFile(filePath)
      expect(shortTTLValidator.getCacheSize()).toBe(1)

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should call fs.stat again after cache expiry
      await shortTTLValidator.validateFile(filePath)
      expect(mockFs.stat).toHaveBeenCalledTimes(2)
    })

    it('should return cache statistics', () => {
      const stats = validator.getCacheStats()
      expect(stats).toEqual({
        size: 0,
        ttl: 5 * 60 * 1000,
        hits: 0,
        misses: 0
      })
    })

    it('should track cache hits and misses', async () => {
      const filePath = '/path/to/file.md'
      const stats = { isFile: () => true, mtime: new Date() }
      mockFs.stat.mockResolvedValue(stats as any)

      // First call - miss
      await validator.validateFile(filePath)
      expect(validator.getCacheStats().misses).toBe(1)
      expect(validator.getCacheStats().hits).toBe(0)

      // Second call - hit
      await validator.validateFile(filePath)
      expect(validator.getCacheStats().misses).toBe(1)
      expect(validator.getCacheStats().hits).toBe(1)
    })
  })

  describe('error handling', () => {
    it('should handle filesystem errors gracefully', async () => {
      const filePath = '/path/to/error/file.md'
      mockFs.stat.mockRejectedValueOnce(new Error('ENOSPC: No space left on device'))

      const result = await validator.validateFile(filePath)

      expect(result).toEqual({
        exists: false,
        isFile: false,
        lastModified: null,
        cached: false,
        error: 'ENOSPC: No space left on device'
      })
    })

    it('should handle malformed paths', async () => {
      const malformedPath = '/path/with/\0/null/byte'
      
      const result = await validator.validateFile(malformedPath)

      expect(result).toEqual({
        exists: false,
        isFile: false,
        lastModified: null,
        cached: false,
        error: expect.stringContaining('malformed')
      })
    })
  })
})
