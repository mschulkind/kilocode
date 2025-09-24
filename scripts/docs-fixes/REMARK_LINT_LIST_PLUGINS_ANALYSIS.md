# Remark-Lint List Plugins Analysis

This document provides a comprehensive analysis of the four main list-related remark-lint plugins and how they work together to enforce consistent list formatting in Markdown documents.

**Note:** This document uses the `␠` glyph to represent spaces for better readability in examples. This makes it explicit where spaces should and shouldn't be placed in Markdown list formatting.

## The Four Main List Plugins

### `remark-lint-list-item-bullet-indent`

**Purpose:** Prevents any indentation before list item bullets.

**Configuration:** No options (always enforces zero spaces before bullets)

**Current Status:** Installed in `remark-preset-lint-recommended`

**Examples:**

```markdown
❌ Wrong (causes warnings):
␠␠- Item 1
␠␠- Sub item

✅ Correct:

- Item 1
- Sub item
```

**Key Point:** This rule ensures bullets start at the beginning of the line, preventing alignment issues. The `␠␠` represents spaces that would trigger warnings.

---

### `remark-lint-list-item-indent`

**Purpose:** Controls spacing after bullets and indentation within list items.

**Configuration:** `'one'` (configured in our preset)

**Current Status:** Installed in `remark-preset-lint-recommended`

**Options:**

- `'one'` - Single space after bullet (default, what we use)
- `'mixed'` - One space for tight lists, tab for loose lists
- `'tab'` - Align to next tab stop

**Examples:**

```markdown
✅ Correct with 'one' setting:

- Item 1
  ␠␠␠␠- Sub item (properly indented within list item)
- Item 2

❌ Wrong spacing:
-Item 1 (no space after bullet)
-␠␠Item 2 (too many spaces after bullet)
```

**Key Point:** This rule handles spacing after bullets and supports proper nested list indentation. The `␠␠␠␠` represents proper indentation within list items.

---

### `remark-lint-ordered-list-marker-style`

**Purpose:** Enforces consistent style for ordered list markers.

**Configuration:** `'.'` (configured in our preset)

**Current Status:** Installed in `remark-preset-lint-recommended`

**Examples:**

```markdown
✅ Correct with '.' setting:
1.␠Item 1
2.␠Item 2

❌ Wrong:
1)␠Item 1
2)␠Item 2
```

**Key Point:** This rule ensures consistent numbering style in ordered lists. The `␠` represents the required space after the marker.

---

### `remark-lint-list-item-style`

**Purpose:** Enforces capitalization and punctuation style in list items.

**Configuration:** Various options available

**Current Status:** Not installed (community-maintained plugin)

**Examples:**

```markdown
✅ With consistent style:

- First item.
- Second item.
- Third item.

❌ Inconsistent style:

- First item
- Second item.
- Third item!
```

**Key Point:** This rule ensures consistent formatting of list item text content, but is not currently used in our setup.

## Key Insights

### Nested Lists Support

- **`remark-lint-list-item-indent`** with `'one'` setting DOES support nested lists
- **`remark-lint-list-item-bullet-indent`** prevents spaces before bullets (this is the conflict)

### The Real Issue

The problem isn't that nested lists aren't supported - it's that:

1. Our docs have spaces before bullets (`␠␠* Item` instead of `* Item`)
2. `remark-lint-list-item-bullet-indent` correctly flags this as wrong
3. We need to fix the bullet positioning, not the nested list structure

### Proper Nested List Format

```markdown
✅ Correct nested lists:

- Item 1
  ␠␠␠␠- Sub item 1
  ␠␠␠␠- Sub item 2
- Item 2
```

The indentation happens WITHIN the list item content, not before the bullet. The `␠␠␠␠` represents proper indentation for nested items.

### Current Configuration Analysis

Our `.remarkrc` has:

```json
{
	"settings": {
		"listItemIndent": "one"
	}
}
```

This is correct and supports nested lists properly. The issue is our docs have malformed list items with spaces before bullets.

## Conclusion

All four list plugins work together correctly:

1. **Bullet indent** - Ensures bullets start at line beginning
2. **Item indent** - Controls spacing within list items (supports nesting)
3. **Ordered style** - Ensures consistent numbered list format
4. **Item style** - Could enforce text formatting (not currently used)

The system is working as designed. We just need to fix the malformed list items in our docs by removing spaces before bullets while preserving proper nested list indentation.

---

## Navigation

- [← Documentation Fixer README](./README.md)
- [← Comprehensive Fixers Documentation](./COMPREHENSIVE_FIXERS.md)
- [← Auto-Generated Examples](./AUTO_GENERATED_EXAMPLES.md)
- [← Main Documentation](../../README.md)
- [← Project Root](../../README.md)

---

_Last updated: 2025-01-24T17:45:00.000Z_
