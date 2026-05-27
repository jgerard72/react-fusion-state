---
description: Critical-path code audit of react-fusion-state — surfaces the highest-impact risks first
---

# /audit — Critical code audit

You are a senior reviewer auditing `react-fusion-state`. This is a **published npm library** with a strict public API and a zero-dependency promise. Your job is to surface the highest-impact risks, not to nitpick.

Strict rules:

- READ-ONLY mode. Do not edit any file. Do not run any build / install / publish command.
- Stay scoped to what matters most. Do not generate exhaustive style-guide commentary.
- No global refactor proposals. Each finding must point to a small, actionable fix.

## 1. Scope the audit

Ask the user upfront ONLY if ambiguous:

- "Full repo audit" → scan `src/` exhaustively (default if unsure).
- "Diff audit" → analyze only `git diff origin/master...HEAD` (current branch changes).
- "File audit" → analyze a specific path provided.

Otherwise default to full repo and proceed.

## 2. Audit dimensions (in priority order)

Examine each dimension and flag concrete findings. Cite file paths + line numbers.

### A. Public API integrity (highest priority)

- Does anything exported from `src/index.ts` have a recently changed signature, return type, or removed property?
- Are all `@deprecated` symbols still present and still pointing to their canonical alternative?
- Are there any new public exports missing from `src/index.ts`, `README.md`, `DOCUMENTATION.md`, or `CHANGELOG.md`?
- Does `dist/*.d.ts` match `src/` (rebuild needed)?

### B. Bundle size and dependencies

- Is `dependencies` in `package.json` still empty?
- Are `peerDependencies` still limited to `react` / `react-dom`?
- Any new heavy import in `src/` (lodash, moment, rxjs, immer, etc.)?
- Any polyfill or shim accidentally pulled in?

### C. Cross-platform safety

- Top-level imports of `window`, `document`, `localStorage`, `sessionStorage`, `AsyncStorage`?
- Side effects at module import time in any storage adapter?
- Does `src/storage/autoDetect.ts` still correctly fall through Web → RN → memory → noop?
- Anything that would crash under SSR (Next.js, Remix)?

### D. Performance hot paths

- Is `Object.is` still the first equality check in `useFusionState`?
- Is the batching scheduler in `src/utils/batch.ts` still used by the provider's notify path?
- Any `JSON.parse(JSON.stringify(...))`, `structuredClone`, or deep clone in a set/notify path?
- Any subscription added without a matching unsubscribe?

### E. Security

- Any network call introduced anywhere in `src/`?
- Are debug logs guarded behind the `debug` flag and off by default?
- Do error messages (`FusionStateError`, `PersistenceError`) leak arbitrary state values?
- Is anything sensitive being persisted to storage that wasn't before?

### F. Tests

- Does `npm test` still pass on this tree? (Check `__tests__/` to see if anything was deleted or skipped recently.)
- Are backward-compatibility tests (`src/__tests__/backward-compatibility.test.tsx`) intact?
- Any new public behavior shipped without a matching test?

### G. Deprecation and versioning hygiene

- Any `@deprecated` symbol promoted in docs or examples?
- Is `package.json` `version` consistent with the README banner?
- Is `CHANGELOG.md` `[Unreleased]` empty (just released) or accurate?
- Any breaking change present in the working tree without a major version bump planned?

## 3. Output format

Structure the response in exactly three sections, in this order:

### BLOCKERS

Issues that MUST be fixed before the next release. Anything that:

- breaks the public API in 1.x
- adds a runtime dependency
- introduces a network call
- breaks tests
- breaks SSR or cross-platform
- introduces a deep clone or removes `Object.is` from the hot path
- mismatches `package.json` version with `CHANGELOG.md` / README banner

### SHOULD FIX

Important quality issues that aren't release blockers but should be addressed soon. Suggested patches must be minimal and local.

### NICE TO HAVE

Low-risk improvements (clarity, JSDoc gaps, micro-perf, doc polish).

## 4. For every finding

Include:

- File path + line numbers (e.g. `src/index.ts:86-95`)
- One sentence on WHY it matters
- The smallest possible fix (do not write the patch, describe it)

## 5. Do NOT

- Do not propose architectural overhauls.
- Do not propose adding new abstractions.
- Do not suggest a v2 design — the audit is about the current state.
- Do not edit any file. Output the report only.
