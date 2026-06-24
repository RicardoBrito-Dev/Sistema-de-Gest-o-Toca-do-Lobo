/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Caminho absoluto: necessário para que os assets carreguem em rotas aninhadas
  // (ex.: /comanda/:id acessada direto pelo QR). Com './' o navegador resolveria
  // ./assets relativo a /comanda/ → 404.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
