import type { AutoExpandMode } from '@/core/types';
import { DEFAULT_SETTINGS, migrateSettings, type Settings } from './schema';

const STORAGE_KEY = 'settings';

/**
 * 設定的存取封裝。唯一直接碰 chrome.storage 的地方，
 * 讓 core 其他模組與 UI 透過此 API 操作設定（便於測試與替換後端）。
 */

/** 讀取設定（含遷移補齊）。 */
export async function loadSettings(): Promise<Settings> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return migrateSettings(result[STORAGE_KEY]);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** 寫入完整設定。 */
export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
}

/** 局部更新設定並回傳更新後的完整設定。 */
export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const next = migrateSettings({ ...current, ...patch });
  await saveSettings(next);
  return next;
}

/** 設定某網域的自動展開行為。 */
export async function setDomainMode(
  hostname: string,
  mode: AutoExpandMode,
): Promise<Settings> {
  const current = await loadSettings();
  const perDomain = { ...current.perDomain, [hostname]: mode };
  return updateSettings({ perDomain });
}

/** 訂閱設定變更（跨 context 同步 UI）。回傳取消訂閱函式。 */
export function onSettingsChanged(callback: (settings: Settings) => void): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName === 'sync' && changes[STORAGE_KEY]) {
      callback(migrateSettings(changes[STORAGE_KEY].newValue));
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
