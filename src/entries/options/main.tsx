import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { AutoExpandMode, Theme } from '@/core/types';
import { type Settings } from '@/core/store/schema';
import { loadSettings, updateSettings } from '@/core/store/settings';
import { track } from '@/core/analytics/track';
import { AnalyticsEvent } from '@/core/analytics/config';
import './options.css';

const MODE_LABEL: Record<AutoExpandMode, string> = {
  auto: '自動展開',
  prompt: '顯示提示泡泡',
  skip: '略過',
};

const THEME_LABEL: Record<Theme, string> = {
  system: '跟隨系統',
  light: '亮色',
  dark: '暗色',
  sepia: '復古',
};

function Options() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  const patch = async (p: Partial<Settings>) => {
    const next = await updateSettings(p);
    setSettings(next);
    // 上報變更了哪個設定（不含值），用於了解哪些設定常被調整。
    for (const key of Object.keys(p)) {
      track(AnalyticsEvent.SettingChanged, { setting: key });
    }
  };

  // 開啟分析時動態請求 GA 主機權限（需使用者手勢，checkbox 點擊即符合）；
  // 拒絕授權就不開啟。關閉時一併移除權限。
  const GA_ORIGIN = 'https://www.google-analytics.com/*';
  const setAnalytics = async (enabled: boolean) => {
    if (enabled) {
      const granted = await chrome.permissions.request({ origins: [GA_ORIGIN] });
      if (!granted) return;
    } else {
      void chrome.permissions.remove({ origins: [GA_ORIGIN] });
    }
    await patch({ analyticsEnabled: enabled });
  };

  const removeDomain = async (host: string) => {
    if (!settings) return;
    const perDomain = { ...settings.perDomain };
    delete perDomain[host];
    await patch({ perDomain });
  };

  if (!settings) return <div class="op-loading">載入中…</div>;

  return (
    <div class="op">
      <h1>Markdown Expert 設定</h1>

      <section class="op-card">
        <h2>偵測與展開</h2>
        <label class="op-row">
          <span>預設行為</span>
          <select
            value={settings.defaultAutoExpand}
            onChange={(e) =>
              void patch({ defaultAutoExpand: (e.target as HTMLSelectElement).value as AutoExpandMode })
            }
          >
            {(['auto', 'prompt', 'skip'] as AutoExpandMode[]).map((m) => (
              <option key={m} value={m}>
                {MODE_LABEL[m]}
              </option>
            ))}
          </select>
        </label>
        <label class="op-row">
          <span>信心門檻：{settings.confidenceThreshold.toFixed(2)}</span>
          <input
            type="range"
            min="0.2"
            max="0.9"
            step="0.05"
            value={settings.confidenceThreshold}
            onInput={(e) =>
              void patch({ confidenceThreshold: Number((e.target as HTMLInputElement).value) })
            }
          />
        </label>
      </section>

      <section class="op-card">
        <h2>外觀</h2>
        <label class="op-row">
          <span>主題</span>
          <select
            value={settings.theme}
            onChange={(e) => void patch({ theme: (e.target as HTMLSelectElement).value as Theme })}
          >
            {(['system', 'light', 'dark', 'sepia'] as Theme[]).map((t) => (
              <option key={t} value={t}>
                {THEME_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label class="op-row">
          <span>字級：{Math.round(settings.fontScale * 100)}%</span>
          <input
            type="range"
            min="0.8"
            max="1.6"
            step="0.1"
            value={settings.fontScale}
            onInput={(e) => void patch({ fontScale: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
      </section>

      <section class="op-card">
        <h2>多篇文件</h2>
        <label class="op-row">
          <span>超過幾篇改用側欄</span>
          <input
            type="number"
            min="2"
            max="20"
            value={settings.multiDocThreshold}
            onInput={(e) =>
              void patch({ multiDocThreshold: Number((e.target as HTMLInputElement).value) })
            }
          />
        </label>
      </section>

      <section class="op-card">
        <h2>每網域規則</h2>
        {Object.keys(settings.perDomain).length === 0 ? (
          <p class="op-empty">尚無自訂網域。可在各網頁的擴充彈窗中設定。</p>
        ) : (
          <ul class="op-domains">
            {Object.entries(settings.perDomain).map(([host, mode]) => (
              <li key={host}>
                <code>{host}</code>
                <span>{MODE_LABEL[mode]}</span>
                <button onClick={() => void removeDomain(host)}>移除</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section class="op-card">
        <h2>隱私與使用分析</h2>
        <label class="op-row">
          <span>
            分享匿名使用統計
            <small class="op-hint">
              協助改善產品。僅傳送匿名互動（如偵測到的來源類型、開啟閱讀視圖），
              <strong>不含</strong>網頁內容、網址或任何個資。預設關閉。
            </small>
          </span>
          <input
            type="checkbox"
            checked={settings.analyticsEnabled}
            onChange={(e) => void setAnalytics((e.target as HTMLInputElement).checked)}
          />
        </label>
      </section>

      <footer class="op-footer">
        隱私優先：所有內容處理皆在本機完成。除非你主動開啟上方的「匿名使用統計」，否則不蒐集任何資料。
      </footer>
    </div>
  );
}

const root = document.getElementById('app');
if (root) render(<Options />, root);
