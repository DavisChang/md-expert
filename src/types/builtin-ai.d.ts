/**
 * Chrome 內建 AI（on-device）全域型別補充。
 * Translator / LanguageDetector 尚未併入 lib.dom.d.ts，這裡補最小可用型別。
 * 參考：https://developer.chrome.com/docs/ai/translator-api
 */

type BuiltinAiAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface BuiltinAiDownloadProgress {
  readonly loaded: number; // 0..1
}

interface BuiltinAiCreateMonitor {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: BuiltinAiDownloadProgress) => void,
  ): void;
}

interface AiTranslator {
  translate(input: string): Promise<string>;
  destroy(): void;
}

interface AiTranslatorFactory {
  availability(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<BuiltinAiAvailability>;
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (m: BuiltinAiCreateMonitor) => void;
  }): Promise<AiTranslator>;
}

interface AiLanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
}

interface AiLanguageDetector {
  detect(input: string): Promise<AiLanguageDetectionResult[]>;
  destroy(): void;
}

interface AiLanguageDetectorFactory {
  availability(): Promise<BuiltinAiAvailability>;
  create(options?: { monitor?: (m: BuiltinAiCreateMonitor) => void }): Promise<AiLanguageDetector>;
}

declare const Translator: AiTranslatorFactory;
declare const LanguageDetector: AiLanguageDetectorFactory;
