import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
      name: 'database',
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['sequelize'],
    },
    target: 'node20',
  },
});
