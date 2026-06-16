# 自動化閉環設定指南

把這個專案接上「發想 → 開發 → 優化 → 上版 → 驗證」的封閉迴路。完成以下一次性設定後即可運作。

## 1. 安裝 Claude GitHub App
- 在本機 Claude Code 執行 `/install-github-app`，或前往 https://github.com/apps/claude 安裝到此 repo。
- App 權限需包含：Contents、Issues、Pull Requests（皆 Read & Write）。

## 2. 設定 Secrets（repo Settings → Secrets and variables → Actions）
| Secret | 用途 | 必要性 |
| ------ | ---- | ------ |
| `ANTHROPIC_API_KEY` | Claude Code Action 呼叫 | 必要（開發/發想） |
| `CWS_EXTENSION_ID` | Chrome Web Store 擴充 ID | 發布時必要 |
| `CWS_CLIENT_ID` | CWS API OAuth client | 發布時必要 |
| `CWS_CLIENT_SECRET` | CWS API OAuth secret | 發布時必要 |
| `CWS_REFRESH_TOKEN` | CWS API refresh token | 發布時必要 |

> Chrome Web Store API 憑證取得方式見 Google 官方文件（建立 OAuth client、授權取得 refresh token）。首次需先手動在商店建立擴充項目以取得 extension ID。

## 3. 設定人工核可閘門（必做，對應「review 後上線」）
- repo Settings → Environments → 新增 `production`。
- 開啟 **Required reviewers**，加入你自己。
- 之後 `release.yml` 的 `publish` job 會卡在此處，等你按核可才會真的上傳/發布。

## 4. 各環節怎麼運作
| 環節 | 觸發 | 結果 |
| ---- | ---- | ---- |
| 發想 | 每週一排程（`weekly-ideation.yml`）或手動 dispatch | 開一個 `ideation` Issue |
| 開發 | 在 Issue/PR 留言含 `@claude`，或 `claude-dev.yml` 手動 dispatch | Claude 開 PR（含測試） |
| 優化 | PR 上 push / 留言 | CI（`ci.yml`、`e2e.yml`）守門；可再 `@claude` 修正 |
| 上版 | 打 `vX.Y.Z` tag 或手動 dispatch（`release.yml`） | 打包 zip → `production` 人工核可 → 發布 |
| 驗證 | E2E + 商店指標 + 使用者 Issue | 問題回流成新 Issue → 回到發想 |

## 5. 你的每週節奏
1. 收到「每週發想」Issue → review。
2. 對想做的項目，在 Issue 回覆 `@claude 實作這項`。
3. Claude 開 PR → 你 review → 合併。
4. 要發版時打 tag → 在 `production` 按核可上線。

> 想更自動：未來可把「發布」也自動化（移除人工核可），但建議在流程穩定、累積足夠信任後再開。
