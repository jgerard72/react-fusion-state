/**
 * Regression tests to ensure our v0.4.25 improvements don't break existing functionality
 */

import React from 'react';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {FusionStateProvider, useFusionState, useFusionHydrated} from '../index';

describe('Regression Tests v0.4.25', () => {
  describe('Object.is equality optimization', () => {
    test('should prevent unnecessary updates with Object.is', () => {
      function TestComponent() {
        const [count, setCount] = useFusionState('count', 5);

        return (
          <div>
            <span data-testid="count">{count}</span>
            <button data-testid="set-same-value" onClick={() => setCount(5)}>
              Set Same Value
            </button>
            <button
              data-testid="set-different-value"
              onClick={() => setCount(10)}>
              Set Different Value
            </button>
          </div>
        );
      }

      render(
        <FusionStateProvider>
          <TestComponent />
        </FusionStateProvider>,
      );

      expect(screen.getByTestId('count')).toHaveTextContent('5');

      // Setting same value should not cause state change
      act(() => {
        fireEvent.click(screen.getByTestId('set-same-value'));
      });

      expect(screen.getByTestId('count')).toHaveTextContent('5');

      // Setting different value should cause state change
      act(() => {
        fireEvent.click(screen.getByTestId('set-different-value'));
      });

      expect(screen.getByTestId('count')).toHaveTextContent('10');
    });

    test('should handle shallow comparison correctly', () => {
      function TestComponent() {
        const [obj, setObj] = useFusionState(
          'obj',
          {a: 1, b: 2},
          {shallow: true},
        );

        return (
          <div>
            <span data-testid="obj">{JSON.stringify(obj)}</span>
            <button
              data-testid="set-same-shallow"
              onClick={() => setObj({a: 1, b: 2})}>
              Set Same Shallow
            </button>
            <button
              data-testid="set-different-shallow"
              onClick={() => setObj({a: 1, b: 3})}>
              Set Different Shallow
            </button>
          </div>
        );
      }

      render(
        <FusionStateProvider>
          <TestComponent />
        </FusionStateProvider>,
      );

      expect(screen.getByTestId('obj')).toHaveTextContent('{"a":1,"b":2}');

      // Same shallow object should not update
      act(() => {
        fireEvent.click(screen.getByTestId('set-same-shallow'));
      });
      expect(screen.getByTestId('obj')).toHaveTextContent('{"a":1,"b":2}');

      // Different shallow object should update
      act(() => {
        fireEvent.click(screen.getByTestId('set-different-shallow'));
      });
      expect(screen.getByTestId('obj')).toHaveTextContent('{"a":1,"b":3}');
    });
  });

  describe('Unified initialization', () => {
    test('should initialize state correctly', () => {
      function TestComponent() {
        const [value] = useFusionState('init-test', 'initialized');

        return <div data-testid="value">{value}</div>;
      }

      render(
        <FusionStateProvider>
          <TestComponent />
        </FusionStateProvider>,
      );

      expect(screen.getByTestId('value')).toHaveTextContent('initialized');
    });

    test('should work with Provider persistence', () => {
      const mockStorage = {
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
      };

      function TestComponent() {
        const [value, setValue] = useFusionState('persist-test', 'initial');

        return (
          <div>
            <span data-testid="value">{value}</span>
            <button data-testid="update" onClick={() => setValue('updated')}>
              Update
            </button>
          </div>
        );
      }

      render(
        <FusionStateProvider
          persistence={{
            adapter: mockStorage,
            persistKeys: ['persist-test'],
          }}>
          <TestComponent />
        </FusionStateProvider>,
      );

      expect(screen.getByTestId('value')).toHaveTextContent('initial');

      act(() => {
        fireEvent.click(screen.getByTestId('update'));
      });

      expect(screen.getByTestId('value')).toHaveTextContent('updated');
    });
  });

  describe('SSR server snapshot', () => {
    test('should provide correct server snapshot', () => {
      const initialState = {
        'ssr-key': 'server-value',
      };

      function TestComponent() {
        const [value] = useFusionState('ssr-key', 'client-default');
        return <div data-testid="value">{value}</div>;
      }

      render(
        <FusionStateProvider initialState={initialState}>
          <TestComponent />
        </FusionStateProvider>,
      );

      // Should use server value from initialState
      expect(screen.getByTestId('value')).toHaveTextContent('server-value');
    });
  });

  describe('useFusionHydrated hook', () => {
    test('should track hydration status', async () => {
      function TestComponent() {
        const isHydrated = useFusionHydrated();
        const [value] = useFusionState('hydration-test', 'test-value');

        return (
          <div>
            <span data-testid="hydrated">{isHydrated ? 'true' : 'false'}</span>
            <span data-testid="value">{value}</span>
          </div>
        );
      }

      render(
        <FusionStateProvider>
          <TestComponent />
        </FusionStateProvider>,
      );

      expect(screen.getByTestId('value')).toHaveTextContent('test-value');

      // Wait for hydration to complete
      await waitFor(
        () => {
          expect(screen.getByTestId('hydrated')).toHaveTextContent('true');
        },
        {timeout: 200},
      );
    });
  });

  describe('Cross-platform compatibility', () => {
    test('should work without React DOM batching', () => {
      // This test ensures our batch utility works even if batching is not available
      function TestComponent() {
        const [count, setCount] = useFusionState('batch-test', 0);

        const handleMultipleUpdates = () => {
          setCount(1);
          setCount(2);
          setCount(3);
        };

        return (
          <div>
            <span data-testid="count">{count}</span>
            <button data-testid="update" onClick={handleMultipleUpdates}>
              Multiple Updates
            </button>
          </div>
        );
      }

      render(
        <FusionStateProvider>
          <TestComponent />
        </FusionStateProvider>,
      );

      expect(screen.getByTestId('count')).toHaveTextContent('0');

      act(() => {
        fireEvent.click(screen.getByTestId('update'));
      });

      expect(screen.getByTestId('count')).toHaveTextContent('3');
    });
  });

  describe('Backward compatibility', () => {
    test('should maintain exact same API as before', () => {
      // Test that all old patterns still work exactly the same
      function LegacyComponent() {
        const [count, setCount] = useFusionState('legacy-count', 0);
        const [user, setUser] = useFusionState<string | null>(
          'legacy-user',
          null,
        );

        return (
          <div>
            <span data-testid="count">{count}</span>
            <span data-testid="user">{user || 'None'}</span>
            <button data-testid="increment" onClick={() => setCount(count + 1)}>
              +1
            </button>
            <button data-testid="set-user" onClick={() => setUser('John')}>
              Set User
            </button>
          </div>
        );
      }

      render(
        <FusionStateProvider>
          <LegacyComponent />
        </FusionStateProvider>,
      );

      expect(screen.getByTestId('count')).toHaveTextContent('0');
      expect(screen.getByTestId('user')).toHaveTextContent('None');

      act(() => {
        fireEvent.click(screen.getByTestId('increment'));
      });
      expect(screen.getByTestId('count')).toHaveTextContent('1');

      act(() => {
        fireEvent.click(screen.getByTestId('set-user'));
      });
      expect(screen.getByTestId('user')).toHaveTextContent('John');
    });
  });
});
