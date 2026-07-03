import { codecovVitePlugin } from '@codecov/vite-plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// import { visualizer } from 'rollup-plugin-visualizer';

const codecovToken = process.env.CODECOV_TOKEN;
// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3004,
    host: '0.0.0.0',
  },
  // https://stackoverflow.com/a/76694634/8270395
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 100,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            /**
             * App broken if bundle mui separately
             */
            { name: 'react-vendor', test: /node_modules.*react/ },
            /** For error tracking, analytics */
            { name: 'tracker-vendor', test: /\/node_modules\/rollbar/ },
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
      bundleName: 'til',
      uploadToken: codecovToken,
    }),
    // visualizer({
    //   open: true,
    //   gzipSize: true,
    //   sourcemap: true,
    //   brotliSize: true,
    //   template: 'treemap',
    //   // template: 'network',
    //   filename: 'stats.html',
    // }),
  ],
});
