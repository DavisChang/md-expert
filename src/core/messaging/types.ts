/**
 * content script ↔ background ↔ sidepanel 之間的型別化訊息協定。
 * 所有跨 context 的訊息都必須是這裡定義的其中一種。
 */
import type { MarkdownSource } from '@/core/types';

/** content script -> background：本頁偵測結果摘要。 */
export interface DetectedMessage {
  type: 'md:detected';
  count: number;
  url: string;
}

/** background -> content：請求重新偵測（換頁時）。 */
export interface RedetectMessage {
  type: 'md:redetect';
}

/** content -> sidepanel：推送目前的多篇文件供側欄呈現。 */
export interface DocsMessage {
  type: 'md:docs';
  docs: Array<Pick<MarkdownSource, 'id' | 'title' | 'content' | 'kind'>>;
}

/** sidepanel/popup -> content：要求開啟/切換閱讀視圖。 */
export interface ToggleReaderMessage {
  type: 'md:toggle-reader';
  open?: boolean;
}

/** sidepanel -> background：拉取指定分頁目前快取的文件。 */
export interface GetDocsMessage {
  type: 'md:get-docs';
  tabId: number;
}

/** background 對 GetDocsMessage 的回應。 */
export interface GetDocsResponse {
  docs: DocsMessage['docs'];
}

/** 任一情境 -> background：上報一個匿名分析事件（僅在使用者 opt-in 時實際送出）。 */
export interface TrackMessage {
  type: 'md:track';
  name: string;
  params?: Record<string, string | number>;
}

export type RuntimeMessage =
  | DetectedMessage
  | RedetectMessage
  | DocsMessage
  | ToggleReaderMessage
  | GetDocsMessage
  | TrackMessage;

/** 型別守衛，縮小 unknown 訊息。 */
export function isRuntimeMessage(value: unknown): value is RuntimeMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { type?: unknown }).type === 'string' &&
    (value as { type: string }).type.startsWith('md:')
  );
}
