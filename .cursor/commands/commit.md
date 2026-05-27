---
description: Analyze staged + unstaged changes and create a clean conventional commit (no push)
---

# /commit — Conventional commit, no push

You are creating a git commit for `react-fusion-state`. Follow this flow strictly.

## 1. Gather context (run in parallel)

- `git status` — list staged, unstaged, untracked
- `git diff` — unstaged changes
- `git diff --cached` — already staged changes
- `git log --oneline -10` — recent commit style for this repo

## 2. Analyze and group

- Group related changes into a single logical commit when they belong together.
- If the working tree mixes unrelated concerns (e.g. release bump + AI tooling + lockfile cleanup), STOP and ask the user how to split before staging anything.
- Never commit `.env`, `.env.*`, credentials, tokens, or anything matching a secret pattern. If detected, abort and warn.
- Never commit hand-edited `dist/*` — it's a build artifact. If `dist/` shows up as modified without a corresponding source change, ask before staging.
- Never commit `.cursor/` (it's user-local tooling and gitignored).

## 3. Doc & changelog sync (MANDATORY — run before staging)

User-facing documentation must stay in sync with the public surface. Before staging, decide if the diff requires a doc update by checking these triggers:

**Triggers that REQUIRE updating one or more of the three docs:**

- Any change to `src/index.ts` (the public API surface) — new export, removed export, renamed export, signature change, or new `@deprecated` tag.
- Any new public behavior of `useFusionState`, `FusionStateProvider`, `useFusionStateLog`, `useFusionHydrated`, `createKey`, `createNamespacedKey`, `createDevTools`, `useDevTools`, or any storage adapter factory in `src/storage/`.
- Any bug fix that changes observable behavior visible to consumers (timing, hydration semantics, persistence behavior, error messages).
- Any version bump in `package.json` (the README banner and the DOCUMENTATION.md version line MUST track `package.json` `version`).
- Any new `@deprecated` alias added or wording changed.
- Any change to the supported persistence config shape, `StorageAdapter` contract, or the auto-detection chain.

**For each triggered change, update the relevant doc(s):**

- `README.md` — high-level: features list, quick start, banner version (`### vX.Y.Z`), Migration to v2 (preview) section if a deprecation moves.
- `DOCUMENTATION.md` — full reference: API table, version line at top, persistence options, code samples reflecting the canonical API only (NEVER promote a `@deprecated` symbol).
- `GETTING_STARTED.md` — first-time experience: ensure quick-start snippet and contributor commands still match the current scripts and APIs.
- `CHANGELOG.md` — every behavioral change goes in `[Unreleased]` (or the in-flight version if one is staged). Group under Added / Changed / Deprecated / Removed / Fixed / Notes per Keep a Changelog.

**For each doc, run a quick sanity pass:**

- No reference to a removed export.
- No code sample using a `@deprecated` alias.
- Version banner consistent with `package.json#version`.
- Migration table in `README.md` includes any new deprecation.

If a triggered change ships **without** the corresponding doc update in the same commit, STOP and ask the user — split the commit or update the docs first. The only exception is a pure-internal refactor with zero observable behavior change: in that case explicitly note the rationale in the commit body.

## 4. Build sync (MANDATORY when source / version / build pipeline changes)

The published artifacts (`dist/**`) and the demo bundle (`demo/react-fusion-state.umd.js`) MUST stay in lockstep with the source and the package version. Run `npm run build` BEFORE staging when ANY of these triggers fire:

- **Version bump** in `package.json` — the demo bundle embeds the version via the esbuild `footer` in `scripts/build-demo.js`; without rebuild, the demo's "Version v…" tag goes stale instantly.
- **Any change in `src/**`** — the published `dist/*.d.ts` / `dist/*.js` MUST match the source; consumers receive `dist/`, not `src/`.
- **Any change to `tsconfig-build.json`, `scripts/build-demo.js`, or `package.json` `scripts`/`files`/`exports`/`main`/`types`** — the build pipeline itself changed; outputs may differ even if `src/` is untouched.

What the build does:

1. `rm -rf dist/*` — wipes stale artifacts.
2. `tsc -p tsconfig-build.json` — regenerates `dist/**` from `src/**`.
3. `node scripts/build-demo.js` — regenerates `demo/react-fusion-state.umd.js` from `dist/index.js` (esbuild IIFE bundle, embeds version).

After the build:

- Stage the resulting `dist/**` and `demo/react-fusion-state.umd.js` changes **in the SAME commit** as the source/version change that triggered them. The published artifact and its source must never drift across commits.
- If `git diff --stat` shows zero artifact change post-rebuild, that means TypeScript output was already up to date — fine, just keep going.
- If the build FAILS, STOP. Do not commit a broken state. Surface the error and ask the user.

Do NOT skip this step "to save time" — the cost of a stale `dist/` shipping to npm is far higher than 5 seconds of build.

## 5. Draft the message

Use Conventional Commits. Prefer these types based on what changed:

- `feat:` — new public export or behavior in `src/`
- `fix:` — bug fix
- `perf:` — perf improvement in the state engine
- `refactor:` — internal restructure, no public API change
- `docs:` — README / DOCUMENTATION / GETTING_STARTED / CHANGELOG / JSDoc
- `test:` — tests only
- `chore:` — tooling, deps, lockfile, configs
- `release:` — version bump + changelog promotion

Format:

```
<type>(<optional scope>): <imperative short summary>

<body explaining the WHY, not the WHAT — what the diff already shows>

<optional BREAKING CHANGE: footer if applicable — but breaking changes are forbidden in 1.x>
```

Keep the summary under 72 chars. Focus the body on the rationale, trade-offs, or risk being mitigated.

## 6. Stage and commit

- Stage only the files that belong to this commit (`git add <files>`). The doc files updated in step 3 AND the build artifacts regenerated in step 4 must all be staged in the same commit as the source change that triggered them.
- Pass the message via HEREDOC for clean formatting:

```bash
git commit -m "$(cat <<'EOF'
<full message here>
EOF
)"
```

- Never use `--no-verify`, never `--amend` an existing commit unless the user explicitly asks.
- After commit, run `git status` to confirm and show the SHA via `git log -1 --oneline`.

## 7. Do NOT push

This command commits only. The user will push separately when ready. Do not run `git push` under any circumstance.
