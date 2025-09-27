#!/bin/bash

# Documentation validation script
# 
# Usage:
#   pnpm docs:validate                    # Validate all docs
#   pnpm docs:validate path/to/file.md    # Validate specific file
#   pnpm docs:validate docs/              # Validate specific directory

# Default to docs/ if no arguments provided
TARGET=${1:-docs/}

# Check if target exists
if [ ! -e "$TARGET" ]; then
  echo "Error: Target \"$TARGET\" does not exist" >&2
  exit 1
fi

# Run remark with the target (suppress file content, show only warnings/errors)
# Use script to force unbuffered output and prevent blocking with pipes
script -qfc "remark \"$TARGET\" --quiet > /dev/null" /dev/null
