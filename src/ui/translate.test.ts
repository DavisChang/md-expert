import { describe, expect, it } from 'vitest';
import { collectTranslatableNodes, translateArticle } from './translate';

/** 反轉字元的假翻譯器（可辨識、可逆，便於斷言）。 */
const reverseHandle = {
  translate: async (text: string) => text.split('').reverse().join(''),
};

function makeArticle(html: string): HTMLElement {
  const el = document.createElement('article');
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

describe('collectTranslatableNodes', () => {
  it('翻譯內文、跳過程式碼/數學/Mermaid', () => {
    const article = makeArticle(`
      <h1><a href="#x">Hello Title</a></h1>
      <p>A paragraph of text.</p>
      <pre class="mdx-code"><code class="language-ts">const x = 1;</code></pre>
      <p>Inline <code>skipMe()</code> stays.</p>
      <div class="mdx-math" data-display="true">E = mc^2</div>
      <div class="mdx-mermaid"><svg>graph TD; A-->B;</svg></div>
      <p>Visit <a href="https://ex.com">https://ex.com</a> now.</p>
    `);
    const texts = collectTranslatableNodes(article).map((n) => n.nodeValue?.trim());
    expect(texts).toContain('Hello Title');
    expect(texts).toContain('A paragraph of text.');
    expect(texts.some((t) => t?.includes('stays'))).toBe(true);
    // 跳過項
    expect(texts.join('|')).not.toContain('const x = 1;');
    expect(texts.join('|')).not.toContain('skipMe');
    expect(texts.join('|')).not.toContain('mc^2');
    expect(texts.join('|')).not.toContain('graph TD');
    // 純網址節點不翻譯，但含字母的「Visit ... now.」要翻
    expect(texts).not.toContain('https://ex.com');
  });
});

describe('translateArticle', () => {
  it('就地翻譯並可切回原文', async () => {
    const article = makeArticle('<p>Hello</p><p>World</p><pre><code>keep()</code></pre>');
    const ctrl = await translateArticle(article, reverseHandle);

    expect(article.querySelector('p')!.textContent).toBe('olleH');
    expect(article.querySelectorAll('p')[1]!.textContent).toBe('dlroW');
    // 程式碼不動
    expect(article.querySelector('code')!.textContent).toBe('keep()');

    ctrl.showOriginal();
    expect(article.querySelector('p')!.textContent).toBe('Hello');
    expect(article.querySelectorAll('p')[1]!.textContent).toBe('World');

    ctrl.showTranslation();
    expect(article.querySelector('p')!.textContent).toBe('olleH');
  });

  it('回報進度', async () => {
    const article = makeArticle('<p>aaa</p><p>bbb</p><p>ccc</p>');
    const progress: number[] = [];
    await translateArticle(article, reverseHandle, {
      onProgress: (done) => progress.push(done),
    });
    expect(progress.at(-1)).toBe(3);
  });
});
