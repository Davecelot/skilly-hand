import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { runCli } from "../packages/cli/src/bin.js";
import { createInquirerInteractiveUi } from "../packages/cli/src/inquirer-ui.js";

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

test("interactive launcher routes through interactive UI actions", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);

  const detections = [{ technology: "nodejs", confidence: 1, reasons: [], recommendedSkillIds: ["token-optimizer"] }];
  const catalog = [
    { id: "token-optimizer", title: "Token Optimizer", portable: true, tags: ["core"], agentSupport: ["codex"] },
    { id: "spec-driven-development", title: "Spec Driven Development", portable: true, tags: ["core"], agentSupport: ["codex"] }
  ];

  let launched = false;

  await runCli({
    argv: [],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    interactiveUi: {
      async launch({ actions }) {
        launched = true;
        const detectBlock = await actions.runCommand("detect");
        assert.match(detectBlock, /Detection Summary/);
        const nativeSetupBlock = await actions.runCommand("native-setup");
        assert.match(nativeSetupBlock, /Native setup completed/);
        assert.doesNotMatch(nativeSetupBlock, /portable AI skill orchestration/);

        const context = await actions.prepareInstall();
        assert.equal(context.skills.length, 2);
        assert.equal(context.agents.length > 0, true);

        const preview = await actions.previewInstall({
          selectedSkillIds: ["token-optimizer"],
          selectedAgents: ["codex"]
        });
        assert.match(preview, /Dry run complete/);

        const applied = await actions.applyInstall({
          selectedSkillIds: ["token-optimizer"],
          selectedAgents: ["codex"]
        });
        assert.match(applied, /Installation completed/);
      },
      async confirm() {
        throw new Error("confirm should not be called for launcher flow test");
      }
    },
    services: {
      detectProject: async () => detections,
      loadAllSkills: async () => catalog,
      resolveSkillSelection: () => [catalog[0]],
      installProject: async (options) => ({
        ...createInstallResult({
          cwd: options.cwd,
          detections,
          agents: options.agents || [],
          skillIds: options.selectedSkillIds || []
        }),
        applied: options.dryRun ? false : true
      }),
      setupNativeProject: async ({ cwd }) => ({
        applied: true,
        plan: {
          cwd,
          installRoot: path.join(cwd, ".skilly-hand"),
          agents: ["codex"],
          nativeStatus: [{ agent: "codex", status: "configured", target: ".codex/rules/skilly-hand.md", remediation: "No action needed." }]
        },
        nativeStatus: [{ agent: "codex", status: "configured", target: ".codex/rules/skilly-hand.md", remediation: "No action needed." }]
      }),
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => ({ removed: false, reason: "No installation found." }),
      defaultAgents: ["codex", "claude"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/project"
  });

  assert.equal(launched, true);
});

test("interactive launcher install flow remains stable with long skill metadata", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  const calls = [];

  const detections = [{ technology: "nodejs", confidence: 1, reasons: [], recommendedSkillIds: ["token-optimizer"] }];
  const catalog = [
    {
      id: "token-optimizer",
      title: "Token Optimizer",
      portable: true,
      tags: ["core", "workflow", "efficiency"],
      agentSupport: ["codex", "claude", "cursor", "gemini", "copilot", "antigravity", "windsurf", "trae"]
    },
    {
      id: "spec-driven-development",
      title: "Spec Driven Development",
      portable: true,
      tags: ["core", "workflow", "planning"],
      agentSupport: ["codex", "claude", "cursor", "gemini", "copilot", "antigravity", "windsurf", "trae"]
    }
  ];

  await runCli({
    argv: [],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    interactiveUi: {
      async launch({ actions }) {
        calls.push("prepare");
        const context = await actions.prepareInstall();
        assert.equal(context.skills.length, 2);
        assert.equal(context.skills[0].agentSupport.includes("windsurf"), true);
        assert.equal(context.skills[0].agentSupport.includes("trae"), true);

        calls.push("preview");
        const preview = await actions.previewInstall({
          selectedSkillIds: [context.skills[0].id],
          selectedAgents: ["codex"]
        });
        assert.match(preview, /Dry run complete/);
        assert.doesNotMatch(preview, /portable AI skill orchestration/);

        calls.push("apply");
        const applied = await actions.applyInstall({
          selectedSkillIds: [context.skills[0].id],
          selectedAgents: ["codex"]
        });
        assert.match(applied, /Installation completed/);
      },
      async confirm() {
        throw new Error("confirm should not be called for launcher flow test");
      }
    },
    services: {
      detectProject: async () => detections,
      loadAllSkills: async () => catalog,
      resolveSkillSelection: () => [catalog[0]],
      installProject: async (options) => ({
        ...createInstallResult({
          cwd: options.cwd,
          detections,
          agents: options.agents || [],
          skillIds: options.selectedSkillIds || []
        }),
        applied: options.dryRun ? false : true
      }),
      setupNativeProject: async ({ cwd }) => ({
        applied: true,
        plan: {
          cwd,
          installRoot: path.join(cwd, ".skilly-hand"),
          agents: ["codex"],
          nativeStatus: [{ agent: "codex", status: "configured", target: ".codex/rules/skilly-hand.md", remediation: "No action needed." }]
        },
        nativeStatus: [{ agent: "codex", status: "configured", target: ".codex/rules/skilly-hand.md", remediation: "No action needed." }]
      }),
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => ({ removed: false, reason: "No installation found." }),
      defaultAgents: ["codex", "claude"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/project"
  });

  assert.deepEqual(calls, ["prepare", "preview", "apply"]);
});

test("install command confirmation in TTY uses interactive UI confirm", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  let installCalls = 0;
  let confirmCalls = 0;

  await runCli({
    argv: ["install"],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    interactiveUi: {
      async launch() {
        throw new Error("launch should not be called for explicit install command");
      },
      async confirm({ message, defaultValue }) {
        confirmCalls += 1;
        assert.match(message, /Apply installation changes to this project/);
        assert.equal(defaultValue, true);
        return false;
      }
    },
    services: {
      detectProject: async () => [],
      loadAllSkills: async () => [],
      resolveSkillSelection: () => [],
      installProject: async () => {
        installCalls += 1;
        return createInstallResult({
          cwd: "/tmp/project",
          detections: [],
          agents: [],
          skillIds: []
        });
      },
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => ({ removed: false, reason: "No installation found." }),
      defaultAgents: ["codex"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/project"
  });

  assert.equal(confirmCalls, 1);
  assert.equal(installCalls, 0);
  assert.match(stdout.value(), /Installation cancelled/);
});

test("uninstall command confirmation in TTY uses interactive UI confirm", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  let uninstallCalls = 0;

  await runCli({
    argv: ["uninstall"],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    interactiveUi: {
      async launch() {
        throw new Error("launch should not be called for explicit uninstall command");
      },
      async confirm({ message, defaultValue }) {
        assert.match(message, /Remove the skilly-hand installation/);
        assert.equal(defaultValue, false);
        return false;
      }
    },
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

  await runCli({
    argv: ["--json", "--dry-run"],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    interactiveUi: {
      async launch() {
        throw new Error("launch should not be called in --json mode");
      },
      async confirm() {
        throw new Error("confirm should not be called in --json mode");
      }
    },
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

test("--classic skips launcher mode and uses plain command flow", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);

  await runCli({
    argv: ["--classic", "--dry-run"],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    interactiveUi: {
      async launch() {
        throw new Error("launch should not be called when --classic is set");
      },
      async confirm() {
        throw new Error("confirm should not be called for dry-run classic mode");
      }
    },
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

  assert.match(stdout.value(), /Install Preflight/);
});

test("inquirer launcher flow runs in React-host projects without React hook failures", async () => {
  const stdout = createWritable(true);
  const stderr = createWritable(true);
  const writes = [];
  const prompts = [
    { command: "command-guide" },
    { command: "detect" },
    { command: "exit" }
  ];

  const interactiveUi = createInquirerInteractiveUi({
    prompt: async () => {
      const next = prompts.shift();
      if (!next) throw new Error("Prompt queue exhausted");
      return next;
    },
    write: (value) => {
      writes.push(String(value));
    }
  });

  await runCli({
    argv: [],
    stdin: { isTTY: true },
    stdout,
    stderr,
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    platform: "darwin",
    interactiveUi,
    services: {
      detectProject: async () => [{ technology: "react", confidence: 1, reasons: [], recommendedSkillIds: ["react-guidelines"] }],
      loadAllSkills: async () => [],
      resolveSkillSelection: () => [],
      installProject: async (options) => createInstallResult({
        cwd: options.cwd,
        detections: [],
        agents: [],
        skillIds: []
      }),
      setupNativeProject: async ({ cwd }) => ({
        applied: true,
        plan: {
          cwd,
          installRoot: path.join(cwd, ".skilly-hand"),
          agents: ["codex"],
          nativeStatus: [{ agent: "codex", status: "configured", target: ".codex/rules/skilly-hand.md", remediation: "No action needed." }]
        },
        nativeStatus: [{ agent: "codex", status: "configured", target: ".codex/rules/skilly-hand.md", remediation: "No action needed." }]
      }),
      runDoctor: async () => ({ cwd: "/tmp", installed: false, catalogIssues: [], fileStatus: [] }),
      uninstallProject: async () => ({ removed: false, reason: "No installation found." }),
      defaultAgents: ["codex"]
    },
    appVersion: "0.4.0",
    cwdResolver: () => "/tmp/react-host-project"
  });

  const combined = `${stdout.value()}\n${writes.join("\n")}`;
  assert.match(combined, /Guided Home/);
  assert.match(combined, /Command Guide/);
  assert.match(combined, /Aliases:/);
  assert.match(combined, /Detection Summary/);
  assert.doesNotMatch(combined, /Invalid hook call/);
  assert.doesNotMatch(combined, /reading 'useState'/);
});

test("inquirer launcher install flow renders contextual micro-help and next hint", async () => {
  const writes = [];
  const prompts = [
    { command: "install" },
    { selectedSkillIds: ["token-optimizer"] },
    { selectedAgents: ["codex"] },
    { installDecision: "apply" },
    { command: "exit" }
  ];

  const interactiveUi = createInquirerInteractiveUi({
    prompt: async () => {
      const next = prompts.shift();
      if (!next) throw new Error("Prompt queue exhausted");
      return next;
    },
    write: (value) => writes.push(String(value))
  });

  await interactiveUi.launch({
    appVersion: "0.23.0",
    actions: {
      async prepareInstall() {
        return {
          skills: [{ id: "token-optimizer", title: "Token Optimizer", tags: ["core"], agentSupport: ["codex"], checked: true }],
          agents: [{ value: "codex", checked: true }]
        };
      },
      async previewInstallBundle() {
        return { text: "preview" };
      },
      async applyInstallBundle() {
        return { text: "applied" };
      },
      async runCommandBundle() {
        return { text: "ok" };
      }
    }
  });

  const combined = writes.join("\n");
  assert.match(combined, /Install Tips/);
  assert.match(combined, /Assistant Target Tips/);
  assert.match(combined, /Next Hint/);
  assert.match(combined, /doctor/);
});
