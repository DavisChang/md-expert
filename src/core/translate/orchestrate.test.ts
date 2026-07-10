import { describe, expect, it, vi } from 'vitest';
import { translateTexts } from './orchestrate';

/** 建立一個把文字轉大寫的假翻譯器，可注入延遲與並發追蹤。 */
function fakeHandle(opts: { delay?: number; onConcurrency?: (n: number) => void } = {}) {
  let active = 0;
  return {
    translate: vi.fn(async (text: string) => {
      active += 1;
      opts.onConcurrency?.(active);
      if (opts.delay) await new Promise((r) => setTimeout(r, opts.delay));
      active -= 1;
      return text.toUpperCase();
    }),
  };
}

describe('translateTexts', () => {
  it('翻譯全部並維持原順序', async () => {
    const handle = fakeHandle();
    const out = await translateTexts(handle, ['a', 'b', 'c']);
    expect(out).toEqual(['A', 'B', 'C']);
    expect(handle.translate).toHaveBeenCalledTimes(3);
  });

  it('空輸入回空陣列，不呼叫翻譯', async () => {
    const handle = fakeHandle();
    expect(await translateTexts(handle, [])).toEqual([]);
    expect(handle.translate).not.toHaveBeenCalled();
  });

  it('回報進度：done 遞增至 total', async () => {
    const handle = fakeHandle();
    const progress: Array<[number, number]> = [];
    await translateTexts(handle, ['a', 'b', 'c'], {
      onProgress: (done, total) => progress.push([done, total]),
    });
    expect(progress.length).toBe(3);
    expect(progress.at(-1)).toEqual([3, 3]);
    expect(progress.map((p) => p[0])).toEqual([1, 2, 3]);
  });

  it('並發不超過上限', async () => {
    let peak = 0;
    const handle = fakeHandle({ delay: 5, onConcurrency: (n) => (peak = Math.max(peak, n)) });
    await translateTexts(handle, ['a', 'b', 'c', 'd', 'e', 'f'], { concurrency: 2 });
    expect(peak).toBeLessThanOrEqual(2);
  });

  it('單段失敗時回退為原文，其餘正常', async () => {
    const handle = {
      translate: vi.fn(async (text: string) => {
        if (text === 'b') throw new Error('boom');
        return text.toUpperCase();
      }),
    };
    const out = await translateTexts(handle, ['a', 'b', 'c']);
    expect(out).toEqual(['A', 'b', 'C']);
  });

  it('signal 已中止時丟出 AbortError', async () => {
    const handle = fakeHandle();
    const controller = new AbortController();
    controller.abort();
    await expect(translateTexts(handle, ['a', 'b'], { signal: controller.signal })).rejects.toThrow(
      /取消|abort/i,
    );
  });
});
