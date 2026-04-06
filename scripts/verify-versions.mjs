import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();

async function getPackageDirs(packagesDir) {
  let entries;
  try {
    entries = await readdir(packagesDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(packagesDir, e.name));
}

async function readVersion(pkgPath) {
  const content = await readFile(pkgPath, "utf8");
  const pkg = JSON.parse(content);
  return pkg.version ?? null;
}

export async function verifyVersions({ cwd = process.cwd() } = {}) {
  const resolvedCwd = path.resolve(cwd);
  const rootPkgPath = path.join(resolvedCwd, "package.json");

  const rootVersion = await readVersion(rootPkgPath);
  if (!rootVersion) {
    throw new Error("Root package.json has no version field.");
  }

  const packagesDir = path.join(resolvedCwd, "packages");
  const packageDirs = await getPackageDirs(packagesDir);

  const mismatches = [];
  const checked = [];

  for (const dir of packageDirs) {
    const pkgPath = path.join(dir, "package.json");
    const rel = path.relative(resolvedCwd, dir);
    let version;
    try {
      version = await readVersion(pkgPath);
    } catch (err) {
      // Distinguish root causes — each points to a different remediation.
      let actual;
      if (err.code === "ENOENT") actual = "(missing)";
      else if (err instanceof SyntaxError) actual = "(unreadable — invalid JSON)";
      else actual = `(unreadable — ${err.code ?? err.message})`;
      mismatches.push({ package: rel, expected: rootVersion, actual });
      continue;
    }

    if (version === null) {
      // File exists but has no version field — not the same as missing.
      mismatches.push({ package: rel, expected: rootVersion, actual: "(no version field)" });
      continue;
    }

    if (version !== rootVersion) {
      mismatches.push({ package: rel, expected: rootVersion, actual: version });
    } else {
      // Only count packages that are confirmed correct.
      checked.push({ package: rel, version });
    }
  }

  return {
    rootVersion,
    checked,
    mismatches,
    valid: mismatches.length === 0
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
    renderer.status("info", "verify-versions"),
    renderer.section("Usage", renderer.list(["node scripts/verify-versions.mjs [--json]"], { bullet: "-" })),
    renderer.section("Description", "Checks that all packages/* versions match the root package.json version.")
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
      const result = await verifyVersions();
      if (flags.json) {
        renderer.writeJson({ command: "verify-versions", ...result });
        if (!result.valid) process.exitCode = 1;
      } else if (result.valid) {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", `All packages are at version ${result.rootVersion}.`),
          renderer.kv([["Packages checked", String(result.checked.length)]])
        ]));
      } else {
        const details = result.mismatches
          .map((m) => `  ${m.package}: expected ${m.expected}, got ${m.actual}`)
          .join("\n");
        renderer.writeError(renderer.joinBlocks([
          renderer.status("error", "Version mismatch detected."),
          `Expected all packages to be at ${result.rootVersion}:\n${details}`,
          "Run `npm version <newversion>` from the repo root to bump all versions together,\nor manually update the mismatched package.json files."
        ]));
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "verify-versions failed",
          why: error.message,
          hint: "Run `node scripts/verify-versions.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "verify-versions failed",
        why: error.message,
        hint: "Ensure you are running from the repository root.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
