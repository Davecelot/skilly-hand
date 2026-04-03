import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAllSkills } from "../packages/catalog/src/index.js";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const renderer = createTerminalRenderer();

export async function syncCatalogReadme({ rootDir = path.resolve(__dirname, "..") } = {}) {
  const readmePath = path.join(rootDir, "catalog", "README.md");
  const skills = await loadAllSkills();
  const lines = [
    "# Portable Catalog",
    "",
    "Published portable skills consumed by the `skilly-hand` CLI.",
    "",
    "| Skill | Description | Tags | Installs For |",
    "| ----- | ----------- | ---- | ------------ |"
  ];

  for (const skill of skills) {
    lines.push(
      `| \`${skill.id}\` | ${skill.description} | ${skill.tags.join(", ")} | ${skill.installsFor.join(", ")} |`
    );
  }

  lines.push("", "Legacy source remains under `source/legacy/agentic-structure` and is excluded from installation.");
  await writeFile(readmePath, lines.join("\n") + "\n", "utf8");

  return {
    readmePath,
    skillsCount: skills.length
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
    renderer.status("info", "sync-catalog-readme"),
    renderer.section("Usage", renderer.list(["node scripts/sync-catalog-readme.mjs [--json]"], { bullet: "-" }))
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
      const result = await syncCatalogReadme();
      if (flags.json) {
        renderer.writeJson({
          command: "sync-catalog-readme",
          ...result
        });
      } else {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Catalog README synced."),
          renderer.kv([
            ["Skills", String(result.skillsCount)],
            ["Path", result.readmePath]
          ])
        ]));
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "sync-catalog-readme failed",
          why: error.message,
          hint: "Run `node scripts/sync-catalog-readme.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "sync-catalog-readme failed",
        why: error.message,
        hint: "Ensure catalog manifests are valid before syncing README.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
