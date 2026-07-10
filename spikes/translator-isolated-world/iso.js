// 在 content script 的 ISOLATED world 執行（預設）。
(async () => {
  const tag = '[SPIKE-ISO]';
  const hasTranslator = 'Translator' in self;
  const hasDetector = 'LanguageDetector' in self;
  console.log(
    tag,
    'world=isolated',
    'runtimeId=' + ((typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) || 'null'),
    'Translator_in_self=' + hasTranslator,
    'LanguageDetector_in_self=' + hasDetector,
  );
  if (hasTranslator) {
    try {
      const a = await self.Translator.availability({ sourceLanguage: 'en', targetLanguage: 'zh-Hant' });
      console.log(tag, 'availability en->zh-Hant =', a, '=> ISOLATED WORLD 可直接用，R1 走直接路徑');
    } catch (e) {
      console.log(tag, 'availabilityError', String(e));
    }
  } else {
    console.log(tag, '=> ISOLATED WORLD 沒有 Translator，R1 需走 offscreen / main-world 注入 fallback');
  }
})();
