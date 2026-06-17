# Markdown Expert

> Read Markdown beautifully anywhere on the web.

[![CI](https://github.com/DavisChang/md-expert/actions/workflows/ci.yml/badge.svg)](https://github.com/DavisChang/md-expert/actions/workflows/ci.yml)
[![E2E](https://github.com/DavisChang/md-expert/actions/workflows/e2e.yml/badge.svg)](https://github.com/DavisChang/md-expert/actions/workflows/e2e.yml)
[![Website](https://github.com/DavisChang/md-expert/actions/workflows/pages.yml/badge.svg)](https://github.com/DavisChang/md-expert/actions/workflows/pages.yml)

[繁體中文](./README_TW.md) · [Website](https://davischang.github.io/md-expert/) · [Privacy Policy](https://davischang.github.io/md-expert/privacy.html)

Markdown Expert is a Chrome Manifest V3 extension that detects Markdown on web pages and renders it into a focused reader. It is built for raw `.md` files, GitHub/GitLab raw pages, embedded Markdown blocks, online editors, and local Markdown files.

The core principle is simple: **make Markdown easier to read without moving page content off your device**.

## Why

Markdown appears in many places that are not designed for reading:

- raw files opened directly in the browser,
- internal docs served as plain text,
- generated Markdown previews inside web apps,
- issue templates and notes in online editors,
- local `.md` files opened from disk.

Markdown Expert turns those surfaces into a consistent reading experience with headings, tables, task lists, code blocks, syntax highlighting, and table-of-contents navigation.

## Features

- **Automatic detection**: recognizes raw pages, remote raw files, embedded blocks, line editors, and local Markdown files.
- **Reader UI**: renders Markdown into a clean layout with toolbar controls and keyboard shortcuts.
- **Shadow DOM isolation**: keeps the reader stable even on pages with aggressive CSS.
- **Navigation aware**: re-detects content after full reloads, SPA navigation, and delayed DOM updates.
- **Per-domain behavior**: choose auto-open, prompt, or skip for each domain.
- **Multiple documents**: uses tabs for multiple Markdown documents and a side panel when the set grows.
- **Privacy-first defaults**: no page content, Markdown content, URLs, titles, screenshots, or form data are collected.

## Supported Sources

| Source | Status | Notes |
| --- | --- | --- |
| Raw `.md` pages | Supported | Plain text Markdown opened directly in the browser. |
| GitHub / GitLab raw files | Supported | Detects common raw Markdown URLs. |
| Embedded page blocks | Supported | Scans `<pre>`, `<textarea>`, and code-like blocks. |
| Online editors | Supported | Detects Markdown-like editor content without uploading it. |
| Local `file://` Markdown | Supported | Requires enabling file URL access for the extension in Chrome. |
| Pages with many documents | Supported | Uses tabs or the Chrome side panel. |

## Install for Development

The extension is not presented here as a Chrome Web Store release package yet. For local testing, load the unpacked build:

```bash
pnpm install
pnpm build
```

Then:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated `dist/` directory.

For iterative development:

```bash
pnpm dev
```

## Keyboard Shortcuts

Inside the reader:

| Key | Action |
| --- | --- |
| `T` | Toggle table of contents. |
| `D` | Toggle theme. |
| `C` | Copy source Markdown. |
| `Esc` | Close the reader. |

## Privacy

Markdown Expert is designed to process content locally.

| Data / Permission | Behavior |
| --- | --- |
| Page content | Processed locally only. Not transmitted. |
| Markdown content | Processed locally only. Not transmitted. |
| URL / title | Not collected by default analytics. |
| `storage` | Saves reader preferences and per-domain behavior. |
| `tabs` | Detects navigation and updates extension state. |
| `sidePanel` | Displays larger multi-document sets. |
| Google Analytics host permission | Optional, requested only if anonymous analytics are enabled. |

Anonymous analytics are opt-in and disabled by default. When enabled, they only send coarse interaction events such as feature usage; they do not include page content, Markdown content, URLs, or personal data.

See the [Privacy Policy](https://davischang.github.io/md-expert/privacy.html) and [privacy notes](./docs/PRIVACY.md).

## Development

Requirements:

- Node.js 20+
- pnpm 9.7.0, managed through `packageManager`

Common commands:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm zip
```

Command details:

- `pnpm lint`: ESLint with zero warnings.
- `pnpm typecheck`: TypeScript type checking.
- `pnpm test`: Vitest unit tests.
- `pnpm build`: production extension build in `dist/`.
- `pnpm e2e`: Playwright tests with the built extension loaded in Chromium.
- `pnpm zip`: create the store-uploadable archive.

## Architecture

```text
src/
├── core/        # Detect, render, store, analytics, messaging
├── ui/          # Preact reader components
└── entries/     # Extension entrypoints: content, background, popup, options, sidepanel
```

The architecture keeps browser-extension edges at the entrypoint layer. Core detection and rendering logic stays easier to test, while UI components stay isolated from arbitrary host page styles.

## Automation

GitHub Actions currently cover:

- `CI`: lint, typecheck, unit tests, build, and bundle-size guard.
- `E2E`: Playwright tests loading the built extension.
- `Deploy Website`: publishes `site/` to GitHub Pages.
- `Release`: packages the extension with manual production approval.

## Project Docs

- [Roadmap](./ROADMAP.md)
- [Launch checklist](./docs/LAUNCH.md)
- [Store listing draft](./docs/STORE_LISTING.md)
- [Automation notes](./docs/AUTOMATION.md)
- [Remaining work](./docs/REMAINING-WORK.md)

## License

[MIT](./LICENSE)
