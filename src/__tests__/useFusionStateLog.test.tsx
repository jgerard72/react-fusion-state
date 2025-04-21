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
    const {result: stateResult} = renderHook(
      () => useFusionState('testKey', 'testValue'),
      {wrapper},
    );

    const {result: logResult} = renderHook(() => useFusionStateLog(), {
      wrapper,
    });

    expect(logResult.current).toHaveProperty('testKey', 'testValue');
  });

  test('returns only selected keys when provided', () => {
    const {result: counterResult} = renderHook(
      () => useFusionState('counter', 10),
      {wrapper},
    );

    const {result: nameResult} = renderHook(
      () => useFusionState('name', 'John'),
      {wrapper},
    );

    const {result: logResult} = renderHook(
      () => useFusionStateLog(['counter']),
      {wrapper},
    );

    expect(logResult.current).toHaveProperty('counter', 10);
    expect(logResult.current).not.toHaveProperty('name');
  });

  test('tracks changes when trackChanges option is enabled', () => {
    const {result: stateResult} = renderHook(
      () => useFusionState('counter', 0),
      {wrapper},
    );

    // Prepare console.log spy to capture arguments
    const consoleLogSpy = jest.spyOn(console, 'log');

    const {result: logResult, rerender} = renderHook(
      () =>
        useFusionStateLog(['counter'], {
          trackChanges: true,
          consoleLog: true,
        }),
      {wrapper},
    );

    // Update the state
    act(() => {
      stateResult.current[1](1);
    });

    // Force rerender of the log hook
    rerender();

    // Console.log should have been called with state changes
    expect(consoleLogSpy).toHaveBeenCalled();

    // The logged data should contain both the state and changes
    const loggedData = consoleLogSpy.mock.calls[0][1];
    expect(loggedData).toHaveProperty('state');
    expect(loggedData).toHaveProperty('changes');
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
