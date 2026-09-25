import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const base = process.env.VITE_BASE_PATH || '/sarinah-talent-pool/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, '../resources/static'),
    emptyOutDir: false,
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/sarinah-talent-pool/api': {
        target: 'http://localhost:8004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sarinah-talent-pool/, ''),
      },
      '/sarinah-talent-pool/images': {
        target: 'http://localhost:8004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sarinah-talent-pool/, ''),
      },
    },
  },
});
