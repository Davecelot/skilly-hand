import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DEFAULT_PACKAGE_NAME = "@skilly-hand/skilly-hand";

const UNRELEASED_TEMPLATE = `### Added
- _None._

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._`;

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, "\n");
}

function ensureTrailingNewline(value) {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function validateDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date "${date}". Use YYYY-MM-DD format.`);
  }
}

export function hasMeaningfulUnreleasedEntries(unreleasedBody) {
  const lines = normalizeNewlines(unreleasedBody).split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("### ")) continue;
    if (/^-\s*_None\._$/i.test(line)) continue;
    if (/^<!--.*-->$/.test(line)) continue;
    return true;
  }

  return false;
}

function findUnreleasedSectionBounds(changelogContent) {
  const unreleasedHeading = /^## \[Unreleased\]\s*$/m.exec(changelogContent);
  if (!unreleasedHeading || unreleasedHeading.index === undefined) {
    throw new Error('CHANGELOG.md must include a "## [Unreleased]" section.');
  }

  const sectionStart = unreleasedHeading.index;
  const headingEnd = changelogContent.indexOf("\n", sectionStart);
  const bodyStart = headingEnd === -1 ? changelogContent.length : headingEnd + 1;
  const remaining = changelogContent.slice(bodyStart);
  const nextHeadingMatch = /^## \[.*\]\s*$/m.exec(remaining);
  const sectionEnd = nextHeadingMatch?.index === undefined
    ? changelogContent.length
    : bodyStart + nextHeadingMatch.index;

  return { sectionStart, bodyStart, sectionEnd };
}

export function rotateChangelogContent({
  changelogContent,
  version,
  date,
  packageName = DEFAULT_PACKAGE_NAME
}) {
  if (!version) {
    throw new Error("Missing version. Pass --version or use package.json version.");
  }

  validateDate(date);

  const normalized = normalizeNewlines(changelogContent);
  const { sectionStart, bodyStart, sectionEnd } = findUnreleasedSectionBounds(normalized);
  const unreleasedBody = normalized.slice(bodyStart, sectionEnd).trim();

  if (!hasMeaningfulUnreleasedEntries(unreleasedBody)) {
    throw new Error(
      "Unreleased section has no meaningful entries. Add at least one change before rotating the changelog."
    );
  }

  const npmReleaseUrl = `https://www.npmjs.com/package/${packageName}/v/${version}`;
  const releaseSection = `## [${version}] - ${date}
[View on npm](${npmReleaseUrl})

${unreleasedBody}`;

  const replacement = `## [Unreleased]

${UNRELEASED_TEMPLATE}

${releaseSection}
`;

  const before = normalized.slice(0, sectionStart);
  const after = normalized.slice(sectionEnd).replace(/^\n+/, "\n");
  return ensureTrailingNewline(`${before}${replacement}${after}`);
}

function parseArgs(argv) {
  const flags = {
    stage: true
  };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();

    if (token === "--version") flags.version = args.shift();
    else if (token === "--date") flags.date = args.shift();
    else if (token === "--changelog") flags.changelog = args.shift();
    else if (token === "--package-json") flags.packageJson = args.shift();
    else if (token === "--package-name") flags.packageName = args.shift();
    else if (token === "--no-stage") flags.stage = false;
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  console.log(`release-changelog

Usage:
  node scripts/release-changelog.mjs [--version <x.y.z>] [--date <YYYY-MM-DD>]

Flags:
  --version <x.y.z>               Override release version (defaults to package.json version)
  --date <YYYY-MM-DD>             Override release date (defaults to today's UTC date)
  --changelog <path>              Changelog file path (defaults to ./CHANGELOG.md)
  --package-json <path>           package.json path (defaults to ./package.json)
  --package-name <name>           npm package name for release link (defaults to @skilly-hand/skilly-hand)
  --no-stage                      Do not run git add CHANGELOG.md
  --help, -h                      Show this help output
`);
}

function loadVersionFromPackageJson(packageJsonRaw) {
  const packageJson = JSON.parse(packageJsonRaw);
  if (!packageJson?.version || typeof packageJson.version !== "string") {
    throw new Error("package.json is missing a valid version field.");
  }

  return packageJson.version;
}

function maybeStageChangelog({ cwd, changelogPath, stage }) {
  if (!stage) return;

  const revParse = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (revParse.status !== 0 || revParse.stdout.trim() !== "true") {
    return;
  }

  const relativeChangelogPath = path.relative(cwd, changelogPath) || "CHANGELOG.md";
  const gitAdd = spawnSync("git", ["add", relativeChangelogPath], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (gitAdd.status !== 0) {
    const output = [gitAdd.stderr, gitAdd.stdout].filter(Boolean).join("\n").trim();
    throw new Error(`Failed to stage ${relativeChangelogPath}.\n${output}`);
  }
}

export async function releaseChangelog({
  cwd = process.cwd(),
  version: versionOverride,
  date: dateOverride,
  changelogPath = path.join(cwd, "CHANGELOG.md"),
  packageJsonPath = path.join(cwd, "package.json"),
  packageName = DEFAULT_PACKAGE_NAME,
  stage = true
} = {}) {
  const [changelogRaw, packageJsonRaw] = await Promise.all([
    readFile(changelogPath, "utf8"),
    readFile(packageJsonPath, "utf8")
  ]);

  const version = versionOverride ?? loadVersionFromPackageJson(packageJsonRaw);
  const date = dateOverride ?? new Date().toISOString().slice(0, 10);

  const rotated = rotateChangelogContent({
    changelogContent: changelogRaw,
    version,
    date,
    packageName
  });

  await writeFile(changelogPath, rotated, "utf8");
  maybeStageChangelog({ cwd, changelogPath, stage });

  return { changelogPath, version, date };
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.help) {
    printHelp();
  } else {
    const cwd = process.cwd();
    const result = await releaseChangelog({
      cwd,
      version: flags.version,
      date: flags.date,
      changelogPath: flags.changelog ? path.resolve(cwd, flags.changelog) : undefined,
      packageJsonPath: flags.packageJson ? path.resolve(cwd, flags.packageJson) : undefined,
      packageName: flags.packageName ?? DEFAULT_PACKAGE_NAME,
      stage: flags.stage
    });

    console.log(`Rotated changelog for ${result.version} (${result.date}).`);
  }
}
