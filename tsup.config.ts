import { defineConfig } from 'tsup';

export default defineConfig({
  bundle: true,
  entry: ['src/index.ts'],
  format: 'esm',
  treeshake: true,
});
