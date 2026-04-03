#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# ScannLab Token Audit — find hard-coded values in component CSS
# Usage:
#   bash scripts/audit-tokens.sh [options] [file|dir]
#
# Options:
#   --report     Generate a detailed Markdown report (token-audit-report.md)
#   --json       Output findings as JSON (for CI integration)
#
# Default: scans all CSS under projects/scanntech-ui/src/components/
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
ISSUES_HIGH=0
ISSUES_MEDIUM=0

REPORT_MODE=false
JSON_MODE=false
TARGET=""
REPORT_FILE="$ROOT/token-audit-report.md"
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

# ── Token Map — maps raw values → exact tokens ───────────────

map_font_weight() {
  case "$1" in
    300) echo "--s-font-weight-light" ;;
    400) echo "--s-font-weight-regular" ;;
    600) echo "--s-font-weight-semibold" ;;
    *)   echo "--s-font-weight-*" ;;
  esac
}

map_font_size() {
  case "$1" in
    12px|0.75rem)   echo "--s-font-size-sm" ;;
    14px|0.875rem)  echo "--s-font-size-md" ;;
    16px|1rem)      echo "--s-font-size-lg" ;;
    18px|1.125rem)  echo "--s-font-size-h5" ;;
    20px|1.25rem)   echo "--s-font-size-h4" ;;
    24px|1.5rem)    echo "--s-font-size-h3" ;;
    28px|1.75rem)   echo "--s-font-size-h2" ;;
    32px|2rem)      echo "--s-font-size-h1" ;;
    *)              echo "--s-font-size-*" ;;
  esac
}

map_radius() {
  local val="$1"
  case "$val" in
    4px)   echo "--s-radius-sm" ;;
    8px)   echo "--s-radius-md" ;;
    12px)  echo "--s-radius-lg" ;;
    16px)  echo "--s-radius-xl" ;;
    20px)  echo "--s-radius-2xl" ;;
    24px)  echo "--s-radius-3xl" ;;
    28px)  echo "--s-radius-4xl" ;;
    32px)  echo "--s-radius-5xl" ;;
    50%|100%|9999999px) echo "--s-radius-full" ;;
    *)     echo "--s-radius-*" ;;
  esac
}

map_spacing() {
  case "$1" in
    2px)   echo "--s-spacing-5xs" ;;
    4px)   echo "--s-spacing-4xs" ;;
    8px)   echo "--s-spacing-3xs" ;;
    12px)  echo "--s-spacing-2xs" ;;
    16px)  echo "--s-spacing-xs" ;;
    20px)  echo "--s-spacing-s" ;;
    24px)  echo "--s-spacing-m" ;;
    28px)  echo "--s-spacing-l" ;;
    32px)  echo "--s-spacing-xl" ;;
    36px)  echo "--s-spacing-2xl" ;;
    40px)  echo "--s-spacing-3xl" ;;
    44px)  echo "--s-spacing-4xl" ;;
    48px)  echo "--s-spacing-5xl" ;;
    *)     echo "--s-spacing-*" ;;
  esac
}

map_border_width() {
  case "$1" in
    1px) echo "--s-border-width-sm" ;;
    2px) echo "--s-border-width-md" ;;
    4px) echo "--s-border-width-lg" ;;
    *)   echo "--s-border-width-*" ;;
  esac
}

map_line_height() {
  case "$1" in
    1.67)  echo "--s-line-height-sm" ;;
    1.71)  echo "--s-line-height-md" ;;
    1.5)   echo "--s-line-height-lg" ;;
    *)     echo "--s-line-height-*" ;;
  esac
}

# ── Helpers ───────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BOLD}══════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD}  ScannLab Token Audit${RESET}"
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
  local severity="$4"    # high, medium, low
  local lineno="$5"
  local raw_line="$6"
  local raw_value="$7"
  local suggested_token="$8"
  local suggested_fix="$9"

  # Console output
  local color_code=""
  local sev_label=""
  case "$severity" in
    high)   color_code="$RED";    sev_label="🔴"; ISSUES_HIGH=$((ISSUES_HIGH + 1)) ;;
    medium) color_code="$YELLOW"; sev_label="🟡"; ISSUES_MEDIUM=$((ISSUES_MEDIUM + 1)) ;;
  esac

  printf "  ${color_code}%-9s${RESET} line %-4s %s\n" "$category" "$lineno:" "$raw_line"
  if [ -n "$suggested_fix" ]; then
    echo -e "             ${DIM}before:${RESET} ${RED}${raw_line}${RESET}"
    echo -e "             ${DIM}after: ${RESET} ${GREEN}${suggested_fix}${RESET}"
  else
    echo -e "             → Replace with ${GREEN}var(${suggested_token})${RESET}"
  fi

  # Report output
  if $REPORT_MODE; then
    local sev_upper
    sev_upper="$(echo "$severity" | tr '[:lower:]' '[:upper:]' | cut -c1)$(echo "$severity" | cut -c2-)"
    REPORT_CONTENT+="| \`${relative_path}\` | ${lineno} | ${sev_label} ${sev_upper} | \`${category}\` | \`${raw_value}\` | \`var(${suggested_token})\` |"$'\n'
  fi

  # JSON output
  if $JSON_MODE; then
    [ -n "$JSON_ENTRIES" ] && JSON_ENTRIES+=","
    JSON_ENTRIES+="{\"file\":\"${relative_path}\",\"line\":${lineno},\"severity\":\"${severity}\",\"category\":\"${category}\",\"value\":\"${raw_value}\",\"token\":\"${suggested_token}\"}"
  fi
}

# ── Audit a single file ──────────────────────────────────────

audit_file() {
  local file="$1"
  local relative_path="${file#$ROOT/}"
  local file_issues=0
  local file_findings=""

  FILES_SCANNED=$((FILES_SCANNED + 1))

  # ── 1. Hard-coded colors ─────────────────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue
    [[ "$line" =~ ^[[:space:]]\* ]] && continue
    echo "$line" | grep -qE 'var\(--' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local raw_val
    raw_val="$(echo "$trimmed" | grep -oE '#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)' | head -1)"

    # Try to generate a fix line
    local fix=""
    if echo "$trimmed" | grep -q 'box-shadow'; then
      fix="$(echo "$trimmed" | sed 's/box-shadow:.*/box-shadow: var(--s-elevation-1);/')"
    elif echo "$trimmed" | grep -qE 'background(-color)?:'; then
      fix="$(echo "$trimmed" | sed -E "s/(background(-color)?:).*/\1 var(--s-color-surface-1);/")"
    elif echo "$trimmed" | grep -q 'color:'; then
      fix="$(echo "$trimmed" | sed 's/color:.*/color: var(--s-color-body-primary);/')"
    fi

    record_finding "$file" "$relative_path" "COLOR" "high" "$lineno" "$trimmed" "$raw_val" "--s-color-*" "$fix"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E '#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)' "$file" 2>/dev/null || true)

  # ── 2. Hard-coded box-shadow ─────────────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue
    [[ "$line" =~ ^[[:space:]]\* ]] && continue
    echo "$line" | grep -qE 'var\(--s-elevation' && continue
    echo "$line" | grep -q 'box-shadow:\s*none' && continue
    # Skip if it was already flagged as COLOR
    echo "$line" | grep -qE 'rgba?\(|hsla?\(' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local fix
    fix="$(echo "$trimmed" | sed 's/box-shadow:.*/box-shadow: var(--s-elevation-1);/')"

    record_finding "$file" "$relative_path" "ELEVATION" "high" "$lineno" "$trimmed" "inline box-shadow" "--s-elevation-*" "$fix"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E 'box-shadow:' "$file" 2>/dev/null | grep -v 'var(--' | grep -v 'none' || true)

  # ── 3. Hard-coded padding/margin/gap ─────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue
    [[ "$line" =~ ^[[:space:]]\* ]] && continue
    echo "$line" | grep -qE 'var\(--' && continue
    echo "$line" | grep -qE '(padding|margin|gap):\s*0\b' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local raw_val
    raw_val="$(echo "$trimmed" | grep -oE '[0-9]+(px|rem)' | head -1)"
    local token
    token="$(map_spacing "${raw_val:-unknown}")"
    local fix
    # Detect property type
    if echo "$trimmed" | grep -q 'padding'; then
      fix="$(echo "$trimmed" | sed "s/padding:.*/padding: var(${token});/")"
    elif echo "$trimmed" | grep -q 'margin'; then
      fix="$(echo "$trimmed" | sed "s/margin:.*/margin: var(${token});/")"
    elif echo "$trimmed" | grep -q 'gap'; then
      fix="$(echo "$trimmed" | sed "s/gap:.*/gap: var(${token});/")"
    fi

    record_finding "$file" "$relative_path" "SPACING" "high" "$lineno" "$trimmed" "$raw_val" "$token" "$fix"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E '(padding|margin|gap|column-gap|row-gap):\s*[0-9]' "$file" 2>/dev/null || true)

  # ── 4. Hard-coded border-radius ──────────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue
    echo "$line" | grep -qE 'var\(--' && continue
    echo "$line" | grep -qE 'border-radius:\s*0\b' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local raw_val
    raw_val="$(echo "$trimmed" | grep -oE '[0-9]+px|[0-9]+%' | head -1)"
    local token
    token="$(map_radius "${raw_val:-unknown}")"
    local fix
    fix="border-radius: var(${token});"

    record_finding "$file" "$relative_path" "RADIUS" "medium" "$lineno" "$trimmed" "$raw_val" "$token" "$fix"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E 'border-radius:\s*[0-9]' "$file" 2>/dev/null || true)

  # ── 5. Hard-coded font-size ──────────────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue
    echo "$line" | grep -qE 'var\(--' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local raw_val
    raw_val="$(echo "$trimmed" | grep -oE '[0-9]+(\.[0-9]+)?(px|rem)' | head -1)"
    local token
    token="$(map_font_size "${raw_val:-unknown}")"
    local fix
    fix="font-size: var(${token});"

    record_finding "$file" "$relative_path" "FONT-SIZE" "medium" "$lineno" "$trimmed" "$raw_val" "$token" "$fix"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E 'font-size:\s*[0-9]' "$file" 2>/dev/null || true)

  # ── 6. Hard-coded font-weight ────────────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue
    echo "$line" | grep -qE 'var\(--' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local raw_val
    raw_val="$(echo "$trimmed" | grep -oE '[0-9]+' | head -1)"
    local token
    token="$(map_font_weight "$raw_val")"
    local fix
    fix="font-weight: var(${token});"

    record_finding "$file" "$relative_path" "FONT-WT" "medium" "$lineno" "$trimmed" "$raw_val" "$token" "$fix"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E 'font-weight:\s*[0-9]' "$file" 2>/dev/null || true)

  # ── 7. Hard-coded line-height ────────────────────────────
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue
    echo "$line" | grep -qE 'var\(--' && continue
    echo "$line" | grep -qE 'line-height:\s*normal' && continue

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    local raw_val
    raw_val="$(echo "$trimmed" | grep -oE '[0-9]+(\.[0-9]+)?(px|rem)?' | head -1)"
    local token
    token="$(map_line_height "${raw_val:-unknown}")"
    local fix
    fix="line-height: var(${token});"

    record_finding "$file" "$relative_path" "LINE-HT" "medium" "$lineno" "$trimmed" "$raw_val" "$token" "$fix"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E 'line-height:\s*[0-9]' "$file" 2>/dev/null || true)

  # NOTE: height/width are NOT audited — fixed dimensions are expected
  # hard-coded specs. Spacing tokens (--s-spacing-*, --s-layout-*) are
  # only for gaps, paddings, and margins.

  # ── Print file header ───────────────────────────────────
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
# ScannLab Token Audit Report

**Generated:** ${date_str}
**Target:** \`${TARGET#$ROOT/}\`

---

## Summary

| Metric | Count |
|---|---|
| Files scanned | ${FILES_SCANNED} |
| Files with issues | ${FILES_WITH_ISSUES} |
| 🔴 High severity | ${ISSUES_HIGH} |
| 🟡 Medium severity | ${ISSUES_MEDIUM} |
| **Total issues** | **${TOTAL_ISSUES}** |

---

## How to Read This Report

| Severity | Meaning | Action |
|---|---|---|
| 🔴 High | Hard-coded colors or inline box-shadows | **Must fix** — replace with semantic color/elevation token |
| 🟡 Medium | Hard-coded typography or border-radius | **Should fix** — replace with typography/radius token |

> **Note:** Fixed \`height\` and \`width\` values are **not** flagged — they are expected hard-coded specs. Spacing tokens (\`--s-spacing-*\`, \`--s-layout-*\`) are only for gaps, paddings, and margins.

---

## All Findings

| File | Line | Severity | Category | Raw Value | Suggested Token |
|---|---|---|---|---|---|
REPORT_HEADER

  echo "$REPORT_CONTENT" >> "$REPORT_FILE"

  cat >> "$REPORT_FILE" <<REPORT_FOOTER

---

## Recommended Fix Priority

### 1. High Severity — Fix Immediately

Hard-coded colors (\`#hex\`, \`rgb()\`, \`rgba()\`) and inline \`box-shadow\` values break theming and
make global color changes impossible. These should be replaced with semantic tokens:

- **Colors** → \`var(--s-color-*)\` (see [semanticos.mdx](projects/scanntech-ui/src/docs/tokens/semanticos.mdx))
- **Elevations** → \`var(--s-elevation-1|2|3)\` (see [elevations.mdx](projects/scanntech-ui/src/docs/tokens/elevations.mdx))

### 2. Medium Severity — Fix in Next Sprint

Hard-coded typography and border-radius values make the system inconsistent:

- **Font size** → \`var(--s-font-size-sm|md|lg|h1-h6)\`
- **Font weight** → \`var(--s-font-weight-light|regular|semibold)\`
- **Line height** → \`var(--s-line-height-sm|md|lg|h1-h6)\`
- **Border radius** → \`var(--s-radius-sm|md|lg|xl|full)\`


---

## Token Reference

For the full mapping of raw values → tokens, see:
- [token-map.md](skills/scannlab-token-validation/references/token-map.md)
- [Token documentation](projects/scanntech-ui/src/docs/tokens/)

---

*Generated by \`scannlab-token-validation\` — run \`bash skills/scannlab-token-validation/scripts/audit-tokens.sh --report\` to regenerate.*
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
  audit_file "$TARGET"
elif [ -d "$TARGET" ]; then
  while IFS= read -r css_file; do
    audit_file "$css_file"
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
echo -e "  ${RED}🔴 High severity:    ${ISSUES_HIGH}${RESET}"
echo -e "  ${YELLOW}🟡 Medium severity:  ${ISSUES_MEDIUM}${RESET}"
echo -e "  ${BOLD}Total issues:        ${TOTAL_ISSUES}${RESET}"

if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo -e "  ${GREEN}✅ All components use design tokens — no hard-coded values found!${RESET}"
else
  echo -e "  ${YELLOW}⚠️  Found ${TOTAL_ISSUES} hard-coded value(s) across ${FILES_WITH_ISSUES} file(s).${RESET}"
fi

# ── Generate report / JSON ────────────────────────────────────
if $REPORT_MODE; then
  generate_report
fi

if $JSON_MODE; then
  generate_json
fi

echo ""
