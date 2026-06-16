import type { TocItem } from '@/core/render/toc';

interface TocProps {
  items: TocItem[];
  onNavigate: (slug: string) => void;
}

/** 目錄側欄。點擊項目捲動到對應標題。 */
export function Toc({ items, onNavigate }: TocProps) {
  if (items.length === 0) return null;
  return (
    <nav class="mdx-toc" aria-label="目錄">
      {items.map((item) => (
        <a
          key={item.slug}
          href={`#${item.slug}`}
          style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(item.slug);
          }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
