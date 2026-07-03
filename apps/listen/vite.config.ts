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
