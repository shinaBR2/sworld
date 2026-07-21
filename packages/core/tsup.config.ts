import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  // this dts thing only work if max_old_space_size set
  dts: false,
  sourcemap: true,
  entry: [
    './src/**/*.ts?(x)',
    '!./src/**/*.test.ts?(x)',
    '!./src/**/*.stories.ts?(x)',
  ],
  format: ['esm'],
  // Pin the ESM extension. Now that package.json declares "type": "module",
  // tsup would otherwise emit plain .js — and the exports map points at .mjs,
  // so every consumer resolving core through node_modules would fail to find
  // an entry. Keeping .mjs makes dist byte-identical to what it has always been.
  outExtension: () => ({ js: '.mjs' }),
  outDir: 'dist/',
  treeshake: true,
  splitting: true,
  shims: true,
  external: ['react'],
});
