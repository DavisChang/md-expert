/** 目標語言選項。 */
export interface LanguageOption {
  /** BCP 47 語言碼。 */
  code: string;
  /** 選單顯示名稱（用該語言的原生寫法）。 */
  label: string;
}

/** 預設目標語言：專案主要受眾為繁中使用者。 */
export const DEFAULT_TARGET_LANGUAGE = 'zh-Hant';

/**
 * MVP 首批支援的目標語言（皆以英文為樞紐，Chrome Translator 支援）。
 * 實際能否翻譯仍以 `availability()` 為準。
 */
export const TARGET_LANGUAGES: readonly LanguageOption[] = [
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

/** 是否為支援的目標語言碼。 */
export function isSupportedTarget(code: string): boolean {
  return TARGET_LANGUAGES.some((l) => l.code === code);
}

/** 把任意值收斂成有效的目標語言碼（不支援則回預設）。 */
export function normalizeTarget(code: unknown): string {
  return typeof code === 'string' && isSupportedTarget(code) ? code : DEFAULT_TARGET_LANGUAGE;
}
