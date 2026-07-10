import type { TranslatorHandle } from './types';

export interface TranslateOptions {
  /** 同時翻譯的段落數上限（避免壓垮 on-device 模型）。 */
  concurrency?: number;
  /** 進度回呼：已完成段落數 / 總段落數。 */
  onProgress?: (done: number, total: number) => void;
  /** 中止訊號（切換文件/關閉時取消）。 */
  signal?: AbortSignal;
}

const DEFAULT_CONCURRENCY = 4;

/**
 * 逐段翻譯一組文字，維持與輸入相同順序回傳。
 * - 以固定並發的 worker pool 處理，避免同時發太多請求。
 * - 容錯：單段翻譯失敗時回傳「原文」，不中斷整體。
 * - 支援中止：`signal` 觸發時丟出 AbortError。
 * 純函式（provider 由參數注入），便於單元測試。
 */
export async function translateTexts(
  handle: Pick<TranslatorHandle, 'translate'>,
  texts: string[],
  options: TranslateOptions = {},
): Promise<string[]> {
  const total = texts.length;
  const results = new Array<string>(total);
  if (total === 0) return results;

  const concurrency = Math.max(1, Math.min(options.concurrency ?? DEFAULT_CONCURRENCY, total));
  let cursor = 0;
  let done = 0;

  const runNext = async (): Promise<void> => {
    while (cursor < total) {
      if (options.signal?.aborted) {
        throw new DOMException('翻譯已取消', 'AbortError');
      }
      const index = cursor;
      cursor += 1;
      const source = texts[index]!;
      try {
        results[index] = await handle.translate(source);
      } catch {
        results[index] = source; // 單段失敗 → 回原文
      }
      done += 1;
      options.onProgress?.(done, total);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => runNext()));
  return results;
}
