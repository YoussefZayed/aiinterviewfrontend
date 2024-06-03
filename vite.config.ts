import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.PORT || 3000,
  },
  build: {
    ignoreDeprecations: true, // Ignore deprecation warnings
    typescript: {
      ignoreDevErrors: true, // Ignore TypeScript errors during development
    },
    rollupOptions: {
      onwarn: (warning, rollupWarn) => {
        if (warning.code !== "TYPESCRIPT_ERROR") {
          rollupWarn(warning);
        }
      },
    },
  },
});
