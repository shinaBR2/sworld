import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
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
  plugins: [viteCommonjs(), react()],
});
