---
description: Build the lib + the demo bundle from current src/, then open the demo in the default browser
---

# /demo — Build & open the live demo

This command rebuilds `dist/` from `src/`, regenerates the browser bundle that `demo/demo-persistence.html` consumes, and opens the demo in the default browser.

The demo HTML loads `demo/react-fusion-state.umd.js`, which is produced by `scripts/build-demo.js` from `dist/index.js`. Running `/demo` guarantees you're testing the **actual published code**, not a mock.

## 1. Sanity checks

- Confirm we're at the repo root (`package.json` present).
- Confirm `node_modules/esbuild` is installed (the demo bundler depends on it). If missing, run `npm install` first and warn the user.
- If the working tree has uncommitted changes in `src/`, note that the demo will reflect those uncommitted changes — that's intentional.

## 2. Build pipeline

Run sequentially (stop on first failure):

1. `npm run build`
   - Cleans `dist/`, runs `tsc -p tsconfig-build.json`, then runs `npm run build:demo`.
   - `build:demo` runs `node scripts/build-demo.js`, which bundles `dist/index.js` (CommonJS) into `demo/react-fusion-state.umd.js` (IIFE, global `ReactFusionState`).
   - React / React-DOM are NOT bundled — they're loaded from a CDN in the HTML.

2. Verify outputs exist:
   - `dist/index.js` and `dist/index.d.ts`
   - `demo/react-fusion-state.umd.js` (should be ~50–60 KB unminified)

If either step fails, surface the error and stop. Do not open the demo on a broken build.

## 3. Open the demo

- macOS: `open demo/demo-persistence.html`
- Linux: `xdg-open demo/demo-persistence.html`
- Windows: `start demo/demo-persistence.html`
- WSL / fallback: print the absolute path and ask the user to open it manually.

The HTML uses the `file://` protocol — no local server is needed. If the user reports CORS issues with a particular browser, suggest:

```bash
npx serve demo
# then open the printed http://localhost URL
```

## 4. Validation checklist

After the demo opens, prompt the user to verify:

- [ ] **Hydration card** shows ✅ Hydrated immediately (web sync path).
- [ ] **Persistent Counter** increments / decrements / resets correctly.
- [ ] **Persistent Name** updates on every keystroke.
- [ ] **Live State** card reflects every change in real time.
- [ ] **localStorage Inspector** shows the JSON payload under key `fusion_state_all`.
- [ ] Refreshing the page restores the persisted values.
- [ ] **Clear & Reload** wipes localStorage and falls back to defaults.
- [ ] Toggling **Debug Mode** prints `[FusionState]` logs in the DevTools console (state diffs, save events).

## 5. Troubleshooting

- **Blank page / `ReactFusionState is undefined`**: the bundle didn't load. Check the console for a 404 on `react-fusion-state.umd.js` and rerun `/demo`.
- **Stale behavior after a `src/` edit**: the user opened the HTML before rerunning `/demo`. Rerun and hard-refresh the page.
- **Demo bundle drifts from `src/`**: the build chain enforces sync — `npm run build` always rebuilds both. If the user edited `src/` and ran the HTML directly without `/demo`, that's the cause.

## 6. Do NOT

- Do not commit the regenerated `demo/react-fusion-state.umd.js` from inside this command. Committing is the user's responsibility (`/commit` or `/commit-push`), and those commands enforce the doc-sync checklist.
- Do not run `npm publish`, `npm version`, or any release-adjacent command.
- Do not modify `demo/demo-persistence.html`. The demo HTML is a fixture; rewrite it deliberately, not as a side effect of `/demo`.
