import React from 'react';
import {act, render, screen} from '@testing-library/react';
import {
  FusionStateProvider,
  useFusionState,
  useFusionStore,
  shallow,
} from '../index';
import {GlobalState} from '../types';

describe('useFusionStore', () => {
  it('returns the selected value', () => {
    function Display() {
      const count = useFusionStore((s) => (s.counter as number) ?? 0);
      return <div data-testid="count">{count}</div>;
    }

    render(
      <FusionStateProvider initialState={{counter: 42}}>
        <Display />
      </FusionStateProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('42');
  });

  it('updates when the selected value changes', () => {
    function App() {
      const [count, setCount] = useFusionState('counter', 0);
      const doubled = useFusionStore(
        (s) => ((s.counter as number) ?? 0) * 2,
      );
      return (
        <div>
          <div data-testid="raw">{count}</div>
          <div data-testid="doubled">{doubled}</div>
          <button data-testid="inc" onClick={() => setCount(count + 1)}>
            +
          </button>
        </div>
      );
    }

    render(
      <FusionStateProvider>
        <App />
      </FusionStateProvider>,
    );

    expect(screen.getByTestId('doubled')).toHaveTextContent('0');

    act(() => {
      screen.getByTestId('inc').click();
    });

    expect(screen.getByTestId('raw')).toHaveTextContent('1');
    expect(screen.getByTestId('doubled')).toHaveTextContent('2');

    act(() => {
      screen.getByTestId('inc').click();
    });

    expect(screen.getByTestId('doubled')).toHaveTextContent('4');
  });

  it('does NOT re-render when an unrelated key changes', () => {
    const renderSpy = jest.fn();

    // Sibling components so the Mutator re-render doesn't cascade into
    // CountConsumer through the React tree.
    function CountConsumer() {
      const count = useFusionStore((s) => (s.counter as number) ?? 0);
      renderSpy(count);
      return <div data-testid="count">{count}</div>;
    }

    function Mutator() {
      const [, setOther] = useFusionState('other', 'a');
      return (
        <button
          data-testid="touch-other"
          onClick={() => setOther((v) => v + '!')}>
          touch other
        </button>
      );
    }

    render(
      <FusionStateProvider initialState={{counter: 5}}>
        <CountConsumer />
        <Mutator />
      </FusionStateProvider>,
    );

    const initialRenderCount = renderSpy.mock.calls.length;

    act(() => screen.getByTestId('touch-other').click());
    act(() => screen.getByTestId('touch-other').click());
    act(() => screen.getByTestId('touch-other').click());

    expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    expect(screen.getByTestId('count')).toHaveTextContent('5');
  });

  it('does NOT re-render when the selector returns an equal value (default Object.is)', () => {
    const renderSpy = jest.fn();

    function ParitySpy() {
      const isEven = useFusionStore(
        (s) => ((s.counter as number) ?? 0) % 2 === 0,
      );
      renderSpy(isEven);
      return <div data-testid="parity">{String(isEven)}</div>;
    }

    function Mutator() {
      const [count, setCount] = useFusionState('counter', 0);
      return (
        <>
          <div data-testid="count">{count}</div>
          <button data-testid="add2" onClick={() => setCount(count + 2)}>
            +2
          </button>
        </>
      );
    }

    render(
      <FusionStateProvider>
        <ParitySpy />
        <Mutator />
      </FusionStateProvider>,
    );

    const initialRenders = renderSpy.mock.calls.length;

    act(() => screen.getByTestId('add2').click());
    act(() => screen.getByTestId('add2').click());
    act(() => screen.getByTestId('add2').click());

    expect(screen.getByTestId('count')).toHaveTextContent('6');
    expect(screen.getByTestId('parity')).toHaveTextContent('true');
    expect(renderSpy.mock.calls.length).toBe(initialRenders);
  });

  it('re-renders when the selector returns a new value (selector flip)', () => {
    const renderSpy = jest.fn();

    function ParitySpy() {
      const isEven = useFusionStore(
        (s) => ((s.counter as number) ?? 0) % 2 === 0,
      );
      renderSpy(isEven);
      return <div data-testid="parity">{String(isEven)}</div>;
    }

    function App() {
      const [count, setCount] = useFusionState('counter', 0);
      return (
        <div>
          <ParitySpy />
          <button data-testid="add1" onClick={() => setCount(count + 1)}>
            +1
          </button>
        </div>
      );
    }

    render(
      <FusionStateProvider>
        <App />
      </FusionStateProvider>,
    );

    const initialRenders = renderSpy.mock.calls.length;

    // Increments by 1 → parity flips → re-render
    act(() => screen.getByTestId('add1').click());
    expect(screen.getByTestId('parity')).toHaveTextContent('false');

    act(() => screen.getByTestId('add1').click());
    expect(screen.getByTestId('parity')).toHaveTextContent('true');

    // 2 re-renders expected (one per flip)
    expect(renderSpy.mock.calls.length).toBeGreaterThanOrEqual(
      initialRenders + 2,
    );
  });

  it('supports shallow equality for object selectors', () => {
    const renderSpy = jest.fn();

    function ProfileSpy() {
      const profile = useFusionStore(
        (s: GlobalState) => ({
          name: (s.user as {name?: string})?.name ?? '',
          age: (s.user as {age?: number})?.age ?? 0,
        }),
        shallow,
      );
      renderSpy(profile);
      return (
        <div data-testid="profile">
          {profile.name}:{profile.age}
        </div>
      );
    }

    function Mutator() {
      const [, setUser] = useFusionState('user', {name: 'Alice', age: 30});
      const [, setOther] = useFusionState('other', 'x');
      return (
        <>
          <button
            data-testid="touch-other"
            onClick={() => setOther((v: string) => v + '!')}>
            other
          </button>
          <button
            data-testid="touch-user-diff"
            onClick={() => setUser({name: 'Bob', age: 25})}>
            user (different)
          </button>
        </>
      );
    }

    render(
      <FusionStateProvider>
        <ProfileSpy />
        <Mutator />
      </FusionStateProvider>,
    );

    const initialRenders = renderSpy.mock.calls.length;
    expect(screen.getByTestId('profile')).toHaveTextContent('Alice:30');

    // Touching unrelated key → no re-render
    act(() => screen.getByTestId('touch-other').click());
    expect(renderSpy.mock.calls.length).toBe(initialRenders);

    // Different user → ProfileSpy must re-render
    act(() => screen.getByTestId('touch-user-diff').click());
    expect(screen.getByTestId('profile')).toHaveTextContent('Bob:25');
    expect(renderSpy.mock.calls.length).toBe(initialRenders + 1);
  });

  it('throws when used outside of a FusionStateProvider', () => {
    function Outside() {
      useFusionStore((s) => s.anything);
      return null;
    }

    // Suppress the React error boundary log noise
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Outside />)).toThrow();
    errSpy.mockRestore();
  });

  it('returns a stable reference for unchanged primitives', () => {
    const references: number[] = [];

    function Spy() {
      const v = useFusionStore((s) => (s.counter as number) ?? 0);
      references.push(v);
      return <div>{v}</div>;
    }

    function Mutator() {
      const [, setOther] = useFusionState('other', 'x');
      return (
        <button
          data-testid="touch"
          onClick={() => setOther((s: string) => s + '!')}>
          touch
        </button>
      );
    }

    render(
      <FusionStateProvider initialState={{counter: 7}}>
        <Spy />
        <Mutator />
      </FusionStateProvider>,
    );

    const initialCalls = references.length;
    act(() => screen.getByTestId('touch').click());
    act(() => screen.getByTestId('touch').click());
    expect(references.length).toBe(initialCalls);
    expect(references[references.length - 1]).toBe(7);
  });
});
