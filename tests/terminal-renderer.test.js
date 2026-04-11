import test from "node:test";
import assert from "node:assert/strict";
import { createTerminalRenderer, detectColorSupport, detectUnicodeSupport } from "../packages/core/src/terminal.js";

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

function stripAnsi(value) {
  return String(value).replace(ANSI_PATTERN, "");
}

function maxVisibleLineLength(block) {
  return String(block)
    .split("\n")
    .reduce((max, line) => Math.max(max, stripAnsi(line).length), 0);
}

test("detectColorSupport honors NO_COLOR and FORCE_COLOR", () => {
  assert.equal(detectColorSupport({ env: { NO_COLOR: "1" }, stream: { isTTY: true } }), false);
  assert.equal(detectColorSupport({ env: { FORCE_COLOR: "1" }, stream: { isTTY: false } }), true);
  assert.equal(detectColorSupport({ env: {}, stream: { isTTY: true } }), true);
});

test("detectUnicodeSupport disables when TERM is dumb", () => {
  assert.equal(detectUnicodeSupport({ env: { TERM: "dumb" }, stream: { isTTY: true }, platform: "darwin" }), false);
  assert.equal(detectUnicodeSupport({ env: {}, stream: { isTTY: true }, platform: "darwin" }), true);
});

test("renderer formats sections, status lines, and tables", () => {
  const renderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, columns: 140, write() {} },
    stderr: { isTTY: true, write() {} },
    platform: "darwin"
  });

  const section = renderer.section("Doctor Summary", renderer.kv([["Installed", "yes"]]));
  const status = renderer.status("success", "Installation detected.");
  const table = renderer.table(
    [
      { key: "id", header: "Skill ID" },
      { key: "title", header: "Title" }
    ],
    [{ id: "token-optimizer", title: "Token Optimizer" }]
  );

  assert.match(section, /Doctor Summary/);
  assert.match(section, /Installed\s+: yes/);
  assert.match(status, /Installation detected\./);
  assert.match(table, /Skill ID/);
  assert.match(table, /token-optimizer/);
});

test("renderer banner keeps multi-line block logo", () => {
  const renderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, columns: 140, write() {} },
    stderr: { isTTY: true, write() {} },
    platform: "darwin"
  });

  const banner = renderer.banner("0.21.1");

  assert.match(banner, /████\s+██\s+██/);
  assert.match(banner, /████\s+██████/);
});

test("renderer adapts table mode by terminal width and keeps lines bounded", () => {
  const columns = [
    { key: "id", header: "Skill ID" },
    { key: "title", header: "Title" },
    { key: "tags", header: "Tags" },
    { key: "agents", header: "Agents" }
  ];
  const rows = [
    {
      id: "accessibility-audit",
      title: "Accessibility Audit",
      tags: "frontend, accessibility, workflow, quality, compliance",
      agents: "codex, claude, cursor, gemini, copilot"
    }
  ];

  const wideRenderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, columns: 140, write() {} },
    stderr: { isTTY: true, write() {} },
    platform: "darwin"
  });
  const wide = wideRenderer.table(columns, rows);
  assert.match(wide, /┌|╞|│/);
  assert.equal(maxVisibleLineLength(wide) <= 140, true);

  const mediumRenderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, columns: 100, write() {} },
    stderr: { isTTY: true, write() {} },
    platform: "darwin"
  });
  const medium = mediumRenderer.table(columns, rows);
  assert.match(medium, /\|/);
  assert.doesNotMatch(medium, /┌|╞|│/);
  assert.equal(maxVisibleLineLength(medium) <= 100, true);

  const narrowRenderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, columns: 55, write() {} },
    stderr: { isTTY: true, write() {} },
    platform: "darwin"
  });
  const narrow = narrowRenderer.table(columns, rows);
  assert.match(narrow, /\|/);
  assert.equal(maxVisibleLineLength(narrow) <= 55, true);
});

test("renderer falls back to card mode when compact table cannot fit", () => {
  const renderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, columns: 40, write() {} },
    stderr: { isTTY: true, write() {} },
    platform: "darwin"
  });

  const table = renderer.table(
    [
      { key: "c1", header: "C1" },
      { key: "c2", header: "C2" },
      { key: "c3", header: "C3" },
      { key: "c4", header: "C4" },
      { key: "c5", header: "C5" },
      { key: "c6", header: "C6" },
      { key: "c7", header: "C7" },
      { key: "c8", header: "C8" },
      { key: "c9", header: "C9" },
      { key: "c10", header: "C10" },
      { key: "c11", header: "C11" },
      { key: "c12", header: "C12" }
    ],
    [{
      c1: "a",
      c2: "b",
      c3: "c",
      c4: "d",
      c5: "e",
      c6: "f",
      c7: "g",
      c8: "h",
      c9: "i",
      c10: "j",
      c11: "k",
      c12: "l"
    }]
  );

  assert.match(table, /↳ C1:|-> C1:/);
  assert.equal(maxVisibleLineLength(table) <= 40, true);
});

test("renderer summarizes dense values and includes full continuation details", () => {
  const renderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, columns: 100, write() {} },
    stderr: { isTTY: true, write() {} },
    platform: "darwin"
  });

  const table = renderer.table(
    [
      { key: "id", header: "Skill ID" },
      { key: "agents", header: "Agents" }
    ],
    [{
      id: "token-optimizer",
      agents: "codex, claude, cursor, gemini, copilot"
    }]
  );

  assert.match(table, /\+2 more/);
  assert.match(table, /Agents: codex, claude, cursor, gemini,/);
  assert.match(table, /copilot/);
});

test("renderer error block includes reason, recovery hint, and exit code", () => {
  const renderer = createTerminalRenderer({
    env: { NO_COLOR: "1", TERM: "xterm-256color" },
    stdout: { isTTY: true, write() {} },
    stderr: { isTTY: true, write() {} }
  });

  const block = renderer.error({
    what: "skilly-hand command failed",
    why: "Unknown flag: --bogus",
    hint: "Run `npx skilly-hand --help`.",
    exitCode: 1
  });

  assert.match(block, /skilly-hand command failed/);
  assert.match(block, /Unknown flag: --bogus/);
  assert.match(block, /Run `npx skilly-hand --help`\./);
  assert.match(block, /Exit code\s+: 1/);
});
