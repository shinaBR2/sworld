import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { codecovVitePlugin } from '@codecov/vite-plugin';

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
export default defineConfig({
  server: {
    port: 3001,
    host: '0.0.0.0',
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
        manualChunks: id => {
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
      includeAssets: ['favicon.ico', 'apple-icon-180x180.png', 'masked-icon.svg'],
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
