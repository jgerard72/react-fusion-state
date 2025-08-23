import {detectBestStorageAdapter} from '../storage/autoDetect';

describe('autoDetect - react native (AsyncStorage auto)', () => {
  const originalNavigator = global.navigator as any;
  const originalWindow = global.window as any;
  const originalRequire = (global as any).require;

  // Create a proper in-memory AsyncStorage mock
  const mockStorage = new Map<string, string>();

  beforeAll(() => {
    // Force navigator.product to be 'ReactNative' (Jest has a default Navigator)
    Object.defineProperty(global.navigator, 'product', {
      value: 'ReactNative',
      writable: true,
      configurable: true,
    });

    // Delete window to simulate RN environment
    delete (global as any).window;

    // Mock require to return a functional AsyncStorage implementation
    (global as any).require = (name: string) => {
      if (name === '@react-native-async-storage/async-storage') {
        return {
          getItem: async (k: string) => mockStorage.get(k) || null,
          setItem: async (k: string, v: string) => {
            mockStorage.set(k, v);
          },
          removeItem: async (k: string) => {
            mockStorage.delete(k);
          },
        };
      }
      throw new Error('module not found');
    };
  });

  afterAll(() => {
    (global as any).navigator = originalNavigator;
    (global as any).window = originalWindow;
    (global as any).require = originalRequire;
    mockStorage.clear();
  });

  it('returns AsyncStorage adapter when available', async () => {
    const adapter = detectBestStorageAdapter();
    await adapter.setItem('k', 'v');
    const v = await adapter.getItem('k');
    expect(v).toBe('v');
  });
});
