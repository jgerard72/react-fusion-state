# React Fusion State

A simple and lightweight library for managing global state in your React applications.

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg?style=flat-square)](https://www.npmjs.com/package/react-fusion-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

## Installation

```bash
npm install react-fusion-state
# or
yarn add react-fusion-state
```

## Features

- 🚀 **Lightweight and fast** - Less than 2KB (minified + gzipped)
- 🔄 **Familiar API** - Similar to React's useState
- 🌐 **Shared global state** - Easy communication between components
- 💾 **Automatic persistence** - Optional state saving with AsyncStorage/localStorage
- 📱 **React Native compatible** - Works on mobile with AsyncStorage adapter
- 🛡️ **TypeScript first** - Full TypeScript support with custom error classes
- 🔧 **Error handling** - Built-in error callbacks for persistence operations
- 🎯 **Performance optimized** - Reduced bundle size and optimized re-renders


## Universal Usage

**The same API works everywhere - ReactJS, React Native, TypeScript, JavaScript.**

### 1. Basic Setup (Web & Mobile)

```jsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

// Same setup for React & React Native
function App() {
  return (
    <FusionStateProvider>
      <YourApplication />
    </FusionStateProvider>
  );
}

function Counter() {
  // Same API everywhere - web, mobile, TypeScript, JavaScript
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <div> {/* or <View> in React Native */}
      <p>Count: {count}</p> {/* or <Text> in React Native */}
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}

// Access the same state from ANY component
function Display() {
  const [count] = useFusionState('counter', 0);
  return <p>Current: {count}</p>; {/* or <Text> in React Native */}
}
```

## Data Persistence

React Fusion State can automatically save your state between sessions.

```jsx
// Enable persistence for all state
<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>

// Persist only specific keys
<FusionStateProvider persistence={['user', 'theme']}>
  <App />
</FusionStateProvider>

// Advanced options
<FusionStateProvider 
  persistence={{
    keyPrefix: 'myApp',     // Storage prefix
    debounce: 500,          // Delay before saving in ms
    persistKeys: ['user']   // Keys to persist
  }}
>
  <App />
</FusionStateProvider>
```

Persistence automatically uses localStorage on web and AsyncStorage on React Native.


## Error Handling

Handle persistence errors gracefully:

```jsx
<FusionStateProvider
  persistence={{
    adapter: asyncStorageAdapter,
    persistKeys: ['user', 'settings'],
    onSaveError: (error, state) => {
      console.error('Failed to save state:', error);
      // Show user notification
      showToast('Failed to save data');
    },
    onLoadError: (error, key) => {
      console.error('Failed to load data for key:', key, error);
      // Handle missing data gracefully
    }
  }}
>
  <App />
</FusionStateProvider>
```

## Debug Mode

```jsx
// Enable debug mode in development
<FusionStateProvider debug={true}>
  <App />
</FusionStateProvider>
```

## Usage with React Native

React Fusion State works perfectly with React Native. For persistence, you need to install AsyncStorage and use the provided adapter.

### Installation for React Native

```bash
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage

# For iOS
cd ios && pod install
```

### Configuration with AsyncStorage

```jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  FusionStateProvider, 
  useFusionState,
  createAsyncStorageAdapter 
} from 'react-fusion-state';

// Create the AsyncStorage adapter
const asyncStorageAdapter = createAsyncStorageAdapter(AsyncStorage);

// Navigation component
function NavigationScreen() {
  const [screenData, setScreenData] = useFusionState('navigation.data', {});
  
  // Store data for other screens
  const navigateWithData = () => {
    setScreenData({ userId: 123, lastVisited: new Date() });
    // ... then navigate to next screen
  };
  
  return (
    <View>
      <Button title="Go to Profile Screen" onPress={navigateWithData} />
    </View>
  );
}

// Profile component on another screen
function ProfileScreen() {
  // Access the same data, even on another screen
  const [screenData] = useFusionState('navigation.data', {});
  
  return (
    <View>
      <Text>User ID: {screenData.userId}</Text>
      <Text>Last visit: {screenData.lastVisited?.toString()}</Text>
    </View>
  );
}

// Configuration with AsyncStorage persistence
export default function App() {
  return (
    <FusionStateProvider 
      persistence={{
        adapter: asyncStorageAdapter,
        keyPrefix: 'MyApp',
        persistKeys: ['user', 'navigation.data'],
        debounce: 500
      }}
      initialState={{
        'app.version': '1.0.0',
        'user.settings': { notifications: true }
      }}
    >
      {/* Your navigation or components here */}
    </FusionStateProvider>
  );
}
```

### React Native Specific Benefits

- **AsyncStorage persistence** - Provided adapter for AsyncStorage
- **Cross-screen sharing** - Avoid passing props through navigation 
- **Consistent state** - Even after screen unmounting and remounting
- **Performance** - Optimized to avoid unnecessary re-renders on mobile
- **Automatic detection** - Detects React Native environment automatically

## Complete Example

```jsx
import React from 'react';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

// Component that modifies state
function ThemeToggle() {
  const [theme, setTheme] = useFusionState('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

// Component that uses state
function ThemedComponent() {
  const [theme] = useFusionState('theme', 'light');
  
  return (
    <div style={{ 
      background: theme === 'light' ? '#fff' : '#333',
      color: theme === 'light' ? '#333' : '#fff',
      padding: '20px'
    }}>
      <h2>Theme: {theme}</h2>
    </div>
  );
}

// Application
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

## Documentation

- [Persistence Guide](./PERSISTENCE.md) - Detailed options for data persistence
- [Changelog](./CHANGELOG.md) - Version history and changes
- [Contributing](./CONTRIBUTING.md) - Guide for contributing to the project

## Contributing

Contributions are welcome! Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## License

MIT