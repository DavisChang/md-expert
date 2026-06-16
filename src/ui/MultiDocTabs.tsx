interface DocTab {
  id: string;
  title: string;
}

interface MultiDocTabsProps {
  docs: DocTab[];
  activeId: string;
  onSelect: (id: string) => void;
}

/** 多篇文件的分頁列。單篇時不顯示。 */
export function MultiDocTabs({ docs, activeId, onSelect }: MultiDocTabsProps) {
  if (docs.length <= 1) return null;
  return (
    <div class="mdx-tabs" role="tablist">
      {docs.map((doc, i) => (
        <button
          key={doc.id}
          class="mdx-tab"
          role="tab"
          aria-selected={doc.id === activeId}
          onClick={() => onSelect(doc.id)}
          title={doc.title}
        >
          {doc.title || `文件 ${i + 1}`}
        </button>
      ))}
    </div>
  );
}
