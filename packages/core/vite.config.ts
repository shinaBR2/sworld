import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/graphql/**', 'dist/**', 'codegen.ts', 'tsup.config.ts', 'vite.config.ts', '.eslintrc.js'],
    },
  },
});
