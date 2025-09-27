#!/bin/bash

# Documentation fix pipeline script
# 
# Usage:
#   pnpm docs:fix                    # Fix all docs
#   pnpm docs:fix path/to/file.md    # Fix specific file
#   pnpm docs:fix docs/              # Fix specific directory

# Default to docs/ if no arguments provided
if [ $# -eq 0 ]; then
  TARGETS=("docs/")
else
  TARGETS=("$@")
fi

echo "🔧 Running documentation fix pipeline..."

# Run each step with the same targets
echo "📋 Step 1/5: Generating Table of Contents..."
pnpm docs:toc "${TARGETS[@]}"

echo "🔧 Step 2/5: Running documentation fixer..."
pnpm docs:fixer "${TARGETS[@]}"

echo "📊 Step 3/5: Analyzing content quality..."
pnpm docs:quality "${TARGETS[@]}"

echo "🔗 Step 4/5: Validating links..."
pnpm docs:links "${TARGETS[@]}"

echo "⚙️  Step 5/5: Optimizing workflow..."
pnpm docs:workflow "${TARGETS[@]}"

echo "✅ Documentation fix pipeline completed!"
