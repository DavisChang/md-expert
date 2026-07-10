import type { AutoExpandMode, MultiDocLayout, Theme } from '@/core/types';
import { DEFAULT_TARGET_LANGUAGE } from '@/core/translate/languages';

/** 使用者設定的結構與預設值。 */
export interface Settings {
  /** 設定結構版本，供未來遷移。 */
  version: number;
  /** 全域預設的自動展開行為。 */
  defaultAutoExpand: AutoExpandMode;
  /** 每網域覆寫（key 為 hostname）。 */
  perDomain: Record<string, AutoExpandMode>;
  /** 閱讀主題。 */
  theme: Theme;
  /** 多篇文件呈現方式門檻：超過此數量改用 sidepanel。 */
  multiDocThreshold: number;
  /** 多篇文件的偏好排版。 */
  multiDocLayout: MultiDocLayout;
  /** 信心門檻：低於此值不主動呈現。 */
  confidenceThreshold: number;
  /** 字級縮放（1 = 100%）。 */
  fontScale: number;
  /** 匿名使用分析（opt-in，預設關閉）。開啟後才會送出匿名互動事件。 */
  analyticsEnabled: boolean;
  /** 上次選擇的翻譯目標語言（BCP 47）。翻譯在本機進行，此欄僅記住偏好。 */
  translateTarget: string;
}

export const SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  version: SETTINGS_VERSION,
  defaultAutoExpand: 'prompt',
  perDomain: {},
  theme: 'system',
  multiDocThreshold: 3,
  multiDocLayout: 'tabs',
  confidenceThreshold: 0.5,
  fontScale: 1,
  analyticsEnabled: false,
  translateTarget: DEFAULT_TARGET_LANGUAGE,
};

/**
 * 把任意（可能是舊版或殘缺）的物件遷移/補齊成有效的 Settings。
 * 純函式，便於測試設定遷移。
 */
export function migrateSettings(raw: unknown): Settings {
  if (typeof raw !== 'object' || raw === null) {
    return { ...DEFAULT_SETTINGS };
  }
  const input = raw as Partial<Settings>;
  return {
    version: SETTINGS_VERSION,
    defaultAutoExpand: input.defaultAutoExpand ?? DEFAULT_SETTINGS.defaultAutoExpand,
    perDomain:
      typeof input.perDomain === 'object' && input.perDomain !== null
        ? { ...input.perDomain }
        : {},
    theme: input.theme ?? DEFAULT_SETTINGS.theme,
    multiDocThreshold:
      typeof input.multiDocThreshold === 'number'
        ? input.multiDocThreshold
        : DEFAULT_SETTINGS.multiDocThreshold,
    multiDocLayout: input.multiDocLayout ?? DEFAULT_SETTINGS.multiDocLayout,
    confidenceThreshold:
      typeof input.confidenceThreshold === 'number'
        ? input.confidenceThreshold
        : DEFAULT_SETTINGS.confidenceThreshold,
    fontScale:
      typeof input.fontScale === 'number' ? input.fontScale : DEFAULT_SETTINGS.fontScale,
    analyticsEnabled:
      typeof input.analyticsEnabled === 'boolean'
        ? input.analyticsEnabled
        : DEFAULT_SETTINGS.analyticsEnabled,
    translateTarget:
      typeof input.translateTarget === 'string' && input.translateTarget
        ? input.translateTarget
        : DEFAULT_SETTINGS.translateTarget,
  };
}

/** 取得某網域的有效自動展開行為（per-domain 覆寫優先）。 */
export function effectiveAutoExpand(settings: Settings, hostname: string): AutoExpandMode {
  return settings.perDomain[hostname] ?? settings.defaultAutoExpand;
}
