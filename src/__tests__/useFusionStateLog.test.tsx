import React from 'react';
import {act, renderHook, waitFor} from '@testing-library/react';
import {FusionStateProvider, useFusionState, useFusionStateLog} from '../index';

const wrapper = ({children}: {children: React.ReactNode}) => (
  <FusionStateProvider>{children}</FusionStateProvider>
);

describe('useFusionStateLog', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns the full state when no keys are provided', async () => {
    const {result} = renderHook(
      () => {
        useFusionState('testKey', 'testValue');
        return useFusionStateLog();
      },
      {wrapper},
    );

    await waitFor(() => {
      expect(result.current).toHaveProperty('testKey', 'testValue');
    });
  });

  test('returns only selected keys when provided', async () => {
    const {result} = renderHook(
      () => {
        useFusionState('counter', 10);
        useFusionState('name', 'John');
        return useFusionStateLog(['counter']);
      },
      {wrapper},
    );

    await waitFor(() => {
      expect(result.current).toHaveProperty('counter', 10);
    });
    expect(result.current).not.toHaveProperty('name');
  });

  test('tracks changes when trackChanges option is enabled', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');

    const {result} = renderHook(
      () => {
        const [, setCounter] = useFusionState('counter', 0);
        const log = useFusionStateLog(['counter'], {
          trackChanges: true,
          consoleLog: true,
        });
        return {setCounter, log};
      },
      {wrapper},
    );

    await waitFor(() => {
      expect(result.current.log).toHaveProperty('counter', 0);
    });

    act(() => {
      result.current.setCounter(1);
    });

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    const loggedData = consoleLogSpy.mock.calls.find(
      call => call[0] === '[FusionState Log]',
    )?.[1];
    expect(loggedData).toHaveProperty('state');
    expect(loggedData).toHaveProperty('changes');
  });

  test('uses custom formatter when provided', async () => {
    const formatter = jest.fn().mockImplementation(state => ({
      formattedState: state,
      timestamp: 'test-timestamp',
    }));

    const consoleLogSpy = jest.spyOn(console, 'log');

    const {result} = renderHook(
      () => {
        const [, setCounter] = useFusionState('counter', 0);
        const log = useFusionStateLog(['counter'], {
          consoleLog: true,
          formatter,
        });
        return {setCounter, log};
      },
      {wrapper},
    );

    await waitFor(() => {
      expect(result.current.log).toHaveProperty('counter', 0);
    });

    act(() => {
      result.current.setCounter(1);
    });

    await waitFor(() => {
      expect(formatter).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    const loggedData = consoleLogSpy.mock.calls.find(
      call => call[0] === '[FusionState Log]',
    )?.[1];
    expect(loggedData).toHaveProperty('formattedState');
    expect(loggedData).toHaveProperty('timestamp', 'test-timestamp');
  });
});
