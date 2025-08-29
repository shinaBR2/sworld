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
    minify: 'esbuild',
    chunkSizeWarningLimit: 100,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            /** For error tracking, analytics */
            if (id.includes('/node_modules/rollbar')) return 'tracker-vendor';

            if (
              id.includes('/video.js@') ||
              id.includes('/videojs-youtube@') ||
              id.includes('/videojs-vtt.js@') ||
              id.includes('/m3u8-parser/') ||
              id.includes('/mpd-parser/')
            ) {
              return 'video-player';
            }

            /**
             * App broken if bundle mui separately
             */
            if (id.includes('react')) return 'react-vendor';

            return 'vendor';
          }
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
