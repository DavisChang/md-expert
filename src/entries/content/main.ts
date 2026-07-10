import { h } from 'preact';
import type { MarkdownSource } from '@/core/types';
import { contextFromDocument, detectAll } from '@/core/detect/registry';
import { effectiveAutoExpand, type Settings } from '@/core/store/schema';
import { loadSettings, onSettingsChanged, updateSettings } from '@/core/store/settings';
import { isRuntimeMessage, type RuntimeMessage } from '@/core/messaging/types';
import { track } from '@/core/analytics/track';
import { AnalyticsEvent } from '@/core/analytics/config';
import { App } from '@/ui/App';
import { Fab } from '@/ui/Fab';
import { mountShadow } from './mount';
import { watchNavigation } from './navigation';

/** 建置標記：每次調整 content script 行為時遞增，方便確認載入的是哪一版。 */
const BUILD_TAG = 'builtin-translation-1';

let settings: Settings | null = null;
let mount: ReturnType<typeof mountShadow> | null = null;
let currentDocs: MarkdownSource[] = [];
let readerOpen = false;
let dismissedForUrl: string | null = null;

/** 目前畫面上呈現的文件簽章，用來判斷偵測結果是否真的有變化。 */
let displayedSig: string | null = null;
/** 設定收斂輪詢計時器。 */
let settleTimer: ReturnType<typeof setInterval> | null = null;
/** 已上報偵測事件的 URL，避免設定收斂期間重複上報。 */
let trackedDetectionUrl: string | null = null;

function ensureMount() {
  if (!mount) mount = mountShadow();
  return mount;
}

function closeReader() {
  readerOpen = false;
  mount?.destroy();
  mount = null;
}

function openReader() {
  if (!settings || currentDocs.length === 0) return;
  if (!readerOpen) {
    track(AnalyticsEvent.ReaderOpened, { source_kind: currentDocs[0]!.kind });
  }
  readerOpen = true;
  const m = ensureMount();
  m.update(
    h(App, {
      docs: currentDocs,
      initialTheme: settings.theme,
      fontScale: settings.fontScale,
      translateTarget: settings.translateTarget,
      onTranslateTargetChange: (lang: string) => {
        if (settings) settings.translateTarget = lang;
        void updateSettings({ translateTarget: lang });
      },
      onClose: closeReader,
    }),
  );
  notifyDocs();
}

function showPrompt() {
  if (!settings || currentDocs.length === 0) return;
  const m = ensureMount();
  m.update(
    h(Fab, {
      count: currentDocs.length,
      onOpen: () => {
        m.destroy();
        mount = null;
        openReader();
      },
      onDismiss: () => {
        dismissedForUrl = location.href;
        m.destroy();
        mount = null;
      },
    }),
  );
}

/** 把目前文件清單推給 background/sidepanel（多篇側欄用）。 */
function notifyDocs() {
  const msg: RuntimeMessage = {
    type: 'md:docs',
    docs: currentDocs.map((d) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      kind: d.kind,
    })),
  };
  try {
    void chrome.runtime.sendMessage(msg);
  } catch {
    /* background 可能尚未就緒，忽略 */
  }
}

/** 文件清單的簽章（id + 長度），內容有實質變化時才不同。 */
function docsSignature(docs: MarkdownSource[]): string {
  return docs.map((d) => `${d.id}:${d.content.length}`).join('|');
}

/** 依目前設定把偵測結果呈現出來（自動展開／提示／略過）。 */
function renderDocs(docs: MarkdownSource[]) {
  if (!settings) return;
  currentDocs = docs;

  if (docs.length === 0) {
    if (!readerOpen) {
      mount?.destroy();
      mount = null;
    }
    return;
  }

  // 每個 URL 只上報一次偵測事件（不含網址/內容，只送來源類型與篇數）。
  if (trackedDetectionUrl !== location.href) {
    trackedDetectionUrl = location.href;
    track(AnalyticsEvent.MarkdownDetected, {
      source_kind: docs[0]!.kind,
      doc_count: docs.length,
    });
  }

  const mode = effectiveAutoExpand(settings, location.hostname);
  if (readerOpen) {
    openReader(); // 已開啟 → 以最新內容重新渲染（升級）
    return;
  }
  if (mode === 'auto') {
    openReader();
  } else if (mode === 'prompt') {
    if (dismissedForUrl !== location.href) showPrompt();
  }
  // 'skip' 時不主動呈現。
}

/**
 * 執行一次偵測。只有當結果相對目前畫面「有實質變化」時才重繪，
 * 這讓設定收斂期間能把載入初期誤抓的內容「升級」成最終正確內容。
 */
function applyDetection() {
  if (!settings) return;
  const docs = detectAll(contextFromDocument(document), {
    threshold: settings.confidenceThreshold,
  });

  try {
    void chrome.runtime.sendMessage({
      type: 'md:detected',
      count: docs.length,
      url: location.href,
    } satisfies RuntimeMessage);
  } catch {
    /* ignore */
  }

  const sig = docsSignature(docs);
  if (sig === displayedSig) return;
  displayedSig = sig;
  renderDocs(docs);
}

/**
 * 設定收斂：SPA（Dropbox、GitHub…）的內容常在導覽後才陸續載入，
 * 且初期可能出現會被誤判的暫時性結構。導覽後持續輪詢重新偵測一段時間，
 * 直到結果連續數次穩定或逾時，期間若偵測到更完整的內容會自動替換。
 * 用輪詢而非 MutationObserver，以免持續變動的頁面（如游標閃爍）讓 debounce 永不觸發。
 */
function startSettling() {
  stopSettling();
  let ticks = 0;
  let stable = 0;
  let lastSig = displayedSig;
  settleTimer = setInterval(() => {
    ticks += 1;
    applyDetection();
    if (displayedSig === lastSig) {
      stable += 1;
    } else {
      stable = 0;
      lastSig = displayedSig;
    }
    // 連續 3 次（約 2.7s）無變化即視為穩定；或輪詢約 11s 後停止。
    if (stable >= 3 || ticks >= 12) stopSettling();
  }, 900);
}

function stopSettling() {
  if (settleTimer) {
    clearInterval(settleTimer);
    settleTimer = null;
  }
}

function refresh() {
  displayedSig = null; // 強制下一次偵測重繪
  trackedDetectionUrl = null; // 換頁/重偵測後可再次上報偵測事件
  applyDetection();
  startSettling();
}

function handleMessage(message: unknown) {
  if (!isRuntimeMessage(message)) return;
  switch (message.type) {
    case 'md:redetect':
      dismissedForUrl = null;
      refresh();
      break;
    case 'md:toggle-reader':
      if (message.open === false || (message.open === undefined && readerOpen)) {
        closeReader();
      } else {
        openReader();
      }
      break;
    default:
      break;
  }
}

async function init() {
  // 在 <html> 標一個版本記號，方便驗證載入的建置版本（無副作用）。
  document.documentElement.setAttribute('data-mdx-expert', BUILD_TAG);

  settings = await loadSettings();

  onSettingsChanged((next) => {
    settings = next;
  });

  chrome.runtime.onMessage.addListener(handleMessage);

  watchNavigation(() => {
    dismissedForUrl = null;
    refresh();
  });

  refresh();
}

void init();
