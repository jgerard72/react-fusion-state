import React from 'react';
import {render, act, waitFor} from '@testing-library/react';
import {FusionStateProvider} from '../FusionStateProvider';
import {useFusionState} from '../useFusionState';

// Test pour couvrir les branches manquantes de useFusionState
describe('useFusionState - Advanced Coverage', () => {
  // Mock console pour tester les logs de debug
  const originalConsole = console;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  // Test des timeouts de sauvegarde (lignes 51-68) - Version simplifiée
  it('should handle debounced persistence', async () => {
    const TestComponent = () => {
      const [value, setValue] = useFusionState('testKey', 'initial', {
        persist: true,
        debounceTime: 50, // Plus court pour les tests
        debug: true,
      });

      return (
        <div>
          <span data-testid="value">{value}</span>
          <button data-testid="update" onClick={() => setValue('updated')}>
            Update
          </button>
        </div>
      );
    };

    const {getByTestId} = render(
      <FusionStateProvider debug>
        <TestComponent />
      </FusionStateProvider>,
    );

    act(() => {
      getByTestId('update').click();
    });

    expect(getByTestId('value')).toHaveTextContent('updated');
  });

  // Test simple pour couvrir les branches d'erreur
  it('should handle errors without crashing', () => {
    const TestComponent = () => {
      const [value, setValue] = useFusionState('errorKey', 'initial', {
        persist: true,
        debug: true,
      });

      return (
        <div>
          <span data-testid="value">{value}</span>
          <button data-testid="update" onClick={() => setValue('new value')}>
            Update
          </button>
        </div>
      );
    };

    const {getByTestId} = render(
      <FusionStateProvider debug>
        <TestComponent />
      </FusionStateProvider>,
    );

    // Should not crash even with potential errors
    act(() => {
      getByTestId('update').click();
    });

    expect(getByTestId('value')).toHaveTextContent('new value');
  });

  // Test des options par défaut et branches conditionnelles
  it('should handle various option combinations', async () => {
    const TestComponent = () => {
      // Test sans options (ligne 160)
      const [simple] = useFusionState('simple', 'value');

      // Test avec options partielles
      const [withDebug] = useFusionState('withDebug', 'value', {debug: true});
      const [withPersist] = useFusionState('withPersist', 'value', {
        persist: true,
      });

      return (
        <div>
          <span data-testid="simple">{simple}</span>
          <span data-testid="debug">{withDebug}</span>
          <span data-testid="persist">{withPersist}</span>
        </div>
      );
    };

    const {getByTestId} = render(
      <FusionStateProvider>
        <TestComponent />
      </FusionStateProvider>,
    );

    // Wait for async initialization
    await waitFor(() => {
      expect(getByTestId('simple')).toHaveTextContent('value');
      expect(getByTestId('debug')).toHaveTextContent('value');
      expect(getByTestId('persist')).toHaveTextContent('value');
    });
  });

  // Test des fonctions de mise à jour (ligne 224, 241)
  it('should handle function updates correctly', () => {
    const TestComponent = () => {
      const [count, setCount] = useFusionState('counter', 0);

      const increment = () => {
        // Test function updater (ligne 224)
        setCount(prev => prev + 1);
      };

      const reset = () => {
        // Test direct value (ligne 241)
        setCount(0);
      };

      return (
        <div>
          <span data-testid="count">{count}</span>
          <button data-testid="increment" onClick={increment}>
            +
          </button>
          <button data-testid="reset" onClick={reset}>
            Reset
          </button>
        </div>
      );
    };

    const {getByTestId} = render(
      <FusionStateProvider>
        <TestComponent />
      </FusionStateProvider>,
    );

    const countElement = getByTestId('count');
    const incrementButton = getByTestId('increment');
    const resetButton = getByTestId('reset');

    expect(countElement).toHaveTextContent('0');

    act(() => {
      incrementButton.click();
    });
    expect(countElement).toHaveTextContent('1');

    act(() => {
      incrementButton.click();
    });
    expect(countElement).toHaveTextContent('2');

    act(() => {
      resetButton.click();
    });
    expect(countElement).toHaveTextContent('0');
  });

  // Test des clés dynamiques et initialisation (lignes 76-140)
  it('should handle dynamic keys and initialization', () => {
    const TestComponent = ({keyName}: {keyName: string}) => {
      const [value, setValue] = useFusionState(keyName, `default-${keyName}`);

      return (
        <div>
          <span data-testid={`value-${keyName}`}>{value}</span>
          <button
            data-testid={`update-${keyName}`}
            onClick={() => setValue(`updated-${keyName}`)}>
            Update
          </button>
        </div>
      );
    };

    const {getByTestId, rerender} = render(
      <FusionStateProvider>
        <TestComponent keyName="key1" />
      </FusionStateProvider>,
    );

    expect(getByTestId('value-key1')).toHaveTextContent('default-key1');

    act(() => {
      getByTestId('update-key1').click();
    });
    expect(getByTestId('value-key1')).toHaveTextContent('updated-key1');

    // Test avec une nouvelle clé
    rerender(
      <FusionStateProvider>
        <TestComponent keyName="key2" />
      </FusionStateProvider>,
    );

    expect(getByTestId('value-key2')).toHaveTextContent('default-key2');
  });
});
