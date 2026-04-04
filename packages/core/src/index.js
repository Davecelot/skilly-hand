import { cp, lstat, mkdir, readFile, realpath, rm, symlink, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { copySkillTo, loadAllSkills, renderAgentsMarkdown, verifyCatalogFiles } from "../../catalog/src/index.js";
import { detectProject, inspectProjectFiles } from "../../detectors/src/index.js";

export const DEFAULT_AGENTS = ["standard", "codex", "claude", "cursor", "gemini", "copilot", "antigravity", "windsurf", "trae"];
const MANAGED_MARKER = "<!-- Managed by skilly-hand.";
const AGENT_INSTALL_PROFILES = {
  standard: {
    instructionFiles: [["AGENTS.md"]],
    skillPaths: [["skills"]]
  },
  codex: {
    instructionFiles: [["AGENTS.md"]],
    skillPaths: [[".codex", "skills"]]
  },
  claude: {
    instructionFiles: [["CLAUDE.md"]],
    skillPaths: [[".claude", "skills"]]
  },
  cursor: {
    instructionFiles: [["cursor-instructions.md"]],
    skillPaths: [[".cursor", "skills"]]
  },
  gemini: {
    instructionFiles: [["GEMINI.md"]],
    skillPaths: [[".gemini", "skills"]]
  },
  copilot: {
    instructionFiles: [[".github", "copilot-instructions.md"]]
  },
  antigravity: {
    instructionFiles: [["AGENTS.md"], [".agents", "rules", "skilly-hand.md"]],
    skillPaths: [[".agents", "skills"], [".agent", "skills"]]
  },
  windsurf: {
    instructionFiles: [["AGENTS.md"]],
    skillPaths: [[".windsurf", "skills"]]
  },
  trae: {
    instructionFiles: [["AGENTS.md"]],
    skillPaths: [[".trae", "skills"]]
  }
};

function uniq(values) {
  return [...new Set(values)];
}

async function exists(targetPath) {
  try {
    await lstat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeAgentList(agents) {
  if (!agents || agents.length === 0) {
    return [...DEFAULT_AGENTS];
  }

  return uniq(agents.flatMap((item) => String(item).split(",")).map((item) => item.trim()).filter(Boolean));
}

function parseTags(input) {
  return uniq((input || []).flatMap((value) => String(value).split(",")).map((value) => value.trim()).filter(Boolean));
}

function parseSkillIds(input) {
  return uniq((input || []).flatMap((value) => String(value).split(",")).map((value) => value.trim()).filter(Boolean));
}

export function resolveSkillSelectionByIds({ catalog, selectedSkillIds = [] }) {
  const ids = parseSkillIds(selectedSkillIds);
  const portableById = new Map(
    catalog
      .filter((skill) => skill.portable)
      .map((skill) => [skill.id, skill])
  );
  const allById = new Map(catalog.map((skill) => [skill.id, skill]));

  const invalid = [];
  for (const id of ids) {
    if (!allById.has(id)) {
      invalid.push(`Unknown skill id: ${id}`);
      continue;
    }
    if (!portableById.has(id)) {
      invalid.push(`Skill is not portable: ${id}`);
    }
  }

  if (invalid.length > 0) {
    throw new Error(invalid.join("; "));
  }

  return ids.map((id) => portableById.get(id)).sort((a, b) => a.id.localeCompare(b.id));
}

export function resolveSkillSelection({ catalog, detections, includeTags = [], excludeTags = [] }) {
  const coreSkills = catalog.filter((skill) => skill.tags.includes("core"));
  const requested = new Set(coreSkills.map((skill) => skill.id));

  for (const detection of detections) {
    for (const skillId of detection.recommendedSkillIds) {
      requested.add(skillId);
    }
  }

  let selected = catalog.filter((skill) => requested.has(skill.id) && skill.portable);

  if (includeTags.length > 0) {
    selected = selected.filter((skill) => includeTags.every((tag) => skill.tags.includes(tag)));
  }

  if (excludeTags.length > 0) {
    selected = selected.filter((skill) => !excludeTags.some((tag) => skill.tags.includes(tag)));
  }

  return selected.sort((a, b) => a.id.localeCompare(b.id));
}

export function buildInstallPlan({ cwd, detections, skills, agents }) {
  return {
    cwd,
    detections,
    agents,
    skills: skills.map((skill) => ({
      id: skill.id,
      title: skill.title,
      tags: skill.tags
    })),
    installRoot: path.join(cwd, ".skilly-hand"),
    generatedAt: nowIso()
  };
}

async function backupPathIfNeeded(targetPath, backupsDir, lockData) {
  if (!(await exists(targetPath))) {
    return null;
  }

  const backupName = targetPath.replaceAll(path.sep, "__").replace(/^__+/, "");
  const backupPath = path.join(backupsDir, backupName);

  if (!(await exists(backupPath))) {
    await mkdir(path.dirname(backupPath), { recursive: true });
    await cp(targetPath, backupPath, { recursive: true, force: true });
  }

  lockData.backups[targetPath] = backupPath;
  return backupPath;
}

async function ensureManagedTextFile(targetPath, content, backupsDir, lockData) {
  if (await exists(targetPath)) {
    const current = await readFile(targetPath, "utf8");
    if (current === content) {
      lockData.managedFiles.push(targetPath);
      return;
    }

    await backupPathIfNeeded(targetPath, backupsDir, lockData);
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
  lockData.managedFiles.push(targetPath);
}

async function ensureSymlink(targetPath, sourcePath, backupsDir, lockData) {
  if (await exists(targetPath)) {
    const info = await lstat(targetPath);
    if (info.isSymbolicLink()) {
      const resolved = await realpath(targetPath);
      if (resolved === sourcePath) {
        lockData.managedSymlinks.push(targetPath);
        return;
      }

      await unlink(targetPath);
    } else {
      await backupPathIfNeeded(targetPath, backupsDir, lockData);
      await rm(targetPath, { recursive: true, force: true });
    }
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await symlink(sourcePath, targetPath, "dir");
  lockData.managedSymlinks.push(targetPath);
}

function buildInstallTargets(selectedAgents) {
  const instructionTargets = new Map();
  const skillTargets = new Map();

  for (const agent of selectedAgents) {
    const profile = AGENT_INSTALL_PROFILES[agent];
    if (!profile) {
      continue;
    }

    for (const pathParts of profile.instructionFiles || []) {
      instructionTargets.set(path.join(...pathParts), pathParts);
    }

    for (const pathParts of profile.skillPaths || []) {
      skillTargets.set(path.join(...pathParts), pathParts);
    }
  }

  return {
    instructionTargets: [...instructionTargets.values()],
    skillTargets: [...skillTargets.values()]
  };
}

export async function installProject({
  cwd,
  agents,
  dryRun = false,
  includeTags = [],
  excludeTags = [],
  selectedSkillIds
}) {
  const selectedAgents = normalizeAgentList(agents);
  const catalog = await loadAllSkills();
  const detections = await detectProject(cwd);
  const skills = selectedSkillIds !== undefined && selectedSkillIds !== null
    ? resolveSkillSelectionByIds({ catalog, selectedSkillIds })
    : resolveSkillSelection({
        catalog,
        detections,
        includeTags: parseTags(includeTags),
        excludeTags: parseTags(excludeTags)
      });
  const plan = buildInstallPlan({ cwd, detections, skills, agents: selectedAgents });

  if (dryRun) {
    return { plan, applied: false };
  }

  const installRoot = plan.installRoot;
  const targetCatalogDir = path.join(installRoot, "catalog");
  const backupsDir = path.join(installRoot, "backups");
  const lockPath = path.join(installRoot, "manifest.lock.json");
  const lockData = {
    version: 1,
    generatedAt: plan.generatedAt,
    cwd,
    agents: selectedAgents,
    skills: skills.map((skill) => skill.id),
    detections,
    managedFiles: [],
    managedSymlinks: [],
    backups: {}
  };

  await mkdir(installRoot, { recursive: true });
  await mkdir(targetCatalogDir, { recursive: true });
  await mkdir(backupsDir, { recursive: true });

  for (const skill of skills) {
    await copySkillTo(targetCatalogDir, skill.id);
  }

  const agentsMarkdown = renderAgentsMarkdown({
    skills,
    detections,
    generatedAt: plan.generatedAt,
    projectName: path.basename(cwd)
  });

  await writeFile(path.join(installRoot, "AGENTS.md"), agentsMarkdown, "utf8");

  const { instructionTargets, skillTargets } = buildInstallTargets(selectedAgents);

  for (const pathParts of instructionTargets) {
    await ensureManagedTextFile(path.join(cwd, ...pathParts), agentsMarkdown, backupsDir, lockData);
  }

  const skillsSourcePath = path.join(installRoot, "catalog");

  for (const pathParts of skillTargets) {
    await ensureSymlink(path.join(cwd, ...pathParts), skillsSourcePath, backupsDir, lockData);
  }

  await writeJson(lockPath, lockData);

  return { plan, applied: true, lockPath };
}

export async function uninstallProject(cwd) {
  const installRoot = path.join(cwd, ".skilly-hand");
  const lockPath = path.join(installRoot, "manifest.lock.json");

  if (!(await exists(lockPath))) {
    return { removed: false, reason: "No skilly-hand installation found." };
  }

  const lockData = await readJson(lockPath);

  for (const symlinkPath of lockData.managedSymlinks || []) {
    if (await exists(symlinkPath)) {
      await rm(symlinkPath, { recursive: true, force: true });
    }
  }

  for (const filePath of lockData.managedFiles || []) {
    if (await exists(filePath)) {
      const content = await readFile(filePath, "utf8");
      if (content.includes(MANAGED_MARKER)) {
        await rm(filePath, { force: true });
      }
    }
  }

  for (const [targetPath, backupPath] of Object.entries(lockData.backups || {})) {
    if (await exists(backupPath)) {
      await mkdir(path.dirname(targetPath), { recursive: true });
      await cp(backupPath, targetPath, { recursive: true, force: true });
    }
  }

  await rm(installRoot, { recursive: true, force: true });
  return { removed: true };
}

export async function runDoctor(cwd) {
  const installRoot = path.join(cwd, ".skilly-hand");
  const lockPath = path.join(installRoot, "manifest.lock.json");
  const fileStatus = await inspectProjectFiles(cwd);
  const catalogIssues = await verifyCatalogFiles();
  const installed = await exists(lockPath);
  const result = {
    cwd,
    installed,
    catalogIssues,
    fileStatus
  };

  if (installed) {
    const lock = await readJson(lockPath);
    result.lock = {
      agents: lock.agents,
      skills: lock.skills,
      generatedAt: lock.generatedAt
    };
  }

  return result;
}
