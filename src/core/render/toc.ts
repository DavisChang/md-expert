import { slugify } from './slug';

export interface TocItem {
  level: number; // 1~6
  text: string;
  slug: string;
}

/**
 * 從 markdown 原文擷取標題作為目錄。
 * 直接掃 ATX 標題（# ~ ######），略過程式碼圍欄內的 # 以免誤判。
 * 與 pipeline 的 anchor slug 規則共用 slugify，確保錨點一致。
 */
export function extractToc(content: string): TocItem[] {
  const lines = content.split('\n');
  const items: TocItem[] = [];
  let inFence = false;
  let fenceMarker = '';

  for (const line of lines) {
    const fence = line.match(/^\s*(```+|~~~+)/);
    if (fence?.[1]) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fence[1][0]!;
      } else if (fence[1][0] === fenceMarker) {
        inFence = false;
      }
      continue;
    }
    if (inFence) continue;

    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (m?.[1] && m[2]) {
      const text = m[2].trim();
      items.push({ level: m[1].length, text, slug: slugify(text) });
    }
  }

  return items;
}
