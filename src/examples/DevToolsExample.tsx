import React, {useState} from 'react';
import {FusionStateProvider} from '../FusionStateProvider';
import {useFusionState} from '../useFusionState';
import {FusionDebugPanel} from '../devtools';

/**
 * Example demonstrating the FusionDebugPanel integration
 *
 * This example shows how to integrate the debug panel into your app.
 * Toggle the panel with Ctrl+` (or Cmd+` on macOS).
 */

const Counter: React.FC = () => {
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        margin: '10px',
        borderRadius: '8px',
      }}>
      <h3>Counter Component</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)} style={{marginRight: '10px'}}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)} style={{marginRight: '10px'}}>
        Decrement
      </button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

const UserProfile: React.FC = () => {
  const [user, setUser] = useFusionState('user', {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    preferences: {
      theme: 'light',
      notifications: true,
    },
  });

  const updateName = () => {
    setUser(prev => ({
      ...prev,
      name: prev.name === 'John Doe' ? 'Jane Smith' : 'John Doe',
    }));
  };

  const toggleTheme = () => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: prev.preferences.theme === 'light' ? 'dark' : 'light',
      },
    }));
  };

  const incrementAge = () => {
    setUser(prev => ({...prev, age: prev.age + 1}));
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        margin: '10px',
        borderRadius: '8px',
      }}>
      <h3>User Profile Component</h3>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Age:</strong> {user.age}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Theme:</strong> {user.preferences.theme}
      </p>
      <p>
        <strong>Notifications:</strong>{' '}
        {user.preferences.notifications ? 'On' : 'Off'}
      </p>

      <div style={{marginTop: '10px'}}>
        <button onClick={updateName} style={{marginRight: '10px'}}>
          Toggle Name
        </button>
        <button onClick={incrementAge} style={{marginRight: '10px'}}>
          Age Up
        </button>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>
    </div>
  );
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useFusionState('todos', [
    {id: 1, text: 'Learn React Fusion State', completed: false},
    {id: 2, text: 'Try the debug panel', completed: false},
  ]);

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? {...todo, completed: !todo.completed} : todo,
      ),
    );
  };

  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: `New todo ${Date.now()}`,
      completed: false,
    };
    setTodos(prev => [...prev, newTodo]);
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        margin: '10px',
        borderRadius: '8px',
      }}>
      <h3>Todo List Component</h3>
      {todos.map(todo => (
        <div key={todo.id} style={{margin: '5px 0'}}>
          <label>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{marginRight: '10px'}}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}>
              {todo.text}
            </span>
          </label>
        </div>
      ))}
      <button onClick={addTodo} style={{marginTop: '10px'}}>
        Add Todo
      </button>
    </div>
  );
};

const DevToolsExample: React.FC = () => {
  const [debugVisible, setDebugVisible] = useState(false);

  return (
    <FusionStateProvider debug={true}>
      <div style={{fontFamily: 'Arial, sans-serif', padding: '20px'}}>
        <h1>React Fusion State - DevTools Example</h1>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f0f8ff',
            border: '1px solid #4682b4',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
          <h4 style={{margin: '0 0 10px 0', color: '#4682b4'}}>
            Debug Panel Controls
          </h4>
          <p style={{margin: '5px 0'}}>
            • Press{' '}
            <kbd
              style={{
                padding: '2px 6px',
                backgroundColor: '#e0e0e0',
                borderRadius: '3px',
                fontFamily: 'monospace',
              }}>
              Ctrl+`
            </kbd>{' '}
            (or{' '}
            <kbd
              style={{
                padding: '2px 6px',
                backgroundColor: '#e0e0e0',
                borderRadius: '3px',
                fontFamily: 'monospace',
              }}>
              Cmd+`
            </kbd>{' '}
            on macOS) to toggle the debug panel
          </p>
          <p style={{margin: '5px 0'}}>
            • Or use this button:
            <button
              onClick={() => setDebugVisible(!debugVisible)}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: debugVisible ? '#ff6b6b' : '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}>
              {debugVisible ? 'Hide' : 'Show'} Debug Panel
            </button>
          </p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#666'}}>
            The debug panel will appear in the bottom-right corner when visible.
          </p>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <Counter />
          <UserProfile />
          <TodoList />
        </div>

        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}>
          <h4>Debug Panel Features:</h4>
          <ul style={{marginBottom: '0'}}>
            <li>View all state keys and their current values</li>
            <li>Expand/collapse individual state editors</li>
            <li>Edit state values using JSON format</li>
            <li>Apply changes with the "Set" button</li>
            <li>Reset individual state keys to null</li>
            <li>Export entire state snapshot as JSON file</li>
            <li>Import state snapshot from JSON file</li>
          </ul>
        </div>
      </div>

      <FusionDebugPanel
        visible={debugVisible}
        onVisibilityChange={setDebugVisible}
      />
    </FusionStateProvider>
  );
};

export default DevToolsExample;
