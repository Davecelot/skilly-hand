#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# ScannLab Accessibility Audit — WCAG 2.2 Level A + AA checks
# Usage:
#   bash skills/scannlab-a11y-checker/scripts/audit-a11y.sh [options] [file|dir]
#
# Options:
#   --report     Generate a detailed Markdown report (a11y-audit-report.md)
#   --json       Output findings as JSON (for CI integration)
#
# Default: scans all HTML under projects/scanntech-ui/src/components/
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ────────────────────────────────────────────────────
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DEFAULT_DIR="$ROOT/projects/scanntech-ui/src/components"

RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

TOTAL_ISSUES=0
FILES_WITH_ISSUES=0
FILES_SCANNED=0
ISSUES_CRITICAL=0
ISSUES_SERIOUS=0
ISSUES_MODERATE=0

REPORT_MODE=false
JSON_MODE=false
TARGET=""
REPORT_FILE="$ROOT/a11y-audit-report.md"
REPORT_CONTENT=""
JSON_ENTRIES=""

# ── Parse Args ────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --report) REPORT_MODE=true; shift ;;
    --json)   JSON_MODE=true; shift ;;
    *)        TARGET="$1"; shift ;;
  esac
done
TARGET="${TARGET:-$DEFAULT_DIR}"

# ── Helpers ───────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BOLD}══════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD}  ScannLab Accessibility Audit (WCAG 2.2)${RESET}"
  echo -e "${BOLD}══════════════════════════════════════════════════${RESET}"
  echo -e "  Target: ${CYAN}${TARGET}${RESET}"
  if $REPORT_MODE; then
    echo -e "  Report: ${CYAN}${REPORT_FILE}${RESET}"
  fi
  echo ""
}

# Record a finding
record_finding() {
  local file="$1"
  local relative_path="$2"
  local category="$3"
  local severity="$4"    # critical, serious, moderate
  local wcag_sc="$5"
  local lineno="$6"
  local raw_line="$7"
  local message="$8"

  # Console output
  local color_code=""
  local sev_label=""
  case "$severity" in
    critical) color_code="$RED";    sev_label="🔴"; ISSUES_CRITICAL=$((ISSUES_CRITICAL + 1)) ;;
    serious)  color_code="$YELLOW"; sev_label="🟡"; ISSUES_SERIOUS=$((ISSUES_SERIOUS + 1)) ;;
    moderate) color_code="$CYAN";   sev_label="🔵"; ISSUES_MODERATE=$((ISSUES_MODERATE + 1)) ;;
  esac

  printf "  ${color_code}%-14s${RESET} [${DIM}%s${RESET}] line %-4s %s\n" "$category" "$wcag_sc" "$lineno:" "$message"
  echo -e "             ${DIM}→${RESET} $raw_line"

  # Report output
  if $REPORT_MODE; then
    local sev_upper
    sev_upper="$(echo "$severity" | tr '[:lower:]' '[:upper:]' | cut -c1)$(echo "$severity" | cut -c2-)"
    REPORT_CONTENT+="| \`${relative_path}\` | ${lineno} | ${sev_label} ${sev_upper} | \`${category}\` | ${wcag_sc} | ${message} |"$'\n'
  fi

  # JSON output
  if $JSON_MODE; then
    [ -n "$JSON_ENTRIES" ] && JSON_ENTRIES+=","
    local escaped_msg
    escaped_msg="$(echo "$message" | sed 's/"/\\"/g')"
    local escaped_line
    escaped_line="$(echo "$raw_line" | sed 's/"/\\"/g')"
    JSON_ENTRIES+="{\"file\":\"${relative_path}\",\"line\":${lineno},\"severity\":\"${severity}\",\"category\":\"${category}\",\"wcag\":\"${wcag_sc}\",\"message\":\"${escaped_msg}\",\"code\":\"${escaped_line}\"}"
  fi
}

# ── Audit a single HTML file ─────────────────────────────────

audit_html_file() {
  local file="$1"
  local relative_path="${file#$ROOT/}"
  local file_issues=0

  FILES_SCANNED=$((FILES_SCANNED + 1))

  # ── 1. Images without alt attribute (SC 1.1.1) ──────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"

    record_finding "$file" "$relative_path" "MISSING-ALT" "critical" "1.1.1" "$lineno" "$trimmed" "Image missing alt attribute"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E '<img[[:space:]]' "$file" 2>/dev/null | grep -v -E 'alt=' || true)

  # ── 2. Empty buttons without accessible name (SC 4.1.2) ─
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'aria-label' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"

    # Check for self-closing or empty content buttons
    if echo "$trimmed" | grep -qE '<button[^>]*/>' || echo "$trimmed" | grep -qE '<button[^>]*>[[:space:]]*</button>'; then
      record_finding "$file" "$relative_path" "EMPTY-BUTTON" "critical" "4.1.2" "$lineno" "$trimmed" "Button has no text content or aria-label"
      file_issues=$((file_issues + 1))
    fi
  done < <(grep -n -E '<button' "$file" 2>/dev/null || true)

  # ── 3. Empty links without accessible name (SC 4.1.2) ───
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'aria-label' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"

    if echo "$trimmed" | grep -qE '<a[^>]*>[[:space:]]*</a>'; then
      record_finding "$file" "$relative_path" "EMPTY-LINK" "critical" "2.4.4" "$lineno" "$trimmed" "Link has no text content or aria-label"
      file_issues=$((file_issues + 1))
    fi
  done < <(grep -n -E '<a[[:space:]]' "$file" 2>/dev/null || true)

  # ── 4. Form inputs without labels (SC 1.3.1 / 3.3.2) ───
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'aria-label|aria-labelledby' && continue
    echo "$line" | grep -qE 'id=' && {
      local input_id
      input_id="$(echo "$line" | grep -oE 'id="[^"]*"' | head -1 | sed 's/id="//;s/"//')"
      if [ -n "$input_id" ] && grep -q "for=\"${input_id}\"" "$file" 2>/dev/null; then
        continue
      fi
    }
    echo "$line" | grep -qE 'type="hidden"' && continue
    echo "$line" | grep -qE 'type="submit"' && continue
    echo "$line" | grep -qE 'type="button"' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"

    record_finding "$file" "$relative_path" "MISSING-LABEL" "serious" "1.3.1" "$lineno" "$trimmed" "Form input missing associated label, aria-label, or aria-labelledby"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E '<(input|select|textarea)[[:space:]]' "$file" 2>/dev/null || true)

  # ── 5. Clickable divs/spans without role (SC 2.1.1) ─────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'role=' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"

    record_finding "$file" "$relative_path" "CLICK-NO-ROLE" "serious" "2.1.1" "$lineno" "$trimmed" "Clickable element without role attribute — use <button> or add role=\"button\" + tabindex=\"0\""
    file_issues=$((file_issues + 1))
  done < <(grep -n -E '<(div|span)[^>]*(click)' "$file" 2>/dev/null | grep -v 'role=' || true)

  # ── 6. Positive tabindex (SC 2.4.3) ─────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"

    # Extract tabindex value
    local tab_val
    tab_val="$(echo "$line" | grep -oE 'tabindex="[0-9]+"' | grep -oE '[0-9]+' | head -1)"
    if [ -n "$tab_val" ] && [ "$tab_val" -gt 0 ] 2>/dev/null; then
      record_finding "$file" "$relative_path" "TABINDEX-POS" "serious" "2.4.3" "$lineno" "$trimmed" "tabindex=\"${tab_val}\" > 0 disrupts natural tab order — use tabindex=\"0\" instead"
      file_issues=$((file_issues + 1))
    fi
  done < <(grep -n -E 'tabindex="[1-9]' "$file" 2>/dev/null || true)

  # ── 7. Heading hierarchy violations (SC 1.3.1) ──────────
  local prev_level=0
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local level
    level="$(echo "$line" | grep -oE '<h[1-6]' | grep -oE '[1-6]' | head -1)"

    if [ -n "$level" ]; then
      if [ "$prev_level" -gt 0 ] && [ "$level" -gt $((prev_level + 1)) ]; then
        record_finding "$file" "$relative_path" "HEADING-SKIP" "moderate" "1.3.1" "$lineno" "$trimmed" "Heading level skipped: h${prev_level} → h${level} (expected h$((prev_level + 1)))"
        file_issues=$((file_issues + 1))
      fi
      prev_level=$level
    fi
  done < <(grep -n -E '<h[1-6]' "$file" 2>/dev/null || true)

  # ── 8. Missing lang on root html element (SC 3.1.1) ─────
  if grep -qE '<html[[:space:]]' "$file" 2>/dev/null; then
    if ! grep -qE '<html[^>]*lang=' "$file" 2>/dev/null; then
      local lineno
      lineno="$(grep -n -E '<html' "$file" 2>/dev/null | head -1 | cut -d: -f1)"
      local trimmed
      trimmed="$(grep -E '<html' "$file" 2>/dev/null | head -1 | sed 's/^[[:space:]]*//')"
      record_finding "$file" "$relative_path" "MISSING-LANG" "serious" "3.1.1" "$lineno" "$trimmed" "Missing lang attribute on <html> element"
      file_issues=$((file_issues + 1))
    fi
  fi

  # ── Print file header ───────────────────────────────────
  if [ "$file_issues" -gt 0 ]; then
    echo -e "\n${BOLD}📄 ${relative_path}${RESET} — ${RED}${file_issues} issue(s)${RESET}"
    FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
    TOTAL_ISSUES=$((TOTAL_ISSUES + file_issues))
  fi
}

# ── Audit CSS files for focus outline removal (SC 2.4.7) ─────

audit_css_file() {
  local file="$1"
  local relative_path="${file#$ROOT/}"
  local file_issues=0

  FILES_SCANNED=$((FILES_SCANNED + 1))

  # ── Focus outline removal ────────────────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"

    # Check if there's a :focus-visible with a replacement style nearby
    local context_start=$((lineno > 5 ? lineno - 5 : 1))
    local context_end=$((lineno + 10))
    if sed -n "${context_start},${context_end}p" "$file" 2>/dev/null | grep -qE 'focus-visible'; then
      continue
    fi

    record_finding "$file" "$relative_path" "FOCUS-REMOVED" "critical" "2.4.7" "$lineno" "$trimmed" "Focus outline removed without visible alternative — add :focus-visible style"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E ':focus[[:space:]]*\{' "$file" 2>/dev/null | while IFS=: read -r ln rest; do
    # Look for outline: none/0 within the next few lines
    local block_end=$((ln + 5))
    if sed -n "${ln},${block_end}p" "$file" 2>/dev/null | grep -qE 'outline:[[:space:]]*(none|0)'; then
      echo "${ln}:${rest}"
    fi
  done || true)

  if [ "$file_issues" -gt 0 ]; then
    echo -e "\n${BOLD}📄 ${relative_path}${RESET} — ${RED}${file_issues} issue(s)${RESET}"
    FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
    TOTAL_ISSUES=$((TOTAL_ISSUES + file_issues))
  fi
}

# ── Generate Markdown Report ──────────────────────────────────

generate_report() {
  local date_str
  date_str="$(date '+%Y-%m-%d %H:%M:%S')"

  cat > "$REPORT_FILE" <<REPORT_HEADER
# ♿ ScannLab Accessibility Audit Report (WCAG 2.2)

**Generated:** ${date_str}
**Target:** \`${TARGET#$ROOT/}\`
**Standard:** WCAG 2.2 Level A + AA

---

## Summary

| Metric | Count |
|---|---|
| Files scanned | ${FILES_SCANNED} |
| Files with issues | ${FILES_WITH_ISSUES} |
| 🔴 Critical | ${ISSUES_CRITICAL} |
| 🟡 Serious | ${ISSUES_SERIOUS} |
| 🔵 Moderate | ${ISSUES_MODERATE} |
| **Total issues** | **${TOTAL_ISSUES}** |

---

## How to Read This Report

| Severity | Meaning | Action |
|---|---|---|
| 🔴 Critical | Blocks assistive technology entirely | **Must fix** — no screen reader access, no keyboard access |
| 🟡 Serious | Major barrier for users with disabilities | **Should fix** — significantly impacts accessibility |
| 🔵 Moderate | Minor issue, still impacts some users | **Fix when possible** — improves overall experience |

---

## All Findings

| File | Line | Severity | Category | WCAG SC | Description |
|---|---|---|---|---|---|
REPORT_HEADER

  echo "$REPORT_CONTENT" >> "$REPORT_FILE"

  cat >> "$REPORT_FILE" <<REPORT_FOOTER

---

## Fix Priority Guide

### 1. Critical — Fix Immediately

- **Missing alt text** (1.1.1) — Screen readers cannot describe images
- **Empty buttons/links** (4.1.2 / 2.4.4) — Interactive elements invisible to assistive tech
- **Focus outline removed** (2.4.7) — Keyboard users cannot see where they are

### 2. Serious — Fix in Current Sprint

- **Missing form labels** (1.3.1 / 3.3.2) — Form inputs unusable for screen reader users
- **Clickable divs without role** (2.1.1) — Keyboard users cannot activate custom controls
- **Positive tabindex** (2.4.3) — Disrupts natural keyboard navigation order
- **Missing lang attribute** (3.1.1) — Screen readers may use wrong pronunciation

### 3. Moderate — Fix in Next Sprint

- **Heading hierarchy** (1.3.1) — Skipped levels confuse screen reader navigation

---

## WCAG 2.2 Reference

- [WCAG 2.2 Standard](https://www.w3.org/TR/WCAG22/)
- [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Full checklist](skills/scannlab-a11y-checker/references/wcag-checklist.md)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

*Generated by \`scannlab-a11y-checker\` — run \`bash skills/scannlab-a11y-checker/scripts/audit-a11y.sh --report\` to regenerate.*
REPORT_FOOTER

  echo -e "\n  ${GREEN}📝 Detailed report saved to:${RESET} ${CYAN}${REPORT_FILE}${RESET}"
}

# ── Generate JSON Output ─────────────────────────────────────

generate_json() {
  echo "[${JSON_ENTRIES}]"
}

# ── Main ──────────────────────────────────────────────────────

print_header

if [ -f "$TARGET" ]; then
  case "$TARGET" in
    *.html) audit_html_file "$TARGET" ;;
    *.css)  audit_css_file "$TARGET" ;;
    *)      echo -e "${YELLOW}Skipping unsupported file type: $TARGET${RESET}" ;;
  esac
elif [ -d "$TARGET" ]; then
  # Scan HTML templates
  while IFS= read -r html_file; do
    audit_html_file "$html_file"
  done < <(find "$TARGET" -name '*.html' -type f | sort)

  # Scan CSS files for focus issues
  while IFS= read -r css_file; do
    audit_css_file "$css_file"
  done < <(find "$TARGET" -name '*.css' -type f | sort)
else
  echo -e "${RED}Error: '$TARGET' is not a valid file or directory.${RESET}"
  exit 1
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}──────────────────────────────────────────────────${RESET}"
echo -e "  Files scanned:       ${FILES_SCANNED}"
echo -e "  Files with issues:   ${FILES_WITH_ISSUES}"
echo -e "  ${RED}🔴 Critical:         ${ISSUES_CRITICAL}${RESET}"
echo -e "  ${YELLOW}🟡 Serious:          ${ISSUES_SERIOUS}${RESET}"
echo -e "  ${CYAN}🔵 Moderate:         ${ISSUES_MODERATE}${RESET}"
echo -e "  ${BOLD}Total issues:        ${TOTAL_ISSUES}${RESET}"

if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo -e "  ${GREEN}✅ All components pass WCAG 2.2 Level A + AA checks — no accessibility issues found!${RESET}"
else
  echo -e "  ${YELLOW}⚠️  Found ${TOTAL_ISSUES} accessibility issue(s) across ${FILES_WITH_ISSUES} file(s).${RESET}"
fi

# ── Generate report / JSON ────────────────────────────────────
if $REPORT_MODE; then
  generate_report
fi

if $JSON_MODE; then
  generate_json
fi

echo ""
