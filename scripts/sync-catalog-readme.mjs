import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateSkillManifest } from "../packages/catalog/src/index.js";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

export const CATALOG_README_PATH = path.join("catalog", "README.md");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const renderer = createTerminalRenderer();

function toLf(text) {
  return text.replaceAll("\r\n", "\n");
}

function escapeTableCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

async function readCatalogSkills(rootDir) {
  const skillsRoot = path.join(rootDir, "catalog", "skills");
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const skills = [];

  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const manifestPath = path.join(skillsRoot, entry.name, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    validateSkillManifest(manifest);
    skills.push(manifest);
  }

  return skills;
}

export function renderCatalogReadme(skills) {
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
      `| \`${skill.id}\` | ${escapeTableCell(skill.description)} | ${escapeTableCell(skill.tags.join(", "))} | ${escapeTableCell(skill.installsFor.join(", "))} |`
    );
  }

  lines.push("", "Legacy source remains under `source/legacy/agentic-structure` and is excluded from installation.");
  return lines.join("\n") + "\n";
}

export async function syncCatalogReadme({ rootDir = path.resolve(__dirname, ".."), dryRun = false } = {}) {
  const readmePath = path.join(rootDir, CATALOG_README_PATH);
  const skills = await readCatalogSkills(rootDir);
  const nextContent = renderCatalogReadme(skills);
  let currentContent = null;
  try {
    currentContent = await readFile(readmePath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
  const changed = currentContent === null ? true : toLf(currentContent) !== nextContent;

  if (changed && !dryRun) {
    await writeFile(readmePath, nextContent, "utf8");
  }

  return {
    readmePath,
    skillsCount: skills.length,
    changed,
    content: nextContent
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
    renderer.status("info", "sync-catalog-readme"),
    renderer.section("Usage", renderer.list(["node scripts/sync-catalog-readme.mjs [--check] [--json]"], { bullet: "-" }))
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
      const result = await syncCatalogReadme({ dryRun: flags.check });
      if (flags.json) {
        renderer.writeJson({
          command: "sync-catalog-readme",
          checkOnly: flags.check,
          ...result
        });
        if (flags.check && result.changed) {
          process.exitCode = 1;
        }
      } else {
        const title = flags.check
          ? result.changed ? "Catalog README drift detected." : "Catalog README is in sync."
          : "Catalog README synced.";
        renderer.write(renderer.joinBlocks([
          renderer.status(flags.check && result.changed ? "warning" : "success", title),
          renderer.kv([
            ["Skills", String(result.skillsCount)],
            ["Path", result.readmePath],
            ["Changed", result.changed ? "yes" : "no"]
          ])
        ]));
        if (flags.check && result.changed) {
          process.exitCode = 1;
        }
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
