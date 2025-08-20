import React from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {FusionStateProvider, useFusionState, useFusionStateLog} from '../index';

// Counter component
function Counter() {
  const [count, setCount] = useFusionState<number>('counter', 0);

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button data-testid="increment" onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button data-testid="decrement" onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}

// User form component
interface User {
  name: string;
  email: string;
}

function UserForm() {
  const [user, setUser] = useFusionState<User>('user', {name: '', email: ''});

  // ✅ Protection against undefined during initialization
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <input
        data-testid="name-input"
        value={user.name}
        onChange={e => setUser({...user, name: e.target.value})}
      />
      <input
        data-testid="email-input"
        value={user.email}
        onChange={e => setUser({...user, email: e.target.value})}
      />
    </div>
  );
}

// State logger component
function StateLogger() {
  const state = useFusionStateLog(['counter', 'user'], {
    trackChanges: true,
  });

  return <div data-testid="logger">{JSON.stringify(state)}</div>;
}

// Main test app
function TestApp() {
  return (
    <FusionStateProvider initialState={{theme: 'light'}}>
      <Counter />
      <UserForm />
      <StateLogger />
    </FusionStateProvider>
  );
}

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('all components work together correctly', () => {
    render(<TestApp />);

    // Test counter functionality
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('increment'));
    });

    expect(screen.getByText('Counter: 1')).toBeInTheDocument();

    // Test form functionality
    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');

    act(() => {
      fireEvent.change(nameInput, {target: {value: 'John Doe'}});
    });

    act(() => {
      fireEvent.change(emailInput, {target: {value: 'john@example.com'}});
    });

    // Test logger
    const loggerText = screen.getByTestId('logger').textContent;
    const loggedState = JSON.parse(loggerText || '{}');

    expect(loggedState).toHaveProperty('counter', 1);
    expect(loggedState).toHaveProperty('user.name', 'John Doe');
    expect(loggedState).toHaveProperty('user.email', 'john@example.com');
  });

  test('initialState is respected', () => {
    render(
      <FusionStateProvider
        initialState={{
          presetValue: 'preset',
          counter: 100,
        }}>
        <div data-testid="counter">
          <Counter />
        </div>
        <StateLogger />
      </FusionStateProvider>,
    );

    // Counter should use the preset value
    expect(screen.getByText('Counter: 100')).toBeInTheDocument();

    // Logger should show preset values
    const loggerText = screen.getByTestId('logger').textContent;
    const loggedState = JSON.parse(loggerText || '{}');

    expect(loggedState).toHaveProperty('counter', 100);
  });
});
