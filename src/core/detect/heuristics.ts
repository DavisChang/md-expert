/**
 * 「這段文字是否像 Markdown」的純函式評分器。
 * 不依賴 DOM 或 chrome.*，可完整單元測試。
 *
 * 設計：累加多個弱訊號（標題、清單、程式碼圍欄、連結、表格…），
 * 以文字行數正規化，再壓縮到 0~1。寧可保守——避免把純文字誤判為 markdown。
 */

const PATTERNS: Array<{ re: RegExp; weight: number }> = [
  { re: /^#{1,6}\s+\S/m, weight: 3 }, // ATX 標題
  { re: /^={3,}\s*$|^-{3,}\s*$/m, weight: 1.5 }, // Setext 底線 / 分隔線
  { re: /^\s*[-*+]\s+\S/m, weight: 2 }, // 無序清單
  { re: /^\s*\d+\.\s+\S/m, weight: 2 }, // 有序清單
  { re: /```[\s\S]*?```/, weight: 3 }, // 圍欄程式碼
  { re: /`[^`\n]+`/, weight: 1 }, // 行內程式碼
  { re: /\[[^\]]+\]\([^)]+\)/, weight: 2 }, // 連結
  { re: /!\[[^\]]*\]\([^)]+\)/, weight: 2 }, // 圖片
  { re: /^\s*>\s+\S/m, weight: 1.5 }, // 引言
  { re: /^\s*\|.+\|\s*$/m, weight: 2 }, // 表格列
  { re: /^\s*[-*]\s+\[[ xX]\]\s+/m, weight: 2 }, // 任務清單
  { re: /\*\*[^*\n]+\*\*|__[^_\n]+__/, weight: 1 }, // 粗體
];

/** HTML 標記特徵——若文字其實是整頁 HTML，應降低 markdown 信心。 */
const HTML_DOC_RE = /<(!doctype|html|head|body|div|span|script)\b/i;

export interface ScoreResult {
  score: number; // 原始加權分
  confidence: number; // 0~1
  signals: number; // 命中的訊號數
}

/**
 * 對一段文字評分。
 * @param text 候選 markdown 文字
 */
export function scoreMarkdown(text: string): ScoreResult {
  const trimmed = text.trim();
  if (trimmed.length < 8) {
    return { score: 0, confidence: 0, signals: 0 };
  }

  // 若看起來是完整 HTML 文件，幾乎不可能是要呈現的原始 markdown。
  if (HTML_DOC_RE.test(trimmed)) {
    return { score: 0, confidence: 0, signals: 0 };
  }

  let score = 0;
  let signals = 0;
  for (const { re, weight } of PATTERNS) {
    if (re.test(trimmed)) {
      score += weight;
      signals += 1;
    }
  }

  // 以「每多少字元期望出現一個 markdown 特徵」做密度修正，
  // 長文需要更多訊號才算數，短文不過度敏感。
  const lines = trimmed.split('\n').length;
  const densityBonus = Math.min(signals / Math.max(lines / 6, 1), 1);
  const adjusted = score * (0.6 + 0.4 * densityBonus);

  // 壓縮到 0~1：score 約 >=6（命中 2~3 個強訊號）即接近高信心。
  const confidence = Math.max(0, Math.min(1, adjusted / 9));

  return { score: adjusted, confidence, signals };
}

/** 便捷判斷：是否達到「主動呈現」的門檻。 */
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;

export function looksLikeMarkdown(
  text: string,
  threshold = DEFAULT_CONFIDENCE_THRESHOLD,
): boolean {
  return scoreMarkdown(text).confidence >= threshold;
}
