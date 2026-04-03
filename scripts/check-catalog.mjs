import { loadAllSkills, verifyCatalogFiles } from "../packages/catalog/src/index.js";

const manifests = await loadAllSkills();
const issues = await verifyCatalogFiles();

for (const manifest of manifests) {
  if (manifest.id.startsWith("scannlab-")) {
    issues.push(`Portable catalog still contains legacy-prefixed id: ${manifest.id}`);
  }
}

if (issues.length > 0) {
  console.error("Catalog validation failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Catalog validation passed for ${manifests.length} skills.`);
}
