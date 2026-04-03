import test from "node:test";
import assert from "node:assert/strict";
import { createTerminalRenderer, detectColorSupport, detectUnicodeSupport } from "../packages/core/src/terminal.js";

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
    stdout: { isTTY: true, write() {} },
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
