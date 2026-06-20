import { cp, lstat, mkdir, readdir, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogDir = path.join(rootDir, "catalog", "skills");
const overlayDir = path.join(rootDir, "skills");

async function collectFiles(directory, prefix = "") {
  const files = new Map();
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = path.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    const metadata = await lstat(absolutePath);

    if (metadata.isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed in the public skills overlay: ${relativePath}`);
    }
    if (metadata.isDirectory()) {
      const nested = await collectFiles(absolutePath, relativePath);
      for (const [filePath, contents] of nested) files.set(filePath, contents);
    } else if (metadata.isFile()) {
      files.set(relativePath, await readFile(absolutePath));
    }
  }

  return files;
}

export async function checkSkillsOverlay() {
  const canonicalFiles = await collectFiles(catalogDir);
  const overlayFiles = await collectFiles(overlayDir);
  const issues = [];

  for (const [filePath, contents] of canonicalFiles) {
    const overlayContents = overlayFiles.get(filePath);
    if (!overlayContents) issues.push(`Missing from skills overlay: ${filePath}`);
    else if (!contents.equals(overlayContents)) issues.push(`Content differs in skills overlay: ${filePath}`);
  }
  for (const filePath of overlayFiles.keys()) {
    if (!canonicalFiles.has(filePath)) issues.push(`Unexpected file in skills overlay: ${filePath}`);
  }

  return { fileCount: canonicalFiles.size, issues };
}

export async function syncSkillsOverlay() {
  const temporaryDir = `${overlayDir}.tmp-${process.pid}`;
  await rm(temporaryDir, { recursive: true, force: true });
  await mkdir(temporaryDir, { recursive: true });

  try {
    const skillEntries = await readdir(catalogDir, { withFileTypes: true });
    for (const entry of skillEntries) {
      if (!entry.isDirectory()) continue;
      await cp(path.join(catalogDir, entry.name), path.join(temporaryDir, entry.name), {
        recursive: true,
        dereference: true
      });
    }
    await rm(overlayDir, { recursive: true, force: true });
    await rename(temporaryDir, overlayDir);
  } catch (error) {
    await rm(temporaryDir, { recursive: true, force: true });
    throw error;
  }

  return checkSkillsOverlay();
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const checkOnly = process.argv.includes("--check");
  try {
    const result = checkOnly ? await checkSkillsOverlay() : await syncSkillsOverlay();
    if (result.issues.length > 0) {
      renderer.writeError(renderer.error({
        what: "skills overlay is out of sync",
        why: result.issues.join("\n"),
        hint: "Run `npm run skills:sync` and commit the generated skills/ files.",
        exitCode: 1
      }));
      process.exitCode = 1;
    } else {
      renderer.write(renderer.status("success", `Skills overlay is in sync (${result.fileCount} files).`));
    }
  } catch (error) {
    renderer.writeError(renderer.error({
      what: checkOnly ? "skills overlay check failed" : "skills overlay sync failed",
      why: error.message,
      hint: checkOnly
        ? "Run `npm run skills:sync` and check for unsupported symlinks."
        : "Ensure catalog/skills is readable and the repository is writable.",
      exitCode: 1
    }));
    process.exitCode = 1;
  }
}
