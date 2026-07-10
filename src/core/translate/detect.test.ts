import { describe, expect, it } from 'vitest';
import { baseLanguage, isSameLanguage, pickSourceLanguage } from './detect';

describe('pickSourceLanguage', () => {
  it('挑最高信心的語言', () => {
    expect(
      pickSourceLanguage([
        { language: 'en', confidence: 0.9 },
        { language: 'de', confidence: 0.4 },
      ]),
    ).toBe('en');
  });

  it('排除 und（未定）', () => {
    expect(
      pickSourceLanguage([
        { language: 'und', confidence: 0.99 },
        { language: 'ja', confidence: 0.8 },
      ]),
    ).toBe('ja');
  });

  it('全部低於門檻回 null', () => {
    expect(pickSourceLanguage([{ language: 'en', confidence: 0.3 }])).toBeNull();
  });

  it('空結果回 null', () => {
    expect(pickSourceLanguage([])).toBeNull();
  });

  it('可自訂門檻', () => {
    expect(pickSourceLanguage([{ language: 'en', confidence: 0.35 }], 0.3)).toBe('en');
  });
});

describe('baseLanguage / isSameLanguage', () => {
  it('取基礎語言', () => {
    expect(baseLanguage('zh-Hant')).toBe('zh');
    expect(baseLanguage('EN')).toBe('en');
  });

  it('基礎語言相同即同語言', () => {
    expect(isSameLanguage('zh', 'zh-Hant')).toBe(true);
    expect(isSameLanguage('zh-Hans', 'zh-Hant')).toBe(true);
    expect(isSameLanguage('en', 'zh-Hant')).toBe(false);
  });
});
