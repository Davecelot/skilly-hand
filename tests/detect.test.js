import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { detectProject } from "../packages/detectors/src/index.js";

const fixturesDir = path.resolve("tests/fixtures");

test("detects react vite projects with testing and styling tools", async () => {
  const detections = await detectProject(path.join(fixturesDir, "react-vite"));
  const technologies = detections.map((item) => item.technology).sort();

  assert.deepEqual(technologies, [
    "nodejs",
    "playwright",
    "react",
    "storybook",
    "tailwindcss",
    "typescript",
    "vite",
    "vitest"
  ]);
});

test("detects angular projects", async () => {
  const detections = await detectProject(path.join(fixturesDir, "angular-app"));
  const technologies = detections.map((item) => item.technology);

  assert.equal(technologies.includes("angular"), true);
  assert.equal(technologies.includes("vitest"), true);
  assert.equal(technologies.includes("storybook"), true);
});

test("returns no detections for unknown stacks", async () => {
  const detections = await detectProject(path.join(fixturesDir, "no-stack"));
  assert.deepEqual(detections, []);
});
