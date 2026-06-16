import type { MarkdownSource } from '@/core/types';
import { scoreMarkdown } from './heuristics';
import { type DetectContext, type Detector, hashId, inferTitle } from './detector';

/** 可能裝有原始 markdown 的容器選擇器。 */
const CANDIDATE_SELECTOR = [
  'pre',
  'textarea',
  'code.language-markdown',
  'code.language-md',
  '[data-language="markdown"]',
].join(',');

/** 同頁內可呈現的最多區塊數，避免在大型頁面爆量。 */
const MAX_BLOCKS = 12;
/** 區塊內文字下限，過短不值得渲染。 */
const MIN_LEN = 40;
/** 頁內區塊需較高門檻，避免把一般程式碼/純文字誤判。 */
const BLOCK_THRESHOLD = 0.6;

/**
 * 偵測「一般網頁中嵌入的 markdown 區塊」：
 * 例如文件站把 markdown 原文放在 <pre>，或編輯器的 <textarea>。
 * 這是最容易誤報的來源，故門檻最高，且整頁已被 raw-page 命中時不重複。
 */
export const inPageBlocksDetector: Detector = {
  kind: 'in-page-block',
  detect(ctx: DetectContext): MarkdownSource[] {
    // 整頁就是純文字 markdown 時，交給 rawPage 處理，這裡略過避免重複。
    if (ctx.contentType.startsWith('text/plain')) return [];

    const nodes = Array.from(ctx.doc.querySelectorAll(CANDIDATE_SELECTOR));
    const results: MarkdownSource[] = [];

    for (const el of nodes) {
      if (results.length >= MAX_BLOCKS) break;
      const text =
        (el as HTMLTextAreaElement).value?.trim() || (el.textContent ?? '').trim();
      if (text.length < MIN_LEN) continue;

      const { confidence } = scoreMarkdown(text);
      if (confidence < BLOCK_THRESHOLD) continue;

      results.push({
        id: hashId('block', `${ctx.url}::${text.slice(0, 64)}`),
        kind: 'in-page-block',
        content: text,
        title: inferTitle(text, `區塊 ${results.length + 1}`),
        confidence,
        element: el,
      });
    }

    return results;
  },
};
