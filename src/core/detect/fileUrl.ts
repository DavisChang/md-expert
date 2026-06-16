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
 * 偵測本地 file:// 開啟的 .md 檔。
 * 需使用者在擴充頁開啟「允許存取檔案網址」，否則 content script 不會注入。
 */
export const fileUrlDetector: Detector = {
  kind: 'file-url',
  detect(ctx: DetectContext): MarkdownSource[] {
    if (!ctx.url.startsWith('file://')) return [];
    if (!MD_EXT_RE.test(ctx.url)) return [];

    const body = ctx.doc.body;
    const pre = body?.querySelector('pre');
    const text = (pre?.textContent ?? body?.textContent ?? '').trim();
    if (text.length < 1) return [];

    const { confidence } = scoreMarkdown(text);
    const fallback = fileNameFromUrl(ctx.url);
    return [
      {
        id: hashId('file', ctx.url),
        kind: 'file-url',
        content: text,
        title: inferTitle(text, fallback),
        confidence: Math.max(confidence, 0.8),
        element: pre ?? body ?? undefined,
      },
    ];
  },
};
