import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { renderCatalogReadme, syncCatalogReadme } from "../scripts/sync-catalog-readme.mjs";

test("sync-catalog-readme treats CRLF-equivalent content as in sync", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-readme-"));
  const skillDir = path.join(root, "catalog", "skills", "sample");
  await mkdir(skillDir, { recursive: true });

  const manifest = {
    id: "sample",
    title: "Sample",
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
      changelog: "Added test; validates CRLF handling; affects readme sync checks",
      "auto-invoke": "When verifying README sync behavior",
      "allowed-tools": ["Read"]
    }
  };

  await writeFile(path.join(skillDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  const readmePath = path.join(root, "catalog", "README.md");
  const lf = renderCatalogReadme([manifest]);
  await writeFile(readmePath, lf.replaceAll("\n", "\r\n"), "utf8");

  const result = await syncCatalogReadme({ rootDir: root, dryRun: true });
  assert.equal(result.changed, false);
});
