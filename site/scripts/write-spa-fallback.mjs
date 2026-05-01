import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.resolve(siteRoot, "../dist");

await copyFile(path.join(distRoot, "index.html"), path.join(distRoot, "404.html"));
