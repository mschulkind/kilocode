/**
 * Enhanced Cross-Reference Validator
 *
 * Provides robust cross-reference validation with proper file system checking,
 * caching, and error handling to eliminate false positive cross-reference warnings.
 */

import { promises as fs } from "fs"
import { join, resolve, dirname } from "path"

export interface ValidationOptions {
	ttl?: number // Cache TTL in milliseconds
	maxCacheSize?: number // Maximum cache entries
}

export interface FileValidationResult {
	exists: boolean
	isFile: boolean
	lastModified: Date | null
	cached: boolean
	error?: string
}

export interface AnchorValidationResult {
	exists: boolean
	anchor: string
	found: boolean
	cached: boolean
	error?: string
}

export interface CrossReferenceResult {
	reference: string
	filePath: string
	anchor: string | null
	fileExists: boolean
	anchorExists: boolean
	valid: boolean
	cached: boolean
	error?: string
}

export interface CacheStats {
	size: number
	ttl: number
	hits: number
	misses: number
}

interface CacheEntry<T> {
	value: T
	timestamp: number
}

export class CrossReferenceValidator {
	private fileCache = new Map<string, CacheEntry<FileValidationResult>>()
	private anchorCache = new Map<string, CacheEntry<AnchorValidationResult>>()
	private readonly ttl: number
	private readonly maxCacheSize: number
	private hits = 0
	private misses = 0

	constructor(options: ValidationOptions = {}) {
		this.ttl = options.ttl || 5 * 60 * 1000 // Default 5 minutes
		this.maxCacheSize = options.maxCacheSize || 1000 // Default 1000 entries
	}

	/**
	 * Validate if a file exists and get its metadata
	 */
	async validateFile(filePath: string): Promise<FileValidationResult> {
		try {
			// Check for malformed paths
			if (this.isMalformedPath(filePath)) {
				return {
					exists: false,
					isFile: false,
					lastModified: null,
					cached: false,
					error: "malformed path detected",
				}
			}

			// Check cache first
			const cacheKey = this.normalizePath(filePath)
			const cached = this.fileCache.get(cacheKey)

			if (cached && this.isCacheValid(cached.timestamp)) {
				this.hits++
				return {
					...cached.value,
					cached: true,
				}
			}

			// Validate file
			const stats = await fs.stat(filePath)
			const result: FileValidationResult = {
				exists: true,
				isFile: stats.isFile(),
				lastModified: stats.mtime,
				cached: false,
			}

			// Cache the result
			this.cacheFileResult(cacheKey, result)
			this.misses++

			return result
		} catch (error) {
			const result: FileValidationResult = {
				exists: false,
				isFile: false,
				lastModified: null,
				cached: false,
				error: error instanceof Error ? error.message : String(error),
			}

			// Cache negative results too (for a shorter time)
			const cacheKey = this.normalizePath(filePath)
			this.cacheFileResult(cacheKey, result, this.ttl / 2) // Half TTL for errors
			this.misses++

			return result
		}
	}

	/**
	 * Validate if an anchor exists within a document
	 */
	async validateAnchor(filePath: string, anchor: string): Promise<AnchorValidationResult> {
		try {
			// Check cache first
			const cacheKey = `${this.normalizePath(filePath)}:${anchor}`
			const cached = this.anchorCache.get(cacheKey)

			if (cached && this.isCacheValid(cached.timestamp)) {
				this.hits++
				return {
					...cached.value,
					cached: true,
				}
			}

			// Read file content
			const content = await fs.readFile(filePath, "utf-8")
			const found = this.findAnchorInContent(content.toString(), anchor)

			const result: AnchorValidationResult = {
				exists: true,
				anchor,
				found,
				cached: false,
			}

			// Cache the result
			this.cacheAnchorResult(cacheKey, result)
			this.misses++

			return result
		} catch (error) {
			const result: AnchorValidationResult = {
				exists: false,
				anchor,
				found: false,
				cached: false,
				error: error instanceof Error ? error.message : String(error),
			}

			// Cache negative results too
			const cacheKey = `${this.normalizePath(filePath)}:${anchor}`
			this.cacheAnchorResult(cacheKey, result, this.ttl / 2)
			this.misses++

			return result
		}
	}

	/**
	 * Validate a complete cross-reference (file + optional anchor)
	 */
	async validateCrossReference(reference: string): Promise<CrossReferenceResult> {
		const { filePath, anchor } = this.parseReference(reference)

		// Validate file existence
		const fileResult = await this.validateFile(filePath)

		if (!fileResult.exists) {
			return {
				reference,
				filePath,
				anchor,
				fileExists: false,
				anchorExists: false,
				valid: false,
				cached: fileResult.cached,
				error: fileResult.error,
			}
		}

		// If no anchor, just file validation is sufficient
		if (!anchor) {
			return {
				reference,
				filePath,
				anchor,
				fileExists: true,
				anchorExists: true, // null anchor is considered valid
				valid: true,
				cached: fileResult.cached,
			}
		}

		// Validate anchor
		const anchorResult = await this.validateAnchor(filePath, anchor)

		return {
			reference,
			filePath,
			anchor,
			fileExists: true,
			anchorExists: anchorResult.found,
			valid: anchorResult.found,
			cached: fileResult.cached || anchorResult.cached,
			error: anchorResult.error,
		}
	}

	/**
	 * Clear all cached results
	 */
	clearCache(): void {
		this.fileCache.clear()
		this.anchorCache.clear()
		this.hits = 0
		this.misses = 0
	}

	/**
	 * Get current cache size
	 */
	getCacheSize(): number {
		return this.fileCache.size + this.anchorCache.size
	}

	/**
	 * Get cache TTL
	 */
	getCacheTTL(): number {
		return this.ttl
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): CacheStats {
		return {
			size: this.getCacheSize(),
			ttl: this.ttl,
			hits: this.hits,
			misses: this.misses,
		}
	}

	/**
	 * Parse a cross-reference into file path and anchor
	 */
	private parseReference(reference: string): { filePath: string; anchor: string | null } {
		const hashIndex = reference.indexOf("#")

		if (hashIndex === -1) {
			return { filePath: reference, anchor: null }
		}

		return {
			filePath: reference.substring(0, hashIndex),
			anchor: reference.substring(hashIndex),
		}
	}

	/**
	 * Find anchor in document content
	 */
	private findAnchorInContent(content: string, anchor: string): boolean {
		if (!anchor.startsWith("#")) {
			return false
		}

		// Remove the # from anchor
		const anchorText = anchor.substring(1)

		// Split content into lines and check for matching headings
		const lines = content.split("\n")

		for (const line of lines) {
			const trimmed = line.trim()

			// Check if line is a heading (starts with #)
			if (trimmed.startsWith("#")) {
				const headingText = trimmed.replace(/^#+\s*/, "").trim()

				// Convert heading to anchor format and compare
				const headingAnchor = this.headingToAnchor(headingText)
				if (headingAnchor === anchorText) {
					return true
				}

				// Also check direct match (for backwards compatibility)
				const expectedHeading = this.anchorToHeading(anchorText)
				if (headingText === expectedHeading) {
					return true
				}
			}
		}

		return false
	}

	/**
	 * Convert anchor text to expected heading format
	 */
	private anchorToHeading(anchor: string): string {
		return anchor
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
	}

	/**
	 * Convert heading text to anchor format
	 */
	private headingToAnchor(heading: string): string {
		return heading
			.toLowerCase()
			.replace(/[^\w\s-]/g, "") // Remove special characters
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Collapse multiple hyphens
			.replace(/^-|-$/g, "") // Remove leading/trailing hyphens
	}

	/**
	 * Check if cache entry is still valid
	 */
	private isCacheValid(timestamp: number): boolean {
		return Date.now() - timestamp < this.ttl
	}

	/**
	 * Cache file validation result
	 */
	private cacheFileResult(key: string, result: FileValidationResult, ttl?: number): void {
		if (this.fileCache.size >= this.maxCacheSize) {
			// Remove oldest entry
			const oldestKey = this.fileCache.keys().next().value
			if (oldestKey !== undefined) {
				this.fileCache.delete(oldestKey)
			}
		}

		this.fileCache.set(key, {
			value: result,
			timestamp: Date.now() - (this.ttl - (ttl || this.ttl)),
		})
	}

	/**
	 * Cache anchor validation result
	 */
	private cacheAnchorResult(key: string, result: AnchorValidationResult, ttl?: number): void {
		if (this.anchorCache.size >= this.maxCacheSize) {
			// Remove oldest entry
			const oldestKey = this.anchorCache.keys().next().value
			if (oldestKey !== undefined) {
				this.anchorCache.delete(oldestKey)
			}
		}

		this.anchorCache.set(key, {
			value: result,
			timestamp: Date.now() - (this.ttl - (ttl || this.ttl)),
		})
	}

	/**
	 * Normalize path for consistent caching
	 */
	private normalizePath(filePath: string): string {
		try {
			return resolve(filePath)
		} catch {
			return filePath
		}
	}

	/**
	 * Check if path is malformed
	 */
	private isMalformedPath(filePath: string): boolean {
		// Check for null bytes
		if (filePath.includes("\0")) {
			return true
		}

		// Check for other malformed patterns
		if (filePath.includes("..") && filePath.includes("//")) {
			return true
		}

		return false
	}
}
