#!/bin/bash

# Documentation fix and validate pipeline script
# 
# Usage:
#   pnpm docs:fix-and-validate                    # Fix and validate all docs
#   pnpm docs:fix-and-validate path/to/file.md    # Fix and validate specific file
#   pnpm docs:fix-and-validate docs/              # Fix and validate specific directory

# Default to docs/ if no arguments provided
if [ $# -eq 0 ]; then
  TARGETS=("docs/")
else
  TARGETS=("$@")
fi

echo "🔧 Running documentation fix and validate pipeline..."

# Run fix pipeline
echo "📋 Step 1/6: Running fix pipeline..."
bash scripts/docs-fix.sh "${TARGETS[@]}"

# Run validation
echo "🔍 Step 2/6: Running validation..."
pnpm docs:validate "${TARGETS[@]}"

echo "✅ Documentation fix and validate pipeline completed!"
