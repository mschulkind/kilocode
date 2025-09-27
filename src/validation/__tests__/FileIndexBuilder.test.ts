/**
 * FileIndexBuilder Test Suite
 * 
 * Tests for the file index builder that maintains a comprehensive index
 * of all markdown files for efficient validation and caching.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import { FileIndexBuilder } from '../FileIndexBuilder'

// Mock fs.promises
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    access: vi.fn()
  }
}))

// Mock path module
vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
  resolve: (path: string) => path.startsWith('/') ? path : '/' + path,
  extname: (path: string) => {
    const lastDot = path.lastIndexOf('.')
    return lastDot === -1 ? '' : path.substring(lastDot)
  }
}))

describe('FileIndexBuilder', () => {
  let indexBuilder: FileIndexBuilder
  const mockFs = vi.mocked(fs)

  beforeEach(() => {
    indexBuilder = new FileIndexBuilder()
    vi.clearAllMocks()
  })

  afterEach(() => {
    indexBuilder.clearCache()
  })

  describe('constructor', () => {
    it('should initialize with empty index', () => {
      expect(indexBuilder.getIndexSize()).toBe(0)
    })

    it('should use default options', () => {
      expect(indexBuilder.getOptions()).toEqual({
        includePatterns: ['**/*.md', '**/*.markdown'],
        excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
        maxDepth: 10,
        cacheTTL: 5 * 60 * 1000 // 5 minutes
      })
    })

    it('should allow custom options', () => {
      const customOptions = {
        includePatterns: ['**/*.txt'],
        excludePatterns: ['**/temp/**'],
        maxDepth: 5,
        cacheTTL: 10000
      }
      const customBuilder = new FileIndexBuilder(customOptions)
      expect(customBuilder.getOptions()).toEqual(customOptions)
    })
  })

  describe('buildIndex', () => {
    it('should discover markdown files recursively', async () => {
      const rootPath = '/project'
      
      // Mock directory structure
      mockFs.readdir
        .mockResolvedValueOnce(['docs', 'README.md', 'other.txt'] as any)
        .mockResolvedValueOnce(['guide.md', 'tutorial.md'] as any)
        .mockResolvedValueOnce([] as any) // Empty subdirectory
      
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // docs/
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date('2023-01-01') } as any) // README.md
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date('2023-01-02') } as any) // other.txt
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date('2023-01-03') } as any) // guide.md
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date('2023-01-04') } as any) // tutorial.md
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // Empty subdirectory

      const result = await indexBuilder.buildIndex(rootPath)

      expect(result.files).toHaveLength(3) // Only markdown files
      // Sort files by path for consistent testing
      const sortedFiles = result.files.sort((a, b) => a.path.localeCompare(b.path))
      expect(sortedFiles.map(f => f.path)).toEqual([
        '/project/README.md',
        '/project/docs/guide.md',
        '/project/docs/tutorial.md'
      ])
      expect(result.totalFiles).toBe(3)
      expect(result.totalDirectories).toBe(2)
    })

    it('should respect exclude patterns', async () => {
      const rootPath = '/project'
      const excludeBuilder = new FileIndexBuilder({
        excludePatterns: ['**/temp/**', '**/node_modules/**']
      })
      
      mockFs.readdir
        .mockResolvedValueOnce(['docs', 'temp', 'node_modules'] as any)
        .mockResolvedValueOnce(['file.md'] as any)
      
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // docs/
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // temp/
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // node_modules/
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date(), size: 1000 } as any) // file.md

      const result = await excludeBuilder.buildIndex(rootPath)

      expect(result.files).toHaveLength(1)
      expect(result.files[0].path).toBe('/project/docs/file.md')
    })

    it('should respect max depth limit', async () => {
      const rootPath = '/project'
      const shallowBuilder = new FileIndexBuilder({ maxDepth: 1 })
      
      mockFs.readdir
        .mockResolvedValueOnce(['level1'] as any)
        .mockResolvedValueOnce(['level2'] as any)
      
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // level1/
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // level2/

      const result = await shallowBuilder.buildIndex(rootPath)

      expect(result.files).toHaveLength(0)
      expect(result.totalDirectories).toBe(1) // Only level1, not level2
    })

    it('should handle permission errors gracefully', async () => {
      const rootPath = '/project'
      
      mockFs.readdir
        .mockResolvedValueOnce(['docs', 'restricted'] as any)
        .mockResolvedValueOnce(['file.md'] as any)
        .mockRejectedValueOnce(new Error('EACCES: permission denied')) // restricted/
      
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // docs/
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // restricted/
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date() } as any) // file.md

      const result = await indexBuilder.buildIndex(rootPath)

      expect(result.files).toHaveLength(1)
      expect(result.files[0].path).toBe('/project/docs/file.md')
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].path).toBe('/project/restricted')
    })

    it('should track file metadata', async () => {
      const rootPath = '/project'
      const testDate = new Date('2023-06-15T10:30:00Z')
      
      mockFs.readdir.mockResolvedValueOnce(['file.md'] as any)
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: testDate,
        size: 1024
      } as any)

      const result = await indexBuilder.buildIndex(rootPath)

      expect(result.files).toHaveLength(1)
      const file = result.files[0]
      expect(file.path).toBe('/project/file.md')
      expect(file.lastModified).toEqual(testDate)
      expect(file.size).toBe(1024)
      expect(file.extension).toBe('.md')
    })
  })

  describe('incremental updates', () => {
    it('should detect file changes and update index', async () => {
      const rootPath = '/project'
      const initialDate = new Date('2023-01-01')
      const updatedDate = new Date('2023-01-02')
      
      // Initial build
      mockFs.readdir.mockResolvedValueOnce(['file.md'] as any)
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: initialDate,
        size: 1000
      } as any)

      await indexBuilder.buildIndex(rootPath)
      expect(indexBuilder.getIndexSize()).toBe(1)

      // Update file
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: updatedDate,
        size: 1500
      } as any)

      const updatedResult = await indexBuilder.updateFile('/project/file.md')
      expect(updatedResult.changed).toBe(true)
      expect(updatedResult.file?.lastModified).toEqual(updatedDate)
      expect(updatedResult.file?.size).toBe(1500)
    })

    it('should detect file deletions', async () => {
      const rootPath = '/project'
      
      // Initial build
      mockFs.readdir.mockResolvedValueOnce(['file.md'] as any)
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: new Date(),
        size: 1000
      } as any)

      await indexBuilder.buildIndex(rootPath)

      // File deleted
      mockFs.stat.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'))

      const result = await indexBuilder.updateFile('/project/file.md')
      expect(result.changed).toBe(true)
      expect(result.file).toBeNull()
      expect(indexBuilder.getIndexSize()).toBe(0)
    })

    it('should detect new files', async () => {
      const rootPath = '/project'
      
      // Initial build
      mockFs.readdir.mockResolvedValueOnce(['file1.md'] as any)
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: new Date(),
        size: 1000
      } as any)

      await indexBuilder.buildIndex(rootPath)

      // New file added
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: new Date(),
        size: 2000
      } as any)

      const result = await indexBuilder.updateFile('/project/file2.md')
      expect(result.changed).toBe(true)
      expect(result.file?.path).toBe('/project/file2.md')
      expect(indexBuilder.getIndexSize()).toBe(2)
    })
  })

  describe('cache management', () => {
    it('should cache index results', async () => {
      const rootPath = '/project'
      
      mockFs.readdir.mockResolvedValueOnce(['file.md'] as any)
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: new Date(),
        size: 1000
      } as any)

      // First call
      await indexBuilder.buildIndex(rootPath)
      expect(mockFs.readdir).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await indexBuilder.buildIndex(rootPath)
      expect(mockFs.readdir).toHaveBeenCalledTimes(1) // Still only called once
    })

    it('should clear cache when requested', async () => {
      const rootPath = '/project'
      
      mockFs.readdir.mockResolvedValueOnce(['file.md'] as any)
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: new Date(),
        size: 1000
      } as any)

      await indexBuilder.buildIndex(rootPath)
      expect(indexBuilder.getIndexSize()).toBe(1)

      indexBuilder.clearCache()
      expect(indexBuilder.getIndexSize()).toBe(0)
    })

    it('should expire cache entries after TTL', async () => {
      const shortTTLBuilder = new FileIndexBuilder({ cacheTTL: 100 }) // 100ms
      const rootPath = '/project'
      
      mockFs.readdir.mockResolvedValue(['file.md'] as any)
      mockFs.stat.mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        mtime: new Date(),
        size: 1000
      } as any)

      await shortTTLBuilder.buildIndex(rootPath)
      expect(shortTTLBuilder.getIndexSize()).toBe(1)

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should rebuild index after cache expiry
      await shortTTLBuilder.buildIndex(rootPath)
      expect(mockFs.readdir).toHaveBeenCalledTimes(2)
    })
  })

  describe('file lookup', () => {
    beforeEach(async () => {
      const rootPath = '/project'
      
      mockFs.readdir
        .mockResolvedValueOnce(['docs', 'README.md'] as any)
        .mockResolvedValueOnce(['guide.md'] as any)
      
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true } as any)
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date(), size: 1000 } as any)
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date(), size: 2000 } as any)

      await indexBuilder.buildIndex(rootPath)
    })

    it('should find files by path', () => {
      const file = indexBuilder.findFile('/project/README.md')
      expect(file).toBeDefined()
      expect(file?.path).toBe('/project/README.md')
    })

    it('should find files by relative path', () => {
      const file = indexBuilder.findFile('README.md')
      expect(file).toBeDefined()
      expect(file?.path).toBe('/project/README.md')
    })

    it('should return null for non-existent files', () => {
      const file = indexBuilder.findFile('/project/nonexistent.md')
      expect(file).toBeNull()
    })

    it('should find files by pattern', () => {
      const files = indexBuilder.findFilesByPattern('**/README.md')
      expect(files).toHaveLength(1)
      expect(files[0].path).toBe('/project/README.md')
    })

    it('should find files by extension', () => {
      const files = indexBuilder.findFilesByExtension('.md')
      expect(files).toHaveLength(2)
      expect(files.map(f => f.path)).toContain('/project/README.md')
      expect(files.map(f => f.path)).toContain('/project/docs/guide.md')
    })
  })

  describe('performance and memory', () => {
    it('should handle large file sets efficiently', async () => {
      const rootPath = '/project'
      
      // Mock a large directory structure
      const largeFileList = Array.from({ length: 1000 }, (_, i) => `file${i}.md`)
      mockFs.readdir.mockResolvedValueOnce(largeFileList as any)
      
      // Mock stat for all files
      largeFileList.forEach(() => {
        mockFs.stat.mockResolvedValueOnce({
          isDirectory: () => false,
          isFile: () => true,
          mtime: new Date(),
          size: 1000
        } as any)
      })

      const startTime = Date.now()
      const result = await indexBuilder.buildIndex(rootPath)
      const endTime = Date.now()

      expect(result.files).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in less than 1 second
    })

    it('should provide memory usage statistics', async () => {
      const rootPath = '/project'
      
      mockFs.readdir.mockResolvedValueOnce(['file.md'] as any)
      mockFs.stat.mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        mtime: new Date(),
        size: 1000
      } as any)

      await indexBuilder.buildIndex(rootPath)

      const stats = indexBuilder.getMemoryStats()
      expect(stats.fileCount).toBe(1)
      expect(stats.memoryUsage).toBeGreaterThan(0)
      expect(stats.averageFileSize).toBe(1000)
    })
  })

  describe('error handling', () => {
    it('should handle filesystem errors gracefully', async () => {
      const rootPath = '/project'
      
      mockFs.readdir.mockRejectedValueOnce(new Error('ENOSPC: No space left on device'))

      const result = await indexBuilder.buildIndex(rootPath)

      expect(result.files).toHaveLength(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toBe('ENOSPC: No space left on device')
    })

    it('should handle malformed paths', async () => {
      const malformedPath = '/path/with/\0/null/byte'
      
      const result = await indexBuilder.buildIndex(malformedPath)

      expect(result.files).toHaveLength(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toContain('malformed')
    })

    it('should continue processing after individual file errors', async () => {
      const rootPath = '/project'
      
      mockFs.readdir.mockResolvedValueOnce(['good.md', 'bad.md', 'another.md'] as any)
      
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date(), size: 1000 } as any) // good.md
        .mockRejectedValueOnce(new Error('EACCES: permission denied')) // bad.md
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true, mtime: new Date(), size: 2000 } as any) // another.md

      const result = await indexBuilder.buildIndex(rootPath)

      expect(result.files).toHaveLength(2) // good.md and another.md
      expect(result.errors).toHaveLength(1) // bad.md error
      expect(result.files.map(f => f.path)).toContain('/project/good.md')
      expect(result.files.map(f => f.path)).toContain('/project/another.md')
    })
  })
})
