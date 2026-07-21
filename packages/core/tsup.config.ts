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
  // Pin the extension per format. Now that package.json declares
  // "type": "module", tsup would otherwise emit ESM as plain .js — and the
  // exports map points at .mjs, so every consumer resolving core through
  // node_modules would fail to find an entry. Keeping .mjs leaves this
  // build's JS output identical to what it has always been.
  //
  // The cjs branch matters even though `build` is esm-only: the `dev` script
  // passes --format esm,cjs, and a format-blind mapping would point both
  // builds at the same file, leaving CJS output inside a .mjs that Node then
  // parses as ESM ("require is not defined").
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
  outDir: 'dist/',
  treeshake: true,
  splitting: true,
  shims: true,
  external: ['react'],
});
