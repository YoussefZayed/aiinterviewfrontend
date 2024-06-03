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
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 5173,
  },
  build: {
    outDir: join(srcRoot, "/out"),
    emptyOutDir: true,
    ignoreDeprecations: true, // Ignore deprecation warnings
    typescript: {
      ignoreDevErrors: true, // Ignore TypeScript errors during development
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
});
