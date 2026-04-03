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

function createStyler(enabled) {
  if (!enabled) {
    const passthrough = (value) => asString(value);
    return {
      reset: passthrough,
      bold: passthrough,
      dim: passthrough,
      cyan: passthrough,
      green: passthrough,
      yellow: passthrough,
      red: passthrough,
      magenta: passthrough
    };
  }

  const wrap = (code) => (value) => `\u001b[${code}m${asString(value)}\u001b[0m`;
  return {
    reset: wrap("0"),
    bold: wrap("1"),
    dim: wrap("2"),
    cyan: wrap("36"),
    green: wrap("32"),
    yellow: wrap("33"),
    red: wrap("31"),
    magenta: wrap("35")
  };
}

function renderKeyValue(entries, style) {
  if (!entries || entries.length === 0) return "";
  const normalized = entries.map(([key, value]) => [asString(key), asString(value)]);
  const width = normalized.reduce((max, [key]) => Math.max(max, key.length), 0);
  return normalized
    .map(([key, value]) => `${style.dim(padEndAnsi(key, width))} : ${value}`)
    .join("\n");
}

function renderList(items, { bullet }) {
  if (!items || items.length === 0) return "";
  return items.map((item) => `${bullet} ${asString(item)}`).join("\n");
}

function renderTable(columns, rows) {
  if (!columns || columns.length === 0) return "";
  const header = columns.map((column) => column.header);
  const matrix = [header, ...rows.map((row) => columns.map((column) => asString(row[column.key] ?? "")))];
  const widths = header.map((_, index) =>
    matrix.reduce((max, line) => Math.max(max, stripAnsi(line[index]).length), 0)
  );

  const headerLine = header.map((value, index) => padEndAnsi(value, widths[index])).join("  ");
  const separatorLine = widths.map((width) => "-".repeat(Math.max(3, width))).join("  ");
  const body = rows.map((row) =>
    columns.map((column, index) => padEndAnsi(asString(row[column.key] ?? ""), widths[index])).join("  ")
  );

  return [headerLine, separatorLine, ...body].join("\n");
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
  platform = process.platform
} = {}) {
  const colorEnabled = detectColorSupport({ env, stream: stdout });
  const unicodeEnabled = detectUnicodeSupport({ env, stream: stdout, platform });
  const style = createStyler(colorEnabled);
  const symbols = unicodeEnabled
    ? { info: "i", success: "✓", warn: "!", error: "x", bullet: "•", section: "■" }
    : { info: "i", success: "+", warn: "!", error: "x", bullet: "-", section: "#" };

  const statusStyles = {
    info: style.cyan,
    success: style.green,
    warn: style.yellow,
    error: style.red
  };

  const renderer = {
    colorEnabled,
    unicodeEnabled,
    symbols,
    style,
    json(value) {
      return JSON.stringify(value, null, 2);
    },
    section(title, body = "") {
      const heading = `${style.cyan(symbols.section)} ${style.bold(asString(title))}`;
      const bodyText = asString(body).trimEnd();
      return bodyText ? `${heading}\n${bodyText}` : heading;
    },
    kv(entries) {
      return renderKeyValue(entries, style);
    },
    list(items, options = {}) {
      return renderList(items, { bullet: options.bullet || symbols.bullet });
    },
    table(columns, rows) {
      return renderTable(columns, rows);
    },
    status(level, message, detail = "") {
      const applied = statusStyles[level] || ((value) => value);
      const icon = symbols[level] || symbols.info;
      const main = `${applied(icon)} ${asString(message)}`;
      if (!detail) return main;
      return `${main}\n${style.dim("  " + asString(detail))}`;
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
        why ? renderer.kv([["Why", why]]) : "",
        hint ? renderer.kv([["How to recover", hint]]) : "",
        renderer.kv([["Exit code", asString(exitCode)]])
      ];
      return joinBlocks(blocks);
    },
    joinBlocks
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
    }
  };
}
