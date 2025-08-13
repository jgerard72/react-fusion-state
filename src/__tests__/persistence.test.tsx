import React from 'react';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import {
  FusionStateProvider,
  useFusionState,
  createLocalStorageAdapter,
} from '../index';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Test component
function TestCounter() {
  const [count, setCount] = useFusionState('counter', 0);
  const [name, setName] = useFusionState('name', '');

  return (
    <div>
      <div data-testid="count">{count}</div>
      <div data-testid="name">{name}</div>
      <button data-testid="increment" onClick={() => setCount(count + 1)}>
        +
      </button>
      <button data-testid="set-name" onClick={() => setName('John')}>
        Set Name
      </button>
    </div>
  );
}

describe('Persistence Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('should save state to localStorage', async () => {
    const storageAdapter = createLocalStorageAdapter();

    render(
      <FusionStateProvider
        debug={true}
        persistence={{
          adapter: storageAdapter,
          keyPrefix: 'test',
          persistKeys: ['counter', 'name'],
          debounceTime: 0, // No debounce for testing
        }}>
        <TestCounter />
      </FusionStateProvider>,
    );

    // Initial state
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('name')).toHaveTextContent('');

    // Update counter
    act(() => {
      fireEvent.click(screen.getByTestId('increment'));
    });

    // Update name
    act(() => {
      fireEvent.click(screen.getByTestId('set-name'));
    });

    // Wait for state to be saved
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Check if data was saved
    const savedData = localStorageMock.getItem('test_all');
    expect(savedData).toBeTruthy();

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      expect(parsedData).toEqual({
        counter: 1,
        name: 'John',
      });
    }
  });

  test('should load state from localStorage on initialization', async () => {
    // Pre-populate localStorage
    const initialData = {
      counter: 42,
      name: 'Jane',
    };
    localStorageMock.setItem('test_all', JSON.stringify(initialData));

    const storageAdapter = createLocalStorageAdapter();

    render(
      <FusionStateProvider
        debug={true}
        persistence={{
          adapter: storageAdapter,
          keyPrefix: 'test',
          persistKeys: ['counter', 'name'],
        }}>
        <TestCounter />
      </FusionStateProvider>,
    );

    // Should load data from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('42');
      expect(screen.getByTestId('name')).toHaveTextContent('Jane');
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('test_all');
  });

  test('should merge with initialState correctly', async () => {
    // Pre-populate localStorage with partial data
    const storedData = {
      counter: 100,
    };
    localStorageMock.setItem('test_all', JSON.stringify(storedData));

    const storageAdapter = createLocalStorageAdapter();

    render(
      <FusionStateProvider
        initialState={{
          counter: 0,
          name: 'Default Name',
          otherValue: 'should remain',
        }}
        debug={true}
        persistence={{
          adapter: storageAdapter,
          keyPrefix: 'test',
          persistKeys: ['counter', 'name'],
        }}>
        <TestCounter />
      </FusionStateProvider>,
    );

    // Should load counter from localStorage, keep name from initialState (since it wasn't stored)
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('100');
      expect(screen.getByTestId('name')).toHaveTextContent('Default Name');
    });
  });

  test('should handle localStorage errors gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    // Create a custom adapter that throws errors
    const errorAdapter = {
      async getItem(key: string): Promise<string | null> {
        throw new Error('Storage not available');
      },
      getItemSync(key: string): string | null {
        throw new Error('Storage not available');
      },
      async setItem(key: string, value: string): Promise<void> {
        throw new Error('Storage not available');
      },
      async removeItem(key: string): Promise<void> {
        throw new Error('Storage not available');
      },
    };

    const onLoadError = jest.fn();

    render(
      <FusionStateProvider
        debug={true}
        persistence={{
          adapter: errorAdapter,
          keyPrefix: 'test',
          persistKeys: ['counter', 'name'],
          onLoadError,
        }}>
        <TestCounter />
      </FusionStateProvider>,
    );

    // Should handle error and use default values
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0');
      expect(screen.getByTestId('name')).toHaveTextContent('');
    });

    // Error callback should be called
    await waitFor(
      () => {
        expect(onLoadError).toHaveBeenCalled();
      },
      {timeout: 2000},
    );

    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should only persist specified keys', async () => {
    // Reset mocks for this test
    localStorageMock.clear();
    jest.clearAllMocks();

    const storageAdapter = createLocalStorageAdapter();

    function TestComponentWithMultipleStates() {
      const [counter, setCounter] = useFusionState('counter', 0);
      const [name, setName] = useFusionState('name', '');
      const [tempData, setTempData] = useFusionState('tempData', 'temp');

      return (
        <div>
          <div data-testid="counter">{counter}</div>
          <div data-testid="name">{name}</div>
          <div data-testid="temp">{tempData}</div>
          <button onClick={() => setCounter(1)}>Set Counter</button>
          <button onClick={() => setName('John')}>Set Name</button>
          <button onClick={() => setTempData('updated')}>Set Temp</button>
        </div>
      );
    }

    render(
      <FusionStateProvider
        debug={true}
        persistence={{
          adapter: storageAdapter,
          keyPrefix: 'test',
          persistKeys: ['counter', 'name'], // Only persist counter and name
          debounceTime: 0,
        }}>
        <TestComponentWithMultipleStates />
      </FusionStateProvider>,
    );

    // Update all states
    act(() => {
      fireEvent.click(screen.getByText('Set Counter'));
      fireEvent.click(screen.getByText('Set Name'));
      fireEvent.click(screen.getByText('Set Temp'));
    });

    // Wait for persistence
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Check saved data - should only contain counter and name
    const savedData = localStorageMock.getItem('test_all');
    expect(savedData).toBeTruthy();

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      expect(parsedData).toEqual({
        counter: 1,
        name: 'John',
        // tempData should NOT be persisted
      });
      expect(parsedData).not.toHaveProperty('tempData');
    }
  });
});
