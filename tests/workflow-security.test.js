import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const workflowPath = new URL("../.github/workflows/release.yml", import.meta.url);

function stepScript(workflow, stepName) {
  const lines = workflow.split("\n");
  let selected = false;
  let recording = false;
  const script = [];
  for (const line of lines) {
    if (line.startsWith("      - name:")) {
      if (recording) break;
      selected = line.trim() === `- name: ${stepName}`;
    }
    if (selected && line === "        run: |") {
      recording = true;
      continue;
    }
    if (recording) {
      if (line && !line.startsWith("          ")) break;
      script.push(line.slice(10));
    }
  }
  assert.ok(script.length, `Script for ${stepName} exists`);
  return script.join("\n");
}

test("release input validation treats command substitutions as untrusted data", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  const directory = await mkdtemp(path.join(os.tmpdir(), "skilly-workflow-"));
  const marker = path.join(directory, "injected-command-ran");
  const input = `$(touch ${marker})`;
  // Model the runner's expression replacement to reproduce the former injection.
  const script = stepScript(workflow, "Validate version input")
    .replaceAll("${{ inputs.version }}", input);
  const result = spawnSync("bash", ["-c", script], {
    cwd: directory, env: { ...process.env, VERSION_INPUT: input }, encoding: "utf8"
  });
  assert.notEqual(result.status, 0, "invalid versions are rejected");
  await assert.rejects(access(marker), "validation never executes input as shell code");
});

test("release input validation accepts a plain semantic version", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  const script = stepScript(workflow, "Validate version input")
    .replaceAll("${{ inputs.version }}", "0.30.0");
  const result = spawnSync("bash", ["-c", script], {
    env: { ...process.env, VERSION_INPUT: "0.30.0" }, encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
});

test("release input validation rejects a valid version embedded in multiline input", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  const input = "0.30.0\nuntrusted";
  const script = stepScript(workflow, "Validate version input");
  const result = spawnSync("bash", ["-c", script], {
    env: { ...process.env, VERSION_INPUT: input }, encoding: "utf8"
  });
  assert.notEqual(result.status, 0);
});
