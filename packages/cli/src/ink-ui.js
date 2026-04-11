import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { getBrand } from "../../core/src/ui/brand.js";

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

function stripAnsi(value) {
  return String(value || "").replace(ANSI_PATTERN, "");
}

function wrapText(text, width) {
  const safeWidth = Math.max(20, width || 80);
  const input = String(text || "").split("\n");
  const lines = [];
  for (const rawLine of input) {
    const line = rawLine.trimEnd();
    if (!line) {
      lines.push("");
      continue;
    }
    let rest = line;
    while (rest.length > safeWidth) {
      let split = rest.lastIndexOf(" ", safeWidth);
      if (split <= 0) split = safeWidth;
      lines.push(rest.slice(0, split));
      rest = rest.slice(split).trimStart();
    }
    lines.push(rest);
  }
  return lines;
}

function truncateLine(text, maxWidth) {
  const safeWidth = Math.max(4, maxWidth || 40);
  const chars = Array.from(String(text || ""));
  if (chars.length <= safeWidth) return chars.join("");
  if (safeWidth <= 4) return chars.slice(0, safeWidth).join("");
  return `${chars.slice(0, safeWidth - 1).join("")}…`;
}

function formatConfirmPreviewLines(preview, width) {
  const rawLines = String(preview || "").split("\n");
  const bodyStart = rawLines.findIndex((line) =>
    /Install Preflight|Detection Summary|Catalog Summary|Doctor Summary|Findings|Skill Plan/.test(line)
  );
  const headEnd = bodyStart > 0 ? bodyStart : Math.min(12, rawLines.length);
  const head = rawLines.slice(0, headEnd).map((line) => truncateLine(line, width));
  const body = rawLines.slice(headEnd).flatMap((line) => wrapText(line, width));
  return [...head, ...body];
}

function formatConfirmPreviewFromDoc(previewDoc, width) {
  const blocks = docToBlocks(previewDoc, Math.max(24, width - 2));
  const lines = [];
  for (let idx = 0; idx < blocks.length; idx += 1) {
    lines.push(...blocks[idx].lines.map((line) => line.text));
    if (idx < blocks.length - 1) lines.push("");
  }
  return lines;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function computeWindow(total, visible, cursor) {
  if (total <= 0) return { start: 0, end: 0 };
  const safeVisible = Math.max(1, Math.min(visible, total));
  const half = Math.floor(safeVisible / 2);
  let start = cursor - half;
  start = clamp(start, 0, Math.max(0, total - safeVisible));
  return { start, end: start + safeVisible };
}

function fitWindowByLineBudget(blocks, cursor, availableLines) {
  const total = blocks.length;
  if (total <= 0) return { start: 0, end: 0, usedLines: 0 };

  const safeCursor = clamp(cursor, 0, total - 1);
  const budget = Math.max(1, availableLines);

  let start = safeCursor;
  const focusLines = Math.max(1, blocks[safeCursor].lineCount);
  const desiredTopLines = Math.max(0, Math.floor((budget - focusLines) / 2));

  let consumedTop = 0;
  while (start > 0) {
    const next = Math.max(1, blocks[start - 1].lineCount);
    if (consumedTop + next > desiredTopLines) break;
    start -= 1;
    consumedTop += next;
  }

  let end = start;
  let usedLines = 0;
  while (end < total) {
    const next = Math.max(1, blocks[end].lineCount);
    if (usedLines + next > budget && end > start) break;
    usedLines += next;
    end += 1;
    if (usedLines >= budget && end > start) break;
  }

  if (safeCursor >= end) {
    start = safeCursor;
    end = safeCursor;
    usedLines = 0;
    while (end < total) {
      const next = Math.max(1, blocks[end].lineCount);
      if (usedLines + next > budget && end > start) break;
      usedLines += next;
      end += 1;
      if (usedLines >= budget && end > start) break;
    }
  }

  while (start > 0) {
    const next = Math.max(1, blocks[start - 1].lineCount);
    if (usedLines + next > budget) break;
    start -= 1;
    usedLines += next;
  }

  return { start, end, usedLines };
}

function useAsyncAction() {
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setBusy(true);
    try {
      return await action();
    } finally {
      setBusy(false);
    }
  }

  return { busy, run };
}

function Header({ appVersion }) {
  const brand = getBrand();
  const logo = brand.logo.unicode;

  return React.createElement(
    Box,
    { flexDirection: "column", marginBottom: 1 },
    ...logo.map((line, idx) => React.createElement(Text, { key: `logo-${idx}`, color: "cyan" }, line)),
    React.createElement(
      Box,
      { marginTop: 1 },
      React.createElement(Text, { color: "cyan", bold: true }, `${brand.name}`),
      React.createElement(Text, { color: "gray" }, appVersion ? `  v${appVersion}` : ""),
      React.createElement(Text, { color: "gray" }, `  ${brand.tagline}`)
    )
  );
}

function MenuPanel({ selectedIndex, menuItems }) {
  return React.createElement(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, paddingY: 0, width: 32 },
    React.createElement(Text, { color: "cyan", bold: true }, "Command Hub"),
    ...menuItems.map((item, idx) => {
      const active = idx === selectedIndex;
      return React.createElement(
        Text,
        { key: item.value, color: active ? "black" : "white", backgroundColor: active ? "cyan" : undefined },
        `${active ? "›" : " "} ${item.label}`
      );
    }),
    React.createElement(Text, { color: "gray" }, ""),
    React.createElement(Text, { color: "gray" }, "↑↓ move  Enter select  q quit")
  );
}

function ResultPanel({ title, lines, busy, maxLines, offset }) {
  const viewportLines = Math.max(6, maxLines - 4);
  const maxOffset = Math.max(0, lines.length - viewportLines);
  const safeOffset = clamp(offset, 0, maxOffset);
  const visible = lines.slice(safeOffset, safeOffset + viewportLines);
  const from = lines.length ? safeOffset + 1 : 0;
  const to = safeOffset + visible.length;

  return React.createElement(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, flexGrow: 1 },
    React.createElement(Text, { color: "cyan", bold: true }, title),
    busy ? React.createElement(Text, { color: "yellow" }, "Working...") : null,
    ...visible.map((line, idx) =>
      React.createElement(Text, { key: `line-${idx}`, color: idx === 0 ? "white" : "gray" }, line)
    ),
    React.createElement(Text, { color: "cyan" }, "─".repeat(Math.max(12, 56))),
    React.createElement(
      Text,
      { color: "gray" },
      `Lines ${from}-${to} of ${lines.length}  |  ↑/↓ or j/k scroll`
    )
  );
}

function isResultDoc(value) {
  return Boolean(value && typeof value === "object" && value.type === "result-doc");
}

function padEndPlain(value, width) {
  const raw = String(value || "");
  if (raw.length >= width) return raw;
  return raw + " ".repeat(width - raw.length);
}

function truncatePlain(value, width) {
  const raw = String(value || "");
  if (raw.length <= width) return raw;
  if (width <= 1) return raw.slice(0, width);
  return `${raw.slice(0, width - 1)}…`;
}

function renderAdaptiveTableLines({ columns, rows, width }) {
  const safeWidth = Math.max(40, width);
  const headers = columns.map((column) => String(column.header));
  const values = rows.map((row) => columns.map((column) => String(row[column.key] ?? "")));

  if (headers.length === 0) return [];

  if (safeWidth >= 90 && headers.length <= 4) {
    const desired = headers.map((header, index) => {
      const maxCell = values.reduce((max, row) => Math.max(max, row[index]?.length || 0), header.length);
      return Math.min(Math.max(10, maxCell), 36);
    });
    const gap = 3;
    let total = desired.reduce((sum, value) => sum + value, 0) + (headers.length - 1) * gap;
    while (total > safeWidth && desired.some((value) => value > 10)) {
      const idx = desired.findIndex((value) => value === Math.max(...desired));
      desired[idx] -= 1;
      total -= 1;
    }

    const headerLine = headers.map((header, index) => padEndPlain(truncatePlain(header, desired[index]), desired[index])).join("   ");
    const sepLine = desired.map((value) => "─".repeat(value)).join("   ");
    const lines = [
      { text: headerLine, tone: "label" },
      { text: sepLine, tone: "muted" }
    ];
    for (const row of values) {
      lines.push({
        text: row.map((cell, index) => padEndPlain(truncatePlain(cell, desired[index]), desired[index])).join("   "),
        tone: "body"
      });
    }
    return lines;
  }

  if (safeWidth >= 68) {
    const maxCols = Math.min(headers.length, 3);
    const usedHeaders = headers.slice(0, maxCols);
    const colWidths = usedHeaders.map((header, index) => {
      const maxCell = values.reduce((max, row) => Math.max(max, (row[index] || "").length), header.length);
      return Math.min(Math.max(8, maxCell), 26);
    });
    const headerLine = usedHeaders.map((header, index) => padEndPlain(truncatePlain(header, colWidths[index]), colWidths[index])).join(" | ");
    const sepLine = colWidths.map((value) => "─".repeat(value)).join("-+-");
    const lines = [
      { text: headerLine, tone: "label" },
      { text: sepLine, tone: "muted" }
    ];
    for (const row of values) {
      lines.push({
        text: usedHeaders.map((_, index) => padEndPlain(truncatePlain(row[index] || "", colWidths[index]), colWidths[index])).join(" | "),
        tone: "body"
      });
      if (headers.length > maxCols) {
        for (let idx = maxCols; idx < headers.length; idx += 1) {
          lines.push({ text: `  ${headers[idx]}: ${truncatePlain(row[idx] || "", safeWidth - 4)}`, tone: "muted" });
        }
      }
    }
    return lines;
  }

  const lines = [];
  for (const row of values) {
    for (let idx = 0; idx < headers.length; idx += 1) {
      const wrapped = wrapText(`${headers[idx]}: ${row[idx] || "-"}`, safeWidth - 2);
      wrapped.forEach((line, lineIndex) => {
        lines.push({ text: lineIndex === 0 ? `• ${line}` : `  ${line}`, tone: lineIndex === 0 ? "body" : "muted" });
      });
    }
    lines.push({ text: "─".repeat(Math.max(12, safeWidth - 4)), tone: "muted" });
  }
  if (lines.length > 0) lines.pop();
  return lines;
}

function docToBlocks(doc, width) {
  const blocks = [];
  for (const section of doc.sections || []) {
    const lines = [{ text: section.title, tone: "heading" }];
    for (const block of section.blocks || []) {
      if (block.type === "kv") {
        const keyWidth = (block.entries || []).reduce((max, [key]) => Math.max(max, String(key).length), 0);
        for (const [key, value] of block.entries || []) {
          const prefix = `${padEndPlain(String(key), keyWidth)} : `;
          const wrapped = wrapText(String(value || "-"), Math.max(16, width - prefix.length));
          wrapped.forEach((line, index) => {
            lines.push({
              text: index === 0 ? `${prefix}${line}` : `${" ".repeat(prefix.length)}${line}`,
              tone: index === 0 ? "body" : "muted"
            });
          });
        }
      } else if (block.type === "table") {
        lines.push(...renderAdaptiveTableLines({ columns: block.columns || [], rows: block.rows || [], width }));
      } else if (block.type === "list") {
        for (const item of block.items || []) {
          const bullet = block.bullet || "•";
          const wrapped = wrapText(String(item), Math.max(20, width - 4));
          wrapped.forEach((line, index) => {
            lines.push({ text: index === 0 ? `${bullet} ${line}` : `  ${line}`, tone: index === 0 ? "body" : "muted" });
          });
        }
      } else if (block.type === "status") {
        const icon = block.level === "success" ? "✓" : block.level === "warn" ? "!" : block.level === "error" ? "x" : "i";
        lines.push({ text: `${icon} ${block.message}`, tone: block.level || "info" });
        if (block.detail) {
          wrapText(String(block.detail), Math.max(20, width - 2)).forEach((line) => lines.push({ text: `  ${line}`, tone: "muted" }));
        }
      } else if (block.type === "text") {
        wrapText(String(block.text || ""), width).forEach((line) => lines.push({ text: line, tone: "body" }));
      }
    }
    blocks.push({ key: section.title, lines, lineCount: lines.length + 1 });
  }
  return blocks;
}

function toneToColor(tone) {
  if (tone === "heading") return { color: "cyan", bold: true };
  if (tone === "label") return { color: "cyan", bold: false };
  if (tone === "muted") return { color: "gray", bold: false };
  if (tone === "success") return { color: "green", bold: false };
  if (tone === "warn") return { color: "yellow", bold: false };
  if (tone === "error") return { color: "red", bold: false };
  if (tone === "info") return { color: "cyan", bold: false };
  return { color: "white", bold: false };
}

function ResultDocPanel({ title, blocks, busy, maxLines, blockOffset, lineOffset }) {
  const availableLines = Math.max(6, maxLines - 4);
  const safeBlock = clamp(blockOffset, 0, Math.max(0, blocks.length - 1));
  const flatLines = [];
  const blockStarts = [];

  for (let idx = 0; idx < blocks.length; idx += 1) {
    blockStarts.push(flatLines.length);
    flatLines.push(...blocks[idx].lines);
    if (idx < blocks.length - 1) {
      flatLines.push({ text: "", tone: "muted" });
    }
  }

  const maxOffset = Math.max(0, flatLines.length - availableLines);
  const safeOffset = clamp(lineOffset || 0, 0, maxOffset);
  const visible = flatLines.slice(safeOffset, safeOffset + availableLines);
  const from = flatLines.length ? safeOffset + 1 : 0;
  const to = safeOffset + visible.length;

  return React.createElement(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, flexGrow: 1 },
    React.createElement(Text, { color: "cyan", bold: true }, title),
    busy ? React.createElement(Text, { color: "yellow" }, "Working...") : null,
    ...visible.map((line, idx) => {
      const style = toneToColor(line.tone);
      return React.createElement(Text, { key: `result-doc-line-${idx}`, color: style.color, bold: style.bold }, line.text);
    }),
    React.createElement(Text, { color: "cyan" }, "─".repeat(Math.max(12, 56))),
    React.createElement(Text, { color: "gray" }, `Lines ${from}-${to} of ${flatLines.length}  |  Block ${safeBlock + 1} of ${blocks.length}  |  ↑/↓ menu  j/k scroll`)
  );
}

function computeSkillBlock({ skill, focused, chosen, contentWidth }) {
  const safeWidth = Math.max(20, contentWidth);
  const tagsText = `  tags: ${skill.tags.join(", ") || "none"}`;
  const agentsText = `  agents: ${skill.agentSupport.join(", ") || "none"}`;
  const tagsLines = wrapText(tagsText, safeWidth);
  const agentsLines = wrapText(agentsText, safeWidth);
  const header = `${focused ? "›" : " "} [${chosen ? "x" : " "}] ${skill.id} | ${skill.title}`;
  const lines = [header, ...tagsLines, ...agentsLines];
  return {
    skill,
    lines,
    lineCount: lines.length
  };
}

export function buildSkillBlocksForRender({ skills, cursor, selectedIds, contentWidth }) {
  return skills.map((skill, idx) =>
    computeSkillBlock({
      skill,
      focused: idx === cursor,
      chosen: selectedIds.has(skill.id),
      contentWidth
    })
  );
}

export function computeSkillWindow({ blocks, cursor, availableLines }) {
  return fitWindowByLineBudget(blocks, cursor, availableLines);
}

function SkillPickerPanel({ skills, cursor, selectedIds, maxLines, width }) {
  const contentWidth = Math.max(20, (width || 80) - 6);
  const blocks = buildSkillBlocksForRender({
    skills,
    cursor,
    selectedIds,
    contentWidth
  });
  const availableLines = Math.max(1, maxLines - 5);
  const window = computeSkillWindow({ blocks, cursor, availableLines });
  const chunk = blocks.slice(window.start, window.end);

  return React.createElement(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, flexGrow: 1 },
    React.createElement(Text, { color: "cyan", bold: true }, "Install: Select Skills"),
    ...chunk.map((block, localIdx) => {
      const idx = window.start + localIdx;
      return React.createElement(
        Box,
        { key: block.skill.id, flexDirection: "column" },
        ...block.lines.map((line, lineIdx) =>
          React.createElement(Text, {
            key: `${block.skill.id}-${lineIdx}`,
            color: lineIdx === 0 ? (idx === cursor ? "black" : "white") : "gray",
            backgroundColor: lineIdx === 0 && idx === cursor ? "cyan" : undefined
          }, line)
        )
      );
    }),
    React.createElement(Text, { color: "cyan" }, "─".repeat(Math.max(12, 56))),
    React.createElement(
      Text,
      { color: "gray" },
      `Skills ${window.start + 1}-${window.end} of ${skills.length}`
    ),
    React.createElement(Text, { color: "gray" }, "↑/↓ or j/k move, Space toggle, Enter continue, Backspace cancel")
  );
}

function AgentPickerPanel({ agents, cursor, selected, maxLines }) {
  const visibleAgents = Math.max(1, maxLines - 5);
  const window = computeWindow(agents.length, visibleAgents, cursor);
  const chunk = agents.slice(window.start, window.end);

  return React.createElement(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, flexGrow: 1 },
    React.createElement(Text, { color: "cyan", bold: true }, "Install: Select Assistants"),
    ...chunk.map((agent, localIdx) => {
      const idx = window.start + localIdx;
      const focused = idx === cursor;
      const chosen = selected.has(agent);
      return React.createElement(
        Text,
        { key: agent, color: focused ? "black" : "white", backgroundColor: focused ? "cyan" : undefined },
        `${focused ? "›" : " "} [${chosen ? "x" : " "}] ${agent}`
      );
    }),
    React.createElement(Text, { color: "cyan" }, "─".repeat(Math.max(12, 56))),
    React.createElement(
      Text,
      { color: "gray" },
      `Assistants ${window.start + 1}-${window.end} of ${agents.length}`
    ),
    React.createElement(Text, { color: "gray" }, "↑/↓ or j/k move, Space toggle, Enter continue, Backspace back")
  );
}

function ConfirmPanel({ title, preview, previewDoc, options, selectedIndex, width, maxLines, offset }) {
  const previewWidth = Math.max(24, (width || 80) - 10);
  const previewLines = previewDoc
    ? formatConfirmPreviewFromDoc(previewDoc, previewWidth)
    : formatConfirmPreviewLines(preview, previewWidth);
  const viewport = Math.max(5, maxLines - 14);
  const maxOffset = Math.max(0, previewLines.length - viewport);
  const safeOffset = clamp(offset, 0, maxOffset);
  const visible = previewLines.slice(safeOffset, safeOffset + viewport);
  const from = previewLines.length ? safeOffset + 1 : 0;
  const to = safeOffset + visible.length;

  return React.createElement(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, flexGrow: 1 },
    React.createElement(Text, { color: "cyan", bold: true }, title),
    React.createElement(Text, { color: "cyan" }, "Action"),
    ...options.map((opt, idx) => {
      const active = idx === selectedIndex;
      return React.createElement(
        Text,
        { key: opt, color: active ? "black" : "white", backgroundColor: active ? "cyan" : undefined },
        `${active ? "›" : " "} ${opt}`
      );
    }),
    React.createElement(Text, { color: "cyan" }, "─".repeat(Math.max(12, 56))),
    React.createElement(Text, { color: "cyan" }, "Install Snapshot"),
    React.createElement(
      Box,
      { flexDirection: "column", borderStyle: "single", borderColor: "gray", paddingX: 1, paddingY: 0 },
      ...visible.map((line, idx) => React.createElement(Text, { key: `preview-${idx}`, color: "gray" }, line))
    ),
    React.createElement(Text, { color: "cyan" }, "─".repeat(Math.max(12, 56))),
    React.createElement(Text, { color: "gray" }, `Preview ${from}-${to} of ${previewLines.length}`),
    React.createElement(Text, { color: "gray" }, "↑/↓ choose, Enter confirm, Backspace cancel, j/k scroll")
  );
}

function App({ appVersion, actions, onResolve }) {
  const menuItems = [
    { value: "install", label: "Install" },
    { value: "native-setup", label: "Native Setup" },
    { value: "detect", label: "Detect" },
    { value: "list", label: "List" },
    { value: "doctor", label: "Doctor" },
    { value: "uninstall", label: "Uninstall" },
    { value: "exit", label: "Exit" }
  ];

  const { exit } = useApp();
  const [mode, setMode] = useState("menu");
  const [menuIndex, setMenuIndex] = useState(0);
  const [resultTitle, setResultTitle] = useState("Ready");
  const [resultBody, setResultBody] = useState("Choose a command from the left.");
  const [resultDoc, setResultDoc] = useState(null);
  const [resultOffset, setResultOffset] = useState(0);
  const [resultBlockOffset, setResultBlockOffset] = useState(0);
  const [resultDocLineOffset, setResultDocLineOffset] = useState(0);

  const [installSkills, setInstallSkills] = useState([]);
  const [installAgents, setInstallAgents] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [selectedAgents, setSelectedAgents] = useState(new Set());
  const [cursorIndex, setCursorIndex] = useState(0);
  const [confirmChoice, setConfirmChoice] = useState(0);
  const [installPreview, setInstallPreview] = useState("");
  const [installPreviewDoc, setInstallPreviewDoc] = useState(null);
  const [confirmPreviewOffset, setConfirmPreviewOffset] = useState(0);

  const { busy, run } = useAsyncAction();
  const stdoutWidth = Number(process.stdout?.columns || 120);
  const stdoutRows = Number(process.stdout?.rows || 40);
  const contentWidth = Math.max(60, stdoutWidth - 36);
  const panelMaxLines = Math.max(12, stdoutRows - 10);
  const resultLines = useMemo(() => wrapText(resultBody, contentWidth - 6), [resultBody, contentWidth]);
  const resultDocBlocks = useMemo(() => {
    if (!isResultDoc(resultDoc)) return [];
    return docToBlocks(resultDoc, Math.max(24, contentWidth - 8));
  }, [resultDoc, contentWidth]);
  const resultDocBlockStarts = useMemo(() => {
    const starts = [];
    let cursor = 0;
    for (let idx = 0; idx < resultDocBlocks.length; idx += 1) {
      starts.push(cursor);
      cursor += resultDocBlocks[idx].lines.length;
      if (idx < resultDocBlocks.length - 1) cursor += 1;
    }
    return starts;
  }, [resultDocBlocks]);
  const resultViewport = Math.max(6, panelMaxLines - 4);
  const resultMaxOffset = Math.max(0, resultLines.length - resultViewport);

  useEffect(() => {
    return () => onResolve?.();
  }, [onResolve]);

  async function runMenuAction(value) {
    if (value === "exit") {
      onResolve?.();
      exit();
      return;
    }

    if (value === "install") {
      await run(async () => {
        const context = await actions.prepareInstall();
        const preSkills = new Set(context.skills.filter((s) => s.checked).map((s) => s.id));
        const preAgents = new Set(context.agents.filter((a) => a.checked).map((a) => a.value));
        setInstallSkills(context.skills);
        setInstallAgents(context.agents.map((a) => a.value));
        setSelectedSkills(preSkills);
        setSelectedAgents(preAgents);
        setCursorIndex(0);
        setConfirmPreviewOffset(0);
        setInstallPreviewDoc(null);
        setMode("install-skills");
      });
      return;
    }

    if (value === "uninstall") {
      setConfirmChoice(1);
      setMode("confirm-uninstall");
      return;
    }

    await run(async () => {
      const bundle = actions.runCommandBundle ? await actions.runCommandBundle(value) : null;
      const doc = bundle?.doc ?? (actions.runCommandDoc ? await actions.runCommandDoc(value) : null);
      const body = bundle?.text ?? await actions.runCommand(value);
      const menuLabel = menuItems.find((item) => item.value === value)?.label || value;
      setResultTitle(menuLabel);
      setResultBody(stripAnsi(body));
      setResultDoc(isResultDoc(doc) ? doc : null);
      setResultOffset(0);
      setResultBlockOffset(0);
      setResultDocLineOffset(0);
      setMode("result");
    });
  }

  useInput((input, key) => {
    if (input === "q") {
      onResolve?.();
      exit();
      return;
    }

    if (busy) return;

    if (mode === "menu") {
      if (key.upArrow) {
        setMenuIndex((current) => (current - 1 + menuItems.length) % menuItems.length);
        return;
      }
      if (key.downArrow) {
        setMenuIndex((current) => (current + 1) % menuItems.length);
        return;
      }
      if (key.return) {
        void runMenuAction(menuItems[menuIndex].value);
      }
      return;
    }

    if (mode === "result") {
      if (key.upArrow) {
        setMenuIndex((current) => (current - 1 + menuItems.length) % menuItems.length);
        return;
      }
      if (key.downArrow) {
        setMenuIndex((current) => (current + 1) % menuItems.length);
        return;
      }
      if (key.return) {
        setMode("menu");
        void runMenuAction(menuItems[menuIndex].value);
        return;
      }
      if (key.backspace || key.escape) {
        setMode("menu");
        return;
      }
      if (input === "j") {
        if (isResultDoc(resultDoc)) {
          const totalLines = resultDocBlocks.reduce((sum, block) => sum + block.lines.length, 0) + Math.max(0, resultDocBlocks.length - 1);
          const maxLineOffset = Math.max(0, totalLines - Math.max(6, panelMaxLines - 4));
          setResultDocLineOffset((current) => {
            const next = clamp(current + 1, 0, maxLineOffset);
            for (let idx = resultDocBlockStarts.length - 1; idx >= 0; idx -= 1) {
              if (next >= (resultDocBlockStarts[idx] || 0)) {
                setResultBlockOffset(idx);
                break;
              }
            }
            return next;
          });
        } else {
          setResultOffset((current) => clamp(current + 1, 0, resultMaxOffset));
        }
        return;
      }
      if (input === "k") {
        if (isResultDoc(resultDoc)) {
          setResultDocLineOffset((current) => {
            const next = clamp(current - 1, 0, Number.MAX_SAFE_INTEGER);
            for (let idx = resultDocBlockStarts.length - 1; idx >= 0; idx -= 1) {
              if (next >= (resultDocBlockStarts[idx] || 0)) {
                setResultBlockOffset(idx);
                break;
              }
            }
            return next;
          });
        } else {
          setResultOffset((current) => clamp(current - 1, 0, resultMaxOffset));
        }
        return;
      }
      return;
    }

    if (mode === "install-skills") {
      if (key.upArrow || input === "k") setCursorIndex((i) => clamp(i - 1, 0, Math.max(0, installSkills.length - 1)));
      else if (key.downArrow || input === "j") setCursorIndex((i) => clamp(i + 1, 0, Math.max(0, installSkills.length - 1)));
      else if (input === " ") {
        setSelectedSkills((current) => {
          const next = new Set(current);
          const id = installSkills[cursorIndex]?.id;
          if (!id) return next;
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else if (key.return) {
        setCursorIndex(0);
        setMode("install-agents");
      } else if (key.backspace || key.escape) {
        setCursorIndex(0);
        setMode("menu");
      }
      return;
    }

    if (mode === "install-agents") {
      if (key.upArrow || input === "k") setCursorIndex((i) => Math.max(0, i - 1));
      else if (key.downArrow || input === "j") setCursorIndex((i) => Math.min(installAgents.length - 1, i + 1));
      else if (input === " ") {
        setSelectedAgents((current) => {
          const next = new Set(current);
          const id = installAgents[cursorIndex];
          if (!id) return next;
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else if (key.return) {
        void run(async () => {
          const payload = { selectedSkillIds: [...selectedSkills], selectedAgents: [...selectedAgents] };
          const bundle = actions.previewInstallBundle ? await actions.previewInstallBundle(payload) : null;
          const preview = bundle?.text ?? await actions.previewInstall(payload);
          const doc = bundle?.doc ?? (actions.previewInstallDoc ? await actions.previewInstallDoc(payload) : null);
          setInstallPreview(stripAnsi(preview));
          setInstallPreviewDoc(isResultDoc(doc) ? doc : null);
          setConfirmPreviewOffset(0);
          setConfirmChoice(0);
          setMode("confirm-install");
        });
      } else if (key.backspace || key.escape) {
        setCursorIndex(0);
        setConfirmPreviewOffset(0);
        setMode("install-skills");
      }
      return;
    }

    if (mode === "confirm-install") {
      if (key.upArrow || key.downArrow) setConfirmChoice((current) => (current === 0 ? 1 : 0));
      else if (key.return) {
        if (confirmChoice === 1) {
          setResultTitle("Ready");
          setResultBody("Choose a command from the left.");
          setResultDoc(null);
          setResultOffset(0);
          setResultBlockOffset(0);
          setResultDocLineOffset(0);
          setMode("menu");
          return;
        }
        void run(async () => {
          const payload = { selectedSkillIds: [...selectedSkills], selectedAgents: [...selectedAgents] };
          const bundle = actions.applyInstallBundle ? await actions.applyInstallBundle(payload) : null;
          const output = bundle?.text ?? await actions.applyInstall(payload);
          const doc = bundle?.doc ?? (actions.applyInstallDoc ? await actions.applyInstallDoc(payload) : null);
          setResultTitle("Install");
          setResultBody(stripAnsi(output));
          setResultDoc(isResultDoc(doc) ? doc : null);
          setResultOffset(0);
          setResultBlockOffset(0);
          setResultDocLineOffset(0);
          setMode("result");
        });
      } else if (key.backspace || key.escape) {
        setMode("install-agents");
      } else if (input === "j") {
        setConfirmPreviewOffset((current) => current + 1);
      } else if (input === "k") {
        setConfirmPreviewOffset((current) => Math.max(0, current - 1));
      }
      return;
    }

    if (mode === "confirm-uninstall") {
      if (key.upArrow || key.downArrow) setConfirmChoice((current) => (current === 0 ? 1 : 0));
      else if (key.return) {
        if (confirmChoice === 1) {
          setMode("menu");
          return;
        }
        void run(async () => {
          const bundle = actions.runCommandBundle ? await actions.runCommandBundle("uninstall") : null;
          const doc = bundle?.doc ?? (actions.runCommandDoc ? await actions.runCommandDoc("uninstall") : null);
          const output = bundle?.text ?? await actions.runCommand("uninstall");
          setResultTitle("Uninstall");
          setResultBody(stripAnsi(output));
          setResultDoc(isResultDoc(doc) ? doc : null);
          setResultOffset(0);
          setResultBlockOffset(0);
          setResultDocLineOffset(0);
          setMode("result");
        });
      } else if (key.backspace || key.escape) {
        setMode("menu");
      } else if (input === "j") {
        setConfirmPreviewOffset((current) => current + 1);
      } else if (input === "k") {
        setConfirmPreviewOffset((current) => Math.max(0, current - 1));
      }
    }
  });

  let rightPanel = isResultDoc(resultDoc)
    ? React.createElement(ResultDocPanel, {
      title: resultTitle,
      blocks: resultDocBlocks,
      busy,
      maxLines: panelMaxLines,
      blockOffset: resultBlockOffset,
      lineOffset: resultDocLineOffset
    })
    : React.createElement(ResultPanel, {
      title: resultTitle,
      lines: resultLines,
      busy,
      maxLines: panelMaxLines,
      offset: resultOffset
    });

  if (mode === "install-skills") {
    rightPanel = React.createElement(SkillPickerPanel, {
      skills: installSkills,
      cursor: cursorIndex,
      selectedIds: selectedSkills,
      maxLines: panelMaxLines,
      width: contentWidth
    });
  } else if (mode === "install-agents") {
    rightPanel = React.createElement(AgentPickerPanel, {
      agents: installAgents,
      cursor: cursorIndex,
      selected: selectedAgents,
      maxLines: panelMaxLines
    });
  } else if (mode === "confirm-install") {
    rightPanel = React.createElement(ConfirmPanel, {
      title: "Confirm Installation",
      preview: installPreview,
      previewDoc: installPreviewDoc,
      options: ["Apply changes", "Cancel"],
      selectedIndex: confirmChoice,
      width: contentWidth,
      maxLines: panelMaxLines,
      offset: confirmPreviewOffset
    });
  } else if (mode === "confirm-uninstall") {
    rightPanel = React.createElement(ConfirmPanel, {
      title: "Confirm Uninstall",
      preview: "Remove the skilly-hand installation from this project?",
      options: ["Remove installation", "Cancel"],
      selectedIndex: confirmChoice,
      width: contentWidth,
      maxLines: panelMaxLines,
      offset: confirmPreviewOffset
    });
  }

  return React.createElement(
    Box,
    { flexDirection: "column", paddingX: 1, paddingY: 0 },
    React.createElement(Header, { appVersion }),
    React.createElement(
      Box,
      { flexDirection: "row" },
      React.createElement(MenuPanel, { selectedIndex: menuIndex, menuItems }),
      React.createElement(Box, { width: 1 }, React.createElement(Text, null, " ")),
      rightPanel
    )
  );
}

export async function launchInkApp({ appVersion, actions }) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    try {
      render(
        React.createElement(App, {
          appVersion,
          actions,
          onResolve: done
        }),
        {
          exitOnCtrlC: true
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

export async function confirmWithInk({ message, defaultValue = false }) {
  return new Promise((resolve, reject) => {
    function ConfirmApp() {
      const { exit } = useApp();
      const [choice, setChoice] = useState(defaultValue ? 0 : 1);
      useInput((_, key) => {
        if (key.leftArrow || key.rightArrow || key.upArrow || key.downArrow) {
          setChoice((current) => (current === 0 ? 1 : 0));
          return;
        }
        if (key.return) {
          resolve(choice === 0);
          exit();
          return;
        }
        if (key.escape) {
          resolve(false);
          exit();
        }
      });

      return React.createElement(
        Box,
        { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1 },
        React.createElement(Text, { color: "cyan", bold: true }, "Confirmation"),
        React.createElement(Text, null, String(message)),
        React.createElement(Text, { color: "gray" }, "Use arrows to choose, Enter to confirm."),
        React.createElement(
          Box,
          { marginTop: 1 },
          React.createElement(
            Text,
            { color: choice === 0 ? "black" : "white", backgroundColor: choice === 0 ? "cyan" : undefined },
            " Yes "
          ),
          React.createElement(Text, null, " "),
          React.createElement(
            Text,
            { color: choice === 1 ? "black" : "white", backgroundColor: choice === 1 ? "cyan" : undefined },
            " No "
          )
        )
      );
    }

    try {
      render(React.createElement(ConfirmApp), { exitOnCtrlC: true });
    } catch (error) {
      reject(error);
    }
  });
}
