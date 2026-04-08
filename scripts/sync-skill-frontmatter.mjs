import path from "node:path";
import { fileURLToPath } from "node:url";
import { syncSkillFrontmatter } from "../packages/catalog/src/index.js";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();

export async function syncSkillFrontmatterScript({ skillId } = {}) {
  return syncSkillFrontmatter({ skillId });
}

function parseArgs(argv) {
  const flags = { json: false, check: false };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--check") flags.check = true;
    else if (token === "--skill") {
      const value = args.shift();
      if (!value || value.startsWith("-")) {
        throw new Error("Missing value for --skill");
      }
      flags.skillId = value;
    }
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "sync-skill-frontmatter"),
    renderer.section(
      "Usage",
      renderer.list(["node scripts/sync-skill-frontmatter.mjs [--check] [--skill <skill-id>] [--json]"], { bullet: "-" })
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
      const result = await syncSkillFrontmatter({
        skillId: flags.skillId,
        dryRun: flags.check
      });
      if (flags.json) {
        renderer.writeJson({
          command: "sync-skill-frontmatter",
          checkOnly: flags.check,
          ...result
        });
        if (flags.check && result.updatedSkillIds.length > 0) {
          process.exitCode = 1;
        }
      } else {
        const hasDrift = result.updatedSkillIds.length > 0;
        const statusLine = flags.check
          ? renderer.status(hasDrift ? "warning" : "success", hasDrift ? "Skill frontmatter drift detected." : "Skill frontmatter is in sync.")
          : renderer.status("success", "Skill frontmatter synced.");
        renderer.write(renderer.joinBlocks([
          statusLine,
          renderer.kv([
            ["Skills checked", String(result.skillCount)],
            ["Skills updated", hasDrift ? result.updatedSkillIds.join(", ") : "none"]
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
          what: "sync-skill-frontmatter failed",
          why: error.message,
          hint: "Run `node scripts/sync-skill-frontmatter.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "sync-skill-frontmatter failed",
        why: error.message,
        hint: "Ensure all skill manifests and SKILL.md files are valid before syncing.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
