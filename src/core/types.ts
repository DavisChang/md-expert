/**
 * 全專案共用的核心型別。放在 core 根層，detect/render/ui 都會引用。
 */

/** Markdown 來源的種類，對應到不同的偵測策略。 */
export type SourceKind =
  | 'raw-page'
  | 'raw-remote'
  | 'in-page-block'
  | 'line-editor'
  | 'file-url';

/** 偵測到的一份 Markdown 文件。 */
export interface MarkdownSource {
  /** 唯一識別（同頁多篇時用於分頁 key）。 */
  id: string;
  /** 來源種類。 */
  kind: SourceKind;
  /** 原始 markdown 文字。 */
  content: string;
  /** 推測的標題（取自第一個 H1 或檔名），用於分頁標籤。 */
  title: string;
  /** 0~1 的信心分數，低於門檻者不主動呈現。 */
  confidence: number;
  /** 來源在頁面中的對應元素（in-page-block 時可定位），純函式測試時為 undefined。 */
  element?: Element;
}

/** 每網域的自動展開行為（三態）。 */
export type AutoExpandMode = 'auto' | 'prompt' | 'skip';

/** 閱讀主題。 */
export type Theme = 'light' | 'dark' | 'sepia' | 'system';

/** 多篇呈現方式。 */
export type MultiDocLayout = 'tabs' | 'sidepanel';
