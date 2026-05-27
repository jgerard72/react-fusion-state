---
description: Same as /commit but also pushes to the current branch's upstream after success
---

# /commit-push — Commit + push to upstream

This command runs the full `/commit` flow, then pushes to the current branch's upstream remote.

## 1. Run the full commit flow

Follow every step of `.cursor/commands/commit.md`, in order:

- Gather context (`git status`, `git diff`, `git diff --cached`, `git log --oneline -10`)
- Group changes; if mixed concerns, ASK before staging
- Refuse to commit secrets, hand-edited `dist/`, or `.cursor/`
- **Doc & changelog sync** (`/commit` step 3) — apply the mandatory checklist before staging:
  - `README.md`, `DOCUMENTATION.md`, `GETTING_STARTED.md` updated when triggered
  - `CHANGELOG.md` entry under `[Unreleased]` or the in-flight version
  - Version banners consistent with `package.json#version`
  - No `@deprecated` symbol promoted in any doc sample
  - If a triggered source change ships without its doc update, STOP and ask
- **Build sync** (`/commit` step 4) — apply the mandatory checklist before staging:
  - Run `npm run build` if the diff touches `package.json#version`, any `src/**`, `tsconfig-build.json`, `scripts/build-demo.js`, or any `package.json` field that affects the published surface (`scripts`, `files`, `exports`, `main`, `types`)
  - Stage the regenerated `dist/**` and `demo/react-fusion-state.umd.js` in the SAME commit as the trigger
  - If the build fails, STOP — do not commit a broken state
- Write a Conventional Commit message (HEREDOC, why-not-what body)
- Stage and commit (docs + build artifacts in the same commit as the trigger)
- Confirm with `git status` + `git log -1 --oneline`

## 2. Pre-push safety checks

Before pushing:

- Verify the current branch tracks an upstream: `git rev-parse --abbrev-ref --symbolic-full-name @{u}` — if it fails, ASK whether to set upstream (and to which remote) before pushing.
- Verify the current branch. If on `master` or `main`, DOUBLE-CHECK with the user that the commit is intended for the default branch.
- If pushing to `master`/`main`, NEVER force-push. Warn loudly and stop if the user asks for force-push to main.
- Run `npm test` if the change touches `src/` and the user has not already run it in this session — a failing test must not reach `origin`.
- The build was already run as part of `/commit` step 4 above; if for some reason it was skipped, run `npm run build` now and AMEND only if the user explicitly authorizes — otherwise STOP and create a follow-up commit before pushing.

## 3. Push

- Run `git push` (without `--force`, without `--no-verify`).
- If the push is rejected (non-fast-forward, etc.), STOP and report the situation to the user. Do not attempt to resolve by force-pushing.
- After success, show:
  - `git status` (clean tree confirmation)
  - The pushed SHA via `git log -1 --oneline`
  - The remote URL via `git config --get remote.origin.url` so the user can open it

## 4. Never

- Never push tags unless the user explicitly asks.
- Never run `npm publish`. Publishing is a separate, manual step.
- Never bypass branch protections.
