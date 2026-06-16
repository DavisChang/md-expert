import { describe, expect, it } from 'vitest';
import { detectAll } from './registry';
import { lineEditorDetector } from './lineEditor';
import type { DetectContext } from './detector';

/** 建一個假 document。 */
function makeCtx(bodyHtml: string, url = 'https://www.dropbox.com/preview/x.md'): DetectContext {
  const doc = document.implementation.createHTMLDocument('test');
  doc.body.innerHTML = bodyHtml;
  return { url, contentType: 'text/html', doc };
}

/**
 * 重建 Dropbox 式「一行一元素」結構：<ol><li> 每行一個 li（class 用 hash 模擬）。
 */
function lineEditorHtml(lines: string[]): string {
  const lis = lines
    .map((l) => `<li class="_lineContainer_t4qxl_11"><div class="_lineContent_t4qxl_32"><span>${l}</span></div></li>`)
    .join('');
  return `<div class="_scrollableContainer_t4qxl_1"><ol class="_block_t4qxl_7">${lis}</ol></div>`;
}

const MD_LINES = [
  '# 🤖 Business AI Daily — 2026-04-10',
  '',
  '> 每日精選：AI 商業應用與產業顛覆跨領域文章',
  '',
  '## 🔥 Hacker News 熱門討論',
  '',
  '### 1. AI 正在「吞噬」SaaS 產業',
  '**討論串：** [AI agents](https://news.ycombinator.com/item?id=46268452) · 412 points',
  '',
  '- SaaS 座席定價型面臨生存威脅',
  '- 平台整合商比點狀方案更具優勢',
  '- 企業將從「採購工具」轉向「部署能力」',
  '',
  '```ts',
  'const x = 1;',
  '```',
  '',
  '| 欄位 | 說明 |',
  '| ---- | ---- |',
  '| a | 第一 |',
];

describe('lineEditorDetector', () => {
  it('從一行一元素的檢視器重建並偵測 Markdown', () => {
    const ctx = makeCtx(lineEditorHtml(MD_LINES));
    const result = lineEditorDetector.detect(ctx);
    expect(result).toHaveLength(1);
    expect(result[0]!.kind).toBe('line-editor');
    expect(result[0]!.title).toContain('Business AI Daily');
    // 重建內容應含跨行的 markdown 結構
    expect(result[0]!.content).toContain('## 🔥 Hacker News');
    expect(result[0]!.content).toContain('```ts');
    expect(result[0]!.confidence).toBeGreaterThan(0.55);
  });

  it('透過 registry 也能偵測，且不與 in-page-block 重複', () => {
    const result = detectAll(makeCtx(lineEditorHtml(MD_LINES)));
    expect(result.some((r) => r.kind === 'line-editor')).toBe(true);
    const contents = new Set(result.map((r) => r.content));
    expect(contents.size).toBe(result.length);
  });

  it('行數不足或非 markdown 的清單不誤報', () => {
    const navLines = ['首頁', '關於', '聯絡', '產品', '部落格'];
    expect(lineEditorDetector.detect(makeCtx(lineEditorHtml(navLines)))).toHaveLength(0);
  });

  it('排除含 script/style 的容器（載入中的 bootstrap 程式碼骨架）', () => {
    // 模擬頁面載入時的容器：含 markdown 訊號的文字 + 內嵌 script/style，
    // 不應被當作 markdown 來源（否則會抓到載入中的半成品）。
    const junkChildren = [
      '<div>function () { let rootDiv = document.getElementById("root"); }</div>',
      '<style>.skeleton { background: #fff; }</style>',
      '<script>console.log("boot")</script>',
      ...Array.from({ length: 14 }, (_, i) => `<div># 假標題 ${i} \`code\` [x](http://e.com)</div>`),
    ].join('');
    const ctx = makeCtx(`<div>${junkChildren}</div>`);
    expect(lineEditorDetector.detect(ctx)).toHaveLength(0);
  });
});
