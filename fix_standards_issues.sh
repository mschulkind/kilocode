#!/bin/bash

# Fix all issues in docs/standards/ directory
cd /home/matt/code/system/kilocode2

echo "Fixing docs/standards/ directory issues..."

# Fix 1: Replace #research-context--next-steps with #research-context
find docs/standards -name "*.md" -exec sed -i 's|#research-context--next-steps|#research-context|g' {} \;

# Fix 2: Replace ../../../../GLOSSARY.md with ../../GLOSSARY.md
find docs/standards -name "*.md" -exec sed -i 's|../../../../GLOSSARY.md|../../GLOSSARY.md|g' {} \;

# Fix 3: Replace ../../../../DOCUMENTATION_GUIDE.md with ../DOCUMENTATION_GUIDE.md
find docs/standards -name "*.md" -exec sed -i 's|../../../../DOCUMENTATION_GUIDE.md|../DOCUMENTATION_GUIDE.md|g' {} \;

# Fix 4: Fix other common path issues
# Replace ../../testing/TESTING_STRATEGY.md with ../../testing/TESTING_STRATEGY.md (already correct)
# Replace ../../tools/TROUBLESHOOTING_GUIDE.md with ../../tools/TROUBLESHOOTING_GUIDE.md (already correct)

echo "Standards directory fixes completed!"
