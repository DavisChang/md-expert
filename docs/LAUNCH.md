# Chrome Web Store Launch Checklist

This checklist maps Chrome Web Store submission requirements to the current Markdown Expert repository.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Manifest V3 | Ready | `manifest.config.ts` builds MV3 output. |
| Build artifact | Ready | `pnpm build` creates `dist/`; `pnpm zip` packages it. |
| Privacy policy | Ready | https://davischang.github.io/md-expert/privacy.html |
| Store listing copy | Ready | See `docs/STORE_LISTING.md`. |
| Store icon | Ready | `store/icon-128.png`. |
| Small promo tile | Draft ready | `store/promo-440x280.png`; can be improved visually later. |
| Screenshots | Needed | Capture 1-5 screenshots at 1280x800. |
| Developer account | Manual | Requires Chrome Web Store Developer Dashboard access. |
| Submission | Manual | First submission should be Unlisted. |

## Technical Package

Run before upload:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm zip
```

Expected upload file:

```text
markdown-expert-v0.1.0.zip
```

Verify:

- `manifest.json` is at the zip root.
- `manifest_version` is `3`.
- `name`, `version`, `description`, and icons are present.
- No `.env`, source maps with secrets, test reports, or repo metadata are included.

## Dashboard Fields

Use `docs/STORE_LISTING.md` for copy-paste content.

| Dashboard area | Value |
| --- | --- |
| Category | Productivity |
| Language | English default; Traditional Chinese localization if enabled |
| Homepage URL | https://davischang.github.io/md-expert/ |
| Support URL | https://github.com/DavisChang/md-expert/issues |
| Privacy policy URL | https://davischang.github.io/md-expert/privacy.html |
| Pricing | Free |
| Visibility | Unlisted for first beta |
| Mature content | No |

## Permission Justifications

| Permission | Justification |
| --- | --- |
| `storage` | Stores user preferences such as theme, font size, and per-domain behavior. |
| `tabs` | Detects tab loading and navigation so Markdown can be re-detected and the extension badge can be updated. |
| `sidePanel` | Displays multiple detected Markdown documents in Chrome's side panel. |
| content script on `<all_urls>` | Runs locally on pages to detect and render Markdown wherever it appears. Page content is not transmitted. |
| optional `https://www.google-analytics.com/*` | Requested only if the user explicitly enables anonymous usage analytics. |

Single purpose:

```text
Detect Markdown on web pages and render it into a clean, focused reading view.
```

Remote code:

```text
No remote code is executed.
```

## Privacy Practices

Default behavior:

- No page content collection.
- No Markdown content collection.
- No URL or page title collection.
- No screenshots or form data collection.
- No account system.
- No payment.
- No backend server.

Optional analytics:

- Disabled by default.
- User must opt in from the options page.
- Sends coarse interaction events only.
- Does not include page content, Markdown content, URLs, titles, or personal information.

## Review Test Instructions

Paste this in the review instructions field:

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

## Manual QA Before Submit

- [ ] Install from `dist/` in Chrome.
- [ ] Open `https://raw.githubusercontent.com/DavisChang/md-expert/main/README.md`.
- [ ] Confirm prompt appears.
- [ ] Open reader and inspect headings, code block, table, and TOC.
- [ ] Test `T`, `D`, `C`, and `Esc`.
- [ ] Open an ordinary web page with embedded Markdown.
- [ ] Confirm options page opens and analytics are disabled by default.
- [ ] Confirm uninstall/reinstall does not require account setup.
- [ ] Confirm local file rendering after manually enabling file URL access.

## Release Strategy

1. Submit `0.1.0` as **Unlisted**.
2. Test with a small group.
3. Address review feedback or early user issues.
4. Switch to Public after confidence is high.
5. Use `release.yml` for future package generation once `CWS_*` secrets are configured.
