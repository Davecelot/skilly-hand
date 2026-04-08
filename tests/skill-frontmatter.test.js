import test from "node:test";
import assert from "node:assert/strict";
import {
  applyManifestFrontmatterToSkill,
  renderSkillFrontmatter,
  verifySkillFrontmatterContent
} from "../packages/catalog/src/index.js";

function sampleManifest(overrides = {}) {
  return {
    id: "sample-skill",
    title: "Sample Skill",
    description: "Sample description",
    portable: true,
    tags: ["core"],
    detectors: ["always"],
    installsFor: ["all"],
    agentSupport: ["codex"],
    files: [{ path: "SKILL.md", kind: "instruction" }],
    dependencies: [],
    skillMetadata: {
      author: "skilly-hand",
      "last-edit": "2026-04-08",
      license: "Apache-2.0",
      version: "1.0.0",
      changelog: "Initial version; adds coverage; affects tests",
      "auto-invoke": "When testing frontmatter sync behavior",
      "allowed-tools": ["Read", "Write"]
    },
    ...overrides
  };
}

test("frontmatter sync inserts frontmatter when missing", () => {
  const manifest = sampleManifest();
  const content = "# Sample Skill Guide\n\nBody.\n";
  const next = applyManifestFrontmatterToSkill(content, manifest);

  assert.match(next, /^---\n/);
  assert.match(next, /\n# Sample Skill Guide/);
  assert.deepEqual(verifySkillFrontmatterContent(next, manifest), { ok: true, reason: null });
});

test("frontmatter sync updates stale frontmatter", () => {
  const oldManifest = sampleManifest();
  const stale = `${renderSkillFrontmatter(oldManifest)}# Sample Skill Guide\n`;
  const manifest = sampleManifest({ description: "Updated description" });
  const next = applyManifestFrontmatterToSkill(stale, manifest);

  assert.match(next, /description: "Updated description"/);
  assert.equal(next.includes('description: "Sample description"'), false);
  assert.deepEqual(verifySkillFrontmatterContent(next, manifest), { ok: true, reason: null });
});

test("frontmatter sync is idempotent", () => {
  const manifest = sampleManifest();
  const initial = "# Sample Skill Guide\n";
  const once = applyManifestFrontmatterToSkill(initial, manifest);
  const twice = applyManifestFrontmatterToSkill(once, manifest);
  assert.equal(once, twice);
});

test("frontmatter validator fails on missing, malformed, and mismatch", () => {
  const manifest = sampleManifest();

  assert.deepEqual(verifySkillFrontmatterContent("# Body\n", manifest), { ok: false, reason: "missing" });
  assert.deepEqual(
    verifySkillFrontmatterContent("---\ndescription: \"x\"\n# Body\n", manifest),
    { ok: false, reason: "malformed" }
  );
  assert.deepEqual(
    verifySkillFrontmatterContent(`${renderSkillFrontmatter(sampleManifest({ description: "x" }))}# Body\n`, manifest),
    { ok: false, reason: "mismatch" }
  );
  assert.deepEqual(
    verifySkillFrontmatterContent(
      `${renderSkillFrontmatter(manifest)}---\ndescription: old\nskillMetadata:\n  author: old\nPlain paragraph body.\n`,
      manifest
    ),
    { ok: true, reason: null }
  );
  assert.deepEqual(
    verifySkillFrontmatterContent(
      `${renderSkillFrontmatter(manifest)}${renderSkillFrontmatter(manifest)}# Body\n`,
      manifest
    ),
    { ok: false, reason: "residual-frontmatter" }
  );
});

test("frontmatter render mirrors only selected manifest fields", () => {
  const base = sampleManifest();
  const changedNonMirrored = sampleManifest({
    id: "different-id",
    title: "Different title",
    tags: ["frontend"],
    detectors: ["react"],
    installsFor: ["react"]
  });

  const baseRendered = renderSkillFrontmatter(base);
  const changedRendered = renderSkillFrontmatter(changedNonMirrored);

  assert.equal(baseRendered, changedRendered);
  assert.equal(baseRendered.includes("id:"), false);
  assert.equal(baseRendered.includes("title:"), false);
  assert.equal(baseRendered.includes("tags:"), false);
});

test("sync preserves markdown body when malformed frontmatter is missing a close delimiter", () => {
  const manifest = sampleManifest();
  const malformed = [
    "---",
    "description: \"broken\"",
    "skillMetadata:",
    "  author: \"x\"",
    "# Real Heading",
    "",
    "Body line.",
    "---",
    "Trailing separator."
  ].join("\n");

  const next = applyManifestFrontmatterToSkill(malformed, manifest);
  assert.match(next, /^---\n/);
  assert.equal(next.includes('description: "broken"'), false);
  assert.match(next, /\n# Real Heading\n/);
  assert.match(next, /\nBody line\.\n/);
});

test("sync does not treat a leading markdown horizontal rule as frontmatter", () => {
  const manifest = sampleManifest();
  const content = [
    "---",
    "## Section",
    "",
    "Body content."
  ].join("\n");

  const next = applyManifestFrontmatterToSkill(content, manifest);
  assert.match(next, /^---\n/);
  assert.match(next, /\n---\n## Section\n/);
});

test("sync does not strip a leading four-dash markdown rule", () => {
  const manifest = sampleManifest();
  const content = [
    "----",
    "Body content."
  ].join("\n");

  const next = applyManifestFrontmatterToSkill(content, manifest);
  assert.match(next, /\n----\nBody content\./);
});

test("sync does not treat leading thematic break plus spacer as frontmatter", () => {
  const manifest = sampleManifest();
  const content = [
    "---",
    "",
    "Body content."
  ].join("\n");

  const next = applyManifestFrontmatterToSkill(content, manifest);
  assert.match(next, /\n---\n\nBody content\./);
});

test("validator accepts frontmatter after BOM and leading blank lines", () => {
  const manifest = sampleManifest();
  const canonical = renderSkillFrontmatter(manifest);
  const content = `\uFEFF\n\n${canonical}# Body\n`;
  const status = verifySkillFrontmatterContent(content, manifest);
  assert.deepEqual(status, { ok: true, reason: null });
});

test("sync strips malformed leading pseudo-frontmatter when opening delimiter has no close", () => {
  const manifest = sampleManifest();
  const content = [
    "---",
    "description: literal content",
    "Body line."
  ].join("\n");

  const next = applyManifestFrontmatterToSkill(content, manifest);
  assert.equal(next.includes("description: literal content"), false);
  assert.match(next, /\nBody line\./);
});

test("sync preserves list-only markdown body after malformed pseudo-frontmatter", () => {
  const manifest = sampleManifest();
  const content = [
    "---",
    "description: broken",
    "skillMetadata:",
    "  author: x",
    "",
    "- keep this bullet",
    "- keep this bullet too"
  ].join("\n");

  const next = applyManifestFrontmatterToSkill(content, manifest);
  assert.equal(next.includes("description: broken"), false);
  assert.match(next, /\n- keep this bullet\n- keep this bullet too/);
});

test("sync normalizes malformed frontmatter with no safe body boundary", () => {
  const manifest = sampleManifest();
  const content = [
    "---",
    "description: literal content",
    "skillMetadata:",
    "  author: bad"
  ].join("\n");

  const next = applyManifestFrontmatterToSkill(content, manifest);
  assert.match(next, /^---\n/);
  assert.equal(next.includes("description: literal content"), false);
  assert.equal(next.includes("author: bad"), false);
  assert.deepEqual(verifySkillFrontmatterContent(next, manifest), { ok: true, reason: null });
});

test("validator accepts body that starts with thematic break and yaml-like lines", () => {
  const manifest = sampleManifest();
  const content = [
    renderSkillFrontmatter(manifest).trimEnd(),
    "---",
    "note: value",
    "context: keep",
    "",
    "Body paragraph."
  ].join("\n");

  const status = verifySkillFrontmatterContent(content, manifest);
  assert.deepEqual(status, { ok: true, reason: null });
});

test("validator accepts residual yaml-like body that uses description key without skillMetadata", () => {
  const manifest = sampleManifest();
  const content = [
    renderSkillFrontmatter(manifest).trimEnd(),
    "---",
    "description: example block",
    "note: keep this as body",
    "",
    "Body paragraph."
  ].join("\n");

  const status = verifySkillFrontmatterContent(content, manifest);
  assert.deepEqual(status, { ok: true, reason: null });
});
