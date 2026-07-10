# ROADMAP

本檔記錄已完成與規劃中的工作，供每週 `/market-scan` 對照、避免重複建議。

## ✅ 第一階段（M0–M6 已完成基礎）
- 專案骨架：Vite + CRXJS + Preact + TS strict、ESLint/Prettier。
- 核心渲染：markdown-it 管線 + DOMPurify 淨化 + Shadow DOM 隔離 + TOC。
- 偵測層：raw-page / raw-remote / in-page-block / file-url 四種 detector + 信心評分。
- 換頁自動偵測：SPA（history/MutationObserver）+ 整頁（tabs.onUpdated）。
- 互動偏好：每網域三態規則、主題（亮/暗/復古/系統）、字級、信心門檻；popup + options。
- 多篇呈現：分頁切換 + Side Panel。
- 測試/CI：Vitest 單元、Playwright E2E、CI/E2E workflows、bundle size guard。
- 自動化閉環：CLAUDE.md、market-scan/feature-spec/release-prep skills、claude-dev/weekly-ideation/release workflows。

## 🚧 待辦 / 候選（依序為粗略優先級）
- [x] 內建 AI 翻譯（PR#1，閱讀視圖）：Chrome Translator + Language Detector API，on-device、零新增權限、可切換原文/譯文。規格見 [`docs/specs/translation-builtin-ai.md`](./docs/specs/translation-builtin-ai.md)。後續（PR#2）：side panel 對齊、更多語言、可視區優先、並排對照。
- [ ] 上架素材：正式圖示（取代佔位）、商店截圖、隱私說明定稿。
- [ ] 首次送審 Chrome Web Store。
- [ ] 渲染增強（第二階段）：Mermaid 圖表、KaTeX 數學（lazy-load，避免膨脹 bundle）。
- [ ] shiki 非同步語法高亮（不阻塞首屏）。
- [ ] 匯出：複製為 HTML、列印/匯出 PDF。
- [ ] 鍵盤快捷鍵與無障礙（a11y）強化。
- [ ] 偵測準確度迭代：依誤報/漏報回報調整 heuristics 權重。
- [ ] i18n：英文等介面語系。

## 🧭 原則
新增功能須符合 [CLAUDE.md](./CLAUDE.md) 的核心原則：隱私優先、安全淨化、輕量易用、最小權限。
