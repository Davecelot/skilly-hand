import test from "node:test";
import assert from "node:assert/strict";
import { loadAllSkills, verifyCatalogFiles } from "../packages/catalog/src/index.js";

test("catalog manifests are portable and complete", async () => {
  const skills = await loadAllSkills();
  const issues = await verifyCatalogFiles();
  const ids = skills.map((skill) => skill.id);

  assert.equal(skills.length, 6);
  assert.deepEqual(ids, [
    "agents-root-orchestrator",
    "angular-guidelines",
    "figma-mcp-0to1",
    "skill-creator",
    "spec-driven-development",
    "token-optimizer"
  ]);
  assert.deepEqual(issues, []);

  for (const skill of skills) {
    assert.equal(skill.id.startsWith("scannlab-"), false);
    assert.equal(skill.portable, true);
    assert.equal(skill.files.length > 0, true);
  }
});
