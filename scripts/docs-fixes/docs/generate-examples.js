#!/usr/bin/env node

/**
 * Documentation Example Generator
 * 
 * @deprecated This manual generator has been replaced with an automatic version.
 * Use generate-examples-auto.js instead.
 */

import { generateDocumentationExamples } from './generate-examples-auto.js'

// Redirect to the automatic generator
generateDocumentationExamples().catch(console.error)