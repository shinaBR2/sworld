// import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
// import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3002,
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
        manualChunks: id => {
          if (id.includes('node_modules')) {
            /**
             * App broken if bundle mui separetely
             */
            if (id.includes('react')) return 'react-vendor';

            if (
              id.includes('@sentry-internal/replay/') ||
              id.includes('@sentry-internal/replay-canvas/')
            ) {
              return 'sentry-replay-vendor';
            }

            if (id.includes('@sentry') || id.includes('sentry-internal')) {
              return 'sentry-vendor';
            }

            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    // TODO source map upload
    // sentryVitePlugin({
    //   org: 'sworld-dc',
    //   project: 'watch',
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    // }),
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
