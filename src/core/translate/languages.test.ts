import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TARGET_LANGUAGE,
  isSupportedTarget,
  normalizeTarget,
  TARGET_LANGUAGES,
} from './languages';

describe('目標語言清單', () => {
  it('預設語言在清單內', () => {
    expect(isSupportedTarget(DEFAULT_TARGET_LANGUAGE)).toBe(true);
  });

  it('語言碼皆唯一', () => {
    const codes = TARGET_LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('normalizeTarget 收斂不支援值為預設', () => {
    expect(normalizeTarget('en')).toBe('en');
    expect(normalizeTarget('xx-YY')).toBe(DEFAULT_TARGET_LANGUAGE);
    expect(normalizeTarget(undefined)).toBe(DEFAULT_TARGET_LANGUAGE);
    expect(normalizeTarget(123)).toBe(DEFAULT_TARGET_LANGUAGE);
  });
});
