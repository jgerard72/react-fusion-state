import React from 'react';
import {render, screen, act, renderHook} from '@testing-library/react';
import {FusionStateProvider, useFusionState, useFusionStateLog} from '../index';

// Wrapper for renderHook tests
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

  test('returns the full state when no keys are provided', () => {
    const TestComponent = () => {
      const [testValue] = useFusionState('testKey', 'testValue');
      const loggedState = useFusionStateLog();
      return {testValue, loggedState};
    };

    const {result} = renderHook(() => TestComponent(), {wrapper});

    expect(result.current.loggedState).toHaveProperty('testKey', 'testValue');
  });

  test('returns only selected keys when provided', () => {
    const TestComponent = () => {
      const [counter] = useFusionState('counter', 10);
      const [name] = useFusionState('name', 'John');
      const loggedState = useFusionStateLog(['counter']);
      return {counter, name, loggedState};
    };

    const {result} = renderHook(() => TestComponent(), {wrapper});

    expect(result.current.loggedState).toHaveProperty('counter', 10);
    expect(result.current.loggedState).not.toHaveProperty('name');
  });

  test('tracks changes when trackChanges option is enabled', () => {
    // Mock console.log to spy on the logging behavior
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    const TestComponent = () => {
      const [counter, setCounter] = useFusionState('counter', 0);
      const loggedState = useFusionStateLog(['counter'], {
        trackChanges: true,
        consoleLog: true,
      });
      return {counter, setCounter, loggedState};
    };

    const {result} = renderHook(() => TestComponent(), {wrapper});

    // Trigger a state change
    act(() => {
      result.current.setCounter(1);
    });

    // Console.log should have been called with state changes
    expect(consoleLogSpy).toHaveBeenCalled();

    // Find the last call that contains our log data (after the state change)
    const fusionStateLogCalls = consoleLogSpy.mock.calls.filter(
      call => call[0] === '[FusionState Log]',
    );

    expect(fusionStateLogCalls.length).toBeGreaterThan(0);

    // Get the last log call (after the state change)
    const lastLogCall = fusionStateLogCalls[fusionStateLogCalls.length - 1];
    const loggedData = lastLogCall[1];

    expect(loggedData).toHaveProperty('state');
    expect(loggedData.state).toHaveProperty('counter', 1);
  });

  test('uses custom formatter when provided', () => {
    const {result: stateResult} = renderHook(
      () => useFusionState('counter', 0),
      {wrapper},
    );

    const formatter = jest.fn().mockImplementation(state => ({
      formattedState: state,
      timestamp: 'test-timestamp',
    }));

    const consoleLogSpy = jest.spyOn(console, 'log');

    const {result: logResult, rerender} = renderHook(
      () =>
        useFusionStateLog(['counter'], {
          consoleLog: true,
          formatter,
        }),
      {wrapper},
    );

    // Update the state
    act(() => {
      stateResult.current[1](1);
    });

    // Force rerender of the log hook
    rerender();

    // Formatter should have been called
    expect(formatter).toHaveBeenCalled();

    // Console.log should have been called with formatted data
    expect(consoleLogSpy).toHaveBeenCalled();
    const loggedData = consoleLogSpy.mock.calls[0][1];
    expect(loggedData).toHaveProperty('formattedState');
    expect(loggedData).toHaveProperty('timestamp', 'test-timestamp');
  });
});
