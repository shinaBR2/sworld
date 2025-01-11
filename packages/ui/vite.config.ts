import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test.setup.ts'],
  },
  resolve: {
    alias: {
      core: path.resolve(__dirname, '../core/src'),
    },
  },
});
