#!/bin/bash
# Git pre-commit hook: Auto-sync AGENTS.md → convention files
# Install: cp skills/agents-sync/scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#
# When AGENTS.md is staged for commit, this hook:
# 1. Runs the sync script to update convention files
# 2. Auto-stages updated convention files into the commit

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"

if [ -z "$REPO_ROOT" ]; then
    exit 0
fi

SYNC_SCRIPT="$REPO_ROOT/skills/agents-sync/scripts/sync-conventions.sh"

# Check if any AGENTS.md file is staged
STAGED_AGENTS=$(git diff --cached --name-only | grep -E '(^|/)AGENTS\.md$' || true)

if [ -z "$STAGED_AGENTS" ]; then
    exit 0
fi

echo ""
echo "🔄 AGENTS.md changed — syncing convention files..."

if [ -x "$SYNC_SCRIPT" ]; then
    "$SYNC_SCRIPT" --quiet
else
    # Inline fallback if sync script is not available
    for agents_file in $STAGED_AGENTS; do
        agents_dir=$(dirname "$REPO_ROOT/$agents_file")

        for target in CLAUDE.md GEMINI.md; do
            target_path="$agents_dir/$target"
            if [ -f "$target_path" ]; then
                cp "$REPO_ROOT/$agents_file" "$target_path"
            fi
        done

        if [ "$agents_dir" = "$REPO_ROOT" ] && [ -f "$REPO_ROOT/.github/copilot-instructions.md" ]; then
            cp "$REPO_ROOT/$agents_file" "$REPO_ROOT/.github/copilot-instructions.md"
        fi
    done
fi

# Auto-stage updated convention files
CONVENTION_FILES=(
    "CLAUDE.md"
    "GEMINI.md"
    ".github/copilot-instructions.md"
)

for conv_file in "${CONVENTION_FILES[@]}"; do
    if [ -f "$REPO_ROOT/$conv_file" ]; then
        git add "$REPO_ROOT/$conv_file" 2>/dev/null
    fi
done

echo "✅ Convention files synced and staged."
echo ""
