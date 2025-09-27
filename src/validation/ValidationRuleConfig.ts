/**
 * Validation Rule Configuration System
 * 
 * Creates a configuration system that allows different validation rules
 * based on document type and context.
 */

import { DocumentTypeDetector, DocumentTypeResult } from './DocumentTypeDetector'

export interface ValidationRule {
  enabled: boolean
  value: any
}

export interface RuleSet {
  name: string
  description: string
  rules: Record<string, ValidationRule>
}

export interface ValidationRuleConfigOptions {
  documentTypeDetector: DocumentTypeDetector
  ruleSets?: Record<string, RuleSet>
}

export class ValidationRuleConfig {
  private documentTypeDetector: DocumentTypeDetector
  private ruleSets: Record<string, RuleSet>
  private cache: Map<string, Record<string, ValidationRule>> = new Map()

  constructor(options: ValidationRuleConfigOptions) {
    this.documentTypeDetector = options.documentTypeDetector
    this.ruleSets = options.ruleSets || this.createDefaultRuleSets()
    this.validateConfiguration()
  }

  /**
   * Get rules for a specific document
   */
  getRulesForDocument(filePath: string, content: string, structure: string): Record<string, ValidationRule> {
    const cacheKey = this.generateCacheKey(filePath, content, structure)
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const typeResult = this.documentTypeDetector.detectType(filePath, content, structure)
      const documentType = typeResult.type
      
      let rules = this.ruleSets[documentType]?.rules || this.ruleSets.general.rules
      
      // Only apply dynamic rule adjustments if we have a confident document type detection
      if (typeResult.confidence > 0.5) {
        rules = this.applyDynamicRules(rules, filePath, content, structure, typeResult)
      }
      
      this.cache.set(cacheKey, rules)
      return rules
      
    } catch (error) {
      // Fallback to general rules on error
      const generalRules = this.ruleSets.general.rules
      this.cache.set(cacheKey, generalRules)
      return generalRules
    }
  }

  /**
   * Get a specific rule value for a document
   */
  getRuleValue(filePath: string, content: string, structure: string, ruleName: string): any {
    const rules = this.getRulesForDocument(filePath, content, structure)
    const rule = rules[ruleName]
    
    if (!rule || !rule.enabled) {
      return undefined
    }
    
    return rule.value
  }

  /**
   * Check if a rule is enabled for a document
   */
  isRuleEnabled(filePath: string, content: string, structure: string, ruleName: string): boolean {
    const rules = this.getRulesForDocument(filePath, content, structure)
    const rule = rules[ruleName]
    
    return rule ? rule.enabled : false
  }

  /**
   * Update a rule set
   */
  updateRuleSet(type: string, ruleSet: RuleSet): void {
    if (!type || typeof type !== 'string' || type.trim() === '') {
      throw new Error('Rule set type must be a non-empty string')
    }
    
    this.validateRuleSet(ruleSet)
    this.ruleSets[type] = { ...ruleSet }
    this.clearCache()
  }

  /**
   * Get all rule sets
   */
  getRuleSets(): Record<string, RuleSet> {
    return { ...this.ruleSets }
  }

  /**
   * Get a specific rule set
   */
  getRuleSet(type: string): RuleSet | undefined {
    return this.ruleSets[type]
  }

  /**
   * Validate the entire configuration
   */
  validateConfiguration(): void {
    for (const [type, ruleSet] of Object.entries(this.ruleSets)) {
      this.validateRuleSet(ruleSet)
    }
  }

  /**
   * Clear the rule cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Create default rule sets
   */
  private createDefaultRuleSets(): Record<string, RuleSet> {
    return {
      navigation: {
        name: 'Navigation Rules',
        description: 'Validation rules for navigation documents like README files and getting started guides',
        rules: {
          maxLineLength: { enabled: true, value: 100 },
          requireHeadings: { enabled: true, value: true },
          minHeadingLevel: { enabled: true, value: 2 },
          maxHeadingLevel: { enabled: true, value: 4 },
          requireTableOfContents: { enabled: false, value: false },
          allowLongLines: { enabled: true, value: true },
          requireCodeBlocks: { enabled: false, value: false },
          maxSectionLength: { enabled: true, value: 1000 },
          requireLinks: { enabled: true, value: true },
          allowEmptySections: { enabled: false, value: false }
        }
      },
      technical: {
        name: 'Technical Documentation Rules',
        description: 'Validation rules for technical documentation like API references and specifications',
        rules: {
          maxLineLength: { enabled: true, value: 80 },
          requireHeadings: { enabled: true, value: true },
          minHeadingLevel: { enabled: true, value: 2 },
          maxHeadingLevel: { enabled: true, value: 6 },
          requireTableOfContents: { enabled: false, value: false },
          allowLongLines: { enabled: false, value: false },
          requireCodeBlocks: { enabled: true, value: true },
          maxSectionLength: { enabled: true, value: 2000 },
          requireLinks: { enabled: false, value: false },
          allowEmptySections: { enabled: true, value: true }
        }
      },
      planning: {
        name: 'Planning Document Rules',
        description: 'Validation rules for planning documents like roadmaps and project plans',
        rules: {
          maxLineLength: { enabled: true, value: 120 },
          requireHeadings: { enabled: true, value: true },
          minHeadingLevel: { enabled: true, value: 2 },
          maxHeadingLevel: { enabled: true, value: 4 },
          requireTableOfContents: { enabled: true, value: true },
          allowLongLines: { enabled: true, value: true },
          requireCodeBlocks: { enabled: false, value: false },
          maxSectionLength: { enabled: true, value: 1500 },
          requireLinks: { enabled: true, value: true },
          allowEmptySections: { enabled: false, value: false }
        }
      },
      general: {
        name: 'General Document Rules',
        description: 'Default validation rules for general documents',
        rules: {
          maxLineLength: { enabled: true, value: 100 },
          requireHeadings: { enabled: true, value: true },
          minHeadingLevel: { enabled: true, value: 2 },
          maxHeadingLevel: { enabled: true, value: 6 },
          requireTableOfContents: { enabled: false, value: false },
          allowLongLines: { enabled: true, value: true },
          requireCodeBlocks: { enabled: false, value: false },
          maxSectionLength: { enabled: true, value: 1500 },
          requireLinks: { enabled: false, value: false },
          allowEmptySections: { enabled: true, value: true }
        }
      }
    }
  }

  /**
   * Apply dynamic rule adjustments based on content and structure
   */
  private applyDynamicRules(
    baseRules: Record<string, ValidationRule>,
    filePath: string,
    content: string,
    structure: string,
    typeResult: DocumentTypeResult
  ): Record<string, ValidationRule> {
    const rules = { ...baseRules }

    // Adjust rules based on content length
    if (content.length > 10000) {
      rules.maxSectionLength = {
        enabled: true,
        value: Math.max(rules.maxSectionLength.value, 3000)
      }
    }

    // Adjust rules based on content complexity
    const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length
    if (headingCount > 20) {
      rules.maxHeadingLevel = {
        enabled: true,
        value: Math.min(rules.maxHeadingLevel.value, 5)
      }
    }

    // Adjust rules based on document type confidence
    if (typeResult.confidence < 0.5) {
      // For uncertain document types, use more lenient rules
      rules.maxLineLength = {
        enabled: true,
        value: Math.max(rules.maxLineLength.value, 120)
      }
      rules.allowLongLines = { enabled: true, value: true }
    }

    // Adjust rules based on file path patterns
    if (filePath.includes('README') || filePath.includes('readme')) {
      rules.requireTableOfContents = { enabled: false, value: false }
      rules.requireLinks = { enabled: true, value: true }
    }

    // Adjust rules based on content structure
    if (content.includes('```') && content.includes('```')) {
      rules.requireCodeBlocks = { enabled: true, value: true }
    }

    // Adjust rules based on heading structure
    const hasProperStructure = this.hasProperHeadingStructure(content)
    if (!hasProperStructure) {
      rules.minHeadingLevel = { enabled: true, value: 1 }
      rules.requireHeadings = { enabled: true, value: true }
    }

    return rules
  }

  /**
   * Check if document has proper heading structure
   */
  private hasProperHeadingStructure(content: string): boolean {
    const lines = content.split('\n')
    let hasH1 = false
    let hasH2 = false

    for (const line of lines) {
      if (line.match(/^#\s+/)) {
        hasH1 = true
      } else if (line.match(/^##\s+/)) {
        hasH2 = true
      }
    }

    return hasH1 && hasH2
  }

  /**
   * Generate cache key for document
   */
  private generateCacheKey(filePath: string, content: string, structure: string): string {
    // Use a simple hash of the inputs for caching
    const input = `${filePath}:${content.length}:${structure.length}`
    return Buffer.from(input).toString('base64').substring(0, 20)
  }

  /**
   * Validate a rule set
   */
  private validateRuleSet(ruleSet: RuleSet): void {
    if (!ruleSet.name || typeof ruleSet.name !== 'string') {
      throw new Error('Rule set must have a valid name')
    }

    if (!ruleSet.description || typeof ruleSet.description !== 'string') {
      throw new Error('Rule set must have a valid description')
    }

    if (!ruleSet.rules || typeof ruleSet.rules !== 'object') {
      throw new Error('Rule set must have rules object')
    }

    // Check for required rules
    const requiredRules = ['maxLineLength', 'requireHeadings']
    for (const requiredRule of requiredRules) {
      if (!ruleSet.rules[requiredRule]) {
        throw new Error(`Rule set must include required rule: ${requiredRule}`)
      }
    }

    for (const [ruleName, rule] of Object.entries(ruleSet.rules)) {
      if (!ruleName || typeof ruleName !== 'string') {
        throw new Error('Rule names must be non-empty strings')
      }

      if (typeof rule !== 'object' || rule === null) {
        throw new Error(`Rule '${ruleName}' must be an object`)
      }

      if (typeof rule.enabled !== 'boolean') {
        throw new Error(`Rule '${ruleName}' must have boolean enabled property`)
      }

      // Validate rule values based on rule name
      this.validateRuleValue(ruleName, rule.value)
    }
  }

  /**
   * Validate a rule value based on rule name
   */
  private validateRuleValue(ruleName: string, value: any): void {
    switch (ruleName) {
      case 'maxLineLength':
      case 'minHeadingLevel':
      case 'maxHeadingLevel':
      case 'maxSectionLength':
        if (typeof value !== 'number' || value <= 0) {
          throw new Error(`Rule '${ruleName}' must have a positive number value`)
        }
        break

      case 'requireHeadings':
      case 'requireTableOfContents':
      case 'allowLongLines':
      case 'requireCodeBlocks':
      case 'requireLinks':
      case 'allowEmptySections':
        if (typeof value !== 'boolean') {
          throw new Error(`Rule '${ruleName}' must have a boolean value`)
        }
        break

      default:
        // For unknown rules, just check that value is not undefined
        if (value === undefined) {
          throw new Error(`Rule '${ruleName}' must have a defined value`)
        }
    }
  }
}
