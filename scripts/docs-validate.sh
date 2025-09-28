#!/bin/bash

# Documentation validation script
# 
# Usage:
#   pnpm docs:validate                    # Validate all docs
#   pnpm docs:validate path/to/file.md    # Validate specific file
#   pnpm docs:validate docs/              # Validate specific directory
#   pnpm docs:validate file1.md file2.md  # Validate multiple files
#   pnpm docs:validate docs/ tools/       # Validate multiple directories

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  echo -e "${CYAN}KiloCode Documentation Validator${NC}

${WHITE}Usage:${NC} pnpm docs:validate [targets...]

${WHITE}Targets:${NC}
  [targets...] Specific files or directories to validate (default: docs/)

${WHITE}Examples:${NC}
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
    echo -e "${RED}Error: Target \"$TARGET\" does not exist${NC}" >&2
    exit 1
  fi
done

# Show validation start message
echo -e "${BLUE}🔍 Validating documentation...${NC}"

# Run remark with all targets (suppress file content, show only warnings/errors)
# Use script to force unbuffered output and prevent blocking with pipes
script -qfc "npx remark \"${TARGETS[@]}\" --quiet > /dev/null" /dev/null

# Show completion message
echo -e "${GREEN}✅ Documentation validation completed!${NC}"
