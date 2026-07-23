import { fileURLToPath } from 'node:url';
// From 'vitest/config', not 'vite' — vite is not a declared dependency here. It
// only resolved in the standalone repo because that install happened to hoist it
// into the root node_modules; under the monorepo's layout it isn't visible and
// the config fails to load.
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

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
    coverage: {
      provider: 'v8',
      // `json` writes coverage-final.json, which the Codecov uploader picks up.
      reporter: ['text', 'json'],
      // Keep Vitest's built-in exclusions (tests, config, node_modules, dist)
      // and add the backend-specific ones. These mirror the `ignore` list in
      // the root codecov.yml so the local report reflects service code only.
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/services/hasura/generated-graphql/**',
        'src/services/hashnode/generated-graphql/**',
        'src/services/hasura/codegen.ts',
        'src/services/hashnode/codegen.ts',
        'src/cli/**', // standalone operator tooling, run via tsx (not part of the services)
      ],
    },
  },
});
