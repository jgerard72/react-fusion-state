/**
 * @jest-environment node
 *
 * Runs in a real Node environment (no `window`, no `document`) instead of
 * jsdom, so the SSR detection in `autoDetect.ts` is exercised against the
 * actual server-side runtime semantics. Previously this file relied on
 * `delete (global as any).window` inside a jsdom env, which jest-environment-
 * jsdom@30 no longer honors as a real teardown.
 */
import {
  detectBestStorageAdapter,
  isSSREnvironment,
} from '../storage/autoDetect';

describe('autoDetect - SSR (noop)', () => {
  it('is SSR environment', () => {
    expect(isSSREnvironment()).toBe(true);
  });

  it('returns noop adapter', async () => {
    const adapter = detectBestStorageAdapter();
    await adapter.setItem('k', 'v');
    const v = await adapter.getItem('k');
    expect(v).toBeNull();
  });
});
