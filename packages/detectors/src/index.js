import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function configExists(cwd, base, extensions = ["js", "ts"]) {
  for (const ext of extensions) {
    if (await pathExists(path.join(cwd, `${base}.${ext}`))) return true;
  }
  return false;
}

async function readJson(filePath) {
  if (!(await pathExists(filePath))) {
    return null;
  }

  return JSON.parse(await readFile(filePath, "utf8"));
}

function addDetection(results, detection) {
  const existing = results.find((item) => item.technology === detection.technology);
  if (existing) {
    existing.confidence = Math.max(existing.confidence, detection.confidence);
    existing.reasons.push(...detection.reasons);
    existing.recommendedSkillIds = [
      ...new Set([...existing.recommendedSkillIds, ...detection.recommendedSkillIds])
    ];
    return;
  }

  results.push({
    technology: detection.technology,
    confidence: detection.confidence,
    reasons: [...detection.reasons],
    recommendedSkillIds: [...new Set(detection.recommendedSkillIds)]
  });
}

export async function detectProject(cwd) {
  const packageJson = await readJson(path.join(cwd, "package.json"));
  const tsconfigExists = await pathExists(path.join(cwd, "tsconfig.json"));
  const angularJsonExists = await pathExists(path.join(cwd, "angular.json"));
  const viteConfigExists = await configExists(cwd, "vite.config");
  const nextConfigExists = await configExists(cwd, "next.config", ["js", "mjs", "ts"]);
  const storybookDirExists = await pathExists(path.join(cwd, ".storybook"));
  const figmaConfigExists = await configExists(cwd, "figma.config");
  const results = [];

  if (packageJson) {
    addDetection(results, {
      technology: "nodejs",
      confidence: 1,
      reasons: ["Found package.json"],
      recommendedSkillIds: [
        "token-optimizer",
        "spec-driven-development",
        "review-rangers",
        "project-teacher"
      ]
    });
  }

  const deps = packageJson ? { ...packageJson.dependencies, ...packageJson.devDependencies } : {};

  if (tsconfigExists || "typescript" in deps) {
    addDetection(results, {
      technology: "typescript",
      confidence: tsconfigExists ? 0.95 : 0.9,
      reasons: tsconfigExists
        ? ["Found tsconfig.json"]
        : ['Dependency "typescript" found in package.json'],
      recommendedSkillIds: ["token-optimizer"]
    });
  }

  if ("react" in deps) {
    addDetection(results, {
      technology: "react",
      confidence: 0.95,
      reasons: ['Dependency "react" found in package.json'],
      recommendedSkillIds: ["accessibility-audit", "react-guidelines", "frontend-design"]
    });
  }

  if ("next" in deps || nextConfigExists) {
    addDetection(results, {
      technology: "nextjs",
      confidence: nextConfigExists ? 1 : 0.9,
      reasons: nextConfigExists
        ? ["Found next.config.*"]
        : ['Dependency "next" found in package.json'],
      recommendedSkillIds: [
        "accessibility-audit",
        "spec-driven-development",
        "react-guidelines",
        "frontend-design"
      ]
    });
  }

  if ("@angular/core" in deps || angularJsonExists) {
    addDetection(results, {
      technology: "angular",
      confidence: angularJsonExists ? 1 : 0.95,
      reasons: angularJsonExists
        ? ["Found angular.json"]
        : ['Dependency "@angular/core" found in package.json'],
      recommendedSkillIds: [
        "angular-guidelines",
        "accessibility-audit",
        "frontend-design",
        "test-driven-development"
      ]
    });
  }

  if ("vite" in deps || viteConfigExists) {
    addDetection(results, {
      technology: "vite",
      confidence: viteConfigExists ? 1 : 0.9,
      reasons: viteConfigExists
        ? ["Found vite.config.*"]
        : ['Dependency "vite" found in package.json'],
      recommendedSkillIds: ["frontend-design"]
    });
  }

  if ("@playwright/test" in deps) {
    addDetection(results, {
      technology: "playwright",
      confidence: 0.95,
      reasons: ['Dependency "@playwright/test" found in package.json'],
      recommendedSkillIds: ["test-driven-development"]
    });
  }

  if ("vitest" in deps) {
    addDetection(results, {
      technology: "vitest",
      confidence: 0.95,
      reasons: ['Dependency "vitest" found in package.json'],
      recommendedSkillIds: ["test-driven-development"]
    });
  }

  const tailwindConfigExists = await configExists(cwd, "tailwind.config");
  if ("tailwindcss" in deps || tailwindConfigExists) {
    addDetection(results, {
      technology: "tailwindcss",
      confidence: tailwindConfigExists ? 1 : 0.9,
      reasons: tailwindConfigExists
        ? ["Found tailwind.config.*"]
        : ['Dependency "tailwindcss" found in package.json'],
      recommendedSkillIds: ["accessibility-audit", "frontend-design"]
    });
  }

  if ("@storybook/react" in deps || "@storybook/angular" in deps || storybookDirExists) {
    addDetection(results, {
      technology: "storybook",
      confidence: storybookDirExists ? 1 : 0.9,
      reasons: storybookDirExists
        ? ["Found .storybook directory"]
        : ["Storybook dependency found in package.json"],
      recommendedSkillIds: ["frontend-design"]
    });
  }

  const figmaDeps = ["@figma/plugin-typings", "@figma/widget-typings", "figma-api"];
  const figmaDepFound = figmaDeps.find((dep) => dep in deps);
  if (figmaConfigExists || figmaDepFound) {
    addDetection(results, {
      technology: "figma",
      confidence: figmaConfigExists ? 1 : 0.95,
      reasons: figmaConfigExists
        ? ["Found figma.config.*"]
        : [`Dependency "${figmaDepFound}" found in package.json`],
      recommendedSkillIds: ["figma-mcp-0to1"]
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence || a.technology.localeCompare(b.technology));
}

export async function inspectProjectFiles(cwd) {
  const probes = [
    "package.json",
    "tsconfig.json",
    "angular.json",
    ".storybook",
    "vite.config.js",
    "vite.config.ts",
    "next.config.js",
    "next.config.mjs",
    "tailwind.config.js",
    "tailwind.config.ts",
    "figma.config.js",
    "figma.config.ts"
  ];
  const statuses = [];

  for (const probe of probes) {
    const probePath = path.join(cwd, probe);
    try {
      const info = await stat(probePath);
      statuses.push({ path: probe, exists: true, type: info.isDirectory() ? "directory" : "file" });
    } catch {
      statuses.push({ path: probe, exists: false, type: null });
    }
  }

  return statuses;
}
