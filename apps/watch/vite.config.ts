import { sentryVitePlugin } from '@sentry/vite-plugin';
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
             * App broken if bundle mui separately
             */
            if (id.includes('react')) return 'react-vendor';

            // App broken if bundle `@sentry-internal/feedback` separately
            if (
              id.includes('@sentry-internal/replay/') ||
              id.includes('@sentry-internal/replay-canvas/')
              // id.includes('@sentry-internal/feedback/')
            ) {
              return 'sentry-integration-vendor';
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
    /**
     * THIS IS ONLY RUN ON CI SERVER
     * THEREFORE WE SHOULD NEVER PREFIX SENTRY AUTH TOKEN with VITE_
     */
    ...(process.env.CI
      ? [
          sentryVitePlugin({
            org: 'sworld-dc',
            project: 'frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
          }),
        ]
      : []),
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
