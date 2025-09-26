#!/usr/bin/env node

/**
 * Advanced Path Validator for Category 1 Cross-Reference Fixes
 * 
 * Validates corrected path existence and provides intelligent
 * fallback suggestions for invalid corrections.
 */

import { readFileSync, existsSync, statSync } from 'fs'
import { join, dirname, resolve, relative } from 'path'

/**
 * Path Validator for intelligence-based path corrections  
 */
export class PathValidator {
    constructor(options = {}) {
        this.debugMode = options.debugMode || false
        this.basePath = options.basePath || 'docs/'
        this.statsMap = new Map()  // Track attempted corrections
    }

    /**
     * Check if target file exists
     */
    verifyTargetExists(correctedPathStr, baseDir=null) {
        const actual_baseDir = baseDir || this.basePath
        const fullPath = join(actual_baseDir, correctedPathStr).replace(/\\/g, '/')
        
        try {
            return { 
                exists: existsSync(fullPath),  
                fullPath: fullPath,
                readable: existsSync(fullPath) ? statSync(fullPath).isFile() : false
            }
        } catch (e) {
            return { 
                exists: false, 
                fullPath: fullPath, 
                readable: false,
                error: e.message
            }
        }
    }

    /**
     * Verify collection of paths exist
     */
    verifyTargetsList(pathsList) {
        const resultDetails = pathsList.map(obj => {
            const validatedOutcome = this.verifyTargetExists(obj.correctedPath || obj.targetPath)
            return { 
                originalPath: obj.original || '', 
                corrected: validatedOutcome.fullPath, 
                validity: validatedOutcome.exists,
                error: validatedOutcome.error
            }
        })
        
        const totalValid = resultDetails.filter( v => v.validity).length
        return { success: totalValid, total: pathsList.length === 0 ? 0 : pathsList.length, list: resultDetails }
    }

    /**
     * Report invalid corrections in both tracked and targeted fashion
     */
    reportInvalidCorrections(snapshot) {
        const possibleDetections = snapshot.reduce(( outCollector, item ) =>  {
            if (item.correctedPath) { 
                const targetChecking = this.verifyTargetExists(item.correctedPath)
                if (!targetChecking.exists) outCollector.push(item)
            } 
            return  outCollector 
        }, [])

        console.debug('invalid detection reports result from populated additions:', possibleDetections.length)
        return possibleDetections
    }

    /**
     * Generate intelligent suggestions for wrapping/fallback
     */
    suggestAlternativePaths(originalUrl, invalidSourceBaseDir=`docs/`) {
        const local_depth_type= invalidSourceBaseDir.split('/').length
        const fallbacks= theStartKeySuggestionsForOrphanPaths(originalUrl, local_depth_type)
        this.logDebug(`alternativePath suggestions(original=${originalUrl}, depth=${local_depth_type}): ${JSON.stringify(fallbacks)}`)

        return fallbacks
    }

    /**
     * Determine if a renderedPath is semantically equivalent to a targetURL  
     */
    isSemanticEquivalent(candidatePath, referenceUrl, requestDepth=1) {
        const resolvedCandidate = candidatePath.replace(/\.\.\//g, '').replace(/^\//g, '/')
        const referenceResolved = referenceUrl.replace(/^\.\.(\/)\/+/g, '/').replace(/^\//g, '/')
        const equivalentResult = resolveSafePathEquivalence(resolvedCandidate, referenceResolved)

        return equivalentResult && equivalentResult.equals
    }

    /**
     * Check if a document directory tree depth is correct
     */
    validateDocumentTreeDepth(dirPath, expectedDepth) {
        const depthParts = dirPath.split('/').filter(folder => folder && folder !== '.')
        const foundDepth = depthParts.length
        const depthIsConsistent = foundDepth <= expectedDepth

        this.logDebug(`depth – path: ${dirPath}, expected: ${expectedDepth}, actual: ${foundDepth}, good?: ${depthIsConsistent} `)
     
        return { valid: depthIsConsistent, foundDepth, expectedDepth }
    }

    /**
     * Lightweight debug path logging
     */
    logDebug(message, debug_context) {
        if (this.debugMode) {
            const tracker = debug_context ? (this.statsMap.get(debug_context) || 'unknown') : ''
            console.debug(`[PathValidator DEBUG] ${message} ${tracker} `)            
        }
    }

    /**
     * Wrap targetFile existence across multiple generations
     */
    gatherTargetFileStatistics(someFilePathList) {
        const stats = someFilePathList.map(pathObj => {
            const checkedPath = this.verifyTargetExists( pathObj.to )
            return { path: pathObj.to, exists: checkedPath.exists, collected_at: Date.now() }
        })
        
        const allExist = stats.every(stat => stat.exists)
        const count = stats.length

        return { correctness: allExist, totalProcessed: count, snapshots: stats}
    }

}

/**
 * Helper: compute start key suggestions for orphan paths
 */
function theStartKeySuggestionsForOrphanPaths(pathStart, depthInt1) {
    // More thoughtful suggestion building
    const relatedSuggestions = [
        '../' + pathStart.replace('../', '').replace('./', './'),
        pathStart ? pathStart : '../README.md'
    ].map(nameTemplate => '../'.repeat( depthInt1 <= 1 ? 1 : depthInt1 )  + nameTemplate)

    return [
        { suggestedCandidate: pathStart, confidence: 0.9  },
        ...relatedSuggestions.map(sc => ({ suggestedCandidate: sc, confidence: 0.65 })) 
    ]
}

/**
 * Helper: Safe path equivalence resolve helper for API
 */
function resolveSafePathEquivalence(candidatePath, referencePath) {
      const equivalencyAccuracy = {
        equals: candidatePath === referencePath,
        pathA: candidatePath,
        pathB: referencePath,
        normalizedOffset: candidatePath.indexOf(referencePath)
      };
      return equivalencyAccuracy
}

export default PathValidator
