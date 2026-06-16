---
name: market-scan
description: 每週掃描 Markdown/瀏覽器擴充市場、競品與趨勢，對照 ROADMAP，產出帶優先級的功能建議並開一個 GitHub Issue 供人工 review。在 weekly-ideation 排程或需要產生發想報告時使用。
---

# 每週市場發想（market-scan）

你的任務是為 Markdown Expert 這個 Chrome 擴充產出一份**可執行**的每週發想報告，並開成 GitHub Issue。

## 步驟

1. **掌握現況**：閱讀 `README.md`、`ROADMAP.md`、`docs/`，以及最近的 `git log`（近 1~2 週），了解已完成與進行中的工作，避免重複建議。

2. **市場掃描**（用 WebSearch / WebFetch）：
   - Chrome Web Store 上 Markdown 相關擴充的近況（功能、評價、痛點）。
   - 開發者社群（Reddit、Hacker News、X）對 markdown 閱讀/預覽的討論與抱怨。
   - 相關技術趨勢（新的 markdown 語法、CRXJS/MV3 變更、瀏覽器新 API 如 sidePanel、AI 摘要等）。
   - 標註每條結論的來源連結。

3. **對照與發想**：把市場訊號對應到本專案的差異化機會。每個建議需包含：
   - 一句話描述 + 解決的使用者痛點
   - 影響力（高/中/低）與實作成本（高/中/低）
   - 對應到架構的哪一層（detect / render / ui / 自動化）
   - 建議優先級（P0~P2）

4. **輸出**：用 `gh issue create` 開一個 Issue：
   - 標題：`每週發想 YYYY-WXX：<3~5 字重點>`
   - 標籤：`ideation`
   - 內文用以下結構（見下方範本）。
   - 對最值得做的 1~2 項，明確寫出「若同意，可在本 Issue 回覆 @claude 開始實作」。

## Issue 範本

```markdown
## 本週重點
（2~3 句總結市場訊號與建議方向）

## 市場觀察
- 觀察一（來源：URL）
- 觀察二（來源：URL）

## 功能建議（依優先級）
### P0 — <名稱>
- 痛點：
- 方案：
- 影響/成本：高/中
- 架構層：detect / render / ui / automation

### P1 — ...

## 建議下一步
- [ ] <最值得做的項目>；同意請於下方回覆 `@claude 實作這項`
```

## 原則
- 寧可少而精：每週 3~5 個建議，挑得出「下一步」。
- 不要做出會破壞隱私優先原則（不蒐集資料）的建議。
- 一切只「建議」，不直接改程式；實作須經人工在 Issue 觸發 @claude。
