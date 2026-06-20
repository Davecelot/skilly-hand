import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadAllSkills, verifyCatalogFiles } from "../packages/catalog/src/index.js";

test("catalog manifests are portable and complete", async () => {
  const skills = await loadAllSkills();
  const issues = await verifyCatalogFiles();
  const ids = skills.map((skill) => skill.id);

  assert.equal(skills.length, 20);
  assert.deepEqual(ids, [
    "accessibility-audit",
    "agents-root-orchestrator",
    "angular-guidelines",
    "context-handoff",
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

test("SDD and TDD guidance remains portable and self-contained", async () => {
  const skillIds = ["spec-driven-development", "test-driven-development"];
  const forbiddenContextReferences = [
    /\bAngular\b/i,
    /\bFigma\b/i,
    /\bGitHub\b/i,
    /\bGitLab\b/i,
    /\bJira\b/i,
    /\bnpm\b/i,
    /\bOpenSpec\b/i,
    /\bpnpm\b/i,
    /\breview-rangers\b/i,
    /\bScannLab\b/i,
    /\bStorybook\b/i,
    /\bVitest\b/i,
    /\byarn\b/i
  ];

  for (const skillId of skillIds) {
    const manifestUrl = new URL(`../catalog/skills/${skillId}/manifest.json`, import.meta.url);
    const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
    const markdownFiles = manifest.files.filter((file) => file.path.endsWith(".md"));

    for (const file of markdownFiles) {
      const fileUrl = new URL(`../catalog/skills/${skillId}/${file.path}`, import.meta.url);
      const content = await readFile(fileUrl, "utf8");

      assert.doesNotMatch(content, /[^\x00-\x7F]/, `${skillId}/${file.path} should use ASCII protocol text`);
      for (const pattern of forbiddenContextReferences) {
        assert.doesNotMatch(content, pattern, `${skillId}/${file.path} contains fixed context reference ${pattern}`);
      }
    }
  }

  const sdd = await readFile(new URL("../catalog/skills/spec-driven-development/SKILL.md", import.meta.url), "utf8");
  assert.match(sdd, /single source of truth/i);
  assert.match(sdd, /local structured fallback/i);
  assert.doesNotMatch(sdd, /tasks\.md/i);

  const tdd = await readFile(new URL("../catalog/skills/test-driven-development/SKILL.md", import.meta.url), "utf8");
  assert.match(tdd, /failure is caused by the missing or incorrect target behavior/i);
  assert.match(tdd, /is not refactoring; start another RED cycle/i);
  assert.match(tdd, /Do not invent a universal percentage/i);
});

test("review-rangers ships a bounded and permission-safe remediation contract", async () => {
  const skills = await loadAllSkills();
  const reviewRangers = skills.find((skill) => skill.id === "review-rangers");
  const skill = await readFile(new URL("../catalog/skills/review-rangers/SKILL.md", import.meta.url), "utf8");
  const mender = await readFile(new URL("../catalog/skills/review-rangers/assets/mender-template.md", import.meta.url), "utf8");

  assert.equal(reviewRangers.skillMetadata.version, "1.2.0");
  assert.deepEqual(reviewRangers.dependencies, ["test-driven-development"]);
  assert.equal(
    reviewRangers.files.some((file) => file.path === "assets/mender-template.md" && file.kind === "asset"),
    true
  );

  assert.match(skill, /only role allowed to modify/i);
  assert.match(skill, /explicit approval/i);
  assert.match(skill, /at most three remediation rounds/i);
  assert.match(skill, /two consecutive rounds/i);
  assert.match(skill, /breaking public API/i);
  assert.match(skill, /repository-native verification/i);
  assert.match(skill, /after the final `HIGH` report or terminal escalation/i);
  assert.doesNotMatch(skill, /npx vitest|ScannLab/i);

  assert.match(mender, /finding-to-fix/i);
  assert.match(mender, /MUST NOT change confidence/i);
  assert.match(mender, /repository-native/i);
  assert.match(mender, /test-driven-development/i);
  assert.doesNotMatch(mender, /npx vitest|ScannLab/i);
});
