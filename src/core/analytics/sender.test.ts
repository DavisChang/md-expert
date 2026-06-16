import { describe, it, expect, vi, beforeEach } from 'vitest';

// 以假設定模擬「已填入 API secret」，才能測 opt-in 邏輯（真實設定預設為空字串）。
vi.mock('./config', () => ({
  ANALYTICS: {
    measurementId: 'G-TEST',
    apiSecret: 'test-secret',
    endpoint: 'https://ga.test/mp/collect',
  },
  AnalyticsEvent: { MarkdownDetected: 'markdown_detected' },
}));

import { sendEvent } from './sender';
import { saveSettings } from '@/core/store/settings';
import { DEFAULT_SETTINGS } from '@/core/store/schema';

describe('sendEvent — opt-in 控制', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true })),
    );
  });

  it('未 opt-in（預設）時不發送任何請求', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, analyticsEnabled: false });
    await sendEvent('markdown_detected', { source_kind: 'raw-page' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('opt-in 後送出，URL 帶 measurement_id 與 api_secret', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, analyticsEnabled: true });
    await sendEvent('markdown_detected', { source_kind: 'raw-page' });
    expect(fetch).toHaveBeenCalledOnce();
    const url = (fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]![0] as string;
    expect(url).toContain('measurement_id=G-TEST');
    expect(url).toContain('api_secret=test-secret');
  });
});
