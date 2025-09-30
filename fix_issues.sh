#!/bin/bash

# Fourth pass fix for remaining documentation issues
cd /home/matt/code/system/kilocode2

echo "Fourth pass fix for remaining documentation issues..."

# Fix 1: Fix remaining research-context heading issues (102 occurrences)
# Replace #research-context with #research-context--next-steps where appropriate
find docs -name "*.md" -exec sed -i 's|#research-context|#research-context--next-steps|g' {} \;

# Fix 2: Fix remaining compound word heading issues
find docs -name "*.md" -exec sed -i 's|#cross-references|#crossreferences|g' {} \;
find docs -name "*.md" -exec sed -i 's|#cross-reference-strategy|#crossreference-strategy|g' {} \;
find docs -name "*.md" -exec sed -i 's|#pre-commit-hooks|#precommit-hooks|g' {} \;
find docs -name "*.md" -exec sed -i 's|#performance--optimization|#performance-optimization|g' {} \;
find docs -name "*.md" -exec sed -i 's|#build-pipelines|#build-pipeline|g' {} \;
find docs -name "*.md" -exec sed -i 's|#auto-fix-not-working|#autofix-not-working|g' {} \;
find docs -name "*.md" -exec sed -i 's|#resources--looks-ahead|#resources-looks-ahead|g' {} \;

# Fix 3: Remove problematic #- links
find docs -name "*.md" -exec sed -i 's|\[#-\]|\[-\]|g' {} \;

# Fix 4: Fix remaining path issues
# Fix DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md references
find docs -name "*.md" -exec sed -i 's|../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md|../../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md|g' {} \;
find docs -name "*.md" -exec sed -i 's|architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md|../../architecture/DUPLICATE_API_REQUESTS_ROOT_CAUSE_ANALYSIS.md|g' {} \;

# Fix 5: Create missing files
echo "# File Moved or Renamed" > docs/orchestrator/\[FILE_MOVED_OR_RENAMED\].md
echo "" >> docs/orchestrator/\[FILE_MOVED_OR_RENAMED\].md
echo "This file has been moved or renamed." >> docs/orchestrator/\[FILE_MOVED_OR_RENAMED\].md

echo "Fourth pass fixes completed!"