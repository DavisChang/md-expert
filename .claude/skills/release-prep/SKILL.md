---
name: release-prep
description: 準備一次發版：決定版本號、更新 CHANGELOG、檢查商店素材（文案/截圖/隱私）、開 release PR 或打 tag。在要發布新版本到 Chrome Web Store 前使用。
---

# 發版準備（release-prep）

確保每次上版品質一致、素材齊全，並把人工核可閘門留在最後。

## 步驟
1. **確認綠燈**：`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 全過，bundle size guard 通過。
2. **版本號**：依語意化版本決定 patch/minor/major，更新 `package.json` 的 `version`（manifest 版本由它衍生）。
3. **CHANGELOG**：彙整自上一版以來的變更（讀 git log / 已合併 PR），寫入 `CHANGELOG.md`，分類為 新增/改善/修正。
4. **商店素材檢查**（`docs/STORE_LISTING.md`）：
   - 名稱、簡短說明（132 字內）、詳細說明是否需要更新。
   - 權限是否有變動 → 同步更新隱私說明 `docs/PRIVACY.md`。
   - 截圖是否反映最新 UI（提醒人工更新）。
5. **產出**：開一個 release PR（標題 `release: vX.Y.Z`），內含上述變更。**不要**自行發布。
   - 合併後由人工打 `vX.Y.Z` tag 觸發 `release.yml`；發布步驟仍需在 `production` environment 由人工核可。

## 原則
- 發布是人工核可的最後一哩；此 skill 只負責把一切準備到「只差按核可」。
- 權限/隱私有任何變動，務必在 PR 描述中醒目標註。
