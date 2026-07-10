# Spike：content script isolated world 能否取用 Translator API

驗證 [`docs/specs/translation-builtin-ai.md`](../../docs/specs/translation-builtin-ai.md) 的 **R1** 風險：
Chrome 內建 `Translator` API 官方文件只列出「top-level window、同源 iframe、跨源 iframe（需 permission policy）」為可用情境，**未提及 content script**。而本擴充的閱讀視圖由 content script 注入，其 JS 跑在 **isolated world**。此 spike 直接實測 isolated world 是否暴露該 API。

## 內容
- `iso.js`：content script 預設的 **isolated world** 探測。
- `main.js`：`world:"MAIN"` 的 **main world** 對照組。
- 兩者都只讀 `'Translator' in self` 與 `Translator.availability(...)`，**不下載模型、不改動頁面內容**。

## 如何跑
1. `chrome://extensions` → 開啟「開發人員模式」。
2. 「載入未封裝項目」→ 選本資料夾。
3. 開 / 重新整理 <https://example.com>。
4. 開該分頁的 DevTools Console，看兩行 log：
   - `[SPIKE-ISO] ... Translator_in_self=<true|false>`
   - `[SPIKE-MAIN] ... Translator_in_self=<true|false>`

## 判讀
- `[SPIKE-ISO] Translator_in_self=true` → isolated world 可直接用 → R1 走**直接路徑**（最省事、免加權限）。
- `[SPIKE-ISO] Translator_in_self=false` 但 `[SPIKE-MAIN]=true` → 需 **main-world 注入或 offscreen document** fallback（PR#1 依此調整，offscreen 需加 `offscreen` 權限並於 PRIVACY 說明）。

## 備註
- 這是**拋棄式驗證工具**，非產品程式碼；已排除於 eslint（`spikes/**`）。測完可在 `chrome://extensions` 移除擴充。
- 環境需 Chrome 138+（實測機為 149）。
