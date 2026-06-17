# Markdown Expert

> 在任何網頁上優雅閱讀 Markdown。

[![CI](https://github.com/DavisChang/md-expert/actions/workflows/ci.yml/badge.svg)](https://github.com/DavisChang/md-expert/actions/workflows/ci.yml)
[![E2E](https://github.com/DavisChang/md-expert/actions/workflows/e2e.yml/badge.svg)](https://github.com/DavisChang/md-expert/actions/workflows/e2e.yml)
[![Website](https://github.com/DavisChang/md-expert/actions/workflows/pages.yml/badge.svg)](https://github.com/DavisChang/md-expert/actions/workflows/pages.yml)

[English](./README.md) · [官方網站](https://davischang.github.io/md-expert/) · [隱私政策](https://davischang.github.io/md-expert/privacy.html)

Markdown Expert 是一個 Chrome Manifest V3 擴充，會在網頁中偵測 Markdown，並渲染成專注、好讀的閱讀介面。它支援 raw `.md` 檔、GitHub/GitLab raw 頁面、網頁內嵌 Markdown、線上編輯器，以及本機 Markdown 檔。

核心原則很直接：**讓 Markdown 更好讀，同時不把頁面內容送出你的裝置**。

## 為什麼需要它

Markdown 常出現在不適合閱讀的地方：

- 直接在瀏覽器開啟的 raw 檔案，
- 公司內部或個人專案輸出的純文字文件，
- 網頁應用裡產生的 Markdown 預覽，
- issue template、筆記、線上編輯器內容，
- 從本機磁碟開啟的 `.md` 檔。

Markdown Expert 會把這些內容轉成一致的閱讀體驗，包含標題、表格、任務清單、程式碼區塊、語法高亮與目錄導覽。

## 功能

- **自動偵測**：辨識 raw 頁面、遠端 raw 檔、網頁內嵌區塊、線上編輯器與本機 Markdown。
- **閱讀器介面**：將 Markdown 渲染成乾淨版面，並提供工具列與鍵盤快捷鍵。
- **Shadow DOM 隔離**：避免原頁 CSS 影響閱讀器，也避免閱讀器樣式污染原頁。
- **換頁感知**：支援整頁重載、SPA 軟導覽，以及延遲出現的 DOM 內容。
- **每網域行為設定**：可針對不同網域選擇自動開啟、顯示提示或略過。
- **多篇文件支援**：多份 Markdown 以分頁切換；數量較多時改用 Chrome side panel。
- **隱私優先預設**：不蒐集頁面內容、Markdown 內容、網址、標題、截圖或表單資料。

## 支援來源

| 來源 | 狀態 | 說明 |
| --- | --- | --- |
| Raw `.md` 頁面 | 支援 | 直接在瀏覽器開啟的純文字 Markdown。 |
| GitHub / GitLab raw 檔 | 支援 | 偵測常見 raw Markdown URL。 |
| 網頁內嵌區塊 | 支援 | 掃描 `<pre>`、`<textarea>` 與 code-like blocks。 |
| 線上編輯器 | 支援 | 偵測 Markdown-like 內容，不上傳資料。 |
| 本機 `file://` Markdown | 支援 | 需在 Chrome 擴充設定中允許檔案網址存取。 |
| 一頁多篇文件 | 支援 | 使用分頁或 Chrome side panel 呈現。 |

## 開發版安裝

目前 README 不把本專案描述成已上架 Chrome Web Store 的正式套件。若要在本機測試，請載入未封裝版本：

```bash
pnpm install
pnpm build
```

接著：

1. 開啟 `chrome://extensions`。
2. 啟用 **Developer mode / 開發人員模式**。
3. 點選 **Load unpacked / 載入未封裝項目**。
4. 選擇產生的 `dist/` 目錄。

開發時可使用：

```bash
pnpm dev
```

## 鍵盤快捷鍵

在閱讀器中：

| 按鍵 | 動作 |
| --- | --- |
| `T` | 切換目錄。 |
| `D` | 切換主題。 |
| `C` | 複製原始 Markdown。 |
| `Esc` | 關閉閱讀器。 |

## 隱私

Markdown Expert 的設計是讓內容在本機處理。

| 資料 / 權限 | 行為 |
| --- | --- |
| 頁面內容 | 僅在本機處理，不傳輸。 |
| Markdown 內容 | 僅在本機處理，不傳輸。 |
| URL / 標題 | 預設匿名統計不蒐集。 |
| `storage` | 儲存閱讀偏好與每網域行為。 |
| `tabs` | 偵測換頁並更新擴充狀態。 |
| `sidePanel` | 顯示較多 Markdown 文件。 |
| Google Analytics host permission | 只有在使用者開啟匿名統計時才動態請求。 |

匿名統計是 opt-in，預設關閉。開啟後只傳送粗略互動事件，例如功能使用情況；不包含頁面內容、Markdown 內容、網址或個資。

更多資訊請見 [隱私政策](https://davischang.github.io/md-expert/privacy.html) 與 [隱私權說明](./docs/PRIVACY.md)。

## 開發

需求：

- Node.js 20+
- pnpm 9.7.0，由 `packageManager` 管理

常用指令：

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm zip
```

指令說明：

- `pnpm lint`：ESLint，不允許 warning。
- `pnpm typecheck`：TypeScript 型別檢查。
- `pnpm test`：Vitest 單元測試。
- `pnpm build`：產出 production extension build 到 `dist/`。
- `pnpm e2e`：用 Playwright 載入已建置擴充並測試。
- `pnpm zip`：產生可上傳商店的壓縮檔。

## 架構

```text
src/
├── core/        # detect、render、store、analytics、messaging
├── ui/          # Preact reader components
└── entries/     # content、background、popup、options、sidepanel
```

架構上會把 Chrome extension API 邊界集中在 entrypoint 層。核心偵測與渲染邏輯維持可測試，UI 則透過隔離機制避免被任意宿主頁樣式干擾。

## 自動化

目前 GitHub Actions 包含：

- `CI`：lint、typecheck、unit tests、build、bundle-size guard。
- `E2E`：載入已建置擴充的 Playwright 測試。
- `Deploy Website`：將 `site/` 發佈到 GitHub Pages。
- `Release`：打包擴充，並透過 production environment 人工核可。

## 專案文件

- [Roadmap](./ROADMAP.md)
- [Launch checklist](./docs/LAUNCH.md)
- [Store listing draft](./docs/STORE_LISTING.md)
- [Automation notes](./docs/AUTOMATION.md)
- [Remaining work](./docs/REMAINING-WORK.md)

## 授權

[MIT](./LICENSE)
