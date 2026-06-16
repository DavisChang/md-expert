# CLAUDE.md — Markdown Expert 開發規範

本檔是 Claude（互動式與 GitHub Actions 自動開發）在本專案的最高行為準則。修改架構或慣例時，請同步更新本檔。

## 專案是什麼
一個 Chrome（MV3）擴充：在任何網頁中偵測 Markdown，渲染成好讀的格式；換頁自動偵測、可決定是否展開；多篇以分頁/側欄呈現。目標是經營成「自我演進、人工核可上線」的開源專案。

## 核心原則（不可違背）
1. **隱私優先**：所有內容處理在本機完成；預設不蒐集、不上傳任何資料。唯一例外是使用者**主動 opt-in（預設關閉）**的匿名使用統計（GA4 Measurement Protocol），且只送匿名互動事件——**絕不**含網頁內容、Markdown 內容、網址或個資。新功能不得違反此界線；任何分析事件都須是匿名且 opt-in 受控（見 `core/analytics`）。
2. **安全**：content script 注入頁面的 HTML 一律經 `src/core/render/sanitize.ts`（DOMPurify）淨化。新增渲染路徑必須沿用淨化。
3. **輕量易用**：尊重 bundle size guard（`scripts/check-bundle-size.mjs`）。大型相依優先考慮 lazy-load。UI 以「好懂、好用」為先。
4. **最小權限**：不要無故新增 manifest 權限；若新增，需在 PR 與 `docs/PRIVACY.md` 說明理由。

## 架構分層（務必遵守）
- `src/core/**`：純邏輯，**不可** import `chrome.*` 或直接碰 DOM 全域（透過參數傳入）。必須可單元測試。
  - `detect/`：偵測策略。新增來源＝新增一個 `Detector` 並註冊到 `registry.ts`。
  - `render/`：markdown → 安全 HTML 管線。
  - `store/`：唯一封裝 `chrome.storage` 的地方（`settings.ts`）。
- `src/ui/**`：Preact 元件，殼層共用，不直接呼叫 chrome API。
  - `theme/tokens.css`：**設計 token 單一真相來源**（Apple 色票，亮/暗/復古），閱讀視圖 (:host) 與側欄/頁面 (:root) 共用，以 `[data-theme]` 屬性切換。
  - `theme/markdown.css`：**共用 `.markdown-body` 內文樣式**，閱讀視圖與側欄共用，確保兩邊呈現一致。
  - `theme/theme.ts`：`resolveTheme`/`applyTheme`，把使用者主題寫入 `[data-theme]`。
  - `theme/reader.css`：僅閱讀視圖外框（注入 Shadow DOM）。
  - 改配色 → 只動 `tokens.css`；改內文樣式 → 只動 `markdown.css`。**不要**在 `reader.css`/`sidepanel.css` 重複定義 token 或內文樣式。
- `src/entries/**`：擴充殼層（content / background / popup / options / sidepanel），負責橋接 chrome API 與 core/ui。側欄需 `import` `tokens.css` + `markdown.css` 才能與閱讀視圖一致。

## 程式碼慣例
- TypeScript strict；避免 `any`（必要時加註說明）。
- 註解與面向使用者的字串使用**繁體中文**；識別字用英文。
- 沿用既有風格（Prettier 設定：單引號、分號、trailing comma、printWidth 100）。

## Definition of Done（每個 PR）
- [ ] `pnpm lint` 無錯
- [ ] `pnpm typecheck` 無錯
- [ ] `pnpm test` 全綠；**新邏輯（尤其 core/）必須附單元測試**
- [ ] `pnpm build` 成功且 bundle size guard 通過
- [ ] 影響到偵測/渲染/多頁流程時，更新或新增 Playwright E2E（`e2e/`）
- [ ] 權限或隱私有變動時，更新 `docs/PRIVACY.md` 與 PR 描述
- [ ] PR 描述說明「為什麼」與「如何驗證」

## 自動化閉環中的角色
- **發想**：每週 `/market-scan` 開 ideation Issue（只建議，不改碼）。
- **規格**：`/feature-spec` 把同意的想法轉成可實作規格。
- **開發**：在 Issue/PR `@claude` 觸發實作，遵守上面 DoD，開 PR 等人工 review。
- **發版**：`/release-prep` 準備到「只差核可」；發布永遠經 `production` environment 人工核可。

## 常用指令
- 開發：`pnpm dev`（Chrome 載入 `dist/` 未封裝擴充）
- 驗證：`pnpm lint && pnpm typecheck && pnpm test && pnpm build`
- E2E：`pnpm build && pnpm e2e`
- 打包：`pnpm zip`
