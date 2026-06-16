import {
  isRuntimeMessage,
  type DocsMessage,
  type GetDocsResponse,
} from '@/core/messaging/types';
import { initAnalytics, sendEvent } from '@/core/analytics/sender';
import { AnalyticsEvent } from '@/core/analytics/config';

// 註冊匿名分析（md:track）處理；實際是否送出取決於使用者 opt-in 與是否設定 API secret。
initAnalytics();

/**
 * 背景 service worker：
 * - 維護每個分頁的偵測數量 -> 更新 action badge。
 * - 快取最近的文件清單，供 side panel 開啟時讀取。
 * - 處理整頁載入（tabs.onUpdated）時請 content script 重新偵測（後備）。
 */

const docsByTab = new Map<number, DocsMessage['docs']>();

function setBadge(tabId: number, count: number) {
  const text = count > 0 ? String(count) : '';
  void chrome.action.setBadgeText({ tabId, text });
  if (count > 0) {
    void chrome.action.setBadgeBackgroundColor({ tabId, color: '#0969da' });
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!isRuntimeMessage(message)) return;
  const tabId = sender.tab?.id;

  if (message.type === 'md:detected' && tabId != null) {
    setBadge(tabId, message.count);
  }

  if (message.type === 'md:docs' && tabId != null) {
    docsByTab.set(tabId, message.docs);
    // 轉發給可能開啟的 side panel。
    void chrome.runtime.sendMessage(message).catch(() => {});
  }
});

// 提供 side panel 主動拉取目前分頁文件的管道。
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isRuntimeMessage(message) || message.type !== 'md:get-docs') return undefined;
  const response: GetDocsResponse = { docs: docsByTab.get(message.tabId) ?? [] };
  sendResponse(response);
  return true;
});

// 整頁載入完成時，content script 會自行偵測；這裡僅清掉舊 badge 快取。
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    docsByTab.delete(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  docsByTab.delete(tabId);
});

// 點 action 圖示時開啟 side panel（多篇閱讀）；並上報安裝/更新事件。
chrome.runtime.onInstalled.addListener((details) => {
  void chrome.sidePanel
    ?.setPanelBehavior?.({ openPanelOnActionClick: true })
    .catch(() => {});
  void sendEvent(AnalyticsEvent.ExtensionInstalled, { reason: details.reason });
});
