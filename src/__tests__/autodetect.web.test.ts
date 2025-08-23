import {
  detectBestStorageAdapter,
  isSSREnvironment,
} from '../storage/autoDetect';

describe('autoDetect - web (localStorage)', () => {
  const originalWindow = global.window as any;
  const originalNavigator = global.navigator as any;

  // Create isolated localStorage mock
  const mockStore = new Map<string, string>();

  beforeAll(() => {
    // Clean up any RN environment remnants
    delete (global as any).navigator;

    // Simulate browser environment with localStorage
    (global as any).window = {
      localStorage: {
        getItem(key: string) {
          return mockStore.has(key) ? mockStore.get(key)! : null;
        },
        setItem(key: string, value: string) {
          mockStore.set(key, value);
        },
        removeItem(key: string) {
          mockStore.delete(key);
        },
      },
    };
  });

  afterAll(() => {
    (global as any).window = originalWindow;
    (global as any).navigator = originalNavigator;
    mockStore.clear();
  });

  it('should not be SSR environment', () => {
    expect(isSSREnvironment()).toBe(false);
  });

  it('returns localStorage adapter and can persist', async () => {
    const adapter = detectBestStorageAdapter();
    await adapter.setItem('k', 'v');
    const v = await adapter.getItem('k');
    expect(v).toBe('v');
  });
});
