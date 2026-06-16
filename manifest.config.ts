import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

/**
 * MV3 manifest，遵循最小權限原則。
 * - storage：儲存使用者偏好（主題、每網域自動展開規則）。
 * - sidePanel：多篇 markdown 時的舒適閱讀面板。
 * - tabs：背景偵測整頁載入的換頁事件。
 * 不要求 host 廣域權限——content script 以 <all_urls> 注入但只在本地處理，
 * 不發出任何網路請求，符合隱私優先原則。
 */
export default defineManifest({
  manifest_version: 3,
  name: 'Markdown Expert',
  version: pkg.version,
  description: pkg.description,
  minimum_chrome_version: '114',
  icons: {
    16: 'src/assets/icons/icon-16.png',
    48: 'src/assets/icons/icon-48.png',
    128: 'src/assets/icons/icon-128.png',
  },
  action: {
    default_title: 'Markdown Expert',
    default_popup: 'src/entries/popup/index.html',
  },
  options_page: 'src/entries/options/index.html',
  side_panel: {
    default_path: 'src/entries/sidepanel/index.html',
  },
  background: {
    service_worker: 'src/entries/background/sw.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/entries/content/main.ts'],
      run_at: 'document_idle',
      all_frames: false,
    },
  ],
  permissions: ['storage', 'sidePanel', 'tabs'],
  // 僅在使用者於設定頁開啟「匿名使用統計」(opt-in) 時，才會動態請求此權限。
  optional_host_permissions: ['https://www.google-analytics.com/*'],
});
