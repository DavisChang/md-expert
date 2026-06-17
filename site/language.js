const LANGUAGE_KEY = 'markdown-expert-language';
const supportedLanguages = new Set(['en', 'zh']);

function getInitialLanguage() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('lang');
  if (supportedLanguages.has(requested)) {
    return requested;
  }

  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  if (supportedLanguages.has(stored)) {
    return stored;
  }

  return 'en';
}

function applyLanguage(language) {
  const current = supportedLanguages.has(language) ? language : 'en';
  document.documentElement.lang = current === 'zh' ? 'zh-Hant' : 'en';
  window.localStorage.setItem(LANGUAGE_KEY, current);

  document.querySelectorAll('[data-en][data-zh]').forEach((element) => {
    element.textContent = element.dataset[current];
  });

  document.querySelectorAll('[data-lang-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.langPanel !== current;
  });

  document.querySelectorAll('[data-language-toggle]').forEach((button) => {
    button.textContent = current === 'zh' ? 'English' : '中文';
    button.setAttribute('aria-label', current === 'zh' ? 'Switch to English' : '切換成中文');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  let currentLanguage = getInitialLanguage();
  applyLanguage(currentLanguage);

  document.querySelectorAll('[data-language-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
      applyLanguage(currentLanguage);
    });
  });
});
