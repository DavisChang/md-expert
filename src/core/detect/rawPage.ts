import type { MarkdownSource } from '@/core/types';
import { scoreMarkdown } from './heuristics';
import {
  type DetectContext,
  type Detector,
  fileNameFromUrl,
  hashId,
  inferTitle,
} from './detector';
import { MD_EXT_RE } from './constants';

/**
 * 偵測「整頁就是一份原始 Markdown」的情況：
 * 瀏覽器以 text/plain 開啟 .md 檔時，body 內常只有一個 <pre> 或純文字。
 */
export const rawPageDetector: Detector = {
  kind: 'raw-page',
  detect(ctx: DetectContext): MarkdownSource[] {
    const isPlain = ctx.contentType.startsWith('text/plain');
    const hasMdExt = MD_EXT_RE.test(ctx.url);

    // 只在「副檔名像 md」或「整頁是 text/plain」時才考慮整頁模式。
    if (!isPlain && !hasMdExt) return [];

    const body = ctx.doc.body;
    if (!body) return [];

    // text/plain 頁面 Chrome 會包一層 <pre>；否則退而取整個 body 文字。
    const pre = body.querySelector('pre');
    const text = (pre?.textContent ?? body.textContent ?? '').trim();
    if (text.length < 8) return [];

    const { confidence } = scoreMarkdown(text);
    // 副檔名明確時給信心加成（即使內容本身訊號少，使用者意圖明顯）。
    const finalConfidence = hasMdExt ? Math.max(confidence, 0.75) : confidence;
    if (finalConfidence < 0.4) return [];

    const fallback = fileNameFromUrl(ctx.url);
    return [
      {
        id: hashId('raw', ctx.url),
        kind: 'raw-page',
        content: text,
        title: inferTitle(text, fallback),
        confidence: finalConfidence,
        element: pre ?? body,
      },
    ];
  },
};
