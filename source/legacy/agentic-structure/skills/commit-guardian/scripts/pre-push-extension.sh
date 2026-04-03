#!/bin/bash
# commit-guardian pre-push extension
# Advisory-only: exits 0 always. Prints a condensed quality summary
# before the existing check:coverage gate fires.
#
# Registration (manual, opt-in):
# Add this script to .git/hooks/pre-push dispatcher.
# Do NOT add to .husky/pre-push (that file is committed to the repo).
#
# Usage in .git/hooks/pre-push dispatcher:
#   REPO_ROOT/skills/commit-guardian/scripts/pre-push-extension.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}+------------------------------------------+${NC}"
echo -e "${BLUE}|  Commit Guardian -- Pre-Push Advisory    |${NC}"
echo -e "${BLUE}+------------------------------------------+${NC}"
echo ""

# Scope detection
CHANGED_FILES=$(git diff --name-only --diff-filter=AM origin/develop...HEAD 2>/dev/null || echo "")
SOURCE_FILES=$(echo "$CHANGED_FILES" | grep -E "projects/.*\.ts$" | grep -v "\.spec\.ts$" | grep -v "\.stories\.ts$" | grep -v "public-api" || true)
SPEC_FILES=$(echo "$CHANGED_FILES" | grep -E "\.spec\.ts$" || true)
SOURCE_COUNT=$(echo "$SOURCE_FILES" | grep -c "." || true)
SPEC_COUNT=$(echo "$SPEC_FILES" | grep -c "." || true)

echo -e "Scope: ${SOURCE_COUNT} source files, ${SPEC_COUNT} spec files changed"
echo ""

if [ -z "$SOURCE_FILES" ] && [ -z "$SPEC_FILES" ]; then
  echo -e "${GREEN}No Angular source changes -- test gate skipped${NC}"
  echo ""
  exit 0
fi

# Lint check
echo "Running lint..."
if npm run lint --silent 2>/dev/null; then
  echo -e "${GREEN}Lint: PASS${NC}"
else
  echo -e "${YELLOW}Lint: FAIL -- run 'npm run lint' for details${NC}"
fi

# Scoped unit tests
echo "Running unit tests..."
if npx vitest run --reporter=verbose --silent 2>/dev/null; then
  echo -e "${GREEN}Unit Tests: PASS${NC}"
else
  echo -e "${YELLOW}Unit Tests: FAIL -- run 'npx vitest run' for details${NC}"
fi

echo ""
echo -e "${BLUE}Advisory check complete. check:coverage will run next (blocking gate).${NC}"
echo -e "${BLUE}For full AI analysis run: commit-guardian agent${NC}"
echo ""

# Always exit 0 -- advisory only
exit 0
