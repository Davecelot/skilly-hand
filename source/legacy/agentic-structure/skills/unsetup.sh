#!/bin/bash
# Unsetup AI Skills for ScannLab Design System development
# Reverts configuration created by skills/setup.sh:
#   - Removes .claude/.gemini/.codex/.cursor skills symlinks (and restores backups if present)
#   - Removes CLAUDE.md / GEMINI.md copies created from AGENTS.md
#   - Removes cursor-instructions.md if it matches AGENTS.md
#   - Removes .github/copilot-instructions.md if it matches AGENTS.md
#
# Usage:
#   ./skills/unsetup.sh              # Interactive mode (select AI assistants)
#   ./skills/unsetup.sh --all        # Unconfigure all AI assistants
#   ./skills/unsetup.sh --claude     # Unconfigure only Claude Code
#   ./skills/unsetup.sh --claude --cursor  # Unconfigure multiple

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Selection flags
UNSETUP_CLAUDE=false
UNSETUP_GEMINI=false
UNSETUP_CODEX=false
UNSETUP_CURSOR=false
UNSETUP_COPILOT=false

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Revert AI coding assistant configuration created by skills/setup.sh."
    echo ""
    echo "Options:"
    echo "  --all       Unconfigure all AI assistants"
    echo "  --claude    Unconfigure Claude Code / OpenCode"
    echo "  --gemini    Unconfigure Gemini CLI"
    echo "  --codex     Unconfigure Codex (OpenAI)"
    echo "  --cursor    Unconfigure Cursor"
    echo "  --copilot   Unconfigure GitHub Copilot"
    echo "  --help      Show this help message"
    echo ""
    echo "If no options provided, runs in interactive mode."
    echo ""
    echo "Examples:"
    echo "  $0                      # Interactive selection"
    echo "  $0 --all                # All AI assistants"
    echo "  $0 --claude --codex     # Only Claude and Codex"
}

show_menu() {
    echo -e "${BOLD}Which AI assistants do you want to unconfigure?${NC}"
    echo -e "${CYAN}(Use numbers to toggle, Enter to confirm)${NC}"
    echo ""

    local options=("Claude Code / OpenCode" "Gemini CLI" "Codex (OpenAI)" "Cursor" "GitHub Copilot")
    local selected=(true false false false false)

    while true; do
        for i in "${!options[@]}"; do
            if [ "${selected[$i]}" = true ]; then
                echo -e "  ${GREEN}[x]${NC} $((i+1)). ${options[$i]}"
            else
                echo -e "  [ ] $((i+1)). ${options[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}a${NC}. Select all"
        echo -e "  ${YELLOW}n${NC}. Select none"
        echo ""
        echo -n "Toggle (1-4, a, n) or Enter to confirm: "

        read -r choice

        case $choice in
            1) selected[0]=$([ "${selected[0]}" = true ] && echo false || echo true) ;;
            2) selected[1]=$([ "${selected[1]}" = true ] && echo false || echo true) ;;
            3) selected[2]=$([ "${selected[2]}" = true ] && echo false || echo true) ;;
            4) selected[3]=$([ "${selected[3]}" = true ] && echo false || echo true) ;;
            5) selected[4]=$([ "${selected[4]}" = true ] && echo false || echo true) ;;
            a|A) selected=(true true true true) ;;
            n|N) selected=(false false false false) ;;
            "") break ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac

        # Move cursor up to redraw menu (same height as in setup.sh)
        echo -en "\033[11A\033[J"
    done

    UNSETUP_CLAUDE=${selected[0]}
    UNSETUP_GEMINI=${selected[1]}
    UNSETUP_CODEX=${selected[2]}
    UNSETUP_CURSOR=${selected[3]}
    UNSETUP_COPILOT=${selected[4]}
}

restore_skills_for_tool() {
    local tool_dir="$1"
    local target="$REPO_ROOT/$tool_dir/skills"

    if [ -L "$target" ]; then
        rm "$target"
        echo -e "${GREEN}  ✓ Removed symlink $tool_dir/skills/${NC}"
    elif [ -d "$target" ]; then
        echo -e "${YELLOW}  ⚠ $tool_dir/skills/ is a real directory, not a symlink. Leaving as-is.${NC}"
    else
        echo -e "${BLUE}  • $tool_dir/skills/ not found; nothing to remove.${NC}"
    fi

    # Restore latest backup if present
    local backup_parent="$REPO_ROOT/$tool_dir"
    local latest_backup
    latest_backup=$(ls -d "$backup_parent"/skills.backup.* 2>/dev/null | sort | tail -n 1 || true)

    if [ -n "$latest_backup" ]; then
        mv "$latest_backup" "$target"
        echo -e "${GREEN}  ✓ Restored backup $(basename "$latest_backup") → $tool_dir/skills/${NC}"
    fi
}

remove_agents_copy() {
    local target_name="$1"
    local agents_files
    local removed=0
    local skipped=0

    agents_files=$(find "$REPO_ROOT" -name "AGENTS.md" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null)

    for agents_file in $agents_files; do
        local agents_dir
        agents_dir=$(dirname "$agents_file")
        local target_file="$agents_dir/$target_name"

        if [ -f "$target_file" ]; then
            if cmp -s "$agents_file" "$target_file"; then
                rm "$target_file"
                removed=$((removed + 1))
            else
                skipped=$((skipped + 1))
            fi
        fi
    done

    echo -e "${GREEN}  ✓ Removed $removed $target_name files matching AGENTS.md${NC}"
    if [ "$skipped" -gt 0 ]; then
        echo -e "${YELLOW}  ⚠ Skipped $skipped modified $target_name files (not created by setup.sh)${NC}"
    fi
}

remove_cursor_instructions() {
    local root_agents="$REPO_ROOT/AGENTS.md"
    local cursor_file="$REPO_ROOT/cursor-instructions.md"

    if [ -f "$cursor_file" ]; then
        if [ -f "$root_agents" ] && cmp -s "$root_agents" "$cursor_file"; then
            rm "$cursor_file"
            echo -e "${GREEN}  ✓ Removed cursor-instructions.md${NC}"
        else
            echo -e "${YELLOW}  ⚠ cursor-instructions.md differs from AGENTS.md; leaving in place.${NC}"
        fi
    else
        echo -e "${BLUE}  • cursor-instructions.md not found; nothing to remove.${NC}"
    fi
}

remove_copilot_instructions() {
    local root_agents="$REPO_ROOT/AGENTS.md"
    local copilot_file="$REPO_ROOT/.github/copilot-instructions.md"

    if [ -f "$copilot_file" ]; then
        if [ -f "$root_agents" ] && cmp -s "$root_agents" "$copilot_file"; then
            rm "$copilot_file"
            echo -e "${GREEN}  ✓ Removed .github/copilot-instructions.md${NC}"
        else
            echo -e "${YELLOW}  ⚠ .github/copilot-instructions.md differs from AGENTS.md; leaving in place.${NC}"
        fi
    else
        echo -e "${BLUE}  • .github/copilot-instructions.md not found; nothing to remove.${NC}"
    fi
}

# =============================================================================
# TOOL-SPECIFIC UNSETUP
# =============================================================================

unsetup_claude() {
    restore_skills_for_tool ".claude"
    remove_agents_copy "CLAUDE.md"
}

unsetup_gemini() {
    restore_skills_for_tool ".gemini"
    remove_agents_copy "GEMINI.md"
}

unsetup_codex() {
    restore_skills_for_tool ".codex"
    echo -e "${GREEN}  ✓ Codex uses AGENTS.md natively; no extra config to remove.${NC}"
}

unsetup_cursor() {
    restore_skills_for_tool ".cursor"
    remove_cursor_instructions
}

unsetup_copilot() {
    remove_copilot_instructions
}

# =============================================================================
# PARSE ARGUMENTS
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            UNSETUP_CLAUDE=true
            UNSETUP_GEMINI=true
            UNSETUP_CODEX=true
            UNSETUP_CURSOR=true
            UNSETUP_COPILOT=true
            shift
            ;;
        --claude)  UNSETUP_CLAUDE=true;  shift ;;
        --gemini)  UNSETUP_GEMINI=true;  shift ;;
        --codex)   UNSETUP_CODEX=true;   shift ;;
        --cursor)  UNSETUP_CURSOR=true;  shift ;;
        --copilot) UNSETUP_COPILOT=true; shift ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# =============================================================================
# MAIN
# =============================================================================

echo ""
echo -e "${BOLD}🧹 ScannLab AI Skills Unsetup${NC}"
echo "==============================="
echo ""

# Interactive mode if no flags provided
if [ "$UNSETUP_CLAUDE" = false ] && [ "$UNSETUP_GEMINI" = false ] && [ "$UNSETUP_CODEX" = false ] && [ "$UNSETUP_CURSOR" = false ] && [ "$UNSETUP_COPILOT" = false ]; then
    show_menu
    echo ""
fi

# Check if at least one selected
if [ "$UNSETUP_CLAUDE" = false ] && [ "$UNSETUP_GEMINI" = false ] && [ "$UNSETUP_CODEX" = false ] && [ "$UNSETUP_CURSOR" = false ] && [ "$UNSETUP_COPILOT" = false ]; then
    echo -e "${YELLOW}No AI assistants selected. Nothing to do.${NC}"
    exit 0
fi

# Count selected tools for progress
STEP=1
TOTAL=0
[ "$UNSETUP_CLAUDE" = true ]  && TOTAL=$((TOTAL + 1))
[ "$UNSETUP_GEMINI" = true ]  && TOTAL=$((TOTAL + 1))
[ "$UNSETUP_CODEX" = true ]   && TOTAL=$((TOTAL + 1))
[ "$UNSETUP_CURSOR" = true ]  && TOTAL=$((TOTAL + 1))
[ "$UNSETUP_COPILOT" = true ] && TOTAL=$((TOTAL + 1))

# Run selected unsetup steps
if [ "$UNSETUP_CLAUDE" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Unconfiguring Claude Code...${NC}"
    unsetup_claude
    STEP=$((STEP + 1))
fi

if [ "$UNSETUP_GEMINI" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Unconfiguring Gemini CLI...${NC}"
    unsetup_gemini
    STEP=$((STEP + 1))
fi

if [ "$UNSETUP_CODEX" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Unconfiguring Codex (OpenAI)...${NC}"
    unsetup_codex
    STEP=$((STEP + 1))
fi

if [ "$UNSETUP_CURSOR" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Unconfiguring Cursor...${NC}"
    unsetup_cursor
    STEP=$((STEP + 1))
fi

if [ "$UNSETUP_COPILOT" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Unconfiguring GitHub Copilot...${NC}"
    unsetup_copilot
fi

echo ""
echo -e "${GREEN}✅ Unsetup complete.${NC}"
echo ""
echo "Unconfigured:"
[ "$UNSETUP_CLAUDE" = true ]  && echo "  • Claude Code:    .claude/skills/ symlink + CLAUDE.md copies"
[ "$UNSETUP_CODEX" = true ]   && echo "  • Codex (OpenAI): .codex/skills/ symlink"
[ "$UNSETUP_GEMINI" = true ]  && echo "  • Gemini CLI:     .gemini/skills/ symlink + GEMINI.md copies"
[ "$UNSETUP_CURSOR" = true ]  && echo "  • Cursor:         .cursor/skills/ symlink + cursor-instructions.md (if created from AGENTS.md)"
[ "$UNSETUP_COPILOT" = true ] && echo "  • GitHub Copilot: .github/copilot-instructions.md (if created from AGENTS.md)"
echo ""

