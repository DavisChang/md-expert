# Remaining Work for Chrome Web Store Launch

> Last updated: 2026-06-17
> Status: the extension, website, documentation, package, and store assets are ready for the first Chrome Web Store submission.

---

## A. Manual Submission Tasks

- [ ] Create or open the Chrome Web Store Developer account.
- [ ] Create the Markdown Expert item in the Chrome Web Store Developer Dashboard.
- [ ] Upload `markdown-expert-v0.1.0.zip`.
- [ ] Upload store assets:
  - `store/icon-128.png`
  - `store/promo-440x280.png`
  - `store/screenshots/01-reader-raw-markdown.png`
  - `store/screenshots/02-reader-toc-code.png`
  - `store/screenshots/03-embedded-markdown-prompt.png`
  - `store/screenshots/04-options-privacy.png`
- [ ] Fill the English default store listing from `docs/STORE_LISTING.md`.
- [ ] Add the Traditional Chinese localization from `docs/STORE_LISTING.md`.
- [ ] Fill Privacy practices and Permission justifications from `docs/STORE_LISTING.md`.
- [ ] Fill Review test instructions from `docs/LAUNCH.md`.
- [ ] Publish as **Unlisted** first, then move to Public after early-user verification.
- [ ] Replace placeholder store links after approval:
  - `CHROME_WEB_STORE_URL` in `site/language.js`
  - Store URL references in launch docs, if needed

---

## B. Completed Launch Preparation

- [x] GitHub Pages site deployed: `https://davischang.github.io/md-expert/`
- [x] Website supports English by default and Traditional Chinese via language switch.
- [x] Privacy policy page deployed.
- [x] README optimized in English.
- [x] Traditional Chinese README added as `README_TW.md`.
- [x] Store listing kit prepared in `docs/STORE_LISTING.md`.
- [x] Launch checklist prepared in `docs/LAUNCH.md`.
- [x] Extension description changed to English in `package.json`.
- [x] Production package built: `markdown-expert-v0.1.0.zip`.
- [x] Store screenshots generated at 1280x800.
- [x] Store icon generated at 128x128.
- [x] Small promo tile generated at 440x280.
- [x] Package checked to exclude `.env`, `.git`, `node_modules`, and test output.
- [x] Latest local verification passed:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm zip`
  - `pnpm e2e`
  - `node scripts/check-bundle-size.mjs`
  - `pnpm store:screenshots`

---

## C. Optional Improvements After First Review

- [ ] Create simpler 16px and 48px toolbar icons if Chrome Web Store review feedback mentions legibility.
- [ ] Consider replacing `tabs` with `activeTab` if all popup and side panel flows can keep the same behavior.
- [ ] Add an optional 1400x560 marquee image after the first listing is approved.
- [ ] Add a short demo video only if the listing conversion data shows a need for it.

---

## D. Automation Follow-Up

- [ ] Configure Chrome Web Store API secrets (`CWS_*`) for automated releases.
- [ ] Create a protected `production` GitHub environment with required reviewers.
- [ ] Keep manual review for the first production release even after automation is configured.
