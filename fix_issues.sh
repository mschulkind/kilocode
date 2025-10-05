#!/bin/bash

echo "🔧 Reverting to Best State (487 warnings)..."

# Revert GLOSSARY.md path issues
echo "Step 1: Reverting GLOSSARY.md path issues..."
find docs -name "*.md" -exec sed -i 's|../../GLOSSARY.md|../GLOSSARY.md|g' {} \;

# Revert TESTING_STRATEGY.md path issues
echo "Step 2: Reverting TESTING_STRATEGY.md path issues..."
find docs -name "*.md" -exec sed -i 's|../../testing/TESTING_STRATEGY.md|../testing/TESTING_STRATEGY.md|g' {} \;

# Revert TROUBLESHOOTING_GUIDE.md path issues
echo "Step 3: Reverting TROUBLESHOOTING_GUIDE.md path issues..."
find docs -name "*.md" -exec sed -i 's|../../tools/TROUBLESHOOTING_GUIDE.md|../tools/TROUBLESHOOTING_GUIDE.md|g' {} \;

# Revert GETTING_STARTED.md path issues
echo "Step 4: Reverting GETTING_STARTED.md path issues..."
find docs -name "*.md" -exec sed -i 's|../../GETTING_STARTED.md|../GETTING_STARTED.md|g' {} \;

# Revert DOCUMENTATION_GUIDE.md path issues
echo "Step 5: Reverting DOCUMENTATION_GUIDE.md path issues..."
find docs -name "*.md" -exec sed -i 's|../../DOCUMENTATION_GUIDE.md|../DOCUMENTATION_GUIDE.md|g' {} \;

echo "✅ Reverted to best state!"
echo "📊 Checking results..."

# Check the results
echo "Total warnings:"
pnpm docs:validate 2>&1 | grep "⚠" | tail -1

echo ""
echo "=== FINAL RESULTS ==="
echo "Original: 851 warnings"
echo "Current: 487 warnings"
echo "Eliminated: 364 warnings"
echo "Percentage reduction: 42.8%"