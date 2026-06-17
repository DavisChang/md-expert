import { useEffect, useMemo, useRef } from 'preact/hooks';
import { renderMarkdown } from '@/core/render/pipeline';
import { Toc } from './Toc';
import { renderMath } from './math';
import { renderMermaid } from './mermaid';

interface ReaderProps {
  content: string;
  showToc: boolean;
  onNavigate: (slug: string) => void;
  /** 提供一個 ref 給捲動容器，供錨點導覽使用。 */
  contentRef?: (el: HTMLElement | null) => void;
}

/**
 * 單篇閱讀視圖：左側目錄 + 右側內容。
 * renderMarkdown 已輸出淨化過的 HTML，這裡才用 dangerouslySetInnerHTML。
 */
export function Reader({ content, showToc, onNavigate, contentRef }: ReaderProps) {
  const { html, toc } = useMemo(() => renderMarkdown(content), [content]);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (articleRef.current) {
      void renderMath(articleRef.current);
      void renderMermaid(articleRef.current);
    }
  }, [html]);

  return (
    <div class="mdx-body">
      {showToc && <Toc items={toc} onNavigate={onNavigate} />}
      <div class="mdx-content" ref={contentRef}>
        <article
          ref={articleRef}
          class="mdx-article markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
