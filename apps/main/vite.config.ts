import { codecovVitePlugin } from '@codecov/vite-plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const codecovToken = process.env.CODECOV_TOKEN;

// https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
export default defineConfig(({ mode }) => {
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
        enableBundleAnalysis: !!codecovToken,
        bundleName: 'main',
        uploadToken: codecovToken,
      }),
    ],
    // https://stackoverflow.com/a/76694634/8270395
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 100,
      rolldownOptions: {
        output: {
          advancedChunks: {
            groups: [
              /** For error tracking, analytics */
              { name: 'tracker-vendor', test: /\/node_modules\/rollbar/ },
              { name: 'chart-vendor', test: /\/echarts@|\/zrender@/ },
              /**
               * App broken if bundle mui separately
               */
              { name: 'react-vendor', test: /node_modules.*react/ },
              { name: 'vendor', test: /node_modules/ },
            ],
          },
        },
      },
    },
  };
});
