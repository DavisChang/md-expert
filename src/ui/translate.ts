/**
 * 內建 AI 翻譯的 UI 層轉接：唯一直接碰 Chrome 內建 `Translator` / `LanguageDetector`
 * 全域與 DOM 走訪之處（比照 `math.ts` / `mermaid.ts` 的先例）。
 * 純邏輯（批次/跳過規則/語言挑選）在 `@/core/translate`。
 */
import type {
  LanguageDetectorProvider,
  TranslatorHandle,
  TranslatorProvider,
} from '@/core/translate/types';
import { isTranslatableText, SKIP_ANCESTOR_SELECTOR } from '@/core/translate/skip';
import { translateTexts, type TranslateOptions } from '@/core/translate/orchestrate';

/** 內建翻譯 API 是否可用（feature detection）。 */
export function isTranslationSupported(): boolean {
  return typeof globalThis !== 'undefined' && 'Translator' in globalThis;
}

/** 內建語言偵測 API 是否可用。 */
export function isDetectionSupported(): boolean {
  return typeof globalThis !== 'undefined' && 'LanguageDetector' in globalThis;
}

/** 以 Chrome 內建 Translator 實作的 provider。 */
export const chromeTranslator: TranslatorProvider = {
  async availability({ source, target }) {
    if (!isTranslationSupported()) return 'unavailable';
    return Translator.availability({ sourceLanguage: source, targetLanguage: target });
  },
  async create({ source, target }, onDownload) {
    const instance = await Translator.create({
      sourceLanguage: source,
      targetLanguage: target,
      monitor: (m) => m.addEventListener('downloadprogress', (e) => onDownload?.(e.loaded)),
    });
    return {
      translate: (text: string) => instance.translate(text),
      destroy: () => instance.destroy(),
    };
  },
};

/** 以 Chrome 內建 LanguageDetector 實作的 provider。 */
export const chromeLanguageDetector: LanguageDetectorProvider = {
  async isAvailable() {
    if (!isDetectionSupported()) return false;
    return (await LanguageDetector.availability()) !== 'unavailable';
  },
  async detect(text) {
    const detector = await LanguageDetector.create();
    try {
      const results = await detector.detect(text);
      return results.map((r) => ({ language: r.detectedLanguage, confidence: r.confidence }));
    } finally {
      detector.destroy();
    }
  },
};

/**
 * 收集 root 內「可翻譯」的文字節點，跳過程式碼/數學/Mermaid 等容器。
 * 匯出以便單元測試。
 */
export function collectTranslatableNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!isTranslatableText(node.nodeValue ?? '')) return NodeFilter.FILTER_REJECT;
      const parent = (node as Text).parentElement;
      if (!parent || parent.closest(SKIP_ANCESTOR_SELECTOR)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push(n as Text);
  }
  return nodes;
}

/** 已完成翻譯的控制器：可無損切換原文/譯文。 */
export interface ArticleTranslation {
  showOriginal(): void;
  showTranslation(): void;
}

/**
 * 就地翻譯 article 內的文字節點，回傳可切換原文/譯文的控制器。
 * 只替換純文字節點內容、不引入新標記，故無需再淨化，且格式/連結/程式碼完全不動。
 */
export async function translateArticle(
  article: HTMLElement,
  handle: Pick<TranslatorHandle, 'translate'>,
  options: TranslateOptions = {},
): Promise<ArticleTranslation> {
  const nodes = collectTranslatableNodes(article);
  const originals = nodes.map((n) => n.nodeValue ?? '');
  const translated = await translateTexts(handle, originals, options);
  nodes.forEach((n, i) => {
    n.nodeValue = translated[i]!;
  });
  return {
    showOriginal() {
      nodes.forEach((n, i) => {
        n.nodeValue = originals[i]!;
      });
    },
    showTranslation() {
      nodes.forEach((n, i) => {
        n.nodeValue = translated[i]!;
      });
    },
  };
}
