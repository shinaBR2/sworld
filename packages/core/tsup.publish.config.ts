import { defineConfig } from 'tsup';

// trigger config

export default defineConfig({
  clean: true,
  dts: true, // ONLY CHANGE
  sourcemap: true,
  entry: [
    './src/**/*.ts?(x)',
    '!./src/**/*.test.ts?(x)',
    '!./src/**/*.stories.ts?(x)',
  ],
  format: ['esm'],
  // See tsup.config.ts — "type": "module" flips tsup's ESM extension to .js,
  // but the exports map points at .mjs. Keep them in agreement.
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
  outDir: 'dist/',
  treeshake: true,
  splitting: true,
  shims: true,
  external: ['react'],
});
