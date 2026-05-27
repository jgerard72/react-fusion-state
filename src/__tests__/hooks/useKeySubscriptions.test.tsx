import React from 'react';
import {render, act} from '@testing-library/react';
import {useKeySubscriptions} from '../../hooks/useKeySubscriptions';
import {GlobalState} from '../../types';

/**
 * Tiny test harness — renders a child that captures the hook's return value
 * via a ref, so tests can assert against it without needing a full Provider.
 */
function Harness({
  state,
  initialState,
  onMount,
}: {
  state: GlobalState;
  initialState: GlobalState;
  onMount: (api: ReturnType<typeof useKeySubscriptions>) => void;
}) {
  const api = useKeySubscriptions(state, initialState);
  React.useEffect(() => {
    onMount(api);
  }, [api, onMount]);
  return null;
}

describe('useKeySubscriptions', () => {
  it('returns stable references for subscribeKey, notifyKey, getKeySnapshot, getServerSnapshot', () => {
    let snapshot1: ReturnType<typeof useKeySubscriptions> | null = null;
    let snapshot2: ReturnType<typeof useKeySubscriptions> | null = null;

    const onMount = jest.fn((api) => {
      if (!snapshot1) snapshot1 = api;
      else snapshot2 = api;
    });

    const {rerender} = render(
      <Harness state={{a: 1}} initialState={{a: 0}} onMount={onMount} />,
    );
    rerender(
      <Harness state={{a: 2}} initialState={{a: 0}} onMount={onMount} />,
    );

    expect(snapshot1).not.toBeNull();
    expect(snapshot2).not.toBeNull();
    expect(snapshot1!.subscribeKey).toBe(snapshot2!.subscribeKey);
    expect(snapshot1!.notifyKey).toBe(snapshot2!.notifyKey);
    expect(snapshot1!.getKeySnapshot).toBe(snapshot2!.getKeySnapshot);
    expect(snapshot1!.getServerSnapshot).toBe(snapshot2!.getServerSnapshot);
  });

  it('subscribeKey returns an unsubscribe function that removes the listener', () => {
    let captured: ReturnType<typeof useKeySubscriptions> | null = null;
    render(
      <Harness
        state={{}}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );

    const listener = jest.fn();
    const unsubscribe = captured!.subscribeKey('foo', listener);

    act(() => captured!.notifyKey('foo'));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    act(() => captured!.notifyKey('foo'));
    expect(listener).toHaveBeenCalledTimes(1); // unchanged
  });

  it('notifies only listeners of the changed key (no cross-key leakage)', () => {
    let captured: ReturnType<typeof useKeySubscriptions> | null = null;
    render(
      <Harness
        state={{}}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );

    const aListener = jest.fn();
    const bListener = jest.fn();
    captured!.subscribeKey('a', aListener);
    captured!.subscribeKey('b', bListener);

    act(() => captured!.notifyKey('a'));

    expect(aListener).toHaveBeenCalledTimes(1);
    expect(bListener).not.toHaveBeenCalled();
  });

  it('supports multiple listeners on the same key', () => {
    let captured: ReturnType<typeof useKeySubscriptions> | null = null;
    render(
      <Harness
        state={{}}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );

    const l1 = jest.fn();
    const l2 = jest.fn();
    const l3 = jest.fn();
    captured!.subscribeKey('shared', l1);
    captured!.subscribeKey('shared', l2);
    captured!.subscribeKey('shared', l3);

    act(() => captured!.notifyKey('shared'));

    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
    expect(l3).toHaveBeenCalledTimes(1);
  });

  it('notifyKey on an unknown key is a no-op (no throw)', () => {
    let captured: ReturnType<typeof useKeySubscriptions> | null = null;
    render(
      <Harness
        state={{}}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );

    expect(() => captured!.notifyKey('does-not-exist')).not.toThrow();
  });

  it('getKeySnapshot returns the current value, getServerSnapshot returns the initial value', () => {
    let captured: ReturnType<typeof useKeySubscriptions> | null = null;
    const {rerender} = render(
      <Harness
        state={{count: 5}}
        initialState={{count: 0}}
        onMount={(api) => (captured = api)}
      />,
    );

    expect(captured!.getKeySnapshot('count')).toBe(5);
    expect(captured!.getServerSnapshot('count')).toBe(0);

    rerender(
      <Harness
        state={{count: 10}}
        initialState={{count: 0}}
        onMount={(api) => (captured = api)}
      />,
    );

    // Live ref — snapshot reflects the updated state.
    expect(captured!.getKeySnapshot('count')).toBe(10);
    expect(captured!.getServerSnapshot('count')).toBe(0);
  });

  it('getKeySnapshot returns undefined for unknown keys', () => {
    let captured: ReturnType<typeof useKeySubscriptions> | null = null;
    render(
      <Harness
        state={{a: 1}}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );

    expect(captured!.getKeySnapshot('missing')).toBeUndefined();
    expect(captured!.getServerSnapshot('missing')).toBeUndefined();
  });
});
