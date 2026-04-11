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

async function assertOnlySelectedAgentArtifacts({ workspace, selectedAgents }) {
  const selectedTargets = resolveExpectedTargets(selectedAgents);
  const allTargets = resolveExpectedTargets(DEFAULT_AGENTS);

  for (const instruction of allTargets.instructions) {
    if (selectedTargets.instructions.includes(instruction)) {
      await assertPathExists(workspace, instruction);
    } else {
      await assertPathMissing(workspace, instruction);
    }
  }

  for (const symlink of allTargets.symlinks) {
    if (selectedTargets.symlinks.includes(symlink)) {
      await assertPathExists(workspace, symlink);
    } else {
      await assertPathMissing(workspace, symlink);
    }
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

async function scenarioInstallOneSkill({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-one-skill", fixtureName: "react-vite" });
  const selectedSkillIds = ["token-optimizer"];

  const installResult = await installProject({
    cwd: workspace,
    agents: ["codex"],
    selectedSkillIds
  });

  assertCondition(installResult.applied === true, "one-skill install should apply changes");

  const lock = await readLock(workspace);
  assertCondition(equalArrays(lock.skills, selectedSkillIds), "one-skill lock should match requested skill");
  assertCondition(equalArrays(lock.agents, ["codex"]), "one-skill lock should include codex only");

  const doctorResult = await runDoctor(workspace);
  assertCondition(doctorResult.installed === true, "one-skill doctor should report installed=true");
  assertCondition(equalArrays(doctorResult.lock.skills, selectedSkillIds), "one-skill doctor lock skills mismatch");

  const uninstallResult = await uninstallProject(workspace);
  assertCondition(uninstallResult.removed === true, "one-skill uninstall should remove install");
  await assertPathMissing(workspace, ".skilly-hand");
}

async function scenarioInstallMultipleSkills({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-multiple-skills", fixtureName: "react-vite" });
  const selectedSkillIds = ["token-optimizer", "spec-driven-development", "review-rangers"];

  const installResult = await installProject({
    cwd: workspace,
    agents: ["codex"],
    selectedSkillIds
  });

  assertCondition(installResult.applied === true, "multiple-skills install should apply changes");

  const lock = await readLock(workspace);
  assertCondition(equalArrays([...lock.skills].sort(), [...selectedSkillIds].sort()), "multiple-skills lock should match requested skills");
  assertCondition(lock.skills.length === selectedSkillIds.length, "multiple-skills lock should include only requested skills");
  assertCondition(equalArrays(lock.agents, ["codex"]), "multiple-skills lock should include codex only");

  await assertAgentArtifacts({ workspace, agents: ["codex"] });

  const uninstallResult = await uninstallProject(workspace);
  assertCondition(uninstallResult.removed === true, "multiple-skills uninstall should remove install");
  await assertPathMissing(workspace, ".skilly-hand");
}

async function scenarioInstallAllSkills({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-all-skills", fixtureName: "no-stack" });
  const catalog = await loadAllSkills();
  const allPortableSkillIds = catalog.filter((skill) => skill.portable).map((skill) => skill.id);

  const installResult = await installProject({
    cwd: workspace,
    agents: ["codex"],
    selectedSkillIds: allPortableSkillIds
  });

  assertCondition(installResult.applied === true, "all-skills install should apply changes");

  const lock = await readLock(workspace);
  assertCondition(lock.skills.length === allPortableSkillIds.length, "all-skills lock count mismatch");
  assertCondition(equalArrays([...lock.skills].sort(), [...allPortableSkillIds].sort()), "all-skills lock contents mismatch");

  await uninstallProject(workspace);
}

async function scenarioUxCliContracts({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "ux-cli-contracts", fixtureName: "react-vite" });

  const help = runCliCommand({ repoRoot, cwd: workspace, args: ["--help"] });
  assertCondition(help.status === 0, "help should succeed");
  assertCondition(/Usage/.test(help.stdout), "help output should include Usage");

  const stdout = createWritable(true);
  const stderr = createWritable(true);

  await runCli({
    argv: ["--classic", "--dry-run"],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { ...process.env, NO_COLOR: "1", TERM: "xterm-256color" },
    platform: process.platform,
    cwdResolver: () => workspace
  });

  assertCondition(/Install Preflight/.test(stdout.value()), "classic dry-run should render install preflight output");
  assertCondition(/Skill Plan/.test(stdout.value()), "classic dry-run should render skill plan output");
  assertCondition(/Dry run complete/.test(stdout.value()), "classic dry-run should render dry-run output");

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
  assertCondition(installApplyPayload.command === "install", "install apply payload should include command=install");
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

  await assertPathMissing(workspace, ".skilly-hand");
}

async function scenarioInstallOneAgent({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-one-agent", fixtureName: "no-stack" });
  const installResult = runCliCommand({
    repoRoot,
    cwd: workspace,
    args: ["install", "--yes", "--agent", "codex"]
  });

  assertCondition(installResult.status === 0, `one-agent CLI install failed:\n${installResult.stderr || installResult.stdout}`);

  await assertOnlySelectedAgentArtifacts({ workspace, selectedAgents: ["codex"] });

  const doctorResult = runCliCommand({ repoRoot, cwd: workspace, args: ["doctor", "--json"] });
  assertCondition(doctorResult.status === 0, "one-agent doctor should succeed");

  const doctorPayload = parseJsonPayload(doctorResult.stdout, "doctor");
  assertCondition(doctorPayload.installed === true, "one-agent doctor should report installed=true");
  assertCondition(equalArrays(doctorPayload.lock.agents, ["codex"]), "one-agent lock agents mismatch");

  const uninstallResult = runCliCommand({ repoRoot, cwd: workspace, args: ["uninstall", "--yes"] });
  assertCondition(uninstallResult.status === 0, "one-agent uninstall should succeed");
  await assertPathMissing(workspace, ".skilly-hand");
}

async function scenarioInstallMultipleAgents({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-multiple-agents", fixtureName: "no-stack" });
  const selectedAgents = ["codex", "claude", "copilot"];

  const installResult = runCliCommand({
    repoRoot,
    cwd: workspace,
    args: ["install", "--yes", "--agent", "codex", "--agent", "claude", "--agent", "copilot"]
  });
  assertCondition(installResult.status === 0, "multiple-agents install should succeed");

  await assertOnlySelectedAgentArtifacts({ workspace, selectedAgents });

  const lock = await readLock(workspace);
  assertCondition(equalArrays(lock.agents, selectedAgents), "multiple-agents lock agents mismatch");

  await uninstallProject(workspace);
}

async function scenarioInstallAllAgents({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "install-all-agents", fixtureName: "no-stack" });

  const installResult = await installProject({
    cwd: workspace,
    agents: DEFAULT_AGENTS
  });
  assertCondition(installResult.applied === true, "all-agents core install should apply changes");

  await assertAgentArtifacts({ workspace, agents: DEFAULT_AGENTS });

  const lock = await readLock(workspace);
  assertCondition(equalArrays(lock.agents, DEFAULT_AGENTS), "all-agents lock should match DEFAULT_AGENTS");

  await uninstallProject(workspace);
}

async function scenarioUninstallEverything({ repoRoot }) {
  const workspace = await ensureScenarioWorkspace({ repoRoot, scenarioName: "uninstall-everything", fixtureName: "node-basic" });
  const originalAgents = await readFile(path.join(workspace, "AGENTS.md"), "utf8");
  const catalog = await loadAllSkills();
  const allPortableSkillIds = catalog.filter((skill) => skill.portable).map((skill) => skill.id);

  const installResult = await installProject({
    cwd: workspace,
    agents: DEFAULT_AGENTS,
    selectedSkillIds: allPortableSkillIds
  });
  assertCondition(installResult.applied === true, "uninstall-everything setup install should apply changes");

  const lock = await readLock(workspace);
  assertCondition(equalArrays(lock.agents, DEFAULT_AGENTS), "uninstall-everything lock agents mismatch");
  assertCondition(equalArrays([...lock.skills].sort(), [...allPortableSkillIds].sort()), "uninstall-everything lock skills mismatch");
  await assertAgentArtifacts({ workspace, agents: DEFAULT_AGENTS });

  const uninstallResult = await uninstallProject(workspace);
  assertCondition(uninstallResult.removed === true, "uninstall-everything should remove installation");

  const restoredAgents = await readFile(path.join(workspace, "AGENTS.md"), "utf8");
  assertCondition(restoredAgents === originalAgents, "uninstall-everything should restore original AGENTS.md");

  await assertPathMissing(workspace, ".skilly-hand");

  const allTargets = resolveExpectedTargets(DEFAULT_AGENTS);
  for (const instruction of allTargets.instructions) {
    if (instruction === "AGENTS.md") continue;
    await assertPathMissing(workspace, instruction);
  }
  for (const symlink of allTargets.symlinks) {
    await assertPathMissing(workspace, symlink);
  }

  const secondUninstall = await uninstallProject(workspace);
  assertCondition(secondUninstall.removed === false, "second uninstall should report removed=false");
}

const SANDBOX_SCENARIOS = [
  ["install-one-agent", scenarioInstallOneAgent],
  ["install-multiple-agents", scenarioInstallMultipleAgents],
  ["install-all-agents", scenarioInstallAllAgents],
  ["install-one-skill", scenarioInstallOneSkill],
  ["install-multiple-skills", scenarioInstallMultipleSkills],
  ["install-all-skills", scenarioInstallAllSkills],
  ["uninstall-everything", scenarioUninstallEverything],
  ["ux-cli-contracts", scenarioUxCliContracts]
];

function parseMainArgs(argv) {
  const scenarioNames = [];
  let listScenarios = false;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--scenario") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --scenario");
      }
      scenarioNames.push(value);
      i += 1;
      continue;
    }
    if (token === "--list-scenarios") {
      listScenarios = true;
      continue;
    }
    throw new Error(`Unknown flag: ${token}`);
  }

  return { scenarioNames, listScenarios };
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

  const scenarios = [...SANDBOX_SCENARIOS];

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

export function getSandboxScenarioNames() {
  return SANDBOX_SCENARIOS.map(([name]) => name);
}

export async function runSandboxScenario({ repoRoot = path.resolve("."), scenarioName }) {
  const scenario = SANDBOX_SCENARIOS.find(([name]) => name === scenarioName);
  if (!scenario) {
    throw new Error(`Unknown sandbox scenario: ${scenarioName}`);
  }
  const [name, runner] = scenario;
  return runScenario(name, () => runner({ repoRoot }));
}

const isMain = fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || "");

if (isMain) {
  try {
    const { scenarioNames, listScenarios } = parseMainArgs(process.argv.slice(2));
    if (listScenarios) {
      process.stdout.write(`${getSandboxScenarioNames().join("\n")}\n`);
    } else if (scenarioNames.length === 0) {
      const result = await runSandboxMatrixTests();
      if (!result.ok) process.exitCode = 1;
    } else {
      const results = [];
      for (const scenarioName of scenarioNames) {
        results.push(await runSandboxScenario({ scenarioName }));
      }
      if (!results.every((item) => item.ok)) {
        process.exitCode = 1;
      }
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
