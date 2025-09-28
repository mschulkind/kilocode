# Validation System Migration Guide

> **Migration Fun Fact**: Like moving to a new home, good migration planning makes the transition smooth and stress-free! 🏠

## When You're Here

This document provides step-by-step guidance for migrating from the old validation system to the simplified validation system.

- **Purpose**: This document guides you through the migration process from the old to the new validation system.
- **Context**: Use this as a reference while migrating your validation configuration.
- **Navigation**: Use the table of contents below to jump to specific sections.

## Table of Contents

- [Validation System Migration Guide](#validation-system-migration-guide)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Step-by-Step Migration](#step-by-step-migration)
- [Post-Migration Verification](#post-migration-verification)
- [Troubleshooting](#troubleshooting)
- [Navigation](#navigation)

## Pre-Migration Checklist

### Before You Start
- [ ] **Backup current configuration** - Create backup of `.remarkrc`
- [ ] **Document current issues** - Note any existing validation problems
- [ ] **Review breaking changes** - Read [Breaking Changes](./VALIDATION_SYSTEM_BREAKING_CHANGES.md)
- [ ] **Plan migration window** - Schedule during low-activity period
- [ ] **Notify team members** - Inform team about migration timeline

### System Requirements
- [ ] **Node.js version** - Ensure compatible Node.js version
- [ ] **Dependencies** - Verify all required packages are installed
- [ ] **File permissions** - Ensure write access to configuration files
- [ ] **Git status** - Commit or stash any uncommitted changes

## Step-by-Step Migration

### Step 1: Create Backup

```bash
# Create backup of current configuration
cp .remarkrc .remarkrc.backup

# Create backup of current plugins
mkdir -p backup/plugins
cp plugins/remark-kilocode-standards.js backup/plugins/ 2>/dev/null || true
cp plugins/remark-kilocode-comprehensive.js backup/plugins/ 2>/dev/null || true

# Verify backup creation
ls -la .remarkrc.backup
ls -la backup/plugins/
```

### Step 2: Update .remarkrc Configuration

Replace your current `.remarkrc` with the simplified configuration:

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

### Step 3: Verify New Plugin Exists

```bash
# Check if unified plugin exists
ls -la plugins/remark-kilocode-unified.js

# If missing, ensure it's in your repository
git status plugins/remark-kilocode-unified.js
```

### Step 4: Install Dependencies

```bash
# Ensure all required dependencies are installed
npm install

# Or if using pnpm
pnpm install
```

### Step 5: Test Migration

```bash
# Run validation with new configuration
pnpm docs:validate

# Capture output for comparison
pnpm docs:validate > migration-test-output.log 2>&1
```

### Step 6: Compare Results

```bash
# Count issues before and after
echo "=== MIGRATION COMPARISON ==="
echo "Before migration (from backup):"
# Run with backup configuration to compare
cp .remarkrc.backup .remarkrc
pnpm docs:validate > before-migration.log 2>&1
tail -5 before-migration.log

echo "After migration:"
cp .remarkrc.new .remarkrc  # Assuming you saved new config as .remarkrc.new
pnpm docs:validate > after-migration.log 2>&1
tail -5 after-migration.log
```

### Step 7: Remove Old Plugins (Optional)

```bash
# Only remove old plugins after successful migration
rm plugins/remark-kilocode-standards.js
rm plugins/remark-kilocode-comprehensive.js

# Verify removal
ls -la plugins/
```

## Post-Migration Verification

### Validation Checks
- [ ] **Run full validation** - `pnpm docs:validate`
- [ ] **Check error count** - Should see significant reduction
- [ ] **Verify warnings** - Template placeholder warnings should be eliminated
- [ ] **Test performance** - Validation should be faster

### Functionality Checks
- [ ] **Required sections** - Still validated correctly
- [ ] **Navigation links** - Still detected and validated
- [ ] **Cross-references** - Still validated with improved accuracy
- [ ] **Heading hierarchy** - Still enforced

### Performance Checks
- [ ] **Validation time** - Should be reduced by ~44%
- [ ] **Memory usage** - Should be optimized
- [ ] **Error accuracy** - Should have fewer false positives

## Troubleshooting

### Common Issues

#### Issue: "Plugin not found" errors
```bash
# Solution: Verify plugin path
ls -la plugins/remark-kilocode-unified.js

# If missing, restore from git
git checkout HEAD -- plugins/remark-kilocode-unified.js
```

#### Issue: Configuration syntax errors
```bash
# Solution: Validate JSON syntax
cat .remarkrc | jq .

# If jq not available, use online JSON validator
```

#### Issue: Increased validation errors
```bash
# Solution: Check if old plugins are still referenced
grep -r "remark-kilocode-standards" .
grep -r "remark-kilocode-comprehensive" .
```

#### Issue: Performance regression
```bash
# Solution: Check plugin loading
node -e "console.log(require('./.remarkrc'))"
```

### Rollback Procedures

If migration fails:

```bash
# Restore backup configuration
cp .remarkrc.backup .remarkrc

# Restore old plugins
cp backup/plugins/remark-kilocode-standards.js plugins/ 2>/dev/null || true
cp backup/plugins/remark-kilocode-comprehensive.js plugins/ 2>/dev/null || true

# Test rollback
pnpm docs:validate
```

### Getting Help

1. **Check logs** - Review validation output for specific errors
2. **Compare configurations** - Use backup to identify differences
3. **Review documentation** - Check [Breaking Changes](./VALIDATION_SYSTEM_BREAKING_CHANGES.md)
4. **Test incrementally** - Migrate one component at a time

## Migration Timeline

### Recommended Timeline
- **Week 1**: Preparation and backup
- **Week 2**: Configuration migration
- **Week 3**: Testing and validation
- **Week 4**: Full deployment and cleanup

### Rollback Window
- **Keep backup** for at least 4 weeks after successful migration
- **Monitor performance** for 2 weeks after migration
- **Document issues** encountered during migration

## Success Metrics

### Migration Success Indicators
- [ ] **Error reduction** - 90%+ reduction in validation errors
- [ ] **Performance improvement** - 40%+ faster validation
- [ ] **False positive elimination** - Template placeholder errors eliminated
- [ ] **Functionality preservation** - All essential validation still works

### Post-Migration Monitoring
- [ ] **Daily validation** - Run validation daily for first week
- [ ] **Performance tracking** - Monitor validation time
- [ ] **Error tracking** - Watch for new error patterns
- [ ] **Team feedback** - Gather feedback from team members

## Navigation

- **Navigation**: [← Back to Documentation Tools](../README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#validation-system-migration-guide)
