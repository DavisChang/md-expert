/**
 * 產生側欄 (side panel) 視覺預覽：用真實 markdown-it 管線渲染範例內容，
 * 內嵌實際的 sidepanel.css，輸出可在瀏覽器開啟的 HTML 以驗證 Apple 配色與 sticky 標題。
 * 純預覽用途，不影響擴充建置。
 */
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import taskLists from 'markdown-it-task-lists';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// tokens（色票）→ markdown（共用內文）→ 側欄外框，與擴充實際載入順序一致。
const read = (p) => readFileSync(resolve(__dirname, p), 'utf8');
const css = [
  read('../src/ui/theme/tokens.css'),
  read('../src/ui/theme/markdown.css'),
  read('../src/entries/sidepanel/sidepanel.css'),
].join('\n');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (code, lang) => {
    const cls = lang ? ` class="language-${lang}"` : '';
    return `<pre class="mdx-code"${lang ? ` data-lang="${lang}"` : ''}><code${cls}>${md.utils.escapeHtml(
      code,
    )}</code></pre>`;
  },
})
  .use(anchor)
  .use(taskLists, { enabled: true, label: true });

const sample = `# Anthropic STEM Fellow 計畫

> 每日精選：AI 商業應用與產業顛覆跨領域文章。**隱私優先**，全程本機處理。

Fellow 共同設計。專案必須在 Fellowship 期間內可以交付（scoped to ship within the period of the fellowship），意味著這不是開放式的研究探索，而是有明確目標和交付物的工程化研究。

## 1.6 專案範例的技術分析

官方提供了兩個專案範例，值得深入分析：

### 範例一：材料科學家修正相穩定性推理

- 使用 \`markdown-it\` 解析
- 以 **DOMPurify** 淨化
- 透過 [Shadow DOM](https://example.com) 隔離

### 待辦清單

- [x] 偵測原始 .md 頁面
- [x] GitHub raw 檔案
- [ ] Mermaid 圖表（第二階段）

## 程式碼

\`\`\`ts
const greeting: string = 'hello';
console.log(greeting);
\`\`\`

行內程式碼如 \`pnpm build\` 也應清晰。

## 比較表

| 來源 | 信心 | 狀態 |
| ---- | ---- | ---- |
| 原始 .md | 高 | ✅ |
| GitHub raw | 高 | ✅ |
| 頁內區塊 | 中 | ✅ |
`;

const articleHtml = md.render(sample.repeat(2));

const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8" />
<style>${css}</style></head>
<body>
  <div class="sp">
    <nav class="sp-list">
      <button class="sp-item active">Anthropic STEM Fellow 計畫</button>
      <button class="sp-item">myViewBoard — native macOS</button>
      <button class="sp-item">Business AI Daily</button>
    </nav>
    <article class="sp-article markdown-body">${articleHtml}</article>
  </div>
</body></html>`;

const out = resolve(__dirname, '../sidepanel-preview.html');
writeFileSync(out, html);
console.log(out);
