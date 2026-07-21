import { fileURLToPath } from 'node:url';
// From 'vitest/config', not 'vite' — vite is not a declared dependency here. It
// only resolved in the standalone repo because that install happened to hoist it
// into the root node_modules; under the monorepo's layout it isn't visible and
// the config fails to load.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      // Mirror of the tsconfig `core/*` path. Vitest doesn't read tsconfig
      // paths, and resolving `core` through node_modules would hit the package
      // exports map, which serves dist/ — requiring core to be built before the
      // backend's tests could run. Point at source so tests need no build step.
      core: fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
    },
  },
  test: {
    setupFiles: ['./__mocks__/sequelize.ts'],
  },
});
