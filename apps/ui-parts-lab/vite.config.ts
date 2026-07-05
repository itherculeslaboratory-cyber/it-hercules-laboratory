import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ihl/ui-catalog": path.resolve(root, "../../packages/ihl-ui-catalog/src"),
    },
  },
  server: {
    port: 3100,
    strictPort: true,
  },
  preview: {
    port: 3100,
    strictPort: true,
  },
});
