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

test("recommends correct catalog skill IDs for react-vite projects", async () => {
  const detections = await detectProject(path.join(fixturesDir, "react-vite"));
  const byTech = Object.fromEntries(detections.map((d) => [d.technology, d.recommendedSkillIds]));

  assert.ok(byTech.react.includes("react-guidelines"), "react should recommend react-guidelines");
  assert.ok(byTech.react.includes("frontend-design"), "react should recommend frontend-design");
  assert.ok(byTech.vitest.includes("test-driven-development"), "vitest should recommend test-driven-development");
  assert.ok(byTech.nodejs.includes("review-rangers"), "nodejs should recommend review-rangers");
  assert.ok(byTech.nodejs.includes("project-teacher"), "nodejs should recommend project-teacher");
});

test("detects next-app projects and recommends correct skills", async () => {
  const detections = await detectProject(path.join(fixturesDir, "next-app"));
  const technologies = detections.map((d) => d.technology);
  const byTech = Object.fromEntries(detections.map((d) => [d.technology, d.recommendedSkillIds]));

  assert.ok(technologies.includes("nextjs"), "should detect nextjs");
  assert.ok(technologies.includes("react"), "should detect react");
  assert.ok(byTech.nextjs.includes("react-guidelines"), "nextjs should recommend react-guidelines");
  assert.ok(byTech.nextjs.includes("frontend-design"), "nextjs should recommend frontend-design");
  assert.ok(byTech.nextjs.includes("spec-driven-development"), "nextjs should recommend spec-driven-development");
});

test("detects figma-plugin projects", async () => {
  const detections = await detectProject(path.join(fixturesDir, "figma-plugin"));
  const technologies = detections.map((d) => d.technology);
  const byTech = Object.fromEntries(detections.map((d) => [d.technology, d.recommendedSkillIds]));

  assert.ok(technologies.includes("figma"), "should detect figma");
  assert.ok(byTech.figma.includes("figma-mcp-0to1"), "figma should recommend figma-mcp-0to1");
});

test("does not detect typescript for bare node-basic project", async () => {
  const detections = await detectProject(path.join(fixturesDir, "node-basic"));
  const technologies = detections.map((d) => d.technology);

  assert.equal(technologies.includes("typescript"), false, "should not infer typescript from bare package.json");
});
