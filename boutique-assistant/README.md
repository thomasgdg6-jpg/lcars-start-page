# The Boutique Assistant — Installable Web App (PWA)

The Boutique Assistant is a single-page listing helper for Twice As Nice Boutique: Capture an item (photo, brand, type, size, condition, cost, asking price), Generate a template description and caption (with a ±10% suggested range, a suggestion only — not a valuation), Track the inventory (Available/Sold, Edit, Delete), and Review the week's new and sold counts plus items needing attention after 30 days.

This package wraps that same page as an installable web app for Android and iPhone. The app logic and wording are unchanged from the tested prototype.

## Files

- `index.html` — the app itself (all logic and styles are inside this one file).
- `manifest.webmanifest` — install metadata: name, colours, display mode, and icons.
- `sw.js` — the service worker that caches the app so it works offline after the first load.
- `icons/icon.svg` — scalable app icon (plum "BA"), used for install and home screens.
- `icons/icon-maskable.svg` — maskable variant with the design inside the central safe area.
- `README.md` — this file.

Note: this hosted edition uses SVG icons so every file can be published through GitHub's text-based upload path. The downloadable zip edition of the same package carries PNG icons (192/512/maskable/apple-touch) instead; the app itself is identical.

## Hosting

Host the folder on any static HTTPS host (for example GitHub Pages) and upload the files **preserving the folder structure** — `index.html`, `manifest.webmanifest`, and `sw.js` at the top, and the `icons/` folder beside them. Do not rename files.

Installing the app and the offline service worker require **HTTPS**. The only exception is `localhost`, which browsers treat as secure for testing. Opening `index.html` as a plain file still runs the app, but it cannot be installed and will not work offline.

## Installing

**Android (Chrome):** open the hosted page in Chrome, open the browser menu, and tap **"Install app"** or **"Add to Home screen"**. The app then opens from its own home-screen icon, full-screen, and works offline after that first load.

**iPhone (Safari):** open the hosted page in Safari, tap **Share**, and tap **"Add to Home Screen"**. (On iPhone this install step must be done in Safari, not Chrome.) The app then opens from its own home-screen icon and works offline after that first load.

## Limits — read plainly

- **Inventory lives on each device only.** Items are saved in that phone's/browser's local storage, under the same storage key as the prototype. A list saved on one phone does **not** appear on another phone. There is no sync.
- **No account, no server, no analytics.** Nothing is sent anywhere by the app.
- **Nothing publishes anywhere.** Generate produces draft text to copy by hand; the app does not post to Vinted, Facebook, or any other service.
- The Google Lens step stays manual: Lens does not send results back, so you type what Lens found into the field provided.
- Clearing the browser's/site's data on a device clears that device's inventory. There is no backup or export in this package.
