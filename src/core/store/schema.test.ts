import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  effectiveAutoExpand,
  migrateSettings,
  SETTINGS_VERSION,
} from './schema';

describe('migrateSettings', () => {
  it('對 null/非物件回傳預設值', () => {
    expect(migrateSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings('garbage')).toEqual(DEFAULT_SETTINGS);
  });

  it('補齊殘缺欄位並設定版本', () => {
    const result = migrateSettings({ theme: 'dark' });
    expect(result.theme).toBe('dark');
    expect(result.version).toBe(SETTINGS_VERSION);
    expect(result.defaultAutoExpand).toBe(DEFAULT_SETTINGS.defaultAutoExpand);
    expect(result.perDomain).toEqual({});
  });

  it('保留有效的 perDomain', () => {
    const result = migrateSettings({ perDomain: { 'a.com': 'auto' } });
    expect(result.perDomain['a.com']).toBe('auto');
  });

  it('分析預設關閉（opt-in），並保留使用者選擇', () => {
    expect(migrateSettings({}).analyticsEnabled).toBe(false);
    expect(migrateSettings({ analyticsEnabled: true }).analyticsEnabled).toBe(true);
  });

  it('翻譯目標語言：缺漏/非字串補預設，保留有效字串', () => {
    expect(migrateSettings({}).translateTarget).toBe(DEFAULT_SETTINGS.translateTarget);
    expect(migrateSettings({ translateTarget: 123 }).translateTarget).toBe(
      DEFAULT_SETTINGS.translateTarget,
    );
    expect(migrateSettings({ translateTarget: '' }).translateTarget).toBe(
      DEFAULT_SETTINGS.translateTarget,
    );
    expect(migrateSettings({ translateTarget: 'ja' }).translateTarget).toBe('ja');
  });
});

describe('effectiveAutoExpand', () => {
  it('per-domain 覆寫全域預設', () => {
    const s = migrateSettings({ defaultAutoExpand: 'prompt', perDomain: { 'a.com': 'auto' } });
    expect(effectiveAutoExpand(s, 'a.com')).toBe('auto');
    expect(effectiveAutoExpand(s, 'b.com')).toBe('prompt');
  });
});
