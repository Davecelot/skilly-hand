import test from "node:test";
import assert from "node:assert/strict";
import { rotateChangelogContent } from "../scripts/release-changelog.mjs";

function makeChangelogWithEntries() {
  return `# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Added changelog rotation automation.

### Changed
- Improved publish workflow docs.

### Fixed
- _None._

### Removed
- _None._

## [0.1.0] - 2026-04-01
[View on npm](https://www.npmjs.com/package/skilly-hand/v/0.1.0)

### Added
- Initial release.
`;
}

test("rotates Unreleased content into a dated version section", () => {
  const output = rotateChangelogContent({
    changelogContent: makeChangelogWithEntries(),
    version: "0.2.0",
    date: "2026-04-03"
  });

  assert.match(output, /## \[0.2.0\] - 2026-04-03/);
  assert.match(output, /Added changelog rotation automation\./);
  assert.match(output, /Improved publish workflow docs\./);
});

test("inserts npm release link for the new version", () => {
  const output = rotateChangelogContent({
    changelogContent: makeChangelogWithEntries(),
    version: "0.2.0",
    date: "2026-04-03"
  });

  assert.match(output, /\[View on npm\]\(https:\/\/www\.npmjs\.com\/package\/skilly-hand\/v\/0\.2\.0\)/);
});

test("resets Unreleased section template after rotation", () => {
  const output = rotateChangelogContent({
    changelogContent: makeChangelogWithEntries(),
    version: "0.2.0",
    date: "2026-04-03"
  });

  const unreleasedBlock = output.slice(
    output.indexOf("## [Unreleased]"),
    output.indexOf("## [0.2.0] - 2026-04-03")
  );

  assert.match(unreleasedBlock, /### Added\n- _None\._/);
  assert.match(unreleasedBlock, /### Changed\n- _None\._/);
  assert.match(unreleasedBlock, /### Fixed\n- _None\._/);
  assert.match(unreleasedBlock, /### Removed\n- _None\._/);
});

test("fails when Unreleased section has no meaningful entries", () => {
  const noChanges = `# Changelog

## [Unreleased]

### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._
`;

  assert.throws(() => {
    rotateChangelogContent({
      changelogContent: noChanges,
      version: "0.2.0",
      date: "2026-04-03"
    });
  }, /has no meaningful entries/);
});
