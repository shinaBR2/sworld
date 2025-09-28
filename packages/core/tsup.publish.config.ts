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
  outDir: 'dist/',
  treeshake: true,
  splitting: true,
  shims: true,
  external: ['react'],
});
