import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { MarkdownSource, Theme } from '@/core/types';
import { track } from '@/core/analytics/track';
import { AnalyticsEvent } from '@/core/analytics/config';
import { applyTheme } from './theme/theme';
import { Reader } from './Reader';
import { Toolbar } from './Toolbar';
import { MultiDocTabs } from './MultiDocTabs';

interface AppProps {
  docs: MarkdownSource[];
  initialTheme: Theme;
  fontScale: number;
  onClose: () => void;
  onThemeChange?: (theme: Theme) => void;
}

const THEME_CYCLE: Theme[] = ['system', 'light', 'dark', 'sepia'];

/** content overlay 的根元件：分頁 + 工具列 + 閱讀視圖。 */
export function App({ docs, initialTheme, fontScale, onClose, onThemeChange }: AppProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [activeId, setActiveId] = useState(docs[0]?.id ?? '');
  const [showToc, setShowToc] = useState(true);
  const [liked, setLiked] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentElRef = useRef<HTMLElement | null>(null);

  const active = docs.find((d) => d.id === activeId) ?? docs[0];

  // 切換文件時重置「讚」狀態。
  useEffect(() => setLiked(false), [activeId]);

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

  // 鍵盤快捷鍵：Esc 關閉、T 切換目錄、D 切換主題、C 複製原文。
  // 閱讀視圖為全螢幕覆蓋層、無輸入欄位，故單鍵快捷安全；有修飾鍵時不攔截（保留原生 Cmd/Ctrl+C 等）。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
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
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, toggleToc, cycleTheme, copyMarkdown]);

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
