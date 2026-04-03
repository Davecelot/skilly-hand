// Layout primitives: banner, section headers, bordered tables, detection grid, health badge.

import { getBrand } from "./brand.js";

const ANSI_RE = /\x1b\[[0-9;]*m/g;

function stripAnsi(value) {
  return String(value).replace(ANSI_RE, "");
}

function visLen(value) {
  return stripAnsi(value).length;
}

function padEnd(value, width) {
  const len = visLen(value);
  if (len >= width) return value;
  return value + " ".repeat(width - len);
}

function padStart(value, width) {
  const len = visLen(value);
  if (len >= width) return value;
  return " ".repeat(width - len) + value;
}

function truncate(value, maxWidth) {
  const clean = stripAnsi(value);
  if (clean.length <= maxWidth) return value;
  return clean.slice(0, maxWidth - 1) + "…";
}

// Box character sets
const BOX = {
  // double-line outer (for banner)
  d: {
    tl: "╔", tr: "╗", bl: "╚", br: "╝",
    h: "═", v: "║",
    ml: "╠", mr: "╣",
  },
  // single-line inner (for tables and sections)
  s: {
    tl: "┌", tr: "┐", bl: "└", br: "┘",
    h: "─", v: "│",
    ml: "├", mr: "┤",
    mt: "┬", mb: "┴", x: "┼",
    // double-separator row (header separator in tables)
    dh: "═",
    dl: "╞", dr: "╡", dc: "╪",
  },
};

// ASCII fallback chars
const BOX_ASCII = {
  d: { tl: "+", tr: "+", bl: "+", br: "+", h: "=", v: "|", ml: "+", mr: "+" },
  s: {
    tl: "+", tr: "+", bl: "+", br: "+",
    h: "-", v: "|",
    ml: "+", mr: "+", mt: "+", mb: "+", x: "+",
    dh: "=", dl: "+", dr: "+", dc: "+",
  },
};

export function createLayout(theme, unicodeEnabled) {
  const box = unicodeEnabled ? BOX : BOX_ASCII;
  const brand = getBrand();

  // ── Banner ────────────────────────────────────────────────────────────────

  function banner(version) {
    const logo = unicodeEnabled ? brand.logo.unicode : brand.logo.ascii;
    const innerW = 56; // inner content width (excluding border chars)

    const nameStr = brand.name;
    const versionStr = version ? `  v${version}` : "";
    const taglineStr = brand.tagline;
    const hintStr = brand.hint;

    // right column content
    const rightLines = [
      theme.bold(theme.accent(nameStr)) + theme.muted(versionStr),
      theme.muted(taglineStr),
      "",
      "",
      "",
    ];

    const logoW = Math.max(...logo.map((l) => stripAnsi(l).length));
    const gap = 3;
    const rightW = innerW - logoW - gap - 2; // 2 for leading spaces

    const d = box.d;
    const hLine = d.h.repeat(innerW + 2); // +2 for padding spaces inside border

    const rows = logo.map((logoLine, i) => {
      const logoColored = theme.primary(theme.bold(logoLine));
      const rightLine = rightLines[i] || "";
      const logoLen = logoW;
      const logoPadded = padEnd(logoColored, logoLen + (visLen(logoColored) - stripAnsi(logoColored).length));
      const rightPadded = padEnd(rightLine, rightW);
      const content = "  " + logoPadded + " ".repeat(gap) + rightPadded;
      const contentVis = visLen(content);
      const totalW = innerW + 2;
      const paddingNeeded = Math.max(0, totalW - contentVis);
      return d.v + content + " ".repeat(paddingNeeded) + d.v;
    });

    // separator row between logo area and hint
    const sepRow = d.ml + d.h.repeat(innerW + 2) + d.mr;

    const hintContent = "  " + theme.muted(hintStr);
    const hintVis = visLen(hintContent);
    const hintPad = Math.max(0, innerW + 2 - hintVis);
    const hintRow = d.v + hintContent + " ".repeat(hintPad) + d.v;

    const lines = [
      d.tl + hLine + d.tr,
      ...rows,
      sepRow,
      hintRow,
      d.bl + hLine + d.br,
    ];

    return lines.join("\n");
  }

  // ── Section header ────────────────────────────────────────────────────────

  function sectionHeader(title) {
    if (!unicodeEnabled) {
      return theme.bold(title);
    }
    const s = box.s;
    const decorated = theme.primary(s.tl) + theme.primary(s.h.repeat(2)) + " " + theme.bold(title) + " " + theme.primary(s.h.repeat(Math.max(2, 40 - title.length)));
    return decorated;
  }

  // ── Bordered table ────────────────────────────────────────────────────────

  function borderedTable(columns, rows, opts = {}) {
    if (!columns || columns.length === 0) return "";
    const maxColW = opts.maxColWidth || 36;

    const headers = columns.map((c) => String(c.header));
    const matrix = rows.map((row) =>
      columns.map((c) => truncate(String(row[c.key] ?? ""), maxColW))
    );

    // Compute column widths
    const widths = headers.map((h, i) => {
      const contentMax = matrix.reduce((m, row) => Math.max(m, visLen(row[i])), 0);
      return Math.max(visLen(h), contentMax, 3);
    });

    if (!unicodeEnabled) {
      // Plain fallback — original table style
      const headerLine = headers.map((h, i) => padEnd(h, widths[i])).join("  ");
      const sepLine = widths.map((w) => "-".repeat(w)).join("  ");
      const bodyLines = matrix.map((row) =>
        row.map((cell, i) => padEnd(cell, widths[i])).join("  ")
      );
      return [headerLine, sepLine, ...bodyLines].join("\n");
    }

    const s = box.s;

    function makeRow(cells, widths, leftC, midC, rightC, padChar = " ") {
      const inner = cells.map((cell, i) => padChar + padEnd(cell, widths[i]) + padChar).join(midC);
      return leftC + inner + rightC;
    }

    function makeDivider(widths, leftC, midC, rightC, fillC) {
      const inner = widths.map((w) => fillC.repeat(w + 2)).join(midC);
      return leftC + inner + rightC;
    }

    const topBorder    = makeDivider(widths, s.tl, s.mt, s.tr, s.h);
    const headerRow    = makeRow(headers.map((h, i) => theme.bold(h)), widths, theme.primary(s.v), theme.primary(s.v), theme.primary(s.v));
    const headerSep    = makeDivider(widths, s.dl, s.dc, s.dr, s.dh);
    const bodyRows     = matrix.map((row) =>
      makeRow(
        row.map((cell, i) => {
          // color first column (usually ID) with accent
          return i === 0 ? theme.accent(cell) : cell;
        }),
        widths, theme.primary(s.v), theme.primary(s.v), theme.primary(s.v)
      )
    );
    const bottomBorder = makeDivider(widths, s.bl, s.mb, s.br, s.h);

    // Apply primary color to border chars
    const colorBorder = (line) => {
      // Replace non-letter/space chars with colored versions
      return theme.primary(line);
    };

    return [
      colorBorder(topBorder),
      headerRow,
      colorBorder(headerSep),
      ...bodyRows,
      colorBorder(bottomBorder),
    ].join("\n");
  }

  // ── Detection grid ────────────────────────────────────────────────────────

  function detectionGrid(detections) {
    if (!detections || detections.length === 0) {
      return theme.warn("! No technology signals detected.");
    }

    const COLS = 3;
    const COL_W = 20;

    function icon(confidence) {
      if (unicodeEnabled) {
        if (confidence >= 0.85) return theme.success("✔");
        if (confidence >= 0.70) return theme.primary("◆");
        return theme.warn("⚠");
      }
      if (confidence >= 0.85) return theme.success("[+]");
      if (confidence >= 0.70) return theme.primary("[-]");
      return theme.warn("[!]");
    }

    function colorTech(tech, confidence) {
      if (confidence >= 0.85) return theme.success(tech);
      if (confidence >= 0.70) return theme.primary(tech);
      return theme.warn(tech);
    }

    const cells = detections.map((d) => {
      const pct = Math.round(d.confidence * 100) + "%";
      const ic = icon(d.confidence);
      const name = colorTech(d.technology, d.confidence);
      const pctStr = theme.muted(pct);
      // visual: "✔ React        95%"
      return ic + " " + padEnd(name, COL_W - 5) + " " + padEnd(pctStr, 4);
    });

    const rows = [];
    for (let i = 0; i < cells.length; i += COLS) {
      rows.push(cells.slice(i, i + COLS).join("   "));
    }

    return rows.join("\n");
  }

  // ── Health badge ──────────────────────────────────────────────────────────

  function healthBadge(installed) {
    if (unicodeEnabled) {
      if (installed) {
        const badge = theme.success(theme.bold("██ HEALTHY"));
        const line = theme.primary(" ─────────────────────────────────");
        return badge + line;
      }
      const badge = theme.warn(theme.bold("██ NOT INSTALLED"));
      const line = theme.muted(" ─────────────────────────────────");
      return badge + line;
    }

    if (installed) {
      return theme.success(theme.bold("[OK] Installation healthy"));
    }
    return theme.warn(theme.bold("[!!] Not installed"));
  }

  // ── Key-value panel ───────────────────────────────────────────────────────

  function kvPanel(entries) {
    if (!entries || entries.length === 0) return "";
    const normalized = entries.map(([k, v]) => [String(k), String(v)]);
    const width = normalized.reduce((max, [k]) => Math.max(max, k.length), 0);
    return normalized
      .map(([k, v]) => `${theme.muted(padEnd(k, width))} : ${v}`)
      .join("\n");
  }

  return {
    banner,
    sectionHeader,
    borderedTable,
    detectionGrid,
    healthBadge,
    kvPanel,
  };
}
