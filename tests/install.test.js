import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { access, cp, mkdtemp, readFile, realpath } from "node:fs/promises";
import {
  installProject,
  resolveSkillSelectionByIds,
  runDoctor,
  uninstallProject
} from "../packages/core/src/index.js";

const fixturesDir = path.resolve("tests/fixtures");

async function makeFixtureCopy(name) {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-"));
  const projectDir = path.join(tmpRoot, name);
  await cp(path.join(fixturesDir, name), projectDir, { recursive: true });
  return projectDir;
}

test("dry run returns install plan without writing files", async () => {
  const projectDir = await makeFixtureCopy("react-vite");
  const result = await installProject({ cwd: projectDir, dryRun: true });
  const ids = result.plan.skills.map((skill) => skill.id);

  assert.equal(result.applied, false);
  assert.equal(result.plan.skills.length, 12);
  assert.deepEqual(ids, [
    "accessibility-audit",
    "agents-root-orchestrator",
    "frontend-design",
    "output-optimizer",
    "project-security",
    "project-teacher",
    "react-guidelines",
    "review-rangers",
    "skill-creator",
    "spec-driven-development",
    "test-driven-development",
    "token-optimizer"
  ]);
});

test("dry run includes core skills even for no-stack projects", async () => {
  const projectDir = await makeFixtureCopy("no-stack");
  const result = await installProject({ cwd: projectDir, dryRun: true });
  const ids = result.plan.skills.map((skill) => skill.id);

  assert.equal(result.applied, false);
  assert.equal(result.plan.skills.length, 9);
  assert.deepEqual(ids, ["agents-root-orchestrator", "output-optimizer", "project-security", "project-teacher", "review-rangers", "skill-creator", "spec-driven-development", "test-driven-development", "token-optimizer"]);
});

test("dry run includes angular-guidelines for angular projects", async () => {
  const projectDir = await makeFixtureCopy("angular-app");
  const result = await installProject({ cwd: projectDir, dryRun: true });
  const ids = result.plan.skills.map((skill) => skill.id);

  assert.equal(result.applied, false);
  assert.deepEqual(ids, [
    "accessibility-audit",
    "agents-root-orchestrator",
    "angular-guidelines",
    "frontend-design",
    "output-optimizer",
    "project-security",
    "project-teacher",
    "review-rangers",
    "skill-creator",
    "spec-driven-development",
    "test-driven-development",
    "token-optimizer"
  ]);
});

test("install creates managed files, symlinks, and restores originals on uninstall", async () => {
  const projectDir = await makeFixtureCopy("node-basic");
  const originalAgents = await readFile(path.join(projectDir, "AGENTS.md"), "utf8");

  const installResult = await installProject({
    cwd: projectDir,
    agents: ["codex", "claude", "cursor", "gemini", "copilot"]
  });

  assert.equal(installResult.applied, true);

  const codexSkillsPath = await realpath(path.join(projectDir, ".codex", "skills"));
  const expectedCatalogPath = await realpath(path.join(projectDir, ".skilly-hand", "catalog"));
  assert.equal(codexSkillsPath, expectedCatalogPath);

  const managedAgents = await readFile(path.join(projectDir, "AGENTS.md"), "utf8");
  assert.match(managedAgents, /Managed by skilly-hand/);
  assert.match(managedAgents, /## Where/);
  assert.match(managedAgents, /## What/);
  assert.match(managedAgents, /## When/);
  assert.match(managedAgents, /## Chaining Notations/);
  assert.match(managedAgents, /`agents-root-orchestrator`/);
  assert.match(managedAgents, /SDD-first policy/);
  assert.match(managedAgents, /`spec-driven-development`/);
  assert.match(managedAgents, /### SDD-First Delivery Workflow/);

  const doctorResult = await runDoctor(projectDir);
  assert.equal(doctorResult.installed, true);
  assert.equal(doctorResult.lock.skills.includes("skill-creator"), true);
  assert.equal(doctorResult.lock.skills.includes("spec-driven-development"), true);
  assert.equal(doctorResult.lock.skills.includes("agents-root-orchestrator"), true);

  const uninstallResult = await uninstallProject(projectDir);
  assert.equal(uninstallResult.removed, true);

  const restoredAgents = await readFile(path.join(projectDir, "AGENTS.md"), "utf8");
  assert.equal(restoredAgents, originalAgents);
});

test("install with standard agent creates skills/ symlink at root without .company/ folders", async () => {
  const projectDir = await makeFixtureCopy("no-stack");

  const installResult = await installProject({
    cwd: projectDir,
    agents: ["standard"]
  });

  assert.equal(installResult.applied, true);

  const skillsPath = await realpath(path.join(projectDir, "skills"));
  const expectedCatalogPath = await realpath(path.join(projectDir, ".skilly-hand", "catalog"));
  assert.equal(skillsPath, expectedCatalogPath);

  const agentsMd = await readFile(path.join(projectDir, "AGENTS.md"), "utf8");
  assert.match(agentsMd, /Managed by skilly-hand/);

  // No company-specific folders
  await assert.rejects(access(path.join(projectDir, ".claude", "skills")), "expected no .claude/skills");
  await assert.rejects(access(path.join(projectDir, ".codex", "skills")), "expected no .codex/skills");

  const uninstallResult = await uninstallProject(projectDir);
  assert.equal(uninstallResult.removed, true);

  // skills/ symlink removed
  await assert.rejects(access(path.join(projectDir, "skills")), "expected skills/ to be removed");
});

test("install with antigravity creates native skills links and rule bridge files", async () => {
  const projectDir = await makeFixtureCopy("no-stack");
  const installResult = await installProject({
    cwd: projectDir,
    agents: ["antigravity"]
  });

  assert.equal(installResult.applied, true);

  const expectedCatalogPath = await realpath(path.join(projectDir, ".skilly-hand", "catalog"));
  const agentsSkillsPath = await realpath(path.join(projectDir, ".agents", "skills"));
  const legacyAgentSkillsPath = await realpath(path.join(projectDir, ".agent", "skills"));
  assert.equal(agentsSkillsPath, expectedCatalogPath);
  assert.equal(legacyAgentSkillsPath, expectedCatalogPath);

  const agentsMd = await readFile(path.join(projectDir, "AGENTS.md"), "utf8");
  const antigravityRuleFile = await readFile(path.join(projectDir, ".agents", "rules", "skilly-hand.md"), "utf8");
  assert.match(agentsMd, /Managed by skilly-hand/);
  assert.equal(agentsMd, antigravityRuleFile);

  const uninstallResult = await uninstallProject(projectDir);
  assert.equal(uninstallResult.removed, true);
  await assert.rejects(access(path.join(projectDir, ".agents", "skills")), "expected .agents/skills to be removed");
  await assert.rejects(access(path.join(projectDir, ".agent", "skills")), "expected .agent/skills to be removed");
  await assert.rejects(access(path.join(projectDir, ".agents", "rules", "skilly-hand.md")), "expected Antigravity rule file to be removed");
});

test("install with windsurf and trae creates native skills links with AGENTS bridge", async () => {
  const projectDir = await makeFixtureCopy("no-stack");
  const installResult = await installProject({
    cwd: projectDir,
    agents: ["windsurf", "trae"]
  });

  assert.equal(installResult.applied, true);

  const expectedCatalogPath = await realpath(path.join(projectDir, ".skilly-hand", "catalog"));
  const windsurfSkillsPath = await realpath(path.join(projectDir, ".windsurf", "skills"));
  const traeSkillsPath = await realpath(path.join(projectDir, ".trae", "skills"));
  assert.equal(windsurfSkillsPath, expectedCatalogPath);
  assert.equal(traeSkillsPath, expectedCatalogPath);

  const agentsMd = await readFile(path.join(projectDir, "AGENTS.md"), "utf8");
  assert.match(agentsMd, /Managed by skilly-hand/);

  const uninstallResult = await uninstallProject(projectDir);
  assert.equal(uninstallResult.removed, true);
  await assert.rejects(access(path.join(projectDir, ".windsurf", "skills")), "expected .windsurf/skills to be removed");
  await assert.rejects(access(path.join(projectDir, ".trae", "skills")), "expected .trae/skills to be removed");
});

test("install deduplicates shared AGENTS target for multi-agent installs", async () => {
  const projectDir = await makeFixtureCopy("no-stack");
  const installResult = await installProject({
    cwd: projectDir,
    agents: ["standard", "codex", "antigravity", "windsurf", "trae"]
  });

  assert.equal(installResult.applied, true);
  const lockPath = path.join(projectDir, ".skilly-hand", "manifest.lock.json");
  const lockData = JSON.parse(await readFile(lockPath, "utf8"));
  const agentsFileTargets = lockData.managedFiles.filter((filePath) => filePath.endsWith(path.join("AGENTS.md")));
  assert.equal(agentsFileTargets.length, 1);

  const uninstallResult = await uninstallProject(projectDir);
  assert.equal(uninstallResult.removed, true);
});

test("selectedSkillIds overrides automatic selection during install", async () => {
  const projectDir = await makeFixtureCopy("react-vite");
  const result = await installProject({
    cwd: projectDir,
    dryRun: true,
    selectedSkillIds: ["token-optimizer", "spec-driven-development"]
  });
  const ids = result.plan.skills.map((skill) => skill.id);

  assert.deepEqual(ids, ["spec-driven-development", "token-optimizer"]);
});

test("install rejects unknown selectedSkillIds", async () => {
  const projectDir = await makeFixtureCopy("react-vite");
  await assert.rejects(
    installProject({
      cwd: projectDir,
      dryRun: true,
      selectedSkillIds: ["does-not-exist"]
    }),
    /Unknown skill id: does-not-exist/
  );
});

test("resolveSkillSelectionByIds rejects non-portable skills", () => {
  const catalog = [
    { id: "portable-skill", portable: true },
    { id: "internal-skill", portable: false }
  ];

  assert.throws(
    () => resolveSkillSelectionByIds({ catalog, selectedSkillIds: ["internal-skill"] }),
    /Skill is not portable: internal-skill/
  );
});
