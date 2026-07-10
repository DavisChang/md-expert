# 功能規格：內建 AI 翻譯（Chrome Translator API）

狀態：草稿（待人工確認範圍後進入實作）
關聯：ROADMAP「待辦 / 候選」— 新增項；補充 i18n 面向的內容翻譯能力
來源：使用者需求「用 Translator API / Gemini Nano 讓使用者開啟翻譯功能」

---

## 1. 問題與目標

閱讀視圖目前只呈現原文。使用者常需閱讀非母語的 Markdown（英文文件、他國語系 README），得另外複製到翻譯服務、失去排版與程式碼結構。

**目標**：在閱讀視圖內，一鍵把渲染後的內文翻譯成使用者選定的語言，並可即時切回原文；**完全在本機執行、不上傳任何內容**，符合核心原則 #1（隱私優先）。

**為什麼用 Chrome 內建 Translator API**
- On-device：模型內建於 Chrome、首次使用才下載語言包，翻譯過程零網路請求 → 天然符合隱私優先，且**不需要新增任何 host/API 權限**（符合原則 #4 最小權限）。
- 零 bundle 成本：使用瀏覽器內建能力，不引入大型相依（符合原則 #3 輕量）。
- 專用翻譯模型（Translator + Language Detector API），比用 Prompt API（Gemini Nano 通用模型）自寫 prompt 更穩定、輸出即純文字。Prompt API 僅列為未來 fallback，本規格不實作。

---

## 2. 使用者流程（UX）

1. 閱讀視圖工具列新增「🌐 翻譯」按鈕（**僅在 `Translator` API 可用時顯示**；不可用則完全隱藏，優雅降級）。
2. 點擊 → 出現目標語言選單（預設帶入上次選擇 / 設定值）。選定語言後開始翻譯。
3. 狀態機回饋（同一顆按鈕變化文案）：
   - 需下載模型：`⬇️ 下載語言模型 45%`（顯示 `downloadprogress`）。
   - 翻譯中：`翻譯中 12/40`（顯示已完成段落 / 總段落）。
   - 完成：按鈕切為 `🔤 顯示原文`（toggle）；再點回到 `🌐 翻譯`（顯示原文）。
   - 不支援此語言對 / 失敗：inline 提示「此語言暫不支援或模型無法下載」，不改動內文。
4. 切換文件（多篇分頁）或關閉閱讀視圖時，翻譯狀態重置回原文。

**設計原則**：翻譯是就地替換文字節點，**保留所有排版、連結、程式碼、數學、Mermaid 不動**；隨時可無損切回原文。

---

## 3. 範圍

### 做（本次 MVP，PR #1）
- `Translator` + `LanguageDetector` 的 feature detection 與 availability 狀態處理。
- 走訪閱讀視圖 DOM，逐段翻譯**可翻譯的文字節點**，就地替換；保留原文以供 toggle。
- 模型下載進度、翻譯進度、錯誤三種 UI 狀態。
- 目標語言選單（先支援一組常用語言，見 §7）＋記住上次選擇（寫入 settings）。
- 單元測試（core 純邏輯）＋ E2E（mock 掉 `Translator` 全域）。
- 更新 `docs/PRIVACY.md` 與 ROADMAP。

### 不做（本次不含；視需求開 PR #2 或延後）
- **不翻譯**：程式碼區塊/行內碼、`.mdx-math`（KaTeX）、`.mdx-mermaid`、`kbd`、純 URL/數字/表情符號、標題 anchor 的 `¶` permalink。
- 不做原文↔譯文並排對照（僅 toggle 切換）。
- 不做 side panel 內的翻譯（先只做 content 閱讀視圖；side panel 為 extension Document context，本來就可用，留待 PR #2 對齊）。
- 不用 Prompt API / 雲端翻譯服務作 fallback。
- 不做整頁（非 Markdown 內容）翻譯——超出本擴充定位。

---

## 4. 架構落點

遵守分層：`core/**` 純函式可單測、不碰 DOM/全域；Web AI 全域與 DOM 走訪放在 UI 層（比照既有 `src/ui/math.ts`、`src/ui/mermaid.ts` 的先例——它們也是 UI 層負責 DOM + 動態載入外部能力，非 `chrome.*`）。

```
src/core/translate/                 ← 新增：純邏輯，100% 單元測試
  types.ts        介面：LanguagePair / Availability / TranslatorProvider / DetectorProvider
  skip.ts         純規則：isSkippableTag(tag)、SKIP_SELECTOR 常數（哪些不翻譯）
  orchestrate.ts  translateSegments(provider, pair, texts[], opts) — 批次/並發/容錯，回傳結果陣列
  detect.ts       pickSourceLanguage(detections[]) — 從偵測結果挑最高信心語言（低於門檻→null）
  languages.ts    支援語言清單與顯示名稱（BCP 47 code → 繁中名）
  orchestrate.test.ts / skip.test.ts / detect.test.ts

src/ui/translate.ts                 ← 新增：Web AI 全域 adapter + DOM 走訪
  chromeTranslator: TranslatorProvider        （feature detect + Translator.create/availability）
  chromeLanguageDetector: DetectorProvider
  translateArticle(article, pair, { onProgress }) — 收集文字節點→呼叫 core→就地替換→存原文
  restoreArticle(article) — 還原原文（toggle 用）

src/ui/Toolbar.tsx                   ← 修改：新增翻譯按鈕 + 語言選單 + 狀態文案
src/ui/App.tsx                       ← 修改：持有翻譯狀態、串接 track()、切文件時重置
src/ui/Reader.tsx                    ← 修改：把 article 元素 ref 提供給翻譯流程（比照 math/mermaid 的 useEffect 時機）

src/core/store/schema.ts             ← 修改：新增 translateTarget 欄位 + migrate
src/core/analytics/config.ts         ← 修改：新增 AnalyticsEvent.TranslationUsed
docs/PRIVACY.md / ROADMAP.md         ← 修改：說明本機翻譯與首次模型下載
```

### 4.1 core 介面（草案）

```ts
// src/core/translate/types.ts
export type Availability = 'available' | 'downloadable' | 'downloading' | 'unavailable';
export interface LanguagePair { source: string; target: string } // BCP 47，如 en / zh-Hant

export interface TranslatorProvider {
  availability(pair: LanguagePair): Promise<Availability>;
  /** onProgress: 模型下載進度 0..1 */
  create(pair: LanguagePair, onProgress?: (loaded: number) => void): Promise<{
    translate(text: string): Promise<string>;
    destroy(): void;
  }>;
}

export interface DetectorProvider {
  isAvailable(): Promise<boolean>;
  detect(text: string): Promise<Array<{ language: string; confidence: number }>>;
}
```

```ts
// src/core/translate/orchestrate.ts — 純函式，用 fake provider 單測
export interface TranslateOptions {
  concurrency?: number;               // 預設 4，避免壓垮 on-device 模型
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;               // 切文件/關閉時中止
}
/** 逐段翻譯；單段失敗時回傳原文（容錯），不中斷整體。 */
export function translateSegments(
  provider: { translate(t: string): Promise<string> },
  texts: string[],
  opts?: TranslateOptions,
): Promise<string[]>;
```

### 4.2 UI adapter（草案，唯一碰 Web AI 全域處）

```ts
// src/ui/translate.ts
export const chromeTranslator: TranslatorProvider = {
  async availability({ source, target }) {
    if (!('Translator' in self)) return 'unavailable';
    return (self as any).Translator.availability({ sourceLanguage: source, targetLanguage: target });
  },
  async create({ source, target }, onProgress) {
    const t = await (self as any).Translator.create({
      sourceLanguage: source,
      targetLanguage: target,
      monitor: (m: EventTarget) =>
        m.addEventListener('downloadprogress', (e: any) => onProgress?.(e.loaded)),
    });
    return { translate: (text: string) => t.translate(text), destroy: () => t.destroy() };
  },
};
```

DOM 走訪（`translateArticle`）：以 `TreeWalker` 收集 `article` 內的文字節點，用 `core/skip.ts` 的規則跳過不翻譯的容器；把原始 `textContent` 存進 `WeakMap<Text, string>`（供 `restoreArticle` 還原），批次交給 `translateSegments`，回填。**不新增任何標記** → 無需再過一次 sanitize（只換純文字，符合原則 #2 安全）。

---

## 5. 關鍵設計決策與風險

| # | 決策 / 風險 | 處置 |
|---|---|---|
| R1 | ~~content script isolated world 是否看得到 `Translator` 全域~~ | ✅ **已實測定案（2026-07-10，Chrome 149）**：見 `spikes/translator-isolated-world/`。content script 的 **isolated world 可直接取用** `Translator` 與 `LanguageDetector`（`runtimeId` 有值確認為 isolated world，`availability()` 正常回 `downloadable`）。→ **走直接路徑，不需 offscreen document、不需 `offscreen` 權限、不需 main-world 注入。** 仍保留 runtime feature detection 作保險。 |
| R2 | 只有桌面 Chrome、且需足夠磁碟/RAM；行動版無。 | feature detection + availability，`unavailable` 時**隱藏**翻譯入口，不報錯。 |
| R3 | 首次使用需下載語言包（數十 MB、需時間）。 | `downloadprogress` 進度條；下載期間按鈕禁用並顯示百分比；失敗給可重試提示。 |
| R4 | 翻譯破壞排版風險。 | **就地替換文字節點**（非重新 render markdown），連結/程式碼/數學/Mermaid 節點完全不動；`skip.ts` 明列不翻譯清單。 |
| R5 | 大量小段落造成多次 `translate()` 呼叫、卡頓。 | 以 block 級文字節點為單位、`concurrency` 上限（預設 4）、`AbortSignal` 可中止；長文可考慮只先翻可視區（PR #2 優化，MVP 全翻）。 |
| R6 | 來源語言未知。 | 先用 `LanguageDetector` 偵測整篇取最高信心語言；偵測不可用或低信心 → 讓使用者手動選來源，或直接讓 Translator 自動處理（若該版支援）。 |

---

## 6. 設定與遷移

`Settings` 新增一欄（翻譯本身隱私安全、**不需要 opt-in 開關**，僅記住偏好）：

```ts
/** 上次選擇的翻譯目標語言（BCP 47）。 */
translateTarget: string; // DEFAULT: 'zh-Hant'
```

- `DEFAULT_SETTINGS.translateTarget = 'zh-Hant'`（專案主要受眾為繁中使用者；選單可改）。
- `migrateSettings`：`typeof input.translateTarget === 'string' ? input.translateTarget : DEFAULT`。
- `schema.test.ts` 補上遷移測試（缺欄 → 補預設；保留既有值）。

> 注意：`SETTINGS_VERSION` 目前為 1。新增可選欄位且 migrate 有防呆，**不需**升版本；若團隊慣例是新增欄位就升版，改 2 並補測試。（待確認，見 §11）

---

## 7. 支援語言（MVP 首批）

`languages.ts` 先納入常用語言（皆以英文為樞紐，Translator 支援）：
`en` 英文、`zh-Hant` 繁體中文、`zh-Hans` 簡體中文、`ja` 日文、`ko` 韓文、`es` 西班牙文、`fr` 法文、`de` 德文。
每項存 `{ code, label }`，label 用繁中顯示名。實際能否翻譯仍以 `availability()` 為準（不支援的語言對在選單即時標記為不可用）。

---

## 8. 隱私與權限

- **權限**：**不新增任何 manifest 權限**（R1 已實測 isolated world 可直接用，offscreen fallback 不需要，因此無 `offscreen` 權限）。
- **`docs/PRIVACY.md` 更新**：新增「本機翻譯」段落，明確載明：
  - 翻譯完全在裝置上進行，**不傳送任何網頁內容、Markdown、網址或個資**至任何伺服器。
  - 首次使用某語言對時，Chrome 會**向 Google 下載翻譯語言模型檔**；此為模型檔下載，**不包含使用者內容**。此行為由瀏覽器內建機制執行，非本擴充主動傳輸內容。
- 符合原則 #1：翻譯路徑不違反「不蒐集、不上傳」界線。

---

## 9. 分析事件（匿名、opt-in 受控）

`track()` 已統一經 background 檢查 opt-in 後才上報，呼叫端只要不傳內容即可。

- 新增 `AnalyticsEvent.TranslationUsed = 'translation_used'`，參數 `{ target: <lang code>, source: <lang code> }`。語言代碼為偏好設定、**非個資/內容/網址**，符合界線。
- （可選）`translation_unavailable`：了解多少使用者環境不支援，協助決策是否投入 PR #2。
- **嚴禁**傳入被翻譯的文字、篇名、網址。

---

## 10. 測試計畫

### 單元（Vitest，必附）
- `orchestrate.test.ts`：以 fake provider 驗證批次、並發上限、單段失敗回退原文、`onProgress` 計數、`AbortSignal` 中止。
- `skip.test.ts`：`code/pre/kbd/.mdx-math/.mdx-mermaid`、純 URL/數字/空白 → 判定跳過；一般段落 → 翻譯。
- `detect.test.ts`：多筆偵測結果挑最高信心；低於門檻回 `null`。
- `schema.test.ts`：`translateTarget` 遷移（補預設、保留舊值）。

### DOM 翻譯邏輯（Vitest + jsdom）
> 實作時修正：原本規劃用 Playwright `addInitScript` 注入假全域，但 `addInitScript` 跑在頁面 **main world**，而 content script 的翻譯碼跑在 **isolated world**（R1 已證實在此），兩者全域不共通 → **無法從 Playwright mock isolated-world 的 `Translator`**。因此改由 **Vitest（jsdom 環境）以 mock provider 覆蓋 DOM 翻譯邏輯**，更穩定也更貼近實際邏輯。

- `translate.test.ts`（jsdom）：`collectTranslatableNodes` 跳過 `code/pre/kbd/.mdx-math/.mdx-mermaid`、純網址；`translateArticle` 就地替換、`showOriginal/showTranslation` 無損切換、`onProgress` 計數。

### 真實環境驗證（手動）
- CI 無 on-device 模型、且無法 mock isolated-world 全域，故**不新增 Playwright E2E**（現有 E2E 不受影響：翻譯控制以文字定位不衝突）。
- 改以**真實 Chrome（138+）手動驗證**完整流程：載入 `dist/`，於英文 `.md` 頁開啟閱讀視圖 → 翻譯 → 切換原文/譯文 → 確認程式碼/數學/Mermaid 不變。（本次已於 Chrome 149 驗證 API 存在、語言對 downloadable、偵測可用。）

---

## 11. 決策（已定案）

1. **R1** ✅ **已實測定案**（Chrome 149，`spikes/translator-isolated-world/`）：content script isolated world **可直接取用** Translator/LanguageDetector → **直接路徑，零新增權限**，無需 offscreen。PR#1 不再含 offscreen 分支。
2. **目標語言** ✅：預設 `zh-Hant`；首批語言清單依 §7。
3. **設定版本** ✅：`translateTarget` 為可選新欄位、migrate 有防呆，**不升 `SETTINGS_VERSION`**（維持 1）；`schema.test.ts` 仍補遷移測試。
4. **分析粒度** ✅：記錄語言代碼——`translation_used` 帶 `{ target, source }`（見 §9）；仍嚴禁任何內容/篇名/網址。

---

## 12. 驗收標準（Definition of Done 對應）

- [ ] `Translator`/`LanguageDetector` 不可用時，翻譯入口完全隱藏，其餘功能不受影響。
- [ ] 可用時：選語言 → 內文就地翻譯；程式碼/行內碼/數學/Mermaid/連結**保持不變**。
- [ ] 模型需下載時顯示進度；翻譯中顯示段落進度；失敗有 inline 提示且不破壞內文。
- [ ] 可 toggle 原文↔譯文，無損還原；切換分頁 / 關閉閱讀視圖重置。
- [ ] `translateTarget` 正確持久化並在下次開啟帶入。
- [ ] `core/translate/**` 有單元測試；翻譯流程有 mock 版 E2E。
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 全綠，**bundle size guard 通過**（本功能不應顯著增加 bundle）。
- [ ] `docs/PRIVACY.md` 已更新本機翻譯段落；ROADMAP 勾選。
- [ ] PR 描述說明「為什麼（隱私安全的內容翻譯）」與「如何驗證（R1 spike 結論、mock E2E、手動在支援環境實測一次）」。

---

## 13. PR 切分

- **PR #1（本規格 MVP）**：core/translate 純模組 + UI adapter（content script isolated world 直接呼叫）+ 工具列翻譯按鈕 + reader DOM 翻譯 + 下載/進度/錯誤狀態 + 目標語言持久化 + 單元/mock E2E + PRIVACY/ROADMAP。**零新增權限。**
- **PR #2（後續，選做）**：side panel 翻譯對齊、更多語言、可視區優先翻譯與串流、原文/譯文並排對照、Prompt API fallback 評估。
