import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { runCli } from "../packages/cli/src/bin.js";

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

function createInstallResult({ cwd, detections, agents, skillIds }) {
  return {
    plan: {
      cwd,
      detections,
      agents,
      skills: skillIds.map((id) => ({
        id,
        title: id,
        tags: ["core"]
      })),
      installRoot: path.join(cwd, ".skilly-hand"),
      generatedAt: "2026-04-03T00:00:00.000Z"
    },
    applied: false
  };
}

test("interactive launcher loops until Exit and routes detect command", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  const prompt = createPromptMock({ selectValues: ["detect", "exit"] });
  let detectCalls = 0;

  await runCli({
    argv: [],
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    prompt,
    services: {
      detectProject: async () => {
        detectCalls += 1;
        return [{ technology: "nodejs", confidence: 1, reasons: [], recommendedSkillIds: [] }];
      },
      loadAllSkills: async () => [],
      resolveSkillSelection: () => [],
      installProject: async () => {
        throw new Error("installProject should not be called");
      },
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => ({ removed: false, reason: "No installation found." }),
      defaultAgents: ["codex"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/project"
  });

  assert.equal(detectCalls, 1);
  assert.match(stdout.value(), /Detection Summary/);
  assert.match(stdout.value(), /Exited skilly-hand interactive mode/);
});

test("interactive install passes selected skills and agents to installProject", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  const prompt = createPromptMock({
    selectValues: ["install", "exit"],
    checkboxValues: [["token-optimizer"], ["codex", "claude"]],
    confirmValues: [true]
  });

  const catalog = [
    { id: "token-optimizer", title: "Token Optimizer", portable: true, tags: ["core"], agentSupport: ["codex"] },
    { id: "spec-driven-development", title: "Spec Driven Development", portable: true, tags: ["core"], agentSupport: ["codex"] }
  ];
  const detections = [{ technology: "nodejs", confidence: 1, reasons: [], recommendedSkillIds: ["token-optimizer"] }];
  const calls = [];

  await runCli({
    argv: [],
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    prompt,
    services: {
      detectProject: async () => detections,
      loadAllSkills: async () => catalog,
      resolveSkillSelection: () => [catalog[0]],
      installProject: async (options) => {
        calls.push(options);
        return {
          ...createInstallResult({
            cwd: options.cwd,
            detections,
            agents: options.agents || [],
            skillIds: options.selectedSkillIds || []
          }),
          applied: options.dryRun ? false : true,
          lockPath: options.dryRun ? null : "/tmp/project/.skilly-hand/manifest.lock.json"
        };
      },
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => ({ removed: false, reason: "No installation found." }),
      defaultAgents: ["codex", "claude", "cursor"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/project"
  });

  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].selectedSkillIds, ["token-optimizer"]);
  assert.deepEqual(calls[0].agents, ["codex", "claude"]);
  assert.equal(calls[0].dryRun, true);
  assert.equal(calls[1].dryRun, false);
});

test("interactive uninstall honors cancel and skips uninstallProject", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  const prompt = createPromptMock({
    selectValues: ["uninstall", "exit"],
    confirmValues: [false]
  });
  let uninstallCalls = 0;

  await runCli({
    argv: [],
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    prompt,
    services: {
      detectProject: async () => [],
      loadAllSkills: async () => [],
      resolveSkillSelection: () => [],
      installProject: async () => createInstallResult({
        cwd: "/tmp/project",
        detections: [],
        agents: [],
        skillIds: []
      }),
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => {
        uninstallCalls += 1;
        return { removed: true };
      },
      defaultAgents: ["codex"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/project"
  });

  assert.equal(uninstallCalls, 0);
  assert.match(stdout.value(), /Uninstall cancelled/);
});

test("--json mode stays non-interactive even when stdout is TTY", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  const prompt = {
    async select() {
      throw new Error("select prompt should not be called in --json mode");
    },
    async checkbox() {
      throw new Error("checkbox prompt should not be called in --json mode");
    },
    async confirm() {
      throw new Error("confirm prompt should not be called in --json mode");
    }
  };

  await runCli({
    argv: ["--json", "--dry-run"],
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    prompt,
    services: {
      detectProject: async () => [],
      loadAllSkills: async () => [],
      resolveSkillSelection: () => [],
      installProject: async (options) => createInstallResult({
        cwd: options.cwd,
        detections: [],
        agents: [],
        skillIds: []
      }),
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => ({ removed: false, reason: "No installation found." }),
      defaultAgents: ["codex"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/project"
  });

  const payload = JSON.parse(stdout.value());
  assert.equal(payload.command, "install");
  assert.equal(payload.applied, false);
});
