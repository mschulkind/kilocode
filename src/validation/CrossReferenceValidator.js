/**
 * Enhanced Cross-Reference Validator
 *
 * Provides robust cross-reference validation with proper file system checking,
 * caching, and error handling to eliminate false positive cross-reference warnings.
 */
import { promises as fs } from "fs";
import { resolve } from "path";
export class CrossReferenceValidator {
    constructor(options = {}) {
        this.fileCache = new Map();
        this.anchorCache = new Map();
        this.hits = 0;
        this.misses = 0;
        this.ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
        this.maxCacheSize = options.maxCacheSize || 1000; // Default 1000 entries
    }
    /**
     * Validate if a file exists and get its metadata
     */
    async validateFile(filePath) {
        try {
            // Check for malformed paths
            if (this.isMalformedPath(filePath)) {
                return {
                    exists: false,
                    isFile: false,
                    lastModified: null,
                    cached: false,
                    error: "malformed path detected",
                };
            }
            // Check cache first
            const cacheKey = this.normalizePath(filePath);
            const cached = this.fileCache.get(cacheKey);
            if (cached && this.isCacheValid(cached.timestamp)) {
                this.hits++;
                return {
                    ...cached.value,
                    cached: true,
                };
            }
            // Validate file
            const stats = await fs.stat(filePath);
            const result = {
                exists: true,
                isFile: stats.isFile(),
                lastModified: stats.mtime,
                cached: false,
            };
            // Cache the result
            this.cacheFileResult(cacheKey, result);
            this.misses++;
            return result;
        }
        catch (error) {
            const result = {
                exists: false,
                isFile: false,
                lastModified: null,
                cached: false,
                error: error instanceof Error ? error.message : String(error),
            };
            // Cache negative results too (for a shorter time)
            const cacheKey = this.normalizePath(filePath);
            this.cacheFileResult(cacheKey, result, this.ttl / 2); // Half TTL for errors
            this.misses++;
            return result;
        }
    }
    /**
     * Validate if an anchor exists within a document
     */
    async validateAnchor(filePath, anchor) {
        try {
            // Check cache first
            const cacheKey = `${this.normalizePath(filePath)}:${anchor}`;
            const cached = this.anchorCache.get(cacheKey);
            if (cached && this.isCacheValid(cached.timestamp)) {
                this.hits++;
                return {
                    ...cached.value,
                    cached: true,
                };
            }
            // Read file content
            const content = await fs.readFile(filePath, "utf-8");
            const found = this.findAnchorInContent(content.toString(), anchor);
            const result = {
                exists: true,
                anchor,
                found,
                cached: false,
            };
            // Cache the result
            this.cacheAnchorResult(cacheKey, result);
            this.misses++;
            return result;
        }
        catch (error) {
            const result = {
                exists: false,
                anchor,
                found: false,
                cached: false,
                error: error instanceof Error ? error.message : String(error),
            };
            // Cache negative results too
            const cacheKey = `${this.normalizePath(filePath)}:${anchor}`;
            this.cacheAnchorResult(cacheKey, result, this.ttl / 2);
            this.misses++;
            return result;
        }
    }
    /**
     * Validate a complete cross-reference (file + optional anchor)
     */
    async validateCrossReference(reference) {
        const { filePath, anchor } = this.parseReference(reference);
        // Validate file existence
        const fileResult = await this.validateFile(filePath);
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
            };
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
            };
        }
        // Validate anchor
        const anchorResult = await this.validateAnchor(filePath, anchor);
        return {
            reference,
            filePath,
            anchor,
            fileExists: true,
            anchorExists: anchorResult.found,
            valid: anchorResult.found,
            cached: fileResult.cached || anchorResult.cached,
            error: anchorResult.error,
        };
    }
    /**
     * Clear all cached results
     */
    clearCache() {
        this.fileCache.clear();
        this.anchorCache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    /**
     * Get current cache size
     */
    getCacheSize() {
        return this.fileCache.size + this.anchorCache.size;
    }
    /**
     * Get cache TTL
     */
    getCacheTTL() {
        return this.ttl;
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.getCacheSize(),
            ttl: this.ttl,
            hits: this.hits,
            misses: this.misses,
        };
    }
    /**
     * Parse a cross-reference into file path and anchor
     */
    parseReference(reference) {
        const hashIndex = reference.indexOf("#");
        if (hashIndex === -1) {
            return { filePath: reference, anchor: null };
        }
        return {
            filePath: reference.substring(0, hashIndex),
            anchor: reference.substring(hashIndex),
        };
    }
    /**
     * Find anchor in document content
     */
    findAnchorInContent(content, anchor) {
        if (!anchor.startsWith("#")) {
            return false;
        }
        // Remove the # from anchor
        const anchorText = anchor.substring(1);
        // Split content into lines and check for matching headings
        const lines = content.split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            // Check if line is a heading (starts with #)
            if (trimmed.startsWith("#")) {
                const headingText = trimmed.replace(/^#+\s*/, "").trim();
                // Convert heading to anchor format and compare
                const headingAnchor = this.headingToAnchor(headingText);
                if (headingAnchor === anchorText) {
                    return true;
                }
                // Also check direct match (for backwards compatibility)
                const expectedHeading = this.anchorToHeading(anchorText);
                if (headingText === expectedHeading) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Convert anchor text to expected heading format
     */
    anchorToHeading(anchor) {
        return anchor
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    /**
     * Convert heading text to anchor format
     */
    headingToAnchor(heading) {
        return heading
            .toLowerCase()
            .replace(/[^\w\s-]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Collapse multiple hyphens
            .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
    }
    /**
     * Check if cache entry is still valid
     */
    isCacheValid(timestamp) {
        return Date.now() - timestamp < this.ttl;
    }
    /**
     * Cache file validation result
     */
    cacheFileResult(key, result, ttl) {
        if (this.fileCache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const oldestKey = this.fileCache.keys().next().value;
            if (oldestKey !== undefined) {
                this.fileCache.delete(oldestKey);
            }
        }
        this.fileCache.set(key, {
            value: result,
            timestamp: Date.now() - (this.ttl - (ttl || this.ttl)),
        });
    }
    /**
     * Cache anchor validation result
     */
    cacheAnchorResult(key, result, ttl) {
        if (this.anchorCache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const oldestKey = this.anchorCache.keys().next().value;
            if (oldestKey !== undefined) {
                this.anchorCache.delete(oldestKey);
            }
        }
        this.anchorCache.set(key, {
            value: result,
            timestamp: Date.now() - (this.ttl - (ttl || this.ttl)),
        });
    }
    /**
     * Normalize path for consistent caching
     */
    normalizePath(filePath) {
        try {
            return resolve(filePath);
        }
        catch {
            return filePath;
        }
    }
    /**
     * Check if path is malformed
     */
    isMalformedPath(filePath) {
        // Check for null bytes
        if (filePath.includes("\0")) {
            return true;
        }
        // Check for other malformed patterns
        if (filePath.includes("..") && filePath.includes("//")) {
            return true;
        }
        return false;
    }
}
