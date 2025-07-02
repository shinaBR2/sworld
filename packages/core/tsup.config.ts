import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  // this dts thing only work if max_old_space_size set
  dts: false,
  sourcemap: true,
  entry: ['./src/**/*.ts?(x)', '!./src/**/*.test.ts?(x)', '!./src/**/*.stories.ts?(x)'],
  format: ['esm'],
  outDir: 'dist/',
  treeshake: true,
  splitting: true,
  shims: true,
  external: ['react'],
});
