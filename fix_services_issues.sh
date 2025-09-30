#!/bin/bash

# Fix final issues in specific files
cd /home/matt/code/system/kilocode2

echo "Fixing final specific file issues..."

# Fix Diff_SYSTEM.md and GHOST_SERVICE.md: Replace #performance-optimization with #performance--optimization
sed -i 's|#performance-optimization|#performance--optimization|g' docs/services/Diff_SYSTEM.md
sed -i 's|#performance-optimization|#performance--optimization|g' docs/services/GHOST_SERVICE.md

echo "Final specific file fixes completed!"