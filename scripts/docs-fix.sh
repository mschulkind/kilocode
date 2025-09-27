#!/bin/bash

# Documentation fix pipeline script
# 
# Usage:
#   pnpm docs:fix                    # Fix all docs
#   pnpm docs:fix path/to/file.md    # Fix specific file
#   pnpm docs:fix docs/              # Fix specific directory

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

echo -e "${CYAN}🔧 Running documentation fix pipeline...${NC}"

# Run each step with the same targets
echo -e "${BLUE}📋 Step 1/5: Generating Table of Contents...${NC}"
pnpm docs:toc "${TARGETS[@]}" || { echo -e "${RED}❌ TOC generation failed${NC}"; exit 1; }

echo -e "${BLUE}🔧 Step 2/5: Running documentation fixer...${NC}"
pnpm docs:fixer "${TARGETS[@]}" || { echo -e "${RED}❌ Documentation fixer failed${NC}"; exit 1; }

echo -e "${BLUE}📊 Step 3/5: Analyzing content quality...${NC}"
pnpm docs:quality "${TARGETS[@]}" || { echo -e "${RED}❌ Content quality checks failed${NC}"; exit 1; }

echo -e "${BLUE}🔗 Step 4/5: Validating links...${NC}"
pnpm docs:links "${TARGETS[@]}" || { echo -e "${RED}❌ Link validation failed${NC}"; exit 1; }

echo -e "${BLUE}⚙️  Step 5/5: Optimizing workflow...${NC}"
pnpm docs:workflow "${TARGETS[@]}" || { echo -e "${RED}❌ Workflow optimization failed${NC}"; exit 1; }

echo -e "${GREEN}✅ Documentation fix pipeline completed!${NC}"
