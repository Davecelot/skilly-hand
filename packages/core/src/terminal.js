import { detectColorLevel, createTheme, createLayout } from "./ui/index.js";

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

function asString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function stripAnsi(value) {
  return asString(value).replace(ANSI_PATTERN, "");
}

function padEndAnsi(value, width) {
  const clean = stripAnsi(value);
  if (clean.length >= width) return value;
  return value + " ".repeat(width - clean.length);
}

function normalizeBooleanEnv(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "" || normalized === "0" || normalized === "false" || normalized === "no") return false;
  return true;
}

function detectViewportWidth({ stdout = process.stdout, env = process.env } = {}) {
  if (stdout?.isTTY && Number.isInteger(stdout.columns) && stdout.columns > 0) {
    return stdout.columns;
  }

  const envColumns = Number.parseInt(String(env?.COLUMNS ?? ""), 10);
  if (Number.isInteger(envColumns) && envColumns > 0) {
    return envColumns;
  }

  return 80;
}

// Kept as exported API (tests import these directly)
export function detectColorSupport({ env = process.env, stream = process.stdout } = {}) {
  const noColor = normalizeBooleanEnv(env.NO_COLOR);
  if (noColor) return false;

  const forceColor = normalizeBooleanEnv(env.FORCE_COLOR);
  if (forceColor === true) return true;
  if (forceColor === false) return false;

  if (!stream?.isTTY) return false;
  if (env.CI) return false;
  return true;
}

export function detectUnicodeSupport({ env = process.env, stream = process.stdout, platform = process.platform } = {}) {
  if (!stream?.isTTY) return false;
  if (env.TERM === "dumb") return false;
  if (env.NO_UNICODE) return false;
  if (platform === "win32") {
    return Boolean(env.WT_SESSION || env.TERM_PROGRAM || env.ConEmuTask || env.ANSICON);
  }
  return true;
}

function renderPlainTable(columns, rows) {
  if (!columns || columns.length === 0) return "";
  const header = columns.map((c) => c.header);
  const matrix = [header, ...rows.map((row) => columns.map((c) => asString(row[c.key] ?? "")))];
  const widths = header.map((_, i) =>
    matrix.reduce((max, line) => Math.max(max, stripAnsi(line[i]).length), 0)
  );
  const headerLine = header.map((v, i) => padEndAnsi(v, widths[i])).join("  ");
  const sepLine = widths.map((w) => "-".repeat(Math.max(3, w))).join("  ");
  const body = rows.map((row) =>
    columns.map((c, i) => padEndAnsi(asString(row[c.key] ?? ""), widths[i])).join("  ")
  );
  return [headerLine, sepLine, ...body].join("\n");
}

function joinBlocks(blocks) {
  const filtered = blocks.map((block) => asString(block).trimEnd()).filter(Boolean);
  if (filtered.length === 0) return "";
  return filtered.join("\n\n");
}

export function createTerminalRenderer({
  stdout = process.stdout,
  stderr = process.stderr,
  env = process.env,
  platform = process.platform,
  colorProfile = "mono-accent",
  density = "balanced"
} = {}) {
  const colorLevel = detectColorLevel({ env, stream: stdout });
  const colorEnabled = colorLevel > 0;
  const unicodeEnabled = detectUnicodeSupport({ env, stream: stdout, platform });
  const viewportWidth = detectViewportWidth({ stdout, env });

  const theme = createTheme(colorLevel, { colorProfile });
  const layout = createLayout(theme, unicodeEnabled, { density });

  // Backward-compat style object (callers in tests may use renderer.style.*)
  const style = {
    reset:   (v) => asString(v),
    bold:    theme.bold,
    dim:     theme.dim,
    cyan:    theme.primary,
    green:   theme.success,
    yellow:  theme.warn,
    red:     theme.error,
    magenta: theme.magenta,
  };

  const symbols = unicodeEnabled
    ? { info: "i", success: "✓", warn: "!", error: "x", bullet: "•", section: "■" }
    : { info: "i", success: "+", warn: "!", error: "x", bullet: "-", section: "#" };

  const statusStyles = {
    info:    theme.info,
    success: theme.success,
    warn:    theme.warn,
    error:   theme.error,
  };

  const renderer = {
    colorEnabled,
    colorLevel,
    unicodeEnabled,
    viewportWidth,
    symbols,
    style,
    theme,

    json(value) {
      return JSON.stringify(value, null, 2);
    },

    section(title, body = "") {
      const heading = layout.sectionHeader(title);
      const bodyText = asString(body).trimEnd();
      return bodyText ? `${heading}\n${bodyText}` : heading;
    },

    kv(entries) {
      return layout.kvPanel(entries);
    },

    list(items, options = {}) {
      if (!items || items.length === 0) return "";
      const bullet = options.bullet || symbols.bullet;
      return items.map((item) => `${bullet} ${asString(item)}`).join("\n");
    },

    table(columns, rows) {
      return layout.borderedTable(columns, rows, { viewportWidth });
    },

    status(level, message, detail = "") {
      const applied = statusStyles[level] || ((v) => v);
      const icon = symbols[level] || symbols.info;
      const main = `${applied(icon)} ${asString(message)}`;
      if (!detail) return main;
      return `${main}\n${theme.dim("  " + asString(detail))}`;
    },

    summary(title, items = []) {
      return renderer.section(title, renderer.list(items));
    },

    nextSteps(steps = []) {
      if (!steps.length) return "";
      return renderer.section("Next Steps", renderer.list(steps));
    },

    error({ what = "Command failed", why = "", hint = "", exitCode = 1 } = {}) {
      const blocks = [
        renderer.status("error", what),
        why  ? renderer.kv([["Why", why]])                : "",
        hint ? renderer.kv([["How to recover", hint]])   : "",
        renderer.kv([["Exit code", asString(exitCode)]])
      ];
      return joinBlocks(blocks);
    },

    // ── New visual methods ─────────────────────────────────────────────────

    banner(version) {
      return layout.banner(version);
    },

    detectionGrid(detections) {
      return layout.detectionGrid(detections);
    },

    healthBadge(installed) {
      return layout.healthBadge(installed);
    },

    joinBlocks,
  };

  return {
    ...renderer,
    write(block = "") {
      if (block) stdout.write(`${block}\n`);
    },
    writeError(block = "") {
      if (block) stderr.write(`${block}\n`);
    },
    writeJson(value) {
      stdout.write(`${renderer.json(value)}\n`);
    },
    writeErrorJson(value) {
      stderr.write(`${renderer.json(value)}\n`);
    },
  };
}
