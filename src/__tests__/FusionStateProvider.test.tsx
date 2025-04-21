import React from 'react';
import {render, screen, act, renderHook} from '@testing-library/react';
import {
  FusionStateProvider,
  useFusionState,
  useGlobalState,
  FusionStateErrorMessages,
} from '../index';

describe('FusionStateProvider', () => {
  test('provides global state to children', () => {
    const TestComponent = () => {
      const {state} = useGlobalState();
      return <div data-testid="state">{JSON.stringify(state)}</div>;
    };

    render(
      <FusionStateProvider initialState={{test: 'value'}}>
        <TestComponent />
      </FusionStateProvider>,
    );

    expect(screen.getByTestId('state').textContent).toBe(
      JSON.stringify({test: 'value'}),
    );
  });

  test('throws error when useGlobalState is used outside provider', () => {
    const TestComponent = () => {
      const {state} = useGlobalState();
      return <div>{JSON.stringify(state)}</div>;
    };

    // Suppress expected error console output in test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow(FusionStateErrorMessages.PROVIDER_MISSING);
  });

  test('provides debug logging when debug option is true', () => {
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    const TestComponent = () => {
      const [value, setValue] = useFusionState('test', 'initial');
      return (
        <button data-testid="update-button" onClick={() => setValue('updated')}>
          Update
        </button>
      );
    };

    render(
      <FusionStateProvider debug={true}>
        <TestComponent />
      </FusionStateProvider>,
    );

    act(() => {
      screen.getByTestId('update-button').click();
    });

    // Debug mode should log state changes
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls[0][0]).toBe('[FusionState] State updated:');
    expect(consoleLogSpy.mock.calls[0][1]).toHaveProperty('previous');
    expect(consoleLogSpy.mock.calls[0][1]).toHaveProperty('next');
    expect(consoleLogSpy.mock.calls[0][1]).toHaveProperty('diff');
  });

  test('does not log when debug option is false', () => {
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    const TestComponent = () => {
      const [value, setValue] = useFusionState('test', 'initial');
      return (
        <button data-testid="update-button" onClick={() => setValue('updated')}>
          Update
        </button>
      );
    };

    render(
      <FusionStateProvider debug={false}>
        <TestComponent />
      </FusionStateProvider>,
    );

    act(() => {
      screen.getByTestId('update-button').click();
    });

    // Should not log when debug is false
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('initialState prop sets initial values', () => {
    const TestComponent = () => {
      const [value] = useFusionState<string>('preInitialized');
      return <div data-testid="value">{String(value)}</div>;
    };

    render(
      <FusionStateProvider initialState={{preInitialized: 'ready'}}>
        <TestComponent />
      </FusionStateProvider>,
    );

    expect(screen.getByTestId('value').textContent).toBe('ready');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
