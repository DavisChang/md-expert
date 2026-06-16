import { test, expect } from './fixtures';

const BASE = `http://localhost:${process.env.PORT ?? 5180}`;

test.describe('Markdown Expert 端對端', () => {
  test('在原始 .md 頁面偵測並渲染', async ({ page }) => {
    await page.goto(`${BASE}/sample.md`);

    // 預設為 prompt 模式：先出現提示泡泡（位於 Shadow DOM 內）。
    const host = page.locator('#markdown-expert-root');
    await expect(host).toBeAttached({ timeout: 5000 });

    const fab = host.locator('.mdx-fab');
    await expect(fab).toBeVisible();
    await fab.click();

    // 點開後出現閱讀視圖，標題被正確渲染。
    const article = host.locator('.mdx-article');
    await expect(article).toBeVisible();
    await expect(article.locator('h1')).toContainText('Markdown Expert 測試文件');
    // 程式碼區塊套用語言 class。
    await expect(article.locator('pre.mdx-code code.language-ts')).toBeVisible();
    // 目錄存在。
    await expect(host.locator('.mdx-toc a')).not.toHaveCount(0);
  });

  test('在一般網頁偵測內嵌 Markdown 區塊', async ({ page }) => {
    await page.goto(`${BASE}/blog.html`);
    const host = page.locator('#markdown-expert-root');
    await expect(host).toBeAttached({ timeout: 5000 });
    await expect(host.locator('.mdx-fab')).toBeVisible();
  });

  test('關閉後可重新由提示開啟', async ({ page }) => {
    await page.goto(`${BASE}/sample.md`);
    const host = page.locator('#markdown-expert-root');
    await host.locator('.mdx-fab').click();
    await expect(host.locator('.mdx-article')).toBeVisible();
    await host.locator('.mdx-btn', { hasText: '關閉' }).click();
    await expect(host.locator('.mdx-article')).toHaveCount(0);
  });

  test('鍵盤快捷鍵：T 切換目錄、Esc 關閉，按鈕顯示快捷字', async ({ page }) => {
    await page.goto(`${BASE}/sample.md`);
    const host = page.locator('#markdown-expert-root');
    await host.locator('.mdx-fab').click();
    await expect(host.locator('.mdx-article')).toBeVisible();

    // 按鈕上顯示快捷鍵提示
    await expect(host.locator('.mdx-kbd', { hasText: 'T' })).toBeVisible();

    // T 切換目錄
    await expect(host.locator('.mdx-toc')).toBeVisible();
    await page.keyboard.press('t');
    await expect(host.locator('.mdx-toc')).toHaveCount(0);
    await page.keyboard.press('t');
    await expect(host.locator('.mdx-toc')).toBeVisible();

    // Esc 關閉
    await page.keyboard.press('Escape');
    await expect(host.locator('.mdx-article')).toHaveCount(0);
  });

  test('讚按鈕：點擊後切換為已讚狀態', async ({ page }) => {
    await page.goto(`${BASE}/sample.md`);
    const host = page.locator('#markdown-expert-root');
    await host.locator('.mdx-fab').click();
    const like = host.locator('.mdx-like');
    await expect(like).toContainText('讚');
    await like.click();
    await expect(like).toContainText('已讚');
    await expect(like).toBeDisabled();
  });
});
