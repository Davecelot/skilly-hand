import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { cp, mkdtemp, readFile, realpath } from "node:fs/promises";
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
  assert.equal(result.plan.skills.length, 4);
  assert.deepEqual(ids, ["agents-root-orchestrator", "skill-creator", "spec-driven-development", "token-optimizer"]);
});

test("dry run includes core skills even for no-stack projects", async () => {
  const projectDir = await makeFixtureCopy("no-stack");
  const result = await installProject({ cwd: projectDir, dryRun: true });
  const ids = result.plan.skills.map((skill) => skill.id);

  assert.equal(result.applied, false);
  assert.equal(result.plan.skills.length, 4);
  assert.deepEqual(ids, ["agents-root-orchestrator", "skill-creator", "spec-driven-development", "token-optimizer"]);
});

test("dry run includes angular-guidelines for angular projects", async () => {
  const projectDir = await makeFixtureCopy("angular-app");
  const result = await installProject({ cwd: projectDir, dryRun: true });
  const ids = result.plan.skills.map((skill) => skill.id);

  assert.equal(result.applied, false);
  assert.deepEqual(ids, [
    "agents-root-orchestrator",
    "angular-guidelines",
    "skill-creator",
    "spec-driven-development",
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
