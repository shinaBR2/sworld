/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {},
  test: {
    setupFiles: ['./__mocks__/sequelize.ts'],
  },
});
