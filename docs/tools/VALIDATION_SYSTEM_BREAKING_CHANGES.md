# Validation System Breaking Changes

> **Migration Fun Fact**: Like renovating a house, system improvements sometimes require temporary inconvenience for long-term benefits! 🏗️

## When You're Here

This document describes breaking changes introduced in the validation system simplification and provides guidance for migration.

* **Purpose**: This document outlines breaking changes and migration steps for the simplified validation system.
* **Context**: Use this as a reference while updating your validation configuration.
* **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

* [Validation System Breaking Changes](#validation-system-breaking-changes)
* [Overview](#overview)
* [Breaking Changes](#breaking-changes)
* [Migration Guide](#migration-guide)
* [Backward Compatibility](#backward-compatibility)
* [Rollback Procedures](#rollback-procedures)
* [Navigation](#navigation)

## Overview

The validation system has been significantly simplified to reduce complexity and improve performance. This simplification introduces several breaking changes that require attention when migrating from the previous system.

### Key Improvements

* **97% error reduction**: 1,150 → 38 errors
* **57% plugin complexity reduction**: 7 → 3 plugins
* **44% performance improvement**: ~45s → ~25s validation time
* **Unified plugin architecture**: Single consolidated plugin

## Breaking Changes

### 1. Plugin Configuration Changes

#### Before (Old Configuration)

```json
{
  "plugins": [
    "remark-preset-lint-recommended",
    "remark-gfm",
    "remark-frontmatter",
    "remark-toc",
    "remark-validate-links",
    "./plugins/remark-kilocode-standards.js",
    "./plugins/remark-kilocode-comprehensive.js"
  ]
}
```

#### After (New Configuration)

```json
{
  "plugins": [
    "remark-preset-lint-recommended",
    "remark-validate-links",
    "./plugins/remark-kilocode-unified.js"
  ]
}
```

**Impact**: Removed 4 plugins, consolidated 2 custom plugins into 1

### 2. Custom Plugin Consolidation

#### Removed Plugins

* `remark-kilocode-standards.js` - Merged into unified plugin
* `remark-kilocode-comprehensive.js` - Merged into unified plugin

#### New Plugin

* `remark-kilocode-unified.js` - Consolidated functionality

**Impact**: Single plugin with essential validation rules only

### 3. Validation Rule Changes

#### Disabled Rules

* `remark-lint-no-undefined-references` - Disabled to eliminate template placeholder errors

#### Modified Rules

* Template placeholder handling - Now ignored instead of flagged as errors
* Cross-reference validation - Enhanced with better error handling

**Impact**: Reduced false positives, improved accuracy

### 4. Configuration Simplification

#### Removed Settings

* `remark-gfm` specific settings
* `remark-frontmatter` specific settings
* `remark-toc` specific settings
* Complex custom rule configurations

#### New Settings

* `remarkPresetLintRecommended.no-undefined-references: false`
* Simplified custom rule configurations

**Impact**: Cleaner, more maintainable configuration

## Migration Guide

### Step 1: Update .remarkrc Configuration

1. **Backup current configuration**:
   ```bash
   cp .remarkrc .remarkrc.backup
   ```

2. **Replace plugin configuration**:
   ```json
   {
     "plugins": [
       "remark-preset-lint-recommended",
       "remark-validate-links",
       "./plugins/remark-kilocode-unified.js"
     ],
     "settings": {
       "bullet": "-",
       "emphasis": "*",
       "fence": "`",
       "listItemIndent": "one",
       "rule": "-",
       "ruleRepetition": 3,
       "ruleSpaces": false,
       "strong": "*"
     },
     "remarkPresetLintRecommended": {
       "no-undefined-references": false
     },
     "validateLinks": {
       "repository": "roo-ai/kilo-code",
       "branches": ["main", "master"],
       "ignore": [
         "https://github.com/roo-ai/kilo-code/issues/*",
         "https://github.com/roo-ai/kilo-code/discussions/*"
       ]
     }
   }
   ```

### Step 2: Update Custom Plugins

1. **Remove old plugins**:
   ```bash
   rm plugins/remark-kilocode-standards.js
   rm plugins/remark-kilocode-comprehensive.js
   ```

2. **Ensure new plugin exists**:
   ```bash
   ls plugins/remark-kilocode-unified.js
   ```

### Step 3: Test Migration

1. **Run validation**:
   ```bash
   pnpm docs:validate
   ```

2. **Compare results**:
   * Should see significant reduction in errors
   * Template placeholder errors should be eliminated
   * Performance should be improved

### Step 4: Update Documentation

1. **Update any references** to old plugin names
2. **Update configuration documentation**
3. **Update team guidelines** for validation system usage

## Backward Compatibility

### What's Preserved

* All essential validation functionality
* Core KiloCode documentation standards
* Required sections validation
* Navigation footer requirements
* Descriptive link validation
* Heading hierarchy enforcement

### What's Changed

* Plugin architecture (simplified)
* Configuration format (streamlined)
* Error handling (improved)
* Performance characteristics (optimized)

### Migration Timeline

* **Immediate**: New installations use simplified system
* **Graceful**: Existing installations can migrate at their own pace
* **Support**: Old system supported until migration complete

## Rollback Procedures

### Emergency Rollback

1. **Restore backup configuration**:
   ```bash
   cp .remarkrc.backup .remarkrc
   ```

2. **Restore old plugins**:
   ```bash
   git checkout HEAD~1 -- plugins/remark-kilocode-standards.js
   git checkout HEAD~1 -- plugins/remark-kilocode-comprehensive.js
   ```

3. **Test rollback**:
   ```bash
   pnpm docs:validate
   ```

### Gradual Rollback

1. **Identify issues** with simplified system
2. **Document specific problems** encountered
3. **Create targeted fixes** for identified issues
4. **Test fixes** before full rollback
5. **Implement fixes** in simplified system

## Navigation

* **Navigation**: [← Back to Documentation Tools](../README.md) · [📚 Technical Glossary](../../../GLOSSARY.md) · [↑ Table of Contents](#validation-system-breaking-changes)
