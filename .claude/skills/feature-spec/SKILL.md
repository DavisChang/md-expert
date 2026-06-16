---
name: feature-spec
description: 把一個功能想法或 ideation Issue 轉成可實作的技術規格（範圍、架構落點、測試計畫、驗收標準）。在開始實作前、或要把模糊需求釐清成 PR 規劃時使用。
---

# 功能規格化（feature-spec）

把一個想法或 Issue 轉成清晰、可直接實作的規格。

## 步驟
1. 閱讀來源（Issue 內文或使用者描述）與相關程式碼，確認真正要解決的問題。
2. 對照 `ROADMAP.md` 與既有架構（`src/core/detect`、`src/core/render`、`src/ui`、`src/entries`），找出**應重用**的既有模組，避免新造輪子。
3. 產出規格，包含：
   - **問題與目標**：使用者痛點、預期成果。
   - **範圍**：明確列出「做什麼／不做什麼」。
   - **架構落點**：要新增/修改哪些檔案，遵循「core 純函式、entries 只橋接」的分層。
     - 新偵測來源 → 在 `src/core/detect/` 新增 detector 並註冊到 `registry.ts`。
     - 渲染增強 → 在 `src/core/render/` 調整 pipeline / 加 markdown-it 外掛。
   - **測試計畫**：哪些單元測試（Vitest）、是否需要 E2E（Playwright）。
   - **驗收標準**：可勾選的清單。
4. 若由 Issue 觸發，把規格回覆到該 Issue 並等待確認；確認後再進入實作。

## 原則
- 一律附測試；core 邏輯必須有單元測試。
- 維持隱私優先與輕量（注意 bundle size guard）。
- 規格要小到能在一個 PR 完成；過大則拆成多個。
