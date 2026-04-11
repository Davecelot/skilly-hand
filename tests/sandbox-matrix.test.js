import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { getSandboxScenarioNames, runSandboxMatrixTests } from "../scripts/test-in-sandbox.mjs";

test("sandbox matrix scenarios pass", { timeout: 180000 }, async () => {
  const repoRoot = path.resolve(".");
  const result = await runSandboxMatrixTests({ repoRoot });
  const expectedScenarioNames = [
    "install-one-agent",
    "install-multiple-agents",
    "install-all-agents",
    "install-one-skill",
    "install-multiple-skills",
    "install-all-skills",
    "uninstall-everything",
    "ux-cli-contracts"
  ];

  assert.equal(result.ok, true);
  assert.equal(result.total, expectedScenarioNames.length);
  assert.deepEqual(getSandboxScenarioNames(), expectedScenarioNames);
  assert.deepEqual(
    result.results.map((item) => item.name),
    expectedScenarioNames
  );
  assert.deepEqual(
    result.results.map((item) => item.ok),
    Array(result.total).fill(true)
  );
});
