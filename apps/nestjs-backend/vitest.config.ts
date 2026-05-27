import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

const testFiles = ['**/src/**/*.{test,spec}.{js,ts}'];
mkdirSync(join(process.cwd(), 'coverage', 'unit', 'tmp'), { recursive: true });
['.tmp-1-4', '.tmp-2-4', '.tmp-3-4', '.tmp-4-4'].forEach((dir) => {
  mkdirSync(join(process.cwd(), 'coverage', 'unit', dir), { recursive: true });
});

export default defineConfig({
  resolve: {
    conditions: ['@teable/source'],
  },
  ssr: {
    resolve: {
      conditions: ['@teable/source'],
      externalConditions: ['@teable/source'],
    },
  },
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2022',
      },
    }),
    tsconfigPaths(),
  ],
  cacheDir: '../../.cache/vitest/nestjs-backend/unit',
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest-unit.setup.ts',
    passWithNoTests: true,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/unit',
      tempDirectory: './coverage/unit/tmp',
      include: ['src/**/*.{js,ts}'],
    },
    include: testFiles,
    exclude: [
      ...configDefaults.exclude,
      '**/*.controller.spec.ts', // exclude controller test
      '**/.next/**',
    ],
  },
});
