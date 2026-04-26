# Maintainer Runbook

This document covers maintainer-only workflows for releasing and securing `@skilly-hand/skilly-hand`.

## Release Workflow

Releases are automated via GitHub Actions. The manual OTP path still works as an emergency fallback.

### Automated (normal path)

**Prerequisites (one-time setup):**
- npm Trusted Publisher configured at npmjs.com → package settings → Trusted Publishers, pointing to `davecelot/skilly-hand` → `release.yml`. This enables OIDC-based publish from CI with no stored npm token.

**Before triggering a release:**
1. Keep `CHANGELOG.md` up to date under `## [Unreleased]` as work lands.
2. Regenerate derived files when needed: `npm run build && npm run catalog:sync && npm run agentic:self:sync`.
3. Ensure all changes are merged to `main`.

**Trigger the release:**
1. Go to **Actions → Release → Run workflow** on GitHub.
2. Select the bump type: `patch`, `minor`, or `major`.
3. Click **Run workflow**.

**What the workflow does automatically:**
- Runs the full pre-publish gate chain: version sync → dependency policy → security check → catalog check → tests → `review-rangers` → packlist.
- Bumps the version in all workspace `package.json` files.
- Rotates `CHANGELOG.md` — moves `[Unreleased]` entries into a dated release section with an npm link, and resets the template.
- Commits and tags the release on `main`.
- Publishes to npm with provenance attestation via OIDC (no OTP, no stored token).
- Creates a GitHub Release with the changelog notes as the release body.

**After the workflow completes:**
- Smoke test: `npx @skilly-hand/skilly-hand@<version> --help`.
- Verify npm metadata (README render, changelog, license, executable bin).

### Manual / Emergency fallback (OTP)

Use this if the automated workflow is broken or unavailable.

1. Confirm session: `npm whoami` (or `npm login`).
2. Keep `CHANGELOG.md` up to date under `## [Unreleased]`.
3. Regenerate derived files when needed: `npm run build && npm run catalog:sync && npm run agentic:self:sync`.
4. Run publish gate: `npm run verify:publish`.
5. Inspect package payload: `npm pack --dry-run --json`.
6. Bump version: `npm version patch|minor|major` (auto-rotates `CHANGELOG.md` and creates the git commit + tag).
7. Publish: `npm run publish:otp` (or `npm run publish:next` for prereleases).
8. Push commit and tag: `git push origin main --follow-tags`.
9. Smoke test: `npx @skilly-hand/skilly-hand@<version> --help`.

## Security and Dependency Automation

- `npm run security:check` runs repository secret/config checks plus strict dependency security checks.
- `npm run security:deps` runs strict dependency audit + outdated reporting only.
- `npm run deps:policy:check` enforces exact runtime dependency pins and lockfile sync (`package-lock.json` + `npm-shrinkwrap.json`).
- `npm run deps:update:safe -- <pkg[@version]>` is the required dependency update path; it pins exact versions, syncs shrinkwrap, and blocks completion unless all validation gates pass.
- Do not use raw `npm install` for dependency upgrades in this repo; use `deps:update:safe` so tests and security gates run before accepting version changes.
- Run `npm run setup:hooks` once per clone to install `pre-commit` (fast checks) and `pre-push` (full gate) hooks.
