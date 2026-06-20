#!/bin/sh
set -eu

run_security_check() {
  if [ -f "pnpm-lock.yaml" ] && command -v pnpm >/dev/null 2>&1; then
    pnpm run -s security:check
    return
  fi

  if [ -f "yarn.lock" ] && command -v yarn >/dev/null 2>&1; then
    yarn -s security:check
    return
  fi

  if [ -f "package.json" ] && command -v npm >/dev/null 2>&1; then
    npm run --silent security:check
    return
  fi

  if [ -f "scripts/security-check.mjs" ] && command -v node >/dev/null 2>&1; then
    node scripts/security-check.mjs
    return
  fi

  echo "[project-security] no security check command available." >&2
  return 1
}

run_dependency_security_check() {
  if [ -f "pnpm-lock.yaml" ] && command -v pnpm >/dev/null 2>&1; then
    if pnpm run -s security:deps >/dev/null 2>&1; then
      pnpm run -s security:deps
      return
    fi
  fi

  if [ -f "yarn.lock" ] && command -v yarn >/dev/null 2>&1; then
    if yarn -s security:deps >/dev/null 2>&1; then
      yarn -s security:deps
      return
    fi
  fi

  if [ -f "package.json" ] && command -v npm >/dev/null 2>&1; then
    if npm run --silent security:deps >/dev/null 2>&1; then
      npm run --silent security:deps
      return
    fi
  fi

  if [ -f "scripts/dependency-security-check.mjs" ] && command -v node >/dev/null 2>&1; then
    node scripts/dependency-security-check.mjs --strict
    return
  fi
}

run_security_gates() {
  run_security_check
  run_dependency_security_check
}
