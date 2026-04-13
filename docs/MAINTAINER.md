# Maintainer Runbook

This document covers maintainer-only workflows for releasing and securing `@skilly-hand/skilly-hand`.

## Release Workflow (npm)

1. Confirm session: `npm whoami` (or `npm login`).
2. Keep `CHANGELOG.md` up to date under `## [Unreleased]` as work lands.
3. Regenerate derived files when needed: `npm run build && npm run catalog:sync && npm run agentic:self:sync`.
4. Run publish gate: `npm run verify:publish`.
   - Includes final `review-rangers` verification to catch UX copy/flow regressions and missing discoverability safeguards.
5. Inspect package payload: `npm pack --dry-run --json`.
6. Bump version intentionally: `npm version patch|minor|major` (this auto-rotates `CHANGELOG.md`, creates a dated release section, and inserts a version-specific npm link).
7. Publish with assisted 2FA flow: `npm run publish:otp` (or `npm run publish:next` for prereleases).
   - The script runs the publish gate, asks for OTP with hidden input, and if left blank lets npm trigger your default security method.
8. Smoke test after publish: `npx @skilly-hand/skilly-hand@<version> --help`.
9. Verify npm metadata (README render, changelog, license, executable bin).

## Security and Dependency Automation

- `npm run security:check` runs repository secret/config checks plus strict dependency security checks.
- `npm run security:deps` runs strict dependency audit + outdated reporting only.
- `npm run deps:policy:check` enforces exact runtime dependency pins and lockfile sync (`package-lock.json` + `npm-shrinkwrap.json`).
- `npm run deps:update:safe -- <pkg[@version]>` is the required dependency update path; it pins exact versions, syncs shrinkwrap, and blocks completion unless all validation gates pass.
- Do not use raw `npm install` for dependency upgrades in this repo; use `deps:update:safe` so tests and security gates run before accepting version changes.
- Run `npm run setup:hooks` once per clone to install `pre-commit` (fast checks) and `pre-push` (full gate) hooks.
