#!/bin/bash

echo "🔧 Phase 2: Fixing Remaining Research Context Issues..."

# Step 1: Fix the malformed -research-context--next-steps references
echo "Step 1: Fixing malformed -research-context--next-steps references..."
find docs -name "*.md" -exec sed -i 's|#-research-context--next-steps|#research-context--next-steps|g' {} \;

# Step 2: Fix any remaining research-context references that should be research-context--next-steps
echo "Step 2: Fixing research-context references for emoji headings..."
# This is tricky - we need to be more specific about which files have emoji headings
find docs -name "*.md" -exec grep -l "## 🔍 Research Context & Next Steps" {} \; | while read file; do
    # In files with emoji headings, fix basic research-context links to point to research-context--next-steps
    sed -i 's|\[Research Context\](#research-context)|[Research Context](#research-context--next-steps)|g' "$file"
done

# Step 3: Fix any remaining research-context references that should be research-context
echo "Step 3: Fixing research-context references for basic headings..."
# In files with basic headings, ensure they point to research-context
find docs -name "*.md" -exec grep -l "^## Research Context$" {} \; | while read file; do
    # In files with basic headings, fix research-context--next-steps links to point to research-context
    sed -i 's|\[Research Context\](#research-context--next-steps)|[Research Context](#research-context)|g' "$file"
done

# Step 4: Fix duplicate TOC entries
echo "Step 4: Fixing duplicate TOC entries..."
find docs -name "*.md" -exec sed -i '/^.*\[🔍 Research Context & Next Steps\](#research-context--next-steps).*$/N;s/.*\[🔍 Research Context & Next Steps\](#research-context--next-steps).*\n.*\[🔍 Research Context & Next Steps\](#research-context--next-steps).*/&/' {} \;

# Step 5: Fix any remaining malformed references
echo "Step 5: Fixing any remaining malformed references..."
find docs -name "*.md" -exec sed -i 's|#-research-context--next-steps|#research-context--next-steps|g' {} \;

echo "✅ Phase 2 fixes applied!"
echo "📊 Checking results..."

# Check the results
echo "Research context warnings after fix:"
pnpm docs:validate 2>&1 | grep "research-context" | wc -l

echo "Total warnings:"
pnpm docs:validate 2>&1 | grep "⚠" | tail -1

