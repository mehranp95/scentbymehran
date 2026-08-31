import { defineConfig } from "vite";
import { resolve } from "path";
import { readdirSync } from "fs";

function perfumeInputs() {
  const dir = resolve(__dirname, "dist-pages");
  const inputs = { main: resolve(dir, "index.html") };
  try {
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".html") && f !== "index.html") {
        inputs[f.replace(/\.html$/, "")] = resolve(dir, f);
      }
    }
  } catch {
    /* pages not built yet */
  }
  return inputs;
}

export default defineConfig({
  root: "dist-pages",
  publicDir: resolve(__dirname, "public"),
  server: {
    host: "127.0.0.1",
    port: 43127,
    strictPort: true,
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: perfumeInputs(),
    },
  },
});
