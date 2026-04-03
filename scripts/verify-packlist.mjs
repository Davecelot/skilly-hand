import { spawnSync } from "node:child_process";

const ALLOWED_EXACT_PATHS = new Set(["README.md", "CHANGELOG.md", "LICENSE", "package.json"]);
const ALLOWED_PREFIXES = ["catalog/", "packages/"];
const FORBIDDEN_PREFIXES = ["source/legacy/", "tests/", ".github/"];
const FORBIDDEN_PATTERNS = [
  /^\.DS_Store$/,
  /\/\.DS_Store$/,
  /^Thumbs\.db$/i,
  /\/Thumbs\.db$/i,
  /(^|\/)\._[^/]+$/,
  /(^|\/)\.tmp($|\/)/
];

const REQUIRED_PATHS = [
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "package.json",
  "catalog/catalog-index.json",
  "catalog/README.md",
  "packages/cli/package.json",
  "packages/cli/src/bin.js",
  "packages/core/package.json",
  "packages/core/src/index.js",
  "packages/catalog/package.json",
  "packages/catalog/src/index.js",
  "packages/detectors/package.json",
  "packages/detectors/src/index.js"
];

function parsePackJson(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new Error("npm pack did not return JSON output.");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start === -1 || end === -1 || end < start) {
      throw new Error("Failed to parse npm pack JSON output.");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function isAllowedPath(filePath) {
  if (ALLOWED_EXACT_PATHS.has(filePath)) {
    return true;
  }

  return ALLOWED_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

function isForbiddenPath(filePath) {
  if (FORBIDDEN_PREFIXES.some((prefix) => filePath.startsWith(prefix))) {
    return true;
  }

  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(filePath));
}

const packResult = spawnSync("npm", ["pack", "--dry-run", "--json", "--silent"], {
  encoding: "utf8",
  env: process.env
});

if (packResult.status !== 0) {
  const errorOutput = [packResult.stderr, packResult.stdout].filter(Boolean).join("\n").trim();
  throw new Error(`npm pack --dry-run failed.\n${errorOutput}`);
}

const packJson = parsePackJson(packResult.stdout);
const packed = packJson[0];

if (!packed || !Array.isArray(packed.files)) {
  throw new Error("Unexpected npm pack output shape: missing files list.");
}

const packedPaths = packed.files.map((entry) => entry.path);
const outOfAllowlist = packedPaths.filter((filePath) => !isAllowedPath(filePath));
const forbiddenMatches = packedPaths.filter((filePath) => isForbiddenPath(filePath));
const missingRequired = REQUIRED_PATHS.filter((requiredPath) => !packedPaths.includes(requiredPath));

const problems = [];

if (outOfAllowlist.length > 0) {
  problems.push("Found files outside the publish allowlist:");
  for (const filePath of outOfAllowlist) {
    problems.push(`- ${filePath}`);
  }
}

if (forbiddenMatches.length > 0) {
  problems.push("Found files matching forbidden publish patterns:");
  for (const filePath of forbiddenMatches) {
    problems.push(`- ${filePath}`);
  }
}

if (missingRequired.length > 0) {
  problems.push("Missing required publish files:");
  for (const filePath of missingRequired) {
    problems.push(`- ${filePath}`);
  }
}

if (problems.length > 0) {
  console.error("Packlist verification failed.");
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Packlist verification passed (${packedPaths.length} files).`);
}
