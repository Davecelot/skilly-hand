import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderAgentsMarkdown, validateSkillManifest } from "../packages/catalog/src/index.js";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";
import { detectProject } from "../packages/detectors/src/index.js";

const DETERMINISTIC_GENERATED_AT = "self-sync";
const renderer = createTerminalRenderer();

async function exists(targetPath) {
  try {
    await lstat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readCatalogSkills(cwd) {
  const skillsRoot = path.join(cwd, "catalog", "skills");
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

async function ensureManagedFile(rootCwd, relativePath, content) {
  const targetPath = path.join(rootCwd, relativePath);
  const current = (await exists(targetPath)) ? await readFile(targetPath, "utf8") : null;
  if (current === content) {
    return false;
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
  return true;
}

export async function syncSelfAgentic({ cwd = process.cwd() } = {}) {
  const rootCwd = path.resolve(cwd);
  const catalogSkills = await readCatalogSkills(rootCwd);
  const detections = await detectProject(rootCwd);
  const agentsMarkdown = renderAgentsMarkdown({
    skills: catalogSkills,
    detections,
    generatedAt: DETERMINISTIC_GENERATED_AT,
    projectName: path.basename(rootCwd)
  });

  const writtenFiles = [];
  if (await ensureManagedFile(rootCwd, "AGENTS.md", agentsMarkdown)) {
    writtenFiles.push("AGENTS.md");
  }

  return {
    cwd: rootCwd,
    detections,
    skills: catalogSkills.map((skill) => skill.id),
    writtenFiles
  };
}

function parseArgs(argv) {
  const flags = { json: false };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--cwd") {
      const value = args.shift();
      if (!value || value.startsWith("-")) {
        throw new Error("Missing value for --cwd");
      }
      flags.cwd = value;
    }
    else if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "sync-self-agentic"),
    renderer.section(
      "Usage",
      renderer.list(["node scripts/sync-self-agentic.mjs [--cwd <path>] [--json]"], { bullet: "-" })
    ),
    renderer.section(
      "Flags",
      renderer.list([
        "--cwd <path>    Project root to sync (defaults to current working directory)",
        "--json          Emit stable JSON output for automation"
      ], { bullet: "-" })
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
      const result = await syncSelfAgentic({
        cwd: flags.cwd
      });

      if (flags.json) {
        renderer.writeJson({
          command: "sync-self-agentic",
          ...result
        });
      } else {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Self-agentic structure synced."),
          renderer.kv([
            ["Project", result.cwd],
            ["Skills", result.skills.join(", ")],
            ["Files written", result.writtenFiles.length === 0 ? "none" : result.writtenFiles.join(", ")]
          ])
        ]));
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "sync-self-agentic failed",
          why: error.message,
          hint: "Run `node scripts/sync-self-agentic.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "sync-self-agentic failed",
        why: error.message,
        hint: "Run `node scripts/sync-self-agentic.mjs --help` for usage.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
