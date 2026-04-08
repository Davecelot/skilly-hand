import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { planSkillFrontmatterSync } from "../packages/catalog/src/index.js";
import { syncCatalogReadme } from "./sync-catalog-readme.mjs";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();

export async function syncCatalog({
  checkOnly = false,
  io = {}
} = {}) {
  const planReadme = io.planReadme || (async () => syncCatalogReadme({ dryRun: true }));
  const planFrontmatter = io.planFrontmatter || (async () => planSkillFrontmatterSync());
  const writeTextFile = io.writeTextFile || (async (targetPath, content) => writeFile(targetPath, content, "utf8"));
  const readTextFile = io.readTextFile || (async (targetPath) => readFile(targetPath, "utf8"));
  const removeFile = io.removeFile || (async (targetPath) => rm(targetPath, { force: true }));

  // Compute all outputs first; do not write anything before this succeeds.
  const readme = await planReadme();
  const frontmatter = await planFrontmatter();

  const writes = [];
  if (readme.changed) {
    writes.push({ path: readme.readmePath, content: readme.content });
  }
  for (const update of frontmatter.updates) {
    writes.push({ path: update.path, content: update.content });
  }

  if (!checkOnly) {
    const originals = new Map();
    for (const write of writes) {
      try {
        originals.set(write.path, await readTextFile(write.path));
      } catch (error) {
        if (error?.code === "ENOENT") {
          originals.set(write.path, null);
        } else {
          throw error;
        }
      }
    }

    const applied = [];
    try {
      for (const write of writes) {
        await writeTextFile(write.path, write.content);
        applied.push(write.path);
      }
    } catch (error) {
      for (const targetPath of applied.reverse()) {
        const original = originals.get(targetPath);
        if (original === null) {
          await removeFile(targetPath);
        } else {
          await writeTextFile(targetPath, original);
        }
      }
      throw error;
    }
  }

  return {
    readmeChanged: readme.changed,
    skillCount: frontmatter.skillCount,
    updatedSkillIds: frontmatter.updatedSkillIds,
    changedFiles: writes.map((item) => item.path)
  };
}

function parseArgs(argv) {
  const flags = { json: false, check: false };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--check") flags.check = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "sync-catalog"),
    renderer.section(
      "Usage",
      renderer.list(["node scripts/sync-catalog.mjs [--check] [--json]"], { bullet: "-" })
    )
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
      const result = await syncCatalog({ checkOnly: flags.check });
      const hasDrift = result.changedFiles.length > 0;

      if (flags.json) {
        renderer.writeJson({
          command: "sync-catalog",
          checkOnly: flags.check,
          ...result
        });
        if (flags.check && hasDrift) {
          process.exitCode = 1;
        }
      } else {
        renderer.write(renderer.joinBlocks([
          renderer.status(
            flags.check && hasDrift ? "warning" : "success",
            flags.check
              ? hasDrift ? "Catalog drift detected." : "Catalog is in sync."
              : "Catalog synced."
          ),
          renderer.kv([
            ["README changed", result.readmeChanged ? "yes" : "no"],
            ["Skills checked", String(result.skillCount)],
            ["Skills updated", result.updatedSkillIds.length === 0 ? "none" : result.updatedSkillIds.join(", ")],
            ["Changed files", hasDrift ? String(result.changedFiles.length) : "0"]
          ])
        ]));
        if (flags.check && hasDrift) {
          process.exitCode = 1;
        }
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "sync-catalog failed",
          why: error.message,
          hint: "Run `node scripts/sync-catalog.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "sync-catalog failed",
        why: error.message,
        hint: "Ensure catalog manifests and SKILL.md files are valid before syncing.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
