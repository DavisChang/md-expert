import type { Theme } from '@/core/types';

/**
 * 主題套用工具（閱讀視圖與側欄共用）。
 * 把使用者設定的主題（含 'system'）解析為實際的亮/暗/復古，並寫入 [data-theme] 屬性，
 * 由 tokens.css 依屬性切換色票。
 */

/** 將 'system' 解析為實際主題；其餘原樣回傳。 */
export function resolveTheme(theme: Theme): 'light' | 'dark' | 'sepia' {
  if (theme === 'system') {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
}

/** 將主題與字級套用到指定元素（閱讀視圖用 Shadow host、側欄用 documentElement）。 */
export function applyTheme(el: HTMLElement, theme: Theme, fontScale = 1): void {
  el.setAttribute('data-theme', resolveTheme(theme));
  el.style.setProperty('--md-font-scale', String(fontScale));
}
