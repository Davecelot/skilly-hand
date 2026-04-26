import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").at(-1);
const pagesBase = repositoryName ? `/${repositoryName}/` : "/";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? pagesBase : "/",
  plugins: [react()]
});
