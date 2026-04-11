import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();
const EXACT_SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function stableSort(value) {
  if (Array.isArray(value)) {
    return value.map(stableSort);
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const sorted = {};
  for (const key of Object.keys(value).sort()) {
    sorted[key] = stableSort(value[key]);
  }
  return sorted;
}

function isExactSpec(spec) {
  return typeof spec === "string" && EXACT_SEMVER_RE.test(spec.trim());
}

function parseArgs(argv) {
  const flags = {
    json: false,
    help: false,
    cwd: process.cwd()
  };

  const args = [...argv];
  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else if (token === "--cwd") {
      const value = args.shift();
      if (!value || value.startsWith("-")) throw new Error("Missing value for --cwd");
      flags.cwd = value;
    } else {
      throw new Error(`Unknown flag: ${token}`);
    }
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "dependency-policy-check"),
    renderer.section("Usage", renderer.list([
      "node scripts/dependency-policy-check.mjs [--json] [--cwd <path>]"
    ], { bullet: "-" })),
    renderer.section("Description", "Enforces exact runtime dependency pins and lockfile synchronization between package-lock.json and npm-shrinkwrap.json.")
  ]));
}

export async function runDependencyPolicyCheck({ cwd = process.cwd() } = {}) {
  const resolvedCwd = path.resolve(cwd);
  const packageJsonPath = path.join(resolvedCwd, "package.json");
  const packageLockPath = path.join(resolvedCwd, "package-lock.json");
  const shrinkwrapPath = path.join(resolvedCwd, "npm-shrinkwrap.json");

  const issues = [];

  const packageJsonRaw = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(packageJsonRaw);

  const runtimeGroups = ["dependencies", "optionalDependencies"];
  const rangeViolations = [];
  for (const groupName of runtimeGroups) {
    const group = packageJson[groupName] || {};
    for (const [depName, depSpec] of Object.entries(group)) {
      if (!isExactSpec(depSpec)) {
        rangeViolations.push(`${groupName}.${depName}=${depSpec}`);
      }
    }
  }

  if (rangeViolations.length > 0) {
    issues.push(`Runtime dependencies must use exact versions (found non-exact specs: ${rangeViolations.join(", ")}).`);
  }

  const hasPackageLock = await exists(packageLockPath);
  const hasShrinkwrap = await exists(shrinkwrapPath);

  if (!hasPackageLock) {
    issues.push("package-lock.json is required.");
  }
  if (!hasShrinkwrap) {
    issues.push("npm-shrinkwrap.json is required.");
  }

  let lockfilesSynchronized = false;
  if (hasPackageLock && hasShrinkwrap) {
    const [packageLockRaw, shrinkwrapRaw] = await Promise.all([
      readFile(packageLockPath, "utf8"),
      readFile(shrinkwrapPath, "utf8")
    ]);
    const packageLock = JSON.parse(packageLockRaw);
    const shrinkwrap = JSON.parse(shrinkwrapRaw);
    lockfilesSynchronized = JSON.stringify(stableSort(packageLock)) === JSON.stringify(stableSort(shrinkwrap));
    if (!lockfilesSynchronized) {
      issues.push("package-lock.json and npm-shrinkwrap.json are out of sync.");
    }
  }

  return {
    cwd: resolvedCwd,
    valid: issues.length === 0,
    checkedRuntimeDependencies:
      Object.keys(packageJson.dependencies || {}).length +
      Object.keys(packageJson.optionalDependencies || {}).length,
    lockfilePresent: hasPackageLock,
    shrinkwrapPresent: hasShrinkwrap,
    lockfilesSynchronized,
    issues
  };
}

const isEntryPoint = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const jsonRequested = process.argv.includes("--json");

  try {
    const flags = parseArgs(process.argv.slice(2));
    if (flags.help) {
      printHelp();
    } else {
      const result = await runDependencyPolicyCheck({ cwd: flags.cwd });
      if (flags.json) {
        renderer.writeJson({
          command: "dependency-policy-check",
          ...result
        });
      } else if (result.valid) {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Dependency policy check passed."),
          renderer.kv([
            ["Runtime dependencies checked", String(result.checkedRuntimeDependencies)],
            ["Lockfiles synchronized", result.lockfilesSynchronized ? "yes" : "no"]
          ])
        ]));
      } else {
        renderer.writeError(renderer.joinBlocks([
          renderer.status("error", "Dependency policy check failed."),
          renderer.list(result.issues, { bullet: "-" })
        ]));
      }

      if (!result.valid) {
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "dependency-policy-check failed",
          why: error.message,
          hint: "Run `node scripts/dependency-policy-check.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "dependency-policy-check failed",
        why: error.message,
        hint: "Ensure package.json and lockfiles are present and valid JSON.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
