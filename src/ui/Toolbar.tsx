import type { Theme } from '@/core/types';
import type { LanguageOption } from '@/core/translate/languages';

/** 翻譯流程的 UI 狀態。 */
export type TranslateStatus =
  | 'unsupported' // 環境無內建 AI
  | 'idle' // 尚未翻譯
  | 'preparing' // 偵測語言/查可用性
  | 'downloading' // 下載語言模型
  | 'translating' // 翻譯中
  | 'translated' // 已完成（可切換原文/譯文）
  | 'same' // 來源與目標同語言，無需翻譯
  | 'error'; // 失敗

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
  // 翻譯
  translateStatus: TranslateStatus;
  translateProgress: number; // 0..100
  showingOriginal: boolean;
  targetLang: string;
  languages: readonly LanguageOption[];
  onChangeTarget: (lang: string) => void;
  onTranslate: () => void;
  onToggleOriginal: () => void;
}

const THEME_LABEL: Record<Theme, string> = {
  light: '☀️ 亮',
  dark: '🌙 暗',
  sepia: '📜 復古',
  system: '🖥 系統',
};

/** 依翻譯狀態決定按鈕文案。 */
function translateLabel(status: TranslateStatus, progress: number): string {
  switch (status) {
    case 'preparing':
      return '準備中…';
    case 'downloading':
      return `⬇️ 下載模型 ${progress}%`;
    case 'translating':
      return `翻譯中 ${progress}%`;
    case 'same':
      return '✓ 同語言';
    case 'error':
      return '⚠️ 重試';
    default:
      return '🌐 翻譯';
  }
}

/** 頂部工具列：標題 + 翻譯 + 目錄/主題/複製/關閉。 */
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
  translateStatus,
  translateProgress,
  showingOriginal,
  targetLang,
  languages,
  onChangeTarget,
  onTranslate,
  onToggleOriginal,
}: ToolbarProps) {
  const busy =
    translateStatus === 'preparing' ||
    translateStatus === 'downloading' ||
    translateStatus === 'translating';

  return (
    <div class="mdx-toolbar">
      <button class="mdx-btn" onClick={onToggleToc} title="切換目錄（T）">
        {showToc ? '◧ 目錄' : '☰ 目錄'} <kbd class="mdx-kbd">T</kbd>
      </button>
      <span class="mdx-title">{title}</span>

      {translateStatus !== 'unsupported' && (
        <span class="mdx-translate">
          <select
            class="mdx-lang"
            value={targetLang}
            disabled={busy}
            title="翻譯目標語言"
            onChange={(e) => onChangeTarget((e.target as HTMLSelectElement).value)}
          >
            {languages.map((l) => (
              <option value={l.code}>{l.label}</option>
            ))}
          </select>
          {translateStatus === 'translated' ? (
            <button class="mdx-btn" onClick={onToggleOriginal} title="切換原文/譯文（G）">
              {showingOriginal ? '🌐 顯示譯文' : '🔤 顯示原文'} <kbd class="mdx-kbd">G</kbd>
            </button>
          ) : (
            <button
              class="mdx-btn"
              onClick={onTranslate}
              disabled={busy || translateStatus === 'same'}
              title="翻譯（G）"
            >
              {translateLabel(translateStatus, translateProgress)}{' '}
              {!busy && <kbd class="mdx-kbd">G</kbd>}
            </button>
          )}
        </span>
      )}

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
