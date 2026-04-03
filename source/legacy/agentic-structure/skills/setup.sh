#!/bin/bash
# Setup AI Skills for ScannLab Design System development
# Configures AI coding assistants that follow agentskills.io standard:
#   - Claude Code: .claude/skills/ symlink + CLAUDE.md copies
#   - Gemini CLI: .gemini/skills/ symlink + GEMINI.md copies
#   - Codex (OpenAI): .codex/skills/ symlink + AGENTS.md (native)
#   - Cursor: .cursor/skills/ symlink + cursor-instructions.md copy
#   - GitHub Copilot: .github/copilot-instructions.md copy
#
# Usage:
#   ./skills/setup.sh              # Interactive mode (select AI assistants)
#   ./skills/setup.sh --all        # Configure all AI assistants
#   ./skills/setup.sh --claude     # Configure only Claude Code
#   ./skills/setup.sh --claude --cursor  # Configure multiple

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_SOURCE="$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Selection flags
SETUP_CLAUDE=false
SETUP_GEMINI=false
SETUP_CODEX=false
SETUP_CURSOR=false
SETUP_COPILOT=false

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Configure AI coding assistants for ScannLab Design System development."
    echo ""
    echo "Options:"
    echo "  --all       Configure all AI assistants"
    echo "  --claude    Configure Claude Code / OpenCode"
    echo "  --gemini    Configure Gemini CLI"
    echo "  --codex     Configure Codex (OpenAI)"
    echo "  --cursor    Configure Cursor"
    echo "  --copilot   Configure GitHub Copilot"
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
    echo -e "${BOLD}Which AI assistants do you use?${NC}"
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

        # Move cursor up to redraw menu
        echo -en "\033[11A\033[J"
    done

    SETUP_CLAUDE=${selected[0]}
    SETUP_GEMINI=${selected[1]}
    SETUP_CODEX=${selected[2]}
    SETUP_CURSOR=${selected[3]}
    SETUP_COPILOT=${selected[4]}
}

create_skills_symlink() {
    local tool_dir="$1"
    local target="$REPO_ROOT/$tool_dir/skills"

    if [ ! -d "$REPO_ROOT/$tool_dir" ]; then
        mkdir -p "$REPO_ROOT/$tool_dir"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/$tool_dir/skills.backup.$(date +%s)"
        echo -e "${YELLOW}  ⚠ Existing skills/ dir backed up${NC}"
    fi

    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ $tool_dir/skills/ → skills/${NC}"
}

copy_agents_md() {
    local target_name="$1"
    local agents_files
    local count=0

    agents_files=$(find "$REPO_ROOT" -name "AGENTS.md" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null)

    for agents_file in $agents_files; do
        local agents_dir
        agents_dir=$(dirname "$agents_file")
        cp "$agents_file" "$agents_dir/$target_name"
        count=$((count + 1))
    done

    echo -e "${GREEN}  ✓ Copied $count AGENTS.md → $target_name${NC}"
}

# =============================================================================
# TOOL-SPECIFIC SETUP
# =============================================================================

setup_claude() {
    create_skills_symlink ".claude"
    copy_agents_md "CLAUDE.md"
}

setup_gemini() {
    create_skills_symlink ".gemini"
    copy_agents_md "GEMINI.md"
}

setup_codex() {
    create_skills_symlink ".codex"
    echo -e "${GREEN}  ✓ Codex uses AGENTS.md natively${NC}"
}

setup_cursor() {
    create_skills_symlink ".cursor"
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/cursor-instructions.md"
        echo -e "${GREEN}  ✓ AGENTS.md → cursor-instructions.md${NC}"
    else
        echo -e "${RED}  ✗ AGENTS.md not found at repo root${NC}"
    fi
}

setup_copilot() {
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        mkdir -p "$REPO_ROOT/.github"
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/.github/copilot-instructions.md"
        echo -e "${GREEN}  ✓ AGENTS.md → .github/copilot-instructions.md${NC}"
    else
        echo -e "${RED}  ✗ AGENTS.md not found at repo root${NC}"
    fi
}

# =============================================================================
# PARSE ARGUMENTS
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            SETUP_CLAUDE=true
            SETUP_GEMINI=true
            SETUP_CODEX=true
            SETUP_CURSOR=true
            SETUP_COPILOT=true
            shift
            ;;
        --claude)  SETUP_CLAUDE=true;  shift ;;
        --gemini)  SETUP_GEMINI=true;  shift ;;
        --codex)   SETUP_CODEX=true;   shift ;;
        --cursor)  SETUP_CURSOR=true;  shift ;;
        --copilot) SETUP_COPILOT=true; shift ;;
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
echo -e "${BOLD}🧪 ScannLab AI Skills Setup${NC}"
echo "==========================="
echo ""

# Count available skills
SKILL_COUNT=$(find "$SKILLS_SOURCE" -maxdepth 2 -name "SKILL.md" | wc -l | tr -d ' ')

if [ "$SKILL_COUNT" -eq 0 ]; then
    echo -e "${RED}No skills found in $SKILLS_SOURCE${NC}"
    exit 1
fi

echo -e "${BLUE}Found $SKILL_COUNT skills to configure${NC}"
echo ""

# Interactive mode if no flags provided
if [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_CURSOR" = false ] && [ "$SETUP_COPILOT" = false ]; then
    show_menu
    echo ""
fi

# Check if at least one selected
if [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_CURSOR" = false ] && [ "$SETUP_COPILOT" = false ]; then
    echo -e "${YELLOW}No AI assistants selected. Nothing to do.${NC}"
    exit 0
fi

# Count selected tools for progress
STEP=1
TOTAL=0
[ "$SETUP_CLAUDE" = true ]  && TOTAL=$((TOTAL + 1))
[ "$SETUP_GEMINI" = true ]  && TOTAL=$((TOTAL + 1))
[ "$SETUP_CODEX" = true ]   && TOTAL=$((TOTAL + 1))
[ "$SETUP_CURSOR" = true ]  && TOTAL=$((TOTAL + 1))
[ "$SETUP_COPILOT" = true ] && TOTAL=$((TOTAL + 1))

# Run selected setups
if [ "$SETUP_CLAUDE" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Claude Code...${NC}"
    setup_claude
    STEP=$((STEP + 1))
fi

if [ "$SETUP_GEMINI" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Gemini CLI...${NC}"
    setup_gemini
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CODEX" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Codex (OpenAI)...${NC}"
    setup_codex
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CURSOR" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Cursor...${NC}"
    setup_cursor
    STEP=$((STEP + 1))
fi

if [ "$SETUP_COPILOT" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up GitHub Copilot...${NC}"
    setup_copilot
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo -e "${GREEN}✅ Successfully configured $SKILL_COUNT skills!${NC}"
echo ""
echo "Configured:"
[ "$SETUP_CLAUDE" = true ]  && echo "  • Claude Code:    .claude/skills/ + CLAUDE.md"
[ "$SETUP_CODEX" = true ]   && echo "  • Codex (OpenAI): .codex/skills/ + AGENTS.md (native)"
[ "$SETUP_GEMINI" = true ]  && echo "  • Gemini CLI:     .gemini/skills/ + GEMINI.md"
[ "$SETUP_CURSOR" = true ]  && echo "  • Cursor:         .cursor/skills/ + cursor-instructions.md"
[ "$SETUP_COPILOT" = true ] && echo "  • GitHub Copilot: .github/copilot-instructions.md"
echo ""
echo -e "${BLUE}Note: Restart your AI assistant to load the skills.${NC}"
echo -e "${BLUE}      AGENTS.md is the source of truth — edit it, then re-run this script.${NC}"
echo ""
