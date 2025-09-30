#!/bin/bash

echo "🔧 Fixing Research Context Heading Issues..."

# Step 1: Fix TOC links - basic "Research Context" should link to #research-context
echo "Step 1: Fixing TOC links for basic 'Research Context' headings..."
find docs -name "*.md" -exec sed -i 's|\[Research Context\](#research-context--next-steps)|[Research Context](#research-context)|g' {} \;

# Step 2: Fix malformed references (extra dash)
echo "Step 2: Fixing malformed heading references..."
find docs -name "*.md" -exec sed -i 's|#-research-context--next-steps|#research-context--next-steps|g' {} \;

# Step 3: Fix any other variations we might have missed
echo "Step 3: Fixing other variations..."
find docs -name "*.md" -exec sed -i 's|#research-context--next-steps|#research-context--next-steps|g' {} \;

echo "✅ Heading fixes applied!"
echo "📊 Checking results..."

# Check the results
echo "Research context warnings before fix:"
grep -r "research-context--next-steps" docs/ | wc -l

echo "Running validation to check warning count..."
pnpm docs:validate 2>&1 | grep "⚠" | tail -1
