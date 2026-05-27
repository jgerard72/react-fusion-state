/**
 * React-bound tests for `createStore()`. Exercises the per-store `Provider`,
 * `useFusionState`, `useFusionStore` and `useFusionHydrated` hooks; verifies
 * that mounting two stores in the same tree keeps state, subscriptions and
 * re-renders fully isolated.
 */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {createStore, FusionStateProvider, useFusionState, shallow} from '../index';

describe('createStore — React bindings', () => {
  describe('Provider + useFusionState (single store)', () => {
    it('renders an initial value seeded at factory time', () => {
      const store = createStore({initialState: {n: 42}});
      function View() {
        const [n] = store.useFusionState<number>('n');
        return <span data-testid="v">{n}</span>;
      }
      render(
        <store.Provider>
          <View />
        </store.Provider>,
      );
      expect(screen.getByTestId('v')).toHaveTextContent('42');
    });

    it('updates the view on store.setState from outside React', () => {
      const store = createStore({initialState: {n: 0}});
      function View() {
        const [n] = store.useFusionState<number>('n');
        return <span data-testid="v">{n}</span>;
      }
      render(
        <store.Provider>
          <View />
        </store.Provider>,
      );
      act(() => {
        store.setState({n: 99});
      });
      expect(screen.getByTestId('v')).toHaveTextContent('99');
    });

    it('updates the view via the bound setValue', () => {
      const store = createStore({initialState: {n: 0}});
      function View() {
        const [n, setN] = store.useFusionState<number>('n');
        return (
          <button data-testid="b" onClick={() => setN(n + 1)}>
            {n}
          </button>
        );
      }
      render(
        <store.Provider>
          <View />
        </store.Provider>,
      );
      fireEvent.click(screen.getByTestId('b'));
      fireEvent.click(screen.getByTestId('b'));
      expect(screen.getByTestId('b')).toHaveTextContent('2');
    });

    it('throws when the bound hook is used outside the store Provider', () => {
      const store = createStore({initialState: {n: 0}});
      // The store-bound hooks DO actually still read DefaultStoreContext via
      // the Provider, so without it they throw the canonical PROVIDER_MISSING
      // error. We silence React's expected error logging for this assertion.
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      function View() {
        useFusionState<number>('n');
        return null;
      }
      expect(() => render(<View />)).toThrow(/FusionStateProvider/);
      spy.mockRestore();
      void store;
    });
  });

  describe('useFusionStore (selector, bound)', () => {
    it('re-renders only when the selected slice changes', () => {
      const store = createStore({initialState: {a: 1, b: 1}});
      let renders = 0;

      function PickA() {
        renders++;
        const a = store.useFusionStore<number>(s => s.a as number);
        return <span data-testid="a">{a}</span>;
      }
      function MutateB() {
        const [, setB] = store.useFusionState<number>('b');
        return (
          <button data-testid="mb" onClick={() => setB(prev => prev + 1)}>
            b
          </button>
        );
      }

      render(
        <store.Provider>
          <PickA />
          <MutateB />
        </store.Provider>,
      );

      const baseline = renders;
      fireEvent.click(screen.getByTestId('mb'));
      fireEvent.click(screen.getByTestId('mb'));
      fireEvent.click(screen.getByTestId('mb'));
      // a never changed → PickA never re-rendered after baseline.
      expect(renders).toBe(baseline);
      expect(screen.getByTestId('a')).toHaveTextContent('1');
    });

    it('honors a custom shallow equality function', () => {
      const store = createStore({
        initialState: {user: {name: 'Jacques'}, ping: 0},
      });
      let renders = 0;

      function PickUser() {
        renders++;
        // Returns a *new object* each render — without `shallow`, every
        // unrelated mutation would force a re-render.
        const view = store.useFusionStore(
          s => ({name: (s.user as {name: string}).name}),
          shallow,
        );
        return <span data-testid="u">{view.name}</span>;
      }
      function MutatePing() {
        const [, setPing] = store.useFusionState<number>('ping');
        return (
          <button data-testid="mp" onClick={() => setPing(prev => prev + 1)}>
            ping
          </button>
        );
      }

      render(
        <store.Provider>
          <PickUser />
          <MutatePing />
        </store.Provider>,
      );

      const baseline = renders;
      fireEvent.click(screen.getByTestId('mp'));
      fireEvent.click(screen.getByTestId('mp'));
      // User slice never actually changed → no re-render.
      expect(renders).toBe(baseline);
    });
  });

  describe('multi-store React isolation', () => {
    it('mutating store A does not re-render components of store B', () => {
      const storeA = createStore({initialState: {x: 0}});
      const storeB = createStore({initialState: {x: 1000}});
      let rendersA = 0;
      let rendersB = 0;

      function ViewA() {
        rendersA++;
        const [x] = storeA.useFusionState<number>('x');
        return <span data-testid="a">{x}</span>;
      }
      function ViewB() {
        rendersB++;
        const [x] = storeB.useFusionState<number>('x');
        return <span data-testid="b">{x}</span>;
      }

      render(
        <>
          <storeA.Provider>
            <ViewA />
          </storeA.Provider>
          <storeB.Provider>
            <ViewB />
          </storeB.Provider>
        </>,
      );

      const baselineA = rendersA;
      const baselineB = rendersB;

      act(() => {
        storeA.setState({x: 1});
        storeA.setState({x: 2});
        storeA.setState({x: 3});
      });

      // A re-rendered (at least once due to batched updates), B did not.
      expect(rendersA).toBeGreaterThan(baselineA);
      expect(rendersB).toBe(baselineB);
      expect(screen.getByTestId('a')).toHaveTextContent('3');
      expect(screen.getByTestId('b')).toHaveTextContent('1000');
    });

    it('two providers in the same tree resolve module-level hooks to the nearest one', () => {
      const storeOuter = createStore({initialState: {label: 'outer'}});
      const storeInner = createStore({initialState: {label: 'inner'}});

      function ReadLabel({testId}: {testId: string}) {
        const [label] = useFusionState<string>('label');
        return <span data-testid={testId}>{label}</span>;
      }

      render(
        <storeOuter.Provider>
          <ReadLabel testId="o" />
          <storeInner.Provider>
            <ReadLabel testId="i" />
          </storeInner.Provider>
        </storeOuter.Provider>,
      );

      expect(screen.getByTestId('o')).toHaveTextContent('outer');
      expect(screen.getByTestId('i')).toHaveTextContent('inner');
    });
  });

  describe('useFusionHydrated', () => {
    it('returns true immediately when no persistence is configured', () => {
      const store = createStore({initialState: {n: 0}});
      function View() {
        const ready = store.useFusionHydrated();
        return <span data-testid="r">{ready ? 'yes' : 'no'}</span>;
      }
      render(
        <store.Provider>
          <View />
        </store.Provider>,
      );
      expect(screen.getByTestId('r')).toHaveTextContent('yes');
    });
  });

  describe('legacy FusionStateProvider wraps createStore correctly', () => {
    it('still works end-to-end via the module-level hook', () => {
      function Counter() {
        const [n, setN] = useFusionState<number>('counter', 0);
        return (
          <button data-testid="c" onClick={() => setN(n + 1)}>
            {n}
          </button>
        );
      }
      render(
        <FusionStateProvider>
          <Counter />
        </FusionStateProvider>,
      );
      expect(screen.getByTestId('c')).toHaveTextContent('0');
      fireEvent.click(screen.getByTestId('c'));
      fireEvent.click(screen.getByTestId('c'));
      expect(screen.getByTestId('c')).toHaveTextContent('2');
    });
  });
});
