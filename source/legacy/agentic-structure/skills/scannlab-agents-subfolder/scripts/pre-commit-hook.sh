#!/bin/bash
# Git pre-commit hook: Validate asset templates when scannlab-agents-subfolder/SKILL.md changes
# Install: see .git/hooks/pre-commit (combined hook dispatcher)
#
# When skills/scannlab-agents-subfolder/SKILL.md is staged for commit, this hook:
# 1. Runs templates-lint.js to check asset templates for dead skill references,
#    old path patterns, and missing IMPORTANT notices
# 2. Blocks the commit if any check fails
#
# Semantic drift (section order, routing table content) is handled by the
# templates-sync agent — this hook only catches structural violations.

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"

if [ -z "$REPO_ROOT" ]; then
    exit 0
fi

LINT_SCRIPT="$REPO_ROOT/skills/scannlab-agents-subfolder/scripts/templates-lint.js"
SKILL_FILE="skills/scannlab-agents-subfolder/SKILL.md"

# Only trigger when this specific SKILL.md is staged
STAGED=$(git diff --cached --name-only | grep -F "$SKILL_FILE" || true)

if [ -z "$STAGED" ]; then
    exit 0
fi

# Require Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "scannlab-agents-subfolder: node not found, skipping template validation"
    exit 0
fi

if [ ! -f "$LINT_SCRIPT" ]; then
    echo "scannlab-agents-subfolder: lint script not found at $LINT_SCRIPT, skipping"
    exit 0
fi

echo ""
echo "scannlab-agents-subfolder SKILL.md changed — validating asset templates..."

if node "$LINT_SCRIPT"; then
    exit 0
else
    echo ""
    echo "ERROR: Asset templates have issues. Fix them or run the templates-sync agent:"
    echo "  Invoke: agents/templates-sync.md in skills/scannlab-agents-subfolder/"
    echo ""
    exit 1
fi
