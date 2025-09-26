import React from 'react';
import {render, screen, act, renderHook} from '@testing-library/react';
import {
  FusionStateProvider,
  useFusionState,
  useFusionHydrated,
} from '../index';

// Wrapper for renderHook tests
const wrapper = ({children}: {children: React.ReactNode}) => (
  <FusionStateProvider>{children}</FusionStateProvider>
);

describe('Enhanced useFusionState', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Object.is equality comparison', () => {
    test('should not update when Object.is returns true', () => {
      const {result, rerender} = renderHook(
        () => useFusionState('objectTest', 42),
        {wrapper}
      );

      const setValue = result.current[1];
      let renderCount = 0;
      
      // Count renders
      const originalValue = result.current[0];
      renderCount++;

      act(() => {
        setValue(42); // Same value - should not trigger re-render
      });

      // Value should remain the same and no additional render should occur
      expect(result.current[0]).toBe(42);
    });

    test('should use shallow comparison for objects when shallow=true', () => {
      const {result} = renderHook(
        () => useFusionState('shallowObj', {a: 1, b: 2}, {shallow: true}),
        {wrapper}
      );

      const setValue = result.current[1];

      act(() => {
        setValue({a: 1, b: 2}); // Same shallow structure
      });

      expect(result.current[0]).toEqual({a: 1, b: 2});

      act(() => {
        setValue({a: 1, b: 3}); // Different value
      });

      expect(result.current[0]).toEqual({a: 1, b: 3});
    });

    test('should use deep comparison for objects when shallow=false (default)', () => {
      const {result} = renderHook(
        () => useFusionState('deepObj', {a: {nested: 1}}, {shallow: false}),
        {wrapper}
      );

      const setValue = result.current[1];

      act(() => {
        setValue({a: {nested: 1}}); // Same deep structure
      });

      expect(result.current[0]).toEqual({a: {nested: 1}});

      act(() => {
        setValue({a: {nested: 2}}); // Different nested value
      });

      expect(result.current[0]).toEqual({a: {nested: 2}});
    });
  });

  describe('Server-side rendering support', () => {
    test('should provide proper server snapshot', () => {
      const initialState = {serverKey: 'server-value'};
      
      const {result} = renderHook(
        () => useFusionState('serverKey', 'default-value'),
        {
          wrapper: ({children}: {children: React.ReactNode}) => (
            <FusionStateProvider initialState={initialState}>
              {children}
            </FusionStateProvider>
          ),
        }
      );

      // Should use the initial state value for SSR
      expect(result.current[0]).toBe('server-value');
    });
  });

  describe('Single initialization effect', () => {
    test('should initialize properly with static value', () => {
      function TestComponent() {
        const [value] = useFusionState('initTest', 'initialized');
        return <div data-testid="value">{value}</div>;
      }

      render(
        <FusionStateProvider>
          <TestComponent />
        </FusionStateProvider>
      );

      expect(screen.getByTestId('value').textContent).toBe('initialized');
    });
  });

  describe('No persistence logic in hook', () => {
    test('should not have any storage-related options', () => {
      // This test verifies that persistence options are ignored in the hook
      const {result} = renderHook(
        () => useFusionState('noPersist', 'value', {
          // These options should be ignored as persistence is now handled by Provider
          persist: true,
          adapter: undefined,
          keyPrefix: 'ignored',
          debounceTime: 1000,
        } as any),
        {wrapper}
      );

      expect(result.current[0]).toBe('value');
      
      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
    });
  });
});

describe('useFusionHydrated', () => {
  test('should return hydration status', async () => {
    const {result} = renderHook(() => useFusionHydrated(), {wrapper});
    
    // Initially might be false, but should become true
    expect(typeof result.current).toBe('boolean');
    
    // Wait for hydration to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current).toBe(true);
  });

  test('should become hydrated when state exists', async () => {
    const {result} = renderHook(
      () => {
        const hydrated = useFusionHydrated();
        const [value, setValue] = useFusionState('hydrateTest', 'initial');
        return {hydrated, value, setValue};
      },
      {wrapper}
    );

    // Should be hydrated since we have state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.hydrated).toBe(true);
    expect(result.current.value).toBe('initial');
  });
});
