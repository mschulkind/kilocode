# Comprehensive Documentation Fixers

This document provides detailed information about each fixer in the KiloCode documentation system, including implementation details, examples, and source code links.

> **Note**: All examples in this document are automatically generated from unit tests to ensure accuracy and consistency.

## Overview

The documentation fixer system uses a hybrid approach:

- **AST-based fixes** for link manipulation (precise, context-aware)
- **Regex-based fixes** for formatting issues (reliable, fast)

## Fixer Modules

### 1. List Indentation Fixes

**Purpose**: Ensures list formatting complies with remark-lint standards.

**Implementation**:

- **File**: [`src/docs-fixer.js`](./src/docs-fixer.js#L293) - `fixListIndentation()`
- **Type**: Regex-based (formatting issue)
- **AST Function**: [`src/docs-fixer.js`](./src/docs-fixer.js#L427) - `fixListIndentationAST()`

**What it fixes**:

- Removes leading spaces before list item bullets (remark-lint requirement)
- Converts `*` and `+` bullets to `-` bullets (unified style)
- Ensures zero spaces before bullets for flat lists

**Examples**:

<!-- AUTO-GENERATED: This section is generated from unit tests -->

#### Example 1: List Bullet Indentation

**Before**:
```markdown
# Test File

  - Item 1
  - Item 2
  - Item 3
```

**After**:
```markdown
# Test File
- Item 1
- Item 2
- Item 3
```

**Test Source**: `test/docs-fixer.test.js` - "List bullet indentation fixes"

**Fixes Applied**: 1

---

#### Example 2: List Item Indentation

**Before**:
```markdown
# Test File

-Item 1
  -  Sub item 1
    -  Sub item 2
```

**After**:
```markdown
# Test File

- Item 1
- Sub item 1
- Sub item 2
```

**Test Source**: `test/docs-fixer.test.js` - "List item indentation fixes"

**Fixes Applied**: 2

---

#### Example 1: Navigation Footer

**Before**:
```markdown
# Test File

This is a test file without navigation.
```

**After**:
```markdown
# Test File

This is a test file without navigation.

## Navigation

- [← Architecture Overview](README.md)
- [← Repository Structure](repository/README.md)
- [← Race Condition Analysis](race-condition/README.md)
- [← State Machines](state-machines/README.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Navigation footer addition"

**Fixes Applied**: 1

---

#### Example 2: Navigation Footer Detection

**Before**:
```markdown
# Test File

Content here.
```

**After**:
```markdown
# Test File

Content here.

## Navigation
- [Link](link.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Navigation footer detection"

**Fixes Applied**: 0

---

#### Example 3: Navigation Template Selection

**Before**:
```markdown
docs/architecture/test.md
```

**After**:
```markdown

## Navigation

- [← Architecture Overview](README.md)
- [← Repository Structure](repository/README.md)
- [← Race Condition Analysis](race-condition/README.md)
- [← State Machines](state-machines/README.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)

```

**Test Source**: `test/docs-fixer.test.js` - "Navigation template selection"

**Fixes Applied**: 0

---

#### Example 1: Path Fixes

**Before**:
```markdown
# Test File

- [GLOSSARY](../../GLOSSARY.md)
- [Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md)
- [README](../README.md)
```

**After**:
```markdown
# Test File

- [GLOSSARY](../GLOSSARY.md)
- [Development Guide](repository/DEVELOPMENT_GUIDE.md)
- [README](../../README.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Path fixes for architecture files"

**Fixes Applied**: 3

---

#### Example 1: Ordered List Marker Style

**Before**:
```markdown
# Test File

1) First item
2) Second item
3) Third item
```

**After**:
```markdown
# Test File
1. First item
2. Second item
3. Third item
```

**Test Source**: `test/docs-fixer.test.js` - "Ordered list marker style fixes"

**Fixes Applied**: 2

---


## Navigation

- [← Architecture Overview](README.md)
- [← Repository Structure](repository/README.md)
- [← Race Condition Analysis](race-condition/README.md)
- [← State Machines](state-machines/README.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Navigation footer addition"

**Fixes Applied**: 1

---

#### Example 2: Navigation Footer Detection

**Before**:
```markdown
# Test File

Content here.
```

**After**:
```markdown
# Test File

Content here.

## Navigation
- [Link](link.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Navigation footer detection"

**Fixes Applied**: 0

---

#### Example 3: Navigation Template Selection

**Before**:
```markdown
docs/architecture/test.md
```

**After**:
```markdown

## Navigation

- [← Architecture Overview](README.md)
- [← Repository Structure](repository/README.md)
- [← Race Condition Analysis](race-condition/README.md)
- [← State Machines](state-machines/README.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)

```

**Test Source**: `test/docs-fixer.test.js` - "Navigation template selection"

**Fixes Applied**: 0

---

#### Example 1: Path Fixes

**Before**:
```markdown
# Test File

- [GLOSSARY](../../GLOSSARY.md)
- [Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md)
- [README](../README.md)
```

**After**:
```markdown
# Test File

- [GLOSSARY](../GLOSSARY.md)
- [Development Guide](repository/DEVELOPMENT_GUIDE.md)
- [README](../../README.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Path fixes for architecture files"

**Fixes Applied**: 3

---

#### Example 1: Ordered List Marker Style

**Before**:
```markdown
# Test File

1) First item
2) Second item
3) Third item
```

**After**:
```markdown
# Test File
1. First item
2. Second item
3. Third item
```

**Test Source**: `test/docs-fixer.test.js` - "Ordered list marker style fixes"

**Fixes Applied**: 2

---


## Navigation

- [← Back to Architecture Overview](../README.md)
- [→ Repository Structure](repository/README.md)
- [↑ Up to System Overview](../../README.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Navigation footer addition"

#### Example 2: Navigation Footer Detection

**Before**:

```markdown
# Test File

Content here.
```

**After**:

```markdown
# Test File

Content here.

## Navigation

- [Link](link.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Navigation footer detection"

#### Example 3: Navigation Template Selection

**Before**:

```text
docs/architecture/test.md
```

**After**:

```markdown
## Navigation

- [← Back to Architecture Overview](../README.md)
- [→ Repository Structure](repository/README.md)
- [↑ Up to System Overview](../../README.md)
```

**Test Source**: `test/docs-fixer.test.js` - "Navigation template selection"

---

## Test Coverage

All fixers have comprehensive unit tests in [`test/docs-fixer.test.js`](./test/docs-fixer.test.js) using an ultra-simplified test structure:

### Test Architecture

The test suite is organized into two main categories:

#### **Fixer Tests (Tests 1-7) - Generate Examples**

- **Tests 1, 3, 5, 6**: Use `validateFixerResolvesLintErrors` helper for lint-integrated testing
- **Tests 4, 7**: Use manual example storage for utility/validation tests
- **Test 2**: Disabled (no working linter available)
- **All fixer tests**: Generate before/after examples for documentation

#### **Utility Tests (Tests 8-12) - Validation Only**

- Test configuration, error handling, and system functionality
- Don't generate examples (not transformation-focused)
- Ensure system robustness and proper behavior

#### **Key Features**

- **Lint Integration**: Fixer tests validate that "before" content has linting errors and "after" content is clean
- **Single Source of Truth**: Test data drives both validation and documentation examples
- **Custom Assertions**: Specialized assertion helpers in [`test/test-helpers.js`](./test/test-helpers.js)

### Test Structure Example

```javascript
// Ultra-simplified test pattern
await validateFixerResolvesLintErrors({
	before: `...`, // Content with linting errors
	linter: ["list-item-bullet-indent"], // Expected lint rules
	fixer: fixListIndentation, // Fixer function to test
	testName: "List indentation fixes",
	description: "Fix list indentation issues",
	testExamples: TEST_EXAMPLES, // Auto-populate docs
	exampleKey: "listIndentation",
})
```

### Test Coverage

#### **Fixer Tests (Generate Examples)**

- ✅ **Test 1: Path fixes for architecture files** - Tests path correction logic
- ✅ **Test 3: Navigation footer addition** - Tests footer generation
- ✅ **Test 4: Navigation footer detection** - Tests existing footer detection
- ✅ **Test 5: List bullet indentation fixes** - Tests bullet indentation corrections
- ✅ **Test 6: List item indentation fixes** - Tests spacing after bullets
- ✅ **Test 7: Navigation template selection** - Tests context-aware templates
- ❌ **Test 2: Link text improvements** - Disabled (no working linter)

#### **Utility Tests (Validation Only)**

- ✅ **Test 8: Dry run mode** - Tests preview functionality
- ✅ **Test 9: File processing error handling** - Tests error scenarios
- ✅ **Test 10: Configuration validation** - Tests config integrity
- ✅ **Test 11: PATH_FIXES configuration** - Tests path fix rules
- ✅ **Test 12: LINK_TEXT_IMPROVEMENTS configuration** - Tests link text rules

**Total**: 12 tests (6 fixer tests generating examples, 6 utility tests)

## Source Code Structure

```
scripts/docs-fixes/
├── src/
│   └── docs-fixer.js          # Main implementation
├── test/
│   ├── docs-fixer.test.js     # Comprehensive test suite
│   ├── test-helpers.js        # Custom assertion helpers
│   ├── lint-validator.js      # Lint integration utilities
│   └── run-tests.js           # Test runner
├── plugins/
│   └── remark-lint-kilocode-navigation.js  # Custom lint plugin
├── docs/
│   ├── generate-docs.js       # Documentation generator
│   ├── generate-examples.js   # Example generator
│   └── generated/             # Auto-generated docs
├── README.md                  # Quick start guide
└── COMPREHENSIVE_FIXERS.md    # This detailed documentation
```

## Regenerating Documentation

To regenerate this documentation with the latest test examples:

```bash
cd scripts/docs-fixes
npm run docs:generate
```

This ensures all examples stay in sync with the actual test data.

## Auto-Generated Examples System

All examples in this document are automatically generated from unit tests to ensure accuracy and consistency. For detailed information about how this system works, see [AUTO_GENERATED_EXAMPLES.md](./AUTO_GENERATED_EXAMPLES.md).

### Key Benefits:

- ✅ **Always accurate**: Examples are generated from working tests
- ✅ **Auto-sync**: Documentation stays in sync with functionality
- ✅ **No drift**: No manual maintenance of examples needed
- ✅ **Single source of truth**: Tests drive documentation

---

## Navigation

- [← Documentation Fixer README](./README.md)
- [← Auto-Generated Examples](./AUTO_GENERATED_EXAMPLES.md)
- [← Main Documentation](../../README.md)
- [← Project Root](../../../README.md)

---

_Last updated: 2025-09-24T17:18:06.102Z (Auto-generated from unit tests)_
