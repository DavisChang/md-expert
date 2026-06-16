import type { MarkdownSource } from '@/core/types';
import type { DetectContext, Detector } from './detector';
import { rawPageDetector } from './rawPage';
import { rawRemoteDetector } from './rawRemote';
import { fileUrlDetector } from './fileUrl';
import { lineEditorDetector } from './lineEditor';
import { inPageBlocksDetector } from './inPageBlocks';

/**
 * 偵測策略註冊表。順序代表優先權：
 * 較專一、信心高的整頁類型在前，最易誤報的頁內區塊在最後。
 * 新增來源只要實作 Detector 並加進這個陣列即可——對應架構的「可插拔偵測」。
 */
export const detectors: Detector[] = [
  fileUrlDetector,
  rawRemoteDetector,
  rawPageDetector,
  lineEditorDetector,
  inPageBlocksDetector,
];

export interface DetectOptions {
  /** 低於此信心的結果會被濾掉。 */
  threshold?: number;
}

/** 正規化內容開頭作為去重 key：壓縮空白、取前段。 */
function headKey(content: string): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, 120);
}

/**
 * 跑完所有 detector，合併、去重、依信心排序。
 * 純函式（除了讀傳入的 doc），便於測試。
 *
 * 去重策略：不同 detector 可能抓到「同一份文件的不同呈現」（例如 GitHub 同時有
 * 虛擬化的可見行與藏在 textarea 的完整原文；或 line-editor 與 in-page-block 重疊）。
 * 以正規化開頭為 key，**保留內容最長者**——通常即最完整的來源（如完整 textarea）。
 */
export function detectAll(ctx: DetectContext, options: DetectOptions = {}): MarkdownSource[] {
  const threshold = options.threshold ?? 0.4;
  const found: MarkdownSource[] = [];
  for (const detector of detectors) {
    found.push(...detector.detect(ctx));
  }

  const byHead = new Map<string, MarkdownSource>();
  for (const s of found) {
    const key = headKey(s.content);
    const existing = byHead.get(key);
    if (!existing || s.content.length > existing.content.length) {
      byHead.set(key, s);
    }
  }

  // 片段抑制：某些檢視器（如 GitHub 虛擬化）會把同一份文件切成多個容器，
  // 產生彼此為「子字串」的重複片段。由長到短檢查，丟棄已被更長文件包含者。
  const candidates = [...byHead.values()]
    .filter((s) => s.confidence >= threshold)
    .sort((a, b) => b.content.length - a.content.length);

  const kept: MarkdownSource[] = [];
  const keptNorm: string[] = [];
  for (const s of candidates) {
    const norm = s.content.replace(/\s+/g, ' ').trim();
    if (keptNorm.some((k) => k.includes(norm))) continue; // 已被更長文件包含 → 片段，丟棄
    kept.push(s);
    keptNorm.push(norm);
  }

  return kept.sort((a, b) => b.confidence - a.confidence);
}

/** 從目前的 window/document 建立 DetectContext。 */
export function contextFromDocument(doc: Document = document): DetectContext {
  return {
    url: doc.location?.href ?? location.href,
    contentType: doc.contentType ?? 'text/html',
    doc,
  };
}
