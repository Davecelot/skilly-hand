import path from "node:path";
import { access, cp, mkdir, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadAllSkills } from "../packages/catalog/src/index.js";
import { runCli } from "../packages/cli/src/bin.js";
import { DEFAULT_AGENTS, installProject, runDoctor, uninstallProject } from "../packages/core/src/index.js";

const AGENT_INSTALL_PROFILES = {
  standard: {
    instructionFiles: ["AGENTS.md"],
    skillPaths: ["skills"]
  },
  codex: {
    instructionFiles: ["AGENTS.md"],
    skillPaths: [path.join(".codex", "skills")]
  },
  claude: {
    instructionFiles: ["CLAUDE.md"],
    skillPaths: [path.join(".claude", "skills")]
  },
  cursor: {
    instructionFiles: ["cursor-instructions.md"],
    skillPaths: [path.join(".cursor", "skills")]
  },
  gemini: {
    instructionFiles: ["GEMINI.md"],
    skillPaths: [path.join(".gemini", "skills")]
  },
  copilot: {
    instructionFiles: [path.join(".github", "copilot-instructions.md")],
    skillPaths: []
  },
  antigravity: {
    instructionFiles: ["AGENTS.md", path.join(".agents", "rules", "skilly-hand.md")],
    skillPaths: [path.join(".agents", "skills"), path.join(".agent", "skills")]
  },
  windsurf: {
    instructionFiles: ["AGENTS.md"],
    skillPaths: [path.join(".windsurf", "skills")]
  },
  trae: {
    instructionFiles: ["AGENTS.md"],
    skillPaths: [path.join(".trae", "skills")]
  }
};

function uniq(values) {
  return [...new Set(values)];
}

function equalArrays(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseJsonPayload(raw, commandName) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${commandName} did not return valid JSON output.`);
  }
}

function runCliCommand({ repoRoot, cwd, args }) {
  const cliPath = path.join(repoRoot, "packages", "cli", "src", "bin.js");
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      NO_COLOR: "1",
      NODE_NO_WARNINGS: "1"
    }
  });
}

function createWritable(isTTY) {
  let buffer = "";
  return {
    isTTY,
    write(chunk) {
      buffer += String(chunk);
    },
    value() {
      return buffer;
    }
  };
}

function createPromptMock({
  selectValues = [],
  checkboxValues = [],
  confirmValues = []
} = {}) {
  let selectIndex = 0;
  let checkboxIndex = 0;
  let confirmIndex = 0;

  return {
    async select() {
      if (selectIndex >= selectValues.length) throw new Error("No mock select value available");
      const value = selectValues[selectIndex];
      selectIndex += 1;
      return value;
    },
    async checkbox() {
      if (checkboxIndex >= checkboxValues.length) throw new Error("No mock checkbox value available");
      const value = checkboxValues[checkboxIndex];
      checkboxIndex += 1;
      return value;
    },
    async confirm() {
      if (confirmIndex >= confirmValues.length) throw new Error("No mock confirm value available");
      const value = confirmValues[confirmIndex];
      confirmIndex += 1;
      return value;
    }
  };
}

async function assertPathExists(baseDir, relativePath) {
  await access(path.join(baseDir, relativePath));
}

async function assertPathMissing(baseDir, relativePath) {
  try {
    await access(path.join(baseDir, relativePath));
  } catch {
    return;
  }
  throw new Error(`Expected path to be absent but found: ${relativePath}`);
}

async function readLock(workspace) {
  const lockPath = path.join(workspace, ".skilly-hand", "manifest.lock.json");
  return parseJsonPayload(await readFile(lockPath, "utf8"), "manifest.lock.json");
}

function resolveExpectedTargets(agents) {
  const selected = agents.length > 0 ? agents : DEFAULT_AGENTS;
  const instructions = [];
  const symlinks = [];

  for (const agent of selected) {
    const profile = AGENT_INSTALL_PROFILES[agent];
    if (!profile) continue;
    instructions.push(...profile.instructionFiles);
    symlinks.push(...profile.skillPaths);
  }

  return {
    instructions: uniq(instructions).sort(),
    symlinks: uniq(symlinks).sort()
  };
}

async function assertAgentArtifacts({ workspace, agents }) {
  const { instructions, symlinks } = resolveExpectedTargets(agents);

  for (const target of instructions) {
    await assertPathExists(workspace, target);
  }

  for (const target of symlinks) {
    await assertPathExists(workspace, target);
  }
}

async function ensureScenarioWorkspace({ repoRoot, scenarioName, fixtureName = "no-stack" }) {
  const scenariosRoot = resolveSandboxScenariosPath({ repoRoot });
  const fixturePath = path.join(repoRoot, "tests", "fixtures", fixtureName);
  const workspace = path.join(scenariosRoot, scenarioName);

  await mkdir(scenariosRoot, { recursive: true });
  await rm(workspace, { recursive: true, force: true });
  await cp(fixturePath, workspace, { recursive: true });

  return workspace;
}

async function runScenario(name, runner) {
  await runner();
  return { name, ok: true };
}

async function scenarioInstallFewSkills({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-few-skills", fixtureName: "react-vite" });
  const selectedSkillIds = ["token-optimizer", "spec-driven-development", "review-rangers"];

  const installResult = await installProject({
    cwd: workspace,
    agents: ["codex"],
    selectedSkillIds
  });

  assertCondition(installResult.applied === true, "few-skills install should apply changes");

  const lock = await readLock(workspace);
  assertCondition(equalArrays([...lock.skills].sort(), [...selectedSkillIds].sort()), "few-skills lock should match requested skills");
  assertCondition(equalArrays(lock.agents, ["codex"]), "few-skills lock should include codex only");

  await assertAgentArtifacts({ workspace, agents: ["codex"] });

  const uninstallResult = await uninstallProject(workspace);
  assertCondition(uninstallResult.removed === true, "few-skills uninstall should remove install");
  await assertPathMissing(workspace, ".skilly-hand");
}

async function scenarioInstallAllSkillsCore({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-all-skills-core", fixtureName: "no-stack" });
  const catalog = await loadAllSkills();
  const allPortableSkillIds = catalog.filter((skill) => skill.portable).map((skill) => skill.id);

  const installResult = await installProject({
    cwd: workspace,
    agents: ["codex"],
    selectedSkillIds: allPortableSkillIds
  });

  assertCondition(installResult.applied === true, "all-skills core install should apply changes");

  const lock = await readLock(workspace);
  assertCondition(lock.skills.length === allPortableSkillIds.length, "all-skills core lock count mismatch");
  assertCondition(equalArrays([...lock.skills].sort(), [...allPortableSkillIds].sort()), "all-skills core lock contents mismatch");

  await uninstallProject(workspace);
}

async function scenarioInstallAllSkillsCliPath({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-all-skills-cli", fixtureName: "no-stack" });
  const catalog = await loadAllSkills();
  const allPortableSkillIds = catalog.filter((skill) => skill.portable).map((skill) => skill.id).sort();

  const stdout = createWritable(true);
  const stderr = createWritable(true);
  const prompt = createPromptMock({
    selectValues: ["install", "exit"],
    checkboxValues: [allPortableSkillIds, ["codex"]],
    confirmValues: [false]
  });

  await runCli({
    argv: [],
    stdout,
    stderr,
    env: { ...process.env, NO_COLOR: "1", TERM: "xterm-256color" },
    platform: process.platform,
    prompt,
    cwdResolver: () => workspace
  });

  assertCondition(/Dry run complete/.test(stdout.value()), "all-skills CLI path should render dry-run output");
  assertCondition(/Installation cancelled/.test(stdout.value()), "all-skills CLI path should support cancel after preview");
  await assertPathMissing(workspace, ".skilly-hand");
}

async function scenarioInstallOneEnvironment({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-one-environment", fixtureName: "no-stack" });
  const installResult = runCliCommand({
    repoRoot,
    cwd: workspace,
    args: ["install", "--yes", "--agent", "codex"]
  });

  assertCondition(installResult.status === 0, `one-environment CLI install failed:\n${installResult.stderr || installResult.stdout}`);

  await assertAgentArtifacts({ workspace, agents: ["codex"] });

  const doctorResult = runCliCommand({ repoRoot, cwd: workspace, args: ["doctor", "--json"] });
  assertCondition(doctorResult.status === 0, "one-environment doctor should succeed");

  const doctorPayload = parseJsonPayload(doctorResult.stdout, "doctor");
  assertCondition(doctorPayload.installed === true, "one-environment doctor should report installed=true");
  assertCondition(equalArrays(doctorPayload.lock.agents, ["codex"]), "one-environment lock agents mismatch");

  const uninstallResult = runCliCommand({ repoRoot, cwd: workspace, args: ["uninstall", "--yes"] });
  assertCondition(uninstallResult.status === 0, "one-environment uninstall should succeed");
  await assertPathMissing(workspace, ".skilly-hand");
}

async function scenarioInstallFewEnvironments({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-few-environments", fixtureName: "no-stack" });
  const selectedAgents = ["codex", "claude", "copilot"];

  const installResult = runCliCommand({
    repoRoot,
    cwd: workspace,
    args: ["install", "--yes", "--agent", "codex", "--agent", "claude", "--agent", "copilot"]
  });
  assertCondition(installResult.status === 0, "few-environments install should succeed");

  await assertAgentArtifacts({ workspace, agents: selectedAgents });

  const lock = await readLock(workspace);
  assertCondition(equalArrays(lock.agents, selectedAgents), "few-environments lock agents mismatch");

  await assertPathMissing(workspace, "GEMINI.md");
  await assertPathMissing(workspace, "cursor-instructions.md");
  await assertPathMissing(workspace, path.join(".cursor", "skills"));
  await assertPathMissing(workspace, path.join(".gemini", "skills"));

  await uninstallProject(workspace);
}

async function scenarioInstallAllEnvironments({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-all-environments", fixtureName: "no-stack" });

  const installResult = await installProject({
    cwd: workspace,
    agents: DEFAULT_AGENTS
  });
  assertCondition(installResult.applied === true, "all-environments core install should apply changes");

  await assertAgentArtifacts({ workspace, agents: DEFAULT_AGENTS });

  const lock = await readLock(workspace);
  assertCondition(equalArrays(lock.agents, DEFAULT_AGENTS), "all-environments lock should match DEFAULT_AGENTS");

  await uninstallProject(workspace);
}

async function scenarioDetectStackSignals({ repoRoot }) {
  const reactWorkspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "detect-react", fixtureName: "react-vite" });
  const angularWorkspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "detect-angular", fixtureName: "angular-app" });
  const noStackWorkspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "detect-no-stack", fixtureName: "no-stack" });

  const reactDetect = runCliCommand({ repoRoot, cwd: reactWorkspace, args: ["detect", "--json"] });
  const angularDetect = runCliCommand({ repoRoot, cwd: angularWorkspace, args: ["detect", "--json"] });
  const noStackDetect = runCliCommand({ repoRoot, cwd: noStackWorkspace, args: ["detect", "--json"] });

  assertCondition(reactDetect.status === 0, "react detect should succeed");
  assertCondition(angularDetect.status === 0, "angular detect should succeed");
  assertCondition(noStackDetect.status === 0, "no-stack detect should succeed");

  const reactPayload = parseJsonPayload(reactDetect.stdout, "detect react");
  const angularPayload = parseJsonPayload(angularDetect.stdout, "detect angular");
  const noStackPayload = parseJsonPayload(noStackDetect.stdout, "detect no-stack");

  const reactTech = reactPayload.detections.map((d) => d.technology);
  const angularTech = angularPayload.detections.map((d) => d.technology);

  assertCondition(reactTech.includes("react"), "react detect should include react technology");
  assertCondition(reactTech.includes("vite"), "react detect should include vite technology");
  assertCondition(angularTech.includes("angular"), "angular detect should include angular technology");
  assertCondition(noStackPayload.count === 0, "no-stack detect should have zero detections");
}

async function scenarioDoctorLifecycle({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "doctor-lifecycle", fixtureName: "no-stack" });

  const before = await runDoctor(workspace);
  assertCondition(before.installed === false, "doctor before install should report installed=false");

  await installProject({ cwd: workspace, agents: ["codex"] });

  const afterInstall = await runDoctor(workspace);
  assertCondition(afterInstall.installed === true, "doctor after install should report installed=true");
  assertCondition(equalArrays(afterInstall.lock.agents, ["codex"]), "doctor after install lock agents mismatch");

  await uninstallProject(workspace);

  const afterUninstall = await runDoctor(workspace);
  assertCondition(afterUninstall.installed === false, "doctor after uninstall should report installed=false");
}

async function scenarioGeneralCliInteractions({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "general-cli", fixtureName: "react-vite" });

  const help = runCliCommand({ repoRoot, cwd: workspace, args: ["--help"] });
  assertCondition(help.status === 0, "help should succeed");
  assertCondition(/Usage/.test(help.stdout), "help output should include Usage");

  const list = runCliCommand({ repoRoot, cwd: workspace, args: ["list", "--json"] });
  assertCondition(list.status === 0, "list --json should succeed");
  const listPayload = parseJsonPayload(list.stdout, "list");
  assertCondition(listPayload.command === "list", "list payload should include command=list");
  assertCondition(listPayload.count > 0, "list payload should include at least one skill");

  const detect = runCliCommand({ repoRoot, cwd: workspace, args: ["detect", "--json"] });
  assertCondition(detect.status === 0, "detect --json should succeed");
  const detectPayload = parseJsonPayload(detect.stdout, "detect");
  assertCondition(detectPayload.command === "detect", "detect payload should include command=detect");

  const installDryRun = runCliCommand({ repoRoot, cwd: workspace, args: ["install", "--dry-run", "--json", "--agent", "codex"] });
  assertCondition(installDryRun.status === 0, "install --dry-run --json should succeed");
  const installDryRunPayload = parseJsonPayload(installDryRun.stdout, "install dry-run");
  assertCondition(installDryRunPayload.command === "install", "install payload should include command=install");
  assertCondition(installDryRunPayload.applied === false, "install dry-run payload should include applied=false");

  const installApply = runCliCommand({ repoRoot, cwd: workspace, args: ["install", "--yes", "--json", "--agent", "codex"] });
  assertCondition(installApply.status === 0, "install --yes --json should succeed");
  const installApplyPayload = parseJsonPayload(installApply.stdout, "install apply");
  assertCondition(installApplyPayload.applied === true, "install apply payload should include applied=true");

  const doctor = runCliCommand({ repoRoot, cwd: workspace, args: ["doctor", "--json"] });
  assertCondition(doctor.status === 0, "doctor --json should succeed");
  const doctorPayload = parseJsonPayload(doctor.stdout, "doctor");
  assertCondition(doctorPayload.command === "doctor", "doctor payload should include command=doctor");
  assertCondition(doctorPayload.installed === true, "doctor payload should include installed=true");

  const uninstall = runCliCommand({ repoRoot, cwd: workspace, args: ["uninstall", "--yes", "--json"] });
  assertCondition(uninstall.status === 0, "uninstall --json should succeed");
  const uninstallPayload = parseJsonPayload(uninstall.stdout, "uninstall");
  assertCondition(uninstallPayload.command === "uninstall", "uninstall payload should include command=uninstall");
  assertCondition(uninstallPayload.removed === true, "uninstall payload should include removed=true");

  const uninstallAgain = runCliCommand({ repoRoot, cwd: workspace, args: ["uninstall", "--yes", "--json"] });
  assertCondition(uninstallAgain.status === 0, "second uninstall --json should succeed");
  const uninstallAgainPayload = parseJsonPayload(uninstallAgain.stdout, "uninstall again");
  assertCondition(uninstallAgainPayload.removed === false, "second uninstall should report removed=false");

  const unknownCommand = runCliCommand({ repoRoot, cwd: workspace, args: ["unknown-command", "--json"] });
  assertCondition(unknownCommand.status === 1, "unknown command should exit with status 1");
  const unknownPayload = parseJsonPayload(unknownCommand.stderr, "unknown command");
  assertCondition(unknownPayload.ok === false, "unknown command JSON should include ok=false");
  assertCondition(/Unknown command/.test(unknownPayload.error.why), "unknown command JSON should explain unknown command");
}

async function scenarioInstallAndUninstallLifecycle({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-uninstall-lifecycle", fixtureName: "node-basic" });

  const installResult = await installProject({
    cwd: workspace,
    agents: ["codex", "claude", "copilot"]
  });
  assertCondition(installResult.applied === true, "lifecycle install should apply changes");

  const lock = await readLock(workspace);
  assertCondition(equalArrays(lock.agents, ["codex", "claude", "copilot"]), "lifecycle lock agents mismatch");

  await assertPathExists(workspace, "AGENTS.md");
  await assertPathExists(workspace, "CLAUDE.md");
  await assertPathExists(workspace, path.join(".github", "copilot-instructions.md"));
  await assertPathExists(workspace, path.join(".codex", "skills"));
  await assertPathExists(workspace, path.join(".claude", "skills"));

  const uninstallResult = await uninstallProject(workspace);
  assertCondition(uninstallResult.removed === true, "lifecycle uninstall should remove installation");
  await assertPathMissing(workspace, ".skilly-hand");
  await assertPathMissing(workspace, "CLAUDE.md");
  await assertPathMissing(workspace, path.join(".github", "copilot-instructions.md"));
}

export function resolveSandboxProjectPath({ repoRoot = path.resolve(".") } = {}) {
  return path.join(repoRoot, "sandbox");
}

export function resolveSandboxScenariosPath({ repoRoot = path.resolve(".") } = {}) {
  return path.join(resolveSandboxProjectPath({ repoRoot }), ".cases");
}

export async function verifySandboxProject({ repoRoot = path.resolve(".") } = {}) {
  const sandboxProject = resolveSandboxProjectPath({ repoRoot });
  const packagePath = path.join(sandboxProject, "package.json");
  await access(packagePath);
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  return {
    sandboxProject,
    packageName: pkg.name
  };
}

export async function runSandboxMatrixTests({ repoRoot = path.resolve(".") } = {}) {
  const { sandboxProject } = await verifySandboxProject({ repoRoot });
  await mkdir(sandboxProject, { recursive: true });

  const scenarios = [
    ["installing a few skills", scenarioInstallFewSkills],
    ["installing all skills", scenarioInstallAllSkillsCore],
    ["all-skills CLI path", scenarioInstallAllSkillsCliPath],
    ["installing for one environment", scenarioInstallOneEnvironment],
    ["installing for a few environments", scenarioInstallFewEnvironments],
    ["installing for all environments", scenarioInstallAllEnvironments],
    ["detecting stack", scenarioDetectStackSignals],
    ["using doctor lifecycle", scenarioDoctorLifecycle],
    ["general CLI interactions", scenarioGeneralCliInteractions],
    ["install and uninstall commands", scenarioInstallAndUninstallLifecycle]
  ];

  const results = [];
  for (const [name, scenario] of scenarios) {
    results.push(await runScenario(name, () => scenario({ repoRoot })));
  }

  return {
    ok: results.every((item) => item.ok),
    total: results.length,
    results
  };
}

export async function runSandboxTests({ repoRoot = path.resolve(".") } = {}) {
  return runSandboxMatrixTests({ repoRoot });
}

const isMain = fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || "");

if (isMain) {
  const result = await runSandboxMatrixTests();
  if (!result.ok) {
    process.exitCode = 1;
  }
}
