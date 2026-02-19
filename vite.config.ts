import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/bigislandvr-quest/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  server: {
    host: true, // Allow external connections for Quest testing
    port: 5173,
    https: false, // WebXR requires HTTPS in production, but localhost is exempt
  },
  preview: {
    host: true,
    port: 4173,
  },
});
