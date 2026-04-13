import inquirer from "inquirer";
import { filterCommands, getInteractiveCommands } from "./command-registry.js";

function writeBlock(write, title, body) {
  const lines = [];
  if (title) {
    lines.push(`\n${title}`);
    lines.push("=".repeat(Math.max(12, title.length)));
  }
  if (body) {
    lines.push(String(body).trimEnd());
  }
  lines.push("");
  write(`${lines.join("\n")}\n`);
}

function formatSkillChoiceLabel(skill) {
  const tags = (skill.tags || []).join(", ") || "none";
  const agents = (skill.agentSupport || []).join(", ") || "none";
  return `${skill.id} | ${skill.title} | tags: ${tags} | agents: ${agents}`;
}

function toCheckboxChoices(items, valueKey, labelFn) {
  return items.map((item) => ({
    name: labelFn(item),
    value: item[valueKey],
    checked: Boolean(item.checked)
  }));
}

function commandChoiceName(command) {
  return `${command.label} - ${command.description}`;
}

function buildCommandGuide(commands) {
  const rows = commands.filter((command) => command.value !== "exit").map((command) => {
    const aliases = (command.aliases || []).join(", ") || "none";
    return [
      `${command.label} (${command.value})`,
      `Best for: ${command.bestFor}`,
      `Aliases: ${aliases}`,
      `Run: ${command.usage}`
    ].join("\n");
  });
  return rows.join("\n\n");
}

function buildGuidedHomeIntro() {
  return [
    "Type to filter commands, then press Enter to run.",
    "Tips: arrow keys to navigate, Esc to clear search, Ctrl+C to exit."
  ].join("\n");
}

function installTipsBlock() {
  return [
    "Recommended skills are preselected using stack detection.",
    "Use space to toggle, a to toggle all, i to invert selection."
  ].join("\n");
}

function agentTipsBlock() {
  return [
    "Pick assistant targets that should receive installed skills.",
    "Use space to toggle and Enter to continue."
  ].join("\n");
}

const COMMAND_HINTS = {
  "native-setup": "Tip: run `npx skilly-hand doctor` next to verify native coverage.",
  detect: "Tip: run `npx skilly-hand install` to apply detected recommendations.",
  list: "Tip: use `npx skilly-hand install --include <tag>` to narrow installation.",
  doctor: "Tip: resolve any warnings, then rerun doctor before release.",
  uninstall: "Tip: run `npx skilly-hand install` anytime to restore managed files."
};

export function createInquirerInteractiveUi({
  prompt = (questions) => inquirer.prompt(questions),
  write = (value) => process.stdout.write(value)
} = {}) {
  async function confirm({ message, defaultValue = false }) {
    try {
      const response = await prompt([
        {
          type: "confirm",
          name: "confirmed",
          message: String(message),
          default: defaultValue
        }
      ]);
      return Boolean(response.confirmed);
    } catch (error) {
      if (error?.name === "ExitPromptError") return false;
      throw error;
    }
  }

  async function launch({ appVersion, actions, commands = getInteractiveCommands() }) {
    const header = appVersion ? `skilly-hand v${appVersion}` : "skilly-hand";
    writeBlock(write, "Guided Home", buildGuidedHomeIntro());

    while (true) {
      const { command } = await prompt([
        {
          type: "search",
          name: "command",
          message: `${header}: choose a command`,
          source: async (term) =>
            filterCommands(commands, term).map((item) => ({
              name: commandChoiceName(item),
              value: item.value,
              description: `${item.bestFor} | aliases: ${(item.aliases || []).join(", ") || "none"}`
            })),
          default: "install",
          pageSize: 10
        }
      ]);

      if (command === "exit") return;
      if (command === "command-guide") {
        writeBlock(write, "Command Guide", buildCommandGuide(commands));
        continue;
      }

      if (command === "install") {
        const context = await actions.prepareInstall();
        const skillChoices = toCheckboxChoices(context.skills || [], "id", formatSkillChoiceLabel);
        const agentChoices = toCheckboxChoices(context.agents || [], "value", (agent) => agent.value);

        writeBlock(write, "Install Tips", installTipsBlock());

        const { selectedSkillIds } = await prompt([
          {
            type: "checkbox",
            name: "selectedSkillIds",
            message: "Select skills to install",
            choices: skillChoices,
            pageSize: 16
          }
        ]);

        writeBlock(write, "Assistant Target Tips", agentTipsBlock());

        const { selectedAgents } = await prompt([
          {
            type: "checkbox",
            name: "selectedAgents",
            message: "Select assistant targets",
            choices: agentChoices,
            pageSize: 12
          }
        ]);

        const previewBundle = await actions.previewInstallBundle({
          selectedSkillIds,
          selectedAgents
        });
        writeBlock(write, "Install Preview", previewBundle?.text || "");

        const { installDecision } = await prompt([
          {
            type: "list",
            name: "installDecision",
            message: "Next action",
            choices: [
              { name: "Apply installation", value: "apply" },
              { name: "Back to command menu", value: "menu" }
            ]
          }
        ]);

        if (installDecision === "apply") {
          const applyBundle = await actions.applyInstallBundle({
            selectedSkillIds,
            selectedAgents
          });
          writeBlock(write, "Install Result", applyBundle?.text || "");
          writeBlock(write, "Next Hint", "Run `npx skilly-hand doctor` to verify installation health.");
        }
        continue;
      }

      if (command === "uninstall") {
        const accepted = await confirm({
          message: "Remove the skilly-hand installation from this project?",
          defaultValue: false
        });
        if (!accepted) {
          writeBlock(write, "Uninstall", "Uninstall cancelled.");
          continue;
        }
      }

      const bundle = await actions.runCommandBundle(command);
      writeBlock(write, "Command Result", bundle?.text || "");
      if (COMMAND_HINTS[command]) writeBlock(write, "Next Hint", COMMAND_HINTS[command]);
    }
  }

  return { launch, confirm };
}
