import { describe, expect, it } from 'vitest';
import { detectAll } from './registry';
import type { DetectContext } from './detector';

/** 用 jsdom 建一個假的 document 與 context。 */
function ctx(html: string, url: string, contentType = 'text/html'): DetectContext {
  const doc = document.implementation.createHTMLDocument('test');
  doc.body.innerHTML = html;
  return { url, contentType, doc };
}

const SAMPLE = `# 專案說明

這是 **Markdown**，含 [連結](https://e.com)。

- 項目
- 項目

\`\`\`ts
const x = 1;
\`\`\``;

describe('detectAll', () => {
  it('偵測 raw .md 純文字頁', () => {
    const result = detectAll(ctx(`<pre>${SAMPLE}</pre>`, 'https://x.com/readme.md', 'text/plain'));
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.kind).toBe('raw-page');
    expect(result[0]!.title).toBe('專案說明');
  });

  it('偵測 GitHub raw 連結並標記 raw-remote', () => {
    const result = detectAll(
      ctx(`<pre>${SAMPLE}</pre>`, 'https://raw.githubusercontent.com/u/r/main/README.md', 'text/plain'),
    );
    expect(result.some((r) => r.kind === 'raw-remote')).toBe(true);
    expect(result[0]!.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('偵測 file:// 本地 md', () => {
    const result = detectAll(ctx(`<pre>${SAMPLE}</pre>`, 'file:///Users/x/notes.md', 'text/plain'));
    expect(result.some((r) => r.kind === 'file-url')).toBe(true);
  });

  it('一般 HTML 頁面中的 markdown 區塊', () => {
    const html = `<article>內容</article><pre>${SAMPLE}</pre>`;
    const result = detectAll(ctx(html, 'https://blog.example.com/post', 'text/html'));
    expect(result.some((r) => r.kind === 'in-page-block')).toBe(true);
  });

  it('純 HTML 內容不誤報', () => {
    const result = detectAll(ctx('<p>就是一般網頁，沒有 markdown。</p>', 'https://e.com', 'text/html'));
    expect(result).toHaveLength(0);
  });

  it('整頁命中時不重複輸出頁內區塊', () => {
    const result = detectAll(ctx(`<pre>${SAMPLE}</pre>`, 'https://x.com/a.md', 'text/plain'));
    // 同內容只應出現一次
    const contents = new Set(result.map((r) => r.content));
    expect(contents.size).toBe(result.length);
  });

  it('GitHub 式：虛擬化可見行 + 完整隱藏 textarea，保留最完整來源', () => {
    // react-code-lines 只渲染前幾行（虛擬化），完整原文在隱藏 textarea。
    const fullSource = `${SAMPLE}\n\n## 更多章節\n\n更多內容讓 textarea 明顯比可見行長。\n\n- 補充一\n- 補充二\n- 補充三`;
    const visibleLines = SAMPLE.split('\n')
      .slice(0, 14)
      .map((l) => `<div>${l || '&nbsp;'}</div>`)
      .join('');
    const html = `
      <div class="react-code-lines">${visibleLines}</div>
      <textarea id="read-only-cursor-text-area">${fullSource}</textarea>
    `;
    const result = detectAll(ctx(html, 'https://github.com/o/r/blob/main/README.md?plain=1'));
    expect(result.length).toBeGreaterThanOrEqual(1);
    // 應保留完整 textarea 內容（最長），而非虛擬化的片段
    expect(result[0]!.content).toContain('## 更多章節');
    expect(result[0]!.content).toContain('補充三');
  });

  it('抑制虛擬化片段：子字串重複的文件不重複出現', () => {
    // 模擬 GitHub 虛擬化：完整 README + 兩個是其子字串的片段容器。
    const full = `# 完整文件\n\n${'內容段落，含 **粗體** 與 [連結](https://e.com)。\n\n'.repeat(8)}- 清單\n- 清單\n\n\`\`\`ts\nconst x=1;\n\`\`\``;
    const frag1 = full.slice(40, 400);
    const frag2 = full.slice(200, 600);
    const lines = (s: string) =>
      s.split('\n').map((l) => `<li>${l || '&nbsp;'}</li>`).join('');
    const html = `
      <ol>${lines(full)}</ol>
      <ol>${lines(frag1)}</ol>
      <ol>${lines(frag2)}</ol>
    `;
    const result = detectAll(ctx(html, 'https://github.com/o/r/blob/main/X.md?plain=1'));
    // 片段被吸收，只留最完整的一份
    expect(result).toHaveLength(1);
    expect(result[0]!.content).toContain('# 完整文件');
  });
});
