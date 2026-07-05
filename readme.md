# react-fusion-state

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg)](https://www.npmjs.com/package/react-fusion-state)
[![license: MIT](https://img.shields.io/npm/l/react-fusion-state.svg)](https://github.com/jgerard72/react-fusion-state)

> A lightweight library for global state in React and React Native, with an API that mirrors `useState`.

[Français](./README.fr.md)

## Why react-fusion-state?

- **Familiar `useState` API** — `[value, setValue]` tuples and functional updaters
- **Global state** — share values across components with string keys
- **Built-in persistence** — optional storage for Web and React Native
- **React + React Native** — same hooks on both platforms
- **Zero runtime dependencies** — no middleware or extra packages required
- **TypeScript-first** — types ship with the package

## Installation

```bash
npm install react-fusion-state
```

Requires `react` >= 18. `react-dom` is optional (Web only).

```bash
yarn add react-fusion-state
```

## Quick Start

```tsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function Counter() {
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <button onClick={() => setCount(c => c + 1)}>{count}</button>
  );
}

function App() {
  return (
    <FusionStateProvider>
      <Counter />
    </FusionStateProvider>
  );
}
```

Any component under the same provider can read or update `'counter'` with `useFusionState('counter', …)`.

## Core Concepts

### Global keys

State is stored under unique string keys (for example `'counter'`, `'user.settings'`). Components that use the same key share one value.

### Initial value semantics

The second argument to `useFusionState` seeds the key **only when it is not already in global state**. If another component initialized the key first, later callers receive the existing value. The initial argument is not re-applied on re-render.

### Provider scope

`<FusionStateProvider>` owns one global state tree. Wrap your app (or a subtree) once. Hooks must run inside a provider.

## Features

- Shared global state with a minimal API
- Optional persistence (`localStorage` on Web; storage adapters on React Native)
- Debug logging for development (`debug` prop)
- Composed hooks for common patterns (`useToggle`, `useCounter`, `useFormState`, …)
- Storage adapter interface for custom backends

## API Overview

| Export | Kind | Description |
| --- | --- | --- |
| `useFusionState` | Hook | Subscribe to a global key; returns `[value, setValue]` |
| `FusionStateProvider` | Component | Root provider for global state |
| `useGlobalState` | Hook | Access the full global state context |
| `useFusionStateLog` | Hook | Observe state slices for debugging |
| `usePersistentState` | Hook | Like `useFusionState`, auto-prefixes keys with `persist.` |
| `useFrequentState` | Hook | High-frequency updates with `skipLocalState: true` |
| `useFormState` | Hook | Form object with field updater and reset |
| `useCounter` | Hook | Counter with increment, decrement, and set |
| `useToggle` | Hook | Boolean flag with toggle and set |
| `createLocalStorageAdapter` | Function | Web `localStorage` adapter |
| `createMemoryStorageAdapter` | Function | In-memory adapter (tests, ephemeral sessions) |
| `createNoopStorageAdapter` | Function | No-op adapter (SSR-safe fallback) |
| `detectBestStorageAdapter` | Function | Pick the best adapter for the current runtime |
| `NoopStorageAdapter` | Function | Deprecated alias for `createNoopStorageAdapter` |
| `formatErrorMessage` | Function | Substitute placeholders in error templates |
| `debounce` | Function | Debounce a function |
| `simpleDeepEqual` | Function | JSON-based deep equality check |
| `FusionStateErrorMessages` | Enum | Stable library error message templates |
| `FusionStateProviderProps` | Type | Props for `FusionStateProvider` |
| `UseFusionStateOptions` | Type | Per-hook options (`skipLocalState`, …) |
| `GlobalState` | Type | Global state record type |
| `SetStateAction` | Type | Value or updater function |
| `StateUpdater` | Type | Setter returned by `useFusionState` |
| `GlobalFusionStateContextType` | Type | Context value from `useGlobalState` |
| `FusionStatePersistenceProp` | Type | Accepted `persistence` prop shapes |
| `SimplePersistenceConfig` | Type | Simplified persistence configuration |
| `PersistenceConfig` | Type | Full persistence configuration |
| `PersistenceKeys` | Type | `persistKeys` shapes (simple config) |
| `PersistenceKeysConfig` | Type | `persistKeys` shapes (full config) |
| `PersistenceKeyFilter` | Type | Filter predicate for persisted keys |
| `StorageAdapter` | Type | Storage backend interface |
| `FusionStateLogOptions` | Type | Options for `useFusionStateLog` |
| `FusionStateLogSnapshot` | Type | Snapshot returned by `useFusionStateLog` |
| `FusionStateLogKey` | Type | Key identifier for logging |

## Persistence

Persistence is optional. Pass a `persistence` prop to `FusionStateProvider`:

```jsx
// Enable persistence with defaults
<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>

// Persist only selected keys
<FusionStateProvider persistence={['user', 'theme']}>
  <App />
</FusionStateProvider>
```

When `persistence={true}` and no key filter is configured, only keys prefixed with `persist.` are saved by default. Use `usePersistentState` or prefix keys manually to opt in.

For adapters, debounce, custom save/load, and React Native setup, see **[PERSISTENCE.md](./PERSISTENCE.md)**.

## TypeScript

Types are bundled in the published package (`dist/index.d.ts`). No `@types/*` install is required.

- Generic inference: `useFusionState('count', 0)` infers `number`
- Explicit generics: `useFusionState<User>('user', { name: '', email: '' })`
- Provider props, persistence config, and storage adapters are fully typed
- Exported public types (`StorageAdapter`, `PersistenceConfig`, `StateUpdater`, …) are available for application code

## React Native

React Fusion State works with React Native using the same hooks and provider.

```jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function NavigationScreen() {
  const [screenData, setScreenData] = useFusionState('navigation.data', {});

  const navigateWithData = () => {
    setScreenData({ userId: 123, lastVisited: new Date() });
    // …then navigate to the next screen
  };

  return (
    <View>
      <Button title="Go to Profile" onPress={navigateWithData} />
    </View>
  );
}

function ProfileScreen() {
  const [screenData] = useFusionState('navigation.data', {});

  return (
    <View>
      <Text>User ID: {screenData.userId}</Text>
      <Text>Last visit: {screenData.lastVisited?.toString()}</Text>
    </View>
  );
}

export default function App() {
  return (
    <FusionStateProvider
      persistence={true}
      initialState={{
        'app.version': '1.0.0',
        'user.settings': { notifications: true },
      }}
    >
      {/* Your navigation or components here */}
    </FusionStateProvider>
  );
}
```

### React Native notes

- **Persistence** — pass a storage adapter explicitly on React Native when needed; see [PERSISTENCE.md](./PERSISTENCE.md)
- **Cross-screen sharing** — avoid threading props through navigation stacks
- **Stable state** — values survive screen unmount and remount within the same provider

## Examples

### Debug mode

```jsx
<FusionStateProvider debug={true}>
  <App />
</FusionStateProvider>
```

Avoid enabling `debug` in production — logs may include user data.

### Complete theme example

```jsx
import React from 'react';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function ThemeToggle() {
  const [theme, setTheme] = useFusionState('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function ThemedComponent() {
  const [theme] = useFusionState('theme', 'light');

  return (
    <div
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff',
        padding: '20px',
      }}
    >
      <h2>Theme: {theme}</h2>
    </div>
  );
}

function App() {
  return (
    <FusionStateProvider
      initialState={{ version: '1.0' }}
      persistence={true}
      debug={process.env.NODE_ENV === 'development'}
    >
      <div>
        <ThemeToggle />
        <ThemedComponent />
      </div>
    </FusionStateProvider>
  );
}

export default App;
```

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/jgerard72/react-fusion-state).

## License

MIT
