#!/bin/bash

# Documentation fix and validate pipeline script
# 
# Usage:
#   pnpm docs:fix-and-validate                    # Fix and validate all docs
#   pnpm docs:fix-and-validate path/to/file.md    # Fix and validate specific file
#   pnpm docs:fix-and-validate docs/              # Fix and validate specific directory

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Default to docs/ if no arguments provided
if [ $# -eq 0 ]; then
  TARGETS=("docs/")
else
  TARGETS=("$@")
fi

echo -e "${PURPLE}🔧 Running documentation fix and validate pipeline...${NC}"

# Run fix pipeline
echo -e "${BLUE}📋 Step 1/6: Running fix pipeline...${NC}"
bash scripts/docs-fix.sh "${TARGETS[@]}" || { echo -e "${RED}❌ Documentation fix pipeline failed${NC}"; exit 1; }

# Run validation
echo -e "${BLUE}🔍 Step 2/6: Running validation...${NC}"
pnpm docs:validate "${TARGETS[@]}" || { echo -e "${RED}❌ Documentation validation failed${NC}"; exit 1; }

echo -e "${GREEN}✅ Documentation fix and validate pipeline completed!${NC}"
