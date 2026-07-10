import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { MarkdownSource, Theme } from '@/core/types';
import { track } from '@/core/analytics/track';
import { AnalyticsEvent } from '@/core/analytics/config';
import { isSameLanguage, pickSourceLanguage } from '@/core/translate/detect';
import { normalizeTarget, TARGET_LANGUAGES } from '@/core/translate/languages';
import { applyTheme } from './theme/theme';
import { Reader } from './Reader';
import { Toolbar, type TranslateStatus } from './Toolbar';
import { MultiDocTabs } from './MultiDocTabs';
import {
  chromeLanguageDetector,
  chromeTranslator,
  isDetectionSupported,
  isTranslationSupported,
  translateArticle,
  type ArticleTranslation,
} from './translate';

interface AppProps {
  docs: MarkdownSource[];
  initialTheme: Theme;
  fontScale: number;
  onClose: () => void;
  onThemeChange?: (theme: Theme) => void;
  /** 上次選擇的翻譯目標語言。 */
  translateTarget?: string;
  /** 使用者改變翻譯目標語言時回呼（供持久化）。 */
  onTranslateTargetChange?: (lang: string) => void;
}

const THEME_CYCLE: Theme[] = ['system', 'light', 'dark', 'sepia'];

/** 偵測語言時取樣的最大字數（足夠判斷語言、避免整篇送入）。 */
const DETECT_SAMPLE_LEN = 4000;

/** content overlay 的根元件：分頁 + 工具列 + 閱讀視圖。 */
export function App({
  docs,
  initialTheme,
  fontScale,
  onClose,
  onThemeChange,
  translateTarget,
  onTranslateTargetChange,
}: AppProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [activeId, setActiveId] = useState(docs[0]?.id ?? '');
  const [showToc, setShowToc] = useState(true);
  const [liked, setLiked] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentElRef = useRef<HTMLElement | null>(null);

  // 翻譯狀態
  const supported = isTranslationSupported();
  const [transStatus, setTransStatus] = useState<TranslateStatus>(supported ? 'idle' : 'unsupported');
  const [transProgress, setTransProgress] = useState(0);
  const [showingOriginal, setShowingOriginal] = useState(false);
  const [targetLang, setTargetLang] = useState(normalizeTarget(translateTarget));
  const transRef = useRef<ArticleTranslation | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const active = docs.find((d) => d.id === activeId) ?? docs[0];

  // 切換文件時重置「讚」與翻譯狀態（新文件為新的 article）。
  useEffect(() => {
    setLiked(false);
    abortRef.current?.abort();
    abortRef.current = null;
    transRef.current = null;
    setShowingOriginal(false);
    setTransProgress(0);
    setTransStatus(supported ? 'idle' : 'unsupported');
  }, [activeId, supported]);

  // 卸載時中止進行中的翻譯。
  useEffect(() => () => abortRef.current?.abort(), []);

  const toggleToc = useCallback(() => {
    track(AnalyticsEvent.ToolbarAction, { action: 'toc' });
    setShowToc((v) => !v);
  }, []);

  const like = useCallback(() => {
    setLiked(true);
    track(AnalyticsEvent.ContentLiked, { source_kind: active?.kind ?? 'unknown' });
  }, [active]);

  // 套用主題到 Shadow host（CSS 變數靠 [data-theme] 切換）。
  useEffect(() => {
    const host = rootRef.current?.getRootNode() as ShadowRoot | undefined;
    const hostEl = host?.host as HTMLElement | undefined;
    if (hostEl) applyTheme(hostEl, theme, fontScale);
  }, [theme, fontScale]);

  const cycleTheme = useCallback(() => {
    track(AnalyticsEvent.ToolbarAction, { action: 'theme' });
    setTheme((prev) => {
      const idx = THEME_CYCLE.indexOf(prev);
      const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]!;
      onThemeChange?.(next);
      return next;
    });
  }, [onThemeChange]);

  const copyMarkdown = useCallback(() => {
    track(AnalyticsEvent.ToolbarAction, { action: 'copy' });
    if (active) void navigator.clipboard?.writeText(active.content);
  }, [active]);

  const close = useCallback(() => {
    track(AnalyticsEvent.ToolbarAction, { action: 'close' });
    onClose();
  }, [onClose]);

  const navigate = useCallback((slug: string) => {
    const container = contentElRef.current;
    const target = container?.querySelector(`#${CSS.escape(slug)}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const changeTarget = useCallback(
    (lang: string) => {
      setTargetLang(lang);
      onTranslateTargetChange?.(lang);
      // 改語言 → 重置翻譯狀態並還原原文，讓使用者可重新翻成新語言。
      abortRef.current?.abort();
      abortRef.current = null;
      transRef.current?.showOriginal();
      transRef.current = null;
      setShowingOriginal(false);
      setTransProgress(0);
      setTransStatus('idle');
    },
    [onTranslateTargetChange],
  );

  /** 執行整篇翻譯：偵測來源語言 → 查可用性 → 建立（必要時下載）→ 就地翻譯。 */
  const runTranslation = useCallback(async () => {
    const article = contentElRef.current?.querySelector<HTMLElement>('.mdx-article');
    if (!article) return;

    // 清掉先前的翻譯與進行中的工作。
    abortRef.current?.abort();
    transRef.current?.showOriginal();
    transRef.current = null;
    const abort = new AbortController();
    abortRef.current = abort;
    setShowingOriginal(false);
    setTransProgress(0);
    setTransStatus('preparing');

    try {
      // 1) 偵測來源語言（偵測不可用或低信心時預設 en）。
      let source = 'en';
      if (isDetectionSupported()) {
        const detections = await chromeLanguageDetector.detect(
          (article.textContent ?? '').slice(0, DETECT_SAMPLE_LEN),
        );
        source = pickSourceLanguage(detections) ?? 'en';
      }
      if (abort.signal.aborted) return;

      // 2) 同語言 → 無需翻譯。
      if (isSameLanguage(source, targetLang)) {
        setTransStatus('same');
        return;
      }

      // 匿名事件（語言碼為偏好，非內容/網址/個資），只在真正要翻譯時上報。
      track(AnalyticsEvent.TranslationUsed, { source, target: targetLang });

      const pair = { source, target: targetLang };

      // 3) 查可用性。
      const availability = await chromeTranslator.availability(pair);
      if (abort.signal.aborted) return;
      if (availability === 'unavailable') {
        setTransStatus('error');
        return;
      }

      // 4) 建立翻譯器（downloadable/downloading 會觸發下載）。
      if (availability !== 'available') setTransStatus('downloading');
      const handle = await chromeTranslator.create(pair, (loaded) =>
        setTransProgress(Math.round(loaded * 100)),
      );
      if (abort.signal.aborted) {
        handle.destroy();
        return;
      }

      // 5) 逐段翻譯。譯文由 controller 快取，翻完即可釋放 handle。
      setTransStatus('translating');
      setTransProgress(0);
      try {
        const controller = await translateArticle(article, handle, {
          signal: abort.signal,
          onProgress: (done, total) => setTransProgress(Math.round((done / total) * 100)),
        });
        transRef.current = controller;
        setShowingOriginal(false);
        setTransStatus('translated');
      } finally {
        handle.destroy();
      }
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') return;
      setTransStatus('error');
    }
  }, [targetLang]);

  const toggleOriginal = useCallback(() => {
    const controller = transRef.current;
    if (!controller) return;
    setShowingOriginal((prev) => {
      if (prev) controller.showTranslation();
      else controller.showOriginal();
      return !prev;
    });
  }, []);

  // 鍵盤快捷鍵：Esc 關閉、T 目錄、D 主題、C 複製、G 翻譯/切換原文。
  // 閱讀視圖為全螢幕覆蓋層；有修飾鍵或聚焦於表單控制項時不攔截。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      switch (e.key.toLowerCase()) {
        case 't':
          e.preventDefault();
          toggleToc();
          break;
        case 'd':
          e.preventDefault();
          cycleTheme();
          break;
        case 'c':
          e.preventDefault();
          copyMarkdown();
          break;
        case 'g':
          if (transStatus === 'unsupported') break;
          e.preventDefault();
          if (transStatus === 'translated') toggleOriginal();
          else if (transStatus !== 'preparing' && transStatus !== 'downloading' && transStatus !== 'translating')
            void runTranslation();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, toggleToc, cycleTheme, copyMarkdown, runTranslation, toggleOriginal, transStatus]);

  if (!active) return null;

  return (
    <div class="mdx-root" ref={rootRef}>
      <Toolbar
        title={active.title}
        theme={theme}
        showToc={showToc}
        liked={liked}
        onToggleToc={toggleToc}
        onCycleTheme={cycleTheme}
        onCopy={copyMarkdown}
        onLike={like}
        onClose={close}
        translateStatus={transStatus}
        translateProgress={transProgress}
        showingOriginal={showingOriginal}
        targetLang={targetLang}
        languages={TARGET_LANGUAGES}
        onChangeTarget={changeTarget}
        onTranslate={() => void runTranslation()}
        onToggleOriginal={toggleOriginal}
      />
      <MultiDocTabs
        docs={docs.map((d) => ({ id: d.id, title: d.title }))}
        activeId={active.id}
        onSelect={setActiveId}
      />
      <Reader
        key={active.id}
        content={active.content}
        showToc={showToc}
        onNavigate={navigate}
        contentRef={(el) => (contentElRef.current = el)}
      />
    </div>
  );
}
