import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
export default defineConfig({
  server: {
    port: 3003,
    host: '0.0.0.0',
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    // visualizer(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   includeAssets: [
    //     "favicon.ico",
    //     "apple-icon-180x180.png",
    //     "masked-icon.svg",
    //   ],
    //   manifest: {
    //     name: "Listen",
    //     short_name: "Listen",
    //     description: "Listen - ShinaBR2's world",
    //     theme_color: "#ffffff",
    //     icons: [
    //       {
    //         src: "android-chrome-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "android-chrome-256x256.png",
    //         sizes: "256x256",
    //         type: "image/png",
    //       },
    //       {
    //         src: "sworld-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "maskable_icon_x384.png",
    //         sizes: "384x384",
    //         type: "image/png",
    //         purpose: "maskable",
    //       },
    //     ],
    //   },
    // }),
  ],
});
