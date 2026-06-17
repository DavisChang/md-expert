import { render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { renderMarkdown } from '@/core/render/pipeline';
import { isRuntimeMessage, type GetDocsMessage, type GetDocsResponse } from '@/core/messaging/types';
import { loadSettings, onSettingsChanged } from '@/core/store/settings';
import { track } from '@/core/analytics/track';
import { AnalyticsEvent } from '@/core/analytics/config';
import { renderMath } from '@/ui/math';
import { renderMermaid } from '@/ui/mermaid';
import { applyTheme } from '@/ui/theme/theme';
import 'katex/dist/katex.min.css';
import '@/ui/theme/tokens.css';
import '@/ui/theme/markdown.css';
import './sidepanel.css';

interface Doc {
  id: string;
  title: string;
  content: string;
}

function SidePanel() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeId, setActiveId] = useState('');
  const viewedTracked = useRef(false);
  const articleRef = useRef<HTMLElement | null>(null);

  // 側欄首次顯示文件時上報一次。
  useEffect(() => {
    if (docs.length > 0 && !viewedTracked.current) {
      viewedTracked.current = true;
      track(AnalyticsEvent.SidepanelViewed, { doc_count: docs.length });
    }
  }, [docs]);

  // 套用使用者主題與字級（與閱讀視圖一致），並隨設定變更即時更新。
  useEffect(() => {
    const apply = (theme: Parameters<typeof applyTheme>[1], scale: number) =>
      applyTheme(document.documentElement, theme, scale);
    void loadSettings().then((s) => apply(s.theme, s.fontScale));
    return onSettingsChanged((s) => apply(s.theme, s.fontScale));
  }, []);

  useEffect(() => {
    // 主動向 background 拉取目前分頁的文件。
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id != null) {
        const req: GetDocsMessage = { type: 'md:get-docs', tabId: tab.id };
        void chrome.runtime
          .sendMessage(req)
          .then((res: GetDocsResponse | undefined) => {
            if (res?.docs?.length) {
              setDocs(res.docs);
              setActiveId(res.docs[0]!.id);
            }
          })
          .catch(() => {});
      }
    });

    // 也接受 content script 即時推送的更新。
    const listener = (message: unknown) => {
      if (!isRuntimeMessage(message) || message.type !== 'md:docs') return;
      setDocs(message.docs);
      setActiveId((prev) => prev || message.docs[0]?.id || '');
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const active = docs.find((d) => d.id === activeId) ?? docs[0];
  const rendered = useMemo(() => (active ? renderMarkdown(active.content) : null), [active]);

  useEffect(() => {
    if (articleRef.current) {
      void renderMath(articleRef.current);
      void renderMermaid(articleRef.current);
    }
  }, [rendered?.html]);

  if (!active) {
    return <div class="sp-empty">這個頁面尚未偵測到 Markdown。</div>;
  }

  return (
    <div class="sp">
      <nav class="sp-list">
        {docs.map((d, i) => (
          <button
            key={d.id}
            class={`sp-item ${d.id === active.id ? 'active' : ''}`}
            onClick={() => setActiveId(d.id)}
          >
            {d.title || `文件 ${i + 1}`}
          </button>
        ))}
      </nav>
      <article
        ref={articleRef}
        class="sp-article markdown-body"
        // renderMarkdown 已淨化
        dangerouslySetInnerHTML={{ __html: rendered?.html ?? '' }}
      />
    </div>
  );
}

const root = document.getElementById('app');
if (root) render(<SidePanel />, root);
