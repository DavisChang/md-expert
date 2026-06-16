interface FabProps {
  count: number;
  onOpen: () => void;
  onDismiss: () => void;
}

/**
 * 「prompt」模式下的輕量提示泡泡：偵測到 markdown 但不自動展開時顯示，
 * 由使用者決定是否開啟閱讀視圖。
 */
export function Fab({ count, onOpen, onDismiss }: FabProps) {
  return (
    <button class="mdx-fab" onClick={onOpen} title="以 Markdown Expert 開啟">
      <span>📖 {count > 1 ? `${count} 篇 Markdown` : '偵測到 Markdown'}</span>
      <span
        role="button"
        aria-label="忽略"
        style={{ opacity: 0.7, marginLeft: 4 }}
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
      >
        ✕
      </span>
    </button>
  );
}
