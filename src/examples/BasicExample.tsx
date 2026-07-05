import React from 'react';
import {
  FusionStateProvider,
  useFusionState,
  useFusionStateLog,
} from 'react-fusion-state';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function Counter() {
  const [count, setCount] = useFusionState<number>('counter', 0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function TodoList() {
  const [todos, setTodos] = useFusionState<Todo[]>('todos', [
    {id: 1, text: 'Learn React', completed: true},
    {id: 2, text: 'Try React Fusion State', completed: false},
  ]);
  const [newTodo, setNewTodo] = useFusionState<string>('newTodoText', '');

  const addTodo = () => {
    if (!newTodo.trim()) return;

    setTodos(prev => [
      ...prev,
      {id: Date.now(), text: newTodo, completed: false},
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
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
        {todos.map(todo => (
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

function ThemeToggle() {
  // `theme` is seeded by FusionStateProvider initialState below
  const [theme, setTheme] = useFusionState<string>('theme');

  return (
    <div className="theme-toggle">
      <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      <p>Current theme: {theme}</p>
    </div>
  );
}

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
