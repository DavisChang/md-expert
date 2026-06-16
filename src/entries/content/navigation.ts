/**
 * 換頁偵測（content script 端）。
 * - patch history.pushState / replaceState 以捕捉 SPA 軟導覽。
 * - 監聽 popstate（上一頁/下一頁）。
 * - 以 MutationObserver 觀察 body 大幅變動作為後備（某些 SPA 不走 history API）。
 * 整頁載入（hard navigation）由 background 的 tabs.onUpdated 處理。
 */

type UrlChangeHandler = (url: string) => void;

const DEBOUNCE_MS = 400;

export function watchNavigation(onChange: UrlChangeHandler): () => void {
  let lastUrl = location.href;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const fire = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => onChange(lastUrl), DEBOUNCE_MS);
  };

  // patch history API
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function (...args) {
    const ret = origPush.apply(this, args);
    fire();
    return ret;
  };
  history.replaceState = function (...args) {
    const ret = origReplace.apply(this, args);
    fire();
    return ret;
  };
  window.addEventListener('popstate', fire);
  window.addEventListener('hashchange', fire);

  // MutationObserver 後備：大量子節點變動時檢查 URL。
  const observer = new MutationObserver(() => fire());
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
  }

  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener('popstate', fire);
    window.removeEventListener('hashchange', fire);
    observer.disconnect();
    if (timer) clearTimeout(timer);
  };
}
