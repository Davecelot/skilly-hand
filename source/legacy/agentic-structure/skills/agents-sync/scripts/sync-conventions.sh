#!/bin/bash
# Sync AGENTS.md content to AI convention files (CLAUDE.md, GEMINI.md, copilot-instructions.md, cursor-instructions.md)
# Only copies to files that already exist — never creates new ones.
#
# Usage:
#   ./skills/agents-sync/scripts/sync-conventions.sh              # From repo root
#   ./skills/agents-sync/scripts/sync-conventions.sh --quiet       # Suppress output

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

QUIET=false
SYNCED=0
SKIPPED=0

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --quiet|-q) QUIET=true; shift ;;
        *) shift ;;
    esac
done

log() {
    [ "$QUIET" = false ] && echo -e "$@"
}

# =============================================================================
# SYNC LOGIC
# =============================================================================

sync_file() {
    local source="$1"
    local target="$2"
    local label="$3"

    if [ -f "$target" ]; then
        if diff -q "$source" "$target" > /dev/null 2>&1; then
            log "${CYAN}  ⊜ $label — already in sync${NC}"
            SKIPPED=$((SKIPPED + 1))
        else
            cp "$source" "$target"
            log "${GREEN}  ✓ $label — synced${NC}"
            SYNCED=$((SYNCED + 1))
        fi
    else
        log "${YELLOW}  ⊘ $label — not found, skipping${NC}"
        SKIPPED=$((SKIPPED + 1))
    fi
}

# =============================================================================
# MAIN
# =============================================================================

log ""
log "${BOLD}🔄 Agents Sync — Convention Files${NC}"
log "==================================="
log ""

# Find all AGENTS.md files (excluding node_modules, .git, and skill directories)
AGENTS_FILES=$(find "$REPO_ROOT" -name "AGENTS.md" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/skills/*" \
    2>/dev/null)

if [ -z "$AGENTS_FILES" ]; then
    log "${YELLOW}No AGENTS.md files found.${NC}"
    exit 0
fi

for agents_file in $AGENTS_FILES; do
    agents_dir=$(dirname "$agents_file")
    rel_dir="${agents_dir#$REPO_ROOT}"
    [ -z "$rel_dir" ] && rel_dir="/"

    log "${BLUE}📁 ${rel_dir}AGENTS.md${NC}"

    # Sync to CLAUDE.md (same directory)
    sync_file "$agents_file" "$agents_dir/CLAUDE.md" "CLAUDE.md"

    # Sync to GEMINI.md (same directory)
    sync_file "$agents_file" "$agents_dir/GEMINI.md" "GEMINI.md"

    # Sync to .github/copilot-instructions.md (only at repo root)
    if [ "$agents_dir" = "$REPO_ROOT" ]; then
        sync_file "$agents_file" "$REPO_ROOT/.github/copilot-instructions.md" ".github/copilot-instructions.md"
    fi

    # Sync to cursor-instructions.md (only at repo root)
    if [ "$agents_dir" = "$REPO_ROOT" ]; then
        sync_file "$agents_file" "$REPO_ROOT/cursor-instructions.md" "cursor-instructions.md"
    fi

    log ""
done

# =============================================================================
# SUMMARY
# =============================================================================

if [ "$SYNCED" -eq 0 ] && [ "$SKIPPED" -gt 0 ]; then
    log "${CYAN}✅ All convention files are already in sync.${NC}"
elif [ "$SYNCED" -gt 0 ]; then
    log "${GREEN}✅ Synced $SYNCED file(s).${NC}"
else
    log "${YELLOW}⚠ No convention files found. Run setup.sh first to create them.${NC}"
fi
log ""
