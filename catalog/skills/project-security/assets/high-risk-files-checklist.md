# High-Risk Repository Security Checklist

Use this baseline list before commit, push, and publish.

## 1) Secrets and Credentials

- `.env`, `.env.*`, `.secrets*`, `.credentials*`
- PEM/SSH/private key material (`*.pem`, `id_rsa`, `id_ed25519`, PKCS#12 files)
- API keys and tokens in source/config/test fixtures
- Service-account JSON or cloud credentials

## 2) Project and Tool Settings

- IDE and editor settings that may contain local paths/tokens
- Tool config files (linters, build tools, release bots) with embedded secrets
- MCP, AI assistant, or integration config files containing auth material

## 3) Package and Publish Surface

- `package.json` scripts that expose secrets in command arguments
- `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` integrity and unexpected source URLs
- `.npmrc`, `.yarnrc*`, `.pnpmfile.cjs` for leaked tokens or unsafe registries
- Publish include/exclude controls (`files`, `.npmignore`) to avoid shipping sensitive files

## 4) Source-Control Boundaries

- `.gitignore` and optional global ignore parity for env/secrets artifacts
- Accidental tracking of generated artifacts containing secrets
- Branch/workflow policies that bypass checks

## 5) CI/CD and Release Definitions

- `.github/workflows/*.yml` and `.gitlab-ci.yml` secret handling
- Unmasked logging of env vars/tokens
- Publish and release jobs missing security checks

## 6) Blocker vs Warning Guidance

Blockers:

- Confirmed secret/token/private key exposure
- Tracked env files with sensitive values
- Publish configuration that includes secrets or private internals

Warnings:

- Suspicious but unconfirmed patterns
- Optional hardening opportunities (pinning, stricter masks, policy tuning)
- Advisory-only dependency concerns without exploit path evidence
