import { cp, lstat, mkdir, readFile, realpath, rm, symlink, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { copySkillTo, loadAllSkills, renderAgentsMarkdown, verifyCatalogFiles } from "../../catalog/src/index.js";
import { detectProject, inspectProjectFiles } from "../../detectors/src/index.js";

export const DEFAULT_AGENTS = ["standard", "codex", "claude", "cursor", "gemini", "copilot", "antigravity", "windsurf", "trae"];
const MANAGED_MARKER = "<!-- Managed by skilly-hand.";
const NATIVE_SETUP_MARKER = "<!-- Managed by skilly-hand native setup.";
const DECISIONS_REGISTRY_RELATIVE_PATH = ".ai/DECISIONS.md";
const DECISIONS_REGISTRY_TEMPLATE = `# AI Decisions

Durable project memory for \`review-rangers\`. Use this file to record breaking changes, mid/high-interest solutions, and important review insights that future agents should reuse.

## Entry Criteria

- Add entries only for breaking changes, mid/high-interest solutions, architectural decisions, repeated issue patterns, or project-specific conventions with future value.
- Do not add minimal, obvious, one-off, or insignificant changes.
- Do not paste full review transcripts.
- Every change to this file must update the changelog at the end.

## Entry Template

\`\`\`md
## YYYY-MM-DD - Short Decision Title

- Interest level: Mid | High | Breaking
- Context:
- Decision / Insight:
- Rationale:
- Avoid repeating:
- Source:
\`\`\`

## Changelog

- YYYY-MM-DD: Created/updated entry "<title>" because <why>.
`;
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

export const NATIVE_ADAPTER_REGISTRY = {
  standard: {
    supported: false,
    reason: "No dedicated native instruction or hook surface is available for the standard profile."
  },
  codex: {
    supported: true,
    mode: "rule_file",
    targetPath: [".codex", "rules", "skilly-hand.md"],
    remediation: "Run `npx skilly-hand native setup --agent codex`."
  },
  claude: {
    supported: true,
    mode: "rule_file",
    targetPath: [".claude", "rules", "skilly-hand.md"],
    remediation: "Run `npx skilly-hand native setup --agent claude`."
  },
  cursor: {
    supported: true,
    mode: "rule_file",
    targetPath: [".cursor", "rules", "skilly-hand.mdc"],
    remediation: "Run `npx skilly-hand native setup --agent cursor`."
  },
  gemini: {
    supported: true,
    mode: "rule_file",
    targetPath: [".gemini", "rules", "skilly-hand.md"],
    remediation: "Run `npx skilly-hand native setup --agent gemini`."
  },
  copilot: {
    supported: true,
    mode: "rule_file",
    targetPath: [".github", "instructions", "skilly-hand.md"],
    remediation: "Run `npx skilly-hand native setup --agent copilot`."
  },
  antigravity: {
    supported: true,
    mode: "rule_file",
    targetPath: [".agents", "rules", "skilly-hand-native.md"],
    remediation: "Run `npx skilly-hand native setup --agent antigravity`."
  },
  windsurf: {
    supported: true,
    mode: "rule_file",
    targetPath: [".windsurf", "rules", "skilly-hand.md"],
    remediation: "Run `npx skilly-hand native setup --agent windsurf`."
  },
  trae: {
    supported: true,
    mode: "rule_file",
    targetPath: [".trae", "rules", "skilly-hand.md"],
    remediation: "Run `npx skilly-hand native setup --agent trae`."
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

function createLockData({ cwd, generatedAt, agents = [], skills = [], detections = [] }) {
  return {
    version: 1,
    generatedAt,
    cwd,
    agents,
    skills,
    detections,
    managedFiles: [],
    managedSymlinks: [],
    managedNativeFiles: [],
    nativeProfiles: {},
    backups: {}
  };
}

function toRelativePath(cwd, targetPath) {
  return path.relative(cwd, targetPath) || ".";
}

function resolveNativeAdapterTarget(cwd, adapter) {
  return path.join(cwd, ...adapter.targetPath);
}

function buildNativeRuleContent(agent, adapter) {
  const trigger = "Run token-optimizer before review-rangers when doing risk-heavy review passes.";
  return [
    `${NATIVE_SETUP_MARKER} Re-run \`npx skilly-hand native setup\` to regenerate. -->`,
    `# skilly-hand Native Bootstrap (${agent})`,
    "",
    `This file is managed by skilly-hand to keep native ${adapter.mode.replace("_", " ")} behavior consistent.`,
    "",
    "## Always-On Defaults",
    "- Apply AGENTS guidance from the repository root before task routing.",
    "- Enforce optimizer gate order: `token-optimizer` then `output-optimizer`.",
    "- Keep output concise by default (`step-brief`) unless user asks otherwise.",
    "",
    "## Token-Safe Review Stage",
    `- ${trigger}`,
    "- Keep review verdicts concise unless a blocker requires expanded rationale.",
    "",
    "## Sync",
    "- Regenerate this file via `npx skilly-hand native setup` after workflow updates.",
    ""
  ].join("\n");
}

function retainNativeProfilesForAgents(previousLock, selectedAgents) {
  const previousProfiles = previousLock?.nativeProfiles || {};
  const retained = {};
  for (const agent of selectedAgents) {
    if (!previousProfiles[agent]) continue;
    retained[agent] = previousProfiles[agent];
  }
  return retained;
}

function normalizeAgentList(agents) {
  if (agents == null) {
    return [...DEFAULT_AGENTS];
  }

  if (agents.length === 0) {
    return [];
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
    decisionsRegistry: {
      path: path.join(cwd, ".ai", "DECISIONS.md"),
      relativePath: DECISIONS_REGISTRY_RELATIVE_PATH,
      exists: false,
      willCreate: true
    },
    generatedAt: nowIso()
  };
}

async function planDecisionsRegistry(cwd) {
  const aiDir = path.join(cwd, ".ai");
  const registryPath = path.join(cwd, ".ai", "DECISIONS.md");

  if (await exists(aiDir)) {
    const info = await lstat(aiDir);
    if (!info.isDirectory()) {
      throw new Error("Cannot create decisions registry because .ai exists and is not a directory.");
    }
  }

  let registryExists = false;
  if (await exists(registryPath)) {
    const info = await lstat(registryPath);
    if (!info.isFile()) {
      throw new Error("Cannot use decisions registry because .ai/DECISIONS.md exists and is not a file.");
    }
    registryExists = true;
  }

  return {
    path: registryPath,
    relativePath: DECISIONS_REGISTRY_RELATIVE_PATH,
    exists: registryExists,
    willCreate: !registryExists
  };
}

async function ensureDecisionsRegistry(cwd) {
  const registry = await planDecisionsRegistry(cwd);
  if (registry.exists) {
    return registry;
  }

  await mkdir(path.dirname(registry.path), { recursive: true });
  await writeFile(registry.path, DECISIONS_REGISTRY_TEMPLATE, "utf8");
  return {
    ...registry,
    exists: true,
    willCreate: false,
    created: true
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

async function ensureManagedTextFile(targetPath, content, backupsDir, lockData, collectionKey = "managedFiles") {
  if (await exists(targetPath)) {
    const current = await readFile(targetPath, "utf8");
    if (current === content) {
      lockData[collectionKey].push(targetPath);
      return;
    }

    // Do not back up previously managed content; backups are for restoring
    // user-authored files replaced by managed files.
    if (!current.includes(MANAGED_MARKER)) {
      await backupPathIfNeeded(targetPath, backupsDir, lockData);
    }
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
  lockData[collectionKey].push(targetPath);
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

async function reconcileManagedTargets({
  previousLock,
  selectedInstructionTargets,
  selectedSkillTargets,
  selectedNativeTargets = [],
  lockData
}) {
  if (!previousLock) {
    return;
  }

  const selectedInstructions = new Set(selectedInstructionTargets);
  const selectedSkills = new Set(selectedSkillTargets);
  const selectedNatives = new Set(selectedNativeTargets);
  const selectedTargets = new Set([...selectedInstructions, ...selectedSkills, ...selectedNatives]);
  const previousBackups = previousLock.backups || {};

  for (const [targetPath, backupPath] of Object.entries(previousBackups)) {
    if (!selectedTargets.has(targetPath)) {
      continue;
    }
    if (await exists(backupPath)) {
      lockData.backups[targetPath] = backupPath;
    }
  }

  for (const symlinkPath of previousLock.managedSymlinks || []) {
    if (selectedSkills.has(symlinkPath)) {
      continue;
    }

    if (await exists(symlinkPath)) {
      await rm(symlinkPath, { recursive: true, force: true });
    }

    const backupPath = previousBackups[symlinkPath];
    if (backupPath && await exists(backupPath)) {
      await mkdir(path.dirname(symlinkPath), { recursive: true });
      await cp(backupPath, symlinkPath, { recursive: true, force: true });
    }
  }

  for (const filePath of previousLock.managedFiles || []) {
    if (selectedInstructions.has(filePath)) {
      continue;
    }

    const backupPath = previousBackups[filePath];
    if (backupPath && await exists(backupPath)) {
      await mkdir(path.dirname(filePath), { recursive: true });
      await cp(backupPath, filePath, { recursive: true, force: true });
      continue;
    }

    if (!(await exists(filePath))) {
      continue;
    }

    const content = await readFile(filePath, "utf8");
    if (content.includes(MANAGED_MARKER)) {
      await rm(filePath, { force: true });
    }
  }

  for (const filePath of previousLock.managedNativeFiles || []) {
    if (selectedNatives.has(filePath)) {
      continue;
    }

    const backupPath = previousBackups[filePath];
    if (backupPath && await exists(backupPath)) {
      await mkdir(path.dirname(filePath), { recursive: true });
      await cp(backupPath, filePath, { recursive: true, force: true });
      continue;
    }

    if (!(await exists(filePath))) {
      continue;
    }

    const content = await readFile(filePath, "utf8");
    if (content.includes(MANAGED_MARKER) || content.includes(NATIVE_SETUP_MARKER)) {
      await rm(filePath, { force: true });
    }
  }
}

export async function evaluateNativeCoverage({ cwd, agents }) {
  const selectedAgents = normalizeAgentList(agents);
  const rows = [];

  for (const agent of selectedAgents) {
    const adapter = NATIVE_ADAPTER_REGISTRY[agent];
    if (!adapter || adapter.supported === false) {
      rows.push({
        agent,
        status: "not-supported",
        mode: adapter?.mode || null,
        target: null,
        remediation: adapter?.reason || "No native setup adapter available for this agent."
      });
      continue;
    }

    const target = resolveNativeAdapterTarget(cwd, adapter);
    const relativeTarget = toRelativePath(cwd, target);
    if (!(await exists(target))) {
      rows.push({
        agent,
        status: "missing",
        mode: adapter.mode,
        target: relativeTarget,
        remediation: adapter.remediation
      });
      continue;
    }

    const content = await readFile(target, "utf8");
    const hasMarker = content.includes(NATIVE_SETUP_MARKER);
    rows.push({
      agent,
      status: hasMarker ? "configured" : "partial",
      mode: adapter.mode,
      target: relativeTarget,
      remediation: hasMarker ? "No action needed." : adapter.remediation
    });
  }

  return rows;
}

export async function setupNativeProject({
  cwd,
  agents,
  dryRun = false
}) {
  const generatedAt = nowIso();
  const installRoot = path.join(cwd, ".skilly-hand");
  const backupsDir = path.join(installRoot, "backups");
  const lockPath = path.join(installRoot, "manifest.lock.json");
  const previousLock = await exists(lockPath) ? await readJson(lockPath) : null;
  const selectedAgents = normalizeAgentList(agents ?? previousLock?.agents);
  const selectedNativeTargets = selectedAgents
    .map((agent) => NATIVE_ADAPTER_REGISTRY[agent])
    .filter((adapter) => adapter && adapter.supported)
    .map((adapter) => resolveNativeAdapterTarget(cwd, adapter));

  const nativeStatusBefore = await evaluateNativeCoverage({ cwd, agents: selectedAgents });

  const plan = {
    cwd,
    generatedAt,
    agents: selectedAgents,
    installRoot,
    nativeStatus: nativeStatusBefore
  };

  if (dryRun) {
    return {
      plan,
      applied: false
    };
  }

  await mkdir(installRoot, { recursive: true });
  await mkdir(backupsDir, { recursive: true });

  const lockData = createLockData({
    cwd,
    generatedAt,
    agents: previousLock?.agents || selectedAgents,
    skills: previousLock?.skills || [],
    detections: previousLock?.detections || []
  });

  await reconcileManagedTargets({
    previousLock,
    selectedInstructionTargets: previousLock?.managedFiles || [],
    selectedSkillTargets: previousLock?.managedSymlinks || [],
    selectedNativeTargets,
    lockData
  });

  lockData.managedFiles = [...(previousLock?.managedFiles || [])];
  lockData.managedSymlinks = [...(previousLock?.managedSymlinks || [])];

  const retainedProfiles = retainNativeProfilesForAgents(previousLock, selectedAgents);
  lockData.nativeProfiles = retainedProfiles;
  lockData.managedNativeFiles = uniq(
    Object.values(retainedProfiles)
      .flatMap((profile) => profile?.managedFiles || [])
      .filter(Boolean)
  );

  for (const agent of selectedAgents) {
    const adapter = NATIVE_ADAPTER_REGISTRY[agent];
    if (!adapter || adapter.supported === false) {
      lockData.nativeProfiles[agent] = {
        status: "not-supported",
        mode: adapter?.mode || null,
        managedFiles: [],
        target: null
      };
      continue;
    }

    const targetPath = resolveNativeAdapterTarget(cwd, adapter);
    const content = buildNativeRuleContent(agent, adapter);
    await ensureManagedTextFile(targetPath, content, backupsDir, lockData, "managedNativeFiles");
    lockData.nativeProfiles[agent] = {
      status: "configured",
      mode: adapter.mode,
      managedFiles: [targetPath],
      target: toRelativePath(cwd, targetPath)
    };
  }

  lockData.managedNativeFiles = uniq(lockData.managedNativeFiles);

  await writeJson(lockPath, lockData);

  return {
    plan,
    applied: true,
    lockPath,
    nativeStatus: await evaluateNativeCoverage({ cwd, agents: selectedAgents })
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
  plan.decisionsRegistry = await planDecisionsRegistry(cwd);

  if (dryRun) {
    return { plan, applied: false };
  }

  const installRoot = plan.installRoot;
  const targetCatalogDir = path.join(installRoot, "catalog");
  const backupsDir = path.join(installRoot, "backups");
  const lockPath = path.join(installRoot, "manifest.lock.json");
  const previousLock = await exists(lockPath) ? await readJson(lockPath) : null;
  const lockData = createLockData({
    cwd,
    generatedAt: plan.generatedAt,
    agents: selectedAgents,
    skills: skills.map((skill) => skill.id),
    detections
  });

  await mkdir(installRoot, { recursive: true });
  await mkdir(targetCatalogDir, { recursive: true });
  await mkdir(backupsDir, { recursive: true });
  const decisionsRegistry = await ensureDecisionsRegistry(cwd);
  plan.decisionsRegistry = decisionsRegistry;

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
  const absoluteInstructionTargets = instructionTargets.map((pathParts) => path.join(cwd, ...pathParts));
  const absoluteSkillTargets = skillTargets.map((pathParts) => path.join(cwd, ...pathParts));
  const retainedNativeProfiles = retainNativeProfilesForAgents(previousLock, selectedAgents);
  const retainedNativeTargets = uniq(
    Object.values(retainedNativeProfiles)
      .flatMap((profile) => profile?.managedFiles || [])
      .filter(Boolean)
  );

  await reconcileManagedTargets({
    previousLock,
    selectedInstructionTargets: absoluteInstructionTargets,
    selectedSkillTargets: absoluteSkillTargets,
    selectedNativeTargets: retainedNativeTargets,
    lockData
  });

  lockData.nativeProfiles = retainedNativeProfiles;
  lockData.managedNativeFiles = retainedNativeTargets;

  for (const targetPath of absoluteInstructionTargets) {
    await ensureManagedTextFile(targetPath, agentsMarkdown, backupsDir, lockData);
  }

  const skillsSourcePath = path.join(installRoot, "catalog");

  for (const targetPath of absoluteSkillTargets) {
    await ensureSymlink(targetPath, skillsSourcePath, backupsDir, lockData);
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

  for (const filePath of lockData.managedNativeFiles || []) {
    if (await exists(filePath)) {
      const content = await readFile(filePath, "utf8");
      if (content.includes(NATIVE_SETUP_MARKER) || content.includes(MANAGED_MARKER)) {
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
    fileStatus,
    nativeStatus: await evaluateNativeCoverage({ cwd, agents: installed ? undefined : DEFAULT_AGENTS })
  };

  if (installed) {
    const lock = await readJson(lockPath);
    result.nativeStatus = await evaluateNativeCoverage({ cwd, agents: lock.agents });
    result.lock = {
      agents: lock.agents,
      skills: lock.skills,
      generatedAt: lock.generatedAt,
      managedNativeFiles: lock.managedNativeFiles || [],
      nativeProfiles: lock.nativeProfiles || {}
    };
  }

  return result;
}
