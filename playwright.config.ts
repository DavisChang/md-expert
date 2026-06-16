import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 5180);

/**
 * E2E：以 headed Chromium 載入 dist/ 擴充。
 * 執行前須先 `pnpm build`。webServer 提供測試頁（.md 以 text/plain 供應）。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node e2e/server.mjs',
    url: `http://localhost:${PORT}/sample.md`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORT) },
  },
});
