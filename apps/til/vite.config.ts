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
             * Keep the React + MUI framework together in one eager chunk.
             * App breaks if MUI is split into its own chunk (multiple emotion
             * instances / init order), so react, react-dom, emotion and mui
             * must ship together.
             *
             * The regex is anchored to `/node_modules/<pkg>/` so it matches the
             * actual installed package, NOT pnpm's peer-suffixed store dirs
             * (e.g. `.../@tiptap+react@3_react@19.2.7/...`). The previous
             * `/node_modules.*react/` greedily swept every package with a React
             * peer dep — tiptap, prosemirror, etc. — into this eager chunk,
             * defeating the route-level `lazy()` splitting.
             */
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react-dom|react|scheduler|use-sync-external-store|@emotion|@mui)[\\/]/,
            },
            /** Error tracking — kept separate so it can be evicted later. */
            {
              name: 'tracker-vendor',
              test: /[\\/]node_modules[\\/]rollbar[\\/]/,
            },
            /**
             * Everything else is intentionally left to rolldown's automatic
             * code-splitting: the lazy editor (tiptap/prosemirror) and shiki's
             * per-language grammars then load on demand instead of eagerly.
             */
          ],
        },
      },
    },
  },
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
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
