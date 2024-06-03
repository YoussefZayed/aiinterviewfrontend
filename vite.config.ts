import path, { join } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
const srcRoot = join(__dirname, "src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: srcRoot,
  base: "./",
  publicDir: join(__dirname, "public/"),
  build: {
    outDir: join(srcRoot, "/out"),
    emptyOutDir: true,
    rollupOptions: {},
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  optimizeDeps: {
    exclude: ["path"],
  },
});
