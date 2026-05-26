# react-fusion-state — AI Agent Guidelines

This document defines how AI agents should behave when working on this repository.

It complements `.cursor/rules` and provides a clear shared operating model for Cursor, Composer, and coding agents.

---

# Project Context

`react-fusion-state` is a **zero-dependency React state management library** published to npm.

Primary goals:

- keep the API ultra-simple (`useFusionState` + `FusionStateProvider`)
- keep the bundle tight (~7 KB gzipped — measured with `esbuild --minify --bundle` on `dist/index.js`, externalising react/react-dom, then gzip level 9)
- stay 100% backward compatible inside the 1.x line
- preserve cross-platform support (React Web + React Native, with SSR safety)
- maintain a green test suite at all times

Agents must optimize for **API stability, bundle size, and predictability**. This is a published library, not an app — every change ships to thousands of downstream consumers.

---

# General Behavior

Agents must:

- analyze the repository before generating code
- respect the current architecture
- apply the smallest possible change
- preserve naming conventions
- preserve folder responsibilities
- never refactor broad areas unless explicitly asked
- never break the public API surface in a minor or patch release
- never introduce dependencies (this is a strict zero-deps library)

Agents should prefer:

- simple solutions
- typed code
- local clarity
- explicit boundaries
- platform-agnostic implementations

Agents must avoid:

- speculative architecture
- over-engineering
- hidden coupling
- unnecessary abstractions
- adding runtime dependencies (peer or otherwise) without explicit user approval

---

# Architecture

Target structure:

```
src/
  index.ts                  → public API surface (single source of truth for exports)
  useFusionState.ts         → main hook
  FusionStateProvider.tsx   → React provider + global state container
  useFusionStateLog.tsx     → debug hook
  useFusionHydrated.ts      → SSR hydration helper
  createKey.ts              → typed key system (createKey, createNamespacedKey)
  devtools.ts               → optional DevTools integration
  types.ts                  → shared public types and error classes
  utils/
    index.ts                → equality helpers, debounce, error formatting
    batch.ts                → batched update scheduler
  storage/
    storageAdapters.ts      → localStorage + Noop adapters
    asyncStorageAdapter.ts  → React Native AsyncStorage adapter
    autoDetect.ts           → runtime adapter detection (Web / RN / SSR / memory)
  examples/                 → reference examples (not part of the public API)
  __tests__/                → Jest test suites
```

Build output:

```
dist/                       → emitted by `npm run build` (tsc -p tsconfig-build.json)
```

---

# Public API Stability

The public API is defined exclusively by **what is exported from `src/index.ts`**. Anything not exported there is internal and may change at any time.

Rules:

- never remove, rename, or change the signature of a public export in 1.x
- never narrow a public type in 1.x (widening is OK if it stays backward compatible)
- new public exports must be added to `src/index.ts` and documented in `README.md`, `DOCUMENTATION.md`, and `CHANGELOG.md`
- update `dist/` is generated, **never edited by hand**
- if uncertain whether a symbol is public, check `src/index.ts` first

The two canonical primitives that must never break are:

- `useFusionState(key, defaultValue, options?)`
- `<FusionStateProvider initialState? debug? persistence? devTools?>`

---

# Deprecation Policy

The library is currently preparing v2.0.0. Several legacy aliases are marked `@deprecated` and will be removed in v2:

- Hook aliases: `useSharedState`, `usePersistentState`, `useAppState` → `useFusionState`
- Provider aliases: `GlobalStateProvider`, `StateProvider`, `AppStateProvider` → `FusionStateProvider`
- Storage adapter aliases: `createWebStorageAdapter`, `createRNStorageAdapter`, `createMobileStorageAdapter`, `createInMemoryAdapter`, `autoDetectStorage`, `NoopStorageAdapter`
- Example key objects: `AppKeys`, `UserKeys`

Agents must:

- never promote, recommend, or use a `@deprecated` symbol in new code, examples, or documentation
- always use the canonical name in suggestions
- preserve the `@deprecated` JSDoc tag and the "Will be removed in v2." wording when touching these symbols
- never remove a deprecated alias outside of a v2 release

The current canonical migration table lives in `README.md` under `## Migration to v2 (preview)`. Keep it in sync if names change.

---

# Bundle Size and Zero Dependencies

`react-fusion-state` ships with **zero runtime dependencies** and a ~7 KB gzipped bundle (minified). This is a core selling point — comparable to Zustand on raw size, with built-in persistence and DevTools support included rather than required as separate middleware.

Rules:

- never add a runtime dependency to `dependencies` in `package.json`
- never add a peer dependency beyond the existing `react` / `react-dom`
- avoid imports that pull in heavy polyfills
- prefer small, inline utilities over library calls
- when adding code, consider its impact on the published bundle

React Native AsyncStorage is intentionally **not** a peer dependency — the adapter resolves it dynamically at runtime via `try/require`, so users without RN don't pay the cost.

---

# Cross-Platform Strategy

The library must run identically on:

- React DOM (Web)
- React Native (iOS / Android)
- SSR environments (Next.js, Remix, etc., no `window`)
- Node.js test environments (Jest + jsdom)

Rules:

- never import `window`, `document`, `localStorage`, or `AsyncStorage` at module top-level
- always guard browser APIs behind runtime checks (`typeof window !== 'undefined'`)
- platform detection belongs in `src/storage/autoDetect.ts` — do not duplicate it elsewhere
- the `createNoopStorageAdapter` fallback is the SSR-safe default; never assume real storage exists
- never break the auto-detection chain (Web → RN → memory → noop)

---

# Storage Adapters

All persistence flows through the `StorageAdapter` interface (`src/storage/storageAdapters.ts`).

Rules:

- storage logic lives exclusively under `src/storage/`
- never call platform storage APIs directly from `FusionStateProvider.tsx`, hooks, or examples
- new adapters must implement the `StorageAdapter` (or `ExtendedStorageAdapter`) contract
- adapter creation must be lazy (no side-effect at import time)
- always handle adapter errors gracefully — never let a storage failure crash the React tree

The canonical user-facing API is:

- `createLocalStorageAdapter()` (Web)
- `createAsyncStorageAdapter()` (React Native)
- `createMemoryStorageAdapter()` (tests / SSR)
- `createNoopStorageAdapter()` (fallback)
- `detectBestStorageAdapter()` (auto)

---

# Types

Agents should favor explicit, narrow types.

Rules:

- avoid `any` (`unknown` is preferred when a generic isn't possible)
- type every public export — no implicit `any` reaches `dist/*.d.ts`
- use the `TypedKey<T>` system (`createKey`) to provide IntelliSense in user code
- shared types live in `src/types.ts`
- never widen a public type signature in a way that breaks inference for existing users

The library's TypeScript magic is part of the DX value proposition — preserve it.

---

# Testing

Test suite: **Jest + @testing-library/react** (75 tests across `src/__tests__/`).

Rules:

- all tests must pass before any change is considered complete (`npm test`)
- never delete or skip a test to make a change pass
- new public behavior requires a new test
- regression fixes require a test that reproduces the original bug
- backward compatibility tests (`src/__tests__/backward-compatibility.test.tsx`) are sacred — they enforce the 1.x promise
- prefer integration-style tests over mock-heavy unit tests when possible

---

# Performance

The library is benchmarked against Redux / Zustand / Recoil. Performance regressions are not acceptable.

Rules:

- preserve `Object.is` as the priority equality check in `useFusionState`
- preserve batched update notifications (`src/utils/batch.ts`)
- never reintroduce per-component deep clones in hot paths
- prefer reference equality and shallow checks before falling back to deep equality
- when in doubt, run `npm run benchmark` before/after a change in the state engine

---

# Versioning and SemVer

This project follows strict SemVer:

- **patch (1.x.y)** — bug fixes only, no behavior change
- **minor (1.y.0)** — additive changes, new exports, deprecations, doc updates
- **major (2.0.0)** — removal of `@deprecated` aliases, API breaks

Rules:

- every release bumps `package.json` `version` and promotes `## [Unreleased]` in `CHANGELOG.md`
- the `CHANGELOG.md` follows Keep a Changelog (Added / Changed / Deprecated / Removed / Fixed / Notes)
- the README banner (`### vX.Y.Z`) must match `package.json`
- run `npm run build` + `npm test` + `npm run publish:dry` before any real `npm publish`
- never commit a hand-edited `dist/` — regenerate it via `npm run build`

---

# Documentation

User-facing docs live in:

- `README.md` — quick start, features, migration guide
- `DOCUMENTATION.md` — full API reference
- `GETTING_STARTED.md` — step-by-step intro
- `CHANGELOG.md` — release history
- `CONTRIBUTING.md` — contribution workflow
- `PLATFORM_COMPATIBILITY.md` (in `src/`) — platform notes

Rules:

- when changing or adding a public API, update at least `README.md`, `DOCUMENTATION.md`, and `CHANGELOG.md`
- never promote a `@deprecated` symbol in any user-facing doc
- code samples in docs must compile against the current public API
- keep examples minimal — this is a low-config library, the docs should reflect that

---

# Security

Agents must be careful with:

- logs containing user state values (the `debug` flag prints state diffs — keep it opt-in)
- storage adapters that persist arbitrary user data (never log or transmit it elsewhere)
- error messages that could leak internal keys or values to end users
- SSR hydration mismatches (always assume client and server may differ on first render)

The library never makes network calls and never should.

---

# Release Discipline

This project ships to npm. Every release is a public contract.

Agents must prefer:

- non-breaking minor releases
- documented deprecation paths with clear migration tables
- one focused change per release when possible
- conventional commits in history (`feat:`, `fix:`, `chore:`, `docs:`, …)

Agents must avoid:

- breaking changes outside a major version bump
- silent removals or renames
- shipping unbuilt or untested code
- bumping multiple unrelated concerns in a single release

Core stability and predictability matter more than feature velocity.

---

# Final Rule

Agents must always follow `.cursor/rules`.

If multiple options exist, choose the one that:

1. preserves the public API
2. keeps the bundle small and dependency-free
3. stays cross-platform and SSR-safe
4. respects the deprecation roadmap toward v2
