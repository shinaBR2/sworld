import { codecovVitePlugin } from '@codecov/vite-plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const codecovToken = process.env.CODECOV_TOKEN;

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3006,
    host: '0.0.0.0',
  },
  preview: {
    port: 4006,
    host: '0.0.0.0',
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 100,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            /** For error tracking, analytics */
            { name: 'tracker-vendor', test: /\/node_modules\/rollbar/ },
            /**
             * App broken if bundle mui separately
             */
            { name: 'react-vendor', test: /node_modules.*react/ },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    codecovVitePlugin({
      enableBundleAnalysis: !!codecovToken,
      bundleName: 'look',
      uploadToken: codecovToken,
    }),
  ],
});
