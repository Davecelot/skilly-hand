# Maintainer Runbook

This document covers maintainer-only workflows for releasing and securing `@skilly-hand/skilly-hand`.

## Release Workflow

Releases are automated via GitHub Actions in `.github/workflows/release.yml`. The workflow has two modes:

- `bump-and-publish`: normal release path; bumps the version, rotates the changelog, pushes the release commit and tag, publishes to npm, and creates the GitHub Release.
- `publish-existing`: recovery path; publishes an already-created version/tag without bumping again.

The manual OTP path still works as an emergency fallback.

### Automated (normal path)

**Prerequisites (one-time setup):**
- npm Trusted Publisher configured at npmjs.com → package settings → Trusted Publishers:
  - Publisher: `GitHub Actions`
  - Organization or user: `Davecelot`
  - Repository: `skilly-hand`
  - Workflow filename: `release.yml`
  - Environment name: leave blank unless the workflow adds a matching GitHub Actions `environment`.
- Trusted Publisher matching is case-sensitive. `Davecelot/skilly-hand` works; `davecelot/skilly-hand` can fail with `E404 Not Found - PUT ... @skilly-hand%2fskilly-hand`.
- Root `package.json` must include a repository URL matching the GitHub repository:
  `git+https://github.com/Davecelot/skilly-hand.git`.
- This enables OIDC-based publish from CI with no stored npm token or OTP.

**Before triggering a release:**
1. Keep `CHANGELOG.md` up to date under `## [Unreleased]` as work lands.
2. Regenerate derived files when needed: `npm run build && npm run catalog:sync && npm run agentic:self:sync`.
3. Ensure all changes are merged to `main`.
4. Do not manually bump package versions for the normal path. `main` should still be on the current published version when `bump-and-publish` starts.

**Trigger the release:**
1. Go to **Actions → Release → Run workflow** on GitHub.
2. Set `mode` to `bump-and-publish`.
3. Select the bump type: `patch`, `minor`, or `major`.
4. Leave `version` blank.
5. Click **Run workflow**.

**What the workflow does automatically:**
- Runs the full pre-publish gate chain: version sync → dependency policy → security check → catalog check → tests → `review-rangers` → packlist.
- Bumps the version in root `package.json`, all `packages/*/package.json` files, `package-lock.json`, and `npm-shrinkwrap.json`.
- Rotates `CHANGELOG.md` — moves `[Unreleased]` entries into a dated release section with an npm link, and resets the template.
- Commits and creates an annotated `vX.Y.Z` tag, then pushes `main` and that exact tag explicitly.
- Publishes to npm via Trusted Publishing/OIDC using Node 24 and latest npm.
- Creates a GitHub Release with the changelog notes as the release body.

**After the workflow completes:**
- Verify npm:
  `npm view @skilly-hand/skilly-hand@<version> version`
- Verify latest:
  `npm view @skilly-hand/skilly-hand dist-tags --json`
- Smoke test:
  `npx @skilly-hand/skilly-hand@<version> --help`
- Verify npm metadata (README render, changelog, license, executable bin).

### Automated Recovery Path

Use `publish-existing` only when a release commit/tag already exists but npm publish or GitHub Release creation failed. Do not use it for normal releases.

**When to use it:**
- The version was already bumped on `main`.
- A `vX.Y.Z` tag exists and points to the intended release commit.
- npm does not yet have that version.
- Re-running `bump-and-publish` would incorrectly create the next version.

**Before running recovery:**
1. Confirm npm does not have the target version:
   `npm view @skilly-hand/skilly-hand@<version> version`
   This should fail with a missing-version `E404`.
2. Confirm the tag exists:
   `git ls-remote --tags origin "v<version>*"`.
3. If the tag is missing but the release commit exists, create an annotated tag on the release commit and push it:
   `git tag -a v<version> <commit> -m "Release v<version>"`
   `git push origin v<version>`
4. If the package metadata needs a fix before publish and the version is still unpublished, commit the fix, push `main`, then move the unpublished tag:
   `git tag -f -a v<version> -m "Release v<version>"`
   `git push --force origin v<version>`

**Trigger recovery:**
1. Go to **Actions → Release → Run workflow**.
2. Set `mode` to `publish-existing`.
3. Set `version` to the existing version, for example `0.24.0`.
4. Set `bump` to any value; it is ignored in this mode.
5. Click **Run workflow**.

**Important:** Do not re-run an older failed job after changing workflow code. Re-running a failed job uses the workflow definition from that old run. Start a new workflow run with `publish-existing` instead.

### Known Failure Patterns

- `Checkout at release tag` fails fetching `vX.Y.Z`: the release tag was not pushed. The workflow now uses annotated tags and `git push origin main "v$VERSION"` to avoid this. For an already-failed release, push the missing tag manually.
- `E404 Not Found - PUT https://registry.npmjs.org/@skilly-hand%2fskilly-hand`: npm rejected the registry write. Check Trusted Publisher casing, workflow filename, environment name, package ownership, and root `package.json` `repository.url`.
- `always-auth` npm warning: warning only. It comes from setup-node/npm config and is not the publish failure.
- Provenance statement appears in logs but publish still fails: OIDC/provenance progressed, but npm authorization or package Trusted Publisher matching failed at the registry write.
- A failed publish can leave a signed provenance log entry without publishing the version. Always verify with `npm view @skilly-hand/skilly-hand@<version> version`.

### Manual / Emergency fallback (OTP)

Use this if the automated workflow is broken or unavailable.

1. Confirm session: `npm whoami` (or `npm login`).
2. Keep `CHANGELOG.md` up to date under `## [Unreleased]`.
3. Regenerate derived files when needed: `npm run build && npm run catalog:sync && npm run agentic:self:sync`.
4. Run publish gate: `npm run verify:publish`.
5. Inspect package payload: `npm pack --dry-run --json`.
6. Bump version: `npm version patch|minor|major` (auto-rotates `CHANGELOG.md` and creates the git commit + tag).
7. Publish: `npm run publish:otp` (or `npm run publish:next` for prereleases).
8. Push commit and tag: `git push origin main "v<version>"`.
9. Smoke test: `npx @skilly-hand/skilly-hand@<version> --help`.

## Security and Dependency Automation

- `npm run security:check` runs repository secret/config checks plus strict dependency security checks.
- `npm run security:deps` runs strict dependency audit + outdated reporting only.
- `npm run deps:policy:check` enforces exact runtime dependency pins and lockfile sync (`package-lock.json` + `npm-shrinkwrap.json`).
- `npm run deps:update:safe -- <pkg[@version]>` is the required dependency update path; it pins exact versions, syncs shrinkwrap, and blocks completion unless all validation gates pass.
- Do not use raw `npm install` for dependency upgrades in this repo; use `deps:update:safe` so tests and security gates run before accepting version changes.
- Run `npm run setup:hooks` once per clone to install `pre-commit` (fast checks) and `pre-push` (full gate) hooks.
