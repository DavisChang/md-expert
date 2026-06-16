# Markdown Expert

> 在任何網頁中偵測 Markdown，渲染成好讀的格式。換頁自動偵測，多篇以分頁／側欄呈現。

一個 Chrome（Manifest V3）擴充，並以「**自我演進、人工核可上線**」的方式經營：發想 → 開發 → 優化 → 上版 → 驗證形成封閉迴路。

## 功能（第一階段）
- **偵測網頁中的 Markdown**：支援四種來源
  - 原始 `.md` 純文字頁面
  - GitHub / GitLab 等 raw 檔案
  - 一般網頁內嵌的 markdown 區塊（`<pre>` / `<textarea>` / code block）
  - 本地 `file://` 的 `.md`（需於擴充頁開啟「允許存取檔案網址」）
- **好讀的渲染**：GFM、表格、任務清單、程式碼、目錄（TOC），以 Shadow DOM 與宿主頁面雙向隔離。
- **換頁自動偵測**：支援 SPA 軟導覽與整頁載入。
- **可決定是否展開**：每網域三態（自動展開／顯示提示／略過），記住你的選擇。
- **多篇呈現**：偵測到多篇時以分頁切換；數量多時改用側邊面板。
- **隱私優先**：所有處理在本機完成，不蒐集任何資料。

## 開發

需求：Node 20+、pnpm 9+。

```bash
pnpm install
pnpm dev          # 啟動 Vite；在 chrome://extensions 載入未封裝的 dist/
```

驗證：

```bash
pnpm lint
pnpm typecheck
pnpm test         # Vitest 單元測試
pnpm build        # 產出 dist/
pnpm e2e          # Playwright 載入擴充端對端測試（先 build）
pnpm zip          # 打包成可上傳商店的 zip
```

### 在 Chrome 載入
1. `pnpm build`（或 `pnpm dev`）
2. 開 `chrome://extensions`，開啟「開發人員模式」
3. 「載入未封裝項目」選擇 `dist/`

## 架構

```
src/
├── core/        # 純邏輯（detect / render / store / messaging），可單元測試、不碰 chrome.*
├── ui/          # Preact 元件（Reader / Toolbar / Toc / MultiDocTabs / Fab）
└── entries/     # 擴充殼層（content / background / popup / options / sidepanel）
```

詳細規範見 [CLAUDE.md](./CLAUDE.md)，路線圖見 [ROADMAP.md](./ROADMAP.md)。

## 自動化閉環
- **發想**：每週 GitHub Actions 跑 `/market-scan` 開 ideation Issue。
- **開發**：在 Issue/PR 留言 `@claude` 觸發自動實作並開 PR。
- **優化**：CI（lint／typecheck／test／build／bundle-size／E2E）守門。
- **上版**：`release.yml` 打包，發布到 Chrome Web Store 需在 `production` environment 人工核可。

## 授權
[MIT](./LICENSE)
