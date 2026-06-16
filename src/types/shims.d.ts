/** 第三方套件缺少型別定義的補充宣告。 */

declare module 'markdown-it-task-lists' {
  import type MarkdownIt from 'markdown-it';
  interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }
  const taskLists: (md: MarkdownIt, options?: TaskListsOptions) => void;
  export default taskLists;
}

/** Vite 的 ?inline CSS 匯入回傳字串。 */
declare module '*.css?inline' {
  const content: string;
  export default content;
}
