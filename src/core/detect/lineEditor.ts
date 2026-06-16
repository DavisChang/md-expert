import type { MarkdownSource } from '@/core/types';
import { scoreMarkdown } from './heuristics';
import {
  type DetectContext,
  type Detector,
  fileNameFromUrl,
  hashId,
  inferTitle,
} from './detector';

/**
 * 偵測「以一行一元素呈現原始 Markdown」的線上檢視器/編輯器，
 * 例如 Dropbox 預覽、CodeMirror、Monaco 等。這類頁面把每一行放進獨立的
 * <li>/<div>，沒有單一 <pre> 容器，且 class 名稱常為 hash（會隨部署改變），
 * 因此**不能**靠 class 比對。改用結構特徵：
 *   一個容器有大量「單行高度」的子元素，把子元素文字以換行接回即為全文。
 */

/** 觸發判定所需的最少行數。 */
const MIN_LINES = 12;
/** 單一子元素被視為「一行」的高度上限（px）。 */
const LINE_MAX_HEIGHT = 60;
/** 重建後的文字需達此信心才採用（高於頁內區塊，避免誤報）。 */
const THRESHOLD = 0.55;
/** 掃描的候選容器上限，控制大頁面成本。 */
const MAX_CANDIDATES = 250;

/** 零寬字元：BOM(U+FEFF) 與 ZWSP(U+200B)，部分編輯器會插入。以 escape 建構避免原始碼含隱形字元。 */
const ZERO_WIDTH = new RegExp('[\\uFEFF\\u200B]', 'g');

export const lineEditorDetector: Detector = {
  kind: 'line-editor',
  detect(ctx: DetectContext): MarkdownSource[] {
    // 整頁純文字交給 raw-page。
    if (ctx.contentType.startsWith('text/plain')) return [];

    const candidates = ctx.doc.querySelectorAll('ol, ul, div');
    let best: { content: string; confidence: number } | null = null;
    let examined = 0;

    for (const el of candidates) {
      const kids = el.children;
      const n = kids.length;
      if (n < MIN_LINES || n > 8000) continue;
      if (examined++ > MAX_CANDIDATES) break;

      // 行高判定：在有版面資訊時（真實瀏覽器），要求多數子元素為單行高度。
      // jsdom 等無版面環境 offsetHeight 為 0，視為「無版面資訊」而略過此檢查。
      // 同時排除含 script/style/noscript 的容器——真正的編輯器行清單不含這些，
      // 而頁面載入時的 bootstrap 腳本/CSS 骨架常被誤判為 markdown（含 code/backtick）。
      let withHeight = 0;
      let lineish = 0;
      let hasCodeAsset = false;
      for (const k of kids) {
        const tag = k.tagName;
        if (
          tag === 'SCRIPT' ||
          tag === 'STYLE' ||
          tag === 'NOSCRIPT' ||
          k.querySelector('script,style,noscript')
        ) {
          hasCodeAsset = true;
          break;
        }
        const h = (k as HTMLElement).offsetHeight;
        if (h > 0) {
          withHeight += 1;
          if (h <= LINE_MAX_HEIGHT) lineish += 1;
        }
      }
      if (hasCodeAsset) continue;
      if (withHeight > 0 && lineish / n < 0.6) continue;

      const text = Array.from(kids, (k) => k.textContent ?? '')
        .join('\n')
        .replace(ZERO_WIDTH, '')
        .trim();
      if (text.length < 60) continue;

      const { confidence } = scoreMarkdown(text);
      if (confidence < THRESHOLD) continue;

      if (
        !best ||
        confidence > best.confidence ||
        (confidence === best.confidence && text.length > best.content.length)
      ) {
        best = { content: text, confidence };
      }
    }

    if (!best) return [];
    return [
      {
        id: hashId('line', `${ctx.url}::${best.content.length}`),
        kind: 'line-editor',
        content: best.content,
        title: inferTitle(best.content, fileNameFromUrl(ctx.url)),
        confidence: best.confidence,
      },
    ];
  },
};
