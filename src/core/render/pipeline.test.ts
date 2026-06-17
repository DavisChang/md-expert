import { describe, expect, it } from 'vitest';
import { renderMarkdown, slugify } from './pipeline';

describe('renderMarkdown', () => {
  it('渲染標題、清單、連結', () => {
    const { html } = renderMarkdown('# Hi\n\n- a\n- b\n\n[x](https://e.com)');
    expect(html).toContain('<h1');
    expect(html).toContain('<li>a</li>');
    expect(html).toContain('href="https://e.com"');
  });

  it('外連連結加上 target/rel 安全屬性', () => {
    const { html } = renderMarkdown('[x](https://e.com)');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  it('淨化掉 script 標籤（XSS 防護）', () => {
    const { html } = renderMarkdown('正常\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
  });

  it('不產生可點擊的 javascript: 連結', () => {
    // markdown-it 本身拒絕危險 scheme，DOMPurify 為第二道防線；
    // 重點是最終 HTML 不存在帶 javascript: 的可執行連結。
    const { html } = renderMarkdown('[bad](javascript:alert(1))');
    expect(html).not.toMatch(/href\s*=\s*["']?\s*javascript:/i);
    expect(html).not.toContain('<a');
  });

  it('程式碼圍欄加上語言 class', () => {
    const { html } = renderMarkdown('```js\nconst x=1;\n```');
    expect(html).toContain('language-js');
    expect(html).toContain('mdx-code');
  });

  it('Mermaid 圍欄輸出待渲染區塊', () => {
    const { html } = renderMarkdown('```mermaid\ngraph TD\n  A-->B\n```');
    expect(html).toContain('class="mdx-mermaid"');
    expect(html).toContain('A--&gt;B');
  });

  it('LaTeX inline 與 block 輸出待渲染區塊', () => {
    const { html } = renderMarkdown('Inline $x^2$.\n\n$$\nE=mc^2\n$$');
    expect(html).toContain('class="mdx-math" data-display="false"');
    expect(html).toContain('class="mdx-math mdx-math-block" data-display="true"');
    expect(html).toContain('E=mc^2');
  });

  it('產生目錄並與標題錨點一致', () => {
    const { html, toc } = renderMarkdown('# Hello World\n\n## 次標題');
    expect(toc).toHaveLength(2);
    expect(toc[0]).toMatchObject({ level: 1, text: 'Hello World' });
    expect(html).toContain(`id="${toc[0]!.slug}"`);
  });
});

describe('slugify', () => {
  it('英文標題轉小寫連字號', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('保留中日韓字元', () => {
    expect(slugify('安裝指南')).toBe('安裝指南');
  });
});
