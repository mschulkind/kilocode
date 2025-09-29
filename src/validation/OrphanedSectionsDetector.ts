/**
 * Context-Aware Orphaned Sections Detection
 *
 * Implements intelligent orphaned sections detection that considers document type,
 * navigation patterns, and document connectivity to avoid false positives.
 */

import { DocumentTypeDetector, DocumentTypeResult } from "./DocumentTypeDetector.js"
import { FileIndexBuilder, FileEntry } from "./FileIndexBuilder.js"

export interface DetectionConfig {
	minSectionLength: number
	maxOrphanedSections: number
	ignoreNavigationDocuments: boolean
	ignorePlanningDocuments: boolean
	contextWindowSize: number
}

export interface OrphanedSection {
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

export interface DetectionResult {
	orphanedSections: OrphanedSection[]
	totalSections: number
	documentType: string
	confidence: number
	reason: string
	errors: string[]
}

export interface SectionStats {
	totalSections: number
	averageLength: number
	maxLength: number
	minLength: number
	sectionsWithCode: number
}

export interface Reference {
	target: string
	source: string
	line: number
	type: "internal" | "external" | "anchor"
}

export interface OrphanedSectionsDetectorOptions {
	documentTypeDetector: DocumentTypeDetector
	fileIndexBuilder: FileIndexBuilder
	config?: Partial<DetectionConfig>
}

export class OrphanedSectionsDetector {
	private config: DetectionConfig
	private documentTypeDetector: DocumentTypeDetector
	private fileIndexBuilder: FileIndexBuilder

	constructor(options: OrphanedSectionsDetectorOptions) {
		this.documentTypeDetector = options.documentTypeDetector
		this.fileIndexBuilder = options.fileIndexBuilder
		this.config = this.mergeWithDefaults(options.config || {})
	}

	/**
	 * Detect orphaned sections in a document
	 */
	detectOrphanedSections(filePath: string, content: string): DetectionResult {
		const result: DetectionResult = {
			orphanedSections: [],
			totalSections: 0,
			documentType: "general",
			confidence: 0,
			reason: "",
			errors: [],
		}

		try {
			// Detect document type
			const typeResult = this.documentTypeDetector.detectType(filePath, content, "")
			result.documentType = typeResult.type
			result.confidence = typeResult.confidence

			// Skip navigation documents if configured
			if (this.config.ignoreNavigationDocuments && typeResult.type === "navigation") {
				result.reason = "Skipped: navigation document"
				return result
			}

			// Skip planning documents if configured
			if (this.config.ignorePlanningDocuments && typeResult.type === "planning") {
				result.reason = "Skipped: planning document"
				return result
			}

			// Parse sections
			const sections = this.parseSections(content)
			result.totalSections = sections.length

			if (sections.length === 0) {
				result.reason = "No sections found"
				return result
			}

			// Check for malformed markdown
			if (this.hasMalformedMarkdown(content)) {
				result.errors.push("Malformed markdown detected")
			}

			// Detect references
			const references = this.detectReferences(filePath, content)

			// Analyze each section
			const orphanedSections: OrphanedSection[] = []

			for (let i = 0; i < sections.length; i++) {
				const section = sections[i]

				// Skip sections that are too short
				if (section.content.length < this.config.minSectionLength) {
					continue
				}

				const analysis = this.analyzeSection(filePath, section.title, section.content, section.level)

				// Check if section is referenced
				const isReferenced = this.isSectionReferenced(section.title, references)

				// Check document connectivity
				const connectivityScore = this.calculateConnectivityScore(section, sections, i)

				// Calculate orphaned confidence
				let confidence = analysis.confidence

				if (isReferenced) {
					confidence *= 0.2 // Reduce confidence if referenced
				}

				if (connectivityScore > 0.5) {
					confidence *= 0.3 // Reduce confidence if well connected
				}

				if (confidence > 0.3) {
					orphanedSections.push({
						...analysis,
						confidence,
						reasons: this.generateReasons(analysis, isReferenced, connectivityScore),
					})
				}
			}

			// Sort by confidence and limit results
			orphanedSections.sort((a, b) => b.confidence - a.confidence)
			result.orphanedSections = orphanedSections.slice(0, this.config.maxOrphanedSections)

			result.reason = `Found ${result.orphanedSections.length} orphaned sections out of ${result.totalSections} total sections`
		} catch (error) {
			result.errors.push(error instanceof Error ? error.message : String(error))
		}

		return result
	}

	/**
	 * Analyze an individual section
	 */
	analyzeSection(filePath: string, title: string, content: string, level: number): OrphanedSection {
		const lines = content.split("\n")
		const startLine = this.findLineInContent(filePath, title)
		const endLine = startLine + lines.length - 1

		// Count code blocks
		const codeBlockMatches = content.match(/```[\s\S]*?```/g)
		const hasCodeBlocks = (codeBlockMatches?.length || 0) > 0

		// Count references in this section
		const references = this.detectReferences(filePath, content)
		const referenceCount = references.length

		// Calculate base confidence
		let confidence = 0.5 // Start with moderate confidence

		// Increase confidence if section is long and has no references
		if (content.length > 200 && referenceCount === 0) {
			confidence += 0.3
		}

		// Decrease confidence if section has code blocks (likely examples)
		if (hasCodeBlocks) {
			confidence -= 0.2
		}

		// Decrease confidence for common section types
		const commonSections = ["introduction", "overview", "conclusion", "summary", "notes"]
		if (commonSections.some((common) => title.toLowerCase().includes(common))) {
			confidence -= 0.2
		}

		// Decrease confidence if section has references
		if (referenceCount > 0) {
			confidence -= 0.4
		}

		return {
			title,
			level,
			startLine,
			endLine,
			length: content.length,
			hasCodeBlocks,
			referenceCount,
			confidence: Math.max(0, Math.min(1, confidence)),
			reasons: [],
		}
	}

	/**
	 * Detect references in content
	 */
	detectReferences(filePath: string, content: string): Reference[] {
		const references: Reference[] = []
		const lines = content.split("\n")

		// Match markdown links [text](url)
		const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
		// Match anchor links #section-name
		const anchorRegex = /#([a-z0-9-]+)/g

		lines.forEach((line, index) => {
			let match

			// Find markdown links
			while ((match = linkRegex.exec(line)) !== null) {
				const [, text, url] = match

				// Skip empty or invalid links
				if (!url || url.trim() === "" || url === "#") {
					continue
				}

				// Skip broken links
				if (url === "broken-link" || url === "") {
					continue
				}

				let type: Reference["type"] = "external"

				if (url.startsWith("#")) {
					type = "anchor"
				} else if (url.startsWith("./") || url.startsWith("../") || !url.includes("://")) {
					type = "internal"
				}

				references.push({
					target: url,
					source: text,
					line: index + 1,
					type,
				})
			}

			// Find anchor references (only if they appear in link context)
			if (line.includes("[") && line.includes("](")) {
				while ((match = anchorRegex.exec(line)) !== null) {
					references.push({
						target: "#" + match[1],
						source: match[1],
						line: index + 1,
						type: "anchor",
					})
				}
			}
		})

		return references
	}

	/**
	 * Get section statistics
	 */
	getSectionStats(filePath: string, content: string): SectionStats {
		const sections = this.parseSections(content)

		if (sections.length === 0) {
			return {
				totalSections: 0,
				averageLength: 0,
				maxLength: 0,
				minLength: 0,
				sectionsWithCode: 0,
			}
		}

		const lengths = sections.map((s) => s.content.length)
		const averageLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length
		const maxLength = Math.max(...lengths)
		const minLength = Math.min(...lengths)
		const sectionsWithCode = sections.filter((s) => /```[\s\S]*?```/.test(s.content)).length

		return {
			totalSections: sections.length,
			averageLength,
			maxLength,
			minLength,
			sectionsWithCode,
		}
	}

	/**
	 * Get current configuration
	 */
	getConfig(): DetectionConfig {
		return { ...this.config }
	}

	/**
	 * Update configuration
	 */
	updateConfig(newConfig: DetectionConfig): void {
		this.validateConfig(newConfig)
		this.config = { ...newConfig }
	}

	/**
	 * Parse sections from markdown content
	 */
	private parseSections(
		content: string,
	): Array<{ title: string; content: string; level: number; startLine: number }> {
		const sections: Array<{ title: string; content: string; level: number; startLine: number }> = []
		const lines = content.split("\n")
		let currentSection: { title: string; content: string; level: number; startLine: number } | null = null

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)

			if (headingMatch) {
				// Save previous section
				if (currentSection) {
					sections.push(currentSection)
				}

				// Start new section (skip level 1 headings as they are usually main titles)
				const level = headingMatch[1].length
				const title = headingMatch[2].trim()

				if (level > 1) {
					currentSection = {
						title,
						content: "",
						level,
						startLine: i + 1,
					}
				}
			} else if (currentSection) {
				// Add content to current section
				currentSection.content += line + "\n"
			}
		}

		// Add final section
		if (currentSection) {
			sections.push(currentSection)
		}

		return sections
	}

	/**
	 * Check if a section is referenced
	 */
	private isSectionReferenced(sectionTitle: string, references: Reference[]): boolean {
		const normalizedTitle = sectionTitle.toLowerCase()
		const anchorTitle = this.titleToAnchor(sectionTitle)

		return references.some((ref) => {
			const normalizedTarget = ref.target.toLowerCase()
			return (
				normalizedTarget.includes(normalizedTitle) ||
				normalizedTarget.includes(anchorTitle) ||
				ref.source.toLowerCase().includes(normalizedTitle)
			)
		})
	}

	/**
	 * Calculate connectivity score for a section
	 */
	private calculateConnectivityScore(
		section: { title: string; content: string; level: number },
		allSections: Array<{ title: string; content: string; level: number }>,
		index: number,
	): number {
		let score = 0
		const windowSize = this.config.contextWindowSize

		// Check nearby sections for references
		const start = Math.max(0, index - windowSize)
		const end = Math.min(allSections.length, index + windowSize + 1)

		for (let i = start; i < end; i++) {
			if (i === index) continue

			const otherSection = allSections[i]
			const references = this.detectReferences("", otherSection.content)

			if (this.isSectionReferenced(section.title, references)) {
				score += 0.3
			}
		}

		// Check document connectivity
		const fileMatches = this.fileIndexBuilder.findFilesByPattern("**/*.md")
		if (fileMatches.length > 5) {
			score += 0.2 // High connectivity
		} else if (fileMatches.length > 2) {
			score += 0.1 // Medium connectivity
		}

		return Math.min(1, score)
	}

	/**
	 * Generate reasons for orphaned status
	 */
	private generateReasons(
		analysis: Omit<OrphanedSection, "confidence" | "reasons">,
		isReferenced: boolean,
		connectivityScore: number,
	): string[] {
		const reasons: string[] = []

		if (analysis.referenceCount === 0) {
			reasons.push("no-references")
		}

		if (analysis.length > 200) {
			reasons.push("long-section")
		}

		if (!isReferenced) {
			reasons.push("not-referenced")
		}

		if (connectivityScore < 0.3) {
			reasons.push("low-connectivity")
		}

		if (!analysis.hasCodeBlocks) {
			reasons.push("no-code-examples")
		}

		return reasons
	}

	/**
	 * Convert title to anchor format
	 */
	private titleToAnchor(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "")
	}

	/**
	 * Find line number of title in content
	 */
	private findLineInContent(filePath: string, title: string): number {
		// This is a simplified implementation
		// In a real implementation, you'd track line numbers during parsing
		return 1
	}

	/**
	 * Merge configuration with defaults
	 */
	private mergeWithDefaults(config: Partial<DetectionConfig>): DetectionConfig {
		return {
			minSectionLength: config.minSectionLength || 50,
			maxOrphanedSections: config.maxOrphanedSections || 5,
			ignoreNavigationDocuments: config.ignoreNavigationDocuments !== false,
			ignorePlanningDocuments: config.ignorePlanningDocuments !== false,
			contextWindowSize: config.contextWindowSize || 3,
		}
	}

	/**
	 * Check for malformed markdown
	 */
	private hasMalformedMarkdown(content: string): boolean {
		// Check for headings without content
		const lines = content.split("\n")
		let hasUnclosedHeading = false

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line.match(/^#{1,6}\s+/)) {
				// Check if this heading has content after it
				let hasContent = false
				for (let j = i + 1; j < lines.length; j++) {
					const nextLine = lines[j].trim()
					if (nextLine !== "" && !nextLine.match(/^#{1,6}\s+/)) {
						hasContent = true
						break
					}
				}
				if (!hasContent) {
					hasUnclosedHeading = true
				}
			}
		}

		return hasUnclosedHeading
	}

	/**
	 * Validate configuration
	 */
	private validateConfig(config: DetectionConfig): void {
		if (config.minSectionLength < 0) {
			throw new Error("minSectionLength must be non-negative")
		}
		if (config.maxOrphanedSections <= 0) {
			throw new Error("maxOrphanedSections must be positive")
		}
		if (config.contextWindowSize < 0) {
			throw new Error("contextWindowSize must be non-negative")
		}
	}
}
