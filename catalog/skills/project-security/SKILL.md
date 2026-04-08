---
description: "Scan project configuration and release surfaces for leak and security risks, and enforce security gates on commit, push, and publish workflows across GitHub, GitLab, npm, pnpm, yarn, and generic CI. Trigger: validating repository security posture, preventing secret leaks, or hardening delivery pipelines."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-04-07"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Added portable project-security skill with commit/push/publish gating assets and CI templates; reduces secret leak and misconfiguration risk before delivery; affects catalog security workflow coverage and auto-invoke routing"
  auto-invoke: "Scanning project configuration and delivery workflows for leaks or security issues before commit, push, or publish"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "Task"
    - "SubAgent"
---
# Project Security Guide

## When to Use

Use this skill when:

- You need to prevent secret leaks or insecure config from entering source control.
- You are preparing to commit, push, or publish and want enforced security gates.
- You need portable security checks across npm, pnpm, yarn, GitHub, GitLab, or generic CI.
- You are reviewing repository settings, package metadata, lockfiles, and workflow files for risk.

Do not use this skill for:

- Runtime penetration testing of deployed environments.
- Cloud infrastructure hardening outside the repository scope.
- Compliance audits that require organization-specific legal controls beyond repository security.

---

## Critical Patterns

### Pattern 1: Scan High-Risk Repository Surfaces First

Prioritize files that most often leak credentials or unsafe release behavior:

1. Local config and env surfaces (`.env*`, settings files, tool config, secrets material).
2. Package and release metadata (`package.json`, lockfiles, publish config, scripts).
3. Ignore and policy boundaries (`.gitignore`, `.npmignore`, allow/deny lists).
4. CI/CD workflows (`.github/workflows`, `.gitlab-ci.yml`, release jobs).

Use the baseline checklist in [assets/high-risk-files-checklist.md](assets/high-risk-files-checklist.md).

### Pattern 2: Enforce Gates by Delivery Stage

Use increasing guardrails by stage:

- **Commit gate**: fast checks for hardcoded secrets, committed env files, and critical ignore hygiene.
- **Push gate**: commit gate plus supply-chain and workflow safety checks.
- **Publish gate**: push gate plus release-surface validation (publish scripts/config and package contents).

### Pattern 3: Block on High-Risk by Default

- **Blocker (fail immediately)** examples: confirmed secrets, private keys, tracked `.env` files, unsafe publish exposure.
- **Warning (non-blocking)** examples: low-confidence token patterns, optional hardening gaps, advisory-only dependency alerts.

Default policy:

1. Exit non-zero for blockers.
2. Treat dependency-audit failures as blocking by default in push and CI gates.
3. Do not provide warning-mode bypasses for dependency audit failures in enforced gates.

### Pattern 4: Keep Gate Execution Deterministic

- Do not use dynamic command override execution for core gate logic.
- Resolve commands in a fixed order only: `pnpm` -> `yarn` -> `npm` -> `node scripts/security-check.mjs`.
- Fail closed when no valid runner or lockfile path is available.
- Do not include bypass environment flags for enforced gates.

### Pattern 5: Stay Package-Manager and CI Agnostic

Always provide equivalent paths for npm, pnpm, yarn, and generic shell runners.

- Do not assume one package manager.
- Detect lockfiles and use the matching command path when possible.
- Keep templates portable and adapter-based.

---

## Decision Tree

```text
Need checks before local commits?                    -> Install pre-commit gate template
Need checks before remote integration?               -> Install pre-push gate template
Need checks before package release/publication?      -> Install pre-publish gate and CI release gate
Single-platform pipeline only?                       -> Use platform adapter (GitHub or GitLab)
Multiple platforms or uncertain tooling?             -> Use generic gate script + adapter wrappers
Otherwise                                            -> Apply all three gates (commit, push, publish)
```

---

## Code Examples

### Example 1: Security Check Script in `package.json`

```json
{
  "scripts": {
    "security:check": "node scripts/security-check.mjs"
  }
}
```

### Example 2: Commit Gate Wiring (Git Hook)

```sh
cp catalog/skills/project-security/assets/pre-commit.sample.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Example 3: Publish Gate Wiring (Package Script)

```json
{
  "scripts": {
    "prepublishOnly": "sh catalog/skills/project-security/assets/pre-publish.sample.sh"
  }
}
```

---

## Commands

```bash
# Core check command (generic)
node scripts/security-check.mjs

# npm
npm run --silent security:check

# pnpm
pnpm run -s security:check

# yarn
yarn -s security:check

# Install git hook gates
cp catalog/skills/project-security/assets/pre-commit.sample.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
cp catalog/skills/project-security/assets/pre-push.sample.sh .git/hooks/pre-push && chmod +x .git/hooks/pre-push

# Run a generic CI gate script
sh catalog/skills/project-security/assets/generic-ci-security-gate.sh

```

---

## Workflow Adapters

- GitHub Actions snippet: [assets/github-actions-security-gate.yml](assets/github-actions-security-gate.yml)
- GitLab CI snippet: [assets/gitlab-ci-security-gate.yml](assets/gitlab-ci-security-gate.yml)
- Generic CI entrypoint: [assets/generic-ci-security-gate.sh](assets/generic-ci-security-gate.sh)

---

## Resources

- High-risk file checklist: [assets/high-risk-files-checklist.md](assets/high-risk-files-checklist.md)
- Shared deterministic resolver: [assets/run-security-check.shared.sh](assets/run-security-check.shared.sh)
- Commit gate template: [assets/pre-commit.sample.sh](assets/pre-commit.sample.sh)
- Push gate template: [assets/pre-push.sample.sh](assets/pre-push.sample.sh)
- Publish gate template: [assets/pre-publish.sample.sh](assets/pre-publish.sample.sh)

---

## Breaking Behavior Note

- Audit failures now block by default in push and CI gates.
- GitHub CI template fails when `package.json` exists without a lockfile.
- Publish gate now requires the bundled generic gate script and fails closed when it is missing.
- `SECURITY_CHECK_CMD` override is removed for deterministic gate execution.
- `SKIP_SECURITY_GATES` and `ENABLE_SUPPLY_CHAIN_WARNINGS` bypass flags are removed from templates.
