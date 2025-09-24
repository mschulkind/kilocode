# Development Rules for Documentation System

## 🚫 **NEVER DO THESE THINGS**

### ❌ **Never pipe commands that expect interactive output**

```bash
# ❌ NEVER DO THIS - IT ALWAYS BLOCKS/HANGS
pnpm docs:validate | head
pnpm docs:validate | less
pnpm docs:validate | more
pnpm docs:validate | cat
pnpm docs:validate | anything-that-buffers

# ❌ Even with something in between - STILL BLOCKS
pnpm docs:validate | grep "pattern" | head
pnpm docs:validate 2>&1 | grep "pattern" | less

# ✅ Instead, use these alternatives:
pnpm docs:validate 2>&1 | grep "specific-pattern"
pnpm docs:validate 2>&1 | tail -10
pnpm docs:validate 2>&1 | wc -l
pnpm docs:validate 2>&1 | grep "pattern" | wc -l
```

**Why:** Commands like `head`, `less`, `more`, `cat` and other pagers/buffers interfere with the output stream handling of `pnpm docs:validate`, causing it to hang or block.

### ❌ **Never assume list indentation without checking**

- Always check the actual remark-lint rule documentation
- `remark-lint-list-item-bullet-indent` prevents spaces BEFORE bullets
- `remark-lint-list-item-indent` controls spacing WITHIN list items
- These are different rules with different purposes

### ❌ **Never bypass pre-commit hooks without understanding why**

```bash
# ❌ Don't just use --no-verify without understanding
git commit --no-verify

# ✅ Understand why the hook is failing first
# Then decide if bypassing is appropriate
```

## ✅ **ALWAYS DO THESE THINGS**

### ✅ **Always check actual file content when investigating warnings**

```bash
# Check specific lines mentioned in warnings
sed -n '89p' docs/some-file.md
sed -n '90p' docs/some-file.md
```

### ✅ **Always test configuration changes incrementally**

1. Make small changes
2. Test immediately
3. Verify the change worked
4. Make next change

### ✅ **Always document the reasoning behind configuration choices**

- Why did we choose this rule?
- What problem does it solve?
- What are the trade-offs?

## 🔧 **Debugging Commands That Work**

```bash
# Count warnings by type
pnpm docs:validate 2>&1 | grep "list-item-bullet-indent" | wc -l

# See last few warnings
pnpm docs:validate 2>&1 | tail -10

# Check specific warning types
pnpm docs:validate 2>&1 | grep "missing-file"

# Preview changes without applying
pnpm docs:check

# Apply fixes and validate
pnpm docs:fix
```

## 📚 **Understanding the Rules**

### List Indentation Rules

- **`remark-lint-list-item-bullet-indent`**: Prevents spaces before bullets (e.g., ` *` → `*`)
- **`remark-lint-list-item-indent`**: Controls spacing after bullets and within items (configured to `'one'`)

### Nested Lists

Proper nested list format:

```markdown
- Item 1
    - Sub item 1
    - Sub item 2
- Item 2
```

NOT:

```markdown
- Item 1

* Sub item 1 ❌ Space before bullet
* Sub item 2 ❌ Space before bullet

- Item 2
```

## 🎯 **Remember**

- The documentation system is complex
- Small changes can have big effects
- Always test and verify
- When in doubt, check the actual rule documentation
