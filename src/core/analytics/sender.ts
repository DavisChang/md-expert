import { isRuntimeMessage } from '@/core/messaging/types';
import { loadSettings } from '@/core/store/settings';
import { ANALYTICS } from './config';
import type { EventParams } from './track';

/**
 * background 端的 GA4 Measurement Protocol 送出器。
 * 唯一實際發出網路請求的地方；嚴格遵守 opt-in 與「未設定 secret 不送」。
 */

const CLIENT_ID_KEY = 'analytics_client_id';

/** 取得（或建立並保存）匿名 client_id，存於本機。 */
async function getClientId(): Promise<string> {
  const result = await chrome.storage.local.get(CLIENT_ID_KEY);
  let id = result[CLIENT_ID_KEY] as string | undefined;
  if (!id) {
    id = crypto.randomUUID();
    await chrome.storage.local.set({ [CLIENT_ID_KEY]: id });
  }
  return id;
}

/**
 * 送出單一事件。多重保險：
 * 1) 未填 apiSecret → 不送；2) 使用者未 opt-in → 不送；3) 任何錯誤靜默忽略。
 */
export async function sendEvent(name: string, params: EventParams = {}): Promise<void> {
  if (!ANALYTICS.apiSecret) return;
  const settings = await loadSettings();
  if (!settings.analyticsEnabled) return;

  try {
    const clientId = await getClientId();
    const url = `${ANALYTICS.endpoint}?measurement_id=${encodeURIComponent(
      ANALYTICS.measurementId,
    )}&api_secret=${encodeURIComponent(ANALYTICS.apiSecret)}`;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name, params: { ...params, engagement_time_msec: 1 } }],
      }),
    });
  } catch {
    /* 分析失敗絕不影響擴充功能 */
  }
}

/** 在 background 註冊 md:track 訊息處理（其他情境透過 track() 送來）。 */
export function initAnalytics(): void {
  chrome.runtime.onMessage.addListener((message) => {
    if (!isRuntimeMessage(message) || message.type !== 'md:track') return;
    void sendEvent(message.name, message.params);
  });
}
