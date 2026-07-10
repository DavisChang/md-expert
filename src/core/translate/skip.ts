/**
 * 決定哪些內容「不翻譯」的純規則。
 * DOM 走訪在 UI 層，但跳過規則放這裡以便單元測試。
 */

/** 這些標籤（含後代）內的文字不翻譯：程式碼、鍵盤、原樣文字、腳本/樣式。 */
const SKIP_TAGS: ReadonlySet<string> = new Set([
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
  'VAR',
  'SCRIPT',
  'STYLE',
  'TEXTAREA',
]);

/**
 * 祖先選擇器：文字節點若位於這些容器內則整塊不翻譯。
 * 涵蓋程式碼、行內碼、鍵盤鍵、數學（KaTeX）、Mermaid 圖。
 */
export const SKIP_ANCESTOR_SELECTOR = 'pre, code, kbd, samp, var, .mdx-math, .mdx-mermaid';

/** 標籤名是否屬於不翻譯類別。 */
export function isSkippableTag(tag: string): boolean {
  return SKIP_TAGS.has(tag.toUpperCase());
}

/**
 * 這段文字是否值得翻譯：排除空白、無任何字母（純數字/標點/emoji）、純網址。
 */
export function isTranslatableText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  if (!/\p{L}/u.test(trimmed)) return false;
  if (/^(https?:\/\/|www\.)\S+$/i.test(trimmed)) return false;
  return true;
}
