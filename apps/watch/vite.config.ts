import { codecovVitePlugin } from '@codecov/vite-plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// import { visualizer } from 'rollup-plugin-visualizer';

const codecovToken = process.env.CODECOV_TOKEN;

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
  preview: {
    port: 4002,
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
            /** For error tracking, analytics */
            { name: 'tracker-vendor', test: /\/node_modules\/rollbar/ },
            {
              name: 'video-player',
              test: /\/video\.js@|\/videojs-youtube@|\/videojs-vtt\.js@|\/m3u8-parser\/|\/mpd-parser\//,
            },
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
      bundleName: 'watch',
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
