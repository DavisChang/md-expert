# Chrome Web Store Listing Kit

Prepared for the first Chrome Web Store submission of **Markdown Expert**.

Official references checked on 2026-06-17:

- Chrome Web Store listing fields: https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- Privacy fields: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- Program policies: https://developer.chrome.com/docs/webstore/program-policies

## Submission Metadata

| Field | Value |
| --- | --- |
| Name | Markdown Expert |
| Category | Productivity |
| Default language | English |
| Website / homepage URL | https://davischang.github.io/md-expert/ |
| Privacy policy URL | https://davischang.github.io/md-expert/privacy.html |
| Support URL | https://github.com/DavisChang/md-expert/issues |
| Pricing | Free |
| Visibility recommendation | Start with Unlisted beta, then switch to Public |
| Mature content | No |

## English Listing

### Short Description

```text
Detect Markdown on any web page and render it into a clean, focused reading view.
```

### Detailed Description

```text
Markdown Expert makes Markdown easier to read wherever it appears in Chrome.

It detects Markdown on raw .md pages, GitHub/GitLab raw files, embedded page blocks, online editors, and local Markdown files, then renders it into a focused reader with clean typography and navigation.

Key features:
• Automatic Markdown detection across raw pages, embedded blocks, editors, and local files
• Clean rendering for headings, tables, task lists, code blocks, syntax highlighting, and table of contents
• Shadow DOM isolation so page styles and reader styles do not interfere with each other
• Navigation-aware detection for full reloads, single-page apps, and delayed content
• Per-domain behavior controls: auto-open, prompt, or skip
• Multi-document support with tabs and side panel presentation
• Privacy-first design: content is processed locally in your browser

Privacy:
Markdown Expert does not collect page content, Markdown content, URLs, page titles, screenshots, form data, or personal information. Optional anonymous analytics are off by default and only send coarse interaction events when explicitly enabled.

Open source:
https://github.com/DavisChang/md-expert
```

## Traditional Chinese Localization

### 簡短說明

```text
在任何網頁偵測 Markdown，渲染成乾淨、專注的閱讀介面。
```

### 詳細說明

```text
Markdown Expert 讓你在 Chrome 中更輕鬆閱讀 Markdown。

它可以偵測 raw .md 頁面、GitHub/GitLab raw 檔、網頁內嵌區塊、線上編輯器與本機 Markdown 檔，並渲染成乾淨、專注的閱讀介面。

主要功能：
• 自動偵測 raw 頁面、內嵌區塊、編輯器與本機 Markdown
• 支援標題、表格、任務清單、程式碼區塊、語法高亮與目錄
• 使用 Shadow DOM 隔離樣式，避免與原頁 CSS 互相干擾
• 支援整頁換頁、SPA 軟導覽與延遲載入內容
• 可針對每個網域設定自動開啟、顯示提示或略過
• 支援多篇 Markdown，以分頁或側邊面板呈現
• 隱私優先：所有內容都在你的瀏覽器本機處理

隱私：
Markdown Expert 不蒐集頁面內容、Markdown 內容、網址、頁面標題、截圖、表單資料或個人資訊。匿名使用統計預設關閉，只有在你主動開啟時才會送出粗略互動事件。

開源專案：
https://github.com/DavisChang/md-expert
```

## Graphic Assets

Chrome Web Store listing requirements currently call for:

| Asset | Required | Current file | Status |
| --- | --- | --- | --- |
| Store icon, 128x128 PNG | Yes | `store/icon-128.png` | Ready |
| Screenshots, 1280x800 PNG/JPEG, at least 1 and up to 5 | Yes | `store/screenshots/*.png` | Need capture |
| Small promo tile, 440x280 PNG/JPEG | Yes | `store/promo-440x280.png` | Draft ready |
| Marquee promo tile, 1400x560 PNG/JPEG | Optional | Not created | Optional |
| YouTube promo video | Listed in docs | Not created | Skip for first submission unless dashboard blocks |

Recommended screenshot set:

1. Raw Markdown reader view.
2. Embedded Markdown detection prompt.
3. Reader with table of contents and code block.
4. Options page with privacy/analytics toggle.
5. Side panel or multi-document view, if captured cleanly.

## Privacy Practices Answers

### Single Purpose

```text
Detect Markdown on web pages and render it into a clean, focused reading view.
```

### Permission Justifications

| Permission | Dashboard justification |
| --- | --- |
| `storage` | Stores user preferences such as theme, font size, and per-domain behavior. |
| `tabs` | Detects tab loading and navigation so Markdown can be re-detected and the extension badge can be updated. |
| `sidePanel` | Displays multiple detected Markdown documents in Chrome's side panel. |
| Content script on `<all_urls>` | Runs locally on pages to detect and render Markdown wherever it appears. Page content is not transmitted. |
| Optional host permission `https://www.google-analytics.com/*` | Requested only if the user explicitly enables anonymous usage analytics. |

### Remote Code

```text
No, this extension does not execute remote code.
```

Notes:

- The extension does not load remote scripts.
- Optional analytics use Google Analytics Measurement Protocol requests only after user opt-in.

### Data Collection Disclosure

Recommended disclosure:

```text
By default, Markdown Expert does not collect user data. Page content, Markdown content, URLs, page titles, screenshots, form data, and personal information are not collected or transmitted.

If the user explicitly enables anonymous usage analytics, the extension sends coarse interaction events such as feature usage and settings changes. These events do not include page content, Markdown content, URLs, or personal data.
```

Likely checkbox categories:

- Default state: no user data collected.
- If optional analytics is disclosed as collection: use "Website content" only if the dashboard treats any page-derived event as website data. Otherwise disclose as "User activity" / analytics events, depending on the dashboard categories shown at submission time.

## Review Test Instructions

```text
No login or payment is required.

Test steps:
1. Install the extension.
2. Open a raw Markdown page, for example:
   https://raw.githubusercontent.com/DavisChang/md-expert/main/README.md
3. A Markdown Expert prompt appears on the page.
4. Click the prompt to open the reader view.
5. Verify reader controls:
   - T toggles the table of contents.
   - D toggles the theme.
   - C copies the source Markdown.
   - Esc closes the reader.
6. Open the extension options page and confirm that anonymous analytics are disabled by default.

Privacy note:
All Markdown rendering is processed locally. The extension does not send page content, Markdown content, URLs, or personal information. Optional anonymous analytics are disabled by default.
```

## Pre-Submission Checklist

- [ ] Developer account registered and verified.
- [ ] Support contact configured in the Chrome Web Store Developer Dashboard.
- [ ] Privacy policy URL entered: `https://davischang.github.io/md-expert/privacy.html`.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm e2e` pass.
- [ ] `pnpm zip` creates `markdown-expert-v0.1.0.zip`.
- [ ] Zip contains `manifest.json` at the root.
- [ ] Store icon uploaded.
- [ ] At least one screenshot uploaded.
- [ ] Small promo tile uploaded.
- [ ] Privacy practices completed.
- [ ] Test instructions pasted.
- [ ] First release submitted as Unlisted.
