import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import taskLists from 'markdown-it-task-lists';
import { sanitizeHtml } from './sanitize';
import { escapeHtml, highlightCode } from './highlight';
import { extractToc, type TocItem } from './toc';
import { slugify } from './slug';

export interface RenderResult {
  /** 已淨化、可安全注入的 HTML。 */
  html: string;
  /** 目錄項目（來自標題）。 */
  toc: TocItem[];
}

export { slugify };

let md: MarkdownIt | null = null;

/** 取得（並快取）設定好的 markdown-it 實例。 */
function getRenderer(): MarkdownIt {
  if (md) return md;
  md = new MarkdownIt({
    html: true, // 允許 raw HTML，但**輸出一定會經過 DOMPurify**
    linkify: true,
    typographer: true,
    breaks: false,
    highlight: highlightCode,
  });
  md.use(anchor, {
    slugify,
    permalink: anchor.permalink.headerLink(),
  });
  md.use(taskLists, { enabled: true, label: true });
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]!;
    const lang = token.info.trim().split(/\s+/, 1)[0]?.toLowerCase();
    if (lang === 'mermaid') {
      return `<pre class="mdx-mermaid"><code>${escapeHtml(token.content)}</code></pre>`;
    }
    return defaultFence?.(tokens, idx, options, env, self) ?? self.renderToken(tokens, idx, options);
  };
  return md;
}

/**
 * 核心渲染：markdown -> { 安全 HTML, 目錄 }。
 * 純函式（不碰 chrome.* 或注入 DOM），便於單元測試。
 */
export function renderMarkdown(content: string): RenderResult {
  const renderer = getRenderer();
  const rawHtml = renderer.render(content);
  const html = sanitizeHtml(rawHtml);
  const toc = extractToc(content);
  return { html, toc };
}
