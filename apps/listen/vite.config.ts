import { fileURLToPath } from 'node:url';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// In dev, consume the `ui`/`core` workspace packages from SOURCE instead of
// their built dist. Importing the built dist makes MUI a transitive dep that
// Vite's optimizer splits across circular chunks, so MUI's Box.js calls
// createTheme() before its chunk initialises (`createTheme_default is not a
// function`). From source, Vite optimizes MUI once in the app's own graph
// (like a normal MUI app) and the circular init resolves. Also gives instant
// HMR on ui/core edits. Prod build is untouched (see the `serve`-only guard).
const workspaceSrc = (pkg: string) =>
  fileURLToPath(new URL(`../../packages/${pkg}/src`, import.meta.url));
const uiSrc = workspaceSrc('ui');
const coreSrc = workspaceSrc('core');

/**
 * For debug production build
 * esbuild: {
    keepNames: true,
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: false,
  },
 */

const codecovToken = process.env.CODECOV_TOKEN;

// https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
export default defineConfig(({ command }) => ({
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
  resolve: {
    // Dev only: point the workspace packages at their source. The production
    // build keeps using the built dist, so prod output is unchanged.
    alias:
      command === 'serve'
        ? [
            { find: /^ui\/(.*)$/, replacement: `${uiSrc}/$1` },
            { find: /^ui$/, replacement: uiSrc },
            { find: /^core\/(.*)$/, replacement: `${coreSrc}/$1` },
            { find: /^core$/, replacement: coreSrc },
          ]
        : [],
    dedupe:
      command === 'serve'
        ? ['react', 'react-dom', '@emotion/react', '@emotion/styled']
        : [],
  },
  // https://stackoverflow.com/a/76694634/8270395
  build: {
    sourcemap: true,
    minify: 'esbuild', // Use esbuild minifier instead of turning off completely
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
            /**
             * App broken if bundle mui separately
             */
            if (id.includes('react')) return 'react-vendor';

            /** For error tracking, analytics */
            if (id.includes('/node_modules/rollbar')) return 'tracker-vendor';

            return 'vendor';
          }
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
}));
