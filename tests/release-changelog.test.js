import test from "node:test";
import assert from "node:assert/strict";
import { rotateChangelogContent } from "../scripts/release-changelog.mjs";
import { readFile } from "node:fs/promises";
import { extractReleaseMetadata } from "../site/scripts/release-metadata.mjs";

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
[View on npm](https://www.npmjs.com/package/@skilly-hand/skilly-hand/v/0.1.0)

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

  assert.match(output, /\[View on npm\]\(https:\/\/www\.npmjs\.com\/package\/@skilly-hand\/skilly-hand\/v\/0\.2\.0\)/);
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

test("extracts release metadata for the current package version", async () => {
  const [packageJsonContent, changelogContent] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8")
  ]);

  const metadata = extractReleaseMetadata({ packageJsonContent, changelogContent });

  assert.equal(metadata.version, JSON.parse(packageJsonContent).version);
  assert.match(metadata.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(metadata.npmUrl, new RegExp(`/v/${metadata.version}$`));
  assert.ok(metadata.sections.length > 0);
});

test("omits empty _None._ changelog groups from release metadata", () => {
  const metadata = extractReleaseMetadata({
    packageJsonContent: JSON.stringify({ version: "1.2.3" }),
    changelogContent: `# Changelog

## [1.2.3] - 2026-04-27
[View on npm](https://example.com/package/v/1.2.3)

### Added
- _None._

### Changed
- Improved release metadata generation.

### Fixed
- _None._
`
  });

  assert.deepEqual(metadata.sections, [
    {
      title: "Changed",
      items: ["Improved release metadata generation."]
    }
  ]);
});

test("fails when package version has no released changelog section", () => {
  assert.throws(() => {
    extractReleaseMetadata({
      packageJsonContent: JSON.stringify({ version: "9.9.9" }),
      changelogContent: `# Changelog

## [Unreleased]

### Added
- Future work.

## [1.0.0] - 2026-04-01

### Added
- Initial release.
`
    });
  }, /No released changelog section found for package version 9\.9\.9/);
});

test("release workflow deploys site from the bumped release tag", async () => {
  const workflow = await readFile(new URL("../.github/workflows/release.yml", import.meta.url), "utf8");

  assert.match(workflow, /deploy_site:\n(?: {2,}.+\n)*? {4}if: inputs\.mode == 'bump-and-publish'\n {4}needs: \[bump, publish\]/);
  assert.match(workflow, /- name: Checkout release\n {8}uses: actions\/checkout@v4\n {8}with:\n {10}ref: \$\{\{ needs\.bump\.outputs\.tag \}\}/);
  assert.match(workflow, /git add .*CHANGELOG\.md site\/src\/generated\/release\.js site\/src\/generated\/skills\.js/);
});
