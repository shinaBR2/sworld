import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'storybook-static/**',
        'dist/**',
        'tsup.config.ts',
        'vite.config.ts',
        '.eslintrc.js',
      ],
    },
  },
  resolve: {
    alias: {
      core: path.resolve(__dirname, '../core/src'),
    },
  },
});
