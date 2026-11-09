/// <reference types="vitest" />
// Configuração do Vite: React, atalho "@" para a pasta src e testes com Vitest.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(raiz, "src") } },
  test: { environment: "node", include: ["src/**/*.test.ts", "supabase/functions/**/*.test.ts"] },
});
