#!/usr/bin/env bash
# Portable accessibility audit helper aligned to WCAG 2.2 Level AA (W3C)
# Sources:
# - https://www.w3.org/WAI/standards-guidelines/wcag/
# - https://www.w3.org/TR/WCAG22/
# - https://www.w3.org/WAI/WCAG22/quickref/

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

REPORT_MODE=false
JSON_MODE=false
TARGET=""
ROOT="$(pwd)"
REPORT_FILE="$ROOT/a11y-audit-report.md"
REPORT_CONTENT=""
JSON_ENTRIES=""

FILES_SCANNED=0
FILES_WITH_ISSUES=0
TOTAL_ISSUES=0
ISSUES_CRITICAL=0
ISSUES_SERIOUS=0
ISSUES_MODERATE=0

usage() {
  cat <<USAGE
Usage:
  bash catalog/skills/accessibility-audit/scripts/audit-a11y.sh [options] [path]

Options:
  --report     Write markdown report to ./a11y-audit-report.md
  --json       Emit JSON findings to stdout
  --help       Show this help

Default path:
  current directory
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --report) REPORT_MODE=true; shift ;;
    --json) JSON_MODE=true; shift ;;
    --help|-h) usage; exit 0 ;;
    *) TARGET="$1"; shift ;;
  esac
done

TARGET="${TARGET:-.}"

if [[ ! -e "$TARGET" ]]; then
  echo "Target does not exist: $TARGET" >&2
  exit 1
fi

json_escape() {
  echo "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g; s/\r/\\r/g; s/\n/\\n/g'
}

record_finding() {
  local file="$1"
  local relative_path="$2"
  local category="$3"
  local severity="$4"
  local wcag_sc="$5"
  local lineno="$6"
  local raw_line="$7"
  local message="$8"

  local color_code=""
  local label=""

  case "$severity" in
    critical) color_code="$RED"; label="CRITICAL"; ISSUES_CRITICAL=$((ISSUES_CRITICAL + 1)) ;;
    serious) color_code="$YELLOW"; label="SERIOUS"; ISSUES_SERIOUS=$((ISSUES_SERIOUS + 1)) ;;
    moderate) color_code="$CYAN"; label="MODERATE"; ISSUES_MODERATE=$((ISSUES_MODERATE + 1)) ;;
  esac

  if ! $JSON_MODE; then
    printf "  ${color_code}%-14s${RESET} [${DIM}%s${RESET}] line %-4s %s\n" "$category" "$wcag_sc" "$lineno:" "$message"
    echo -e "             ${DIM}->${RESET} $raw_line"
  fi

  if $REPORT_MODE; then
    REPORT_CONTENT+="| \`${relative_path}\` | ${lineno} | ${label} | \`${category}\` | ${wcag_sc} | ${message} |"$'\n'
  fi

  if $JSON_MODE; then
    [[ -n "$JSON_ENTRIES" ]] && JSON_ENTRIES+=","
    JSON_ENTRIES+="{\"file\":\"$(json_escape "$relative_path")\",\"line\":${lineno},\"severity\":\"${severity}\",\"category\":\"$(json_escape "$category")\",\"wcag\":\"$(json_escape "$wcag_sc")\",\"message\":\"$(json_escape "$message")\",\"code\":\"$(json_escape "$raw_line")\"}"
  fi
}

audit_markup_file() {
  local file="$1"
  local relative_path="${file#$ROOT/}"
  local file_issues=0

  FILES_SCANNED=$((FILES_SCANNED + 1))

  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    record_finding "$file" "$relative_path" "MISSING-ALT" "critical" "1.1.1" "$lineno" "$trimmed" "Image is missing alt attribute"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E '<img[[:space:]]' "$file" 2>/dev/null | grep -v -E 'alt=' || true)

  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'aria-label|aria-labelledby|title=' && continue
    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    if echo "$trimmed" | grep -qE '<button[^>]*>[[:space:]]*</button>' || echo "$trimmed" | grep -qE '<button[^>]*/>'; then
      record_finding "$file" "$relative_path" "EMPTY-BUTTON" "critical" "4.1.2" "$lineno" "$trimmed" "Button has no text or accessible name"
      file_issues=$((file_issues + 1))
    fi
  done < <(grep -n -E '<button' "$file" 2>/dev/null || true)

  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'aria-label|aria-labelledby|title=' && continue
    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    if echo "$trimmed" | grep -qE '<a[^>]*>[[:space:]]*</a>'; then
      record_finding "$file" "$relative_path" "EMPTY-LINK" "critical" "2.4.4" "$lineno" "$trimmed" "Link has no text or accessible name"
      file_issues=$((file_issues + 1))
    fi
  done < <(grep -n -E '<a[[:space:]]' "$file" 2>/dev/null || true)

  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'aria-label|aria-labelledby' && continue
    echo "$line" | grep -qE 'type="hidden"|type="submit"|type="button"' && continue

    local has_label=false
    if echo "$line" | grep -qE 'id="[^"]+"'; then
      local input_id
      input_id="$(echo "$line" | sed -n 's/.*id="\([^"]*\)".*/\1/p' | head -1)"
      if [[ -n "$input_id" ]] && grep -qE "for=\"${input_id}\"" "$file" 2>/dev/null; then
        has_label=true
      fi
    fi

    if [[ "$has_label" == "false" ]]; then
      local trimmed
      trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
      record_finding "$file" "$relative_path" "MISSING-LABEL" "serious" "1.3.1/3.3.2" "$lineno" "$trimmed" "Form control missing label association or ARIA naming"
      file_issues=$((file_issues + 1))
    fi
  done < <(grep -n -E '<(input|select|textarea)[[:space:]]' "$file" 2>/dev/null || true)

  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    echo "$line" | grep -qE 'role=|tabindex=' && continue
    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    record_finding "$file" "$relative_path" "CLICK-NO-ROLE" "serious" "2.1.1" "$lineno" "$trimmed" "Non-semantic clickable element needs keyboard and role semantics"
    file_issues=$((file_issues + 1))
  done < <(grep -n -E '<(div|span|li)[^>]*((onclick=)|(\(click\)))' "$file" 2>/dev/null || true)

  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    local tab_val
    tab_val="$(echo "$line" | grep -oE 'tabindex="[0-9]+"' | grep -oE '[0-9]+' | head -1)"
    if [[ -n "$tab_val" ]] && [[ "$tab_val" -gt 0 ]]; then
      local trimmed
      trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
      record_finding "$file" "$relative_path" "TABINDEX-POS" "serious" "2.4.3" "$lineno" "$trimmed" "Positive tabindex can break logical focus order"
      file_issues=$((file_issues + 1))
    fi
  done < <(grep -n -E 'tabindex="[1-9]' "$file" 2>/dev/null || true)

  local prev_level=0
  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*\<\!-- ]] && continue
    local level
    level="$(echo "$line" | grep -oE '<h[1-6]' | grep -oE '[1-6]' | head -1)"
    [[ -z "$level" ]] && continue

    if [[ "$prev_level" -gt 0 ]] && [[ "$level" -gt $((prev_level + 1)) ]]; then
      local trimmed
      trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
      record_finding "$file" "$relative_path" "HEADING-SKIP" "moderate" "1.3.1" "$lineno" "$trimmed" "Heading level skipped"
      file_issues=$((file_issues + 1))
    fi

    prev_level="$level"
  done < <(grep -n -E '<h[1-6]' "$file" 2>/dev/null || true)

  if grep -qE '<html[[:space:]]' "$file" 2>/dev/null; then
    if ! grep -qE '<html[^>]*lang=' "$file" 2>/dev/null; then
      local lineno
      lineno="$(grep -n -E '<html' "$file" | head -1 | cut -d: -f1)"
      local trimmed
      trimmed="$(grep -E '<html' "$file" | head -1 | sed 's/^[[:space:]]*//')"
      record_finding "$file" "$relative_path" "MISSING-LANG" "serious" "3.1.1" "$lineno" "$trimmed" "Missing language declaration on html element"
      file_issues=$((file_issues + 1))
    fi
  fi

  if [[ "$file_issues" -gt 0 ]]; then
    FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
    TOTAL_ISSUES=$((TOTAL_ISSUES + file_issues))
    if ! $JSON_MODE; then
      echo -e "\n${BOLD}${relative_path}${RESET} - ${RED}${file_issues} issue(s)${RESET}"
    fi
  fi
}

audit_style_file() {
  local file="$1"
  local relative_path="${file#$ROOT/}"
  local file_issues=0

  FILES_SCANNED=$((FILES_SCANNED + 1))

  while IFS=: read -r lineno line; do
    [[ "$line" =~ ^[[:space:]]*/\* ]] && continue

    local context_start=$((lineno > 4 ? lineno - 4 : 1))
    local context_end=$((lineno + 8))
    if sed -n "${context_start},${context_end}p" "$file" 2>/dev/null | grep -qE 'focus-visible'; then
      continue
    fi

    local trimmed
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//')"
    record_finding "$file" "$relative_path" "FOCUS-REMOVED" "critical" "2.4.7" "$lineno" "$trimmed" "Focus outline removed without visible focus-visible replacement"
    file_issues=$((file_issues + 1))
  done < <(
    grep -n -E ':focus[[:space:]]*\{' "$file" 2>/dev/null | while IFS=: read -r ln _; do
      local end=$((ln + 5))
      if sed -n "${ln},${end}p" "$file" 2>/dev/null | grep -qE 'outline:[[:space:]]*(none|0)'; then
        echo "${ln}:focus"
      fi
    done || true
  )

  if [[ "$file_issues" -gt 0 ]]; then
    FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
    TOTAL_ISSUES=$((TOTAL_ISSUES + file_issues))
    if ! $JSON_MODE; then
      echo -e "\n${BOLD}${relative_path}${RESET} - ${RED}${file_issues} issue(s)${RESET}"
    fi
  fi
}

generate_report() {
  local generated_at
  generated_at="$(date '+%Y-%m-%d %H:%M:%S')"

  cat > "$REPORT_FILE" <<REPORT_HEAD
# Accessibility Audit Report (WCAG 2.2 Level AA)

Generated: ${generated_at}
Target: \`${TARGET}\`

## Summary

| Metric | Count |
| --- | --- |
| Files scanned | ${FILES_SCANNED} |
| Files with issues | ${FILES_WITH_ISSUES} |
| Critical | ${ISSUES_CRITICAL} |
| Serious | ${ISSUES_SERIOUS} |
| Moderate | ${ISSUES_MODERATE} |
| Total issues | ${TOTAL_ISSUES} |

## Findings

| File | Line | Severity | Category | WCAG SC | Description |
| --- | --- | --- | --- | --- | --- |
REPORT_HEAD

  echo "$REPORT_CONTENT" >> "$REPORT_FILE"

  cat >> "$REPORT_FILE" <<REPORT_TAIL

## Source References (W3C)

- https://www.w3.org/WAI/standards-guidelines/wcag/
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/quickref/
- https://www.w3.org/WAI/WCAG22/Understanding/
- https://www.w3.org/developers/tools/
REPORT_TAIL
}

if ! $JSON_MODE; then
  echo -e "${BOLD}WCAG 2.2 Level AA accessibility audit${RESET}"
  echo -e "Target: ${CYAN}${TARGET}${RESET}"
fi

MARKUP_FILES=()
STYLE_FILES=()

if [[ -f "$TARGET" ]]; then
  case "$TARGET" in
    *.html|*.htm|*.xhtml|*.jsx|*.tsx) MARKUP_FILES+=("$TARGET") ;;
    *.css|*.scss|*.sass|*.less) STYLE_FILES+=("$TARGET") ;;
  esac
else
  while IFS= read -r f; do MARKUP_FILES+=("$f"); done < <(
    find "$TARGET" -type f \( -name "*.html" -o -name "*.htm" -o -name "*.xhtml" -o -name "*.jsx" -o -name "*.tsx" \) \
      -not -path "*/node_modules/*" \
      -not -path "*/.git/*" \
      -not -path "*/dist/*" \
      -not -path "*/build/*" \
      -not -path "*/coverage/*" \
      -not -path "*/.next/*" \
      -not -path "*/storybook-static/*" \
      | sort
  )

  while IFS= read -r f; do STYLE_FILES+=("$f"); done < <(
    find "$TARGET" -type f \( -name "*.css" -o -name "*.scss" -o -name "*.sass" -o -name "*.less" \) \
      -not -path "*/node_modules/*" \
      -not -path "*/.git/*" \
      -not -path "*/dist/*" \
      -not -path "*/build/*" \
      -not -path "*/coverage/*" \
      -not -path "*/.next/*" \
      -not -path "*/storybook-static/*" \
      | sort
  )
fi

for file in "${MARKUP_FILES[@]:-}"; do
  [[ -n "$file" ]] && audit_markup_file "$file"
done

for file in "${STYLE_FILES[@]:-}"; do
  [[ -n "$file" ]] && audit_style_file "$file"
done

if $REPORT_MODE; then
  generate_report
fi

if $JSON_MODE; then
  cat <<JSON
{"standard":"WCAG 2.2 Level AA","target":"$(json_escape "$TARGET")","summary":{"filesScanned":${FILES_SCANNED},"filesWithIssues":${FILES_WITH_ISSUES},"critical":${ISSUES_CRITICAL},"serious":${ISSUES_SERIOUS},"moderate":${ISSUES_MODERATE},"total":${TOTAL_ISSUES}},"findings":[${JSON_ENTRIES}]}
JSON
else
  echo ""
  echo -e "${BOLD}Summary${RESET}"
  echo "Files scanned:      $FILES_SCANNED"
  echo "Files with issues:  $FILES_WITH_ISSUES"
  echo "Critical:           $ISSUES_CRITICAL"
  echo "Serious:            $ISSUES_SERIOUS"
  echo "Moderate:           $ISSUES_MODERATE"
  echo "Total:              $TOTAL_ISSUES"
  if $REPORT_MODE; then
    echo "Report:             $REPORT_FILE"
  fi
  if [[ "$TOTAL_ISSUES" -eq 0 ]]; then
    echo -e "${GREEN}No issues found by this heuristic scanner.${RESET}"
  fi
fi

if [[ "$TOTAL_ISSUES" -gt 0 ]]; then
  exit 1
fi
