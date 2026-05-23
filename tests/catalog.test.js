import test from "node:test";
import assert from "node:assert/strict";
import { loadAllSkills, verifyCatalogFiles } from "../packages/catalog/src/index.js";

test("catalog manifests are portable and complete", async () => {
  const skills = await loadAllSkills();
  const issues = await verifyCatalogFiles();
  const ids = skills.map((skill) => skill.id);

  assert.equal(skills.length, 19);
  assert.deepEqual(ids, [
    "accessibility-audit",
    "agents-root-orchestrator",
    "angular-guidelines",
    "figma-mcp-0to1",
    "forge-me-a-skill",
    "frontend-design",
    "gsap-animation",
    "motion-animation",
    "output-optimizer",
    "project-security",
    "project-teacher",
    "prompt-engineering",
    "react-guidelines",
    "review-rangers",
    "roaster",
    "spec-driven-development",
    "test-driven-development",
    "token-optimizer",
    "user-story-crafting"
  ]);
  assert.deepEqual(issues, []);

  for (const skill of skills) {
    assert.equal(skill.id.startsWith("scannlab-"), false);
    assert.equal(skill.portable, true);
    assert.equal(skill.files.length > 0, true);
    assert.equal(skill.agentSupport.includes("antigravity"), true);
    assert.equal(skill.agentSupport.includes("windsurf"), true);
    assert.equal(skill.agentSupport.includes("trae"), true);
  }

  const roaster = skills.find((skill) => skill.id === "roaster");
  assert.equal(Array.isArray(roaster.nativeHooks), true);
  assert.deepEqual(roaster.nativeHooks.map((hook) => hook.id), ["plan-challenge"]);
  assert.equal(roaster.nativeHooks[0].enforcement, "required");
});
