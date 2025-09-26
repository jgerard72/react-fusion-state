import React from 'react';
import {FusionStateProvider, useFusionState} from '../index';

// Simple Counter
function Counter() {
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Todo List
function TodoList() {
  const [todos, setTodos] = useFusionState('todos', [
    'Learn React',
    'Try React Fusion State',
  ]);
  const [newTodo, setNewTodo] = useFusionState('newTodo', '');

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, newTodo]);
    setNewTodo('');
  };

  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Todo List</h2>
      <input
        value={newTodo}
        onChange={e => setNewTodo(e.target.value)}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Theme Toggle
function ThemeToggle() {
  const [theme, setTheme] = useFusionState('theme', 'light');

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      <p>Current theme: {theme}</p>
    </div>
  );
}

// Header
function Header() {
  const [theme] = useFusionState('theme', 'light');

  return (
    <h1 style={{color: theme === 'dark' ? 'white' : 'black'}}>
      My App ({theme} theme)
    </h1>
  );
}

// Main App
export default function App() {
  return (
    <FusionStateProvider persistence={['todos', 'theme']} debug={true}>
      <Header />
      <Counter />
      <TodoList />
      <ThemeToggle />
    </FusionStateProvider>
  );
}
