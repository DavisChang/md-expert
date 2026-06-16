/**
 * 程式碼高亮。
 *
 * 設計取捨：shiki 為非同步且體積較大。為了讓渲染管線維持同步、首屏快、bundle 小，
 * 預設只做「安全跳脫 + 標記語言 class」，由 CSS 提供基本可讀樣式。
 * 進階的 shiki 高亮留待第二階段以非同步 enhance 方式套用（不阻塞首次渲染）。
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c] ?? c);
}

/**
 * 給 markdown-it 用的 highlight callback。
 * 回傳已含 <pre><code> 外層的 HTML，markdown-it 便不會再包一層。
 */
export function highlightCode(code: string, lang: string): string {
  const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
  const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : '';
  return `<pre class="mdx-code"${langAttr}><code${cls}>${escapeHtml(code)}</code></pre>`;
}
