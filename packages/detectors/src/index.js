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
  const viteConfigExists =
    (await pathExists(path.join(cwd, "vite.config.js"))) ||
    (await pathExists(path.join(cwd, "vite.config.ts")));
  const nextConfigExists =
    (await pathExists(path.join(cwd, "next.config.js"))) ||
    (await pathExists(path.join(cwd, "next.config.mjs"))) ||
    (await pathExists(path.join(cwd, "next.config.ts")));
  const storybookDirExists = await pathExists(path.join(cwd, ".storybook"));
  const results = [];

  if (packageJson) {
    addDetection(results, {
      technology: "nodejs",
      confidence: 1,
      reasons: ["Found package.json"],
      recommendedSkillIds: ["token-optimizer", "commit-writer", "pr-writer", "spec-driven-development"]
    });
  }

  if (packageJson || tsconfigExists) {
    addDetection(results, {
      technology: "typescript",
      confidence: tsconfigExists ? 0.95 : 0.7,
      reasons: tsconfigExists ? ["Found tsconfig.json"] : ["TypeScript inferred from project layout"],
      recommendedSkillIds: ["token-optimizer"]
    });
  }

  const deps = packageJson ? { ...packageJson.dependencies, ...packageJson.devDependencies } : {};

  if ("react" in deps) {
    addDetection(results, {
      technology: "react",
      confidence: 0.95,
      reasons: ['Dependency "react" found in package.json'],
      recommendedSkillIds: ["accessibility-audit", "storybook-component-stories", "playwright-ui-testing"]
    });
  }

  if ("next" in deps || nextConfigExists) {
    addDetection(results, {
      technology: "nextjs",
      confidence: nextConfigExists ? 1 : 0.9,
      reasons: nextConfigExists ? ["Found next.config.*"] : ['Dependency "next" found in package.json'],
      recommendedSkillIds: ["accessibility-audit", "playwright-ui-testing", "spec-driven-development"]
    });
  }

  if ("@angular/core" in deps || angularJsonExists) {
    addDetection(results, {
      technology: "angular",
      confidence: angularJsonExists ? 1 : 0.95,
      reasons: angularJsonExists ? ["Found angular.json"] : ['Dependency "@angular/core" found in package.json'],
      recommendedSkillIds: [
        "angular-guidelines",
        "vitest-component-testing",
        "storybook-component-stories",
        "accessibility-audit"
      ]
    });
  }

  if ("vite" in deps || viteConfigExists) {
    addDetection(results, {
      technology: "vite",
      confidence: viteConfigExists ? 1 : 0.9,
      reasons: viteConfigExists ? ["Found vite.config.*"] : ['Dependency "vite" found in package.json'],
      recommendedSkillIds: ["storybook-component-stories", "playwright-ui-testing"]
    });
  }

  if ("@playwright/test" in deps) {
    addDetection(results, {
      technology: "playwright",
      confidence: 0.95,
      reasons: ['Dependency "@playwright/test" found in package.json'],
      recommendedSkillIds: ["playwright-ui-testing"]
    });
  }

  if ("vitest" in deps) {
    addDetection(results, {
      technology: "vitest",
      confidence: 0.95,
      reasons: ['Dependency "vitest" found in package.json'],
      recommendedSkillIds: ["vitest-component-testing"]
    });
  }

  if ("tailwindcss" in deps || (await pathExists(path.join(cwd, "tailwind.config.js"))) || (await pathExists(path.join(cwd, "tailwind.config.ts")))) {
    addDetection(results, {
      technology: "tailwindcss",
      confidence: 0.9,
      reasons: ['Dependency "tailwindcss" or config file found'],
      recommendedSkillIds: ["accessibility-audit", "css-modules"]
    });
  }

  if ("@storybook/react" in deps || "@storybook/angular" in deps || storybookDirExists) {
    addDetection(results, {
      technology: "storybook",
      confidence: storybookDirExists ? 1 : 0.9,
      reasons: storybookDirExists ? ["Found .storybook directory"] : ["Storybook dependency found"],
      recommendedSkillIds: ["storybook-component-stories", "playwright-ui-testing"]
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence || a.technology.localeCompare(b.technology));
}

export async function inspectProjectFiles(cwd) {
  const probes = ["package.json", "tsconfig.json", "angular.json", ".storybook"];
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
