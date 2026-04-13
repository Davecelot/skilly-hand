const CLI_COMMANDS = [
  {
    value: "install",
    label: "Install",
    description: "Install portable skills into the current project.",
    bestFor: "First-time setup and skill refresh",
    aliases: ["setup", "init", "apply"],
    usage: "npx skilly-hand install"
  },
  {
    value: "native-setup",
    label: "Native Setup",
    description: "Sync native assistant adapters and instruction files.",
    bestFor: "After install or when assistant targets change",
    aliases: ["native", "adapters"],
    usage: "npx skilly-hand native setup"
  },
  {
    value: "detect",
    label: "Detect",
    description: "Scan project technologies and show detected signals.",
    bestFor: "Preview auto-detection before installation",
    aliases: ["scan", "inspect"],
    usage: "npx skilly-hand detect"
  },
  {
    value: "list",
    label: "List",
    description: "List all skills available in the catalog.",
    bestFor: "Browse skills and tags",
    aliases: ["catalog", "skills"],
    usage: "npx skilly-hand list"
  },
  {
    value: "doctor",
    label: "Doctor",
    description: "Diagnose install health, probes, and native coverage.",
    bestFor: "Troubleshooting and pre-release checks",
    aliases: ["health", "check"],
    usage: "npx skilly-hand doctor"
  },
  {
    value: "uninstall",
    label: "Uninstall",
    description: "Remove managed skilly-hand installation files.",
    bestFor: "Restore project to pre-install state",
    aliases: ["remove", "cleanup"],
    usage: "npx skilly-hand uninstall"
  }
];

const INTERACTIVE_ONLY_COMMANDS = [
  {
    value: "command-guide",
    label: "Command Guide",
    description: "Show command explanations, aliases, and examples.",
    bestFor: "Learning what to run",
    aliases: ["help", "guide"],
    usage: "npx skilly-hand --help"
  },
  {
    value: "exit",
    label: "Exit",
    description: "Close the guided launcher.",
    bestFor: "Leave interactive mode",
    aliases: ["quit"],
    usage: "npx skilly-hand"
  }
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function buildSearchText(command) {
  return [
    command.value,
    command.label,
    command.description,
    command.bestFor,
    ...(command.aliases || [])
  ]
    .map(normalizeText)
    .join(" ");
}

export function getCliCommands() {
  return CLI_COMMANDS.map((command) => ({ ...command, aliases: [...command.aliases] }));
}

export function getInteractiveCommands() {
  const merged = [...CLI_COMMANDS, ...INTERACTIVE_ONLY_COMMANDS];
  return merged.map((command) => ({ ...command, aliases: [...command.aliases] }));
}

export function filterCommands(commands, term) {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return [...commands];
  return commands.filter((command) => buildSearchText(command).includes(normalizedTerm));
}

export function formatHelpUsageLines() {
  return [
    "npx skilly-hand                  # interactive launcher when running in a TTY",
    ...CLI_COMMANDS.map((command) => command.usage)
  ];
}

