# 剩餘工作清單（Markdown Expert）

> 最後更新：2026-06-15
> 狀態總覽：**核心功能、測試、Apple 設計、opt-in 分析、官網、上線文件皆已完成**。
> 以下是「上架前必做」「品質潤飾」「未來功能」「自動化收尾」四類剩餘工作。

---

## A. 上架前必做（阻擋上線）

### A1. 填入佔位值
散落在 `site/`、`docs/STORE_LISTING.md`、`docs/LAUNCH.md`，替換成真實值：

- [ ] `CHANGE-ME` → 你的 GitHub 帳號/組織（影響官網連結、raw README 測試網址）
- [ ] `SUPPORT_EMAIL` → 客服信箱（產品專用或 davis.ht.chang@viewsonic.com）
- [ ] `CHROME_WEB_STORE_URL` → 上架後取得的商店連結

> 給我這三個值，我可一次全部替換。

### A2. 開發者帳號與部署
- [ ] 註冊 Chrome Web Store Developer 帳號（一次性費用）
- [ ] 把 repo 推上 GitHub
- [ ] 啟用 GitHub Pages（Settings → Pages → Source 選 **GitHub Actions**）→ 取得隱私政策 URL

### A3. 商店素材
- [x] 128×128 圖示（已從 `md-expert.png` 產生：`store/icon-128.png`）
- [x] 440×280 宣傳圖（已產生草稿：`store/promo-440x280.png`，建議再美化）
- [ ] **3–5 張實際截圖**（1280×800 或 640×400）：閱讀視圖、多篇分頁、側欄、設定頁
- [ ] （選配）1400×560 Marquee、Demo 影片

### A4. 提交
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm zip`
- [ ] 上傳 zip、填 Store Listing（見 `STORE_LISTING.md`）、Privacy practices、Test instructions（見 `LAUNCH.md`）
- [ ] 先以 **Unlisted** 發布給早期使用者測試，再轉 Public

---

## B. 品質潤飾（不阻擋，但建議）

- [ ] **簡化版小尺寸圖示**：目前 16/48px 圖示由完整 logo 縮小，文字在小尺寸不清楚。建議做一個「純文件 M↓↑ 標記」版本給 16/48px（128/商店/官網續用完整 logo）。
- [ ] 宣傳圖 `promo-440x280.png` 美化（目前僅 logo 置中於深色底，可加標語/截圖）。
- [ ] 權限精簡：評估把 `tabs` 改為 `activeTab` 降低審核風險（需回歸測試 popup/側欄取得當前分頁）。
- [ ] 官網英文版（擴大全球觸及）。

---

## C. 未來功能（Roadmap，見 `ROADMAP.md`）

- [ ] Mermaid 圖表、KaTeX 數學（lazy-load，控制 bundle）
- [ ] shiki 非同步語法高亮（不阻塞首屏）
- [ ] 匯出：複製為 HTML、列印／匯出 PDF
- [ ] 鍵盤快捷鍵與無障礙（a11y）強化
- [ ] 偵測準確度迭代（依誤報/漏報回報調整 heuristics）
- [ ] i18n 介面語系

---

## D. 自動化閉環收尾（見 `docs/AUTOMATION.md`）

- [ ] 安裝 Claude GitHub App、設定 `ANTHROPIC_API_KEY`
- [ ] 設定 Chrome Web Store API secrets（`CWS_*`）供 `release.yml`
- [ ] 建立受保護的 `production` environment（required reviewers = 你）
- [ ] 首次手動觸發 `weekly-ideation` 確認能產出發想 Issue

---

## E. 版本控制收尾

- [ ] 目前所有變更尚未 commit。建議開 branch 後分組 commit：
  1. `feat: 偵測強化（line-editor、設定收斂升級、片段抑制）`
  2. `feat: 閱讀視圖鍵盤快捷鍵 + 讚按鈕`
  3. `refactor: 統一 Apple 設計語言與共用 token/樣式`
  4. `feat: opt-in 匿名使用分析（GA4 Measurement Protocol）`
  5. `chore: 官網、上線文件、圖示素材`

---

## 已完成（供對照）

- ✅ MV3 擴充：偵測（5 種來源）、Shadow DOM 渲染、換頁自動偵測、多篇分頁/側欄、設定頁/popup
- ✅ Apple 設計語言（reader 與 sidebar 一致，共用 tokens.css / markdown.css）
- ✅ 鍵盤快捷鍵（T/D/C/Esc）+ 👍 讚按鈕
- ✅ opt-in 匿名分析（GA4 Measurement Protocol，預設關閉，已填 API secret）
- ✅ 測試：32 單元 + 5 E2E 全綠；CI / E2E / release / weekly-ideation workflows
- ✅ 圖示（由 `md-expert.png` 產生 16/48/128）+ favicon + 宣傳圖草稿
- ✅ 官網（`site/`：landing + 隱私政策）+ Pages 部署 workflow
- ✅ 文件：README、CLAUDE.md、ROADMAP、PRIVACY、STORE_LISTING、LAUNCH、AUTOMATION
