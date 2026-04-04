#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { checkbox as inquirerCheckbox, confirm as inquirerConfirm, select as inquirerSelect } from "@inquirer/prompts";
import { loadAllSkills } from "../../catalog/src/index.js";
import {
  DEFAULT_AGENTS,
  installProject,
  resolveSkillSelection,
  runDoctor,
  uninstallProject
} from "../../core/src/index.js";
import { createTerminalRenderer } from "../../core/src/terminal.js";
import { detectProject } from "../../detectors/src/index.js";

const require = createRequire(import.meta.url);
const { version } = require("../../../package.json");

function isExecutedDirectly(metaUrl, argv1) {
  if (!argv1) return false;
  const normalizePath = (filePath) => {
    const absolutePath = path.resolve(filePath);
    try {
      const realPath = fs.realpathSync.native ? fs.realpathSync.native(absolutePath) : fs.realpathSync(absolutePath);
      return path.normalize(realPath);
    } catch {
      return path.normalize(absolutePath);
    }
  };

  return normalizePath(fileURLToPath(metaUrl)) === normalizePath(argv1);
}

export function parseArgs(argv) {
  const args = [...argv];
  const positional = [];
  const flags = {
    dryRun: false,
    yes: false,
    verbose: false,
    json: false,
    agents: [],
    include: [],
    exclude: []
  };

  function takeFlagValue(flagName) {
    const value = args.shift();
    if (!value || value.startsWith("-")) {
      throw new Error(`Missing value for ${flagName}`);
    }
    return value;
  }

  while (args.length > 0) {
    const token = args.shift();
    if (!token.startsWith("-")) {
      positional.push(token);
      continue;
    }

    if (token === "--dry-run") flags.dryRun = true;
    else if (token === "--yes" || token === "-y") flags.yes = true;
    else if (token === "--verbose" || token === "-v") flags.verbose = true;
    else if (token === "--json") flags.json = true;
    else if (token === "--agent" || token === "-a") flags.agents.push(takeFlagValue(token));
    else if (token === "--cwd") flags.cwd = takeFlagValue(token);
    else if (token === "--include") flags.include.push(takeFlagValue(token));
    else if (token === "--exclude") flags.exclude.push(takeFlagValue(token));
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return { command: positional[0], flags };
}

function buildHelpText(renderer, appVersion) {
  const usage = renderer.section("Usage", renderer.list([
    "npx skilly-hand                  # interactive launcher when running in a TTY",
    "npx skilly-hand install",
    "npx skilly-hand detect",
    "npx skilly-hand list",
    "npx skilly-hand doctor",
    "npx skilly-hand uninstall"
  ], { bullet: "-" }));

  const flags = renderer.section("Flags", renderer.list([
    "--dry-run                     Show install plan without writing files",
    "--json                        Emit stable JSON output for automation",
    "--yes, -y                     Skip install/uninstall confirmations",
    "--verbose, -v                 Reserved for future debug detail",
    "--agent, -a <name>            codex|claude|cursor|gemini|copilot (repeatable)",
    "--cwd <path>                  Project root (defaults to current directory)",
    "--include <tag>               Include only skills matching all tags",
    "--exclude <tag>               Exclude skills matching any tag",
    "--help, -h                    Show help"
  ], { bullet: "-" }));

  const examples = renderer.section("Examples", renderer.list([
    "npx skilly-hand",
    "npx skilly-hand install --dry-run",
    "npx skilly-hand detect --json",
    "npx skilly-hand install --agent codex --agent claude",
    "npx skilly-hand uninstall --yes"
  ], { bullet: "-" }));

  return renderer.joinBlocks([
    renderer.banner(appVersion),
    usage,
    flags,
    examples
  ]);
}

function printInstallResult(renderer, appVersion, result, flags) {
  const mode = flags.dryRun ? "dry-run" : "apply";
  const preflight = renderer.section(
    "Install Preflight",
    renderer.kv([
      ["Project", result.plan.cwd],
      ["Install root", result.plan.installRoot],
      ["Agents", result.plan.agents.join(", ") || "none"],
      ["Include tags", flags.include.join(", ") || "none"],
      ["Exclude tags", flags.exclude.join(", ") || "none"],
      ["Mode", mode]
    ])
  );

  const detections = renderer.section(
    "Detected Technologies",
    result.plan.detections.length > 0
      ? renderer.detectionGrid(result.plan.detections)
      : renderer.status("warn", "No technology signals were detected.", "Only core skills will be selected.")
  );

  const skills = renderer.section(
    "Skill Plan",
    result.plan.skills.length > 0
      ? renderer.table(
          [
            { key: "id", header: "Skill ID" },
            { key: "title", header: "Title" },
            { key: "tags", header: "Tags" }
          ],
          result.plan.skills.map((skill) => ({
            id: skill.id,
            title: skill.title,
            tags: skill.tags.join(", ")
          }))
        )
      : renderer.status("warn", "No skills selected.")
  );

  const status = result.applied
    ? renderer.status("success", "Installation completed.", "Managed files and symlinks are in place.")
    : renderer.status("info", "Dry run complete.", "No files were written.");

  const nextSteps = result.applied
    ? renderer.nextSteps([
        "Review generated AGENTS and assistant instruction files.",
        "Run `npx skilly-hand doctor` to validate installation health.",
        "Use `npx skilly-hand uninstall` to restore backed-up files if needed."
      ])
    : renderer.nextSteps([
        "Run `npx skilly-hand install` to apply this plan.",
        "Adjust `--include` and `--exclude` tags to tune skill selection."
      ]);

  renderer.write(renderer.joinBlocks([renderer.banner(appVersion), preflight, detections, skills, status, nextSteps]));
}

function printDetectResult(renderer, cwd, detections) {
  const summary = renderer.section(
    "Detection Summary",
    renderer.kv([
      ["Project", cwd],
      ["Signals found", String(detections.length)]
    ])
  );

  const findings = renderer.section(
    "Findings",
    detections.length > 0
      ? renderer.detectionGrid(detections)
      : renderer.status("warn", "No technology signals were detected.", "Only core skills will be selected.")
  );

  renderer.write(renderer.joinBlocks([summary, findings]));
}

function printListResult(renderer, skills) {
  const summary = renderer.section(
    "Catalog Summary",
    renderer.kv([["Skills available", String(skills.length)]])
  );

  const table = renderer.section(
    "Skills",
    renderer.table(
      [
        { key: "id", header: "Skill ID" },
        { key: "title", header: "Title" },
        { key: "tags", header: "Tags" },
        { key: "agents", header: "Agents" }
      ],
      skills.map((skill) => ({
        id: skill.id,
        title: skill.title,
        tags: skill.tags.join(", "),
        agents: skill.agentSupport.join(", ")
      }))
    )
  );

  renderer.write(renderer.joinBlocks([summary, table]));
}

function printDoctorResult(renderer, result) {
  const badge = renderer.healthBadge(result.installed);

  const summary = renderer.section(
    "Doctor Summary",
    renderer.kv([
      ["Project", result.cwd],
      ["Installed", result.installed ? "yes" : "no"],
      ["Catalog issues", String(result.catalogIssues.length)]
    ])
  );

  const lock = result.lock
    ? renderer.section(
        "Lock Metadata",
        renderer.kv([
          ["Generated at", result.lock.generatedAt],
          ["Agents", result.lock.agents.join(", ")],
          ["Skills", result.lock.skills.join(", ")]
        ])
      )
    : "";

  const issues = result.catalogIssues.length
    ? renderer.section("Catalog Issues", renderer.list(result.catalogIssues))
    : renderer.section("Catalog Issues", renderer.status("success", "No catalog issues found."));

  const probes = renderer.section(
    "Project Probes",
    renderer.table(
      [
        { key: "path", header: "Path" },
        { key: "exists", header: "Exists" },
        { key: "type", header: "Type" }
      ],
      result.fileStatus.map((item) => ({
        path: item.path,
        exists: item.exists ? "yes" : "no",
        type: item.type || "-"
      }))
    )
  );

  renderer.write(renderer.joinBlocks([badge, summary, lock, issues, probes]));
}

function printUninstallResult(renderer, result) {
  if (result.removed) {
    renderer.write(
      renderer.joinBlocks([
        renderer.status("success", "skilly-hand installation removed."),
        renderer.nextSteps([
          "Run `npx skilly-hand install` if you want to reinstall managed files.",
          "Run `npx skilly-hand doctor` to confirm the project state."
        ])
      ])
    );
    return;
  }

  renderer.write(
    renderer.joinBlocks([
      renderer.status("warn", "Nothing to uninstall.", result.reason),
      renderer.nextSteps(["Run `npx skilly-hand install` to create a managed installation first."])
    ])
  );
}

export function buildErrorHint(message) {
  if (message.startsWith("Unknown command:")) {
    return "Run `npx skilly-hand --help` to see available commands.";
  }
  if (message.startsWith("Unknown flag:") || message.startsWith("Missing value")) {
    return "Check command flags with `npx skilly-hand --help`.";
  }
  return "Retry with `--verbose` for expanded context if needed.";
}

export function createPromptAdapter({ selectImpl, checkboxImpl, confirmImpl } = {}) {
  return {
    select: selectImpl || inquirerSelect,
    checkbox: checkboxImpl || inquirerCheckbox,
    confirm: confirmImpl || inquirerConfirm
  };
}

function createServices(overrides = {}) {
  return {
    loadAllSkills,
    installProject,
    resolveSkillSelection,
    runDoctor,
    uninstallProject,
    detectProject,
    defaultAgents: DEFAULT_AGENTS,
    ...overrides
  };
}

function isInteractiveLauncherMode({ command, flags, stdout }) {
  return !command && !flags.json && Boolean(stdout?.isTTY);
}

async function runInteractiveInstall({
  cwd,
  renderer,
  prompt,
  services,
  appVersion
}) {
  const [catalog, detections] = await Promise.all([
    services.loadAllSkills(),
    services.detectProject(cwd)
  ]);
  const portableCatalog = catalog.filter((skill) => skill.portable).sort((a, b) => a.id.localeCompare(b.id));
  const preselected = new Set(
    services
      .resolveSkillSelection({ catalog, detections, includeTags: [], excludeTags: [] })
      .map((skill) => skill.id)
  );

  const selectedSkillIds = await prompt.checkbox({
    message: "Select skills to install",
    choices: portableCatalog.map((skill) => ({
      value: skill.id,
      name: `${skill.id} - ${skill.title}`,
      checked: preselected.has(skill.id)
    }))
  });

  const selectedAgents = await prompt.checkbox({
    message: "Select AI assistants to configure",
    choices: services.defaultAgents.map((agent) => ({
      value: agent,
      name: agent,
      checked: agent === "standard"
    }))
  });

  const preview = await services.installProject({
    cwd,
    agents: selectedAgents,
    dryRun: true,
    selectedSkillIds
  });

  printInstallResult(renderer, appVersion, preview, {
    dryRun: true,
    include: [],
    exclude: []
  });

  const shouldApply = await prompt.confirm({
    message: "Apply installation changes now?",
    default: true
  });

  if (!shouldApply) {
    renderer.write(renderer.status("info", "Installation cancelled.", "No files were written."));
    return;
  }

  const applied = await services.installProject({
    cwd,
    agents: selectedAgents,
    dryRun: false,
    selectedSkillIds
  });

  printInstallResult(renderer, appVersion, applied, {
    dryRun: false,
    include: [],
    exclude: []
  });
}

async function runInteractiveSession({
  cwd,
  renderer,
  prompt,
  services,
  appVersion
}) {
  renderer.write(renderer.banner(appVersion));

  while (true) {
    const selection = await prompt.select({
      message: "Select a command",
      choices: [
        { value: "install", name: "Install" },
        { value: "detect", name: "Detect" },
        { value: "list", name: "List" },
        { value: "doctor", name: "Doctor" },
        { value: "uninstall", name: "Uninstall" },
        { value: "exit", name: "Exit" }
      ]
    });

    if (selection === "exit") {
      renderer.write(renderer.status("info", "Exited skilly-hand interactive mode."));
      return;
    }

    if (selection === "install") {
      await runInteractiveInstall({ cwd, renderer, prompt, services, appVersion });
      continue;
    }

    if (selection === "detect") {
      const detections = await services.detectProject(cwd);
      printDetectResult(renderer, cwd, detections);
      continue;
    }

    if (selection === "list") {
      const skills = await services.loadAllSkills();
      printListResult(renderer, skills);
      continue;
    }

    if (selection === "doctor") {
      const result = await services.runDoctor(cwd);
      printDoctorResult(renderer, result);
      continue;
    }

    if (selection === "uninstall") {
      const confirmed = await prompt.confirm({
        message: "Remove the skilly-hand installation from this project?",
        default: false
      });

      if (!confirmed) {
        renderer.write(renderer.status("info", "Uninstall cancelled."));
        continue;
      }

      const result = await services.uninstallProject(cwd);
      printUninstallResult(renderer, result);
    }
  }
}

async function runCommand({
  command,
  flags,
  cwd,
  stdout,
  renderer,
  prompt,
  services,
  appVersion
}) {
  if (command === "detect") {
    const detections = await services.detectProject(cwd);
    if (flags.json) {
      renderer.writeJson({
        command: "detect",
        cwd,
        count: detections.length,
        detections
      });
      return;
    }
    printDetectResult(renderer, cwd, detections);
    return;
  }

  if (command === "list") {
    const skills = await services.loadAllSkills();
    if (flags.json) {
      renderer.writeJson({
        command: "list",
        count: skills.length,
        skills
      });
      return;
    }
    printListResult(renderer, skills);
    return;
  }

  if (command === "doctor") {
    const result = await services.runDoctor(cwd);
    if (flags.json) {
      renderer.writeJson({
        command: "doctor",
        ...result
      });
      return;
    }
    printDoctorResult(renderer, result);
    return;
  }

  if (command === "uninstall") {
    if (!flags.json && !flags.yes && Boolean(stdout?.isTTY)) {
      const confirmed = await prompt.confirm({
        message: "Remove the skilly-hand installation from this project?",
        default: false
      });
      if (!confirmed) {
        renderer.write(renderer.status("info", "Uninstall cancelled."));
        return;
      }
    }

    const result = await services.uninstallProject(cwd);
    if (flags.json) {
      renderer.writeJson({
        command: "uninstall",
        ...result
      });
      return;
    }
    printUninstallResult(renderer, result);
    return;
  }

  if (command === "install") {
    if (!flags.dryRun && !flags.json && !flags.yes && Boolean(stdout?.isTTY)) {
      const confirmed = await prompt.confirm({
        message: "Apply installation changes to this project?",
        default: true
      });
      if (!confirmed) {
        renderer.write(renderer.status("info", "Installation cancelled.", "No files were written."));
        return;
      }
    }

    const result = await services.installProject({
      cwd,
      agents: flags.agents,
      dryRun: flags.dryRun,
      includeTags: flags.include,
      excludeTags: flags.exclude
    });

    if (flags.json) {
      renderer.writeJson({
        command: "install",
        applied: result.applied,
        plan: result.plan,
        lockPath: result.lockPath || null
      });
      return;
    }

    printInstallResult(renderer, appVersion, result, flags);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

export async function runCli({
  argv = process.argv.slice(2),
  stdout = process.stdout,
  stderr = process.stderr,
  env = process.env,
  platform = process.platform,
  prompt = createPromptAdapter(),
  services: providedServices = {},
  appVersion = version,
  cwdResolver = process.cwd
} = {}) {
  const renderer = createTerminalRenderer({ stdout, stderr, env, platform });
  const services = createServices(providedServices);
  const { command, flags } = parseArgs(argv);

  if (flags.help) {
    if (flags.json) {
      renderer.writeJson({
        command: command || "install",
        help: true,
        usage: [
          "npx skilly-hand",
          "npx skilly-hand install",
          "npx skilly-hand detect",
          "npx skilly-hand list",
          "npx skilly-hand doctor",
          "npx skilly-hand uninstall"
        ]
      });
      return;
    }

    renderer.write(buildHelpText(renderer, appVersion));
    return;
  }

  const cwd = path.resolve(flags.cwd || cwdResolver());

  if (isInteractiveLauncherMode({ command, flags, stdout })) {
    try {
      await runInteractiveSession({
        cwd,
        renderer,
        prompt,
        services,
        appVersion
      });
      return;
    } catch (error) {
      if (error?.name === "ExitPromptError") {
        renderer.write(renderer.status("info", "Interactive session cancelled."));
        return;
      }
      throw error;
    }
  }

  const effectiveCommand = command || "install";
  await runCommand({
    command: effectiveCommand,
    flags,
    cwd,
    stdout,
    renderer,
    prompt,
    services,
    appVersion
  });
}

if (isExecutedDirectly(import.meta.url, process.argv[1])) {
  const jsonRequested = process.argv.includes("--json");
  const renderer = createTerminalRenderer();

  runCli().catch((error) => {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "skilly-hand command failed",
          why: error.message,
          hint: buildErrorHint(error.message)
        }
      });
      process.exitCode = 1;
      return;
    }

    renderer.writeError(
      renderer.error({
        what: "skilly-hand command failed",
        why: error.message,
        hint: buildErrorHint(error.message),
        exitCode: 1
      })
    );
    process.exitCode = 1;
  });
}
