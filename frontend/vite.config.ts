import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/ui/',
  build: { outDir: '../src/companion/web', emptyOutDir: true },
  test: { include: ['tests/**/*.test.ts'] },
});
