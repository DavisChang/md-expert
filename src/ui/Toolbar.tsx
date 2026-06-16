import type { Theme } from '@/core/types';

interface ToolbarProps {
  title: string;
  theme: Theme;
  showToc: boolean;
  liked: boolean;
  onToggleToc: () => void;
  onCycleTheme: () => void;
  onCopy: () => void;
  onLike: () => void;
  onClose: () => void;
}

const THEME_LABEL: Record<Theme, string> = {
  light: '☀️ 亮',
  dark: '🌙 暗',
  sepia: '📜 復古',
  system: '🖥 系統',
};

/** 頂部工具列：標題 + 目錄/主題/複製/關閉。 */
export function Toolbar({
  title,
  theme,
  showToc,
  liked,
  onToggleToc,
  onCycleTheme,
  onCopy,
  onLike,
  onClose,
}: ToolbarProps) {
  return (
    <div class="mdx-toolbar">
      <button class="mdx-btn" onClick={onToggleToc} title="切換目錄（T）">
        {showToc ? '◧ 目錄' : '☰ 目錄'} <kbd class="mdx-kbd">T</kbd>
      </button>
      <span class="mdx-title">{title}</span>
      <button class="mdx-btn" onClick={onCycleTheme} title="切換主題（D）">
        {THEME_LABEL[theme]} <kbd class="mdx-kbd">D</kbd>
      </button>
      <button class="mdx-btn" onClick={onCopy} title="複製原始 Markdown（C）">
        ⧉ 複製 <kbd class="mdx-kbd">C</kbd>
      </button>
      <button
        class={`mdx-btn mdx-like ${liked ? 'liked' : ''}`}
        onClick={onLike}
        disabled={liked}
        title="這份內容很有用"
      >
        {liked ? '❤️ 已讚' : '🤍 讚'}
      </button>
      <button class="mdx-btn" onClick={onClose} title="關閉（Esc）">
        ✕ 關閉 <kbd class="mdx-kbd">Esc</kbd>
      </button>
    </div>
  );
}
