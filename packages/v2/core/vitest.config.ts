import { defineConfig, configDefaults } from 'vitest/config';

const testFiles = ['./src/**/*.{test,spec}.{js,ts}'];

export default defineConfig({
  resolve: {
    alias: {
      '@teable/core': new URL('../../core/src/index.ts', import.meta.url).pathname,
      '@teable/formula': new URL('../../formula/src/index.ts', import.meta.url).pathname,
      '@teable/i18n-keys': new URL('../../i18n-keys/src/index.ts', import.meta.url).pathname,
      '@teable/v2-di': new URL('../di/src/index.ts', import.meta.url).pathname,
    },
    conditions: ['@teable/source'],
  },
  ssr: {
    resolve: {
      conditions: ['@teable/source'],
      externalConditions: ['@teable/source'],
    },
  },
  cacheDir: '../../../.cache/vitest/v2-core',
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/testkit/vitest.setup.ts'],
    passWithNoTests: true,
    typecheck: {
      enabled: false,
    },
    pool: 'forks',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
    },
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    include: testFiles,
    exclude: [...configDefaults.exclude, '**/.next/**'],
  },
});
