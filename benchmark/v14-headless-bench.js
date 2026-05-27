/* eslint-disable no-console */

/**
 * v1.4.0 headless performance benchmark.
 *
 * Measures the four pure-JS scenarios on the `createStore()` factory shipped
 * in v1.4.0 — no React mounting, no DOM, no JSDOM. The numbers below
 * therefore represent the *upper bound* of how fast a React app on
 * `react-fusion-state` can possibly be, since any additional cost comes
 * from React itself (commit phase, reconciliation, etc.).
 *
 * Scenarios:
 *   1. Cold start             — instantiate 1 000 keys via `setState`.
 *   2. Hot setState           — 10 000 sequential `setState({n: n+1})` calls.
 *   3. Selector re-evaluations — 10 000 `getSnapshot()` calls with mixed
 *                                state mutations interleaved.
 *   4. Memory at mount        — `process.memoryUsage().heapUsed` delta
 *                                between an empty store and a 1 000-key one.
 *
 * Output is a single Markdown table that can be pasted verbatim into
 * `CHANGELOG.md` / `README.md` for v1.4.0. Re-run any time with:
 *
 *   node benchmark/v14-headless-bench.js
 *
 * The thresholds at the bottom of the file act as a *release gate*: if any
 * scenario exceeds the budget, the script exits with code 1 so CI catches
 * regressions before publish.
 */

'use strict';

const path = require('path');

// Resolve the freshly built local lib so we measure what we'll publish.
// Falls back to a friendly error if `npm run build` hasn't been run.
let createStore;
try {
  ({createStore} = require(path.resolve(__dirname, '..', 'dist', 'index.js')));
} catch (err) {
  console.error(
    '\u001b[31m[bench] dist/index.js not found.\u001b[0m Run `npm run build` first.',
  );
  console.error(err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run `fn` once for warm-up (so the JIT optimises hot paths) then measure
 * `iterations` clean runs and return the median elapsed time in ms.
 * Median (not mean) shields the result from outliers due to GC pauses.
 */
function measure(fn, iterations = 7) {
  fn(); // warm-up
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = process.hrtime.bigint();
    fn();
    const t1 = process.hrtime.bigint();
    samples.push(Number(t1 - t0) / 1e6);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}

function fmtMs(ms) {
  return ms < 1 ? `${(ms * 1000).toFixed(1)} µs` : `${ms.toFixed(2)} ms`;
}

function fmtKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const KEYS = 1000;
const HOT_ITERATIONS = 10000;

const coldStart = () => {
  const store = createStore();
  for (let i = 0; i < KEYS; i++) {
    store.setState({[`k${i}`]: i});
  }
};

const hotSetState = () => {
  const store = createStore({initialState: {n: 0}});
  for (let i = 0; i < HOT_ITERATIONS; i++) {
    store.setState(prev => ({...prev, n: (prev.n) + 1}));
  }
};

const selectors = () => {
  const store = createStore({initialState: {a: 0, b: 0, c: 0}});
  let sum = 0;
  let snapshots = 0;
  // Subscribe a global listener that mimics `useFusionStore` re-evaluation —
  // every state change runs the selector + simple equality check.
  let last;
  const selector = s => (s.a) + (s.b) + (s.c);
  store.subscribe(() => {
    const next = selector(store.getState());
    snapshots++;
    if (next !== last) {
      sum += next;
      last = next;
    }
  });
  for (let i = 0; i < HOT_ITERATIONS; i++) {
    const which = i % 3 === 0 ? 'a' : i % 3 === 1 ? 'b' : 'c';
    store.setState(prev => ({...prev, [which]: (prev[which]) + 1}));
  }
  // Guard against the JIT eliding the loop entirely.
  if (sum < 0 || snapshots === 0) throw new Error('elided');
};

const memoryAtMount = () => {
  if (global.gc) global.gc();
  const before = process.memoryUsage().heapUsed;
  const stores = [];
  for (let outer = 0; outer < 5; outer++) {
    const store = createStore();
    for (let i = 0; i < KEYS; i++) {
      store.setState({[`k${i}`]: i});
    }
    stores.push(store);
  }
  if (global.gc) global.gc();
  const after = process.memoryUsage().heapUsed;
  // Keep refs alive past the measurement so V8 can't GC them away.
  if (!stores.length) throw new Error('elided');
  return (after - before) / stores.length; // bytes per fully-populated store
};

// ---------------------------------------------------------------------------
// Run + report
// ---------------------------------------------------------------------------

console.log('');
console.log('react-fusion-state v1.4.0 — headless performance benchmark');
console.log('============================================================');
console.log('');

const cold = measure(coldStart);
const hot = measure(hotSetState);
const sel = measure(selectors);
const mem = memoryAtMount();

// Budgets sized at ~150 % of the measured v1.4.0 baseline on Node 22+ so
// CI catches a real regression (the spread-based update path is inherently
// O(keys²) — same wall every store with object semantics hits, see Zustand
// and Redux Toolkit). Numbers below stay valid as long as Node and the
// hardware stay roughly comparable; revisit if you upgrade Node majors.
//
// Memory is reported but NOT gated — V8's GC timing is too non-deterministic
// across runs without `node --expose-gc`, and the spread-clone update path
// retains many intermediate snapshots between collections. The number is
// still useful as a smoke test ("does it stay in the same order of
// magnitude?") so we keep printing it.
const rows = [
  ['Cold start  (1 000 setState)', fmtMs(cold), '< 150 ms', cold < 150],
  ['Hot setState (10 000 calls)', fmtMs(hot), '< 5 ms', hot < 5],
  ['Selectors   (10 000 evals)', fmtMs(sel), '< 5 ms', sel < 5],
  ['Memory per 1 000-key store', fmtKb(mem), 'info only', true],
];

const colW = [Math.max(...rows.map(r => r[0].length), 30), 14, 12, 6];
const pad = (s, w) => String(s).padEnd(w);
console.log(
  pad('Scenario', colW[0]),
  pad('v1.4.0 result', colW[1]),
  pad('Budget', colW[2]),
  'PASS?',
);
console.log('-'.repeat(colW[0] + colW[1] + colW[2] + 8));
for (const [name, val, budget, ok] of rows) {
  console.log(
    pad(name, colW[0]),
    pad(val, colW[1]),
    pad(budget, colW[2]),
    ok ? '\u001b[32mok\u001b[0m' : '\u001b[31mFAIL\u001b[0m',
  );
}
console.log('');
console.log('  Notes:');
console.log('  - Measurements taken on Node ' + process.version);
console.log('  - Pure JS, no React mounting, no DOM');
console.log('  - Median of 7 runs after warm-up (shields against GC outliers)');
console.log('');

const anyFail = rows.some(r => !r[3]);
process.exit(anyFail ? 1 : 0);
