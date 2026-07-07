import { codecovVitePlugin } from '@codecov/vite-plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const codecovToken = process.env.CODECOV_TOKEN;

// https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
export default defineConfig({
  server: {
    port: 3001,
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
             * Keep React, MUI, Emotion and their eval-time React helpers
             * (react-is, react-transition-group, hoist-non-react-statics)
             * together — the app breaks if MUI is split from React. Anchored to
             * real package names so pnpm's `_react@x` peer-dep suffix in
             * dependency paths doesn't sweep every package into this chunk.
             */
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|react-is|react-transition-group|hoist-non-react-statics|scheduler|use-sync-external-store|@emotion|@mui)\//,
            },
            /**
             * Rollbar in its own chunk. It stays eager because it's a static
             * import on the entry graph (via core's ErrorBoundary), not because
             * of this group — a group only routes code, it doesn't set load
             * timing. Eager is required to catch load-time crashes.
             */
            { name: 'tracker-vendor', test: /node_modules\/(rollbar|@rollbar)\// },
            /**
             * Remaining third-party code (Auth0, TanStack, popper, …) in its
             * own chunk so it stays cacheable across app-code changes instead
             * of being glued into the app entry chunk.
             */
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
  plugins: [
    // viteCommonjs(),
    TanStackRouterVite(),
    react(),
    // Local bundle analyzer
    // visualizer({
    //   open: true,
    //   gzipSize: true,
    //   sourcemap: true,
    //   brotliSize: true,
    //   // template: 'treemap',
    //   template: 'network',
    //   filename: 'stats.html',
    // }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-icon-180x180.png',
        'masked-icon.svg',
      ],
      manifest: {
        name: 'Listen',
        short_name: 'Listen',
        description: "Listen - ShinaBR2's world",
        theme_color: '#ffffff',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'sworld-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable_icon_x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
    codecovVitePlugin({
      enableBundleAnalysis: !!codecovToken,
      bundleName: 'listen',
      uploadToken: codecovToken,
    }),
  ],
});
