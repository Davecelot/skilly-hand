import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { resolveSandboxScenariosPath, verifySandboxProject } from "../scripts/test-in-sandbox.mjs";

test("sandbox harness resolves the real root sandbox project", async () => {
  const repoRoot = path.resolve(".");
  const info = await verifySandboxProject({ repoRoot });

  assert.equal(info.packageName, "sandbox");
  assert.equal(info.sandboxProject, path.join(repoRoot, "sandbox"));
});

test("sandbox harness resolves scenario workspace root under sandbox", () => {
  const repoRoot = path.resolve(".");
  const scenariosPath = resolveSandboxScenariosPath({ repoRoot });

  assert.equal(scenariosPath, path.join(repoRoot, "sandbox", ".cases"));
});
