#!/bin/bash
# Git pre-commit hook: Validate staged SKILL.md files
# Install: see .git/hooks/pre-commit (combined hook dispatcher)
#
# When any skills/*/SKILL.md is staged for commit, this hook:
# 1. Runs skill-lint.js structural validation on each staged skill
# 2. Blocks the commit if any skill fails validation

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"

if [ -z "$REPO_ROOT" ]; then
    exit 0
fi

LINT_SCRIPT="$REPO_ROOT/skills/skill-test/scripts/skill-lint.js"

# Check if any SKILL.md files are staged
STAGED_SKILLS=$(git diff --cached --name-only | grep -E '^skills/.*/SKILL\.md$' || true)

if [ -z "$STAGED_SKILLS" ]; then
    exit 0
fi

# Require Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "skill-test: node not found, skipping skill validation"
    exit 0
fi

if [ ! -f "$LINT_SCRIPT" ]; then
    echo "skill-test: lint script not found at $LINT_SCRIPT, skipping"
    exit 0
fi

echo ""
echo "Validating staged SKILL.md files..."

FAILED=0

for skill_path in $STAGED_SKILLS; do
    skill_dir=$(dirname "$skill_path")
    skill_name=$(basename "$skill_dir")

    if node "$LINT_SCRIPT" "$REPO_ROOT/$skill_dir" >/dev/null 2>&1; then
        echo "  PASS  $skill_path"
    else
        echo "  FAIL  $skill_path"
        # Re-run with output visible
        node "$LINT_SCRIPT" "$REPO_ROOT/$skill_dir" 2>&1 | grep -E "^  →" || true
        FAILED=$((FAILED + 1))
    fi
done

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "ERROR: $FAILED skill(s) failed validation. Fix errors before committing."
    echo ""
    echo "To auto-update stale metadata:"
    for skill_path in $STAGED_SKILLS; do
        skill_dir=$(dirname "$skill_path")
        echo "  node skills/skill-test/scripts/skill-metadata-updater.js $skill_dir"
    done
    echo ""
    exit 1
fi

echo "All staged skills passed validation."
echo ""
