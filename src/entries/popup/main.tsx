import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { AutoExpandMode } from '@/core/types';
import { effectiveAutoExpand, type Settings } from '@/core/store/schema';
import { loadSettings, setDomainMode } from '@/core/store/settings';
import type { RuntimeMessage } from '@/core/messaging/types';
import './popup.css';

const MODE_LABEL: Record<AutoExpandMode, string> = {
  auto: '自動展開',
  prompt: '顯示提示',
  skip: '略過',
};

function Popup() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    void loadSettings().then(setSettings);
    void chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const url = tabs[0]?.url;
      if (url) {
        try {
          setHostname(new URL(url).hostname);
        } catch {
          /* ignore */
        }
      }
    });
  }, []);

  const sendToActiveTab = async (message: RuntimeMessage) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) void chrome.tabs.sendMessage(tab.id, message);
  };

  const changeMode = async (mode: AutoExpandMode) => {
    if (!hostname) return;
    const next = await setDomainMode(hostname, mode);
    setSettings(next);
    if (mode !== 'skip') void sendToActiveTab({ type: 'md:redetect' });
  };

  if (!settings) return <div class="pp-loading">載入中…</div>;

  const current = hostname ? effectiveAutoExpand(settings, hostname) : settings.defaultAutoExpand;

  return (
    <div class="pp">
      <header class="pp-header">📖 Markdown Expert</header>

      <button class="pp-primary" onClick={() => void sendToActiveTab({ type: 'md:toggle-reader', open: true })}>
        在此頁開啟閱讀視圖
      </button>

      <div class="pp-section">
        <div class="pp-label">此網域行為{hostname && `（${hostname}）`}</div>
        <div class="pp-modes">
          {(['auto', 'prompt', 'skip'] as AutoExpandMode[]).map((m) => (
            <button
              key={m}
              class={`pp-mode ${current === m ? 'active' : ''}`}
              onClick={() => void changeMode(m)}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      <button class="pp-link" onClick={() => void chrome.runtime.openOptionsPage()}>
        ⚙ 進階設定
      </button>
    </div>
  );
}

const root = document.getElementById('app');
if (root) render(<Popup />, root);
