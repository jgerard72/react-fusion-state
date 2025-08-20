import React from 'react';
import {FusionStateProvider, useFusionState, useFusionStateLog} from '../index';

// Type for todo items
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Counter Component using Fusion State
function Counter() {
  // Simple state with initial value
  const [count, setCount] = useFusionState<number>('counter', 0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Todo Component using Fusion State
function TodoList() {
  // Complex state with persistence - todos will survive page refreshes
  const [todos, setTodos] = useFusionState<Todo[]>(
    'todos',
    [
      {id: 1, text: 'Learn React', completed: true},
      {id: 2, text: 'Try React Fusion State', completed: false},
    ],
    { persist: true } // ✅ Todos will be saved to localStorage
  );

  // Form state
  const [newTodo, setNewTodo] = useFusionState<string>('newTodoText', '');

  // Add new todo
  const addTodo = () => {
    if (!newTodo.trim()) return;

    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodo,
        completed: false,
      },
    ]);
    setNewTodo('');
  };

  // Toggle todo completion
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo: Todo) =>
        todo.id === id ? {...todo, completed: !todo.completed} : todo,
      ),
    );
  };

  return (
    <div className="todo-list">
      <h2>Todo List</h2>

      <div className="add-todo">
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul>
        {todos.map((todo: Todo) => (
          <li
            key={todo.id}
            style={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              opacity: todo.completed ? 0.6 : 1,
            }}
            onClick={() => toggleTodo(todo.id)}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// StateDebugger using useFusionStateLog
function StateDebugger() {
  // Watch all state or specific keys
  const state = useFusionStateLog(['counter', 'todos'], {
    trackChanges: true,
    consoleLog: true,
    changeDetection: 'deep',
  });

  return (
    <div className="state-debugger">
      <h3>Current State</h3>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

// Main App using FusionStateProvider
export default function App() {
  return (
    <FusionStateProvider initialState={{theme: 'light'}} debug={true}>
      <div className="app">
        <h1>React Fusion State Example</h1>

        <Counter />
        <TodoList />
        <StateDebugger />

        <ThemeToggle />
      </div>
    </FusionStateProvider>
  );
}

// Theme toggler component
function ThemeToggle() {
  // Theme preference with persistence - user's choice will be remembered
  const [theme, setTheme] = useFusionState<string>(
    'theme',
    'light',
    { 
      persist: true,
      debug: true // ✅ Log theme changes to console
    }
  );

  return (
    <div className="theme-toggle">
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      <p>Current theme: {theme}</p>
      <p><small>💡 Theme preference is automatically saved!</small></p>
    </div>
  );
}
