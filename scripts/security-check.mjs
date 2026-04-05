import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

// Directories and files to skip entirely during source scanning
const SKIP_DIRS = new Set(["node_modules", ".git", ".npm-cache"]);

// Source file extensions to scan for secret patterns
const SCAN_EXTENSIONS = new Set([".js", ".mjs", ".ts"]);

// Gitignore entries that must be present for baseline security hygiene
const REQUIRED_GITIGNORE_ENTRIES = ["node_modules", ".env*", ".npm-cache", ".claude"];

// Secret patterns — ordered from most specific to most general.
// NOTE: This file is explicitly excluded from its own scan (see collectSourceFiles).
// The regex literals here would otherwise trigger the "Generic secret assignment" pattern.
const SECRET_PATTERNS = [
  { name: "Anthropic API key",          pattern: /sk-ant-[a-zA-Z0-9\-_]{20,}/ },
  { name: "OpenAI API key",             pattern: /sk-[a-zA-Z0-9]{48}/ },
  { name: "GitHub PAT",                 pattern: /ghp_[a-zA-Z0-9]{36}/ },
  { name: "NPM token",                  pattern: /npm_[a-zA-Z0-9]{36}/ },
  { name: "AWS Access Key",             pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "PEM private key",            pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  { name: "Bearer token",               pattern: /bearer\s+[a-z0-9_\-\.]{20,}/i },
  { name: "Generic API key assignment", pattern: /api[_-]?key\s*[:=]\s*["'][^"']{8,}["']/i },
  { name: "Generic secret assignment",  pattern: /secret\s*[:=]\s*["'][^"']{8,}["']/i },
  { name: "Password assignment",        pattern: /password\s*[:=]\s*["'][^"']{4,}["']/i },
];

const SELF_PATH = path.resolve(fileURLToPath(import.meta.url));
const renderer = createTerminalRenderer();

// Manually recurse into a directory, pruning SKIP_DIRS, collecting matching files.
async function walkDir(dir, matchFn, results = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath, matchFn, results);
    } else if (entry.isFile() && matchFn(entry.name, fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

async function collectSourceFiles(cwd) {
  const files = [];

  // packages/**/*.{js,mjs,ts}
  await walkDir(path.join(cwd, "packages"), (name) => {
    const ext = path.extname(name);
    return SCAN_EXTENSIONS.has(ext);
  }, files);

  // scripts/**/*.mjs (and .js)
  await walkDir(path.join(cwd, "scripts"), (name) => {
    const ext = path.extname(name);
    return SCAN_EXTENSIONS.has(ext);
  }, files);

  // catalog/**/*.json
  await walkDir(path.join(cwd, "catalog"), (name) => {
    return path.extname(name) === ".json";
  }, files);

  // Exclude this file itself — its regex literals contain the very strings they search for.
  return files.filter((f) => path.resolve(f) !== SELF_PATH);
}

async function scanFileForSecrets(filePath, cwd) {
  const content = await readFile(filePath, "utf8");
  const lines = content.split("\n");
  const violations = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    for (const { name, pattern } of SECRET_PATTERNS) {
      const match = pattern.exec(line);
      if (match) {
        const col = match.index + 1;
        const snippet = line.slice(Math.max(0, match.index - 20), match.index + 60).trim();
        violations.push({
          file: path.relative(cwd, filePath),
          line: lineIdx + 1,
          column: col,
          patternName: name,
          snippet
        });
      }
    }
  }

  return violations;
}

async function checkGitignore(cwd) {
  const gitignorePath = path.join(cwd, ".gitignore");
  let content;
  try {
    content = await readFile(gitignorePath, "utf8");
  } catch {
    return REQUIRED_GITIGNORE_ENTRIES.map((e) => e);
  }

  const lines = new Set(
    content.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  );

  return REQUIRED_GITIGNORE_ENTRIES.filter((entry) => !lines.has(entry));
}

async function findEnvFiles(cwd) {
  const envPattern = /^\.env(\..+)?$/;
  const results = [];
  await walkDir(cwd, (name) => envPattern.test(name), results);
  return results.map((f) => path.relative(cwd, f));
}

export async function checkSecurity({ cwd = process.cwd() } = {}) {
  const resolvedCwd = path.resolve(cwd);

  const sourceFiles = await collectSourceFiles(resolvedCwd);
  const allViolations = [];
  for (const file of sourceFiles) {
    const fileViolations = await scanFileForSecrets(file, resolvedCwd);
    allViolations.push(...fileViolations);
  }

  const gitignoreProblems = await checkGitignore(resolvedCwd);
  const envFileProblems = await findEnvFiles(resolvedCwd);

  const problems = [];

  for (const v of allViolations) {
    problems.push(`Found hardcoded secret pattern in ${v.file}:${v.line} — ${v.patternName}`);
  }
  for (const entry of gitignoreProblems) {
    problems.push(`.gitignore is missing required entry: ${entry}`);
  }
  for (const f of envFileProblems) {
    problems.push(`Unexpected .env file found: ${f}`);
  }

  return {
    cwd: resolvedCwd,
    valid: problems.length === 0,
    violations: allViolations,
    gitignoreProblems,
    envFileProblems,
    filesScanned: sourceFiles.length,
    problems
  };
}

function parseArgs(argv) {
  const flags = { json: false, help: false };
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
    renderer.status("info", "security-check"),
    renderer.section("Usage", renderer.list(["node scripts/security-check.mjs [--json]"], { bullet: "-" })),
    renderer.section("Description", "Scans source files for hardcoded secrets, validates .gitignore entries, and checks for unexpected .env files.")
  ]));
}

const isEntryPoint = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const jsonRequested = process.argv.includes("--json");

  try {
    const flags = parseArgs(process.argv.slice(2));
    if (flags.help) {
      printHelp();
    } else {
      const result = await checkSecurity();
      if (flags.json) {
        renderer.writeJson({
          command: "security-check",
          ...result
        });
        if (!result.valid) {
          process.exitCode = 1;
        }
      } else if (result.valid) {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Security check passed."),
          renderer.kv([["Files scanned", String(result.filesScanned)]])
        ]));
      } else {
        renderer.writeError(renderer.joinBlocks([
          renderer.status("error", "Security check failed."),
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
          what: "security-check failed",
          why: error.message,
          hint: "Run `node scripts/security-check.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "security-check failed",
        why: error.message,
        hint: "Ensure you are running from the repository root.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
