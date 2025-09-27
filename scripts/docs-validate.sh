#!/bin/bash

# Documentation validation script
# 
# Usage:
#   pnpm docs:validate                    # Validate all docs
#   pnpm docs:validate path/to/file.md    # Validate specific file
#   pnpm docs:validate docs/              # Validate specific directory
#   pnpm docs:validate file1.md file2.md  # Validate multiple files
#   pnpm docs:validate docs/ tools/       # Validate multiple directories

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  echo "KiloCode Documentation Validator

Usage: pnpm docs:validate [targets...]

Targets:
  [targets...] Specific files or directories to validate (default: docs/)

Examples:
  pnpm docs:validate                    # Validate all docs
  pnpm docs:validate path/to/file.md    # Validate specific file
  pnpm docs:validate docs/              # Validate specific directory
  pnpm docs:validate file1.md file2.md  # Validate multiple files
  pnpm docs:validate docs/ tools/       # Validate multiple directories
"
  exit 0
fi

# Default to docs/ if no arguments provided
if [ $# -eq 0 ]; then
  TARGETS=("docs/")
else
  TARGETS=("$@")
fi

# Check if all targets exist
for TARGET in "${TARGETS[@]}"; do
  if [ ! -e "$TARGET" ]; then
    echo "Error: Target \"$TARGET\" does not exist" >&2
    exit 1
  fi
done

# Run remark with all targets (suppress file content, show only warnings/errors)
# Use script to force unbuffered output and prevent blocking with pipes
script -qfc "remark \"${TARGETS[@]}\" --quiet > /dev/null" /dev/null
