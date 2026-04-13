#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { loadAllSkills } from "../../catalog/src/index.js";
import {
  DEFAULT_AGENTS,
  installProject,
  resolveSkillSelection,
  runDoctor,
  setupNativeProject,
  uninstallProject
} from "../../core/src/index.js";
import { createTerminalRenderer } from "../../core/src/terminal.js";
import { detectProject } from "../../detectors/src/index.js";
import { createInquirerInteractiveUi } from "./inquirer-ui.js";
import { formatHelpUsageLines, getCliCommands, getInteractiveCommands } from "./command-registry.js";
import {
  createResultDoc,
  kvBlock,
  listBlock,
  renderResultDocText,
  section,
  statusBlock,
  tableBlock,
  textBlock
} from "./result-doc.js";

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
    classic: false,
    agents: null,
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
    else if (token === "--classic") flags.classic = true;
    else if (token === "--agent" || token === "-a") { if (!flags.agents) flags.agents = []; flags.agents.push(takeFlagValue(token)); }
    else if (token === "--cwd") flags.cwd = takeFlagValue(token);
    else if (token === "--include") flags.include.push(takeFlagValue(token));
    else if (token === "--exclude") flags.exclude.push(takeFlagValue(token));
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return { command: positional[0], subcommand: positional[1], flags };
}

function buildHelpText(renderer, appVersion) {
  const usage = renderer.section("Usage", renderer.list(formatHelpUsageLines(), { bullet: "-" }));

  const commands = renderer.section("Commands", renderer.list(
    getCliCommands().map((command) => `${command.usage}  # ${command.description}`),
    { bullet: "-" }
  ));

  const flags = renderer.section("Flags", renderer.list([
    "--dry-run                     Show install plan without writing files",
    "--json                        Emit stable JSON output for automation",
    "--classic                     Deprecated alias for plain command mode (launcher disabled)",
    "--yes, -y                     Skip install/uninstall confirmations",
    "--verbose, -v                 Reserved for future debug detail",
    "--agent, -a <name>            standard|codex|claude|cursor|gemini|copilot|antigravity|windsurf|trae (repeatable)",
    "--cwd <path>                  Project root (defaults to current directory)",
    "--include <tag>               Include only skills matching all tags",
    "--exclude <tag>               Exclude skills matching any tag",
    "--help, -h                    Show help"
  ], { bullet: "-" }));

  const examples = renderer.section("Examples", renderer.list([
    "npx skilly-hand",
    "npx skilly-hand install --dry-run",
    "npx skilly-hand native setup --agent codex",
    "npx skilly-hand detect --json",
    "npx skilly-hand install --agent antigravity --agent windsurf",
    "npx skilly-hand uninstall --yes"
  ], { bullet: "-" }));

  return renderer.joinBlocks([
    renderer.banner(appVersion),
    usage,
    commands,
    flags,
    examples
  ]);
}

function buildInstallResultDoc(result, flags, detectionGridText = "") {
  const mode = flags.dryRun ? "dry-run" : "apply";
  return createResultDoc("Install", [
    section("Install Preflight", [
      kvBlock([
        ["Project", result.plan.cwd],
        ["Install root", result.plan.installRoot],
        ["Agents", result.plan.agents.join(", ") || "none"],
        ["Include tags", flags.include.join(", ") || "none"],
        ["Exclude tags", flags.exclude.join(", ") || "none"],
        ["Mode", mode]
      ])
    ]),
    section("Detected Technologies", [
      result.plan.detections.length > 0
        ? textBlock(detectionGridText)
        : statusBlock("warn", "No technology signals were detected.", "Only core skills will be selected.")
    ]),
    section("Skill Plan", [
      result.plan.skills.length > 0
        ? tableBlock(
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
        : statusBlock("warn", "No skills selected.")
    ]),
    section("Status", [
      result.applied
        ? statusBlock("success", "Installation completed.", "Managed files and symlinks are in place.")
        : statusBlock("info", "Dry run complete.", "No files were written.")
    ]),
    section("Next Steps", [
      listBlock(
        result.applied
          ? [
              "Review generated AGENTS and assistant instruction files.",
              "Run `npx skilly-hand native setup` to scaffold native instruction/rule adapters.",
              "Run `npx skilly-hand doctor` to validate installation health.",
              "Use `npx skilly-hand uninstall` to restore backed-up files if needed."
            ]
          : [
              "Run `npx skilly-hand install` to apply this plan.",
              "Adjust `--include` and `--exclude` tags to tune skill selection."
            ]
      )
    ])
  ]);
}

function buildNativeSetupResultDoc(result, flags) {
  const mode = flags.dryRun ? "dry-run" : "apply";
  return createResultDoc("Native Setup", [
    section("Native Setup Preflight", [
      kvBlock([
        ["Project", result.plan.cwd],
        ["Install root", result.plan.installRoot],
        ["Agents", result.plan.agents.join(", ") || "none"],
        ["Mode", mode]
      ])
    ]),
    section("Native Coverage", [
      tableBlock(
        [
          { key: "agent", header: "Agent" },
          { key: "status", header: "Status" },
          { key: "target", header: "Target" },
          { key: "remediation", header: "Remediation" }
        ],
        (result.nativeStatus || result.plan.nativeStatus || []).map((row) => ({
          agent: row.agent,
          status: row.status,
          target: row.target || "-",
          remediation: row.remediation
        }))
      )
    ]),
    section("Status", [
      result.applied
        ? statusBlock("success", "Native setup completed.", "Native rule/instruction files are synchronized.")
        : statusBlock("info", "Native setup dry run complete.", "No files were written.")
    ]),
    section("Next Steps", [
      listBlock(
        result.applied
          ? [
              "Run `npx skilly-hand doctor` to verify native coverage.",
              "Re-run `npx skilly-hand native setup` after changing agent targets."
            ]
          : [
              "Run `npx skilly-hand native setup` to apply these native adapter changes."
            ]
      )
    ])
  ]);
}

function renderResultDoc(renderer, appVersion, doc, options = {}) {
  return renderResultDocText(renderer, appVersion, doc, options);
}

function buildInstallResultBlock(renderer, appVersion, result, flags, options = {}) {
  const doc = buildInstallResultDoc(result, flags, renderer.detectionGrid(result.plan.detections));
  return renderResultDoc(renderer, appVersion, doc, options);
}

function buildNativeSetupResultBlock(renderer, appVersion, result, flags, options = {}) {
  return renderResultDoc(renderer, appVersion, buildNativeSetupResultDoc(result, flags), options);
}

function printNativeSetupResult(renderer, appVersion, result, flags) {
  renderer.write(buildNativeSetupResultBlock(renderer, appVersion, result, flags, { includeBanner: true }));
}

function printInstallResult(renderer, appVersion, result, flags) {
  renderer.write(buildInstallResultBlock(renderer, appVersion, result, flags, { includeBanner: true }));
}

function buildDetectResultDoc(cwd, detections, detectionGridText = "") {
  return createResultDoc("Detect", [
    section("Detection Summary", [
      kvBlock([
        ["Project", cwd],
        ["Signals found", String(detections.length)]
      ])
    ]),
    section("Findings", [
      detections.length > 0
        ? textBlock(detectionGridText)
        : statusBlock("warn", "No technology signals were detected.", "Only core skills will be selected.")
    ])
  ]);
}

function buildDetectResultBlock(renderer, cwd, detections) {
  const doc = buildDetectResultDoc(cwd, detections, renderer.detectionGrid(detections));
  return renderResultDoc(renderer, "", doc, { includeBanner: false });
}

function printDetectResult(renderer, cwd, detections) {
  renderer.write(buildDetectResultBlock(renderer, cwd, detections));
}

function buildListResultDoc(skills) {
  return createResultDoc("List", [
    section("Catalog Summary", [kvBlock([["Skills available", String(skills.length)]])]),
    section("Skills", [
      tableBlock(
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
    ])
  ]);
}

function buildListResultBlock(renderer, skills) {
  return renderResultDoc(renderer, "", buildListResultDoc(skills), { includeBanner: false });
}

function printListResult(renderer, skills) {
  renderer.write(buildListResultBlock(renderer, skills));
}

function buildDoctorResultDoc(result, healthBadgeText = "") {
  const sections = [
    section("Health", [textBlock(healthBadgeText)]),
    section("Doctor Summary", [
      kvBlock([
        ["Project", result.cwd],
        ["Installed", result.installed ? "yes" : "no"],
        ["Catalog issues", String(result.catalogIssues.length)]
      ])
    ])
  ];

  if (result.lock) {
    sections.push(section("Lock Metadata", [
      kvBlock([
        ["Generated at", result.lock.generatedAt],
        ["Agents", result.lock.agents.join(", ")],
        ["Skills", result.lock.skills.join(", ")]
      ])
    ]));
  }

  sections.push(section("Catalog Issues", [
    result.catalogIssues.length
      ? listBlock(result.catalogIssues)
      : statusBlock("success", "No catalog issues found.")
  ]));

  sections.push(section("Project Probes", [
    tableBlock(
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
  ]));

  sections.push(section("Native Coverage", [
    tableBlock(
      [
        { key: "agent", header: "Agent" },
        { key: "status", header: "Status" },
        { key: "target", header: "Target" },
        { key: "remediation", header: "Remediation" }
      ],
      (result.nativeStatus || []).map((row) => ({
        agent: row.agent,
        status: row.status,
        target: row.target || "-",
        remediation: row.remediation
      }))
    )
  ]));

  return createResultDoc("Doctor", sections);
}

function buildDoctorResultBlock(renderer, result) {
  const doc = buildDoctorResultDoc(result, renderer.healthBadge(result.installed));
  return renderResultDoc(renderer, "", doc, { includeBanner: false });
}

function printDoctorResult(renderer, result) {
  renderer.write(buildDoctorResultBlock(renderer, result));
}

function buildUninstallResultDoc(result) {
  if (result.removed) {
    return createResultDoc("Uninstall", [
      section("Status", [statusBlock("success", "skilly-hand installation removed.")]),
      section("Next Steps", [
        listBlock([
          "Run `npx skilly-hand install` if you want to reinstall managed files.",
          "Run `npx skilly-hand doctor` to confirm the project state."
        ])
      ])
    ]);
  }

  return createResultDoc("Uninstall", [
    section("Status", [statusBlock("warn", "Nothing to uninstall.", result.reason)]),
    section("Next Steps", [listBlock(["Run `npx skilly-hand install` to create a managed installation first."])])
  ]);
}

function buildUninstallResultBlock(renderer, result) {
  return renderResultDoc(renderer, "", buildUninstallResultDoc(result), { includeBanner: false });
}

function printUninstallResult(renderer, result) {
  renderer.write(buildUninstallResultBlock(renderer, result));
}

export function buildErrorHint(message) {
  if (message.startsWith("Unknown command:")) {
    return "Run `npx skilly-hand --help` to see available commands.";
  }
  if (message.startsWith("Unknown native subcommand:")) {
    return "Use `npx skilly-hand native setup`.";
  }
  if (message.startsWith("Unknown flag:") || message.startsWith("Missing value")) {
    return "Check command flags with `npx skilly-hand --help`.";
  }
  return "Retry with `--verbose` for expanded context if needed.";
}

function createServices(overrides = {}) {
  return {
    loadAllSkills,
    installProject,
    resolveSkillSelection,
    runDoctor,
    setupNativeProject,
    uninstallProject,
    detectProject,
    defaultAgents: DEFAULT_AGENTS,
    ...overrides
  };
}

function isInteractiveLauncherMode({ command, flags, stdout, stdin }) {
  return !command && !flags.json && !flags.classic && Boolean(stdout?.isTTY) && Boolean(stdin?.isTTY);
}

async function getInteractiveInstallContext({
  cwd,
  services
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

  return {
    skills: portableCatalog.map((skill) => ({
      ...skill,
      checked: preselected.has(skill.id)
    })),
    agents: services.defaultAgents.map((agent) => ({
      value: agent,
      checked: agent === "standard"
    }))
  };
}

async function runInteractiveSession({
  cwd,
  renderer,
  services,
  appVersion,
  interactiveUi
}) {
  const interactiveCommands = getInteractiveCommands();

  await interactiveUi.launch({
    appVersion,
    commands: interactiveCommands,
    actions: {
      async runCommandBundle(command) {
        if (command === "native-setup") {
          const result = await services.setupNativeProject({ cwd, dryRun: false });
          const doc = buildNativeSetupResultDoc(result, { dryRun: false });
          return {
            doc,
            text: renderResultDoc(renderer, appVersion, doc, { includeBanner: false })
          };
        }
        if (command === "detect") {
          const detections = await services.detectProject(cwd);
          const doc = buildDetectResultDoc(cwd, detections, renderer.detectionGrid(detections));
          return {
            doc,
            text: renderResultDoc(renderer, "", doc, { includeBanner: false })
          };
        }
        if (command === "list") {
          const skills = await services.loadAllSkills();
          const doc = buildListResultDoc(skills);
          return {
            doc,
            text: renderResultDoc(renderer, "", doc, { includeBanner: false })
          };
        }
        if (command === "doctor") {
          const result = await services.runDoctor(cwd);
          const doc = buildDoctorResultDoc(result, renderer.healthBadge(result.installed));
          return {
            doc,
            text: renderResultDoc(renderer, "", doc, { includeBanner: false })
          };
        }
        if (command === "uninstall") {
          const result = await services.uninstallProject(cwd);
          const doc = buildUninstallResultDoc(result);
          return {
            doc,
            text: renderResultDoc(renderer, "", doc, { includeBanner: false })
          };
        }
        const doc = createResultDoc("Result", [section("Status", [statusBlock("warn", `Unknown command: ${command}`)])]);
        return {
          doc,
          text: renderResultDoc(renderer, "", doc, { includeBanner: false })
        };
      },
      async runCommandDoc(command) {
        const bundle = await this.runCommandBundle(command);
        return bundle.doc;
      },
      async runCommand(command) {
        const bundle = await this.runCommandBundle(command);
        return bundle.text;
      },
      async prepareInstall() {
        return getInteractiveInstallContext({ cwd, services });
      },
      async previewInstallBundle({ selectedSkillIds, selectedAgents }) {
        const preview = await services.installProject({
          cwd,
          agents: selectedAgents,
          dryRun: true,
          selectedSkillIds
        });
        const doc = buildInstallResultDoc(preview, {
          dryRun: true,
          include: [],
          exclude: []
        }, renderer.detectionGrid(preview.plan.detections));
        return {
          doc,
          text: renderResultDoc(renderer, appVersion, doc, { includeBanner: false })
        };
      },
      async previewInstall({ selectedSkillIds, selectedAgents }) {
        const bundle = await this.previewInstallBundle({ selectedSkillIds, selectedAgents });
        return bundle.text;
      },
      async previewInstallDoc({ selectedSkillIds, selectedAgents }) {
        const bundle = await this.previewInstallBundle({ selectedSkillIds, selectedAgents });
        return bundle.doc;
      },
      async applyInstallBundle({ selectedSkillIds, selectedAgents }) {
        const applied = await services.installProject({
          cwd,
          agents: selectedAgents,
          dryRun: false,
          selectedSkillIds
        });
        const doc = buildInstallResultDoc(applied, {
          dryRun: false,
          include: [],
          exclude: []
        }, renderer.detectionGrid(applied.plan.detections));
        return {
          doc,
          text: renderResultDoc(renderer, appVersion, doc, { includeBanner: false })
        };
      },
      async applyInstall({ selectedSkillIds, selectedAgents }) {
        const bundle = await this.applyInstallBundle({ selectedSkillIds, selectedAgents });
        return bundle.text;
      },
      async applyInstallDoc({ selectedSkillIds, selectedAgents }) {
        const bundle = await this.applyInstallBundle({ selectedSkillIds, selectedAgents });
        return bundle.doc;
      }
    }
  });
}

async function runCommand({
  command,
  subcommand,
  flags,
  cwd,
  stdin,
  stdout,
  renderer,
  services,
  appVersion,
  interactiveUi
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
    if (!flags.json && !flags.yes && Boolean(stdout?.isTTY) && Boolean(stdin?.isTTY)) {
      const confirmed = await interactiveUi.confirm({
        message: "Remove the skilly-hand installation from this project?",
        defaultValue: false
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
    if (!flags.dryRun && !flags.json && !flags.yes && Boolean(stdout?.isTTY) && Boolean(stdin?.isTTY)) {
      const confirmed = await interactiveUi.confirm({
        message: "Apply installation changes to this project?",
        defaultValue: true
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

  if (command === "native") {
    if (subcommand && subcommand !== "setup") {
      throw new Error(`Unknown native subcommand: ${subcommand}`);
    }

    const result = await services.setupNativeProject({
      cwd,
      agents: flags.agents,
      dryRun: flags.dryRun
    });

    if (flags.json) {
      renderer.writeJson({
        command: "native setup",
        applied: result.applied,
        plan: result.plan,
        nativeStatus: result.nativeStatus || result.plan.nativeStatus || [],
        lockPath: result.lockPath || null
      });
      return;
    }

    printNativeSetupResult(renderer, appVersion, result, flags);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

export async function runCli({
  argv = process.argv.slice(2),
  stdin = process.stdin,
  stdout = process.stdout,
  stderr = process.stderr,
  env = process.env,
  platform = process.platform,
  services: providedServices = {},
  interactiveUi = createInquirerInteractiveUi(),
  appVersion = version,
  cwdResolver = process.cwd
} = {}) {
  const renderer = createTerminalRenderer({ stdout, stderr, env, platform });
  const services = createServices(providedServices);
  const { command, subcommand, flags } = parseArgs(argv);

  if (flags.help) {
    if (flags.json) {
      renderer.writeJson({
        command: command || "install",
        help: true,
        usage: formatHelpUsageLines().map((line) => line.split("#")[0].trim())
      });
      return;
    }

    renderer.write(buildHelpText(renderer, appVersion));
    return;
  }

  const cwd = path.resolve(flags.cwd || cwdResolver());

  if (flags.classic && !flags.json) {
    renderer.write(renderer.status("info", "`--classic` is deprecated and kept only for backwards compatibility."));
  }

  if (isInteractiveLauncherMode({ command, flags, stdout, stdin })) {
    try {
      await runInteractiveSession({
        cwd,
        renderer,
        services,
        appVersion,
        interactiveUi
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
    subcommand,
    flags,
    cwd,
    stdin,
    stdout,
    renderer,
    services,
    appVersion,
    interactiveUi
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
