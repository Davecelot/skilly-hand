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
