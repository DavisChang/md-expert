import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const outDir = resolve(root, 'store/screenshots');
const port = Number(process.env.PORT ?? 5180);
const baseUrl = `http://localhost:${port}`;

function startServer() {
  const server = spawn('node', ['e2e/server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));
  return server;
}

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/sample.md`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function getExtensionId(context) {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 10_000 });
  }
  return new URL(serviceWorker.url()).host;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const server = startServer();
  try {
    await waitForServer();

    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      viewport: { width: 1280, height: 800 },
      args: [`--disable-extensions-except=${dist}`, `--load-extension=${dist}`],
    });

    try {
      const page = await context.newPage();

      await page.goto(`${baseUrl}/sample.md`);
      const host = page.locator('#markdown-expert-root');
      await host.waitFor({ state: 'attached' });
      await host.locator('.mdx-fab').click();
      await host.locator('.mdx-article').waitFor({ state: 'visible' });
      await page.screenshot({ path: resolve(outDir, '01-reader-raw-markdown.png') });

      await page.keyboard.press('d');
      await page.keyboard.press('d');
      await host.locator('[data-theme="dark"], .mdx-root').first().waitFor({ state: 'visible' });
      await page.screenshot({ path: resolve(outDir, '02-reader-toc-code.png') });

      await page.goto(`${baseUrl}/blog.html`);
      await page.locator('#markdown-expert-root .mdx-fab').waitFor({ state: 'visible' });
      await page.screenshot({ path: resolve(outDir, '03-embedded-markdown-prompt.png') });

      const extensionId = await getExtensionId(context);
      await page.goto(`chrome-extension://${extensionId}/src/entries/options/index.html`);
      await page.locator('h1').waitFor({ state: 'visible' });
      await page.screenshot({ path: resolve(outDir, '04-options-privacy.png') });

      console.log(`Store screenshots written to ${outDir}`);
    } finally {
      await context.close();
    }
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
