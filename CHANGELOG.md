# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.22.1] - 2026-04-12
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.22.1)

### Added
- _None._

### Changed
- Moved maintainer release/security workflow details from README into `docs/MAINTAINER.md`, keeping README with a maintainer-runbook link.

### Fixed
- _None._

### Removed
- _None._

## [0.22.0] - 2026-04-11
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.22.0)

### Added
- Added `native setup` command support to configure native agent instruction/rule adapters from the CLI and interactive UI flows.

### Changed
- Refactored CLI presentation output to a shared result-document model used across text output and Ink-rendered interactive views.
- Expanded interactive launcher result rendering with richer sectioned previews, improved scrolling behavior, and integrated install/native setup summaries.

### Fixed
- Hardened interactive command behavior for `--json` and `--classic` modes so non-interactive flows skip full-screen TUI entry points reliably.
- Expanded install/native setup regression coverage for agent-target reconciliation, uninstall restore behavior, and renderer width constraints.

### Removed
- _None._

## [0.21.1] - 2026-04-11
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.21.1)

### Added
- _None._

### Changed
- _None._

### Fixed
- Added missing `user-story-crafting` to the README portable catalog list.

### Removed
- _None._

## [0.21.0] - 2026-04-11
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.21.0)

### Added
- Added portable skill `user-story-crafting` with integrated sub-agents for story writing, INVEST-based structuring, story splitting, and lightweight story mapping.

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.20.0] - 2026-04-11
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.20.0)

### Added
- Added `scripts/dependency-policy-check.mjs` and `deps:policy:check` to enforce exact runtime dependency pins plus synchronized `package-lock.json`/`npm-shrinkwrap.json`.
- Added `scripts/dependency-update-safe.mjs` and `deps:update:safe` to enforce safe dependency upgrades with full validation gates.
- Added `npm-shrinkwrap.json` to the repository and release workflow for npm lockfile parity.
- Added regression test coverage for dependency policy checks, safe dependency update flow, and managed git hook installation behavior.

### Changed
- Updated `verify:publish` to run dependency policy checks before security, catalog, test, and packlist gates.
- Updated `scripts/setup-hooks.mjs` to install both managed `pre-commit` and `pre-push` hooks with safety checks for foreign hooks.
- Updated `scripts/dependency-security-check.mjs` to recognize `npm-shrinkwrap.json` as a valid npm lockfile.
- Updated docs with dependency update policy guidance and hook setup requirements.

### Fixed
- Expanded script JSON contract tests to cover `dependency-policy-check`.

### Removed
- _None._

## [0.19.0] - 2026-04-11
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.19.0)

### Added
- Added `scripts/dependency-security-check.mjs` plus new npm script `security:deps` for strict dependency audit and outdated-package reporting.
- Added a full-screen Ink terminal UI for interactive CLI flows, including the new `--classic` fallback flag for plain text mode.
- Added dependency security report automation to the project-security GitHub Actions template (scheduled artifact workflow).

### Changed
- Updated `security:check` to run strict dependency checks in addition to secret/config scanning.
- Updated project-security hook/CI assets to use shared `run_security_gates` flow.
- Updated CLI command routing and terminal rendering to support Ink-backed interactive sessions.

### Fixed
- Expanded and refreshed interactive/terminal/script test coverage for the new UI and security flows.

### Removed
- _None._

## [0.18.0] - 2026-04-08
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.18.0)

### Added
- Added `sync-catalog` orchestration script to compute catalog README + skill frontmatter updates up front and apply writes atomically with rollback on failure.
- Added `sync-skill-frontmatter` CLI script with `--check`, `--json`, and `--skill` filtering support.
- Added regression coverage for catalog sync rollback/idempotency and frontmatter normalization edge cases (`tests/sync-catalog.test.js`, `tests/skill-frontmatter.test.js`).

### Changed
- Updated root `catalog:sync` script to run `scripts/sync-catalog.mjs` for unified catalog synchronization.
- Expanded script JSON contract coverage for `sync-catalog` and `sync-skill-frontmatter` in `tests/scripts-output.test.js`.
- Updated catalog validation flow to verify catalog README drift through dry-run sync checks.

### Fixed
- Hardened skill frontmatter parsing and verification to avoid false frontmatter detection and preserve markdown content for malformed leading YAML-like blocks.
- Improved catalog README sync behavior to treat CRLF/LF-equivalent content as in sync.

### Removed
- _None._

## [0.17.0] - 2026-04-08
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.17.0)

### Added
- Added sandbox harness and matrix integration tests (`scripts/test-in-sandbox.mjs`, `tests/sandbox-harness.test.js`, `tests/sandbox-matrix.test.js`) and wired them into the root test pipeline.
- Added required `review-rangers` final-gate guidance to the spec-driven-development verify flow and validation checklist.

### Changed
- Updated installer reconciliation logic to remove stale managed targets when agent selection narrows, while preserving/restoring backups for retained targets.
- Updated backup behavior to skip backup creation for files already marked as managed content.
- Updated root `npm test` to run sandbox integration verification after the node test suite.

### Fixed
- Fixed uninstall and re-install behavior for narrowed agent selections by restoring original files and cleaning obsolete managed artifacts.

### Removed
- _None._

## [0.16.1] - 2026-04-08
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.16.1)

### Added
- Added a Mandatory Skill Gate section to generated agent instruction files to enforce optimizer sequencing across interactions.

### Changed
- Updated routing guidance to apply mandatory-gate precedence before task-specific skill chains.
- Synced catalog markdown rendering so generated AGENTS output includes the Mandatory Skill Gate and precedence guidance.

### Fixed
- Updated install and self-sync test coverage to assert Mandatory Skill Gate propagation across managed instruction targets.

### Removed
- _None._

## [0.16.0] - 2026-04-07
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.16.0)

### Added
- _None._

### Changed
- _None._

### Fixed
- Added missing `output-optimizer` and `project-security` to the README catalog list.

### Removed
- _None._

## [0.15.1] - 2026-04-07
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.15.1)

### Added
- Added portable skill `output-optimizer` for compact interpreter modes that minimize response verbosity while preserving clarity and correctness.
- Added portable skill `project-security` for scanning and enforcing security gates on commit, push, and publish workflows across GitHub, GitLab, npm, pnpm, yarn, and generic CI.

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.15.0] - 2026-04-05
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.15.0)

### Added

- **frontend-design skill v1.1.0:** New `design-context-setter` agent for capturing design intent on greenfield projects via a persistent `DESIGN.md` file
- **frontend-design skill v1.1.0:** New `motion-designer` agent for stack-aware animations and micro-interactions with GPU safety and `prefers-reduced-motion` compliance
- **frontend-design skill v1.1.0:** New `visual-refiner` agent for post-generation quality evaluation (AI slop detection, interaction state coverage, Nielsen's heuristics, directional refinement)
- **frontend-design skill v1.1.0:** New `aesthetic-archetypes` reference asset with 8 design archetypes for greenfield project direction
- Enhanced `component-designer` with aesthetic principles, DESIGN.md integration, and complete interaction-state checklist

### Changed

- Updated `AGENTS.md` with expanded frontend-design workflow triggers and routing
- Updated frontend-design routing map to include optional motion and visual refinement phases
- Expanded frontend-design auto-invoke triggers to include greenfield setup, motion, and visual refinement scenarios

### Fixed

- _None._

### Removed

- Removed "Clarification-First Planning Workflow" from `AGENTS.md` (superseded by refined workflows)

## [0.14.0] - 2026-04-05
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.14.0)

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.13.0] - 2026-04-05
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.13.0)

### Added
- Figma plugin detection support
- New test fixtures for figma-plugin projects

### Changed
- Improved project detection logic with configExists helper function
- Updated skill recommendations for React, Next.js, Angular, Vite, and other technologies
- Changed figma-mcp-0to1 skill detectors from "always" to "figma"

### Fixed
- _None._

### Removed
- _None._

## [0.12.0] - 2026-04-05
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.12.0)

### Added
- Added `SECURITY.md` policy for vulnerability reporting and response procedures.
- Added `security-check` script to scan source code for exposed secrets and API keys.
- Integrated security scanning into the `verify:publish` pipeline to catch credential leaks before release.

### Changed
- Updated `.gitignore` to include `.env*` pattern for environment variable files.
- Updated `verify-packlist.mjs` to whitelist `SECURITY.md` in npm package.

### Fixed
- _None._

### Removed
- _None._

## [0.11.1] - 2026-04-05
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.11.1)

### Added
- _None._

### Changed
- _None._

### Fixed
- Added `project-teacher` to the README catalog list (was missing from the 0.11.0 docs update).
- Synced test expectations to reflect 12-skill catalog and `project-teacher` install behavior.

### Removed
- _None._

## [0.10.5] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.10.5)

### Added
- _None._

### Changed
- Renamed portable skill `life-guard` to `review-rangers` across manifests, tests, docs, and AGENTS routing output.
- Standardized skill instruction structure so metadata is defined in `manifest.json` (removed YAML front matter from `SKILL.md` files and updated skill-creator guidance/templates).

### Fixed
- _None._

### Removed
- _None._

## [0.10.4] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.10.4)

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.10.3] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.10.3)

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.10.2] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.10.2)

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.10.1] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.10.1)

### Added
- _None._

### Changed
- Removed the `AI Integrated Structures` subsection from `README.md` to keep assistant compatibility docs focused on current install targets.

### Fixed
- _None._

### Removed
- _None._

## [0.10.0] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.10.0)

### Added
- Added support for `antigravity`, `windsurf`, and `trae` agent targets across install flows.
- Added native install target coverage for Antigravity (`.agents/skills`, `.agent/skills`, and `.agents/rules/skilly-hand.md`), Windsurf (`.windsurf/skills`), and TRAE (`.trae/skills`).

### Changed
- Refactored installer agent target handling to use centralized install profiles for instruction files and skill symlink paths.
- Updated CLI help output and repository documentation to reflect expanded assistant compatibility and install targets.
- Expanded tests for new agent support, install/uninstall behavior, and shared `AGENTS.md` target deduplication.

### Fixed
- _None._

### Removed
- _None._

## [0.9.0] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.9.0)

### Added

- `standard` agent option: installs `AGENTS.md` and a `skills/` symlink directly at the project root with no vendor-specific folder (`.claude/`, `.codex/`, etc.).

### Changed

- Interactive agent selection now pre-checks only `standard` instead of all five agents, so accepting defaults gives a clean, agent-agnostic installation.
- `codex` and `standard` both produce `AGENTS.md`; when both are selected the file is written once.

### Fixed
- _None._

### Removed
- _None._

## [0.8.1] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.8.1)

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.8.0] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.8.0)

### Added
- Added portable skill `frontend-design` for project-aware UI component design that enforces stack detection before any design work.
- Added portable skill `review-rangers` for multi-perspective code and decision review using a committee + domain expert safety guard pattern.
- Added portable skill `test-driven-development` for guiding the RED → GREEN → REFACTOR TDD cycle.

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.7.0] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.7.0)

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.6.1] - 2026-04-04
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.6.1)

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.6.0] - 2026-04-03
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.6.0)

### Added
- Added portable skill `angular-guidelines` for Angular-only generation/review workflows, including mandatory latest-stable preflight checks and modern Angular best-practice defaults.

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._

## [0.5.0] - 2026-04-03
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.5.0)

### Added
- Interactive command launcher when running `npx skilly-hand` in a TTY, including install skill/agent selection flow.
- New `selectedSkillIds` install path for explicitly choosing portable skills.
- Comprehensive CLI interaction tests in `tests/interactive-cli.test.js`.

### Changed
- Help, docs, and install/uninstall confirmation messaging now reflect current behavior and naming (`skilly-hand` branding).
- CLI bin execution mode and command routing were refactored into testable `runCli`/service helpers.

### Fixed
- Non-interactive invocation without a command now defaults to install output instead of opening prompts.

### Removed
- _None._

## [0.4.0] - 2026-04-03
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.4.0)

### Added

- `feat(core)`: Extract UI rendering into modular system — `ui/theme.js`, `ui/layout.js`, `ui/brand.js` — with a clean `ui/index.js` barrel export.
- `feat(core)`: Multi-level color detection (`detectColorLevel`) supporting no-color, basic (16), 256-color, and truecolor environments.
- `feat(cli)`: New renderer methods `banner()`, `detectionGrid()`, and `healthBadge()` built on the new UI modules.

### Changed

- `refactor(core)`: `terminal.js` restructured to delegate rendering to the new `ui/` modules; backward-compatible `style` object retained for existing tests.
- `refactor(cli)`: `bin.js` simplified by extracting inline rendering into the new renderer methods.
- `chore`: Added `/sandbox` to `.gitignore`.

## [0.3.0] - 2026-04-03
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.3.0)

### Added
- Added portable skill `figma-mcp-0to1` with setup, tool-selection, first-canvas, and troubleshooting documentation.

### Changed
- Synced generated documentation outputs in `AGENTS.md` and `catalog/README.md` to include the current 5-skill registry.
- Refreshed root documentation to reflect current catalog composition and release/doc sync workflow.

### Fixed
- Updated catalog manifest test expectations for the 5-skill portable catalog.

### Removed
- _None._

## [0.1.1] - 2026-04-03
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.1.1)

### Added
- Added automated changelog rotation via `scripts/release-changelog.mjs` to create dated release sections with npm version links.

### Changed
- Updated release workflow documentation and publish validation to include `CHANGELOG.md`.

### Fixed
- _None._

### Removed
- Removed `source/legacy/` directory containing the old skills and agentic structure superseded by the catalog.
