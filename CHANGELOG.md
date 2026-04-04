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
