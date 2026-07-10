import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      core: path.resolve(__dirname, '../../packages/core/src'),
    },
  },
});
