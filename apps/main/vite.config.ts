import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { codecovVitePlugin } from '@codecov/vite-plugin';

// https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    preview: {
      port: 4000,
      host: '0.0.0.0',
    },
    plugins: [
      TanStackRouterVite(),
      react(),
      codecovVitePlugin({
        enableBundleAnalysis: env.CODECOV_TOKEN !== undefined,
        bundleName: 'main',
        uploadToken: env.CODECOV_TOKEN,
      }),
    ],
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

              if (id.includes('/echarts@')) return 'chart-vendor';

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
  };
});
