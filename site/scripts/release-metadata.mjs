const DEFAULT_PACKAGE_NAME = "@skilly-hand/skilly-hand";

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, "\n");
}

function loadPackageVersion(packageJsonContent) {
  const packageJson = JSON.parse(packageJsonContent);
  if (!packageJson?.version || typeof packageJson.version !== "string") {
    throw new Error("package.json is missing a valid version field.");
  }
  return versionWithoutPrefix(packageJson.version);
}

function versionWithoutPrefix(version) {
  return version.startsWith("v") ? version.slice(1) : version;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanBullet(line) {
  return line.replace(/^-\s*/, "").trim();
}

function isMeaningfulBullet(line) {
  const bullet = cleanBullet(line);
  return Boolean(bullet) && !/^_None\._$/i.test(bullet);
}

function parseSectionItems(sectionBody) {
  return sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .filter(isMeaningfulBullet)
    .map(cleanBullet);
}

export function extractReleaseMetadata({
  packageJsonContent,
  changelogContent,
  packageName = DEFAULT_PACKAGE_NAME
} = {}) {
  if (!packageJsonContent) throw new Error("Missing package.json content.");
  if (!changelogContent) throw new Error("Missing changelog content.");

  const version = loadPackageVersion(packageJsonContent);
  const normalizedChangelog = normalizeNewlines(changelogContent);
  const headingRegex = new RegExp(`^## \\[${escapeRegex(version)}\\] - (\\d{4}-\\d{2}-\\d{2})\\s*$`, "m");
  const headingMatch = headingRegex.exec(normalizedChangelog);

  if (!headingMatch || headingMatch.index === undefined) {
    throw new Error(`No released changelog section found for package version ${version}.`);
  }

  const bodyStart = normalizedChangelog.indexOf("\n", headingMatch.index) + 1;
  const remaining = normalizedChangelog.slice(bodyStart);
  const nextHeading = /^## \[/m.exec(remaining);
  const bodyEnd = nextHeading?.index === undefined ? normalizedChangelog.length : bodyStart + nextHeading.index;
  const releaseBody = normalizedChangelog.slice(bodyStart, bodyEnd).trim();
  const npmLinkMatch = /^\[View on npm\]\(([^)]+)\)\s*$/m.exec(releaseBody);
  const notesBody = releaseBody.replace(/^\[View on npm\]\([^)]+\)\s*/m, "").trim();
  const sectionRegex = /^### (.+?)\s*\n([\s\S]*?)(?=^### |\s*$)/gm;
  const sections = [];
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(notesBody)) !== null) {
    const items = parseSectionItems(sectionMatch[2]);
    if (items.length > 0) {
      sections.push({
        title: sectionMatch[1].trim(),
        items
      });
    }
  }

  return {
    version,
    date: headingMatch[1],
    npmUrl: npmLinkMatch?.[1] || `https://www.npmjs.com/package/${packageName}/v/${version}`,
    sections
  };
}

export function renderReleaseModule(release) {
  return `export const release = ${JSON.stringify(release, null, 2)};\n`;
}
