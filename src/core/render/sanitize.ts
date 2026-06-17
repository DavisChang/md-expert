import DOMPurify from 'dompurify';

/**
 * HTML 淨化設定。content script 會把渲染後的 HTML 注入頁面，
 * 因此**必須**淨化以防 XSS（markdown 可內嵌 raw HTML）。
 *
 * 政策：
 * - 允許常見排版與表格標籤、程式碼、任務清單的 checkbox。
 * - 禁止 script/style/iframe 等可執行或可外連的元素。
 * - 連結強制 target=_blank + rel=noopener，避免 tabnabbing。
 */

const ALLOWED_TAGS = [
  'a', 'p', 'br', 'hr', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'kbd', 'samp',
  'strong', 'em', 'b', 'i', 'del', 's', 'mark', 'sub', 'sup',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'figure', 'figcaption',
  'input', // 任務清單的 checkbox
  'details', 'summary',
];

const ALLOWED_ATTR = [
  'href', 'title', 'alt', 'src', 'class', 'id',
  'colspan', 'rowspan', 'align',
  'type', 'checked', 'disabled', // checkbox 用
  'data-line', 'data-display', 'aria-hidden',
];

let configured = false;

/** 安裝一次性的 DOMPurify hook：強制外連連結安全。 */
function ensureHooks(): void {
  if (configured) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer nofollow');
    }
    // 任務清單 checkbox 一律禁用（純呈現）。
    if (node.tagName === 'INPUT') {
      const type = node.getAttribute('type');
      if (type !== 'checkbox') {
        node.remove();
      } else {
        node.setAttribute('disabled', '');
      }
    }
  });
  configured = true;
}

/** 把（可能含惡意片段的）HTML 淨化成可安全注入的字串。 */
export function sanitizeHtml(dirty: string): string {
  ensureHooks();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    // 禁止 javascript:、data: 等危險協定（圖片 data: 例外由下方 URI policy 控制）。
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
  });
}
