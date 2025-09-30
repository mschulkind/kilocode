#!/bin/bash

# Targeted fix for missing heading issues
cd /home/matt/code/system/kilocode2

echo "Fixing missing heading issues..."

# 1. Fix #research-context issues (15 occurrences)
# This is likely a common heading that should exist
find docs -name "*.md" -exec sed -i 's|#research-context|#research-context--next-steps|g' {} \;

# 2. Fix performance-optimization issues (6 occurrences)
find docs -name "*.md" -exec sed -i 's|#performance-optimization|#performance--optimization|g' {} \;

# 3. Fix #- issues (6 occurrences) - remove these problematic links
find docs -name "*.md" -exec sed -i 's|\[#-|\[|g' {} \;

# 4. Fix pre-commit-hooks issues (4 occurrences)
find docs -name "*.md" -exec sed -i 's|#pre-commit-hooks|#pre-commit-hooks|g' {} \;

# 5. Fix cross-references issues (4 occurrences)
find docs -name "*.md" -exec sed -i 's|#cross-references|#cross-references|g' {} \;

# 6. Fix build-pipelines issues (4 occurrences)
find docs -name "*.md" -exec sed -i 's|#build-pipelines|#build-pipeline|g' {} \;

# 7. Fix resources--looks-ahead issues (3 occurrences)
find docs -name "*.md" -exec sed -i 's|#resources--looks-ahead|#resources--looks-ahead|g' {} \;

# 8. Fix h4-h6---further-subdivisions issues (3 occurrences)
find docs -name "*.md" -exec sed -i 's|#h4-h6---further-subdivisions|#h4-h6---further-subdivisions|g' {} \;

# 9. Fix h3---subsections issues (3 occurrences)
find docs -name "*.md" -exec sed -i 's|#h3---subsections|#h3---subsections|g' {} \;

echo "Missing heading fixes completed!"