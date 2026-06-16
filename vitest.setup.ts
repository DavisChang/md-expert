/**
 * Vitest 全域設定：在 jsdom 環境中提供最小的 chrome.* stub，
 * 讓依賴 chrome.storage 的模組在單元測試中不致崩潰。
 * 真正的瀏覽器行為由 Playwright E2E 驗證。
 */
import { vi } from 'vitest';

function makeArea() {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn(async (keys?: string | string[] | Record<string, unknown>) => {
      if (keys == null) return Object.fromEntries(store);
      const list =
        typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      const out: Record<string, unknown> = {};
      for (const k of list) if (store.has(k)) out[k] = store.get(k);
      return out;
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(items)) store.set(k, v);
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const list = typeof keys === 'string' ? [keys] : keys;
      for (const k of list) store.delete(k);
    }),
  };
}

const chromeStub = {
  storage: {
    sync: makeArea(),
    local: makeArea(),
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    id: 'test-extension-id',
  },
  tabs: {
    onUpdated: { addListener: vi.fn() },
    sendMessage: vi.fn(),
  },
} as unknown as typeof chrome;

vi.stubGlobal('chrome', chromeStub);
