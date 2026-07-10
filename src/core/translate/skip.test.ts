import { describe, expect, it } from 'vitest';
import { isSkippableTag, isTranslatableText } from './skip';

describe('isSkippableTag', () => {
  it('程式碼/鍵盤/腳本類標籤要跳過（大小寫不敏感）', () => {
    for (const tag of ['code', 'PRE', 'Kbd', 'samp', 'var', 'script', 'style', 'textarea']) {
      expect(isSkippableTag(tag)).toBe(true);
    }
  });

  it('一般內文標籤不跳過', () => {
    for (const tag of ['p', 'div', 'h1', 'li', 'a', 'span', 'td']) {
      expect(isSkippableTag(tag)).toBe(false);
    }
  });
});

describe('isTranslatableText', () => {
  it('含字母的文字要翻譯', () => {
    expect(isTranslatableText('Hello world')).toBe(true);
    expect(isTranslatableText('這是中文')).toBe(true);
    expect(isTranslatableText('See http://x.com for more')).toBe(true);
  });

  it('空白/純數字/純標點/emoji 不翻譯', () => {
    expect(isTranslatableText('   ')).toBe(false);
    expect(isTranslatableText('\n\t')).toBe(false);
    expect(isTranslatableText('12345')).toBe(false);
    expect(isTranslatableText('### ---')).toBe(false);
    expect(isTranslatableText('🎉🎉')).toBe(false);
  });

  it('純網址不翻譯', () => {
    expect(isTranslatableText('https://example.com/path')).toBe(false);
    expect(isTranslatableText('www.example.com')).toBe(false);
  });
});
