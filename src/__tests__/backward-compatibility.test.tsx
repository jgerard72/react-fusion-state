/**
 * Test de rétrocompatibilité complète pour React Fusion State v0.4.0
 * Vérifie que tout le code v0.3.x fonctionne exactement pareil
 */

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  FusionStateProvider,
  useFusionState,
  // Nouvelles fonctionnalités (ne doivent pas casser l'ancien code)
  createKey,
  useDevTools,
} from '../index';

// 🎯 TEST 1: Code v0.3.x exact - doit fonctionner identiquement
function LegacyCounterComponent() {
  const [count, setCount] = useFusionState('counter', 0);
  const [user, setUser] = useFusionState('user', null as any);

  return (
    <div>
      <div data-testid="count">Count: {count}</div>
      <div data-testid="user">User: {user ? user.name : 'None'}</div>
      <button data-testid="increment" onClick={() => setCount(count + 1)}>
        +
      </button>
      <button
        data-testid="set-user"
        onClick={() => setUser({name: 'John', id: 1})}>
        Set User
      </button>
    </div>
  );
}

// 🎯 TEST 2: Ancien Provider sans nouvelles props
function LegacyApp() {
  return (
    <FusionStateProvider initialState={{counter: 5}} debug={false}>
      <LegacyCounterComponent />
    </FusionStateProvider>
  );
}

// 🎯 TEST 3: Ancien Provider avec persistence (v0.3.x style)
function LegacyAppWithPersistence() {
  return (
    <FusionStateProvider persistence={true} initialState={{counter: 10}}>
      <LegacyCounterComponent />
    </FusionStateProvider>
  );
}

// 🎯 TEST 4: Mélange ancien/nouveau code (doit coexister)
const newUserKey = createKey<{name: string; id: number} | null>('newUser');

function MixedComponent() {
  // Ancien style
  const [oldCounter, setOldCounter] = useFusionState('oldCounter', 0);
  // Nouveau style
  const [newUser, setNewUser] = useFusionState(newUserKey, null);

  return (
    <div>
      <div data-testid="old-counter">Old: {oldCounter}</div>
      <div data-testid="new-user">New: {newUser?.name || 'None'}</div>
      <button
        data-testid="old-increment"
        onClick={() => setOldCounter(oldCounter + 1)}>
        Old +
      </button>
      <button
        data-testid="new-set-user"
        onClick={() => setNewUser({name: 'Jane', id: 2})}>
        New Set User
      </button>
    </div>
  );
}

describe('🔄 Backward Compatibility Tests v0.4.0', () => {
  test('✅ Legacy code v0.3.x works exactly the same', async () => {
    render(<LegacyApp />);

    // État initial doit être préservé
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 5');
    expect(screen.getByTestId('user')).toHaveTextContent('User: None');

    // Fonctionnalité increment doit marcher pareil
    fireEvent.click(screen.getByTestId('increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 6');

    // Fonctionnalité setUser doit marcher pareil
    fireEvent.click(screen.getByTestId('set-user'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: John');
    });
  });

  test('✅ Legacy persistence API works identically', () => {
    // Test que l'ancien Provider avec persistence fonctionne
    expect(() => {
      render(<LegacyAppWithPersistence />);
    }).not.toThrow();

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 10');
  });

  test('✅ Old and new APIs can coexist without conflicts', async () => {
    render(
      <FusionStateProvider>
        <MixedComponent />
      </FusionStateProvider>,
    );

    // État initial
    expect(screen.getByTestId('old-counter')).toHaveTextContent('Old: 0');
    expect(screen.getByTestId('new-user')).toHaveTextContent('New: None');

    // Test ancien style
    fireEvent.click(screen.getByTestId('old-increment'));
    expect(screen.getByTestId('old-counter')).toHaveTextContent('Old: 1');

    // Test nouveau style
    fireEvent.click(screen.getByTestId('new-set-user'));
    await waitFor(() => {
      expect(screen.getByTestId('new-user')).toHaveTextContent('New: Jane');
    });
  });

  test('✅ All legacy useFusionState signatures work', () => {
    function TestComponent() {
      // Toutes les signatures v0.3.x doivent compiler et fonctionner
      const [str] = useFusionState('test-string', 'hello');
      const [num] = useFusionState('test-number', 42);
      const [bool] = useFusionState('test-bool', true);
      const [obj] = useFusionState('test-obj', {x: 1});
      const [arr] = useFusionState('test-arr', [1, 2, 3]);
      const [nul] = useFusionState('test-null', null);
      const [undef] = useFusionState('test-undefined', 'default-undefined');

      return (
        <div>
          <div data-testid="str">{str}</div>
          <div data-testid="num">{num}</div>
          <div data-testid="bool">{bool?.toString() || 'undefined'}</div>
          <div data-testid="obj">{JSON.stringify(obj)}</div>
          <div data-testid="arr">{JSON.stringify(arr)}</div>
          <div data-testid="nul">{String(nul)}</div>
          <div data-testid="undef">{String(undef)}</div>
        </div>
      );
    }

    render(
      <FusionStateProvider>
        <TestComponent />
      </FusionStateProvider>,
    );

    expect(screen.getByTestId('str')).toHaveTextContent('hello');
    expect(screen.getByTestId('num')).toHaveTextContent('42');
    expect(screen.getByTestId('bool')).toHaveTextContent('true');
    expect(screen.getByTestId('obj')).toHaveTextContent('{"x":1}');
    expect(screen.getByTestId('arr')).toHaveTextContent('[1,2,3]');
    expect(screen.getByTestId('nul')).toHaveTextContent('null');
    expect(screen.getByTestId('undef')).toHaveTextContent('default-undefined');
  });

  test('✅ Legacy Provider props work exactly the same', () => {
    // Test toutes les anciennes props du Provider
    const TestProvider = ({children}: {children: React.ReactNode}) => (
      <FusionStateProvider
        initialState={{legacy: 'test'}}
        debug={true}
        persistence={['legacy']}>
        {children}
      </FusionStateProvider>
    );

    expect(() => {
      render(
        <TestProvider>
          <div>Legacy test</div>
        </TestProvider>,
      );
    }).not.toThrow();
  });

  test('✅ DevTools prop is optional and doesnt break legacy code', () => {
    function LegacyWithoutDevTools() {
      return (
        <FusionStateProvider>
          <div>No DevTools</div>
        </FusionStateProvider>
      );
    }

    // Ne doit pas planter sans devTools prop
    expect(() => {
      render(<LegacyWithoutDevTools />);
    }).not.toThrow();
  });

  test('✅ New exports dont break existing imports', () => {
    // Test que les nouveaux exports n'interfèrent pas
    expect(typeof createKey).toBe('function');
    expect(typeof useDevTools).toBe('function');

    // Et que les anciens marchent toujours
    expect(typeof useFusionState).toBe('function');
    expect(typeof FusionStateProvider).toBe('object'); // memo() returns object
  });
});

describe('🆕 New Features v0.4.0 (should work alongside legacy)', () => {
  test('✅ Typed keys provide better DX without breaking old code', async () => {
    const userKey = createKey<{name: string; age: number} | null>('typed-user');

    function NewTypedComponent() {
      const [user, setUser] = useFusionState(userKey, null);
      // TypeScript devrait inférer le type automatiquement

      return (
        <div>
          <div data-testid="typed-user">
            {user ? `${user.name} (${user.age})` : 'None'}
          </div>
          <button
            data-testid="set-typed-user"
            onClick={() => setUser({name: 'Alice', age: 30})}>
            Set Typed User
          </button>
        </div>
      );
    }

    render(
      <FusionStateProvider>
        <NewTypedComponent />
      </FusionStateProvider>,
    );

    expect(screen.getByTestId('typed-user')).toHaveTextContent('None');

    fireEvent.click(screen.getByTestId('set-typed-user'));
    await waitFor(() => {
      expect(screen.getByTestId('typed-user')).toHaveTextContent('Alice (30)');
    });
  });

  test('✅ DevTools can be enabled without breaking anything', () => {
    function AppWithDevTools() {
      return (
        <FusionStateProvider devTools={{name: 'Test App'}}>
          <LegacyCounterComponent />
        </FusionStateProvider>
      );
    }

    expect(() => {
      render(<AppWithDevTools />);
    }).not.toThrow();

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
  });
});
