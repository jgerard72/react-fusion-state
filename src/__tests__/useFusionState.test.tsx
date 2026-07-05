import React from 'react';
import {render, screen, act, renderHook} from '@testing-library/react';
import {
  FusionStateProvider,
  useFusionState,
  FusionStateErrorMessages,
} from '../index';

// Helper to format error messages for testing
function formatErrorMessage(message: string, ...values: string[]): string {
  return values.reduce((msg, value, index) => {
    return msg.replace(`{${index}}`, value);
  }, message);
}

// Test component to use in our tests
function TestComponent({
  stateKey,
  initialValue,
}: {
  stateKey: string;
  initialValue: any;
}) {
  const [value, setValue] = useFusionState(stateKey, initialValue);

  return (
    <div>
      <div data-testid="value">{JSON.stringify(value)}</div>
      <button
        data-testid="increment"
        onClick={() => setValue((prev: number) => prev + 1)}>
        Increment
      </button>
      <button data-testid="set-value" onClick={() => setValue(100)}>
        Set to 100
      </button>
    </div>
  );
}

// Wrapper for renderHook tests
const wrapper = ({children}: {children: React.ReactNode}) => (
  <FusionStateProvider>{children}</FusionStateProvider>
);

describe('useFusionState', () => {
  // Reset console.error mock after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes with the provided initial value', () => {
    render(
      <FusionStateProvider>
        <TestComponent stateKey="counter" initialValue={0} />
      </FusionStateProvider>,
    );

    expect(screen.getByTestId('value').textContent).toBe('0');
  });

  test('updates value correctly with setValue', () => {
    render(
      <FusionStateProvider>
        <TestComponent stateKey="counter" initialValue={0} />
      </FusionStateProvider>,
    );

    act(() => {
      screen.getByTestId('increment').click();
    });

    expect(screen.getByTestId('value').textContent).toBe('1');

    act(() => {
      screen.getByTestId('set-value').click();
    });

    expect(screen.getByTestId('value').textContent).toBe('100');
  });

  test('shares state between components using the same key', () => {
    render(
      <FusionStateProvider>
        <TestComponent stateKey="sharedCounter" initialValue={0} />
        <TestComponent stateKey="sharedCounter" initialValue={0} />
      </FusionStateProvider>,
    );

    const incrementButtons = screen.getAllByTestId('increment');
    const valueElements = screen.getAllByTestId('value');

    // Initial values
    expect(valueElements[0].textContent).toBe('0');
    expect(valueElements[1].textContent).toBe('0');

    // Increment from first component
    act(() => {
      incrementButtons[0].click();
    });

    // Both should update
    expect(valueElements[0].textContent).toBe('1');
    expect(valueElements[1].textContent).toBe('1');
  });

  test('throws error when accessing non-existent key without initial value', () => {
    // Suppress expected error console output in test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const errorMessage = formatErrorMessage(
      FusionStateErrorMessages.KEY_MISSING_NO_INITIAL,
      'nonExistentKey',
    );

    expect(() => {
      render(
        <FusionStateProvider>
          <TestComponent stateKey="nonExistentKey" initialValue={undefined} />
        </FusionStateProvider>,
      );
    }).toThrow(errorMessage);
  });

  test('skipLocalState option provides performance optimization', () => {
    const {result} = renderHook(
      () => useFusionState('optimizedKey', 10, {skipLocalState: true}),
      {wrapper},
    );

    expect(result.current[0]).toBe(10);

    act(() => {
      result.current[1](20);
    });

    expect(result.current[0]).toBe(20);
  });
});
