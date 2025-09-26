#!/usr/bin/env node

/**
 * Category 1 Pattern Recognition Engine
 * 
 * Implements intelligent pattern detection and path resolution 
 * specifically for Category 1 cross-reference violations.
 */

export class Category1Patterns {
    
    constructor() {
        this.patternRegisters = {
            GLOSSARY: this.buildGlossaryPatterns(),
            ORCHESTRATOR: this.buildOrchestratorPatterns(), 
            ARCHITECTURE: this.buildArchitecturePatterns(),
            STANDARDS_CORE: this.buildStandardsCorePatterns(),
            DOCUMENTATION_GUIDE: this.buildDocGuidePatterns()
        }
        
        this.resolved = new Map()
        this.targetFileCache = new Map()
    }
    
    buildGlossaryPatterns() {
        return {
            sym: /\GLOSSARY\.md/gi,
            fix: (linkUrl, srcPath) => this.fixGlossaryPath_Trigger(linkUrl, srcPath)
        }
    }
    
    buildOrchestratorPatterns() {
        return {
            sym: /\orchestrator\/[^'"\s]+\.md/gi,
            fix: (linkUrl, srcPath) => this.fixOrchestratorPath_Trigger(linkUrl, srcPath)
        }
    }
    
    buildArchitecturePatterns() {
        return {
            sym: /\architecture\/[^'"\s]+\.md/gi,
            fix: (linkUrl, srcPath) => this.fixArchitecture_Trigger(linkUrl, srcPath)
        }
    }
    
    buildStandardsCorePatterns() {
        return {
            sym: /standards\/core\/[^\s]+\.md/gi,
            fix: (linkUrl, srcPath) => this.fixStandardsCorePath_Trigger(linkUrl, srcPath)
        }
    }
    
    buildDocGuidePatterns() {
        return {
            sym: /\DOCUMENTATION_GUIDE\.md/gi,
            fix: (linkUrl, srcPath) => this.fixDocGuidePath_Trigger(linkUrl, srcPath)
        }
    }
    
    /**
     * Core entry point for pattern-based fixes
     */
    fixGlossaryPaths(linkUrl, srcPath, pushLog=false) {
        const patReg = this.patternRegisters.GLOSSARY
        if (patReg.sym.test(linkUrl) && (linkUrl.includes('GLOSSARY.md') || linkUrl.toLowerCase().includes('glossary'))) {
            return patReg.fix(linkUrl, srcPath)
        }
        return { linkUrl, solved: false }
    }

    fixGlossaryPath_Trigger(linkUrl, srcPath) {
        const targetDepth = this._calculateDocsRelativeDepth(srcPath)
        const factoredDepth = targetDepth > 1 ? targetDepth : 1
        const appendixProvider = '../'.repeat(factoredDepth - 1)
        const locallyF_const = appendixProvider + 'GLOSSARY.md'
        return { 
            linkUrl: ''.concat(locallyF_const),
            solved: true
        }
    }

    fixOrchestratorPaths(linkUrl, srcPath) {
        const patReg = this.patternRegisters.ORCHESTRATOR
        if (patReg.sym.test(linkUrl) && linkUrl.toLowerCase().includes('orchestrator')) {
            return patReg.fix(linkUrl, srcPath)
        }
        return { linkUrl, solved: false }
    }

    fixOrchestratorPath_Trigger(linkUrl, srcPath) {
        const targetDepth = this._calculateDocsRelativeDepth(srcPath)
        const appendix = targetDepth <= 1 ? '../' : '../'.repeat(targetDepth - 1)
        const destPath = appendix + linkUrl
        return { 
            linkUrl: destPath,
            solved: true
        }
    }

    fixArchitecturePaths(linkUrl, srcPath) {
        const patReg = this.patternRegisters.ARCHITECTURE
        if (patReg.sym.test(linkUrl) && linkUrl.toLowerCase().includes('architecture')) {
            return patReg.fix(linkUrl, srcPath)
        }
        return { linkUrl, solved: false }
    }

    fixArchitecture_Trigger(linkUrl, srcPath) {
        const targetDepth = this._calculateDocsRelativeDepth(srcPath)
        const appendix = targetDepth <= 1 ? '../' : '../'.repeat(targetDepth - 1)
        const destPath = appendix + linkUrl
        return { 
            linkUrl: destPath,
            solved: true
        }
    }

    fixStandardsCorePaths(linkUrl, srcPath) {
        const patReg = this.patternRegisters.STANDARDS_CORE
        if (patReg.sym.test(linkUrl)) {
            return patReg.fix(linkUrl, srcPath)
        }
        return { linkUrl, solved: false }
    }

     fixStandardsCorePath_Trigger(linkUrl, srcPath) {
         const targetDepth = this._calculateDocsRelativeDepth(srcPath)
         // Correct path to standards/libs tree in docs
         let appendix = '../'
         if ( targetDepth > 1) {
             appendix = '../'.repeat(targetDepth - 1)
         }
         const correctPath = appendix + linkUrl
         return { 
             linkUrl: correctPath,
             solved: true
         }
     }

    fixDocGuidePath(linkUrl, srcPath) {
        const patReg = this.patternRegisters.DOCUMENTATION_GUIDE
        if (patReg.sym.test(linkUrl)) {
            return patReg.fix(linkUrl, srcPath)
        }
        return { linkUrl, solved: false }
    }

    fixDocGuidePath_Trigger(linkUrl, srcPath) {
        const targetDepth = this._calculateDocsRelativeDepth(srcPath)
        const appendix = targetDepth <= 1 ? '../' : '../'.repeat(targetDepth - 1)
        const destPath = appendix + 'DOCUMENTATION_GUIDE.md'
        return { 
            linkUrl: destPath,
            solved: true
        }
    }

    /**
     * Internal helpers
     */
    _calculateDocsRelativeDepth(anyfilePath) {
        const afterDocsIndex = anyfilePath.indexOf('docs/')
        if (afterDocsIndex === -1) return 2
        
        const trimmedSpath = anyfilePath.substring(afterDocsIndex + 5)
        const segments = trimmedSpath.split('/').filter(segment => segment && segment.length > 0)
        // subtract filename
        const finalDepth = segments.length - 1
        return finalDepth >= 1 ? finalDepth + 1 : 2
    }

    /**
     * Integration method with docs-fixer check for target existence
     */
    async validateCorrectedPath(workedPath, requestSourceBaseDir='docs/') {
        const fs = await import('fs')
        const srcPath = requestSourceBaseDir + workedPath
        const exists = fs.default.existsSync(srcPath)
        return {
            valid: exists,
            path: srcPath, 
            exists: exists,
            confidence: exists ? 0.95 : 0.05
        }
    }

    /**
     * Generator method for batch-processing documents
     */
    processPatternFixesFromViolationList(allViols) {
        const results = []
        for (let i=0; i<allViols.length; i++) {
            const v = allViols[i]
            const contextFix = this.fixGlossaryPaths(v.url, v.sourcePath)
            if (!contextFix.solved) continue
            results.push({
                fileSource: v.sourcePath,
                original: v.url,
                reworked: contextFix.linkUrl,
                applied: this.resolved.set(`${v.sourcePath}`, contextFix)
            })
        }
        return { pattern_results: results, stats: { success: results.filter(p => p.applied).length }, total: allViols.length }
    }

}

export default Category1Patterns
