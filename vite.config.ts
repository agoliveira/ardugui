import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        // Main process
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['serialport', 'electron'],
            },
          },
        },
      },
      {
        // Preload script
        entry: 'electron/preload.ts',
        onstart(args) {
          args.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});
