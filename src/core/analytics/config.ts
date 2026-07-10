/**
 * Google Analytics 4（Measurement Protocol）設定。
 *
 * 採 Measurement Protocol 而非 gtag.js——MV3 禁止載入遠端程式碼（gtag.js 會被商店拒絕），
 * 改由 background service worker 以 fetch() 送事件至 GA4，符合規範。
 *
 * 注意：apiSecret 內嵌於用戶端是 client-side 分析的本質限制（無法真正保密）。
 * 預設為空字串 → 不送任何事件；填入後且使用者 opt-in 才會啟用。
 * 取得方式：GA4 管理 → 資料串流 → 你的串流 → Measurement Protocol API secrets。
 */
export const ANALYTICS = {
  measurementId: 'G-S1SX0QF5V3',
  // GA4 Measurement Protocol API secret。client-side 分析的本質：會內嵌於 bundle（公開）。
  // 若遭濫用（假事件），於 GA4 管理 → 資料串流 → Measurement Protocol 重新產生即可。
  apiSecret: 'Ck0h3Af-RZK-IJ4hs23_Yw',
  endpoint: 'https://www.google-analytics.com/mp/collect',
} as const;

/** 事件名稱（GA4 規範：snake_case、<=40 字元）。集中管理避免拼錯。 */
export const AnalyticsEvent = {
  MarkdownDetected: 'markdown_detected',
  ReaderOpened: 'reader_opened',
  SidepanelViewed: 'sidepanel_viewed',
  ToolbarAction: 'toolbar_action',
  SettingChanged: 'setting_changed',
  ContentLiked: 'content_liked',
  ExtensionInstalled: 'extension_installed',
  TranslationUsed: 'translation_used',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];
