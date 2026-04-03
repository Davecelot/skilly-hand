import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderAgentsMarkdown, validateSkillManifest } from "../packages/catalog/src/index.js";
import { detectProject } from "../packages/detectors/src/index.js";

const DETERMINISTIC_GENERATED_AT = "self-sync";

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
  const flags = {};
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--cwd") flags.cwd = args.shift();
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  console.log(`sync-self-agentic

Usage:
  node scripts/sync-self-agentic.mjs [--cwd <path>]

Flags:
  --cwd <path>                    Project root to sync (defaults to current working directory)
`);
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.help) {
    printHelp();
  } else {
    const result = await syncSelfAgentic({
      cwd: flags.cwd
    });

    console.log(`Synced self-agentic structure for ${result.cwd}`);
    console.log(`Skills: ${result.skills.join(", ")}`);
    console.log(`Files written: ${result.writtenFiles.length === 0 ? "none" : result.writtenFiles.join(", ")}`);
  }
}
