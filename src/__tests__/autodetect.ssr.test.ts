import {
  detectBestStorageAdapter,
  isSSREnvironment,
} from '../storage/autoDetect';

describe('autoDetect - SSR (noop)', () => {
  const originalWindow = global.window as any;

  beforeAll(() => {
    // Properly delete window to simulate SSR
    delete (global as any).window;
  });

  afterAll(() => {
    (global as any).window = originalWindow;
  });

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
