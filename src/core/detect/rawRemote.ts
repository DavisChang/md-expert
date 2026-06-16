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

/** 已知會直接吐原始檔內容的 raw host / 路徑樣式。 */
const RAW_HOST_RE =
  /(^|\.)(raw\.githubusercontent\.com|raw\.github\.com|gist\.githubusercontent\.com)$/i;
const RAW_PATH_RE = /\/-\/raw\/|\/raw\/(refs\/heads\/)?/i; // GitLab 的 /-/raw/、Bitbucket 的 /raw/

/**
 * 偵測 GitHub/GitLab 等的「raw 檔案」連結。
 * 這類頁面通常也是 text/plain，但我們用 host/path 樣式提高信心並標記來源。
 */
export const rawRemoteDetector: Detector = {
  kind: 'raw-remote',
  detect(ctx: DetectContext): MarkdownSource[] {
    let host = '';
    try {
      host = new URL(ctx.url).hostname;
    } catch {
      return [];
    }

    const isRawHost = RAW_HOST_RE.test(host);
    const isRawPath = RAW_PATH_RE.test(ctx.url);
    if (!isRawHost && !isRawPath) return [];
    if (!MD_EXT_RE.test(ctx.url)) return [];

    const body = ctx.doc.body;
    const pre = body?.querySelector('pre');
    const text = (pre?.textContent ?? body?.textContent ?? '').trim();
    if (text.length < 8) return [];

    const { confidence } = scoreMarkdown(text);
    const fallback = fileNameFromUrl(ctx.url);
    return [
      {
        id: hashId('remote', ctx.url),
        kind: 'raw-remote',
        content: text,
        title: inferTitle(text, fallback),
        // raw + .md 副檔名 = 強烈意圖，給高信心下限。
        confidence: Math.max(confidence, 0.8),
        element: pre ?? body ?? undefined,
      },
    ];
  },
};
