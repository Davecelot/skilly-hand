# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

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
