import type { TrackMessage } from '@/core/messaging/types';

/** 事件參數值型別（GA4 只接受字串/數字）。 */
export type EventParams = Record<string, string | number>;

/**
 * 用戶端追蹤：把事件送到 background service worker 統一處理（檢查 opt-in 後才上報）。
 * 可在 content script / sidepanel / options / popup 任一情境呼叫，fire-and-forget、永不丟錯。
 * 隱私：呼叫端**不得**傳入網頁內容、網址或任何個資，只送匿名互動。
 */
export function track(name: string, params?: EventParams): void {
  try {
    const message: TrackMessage = { type: 'md:track', name, params };
    void chrome.runtime.sendMessage(message).catch(() => {});
  } catch {
    /* 背景未就緒等情況一律忽略 */
  }
}
