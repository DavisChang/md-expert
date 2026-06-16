/**
 * 將標題文字轉成穩定的 slug，供 markdown-it-anchor 與 TOC 共用，
 * 確保目錄連結與標題錨點一致。支援中日韓字元。
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w一-鿿\- ]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
