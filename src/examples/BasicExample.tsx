import React from 'react';
import {FusionStateProvider, useFusionState, useFusionStateLog} from '../index';

/**
 * Type definition for todo items
 */
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * Counter component demonstrating basic useFusionState usage
 */
function Counter() {
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

/**
 * TodoList component demonstrating complex state management with persistence
 */
function TodoList() {
  const [todos, setTodos] = useFusionState<Todo[]>('todos', [
    {id: 1, text: 'Learn React', completed: true},
    {id: 2, text: 'Try React Fusion State', completed: false},
  ]);

  const [newTodo, setNewTodo] = useFusionState<string>('newTodoText', '');

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

/**
 * StateDebugger component demonstrating useFusionStateLog for debugging
 */
function StateDebugger() {
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

/**
 * Main App component demonstrating FusionStateProvider setup with granular persistence
 */
export default function App() {
  return (
    <FusionStateProvider
      persistence={['todos', 'theme']}
      initialState={{theme: 'light'}}
      debug={true}>
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

/**
 * ThemeToggle component demonstrating persistent user preferences
 */
function ThemeToggle() {
  const [theme, setTheme] = useFusionState<string>('theme', 'light');

  return (
    <div className="theme-toggle">
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      <p>Current theme: {theme}</p>
      <p>
        <small>💡 Theme preference is automatically saved!</small>
      </p>
    </div>
  );
}
