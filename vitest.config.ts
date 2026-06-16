import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { resolve } from 'node:path';

/**
 * 測試專用設定，刻意不載入 CRXJS 外掛（避免在 jsdom 下需要 manifest/瀏覽器環境）。
 * core/ 為純函式、ui/ 在 jsdom 下渲染。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
