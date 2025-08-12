# React Fusion State

<div align="center">

![React Fusion State](https://raw.githubusercontent.com/jgerard72/react-fusion-state/master/images/react-fusion-state.png)

**Simple Redux replacement for React, React Native & Expo**

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg?style=flat-square)](https://www.npmjs.com/package/react-fusion-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

</div>

## 🆚 Redux vs React Fusion State

| Feature | Redux | React Fusion State |
|---------|-------|-------------------|
| **Bundle Size** | ~50KB+ | ~7KB |
| **Learning Curve** | Hours/Days | 5 minutes |
| **Boilerplate** | Actions, Reducers, Store | None |
| **Global State** | `useSelector(state => state.count)` | `useFusionState('count', 0)` |
| **Persistence** | External plugin | Built-in |
| **React Native/Expo** | Extra setup | Works out of the box |

## 📦 Installation

```bash
npm install react-fusion-state
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
    </div>
  );
}

function Display() {
  const [count] = useFusionState('counter', 0); // Same state!
  return <p>Current count: {count}</p>;
}
```

**That's it!** 🎉 Both components share the same state automatically.

## 🌍 Universal Compatibility

**Same code works everywhere:**

```jsx
// ✅ ReactJS
const [theme, setTheme] = useFusionState('theme', 'light');

// ✅ React Native
const [theme, setTheme] = useFusionState('theme', 'light');

// ✅ Expo
const [theme, setTheme] = useFusionState('theme', 'light');
```

## 💾 Automatic Persistence

State automatically persists between sessions:

```jsx
<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>
```

- ✅ **ReactJS**: Uses localStorage automatically
- ✅ **React Native**: Uses AsyncStorage automatically  
- ✅ **Expo**: Uses AsyncStorage automatically

## ⚡ Why Switch from Redux?

- 🚀 **7x smaller** - Your users will thank you
- 🔄 **No boilerplate** - Write less, do more
- 🧠 **Easy to learn** - If you know `useState`, you know this
- 💾 **Persistence included** - Built-in, no plugins needed
- 🌍 **Universal** - Same API everywhere
- ⚡ **Just works** - Zero configuration

## 📱 React Native & Expo

Works perfectly with React Native and Expo out of the box:

```jsx
import { View, Text, Button } from 'react-native';
import { useFusionState } from 'react-fusion-state';

function MyComponent() {
  const [user, setUser] = useFusionState('user', null);
  
  return (
    <View>
      <Text>User: {user?.name || 'Not logged in'}</Text>
      <Button title="Login" onPress={() => setUser({name: 'John'})} />
    </View>
  );
}
```

## 🔧 API Reference

### `useFusionState(key, defaultValue)`

```jsx
const [state, setState] = useFusionState('myKey', defaultValue);
```

- **key**: Unique identifier for the state
- **defaultValue**: Initial value if no stored value exists
- Returns: `[state, setState]` - Same as `useState`

### `FusionStateProvider`

```jsx
<FusionStateProvider 
  persistence={true}           // Enable persistence
  initialState={{key: value}}  // Set initial state
>
  <App />
</FusionStateProvider>
```

## 📄 License

MIT © [Jacques GERARD](https://github.com/jgerard72)