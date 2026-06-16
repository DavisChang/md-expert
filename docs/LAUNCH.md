# 上線準備清單（Markdown Expert）

把通用的 Chrome Web Store 上架清單對應到**本專案實際狀況**。

> **重要定位**：Markdown Expert 是**唯讀的 Markdown 渲染工具**——沒有登入、沒有後端、沒有付款、沒有雲端同步、不錄製操作、不擷取表單/截圖。因此通用清單裡大量「錄製/回放、帳號、付款、後端」項目對我們**不適用**，審核複雜度低。唯一的資料外送是**使用者主動 opt-in 的匿名統計**。

## 適用性總覽

| 通用清單區塊 | 對本專案 | 說明 |
| --- | --- | --- |
| 1 開發者帳號 | 需要 | 註冊 CWS developer（一次性費用）、設定聯絡信箱 |
| 2 技術包 | ✅ 大致就緒 | `pnpm build` 產 `dist/`，`pnpm zip` 打包；manifest 在 zip 根目錄 |
| 3 權限與隱私 | 需收尾 | 權限已最小化；隱私政策已備（GitHub Pages） |
| 4 Listing 素材 | 需製作 | 圖示（待換正式圖）、promo 圖、截圖、文案 |
| 5 隱私政策 | ✅ 已備 | `site/privacy.html` → 部署後即 Privacy Policy URL |
| 6 商業化/付款 | 不適用 | 免費、無付費牆 |
| 7 後端基礎設施 | 不適用 | 無自有後端；分析走 GA4 |
| 8 QA 測試 | 部分自動化 | 28+ 單元、5 E2E；仍需手動安裝/更新/移除測試 |
| 9 審核提交資料 | 需填寫 | Test instructions 很簡單（見下） |
| 10 發布策略 | 建議 | 先 Unlisted beta → 公開 |

## Must-have 檢核

- [x] Manifest V3
- [x] `manifest.json` 在 zip 根目錄（CRXJS 產出 + `pnpm zip`）
- [x] name / version / description（≤132 字元）/ icons 完整
- [x] 權限最小化（`storage`、`sidePanel`、`tabs`、content `<all_urls>`；GA 主機為 optional）
- [ ] **128×128 正式圖示**（目前為佔位／待換上提供的 logo）
- [ ] **440×280 小型宣傳圖**
- [ ] **至少 1 張截圖**（建議 3–5 張：閱讀視圖、多篇分頁、側欄、設定頁）
- [x] Store listing 長描述（見 `STORE_LISTING.md`）
- [ ] Privacy practices 表單（見下「審核問答」）
- [ ] Privacy Policy URL（部署 `site/` 後填入 `…/privacy.html`）
- [ ] Support email / Support URL
- [x] 安裝、更新、移除流程（手動再跑一次確認）

## 權限理由（填 Privacy practices 用）

| 權限 | 理由（一句話） |
| --- | --- |
| `storage` | 儲存使用者偏好（主題、字級、每網域規則） |
| `tabs` | 偵測分頁載入/換頁以重新偵測並更新圖示徽章 |
| `sidePanel` | 多篇 Markdown 時以側邊面板呈現 |
| `host_permissions: <all_urls>`（content script） | 需在任何網頁就地偵測並渲染 Markdown；僅本機處理、不外連 |
| optional `google-analytics.com` | 僅在使用者開啟匿名統計時動態請求 |

- 單一用途聲明：**偵測並渲染網頁上的 Markdown**。
- 資料使用揭露：預設不蒐集；opt-in 後僅送匿名互動事件（無內容/網址/個資）。
- 遠端程式碼：**無**（分析用 Measurement Protocol，非 gtag.js）。

> 權限精簡建議（可選）：`tabs` 可評估改用 `activeTab`，進一步降低審核風險——popup 取得當前分頁 URL、background 監聽 `onUpdated.status` 皆可不需 `tabs`。若改動需回歸測試 popup/側欄。

## 審核 Test Instructions（建議貼這段）

```
本擴充無需登入、無付費。

測試步驟：
1. 安裝擴充。
2. 開啟任一原始 Markdown 頁面，例如：
   https://raw.githubusercontent.com/CHANGE-ME/markdown-expert/main/README.md
3. 右下角會出現「📖 偵測到 Markdown」提示，點擊即展開閱讀視圖。
4. 可測試：T 切換目錄、D 切換主題、C 複製、Esc 關閉、👍 讚。
5. （選用）開啟擴充設定頁，可切換「分享匿名使用統計」(預設關閉)。

備註：所有處理皆於本機完成；除非於設定頁開啟匿名統計，否則不送出任何資料。
```

## 發布流程
1. `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm zip`
2. 上傳 `markdown-expert-vX.Y.Z.zip`
3. 填 Store Listing（`STORE_LISTING.md`）、Privacy practices、Test instructions
4. 先以 **Unlisted** 發布給早期使用者；修正後再轉 Public
5. 之後可走自動化 `release.yml`（受保護 environment 人工核可）

## 待你提供的值（填入後取代佔位字串）
- GitHub repo：`CHANGE-ME/markdown-expert`（網站連結、raw README 測試網址）
- Support email：`SUPPORT_EMAIL`
- Chrome Web Store 連結：`CHROME_WEB_STORE_URL`（上架後取得）
- 正式 logo（已提供，待我產生各尺寸）
