import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

/**
 * ui package.json does not have react as dependency
 */
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const external = [...Object.keys(pkg.dependencies || {})].filter(
  dep => !pkg.dependencies[dep].startsWith('workspace:')
);

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
  external: ['react', ...external],
});
