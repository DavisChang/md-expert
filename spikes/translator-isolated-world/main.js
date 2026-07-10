// 在 MAIN world 執行（manifest 指定 world:"MAIN"）——對照組。
(async () => {
  const tag = '[SPIKE-MAIN]';
  const hasTranslator = 'Translator' in self;
  console.log(
    tag,
    'world=main',
    'runtimeId=' + ((typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) || 'null'),
    'Translator_in_self=' + hasTranslator,
  );
  if (hasTranslator) {
    try {
      const a = await self.Translator.availability({ sourceLanguage: 'en', targetLanguage: 'zh-Hant' });
      console.log(tag, 'availability en->zh-Hant =', a);
    } catch (e) {
      console.log(tag, 'availabilityError', String(e));
    }
  }
})();
