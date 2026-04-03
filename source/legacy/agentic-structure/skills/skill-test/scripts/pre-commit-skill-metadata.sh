#!/bin/bash
#
# Pre-commit Hook: Skill Metadata Freshness Check
# ================================================
#
# Part of: skill-test validation suite
#
# Ensures that whenever SKILL.md files are committed, their metadata
# (version, last-edit, changelog) has been updated.
#
# Installation:
#   cp skills/skill-test/scripts/pre-commit-skill-metadata.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Or via Husky:
#   npx husky add .husky/pre-commit "skills/skill-test/scripts/pre-commit-skill-metadata.sh"
#

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel)

# Find all SKILL.md files being committed
MODIFIED_SKILLS=$(git diff --cached --name-only 2>/dev/null | grep "^skills/.*/SKILL\.md$" || echo "")

if [ -z "$MODIFIED_SKILLS" ]; then
  echo -e "${GREEN}✓${NC} No skills being committed"
  exit 0
fi

echo -e "${BLUE}🔍 Validating skill metadata updates...${NC}"
FAILED=0
CHECKED=0

for skill_path in $MODIFIED_SKILLS; do
  skill_dir=$(dirname "$skill_path")
  skill_name=$(basename "$skill_dir")
  
  # Check if the SKILL.md file actually has content changes (not just metadata)
  if git diff --cached "$skill_path" 2>/dev/null | grep -q "^@@"; then
    CHECKED=$((CHECKED + 1))
    echo -e "  → Checking ${BLUE}${skill_name}${NC}..."
    
    # Run skill-lint validation which now includes metadata freshness check
    if ! node "$REPO_ROOT/skills/skill-test/scripts/skill-lint.js" "$skill_dir" >/dev/null 2>&1; then
      echo -e "    ${RED}❌ Metadata needs updating${NC}"
      echo -e "       ${YELLOW}Run:${NC} node skills/skill-test/scripts/skill-metadata-updater.js $skill_dir"
      FAILED=$((FAILED + 1))
    fi
  fi
done

if [ $FAILED -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ ${FAILED} skill(s) have stale metadata.${NC}"
  echo -e "${YELLOW}Update before committing:${NC}"
  echo ""
  for skill_path in $MODIFIED_SKILLS; do
    skill_dir=$(dirname "$skill_path")
    echo -e "  ${BLUE}node skills/skill-test/scripts/skill-metadata-updater.js $skill_dir${NC}"
  done
  echo ""
  echo -e "${YELLOW}Then stage and try committing again.${NC}"
  exit 1
fi

if [ $CHECKED -gt 0 ]; then
  echo -e "${GREEN}✅ All ${CHECKED} skill(s) have fresh metadata${NC}"
fi

exit 0
