import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 4000,
    host: '0.0.0.0',
  },
  plugins: [TanStackRouterVite(), react()],
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
            /** For error tracking, analytics */
            if (id.includes('/node_modules/rollbar')) return 'tracker-vendor';

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
});
