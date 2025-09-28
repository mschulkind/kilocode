/**
 * Context-Aware Document Type Detection
 *
 * Implements document type detection based on file path, content, and structure
 * to enable context-aware validation rules.
 */
export class DocumentTypeDetector {
    constructor(config) {
        this.config = this.mergeWithDefaults(config || {});
    }
    /**
     * Detect document type based on path, content, and structure
     */
    detectType(filePath, content, structure) {
        const results = [];
        // Path-based detection
        const pathResult = this.detectByPath(filePath);
        if (pathResult) {
            results.push(pathResult);
        }
        // Content-based detection
        const contentResult = this.detectByContent(content);
        if (contentResult) {
            results.push(contentResult);
        }
        // Structure-based detection
        const structureResult = this.detectByStructure(content);
        if (structureResult) {
            results.push(structureResult);
        }
        // If no results, return fallback
        if (results.length === 0) {
            return {
                type: this.config.fallback,
                confidence: 0.1,
                reasons: ['fallback']
            };
        }
        // Group results by type and calculate combined confidence
        const typeGroups = new Map();
        for (const result of results) {
            if (!typeGroups.has(result.type)) {
                typeGroups.set(result.type, []);
            }
            typeGroups.get(result.type).push({
                confidence: result.confidence,
                reason: result.reason
            });
        }
        // Find the type with highest combined confidence
        let bestType = this.config.fallback;
        let bestConfidence = 0;
        let bestReasons = [];
        for (const [type, matches] of typeGroups) {
            const totalConfidence = matches.reduce((sum, match) => sum + match.confidence, 0);
            const averageConfidence = totalConfidence / matches.length;
            const bonusConfidence = Math.min(0.2, (matches.length - 1) * 0.1); // Bonus for multiple matches
            const finalConfidence = Math.min(1.0, averageConfidence + bonusConfidence);
            if (finalConfidence > bestConfidence) {
                bestType = type;
                bestConfidence = finalConfidence;
                bestReasons = matches.map(m => m.reason);
            }
        }
        return {
            type: bestType,
            confidence: bestConfidence,
            reasons: bestReasons
        };
    }
    /**
     * Get type information
     */
    getTypeInfo(type) {
        const definition = this.config.types[type];
        if (!definition) {
            return null;
        }
        const typeInfos = {
            navigation: {
                name: 'Navigation Document',
                description: 'Documents that help users navigate and get started with the project',
                characteristics: [
                    'Getting started guides',
                    'README files',
                    'Table of contents',
                    'Installation instructions',
                    'Quick start guides'
                ]
            },
            technical: {
                name: 'Technical Documentation',
                description: 'Detailed technical documentation including APIs, references, and specifications',
                characteristics: [
                    'API documentation',
                    'Function references',
                    'Technical specifications',
                    'Code examples',
                    'Implementation details'
                ]
            },
            planning: {
                name: 'Planning Document',
                description: 'Documents that outline plans, roadmaps, and strategic information',
                characteristics: [
                    'Project plans',
                    'Roadmaps',
                    'Strategy documents',
                    'Timeline information',
                    'Resource allocation'
                ]
            },
            general: {
                name: 'General Document',
                description: 'General purpose documents that don\'t fit specific categories',
                characteristics: [
                    'General information',
                    'Mixed content',
                    'Custom formats',
                    'Unclassified content'
                ]
            }
        };
        return typeInfos[type] || {
            name: definition.name,
            description: `Custom document type: ${definition.name}`,
            characteristics: []
        };
    }
    /**
     * Get all configured types
     */
    getAllTypes() {
        return Object.keys(this.config.types);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.validateConfig(newConfig);
        this.config = { ...newConfig };
    }
    /**
     * Detect document type by file path
     */
    detectByPath(filePath) {
        if (!filePath)
            return null;
        const normalizedPath = filePath.toLowerCase();
        for (const [type, definition] of Object.entries(this.config.types)) {
            for (const pattern of definition.pathPatterns) {
                if (this.matchesPathPattern(normalizedPath, pattern)) {
                    return {
                        type,
                        confidence: 0.8,
                        reason: 'path-pattern'
                    };
                }
            }
        }
        return null;
    }
    /**
     * Detect document type by content
     */
    detectByContent(content) {
        if (!content)
            return null;
        const normalizedContent = content.toLowerCase();
        for (const [type, definition] of Object.entries(this.config.types)) {
            let matchCount = 0;
            let totalPatterns = definition.contentPatterns.length;
            for (const pattern of definition.contentPatterns) {
                if (this.matchesContentPattern(normalizedContent, pattern)) {
                    matchCount++;
                }
            }
            if (matchCount > 0) {
                const confidence = Math.min(0.7, (matchCount / totalPatterns) * 0.8 + 0.3);
                return {
                    type,
                    confidence,
                    reason: 'content-pattern'
                };
            }
        }
        return null;
    }
    /**
     * Detect document type by structure
     */
    detectByStructure(content) {
        if (!content)
            return null;
        for (const [type, definition] of Object.entries(this.config.types)) {
            for (const pattern of definition.structurePatterns) {
                if (this.matchesStructurePattern(content, pattern)) {
                    return {
                        type,
                        confidence: 0.6,
                        reason: 'structure-pattern'
                    };
                }
            }
        }
        return null;
    }
    /**
     * Check if path matches a pattern
     */
    matchesPathPattern(path, pattern) {
        // Convert glob pattern to regex
        const regex = this.pathPatternToRegex(pattern);
        return regex.test(path);
    }
    /**
     * Check if content matches a pattern
     */
    matchesContentPattern(content, pattern) {
        const regex = new RegExp(pattern, 'i');
        return regex.test(content);
    }
    /**
     * Check if structure matches a pattern
     */
    matchesStructurePattern(content, pattern) {
        const regex = new RegExp(pattern, 'i');
        return regex.test(content);
    }
    /**
     * Convert path pattern to regex
     */
    pathPatternToRegex(pattern) {
        // Handle special patterns
        if (pattern === 'readme*') {
            return /readme/i;
        }
        if (pattern === '**/api/**') {
            return /\/api\//;
        }
        if (pattern === '**/reference/**') {
            return /\/reference\//;
        }
        if (pattern === '**/plan*') {
            return /\/plan/;
        }
        if (pattern === '**/roadmap*') {
            return /\/roadmap/;
        }
        if (pattern === '**/api-guide*') {
            return /\/api-guide/;
        }
        if (pattern === '**/reference*') {
            return /\/reference/;
        }
        // Convert glob pattern to regex
        let regexStr = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
            .replace(/\*\*/g, '.*') // ** matches anything including /
            .replace(/\*/g, '[^/]*') // * matches anything except /
            .replace(/\?/g, '.'); // ? matches single character
        return new RegExp('^' + regexStr + '$', 'i');
    }
    /**
     * Merge configuration with defaults
     */
    mergeWithDefaults(config) {
        const defaultConfig = {
            types: {
                navigation: {
                    name: 'Navigation Document',
                    pathPatterns: [
                        'readme*',
                        '**/getting-started/**',
                        '**/guide/**',
                        '**/tutorial/**',
                        '**/index*'
                    ],
                    contentPatterns: [
                        'getting started',
                        'quick start',
                        'installation',
                        'setup',
                        'table of contents',
                        'welcome',
                        'overview'
                    ],
                    structurePatterns: [
                        '^# .*getting started',
                        '^# .*installation',
                        '^# .*quick start',
                        '^# .*table of contents',
                        '^## .*installation',
                        '^## .*setup'
                    ],
                    priority: 1
                },
                technical: {
                    name: 'Technical Documentation',
                    pathPatterns: [
                        '**/api/**',
                        '**/reference/**',
                        '**/spec/**',
                        '**/api-guide*',
                        '**/reference*'
                    ],
                    contentPatterns: [
                        'api reference',
                        'endpoints',
                        'authentication',
                        'response format',
                        'request format',
                        'function reference',
                        'class reference',
                        'method reference',
                        'parameters',
                        'return value'
                    ],
                    structurePatterns: [
                        '^# .*api.*reference',
                        '^## .*endpoints',
                        '^### .*get ',
                        '^### .*post ',
                        '^### .*put ',
                        '^### .*delete ',
                        '^## .*methods',
                        '^## .*functions'
                    ],
                    priority: 2
                },
                planning: {
                    name: 'Planning Document',
                    pathPatterns: [
                        '**/plan*',
                        '**/roadmap*',
                        '**/strategy*',
                        '**/timeline*'
                    ],
                    contentPatterns: [
                        'project plan',
                        'roadmap',
                        'timeline',
                        'milestones',
                        'objectives',
                        'goals',
                        'strategy',
                        'budget',
                        'resources',
                        'team members',
                        'phases'
                    ],
                    structurePatterns: [
                        '^# .*plan',
                        '^# .*roadmap',
                        '^## .*timeline',
                        '^## .*milestones',
                        '^## .*objectives',
                        '^## .*phases'
                    ],
                    priority: 3
                },
                general: {
                    name: 'General Document',
                    pathPatterns: [],
                    contentPatterns: [],
                    structurePatterns: [],
                    priority: 99
                }
            },
            fallback: 'general'
        };
        // If custom config is provided, use it as-is, otherwise use defaults
        if (config.types && Object.keys(config.types).length > 0) {
            return {
                types: { ...defaultConfig.types, ...config.types },
                fallback: config.fallback || defaultConfig.fallback
            };
        }
        return defaultConfig;
    }
    /**
     * Validate configuration
     */
    validateConfig(config) {
        if (!config.types || Object.keys(config.types).length === 0) {
            throw new Error('Configuration must have at least one document type');
        }
        if (!config.fallback || !config.types[config.fallback]) {
            throw new Error('Fallback type must be defined in types');
        }
        for (const [typeName, typeDef] of Object.entries(config.types)) {
            if (!typeDef.name) {
                throw new Error(`Type '${typeName}' must have a name`);
            }
            if (!Array.isArray(typeDef.pathPatterns)) {
                throw new Error(`Type '${typeName}' pathPatterns must be an array`);
            }
            if (!Array.isArray(typeDef.contentPatterns)) {
                throw new Error(`Type '${typeName}' contentPatterns must be an array`);
            }
            if (!Array.isArray(typeDef.structurePatterns)) {
                throw new Error(`Type '${typeName}' structurePatterns must be an array`);
            }
            if (typeof typeDef.priority !== 'number') {
                throw new Error(`Type '${typeName}' priority must be a number`);
            }
        }
    }
}
