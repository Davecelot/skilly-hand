import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const ALLOWED_EXACT_PATHS = new Set(["README.md", "CHANGELOG.md", "LICENSE", "SECURITY.md", "package.json"]);
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
const renderer = createTerminalRenderer();

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

export function verifyPacklist({ cwd = process.cwd() } = {}) {
  const packResult = spawnSync("npm", ["pack", "--dry-run", "--json", "--silent"], {
    cwd,
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

  return {
    cwd,
    valid: problems.length === 0,
    packedPaths,
    outOfAllowlist,
    forbiddenMatches,
    missingRequired,
    problems
  };
}

function parseArgs(argv) {
  const flags = { json: false };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "verify-packlist"),
    renderer.section("Usage", renderer.list(["node scripts/verify-packlist.mjs [--json]"], { bullet: "-" }))
  ]));
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const jsonRequested = process.argv.includes("--json");

  try {
    const flags = parseArgs(process.argv.slice(2));
    if (flags.help) {
      printHelp();
    } else {
      const result = verifyPacklist();
      if (flags.json) {
        renderer.writeJson({
          command: "verify-packlist",
          ...result
        });
        if (!result.valid) {
          process.exitCode = 1;
        }
      } else if (result.valid) {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Packlist verification passed."),
          renderer.kv([["Files packed", String(result.packedPaths.length)]])
        ]));
      } else {
        renderer.writeError(renderer.joinBlocks([
          renderer.status("error", "Packlist verification failed."),
          result.problems.join("\n")
        ]));
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "verify-packlist failed",
          why: error.message,
          hint: "Run `node scripts/verify-packlist.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "verify-packlist failed",
        why: error.message,
        hint: "Ensure npm is available and package metadata is valid.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
