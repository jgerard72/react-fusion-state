# React Fusion State

<div align="center">

![React Fusion State](https://raw.githubusercontent.com/jgerard72/react-fusion-state/master/images/react-fusion-state.png)

**A simple, lightweight, and universal state management library for React & React Native**

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg?style=flat-square)](https://www.npmjs.com/package/react-fusion-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

</div>

---

## ✨ Why React Fusion State?

- 🚀 **Lightweight** - Less than 2KB (minified + gzipped)
- 🔄 **Familiar API** - Works like React's `useState`
- 🌍 **Universal** - Same code for React & React Native
- 💾 **Smart Persistence** - Automatic localStorage/AsyncStorage
- 🛡️ **TypeScript First** - Full type safety out of the box
- ⚡ **Zero Configuration** - Works immediately, customize when needed

---

## 📦 Installation

```bash
npm install react-fusion-state
# or
yarn add react-fusion-state
```

## 🚀 Quick Start

### 1. Wrap your app

```jsx
import { FusionStateProvider } from 'react-fusion-state';

function App() {
  return (
    <FusionStateProvider>
      <YourApp />
    </FusionStateProvider>
  );
}
```

### 2. Use global state anywhere

```jsx
import { useFusionState } from 'react-fusion-state';

function Counter() {
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}

function Display() {
  const [count] = useFusionState('counter', 0); // Same state!
  return <p>Current count: {count}</p>;
}
```

**That's it!** 🎉 Both components share the same state automatically.

---

## 🌟 Key Features

### Universal Compatibility

**The exact same code works everywhere:**

```jsx
// ✅ React Web
import { View, Text, Button } from 'react'; // Web components

// ✅ React Native  
import { View, Text, Button } from 'react-native'; // Native components

// Same logic everywhere!
function MyComponent() {
  const [theme, setTheme] = useFusionState('theme', 'light');
  
  return (
    <View>
      <Text>Theme: {theme}</Text>
      <Button 
        title="Toggle" 
        onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
      />
    </View>
  );
}
```

### Smart Persistence

State automatically persists between sessions:

```jsx
// ✅ Web: Uses localStorage automatically
// ✅ React Native: Uses AsyncStorage (with adapter)
// ✅ Tests: Uses memory storage

<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>
```

### Advanced State Management

```jsx
function UserProfile() {
  // Complex state with TypeScript
  const [user, setUser] = useFusionState<User>('user', {
    name: '',
    email: '',
    preferences: { theme: 'light' }
  });

  // Partial updates work perfectly
  const updateName = (name: string) => {
    setUser(prev => ({ ...prev, name }));
  };

  return (
    <form>
      <input 
        value={user.name}
        onChange={e => updateName(e.target.value)}
      />
      <input 
        value={user.email}
        onChange={e => setUser(prev => ({ ...prev, email: e.target.value }))}
      />
    </form>
  );
}
```

---

## 📱 React Native Setup

### Installation

```bash
npm install @react-native-async-storage/async-storage
cd ios && pod install  # iOS only
```

### Configuration

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FusionStateProvider, createAsyncStorageAdapter } from 'react-fusion-state';

const asyncStorageAdapter = createAsyncStorageAdapter(AsyncStorage);

export default function App() {
  return (
    <FusionStateProvider 
      persistence={{
        adapter: asyncStorageAdapter,
        persistKeys: ['user', 'settings'] // Optional: only persist specific keys
      }}
    >
      <YourApp />
    </FusionStateProvider>
  );
}
```

### Cross-Screen State Sharing

```jsx
// Screen 1
function ProfileScreen() {
  const [user, setUser] = useFusionState('user', { name: 'John' });
  
  return (
    <View>
      <TextInput 
        value={user.name}
        onChangeText={name => setUser({...user, name})}
      />
      <Button title="Go to Settings" onPress={() => navigate('Settings')} />
    </View>
  );
}

// Screen 2 - Same state automatically!
function SettingsScreen() {
  const [user] = useFusionState('user', { name: 'John' });
  
  return (
    <View>
      <Text>Hello {user.name}!</Text> {/* Shows updated name */}
    </View>
  );
}
```

---

## ⚙️ Advanced Configuration

### Selective Persistence

```jsx
<FusionStateProvider 
  persistence={{
    // Only persist user data and settings
    persistKeys: ['user', 'settings', 'theme'],
    
    // Or use a function for complex logic
    persistKeys: (key, value) => {
      return key.startsWith('persist.') && typeof value !== 'function';
    }
  }}
>
  <App />
</FusionStateProvider>
```

### Performance Optimization

```jsx
<FusionStateProvider 
  persistence={{
    // Debounce saves to reduce writes
    debounce: 500,
    
    // Custom key prefix
    keyPrefix: 'MyApp_v2',
    
    // Error handling
    onSaveError: (error, state) => {
      console.error('Save failed:', error);
      showNotification('Failed to save data');
    },
    
    onLoadError: (error, key) => {
      console.warn(`Failed to load ${key}:`, error);
    }
  }}
>
  <App />
</FusionStateProvider>
```

### Custom Storage

```jsx
import { StorageAdapter } from 'react-fusion-state';

const myCustomStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    return await myDatabase.get(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await myDatabase.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await myDatabase.delete(key);
  }
};

<FusionStateProvider persistence={{ adapter: myCustomStorage }}>
  <App />
</FusionStateProvider>
```

---

## 🔧 Development & Debugging

### Debug Mode

```jsx
<FusionStateProvider debug={true}>
  <App />
</FusionStateProvider>
```

### State Inspector

```jsx
import { useFusionStateLog } from 'react-fusion-state';

function DebugPanel() {
  // Watch specific keys
  const state = useFusionStateLog(['user', 'counter'], {
    trackChanges: true,
    consoleLog: true
  });

  return (
    <div>
      <h3>Current State</h3>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

---

## 📚 Complete Example

```jsx
import React from 'react';
import { 
  FusionStateProvider, 
  useFusionState, 
  useFusionStateLog 
} from 'react-fusion-state';

// Theme toggle component
function ThemeToggle() {
  const [theme, setTheme] = useFusionState('theme', 'light');
  
  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{ 
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

// User profile component
function UserProfile() {
  const [user, setUser] = useFusionState('user', {
    name: '',
    email: '',
    age: 0
  });

  return (
    <div>
      <h2>Profile</h2>
      <input 
        placeholder="Name"
        value={user.name}
        onChange={e => setUser({...user, name: e.target.value})}
      />
      <input 
        placeholder="Email"
        value={user.email}
        onChange={e => setUser({...user, email: e.target.value})}
      />
      <input 
        type="number"
        placeholder="Age"
        value={user.age}
        onChange={e => setUser({...user, age: parseInt(e.target.value) || 0})}
      />
    </div>
  );
}

// Shopping cart
function ShoppingCart() {
  const [cart, setCart] = useFusionState('cart', []);
  
  const addItem = (item) => {
    setCart([...cart, { id: Date.now(), ...item }]);
  };

  return (
    <div>
      <h2>Cart ({cart.length} items)</h2>
      <button onClick={() => addItem({ name: 'Apple', price: 1.99 })}>
        Add Apple
      </button>
      <ul>
        {cart.map(item => (
          <li key={item.id}>{item.name} - ${item.price}</li>
        ))}
      </ul>
    </div>
  );
}

// Debug panel
function DebugPanel() {
  const state = useFusionStateLog(['theme', 'user', 'cart']);
  
  return (
    <details>
      <summary>🐛 Debug State</summary>
      <pre style={{ background: '#f5f5f5', padding: '10px' }}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </details>
  );
}

// Main application
export default function App() {
  return (
    <FusionStateProvider 
      persistence={{
        persistKeys: ['theme', 'user'], // Don't persist cart
        debounce: 300,
        onSaveError: (error) => console.error('Save failed:', error)
      }}
      debug={process.env.NODE_ENV === 'development'}
    >
      <div style={{ padding: '20px' }}>
        <h1>🚀 React Fusion State Demo</h1>
        
        <ThemeToggle />
        <UserProfile />
        <ShoppingCart />
        <DebugPanel />
        
        <footer style={{ marginTop: '40px', color: '#666' }}>
          <p>✨ All state is automatically shared and persisted!</p>
        </footer>
      </div>
    </FusionStateProvider>
  );
}
```

---

## 🔍 API Reference

### `<FusionStateProvider>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Your app components |
| `initialState` | `object` | `{}` | Initial state values |
| `persistence` | `boolean \| string[] \| object` | `false` | Persistence configuration |
| `debug` | `boolean` | `false` | Enable debug logging |

### `useFusionState<T>(key, initialValue)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Unique state key |
| `initialValue` | `T` | Default value if key doesn't exist |
| **Returns** | `[T, (value: T \| (prev: T) => T) => void]` | State and setter |

### `useFusionStateLog(keys?, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `keys` | `string[]` | Keys to watch (optional) |
| `options` | `object` | Logging options |
| **Returns** | `object` | Current state snapshot |

---

## 🎯 Best Practices

### 1. Use Descriptive Keys
```jsx
// ✅ Good
const [user, setUser] = useFusionState('user.profile', defaultUser);
const [theme, setTheme] = useFusionState('app.theme', 'light');

// ❌ Avoid
const [data, setData] = useFusionState('d', {});
```

### 2. Initialize with Proper Types
```typescript
interface User {
  name: string;
  email: string;
}

// ✅ TypeScript will enforce the type
const [user, setUser] = useFusionState<User>('user', {
  name: '',
  email: ''
});
```

### 3. Use Selective Persistence
```jsx
// ✅ Only persist what matters
<FusionStateProvider persistence={['user', 'settings', 'theme']}>
```

### 4. Handle Errors Gracefully
```jsx
<FusionStateProvider 
  persistence={{
    onSaveError: (error) => {
      // Don't crash, just log
      console.warn('Save failed:', error);
    }
  }}
>
```

---

## 🚨 Migration from v0.1.x

React Fusion State v0.2.0 is **100% backward compatible**. No changes needed!

### New in v0.2.0
- ✅ React Native support with AsyncStorage
- ✅ Enhanced error handling
- ✅ Performance optimizations
- ✅ Better TypeScript support
- ✅ Universal environment detection

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT © [Jacques GERARD](https://github.com/jgerard72)

---

<div align="center">

**Made with ❤️ for the React community**

[⭐ Star on GitHub](https://github.com/jgerard72/react-fusion-state) | [📦 NPM Package](https://www.npmjs.com/package/react-fusion-state) | [🐛 Report Issues](https://github.com/jgerard72/react-fusion-state/issues)

</div>