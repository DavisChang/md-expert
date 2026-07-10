/**
 * 翻譯核心的型別定義。core 不直接碰 Web AI 全域，
 * 而是透過 provider 介面注入（實作在 `src/ui/translate.ts`），便於單元測試。
 */

/** 語言包/模型的可用狀態（對應 Chrome Translator API）。 */
export type TranslatorAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

/** 一組來源→目標語言（BCP 47，如 en / zh-Hant）。 */
export interface LanguagePair {
  source: string;
  target: string;
}

/** 已建立、可重複使用的翻譯器實例。 */
export interface TranslatorHandle {
  translate(text: string): Promise<string>;
  destroy(): void;
}

/** 翻譯能力提供者（由 UI 層以 Chrome 內建 API 實作）。 */
export interface TranslatorProvider {
  availability(pair: LanguagePair): Promise<TranslatorAvailability>;
  /** onDownload：模型下載進度 0..1。 */
  create(pair: LanguagePair, onDownload?: (loaded: number) => void): Promise<TranslatorHandle>;
}

/** 語言偵測提供者。 */
export interface LanguageDetectorProvider {
  isAvailable(): Promise<boolean>;
  detect(text: string): Promise<Array<{ language: string; confidence: number }>>;
}
