import MarkdownIt from 'markdown-it';
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';
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

function mathBlock(state: StateBlock, startLine: number, _endLine: number, silent: boolean): boolean {
  const start = state.bMarks[startLine]! + state.tShift[startLine]!;
  const max = state.eMarks[startLine]!;
  const firstLine = state.src.slice(start, max).trim();
  if (!firstLine.startsWith('$$')) return false;
  if (silent) return true;

  const firstContent = firstLine.slice(2);
  const lines: string[] = [];
  let nextLine = startLine + 1;

  if (firstContent.endsWith('$$') && firstContent.length > 2) {
    lines.push(firstContent.slice(0, -2));
  } else {
    if (firstContent) lines.push(firstContent);
    for (; nextLine < state.lineMax; nextLine++) {
      const line = state.src
        .slice(state.bMarks[nextLine]! + state.tShift[nextLine]!, state.eMarks[nextLine]!)
        .trim();
      if (line.endsWith('$$')) {
        lines.push(line.slice(0, -2));
        break;
      }
      lines.push(line);
    }
  }

  const token = state.push('math_block', 'div', 0);
  token.block = true;
  token.content = lines.join('\n').trim();
  token.markup = '$$';
  state.line = nextLine + 1;
  return true;
}

function mathInline(state: StateInline, silent: boolean): boolean {
  if (state.src.charCodeAt(state.pos) !== 0x24 || state.src.charCodeAt(state.pos + 1) === 0x24) {
    return false;
  }
  if (state.pos > 0 && state.src.charCodeAt(state.pos - 1) === 0x5c) return false;

  let end = state.pos + 1;
  while ((end = state.src.indexOf('$', end)) !== -1) {
    if (state.src.charCodeAt(end - 1) !== 0x5c) break;
    end++;
  }
  if (end === -1 || end === state.pos + 1) return false;
  if (silent) return true;

  const token = state.push('math_inline', 'span', 0);
  token.content = state.src.slice(state.pos + 1, end);
  token.markup = '$';
  state.pos = end + 1;
  return true;
}

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
  md.block.ruler.before('fence', 'math_block', mathBlock);
  md.inline.ruler.before('escape', 'math_inline', mathInline);
  md.renderer.rules.math_inline = (tokens, idx) =>
    `<span class="mdx-math" data-display="false">${escapeHtml(tokens[idx]!.content)}</span>`;
  md.renderer.rules.math_block = (tokens, idx) =>
    `<div class="mdx-math mdx-math-block" data-display="true">${escapeHtml(tokens[idx]!.content)}</div>`;
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
