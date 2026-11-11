import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import monkey, { cdn } from "vite-plugin-monkey";
import metadata from "./package.json" with { type: "json" };

const logo = `data:image/png;base64,${readFileSync(new URL("./src/shared/logo.png", import.meta.url)).toString("base64")}`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    monkey({
      entry: "src/main.ts",
      server: { open: true },
      build: {
        externalGlobals: {
          jquery: cdn.jsdelivr("$", "dist/jquery.min.js"),
        },
      },
      userscript: {
        name: "Artois University Rebranding (non officiel)",
        namespace: metadata.homepage,
        version: metadata.version,
        description: metadata.description,
        author: metadata.author,
        icon: logo,
        homepageURL: metadata.homepage,
        supportURL: metadata.bugs.url,
        match: ["https://*.univ-artois.fr/*"],
        "run-at": "document-start",
      },
    }),
  ],
});
