/** 單筆語言偵測結果。 */
export interface LanguageDetection {
  language: string;
  confidence: number;
}

/** 偵測結果的預設信心門檻，低於此值視為不可靠。 */
export const DEFAULT_DETECT_CONFIDENCE = 0.5;

/**
 * 從偵測結果挑最高信心的語言；排除 'und'（未定），低於門檻回 null。
 * 純函式，便於單元測試。
 */
export function pickSourceLanguage(
  detections: LanguageDetection[],
  minConfidence: number = DEFAULT_DETECT_CONFIDENCE,
): string | null {
  let best: LanguageDetection | null = null;
  for (const d of detections) {
    if (!d.language || d.language === 'und') continue;
    if (!best || d.confidence > best.confidence) best = d;
  }
  if (!best || best.confidence < minConfidence) return null;
  return best.language;
}

/** 取語言碼的基礎語言（忽略地區/字集），如 zh-Hant → zh。 */
export function baseLanguage(code: string): string {
  return code.toLowerCase().split('-')[0] ?? code.toLowerCase();
}

/** 兩個語言碼是否為同一語言（基礎語言相同即視為同語言）。 */
export function isSameLanguage(a: string, b: string): boolean {
  return baseLanguage(a) === baseLanguage(b);
}
