import { writeFile, chmod, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();

const INSTALLER_MARKER = "# Installed by: npm run setup:hooks";

const HOOK_CONTENT = `#!/bin/sh
${INSTALLER_MARKER}
# Checks that all packages/* versions match the root package.json version.
npm run verify:versions --silent
`;

export async function setupHooks({ cwd = process.cwd(), force = false } = {}) {
  const resolvedCwd = path.resolve(cwd);
  const hooksDir = path.join(resolvedCwd, ".git", "hooks");
  const hookPath = path.join(hooksDir, "pre-commit");

  // Verify this is a git repo
  try {
    await readFile(path.join(resolvedCwd, ".git", "HEAD"), "utf8");
  } catch {
    throw new Error("No .git directory found. Run this from the repository root.");
  }

  // Detect pre-existing hook installed by a different tool
  try {
    const existing = await readFile(hookPath, "utf8");
    if (!existing.includes(INSTALLER_MARKER) && !force) {
      throw new Error(
        "A pre-commit hook already exists and was not installed by this script.\n" +
        "Run with --force to overwrite it, or inspect it first: cat .git/hooks/pre-commit"
      );
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    // ENOENT = no existing hook, safe to proceed
  }

  await mkdir(hooksDir, { recursive: true });
  await writeFile(hookPath, HOOK_CONTENT, "utf8");
  await chmod(hookPath, 0o755);

  return { hookPath: path.relative(resolvedCwd, hookPath) };
}

function parseArgs(argv) {
  const flags = { json: false, help: false, force: false };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else if (token === "--force") flags.force = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "setup-hooks"),
    renderer.section("Usage", renderer.list(["node scripts/setup-hooks.mjs [--force] [--json]"], { bullet: "-" })),
    renderer.section("Description", "Installs a git pre-commit hook that runs verify:versions before each commit.\nSafe to re-run. Use --force to overwrite a pre-existing hook from another tool.")
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
      const result = await setupHooks({ force: flags.force });
      if (flags.json) {
        renderer.writeJson({ command: "setup-hooks", ok: true, ...result });
      } else {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Git pre-commit hook installed."),
          renderer.kv([["Hook path", result.hookPath]])
        ]));
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "setup-hooks failed",
          why: error.message,
          hint: "Run `node scripts/setup-hooks.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "setup-hooks failed",
        why: error.message,
        hint: "Ensure you are running from the repository root.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
