import type { MarkdownSource, SourceKind } from '@/core/types';

/**
 * 偵測情境：把 detector 需要的環境資訊收斂成一個物件，
 * 讓 detector 不直接碰 global，便於單元測試（傳入假的 doc/url 即可）。
 */
export interface DetectContext {
  /** 目前頁面 URL。 */
  url: string;
  /** document.contentType（如 'text/plain'、'text/html'）。 */
  contentType: string;
  /** 頁面 document。 */
  doc: Document;
}

/** 一個偵測策略。 */
export interface Detector {
  kind: SourceKind;
  /** 回傳此策略找到的所有 markdown 來源（可能為空）。 */
  detect(ctx: DetectContext): MarkdownSource[];
}

/** 從 markdown 文字推測標題：第一個 H1，否則第一行非空文字，否則 fallback。 */
export function inferTitle(content: string, fallback: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1?.[1]) return h1[1].trim().slice(0, 80);
  const firstLine = content.split('\n').find((l) => l.trim().length > 0);
  if (firstLine) return firstLine.trim().replace(/^#+\s*/, '').slice(0, 80);
  return fallback;
}

/** 從 URL 取檔名（去除查詢字串），作為標題 fallback。 */
export function fileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : u.hostname;
  } catch {
    return 'Markdown';
  }
}

/** 穩定的非加密雜湊（FNV-1a），用於產生不依賴亂數的 id。 */
export function hashId(prefix: string, input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${prefix}-${(h >>> 0).toString(36)}`;
}
