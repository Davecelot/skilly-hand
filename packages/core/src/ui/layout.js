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

function summarizeDenseValue(value) {
  const raw = String(value);
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 4) return { display: raw, detail: null };
  return {
    display: `${parts.slice(0, 3).join(", ")} +${parts.length - 3} more`,
    detail: raw
  };
}

function fitWidths(preferred, minimums, target) {
  const widths = [...preferred];
  let current = widths.reduce((sum, width) => sum + width, 0);
  if (current <= target) return widths;

  while (current > target) {
    let idx = -1;
    let widest = 0;

    for (let i = 0; i < widths.length; i += 1) {
      if (widths[i] > minimums[i] && widths[i] > widest) {
        widest = widths[i];
        idx = i;
      }
    }

    if (idx === -1) return null;
    widths[idx] -= 1;
    current -= 1;
  }

  return widths;
}

function nextWrapChunk(text, width) {
  if (text.length <= width) return [text, ""];
  const split = text.lastIndexOf(" ", width);
  if (split <= 0) return [text.slice(0, width), text.slice(width)];
  return [text.slice(0, split), text.slice(split + 1)];
}

function wrapPrefixedText(text, maxWidth, firstPrefix, continuationPrefix) {
  const lines = [];
  let remaining = String(text).trim();
  let first = true;

  while (remaining.length > 0) {
    const prefix = first ? firstPrefix : continuationPrefix;
    const available = Math.max(8, maxWidth - prefix.length);
    const [chunk, rest] = nextWrapChunk(remaining, available);
    lines.push(prefix + chunk);
    remaining = rest.trimStart();
    first = false;
  }

  if (lines.length === 0) {
    return [firstPrefix.trimEnd()];
  }

  return lines;
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
    const viewportWidth = Math.max(40, Number(opts.viewportWidth) || 80);
    const headers = columns.map((c) => String(c.header));
    const detailMarker = unicodeEnabled ? "↳ " : "-> ";
    const minWidths = headers.map((header) => Math.max(6, Math.min(visLen(header), 14)));

    const matrix = rows.map((row) =>
      columns.map((c) => {
        const summarized = summarizeDenseValue(String(row[c.key] ?? ""));
        return {
          display: summarized.display,
          detail: summarized.detail
        };
      })
    );

    const preferredWidths = headers.map((h, i) => {
      const contentMax = matrix.reduce((max, row) => Math.max(max, visLen(row[i].display)), 0);
      return Math.min(Math.max(visLen(h), contentMax, 3), maxColW);
    });

    const borderedOverhead = (3 * headers.length) + 1;
    const compactOverhead = 3 * Math.max(headers.length - 1, 0);
    const preferredSum = preferredWidths.reduce((sum, width) => sum + width, 0);

    const s = box.s;

    function makeRow(cells, widths, leftC, midC, rightC, padChar = " ") {
      const inner = cells.map((cell, i) => padChar + padEnd(cell, widths[i]) + padChar).join(midC);
      return leftC + inner + rightC;
    }

    function makeDivider(widths, leftC, midC, rightC, fillC) {
      const inner = widths.map((w) => fillC.repeat(w + 2)).join(midC);
      return leftC + inner + rightC;
    }

    function buildCompactTable(widths) {
      const compactRows = [];
      const formattedHeaders = headers.map((header, idx) => truncate(header, widths[idx]));
      const headerLine = formattedHeaders.map((header, idx) => padEnd(header, widths[idx])).join(" | ");
      const sepLine = widths.map((width) => "-".repeat(width)).join("-+-");

      compactRows.push(headerLine);
      compactRows.push(sepLine);

      for (let rowIdx = 0; rowIdx < matrix.length; rowIdx += 1) {
        const row = matrix[rowIdx];
        const cells = row.map((cell, colIdx) => truncate(cell.display, widths[colIdx]));
        compactRows.push(cells.map((cell, colIdx) => padEnd(cell, widths[colIdx])).join(" | "));

        const details = [];
        for (let colIdx = 0; colIdx < row.length; colIdx += 1) {
          if (!row[colIdx].detail) continue;
          details.push(...wrapPrefixedText(
            `${headers[colIdx]}: ${row[colIdx].detail}`,
            viewportWidth,
            `${detailMarker}`,
            "  "
          ));
        }
        compactRows.push(...details.map((line) => theme.muted(line)));
      }

      return compactRows.join("\n");
    }

    function buildCardList() {
      const cardRows = [];
      for (let rowIdx = 0; rowIdx < matrix.length; rowIdx += 1) {
        const row = matrix[rowIdx];
        for (let colIdx = 0; colIdx < row.length; colIdx += 1) {
          const header = headers[colIdx];
          const value = row[colIdx].display;
          const isFirst = colIdx === 0;
          const prefix = isFirst ? `${detailMarker}${header}: ` : `  ${header}: `;
          const continuation = isFirst ? "  " : "    ";
          const lineSet = wrapPrefixedText(value, viewportWidth, prefix, continuation);
          if (isFirst) {
            cardRows.push(...lineSet.map((line, idx) => idx === 0 ? theme.accent(line) : line));
          } else {
            cardRows.push(...lineSet);
          }

          if (row[colIdx].detail) {
            cardRows.push(...wrapPrefixedText(
              row[colIdx].detail,
              viewportWidth,
              `    ${header} (full): `,
              "      "
            ).map((line) => theme.muted(line)));
          }
        }

        if (rowIdx < matrix.length - 1) {
          cardRows.push(theme.muted("-".repeat(Math.min(32, viewportWidth))));
        }
      }
      return cardRows.join("\n");
    }

    const canUseBordered = unicodeEnabled && (preferredSum + borderedOverhead <= viewportWidth);
    if (canUseBordered) {
      const widths = preferredWidths;
      const topBorder = makeDivider(widths, s.tl, s.mt, s.tr, s.h);
      const headerRow = makeRow(headers.map((h) => theme.bold(h)), widths, theme.primary(s.v), theme.primary(s.v), theme.primary(s.v));
      const headerSep = makeDivider(widths, s.dl, s.dc, s.dr, s.dh);
      const tableWidth = visLen(topBorder);
      const detailContentWidth = Math.max(8, tableWidth - 4);

      const bodyRows = [];
      for (const row of matrix) {
        bodyRows.push(makeRow(
          row.map((cell, i) => i === 0 ? theme.accent(truncate(cell.display, widths[i])) : truncate(cell.display, widths[i])),
          widths,
          theme.primary(s.v),
          theme.primary(s.v),
          theme.primary(s.v)
        ));

        for (let colIdx = 0; colIdx < row.length; colIdx += 1) {
          if (!row[colIdx].detail) continue;
          const wrapped = wrapPrefixedText(
            `${headers[colIdx]}: ${row[colIdx].detail}`,
            detailContentWidth,
            detailMarker,
            "  "
          );
          for (const line of wrapped) {
            bodyRows.push(
              theme.primary(s.v) +
              " " +
              padEnd(theme.muted(line), detailContentWidth) +
              " " +
              theme.primary(s.v)
            );
          }
        }
      }

      const bottomBorder = makeDivider(widths, s.bl, s.mb, s.br, s.h);
      return [theme.primary(topBorder), headerRow, theme.primary(headerSep), ...bodyRows, theme.primary(bottomBorder)].join("\n");
    }

    const compactWidthTarget = viewportWidth - compactOverhead;
    const fittedCompactWidths = fitWidths(preferredWidths, minWidths, compactWidthTarget);
    if (fittedCompactWidths) {
      return buildCompactTable(fittedCompactWidths);
    }

    return buildCardList();
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
