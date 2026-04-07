#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=/dev/null
. "$script_dir/run-security-check.shared.sh"

run_optional_supply_chain_check() {
  if [ -f "pnpm-lock.yaml" ] && command -v pnpm >/dev/null 2>&1; then
    if ! pnpm audit --prod; then
      echo "[project-security] pnpm audit reported issues." >&2
      return 1
    fi
    return 0
  fi

  if [ -f "yarn.lock" ] && command -v yarn >/dev/null 2>&1; then
    if ! yarn npm audit; then
      echo "[project-security] yarn audit reported issues." >&2
      return 1
    fi
    return 0
  fi

  if [ -f "package-lock.json" ] && command -v npm >/dev/null 2>&1; then
    if ! npm audit --audit-level=high; then
      echo "[project-security] npm audit reported issues." >&2
      return 1
    fi
    return 0
  fi

  return 0
}

echo "[project-security] running push gate..."
run_security_check
run_optional_supply_chain_check
