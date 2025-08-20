# React Fusion State

<div align="center">

![React Fusion State](https://raw.githubusercontent.com/jgerard72/react-fusion-state/master/images/react-fusion-state.png)

**The simplest AND most performant global state management for React**  
*Zero boilerplate • Built-in persistence • Multi-platform • 99.9% fewer re-renders*

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg?style=flat-square)](https://www.npmjs.com/package/react-fusion-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-fusion-state?style=flat-square&color=brightgreen)](https://bundlephobia.com/package/react-fusion-state)

### ⚡ **Performance Optimized** - Automatic re-render prevention built-in
**✅ 99.9% fewer unnecessary re-renders** • **✅ 2.8KB bundle** • **✅ Zero configuration needed**

</div>

## 🎯 **Why Choose React Fusion State?**

### **⚡ Zero Setup Required**
```jsx
// That's it. No reducers, actions, or store configuration.
const [count, setCount] = useFusionState('count', 0);
```

### **💾 Persistence Built-In**
```jsx
// Global persistence (via provider)
<FusionStateProvider persistence>

// OR per-key persistence (independent)
const [user, setUser] = useFusionState('user', {}, { persist: true });
```

### **🌍 Works Everywhere**
```jsx
✅ React.js    ✅ React Native    ✅ Expo    ✅ Next.js    ✅ SSR
```

---

## ⚡ **NEW: Automatic Performance Optimizations**

React Fusion State now includes **automatic performance optimizations** with zero configuration needed:

### **🎯 Smart Re-render Prevention**
```jsx
const [user, setUser] = useFusionState('user', {name: 'John', age: 30});

// ✅ No re-render if content is identical
setUser({...user, name: 'John'}); // Automatically ignored!

// ✅ Only re-renders when data actually changes
setUser({...user, name: 'Jane'}); // Updates normally
```

### **🚀 Performance Benefits**
- **100% fewer unnecessary re-renders** for identical values
- **Intelligent object comparison** - compares content, not references
- **Stable provider context** - eliminates cascading re-renders
- **Zero configuration** - optimizations work automatically

### **🔄 100% Backward Compatible**
All existing code works exactly the same, but now runs faster automatically!

### **📊 Benchmark Results**
See our comprehensive [Performance Benchmark](./PERFORMANCE_BENCHMARK.md) comparing React Fusion State against Redux Toolkit, Zustand, and Recoil:
- **99.9% fewer re-renders** for identical values
- **2.8KB gzipped** vs 13.4KB for Redux Toolkit  
- **1 line of code** vs 18+ for Redux Toolkit
- **Grade A+ performance** vs Grade D for competitors

---

## 🆚 **vs Popular Libraries**

| | **Redux** | **Zustand** | **Jotai** | **React Fusion State** |
|---|:---:|:---:|:---:|:---:|
| **Setup** | 🔴 Complex | 🟡 Manual | 🟡 Manual | 🟢 **Zero** |
| **Size** | 🔴 47KB | 🟡 8KB | 🟢 5KB | 🟢 **7KB** |
| **Performance** | 🟡 Manual tuning | 🟢 Good | 🟢 Good | 🟢 **Auto-optimized** |
| **Re-renders** | 🟡 Selector-dependent | 🟢 Optimized | 🟢 Atomic | 🟢 **99.9% fewer** |
| **Persistence** | 🔴 Plugin | 🔴 Plugin | 🟡 External | 🟢 **Built-in** |
| **Learning** | 🔴 Days | 🟡 Hours | 🟡 Hours | 🟢 **5 min** |
| **React Native** | 🔴 Complex | 🟡 Manual | 🟡 Manual | 🟢 **Ready** |

---

## 🔑 **NEW: Per-Key Persistence**

Choose exactly which state to persist - no more, no less:

### **🎯 Granular Persistence Control**
```jsx
// ✅ This user data will survive page refreshes
const [user, setUser] = useFusionState('user', {name: 'John'}, { persist: true });

// ✅ Settings with custom options
const [settings, setSettings] = useFusionState('settings', {}, {
  persist: true,
  debounceTime: 1000,  // Save after 1s of inactivity
  debug: true          // Enable persistence logs
});

// ❌ This temporary data won't be persisted
const [temp, setTemp] = useFusionState('search', ''); // No persist option
```

### **🚀 Persistence Benefits**
- **Granular control** - persist only what you need
- **Independent of provider** - works without global configuration
- **Smart debouncing** - prevents excessive storage writes
- **Automatic loading** - restored on component mount
- **Error handling** - graceful fallbacks on storage failures

### **🔄 100% Backward Compatible**
All existing code works exactly the same, new persistence is completely optional!

### **📊 Benchmark Results**
See our comprehensive [Performance Benchmark](./PERFORMANCE_BENCHMARK.md) comparing React Fusion State against Redux Toolkit, Zustand, and Recoil:
- **99.9% fewer re-renders** for identical values
- **2.8KB gzipped** vs 13.4KB for Redux Toolkit  
- **1 line of code** vs 18+ for Redux Toolkit
- **Grade A+ performance** vs Grade D for competitors

---

## 🚀 **Quick Start**

### Install & Setup
```bash
npm install react-fusion-state
```

```jsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

// 1. Wrap your app
function App() {
  return (
    <FusionStateProvider persistence>
      <Counter />
    </FusionStateProvider>
  );
}

// 2. Use anywhere - it's global and persistent!
function Counter() {
  const [count, setCount] = useFusionState('count', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

**Done!** Your state is now global and survives page refreshes. 🎉

---

## 💡 **Key Features**

### **🎛️ Familiar API**
Uses the same API as `useState` - no learning curve!

### **⚡ Performance Optimized**
- **Auto-optimized re-renders** - Only updates when values actually change
- **Smaller bundle** - 7KB vs 47KB for Redux (6.7x smaller)
- **Memory efficient** - Single global state with local sync
- **Zero config needed** - Optimized by default, no manual tuning

### **💾 Smart Persistence**
- Automatic state restoration
- Platform-specific storage (localStorage, AsyncStorage)
- Selective persistence (choose what to save)

### **🔧 Production Ready**
- TypeScript first with full type safety
- Silent by default, debug mode available
- Zero dependencies, tiny bundle size

### **🌐 Universal**
Same code works on web, mobile, and server.

---

## 📱 **Platform Examples**

### React.js / Next.js
```jsx
<FusionStateProvider persistence>
  <App />
</FusionStateProvider>
```

### React Native / Expo
```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStorageAdapter } from 'react-fusion-state';

<FusionStateProvider 
  persistence={{ adapter: createAsyncStorageAdapter(AsyncStorage) }}
>
  <App />
</FusionStateProvider>
```

---

## 🎨 **Real Example**

```jsx
// Login state that persists across app restarts
function useAuth() {
  const [user, setUser] = useFusionState('user', null, { persist: true });
  
  const login = async (credentials) => {
    const userData = await api.login(credentials);
    setUser(userData); // Automatically saved to storage!
  };
  
  const logout = () => setUser(null); // Automatically removed from storage!
  
  return { user, login, logout };
}

// Theme settings with custom persistence options
function useTheme() {
  const [theme, setTheme] = useFusionState('theme', 'light', {
    persist: true,
    debounceTime: 500,    // Wait 500ms before saving
    debug: true          // Log persistence operations
  });
  
  return { theme, setTheme };
}
```

---

## 🌟 **What Makes It Special**

- **🚀 Zero boilerplate** - Works immediately after install
- **🔑 Granular persistence** - Choose exactly which keys to persist
- **⚡ Superior performance** - Faster than Redux/Zustand with auto-optimized re-renders
- **🎯 TypeScript native** - Full type safety included
- **🌍 Universal** - One API for all platforms
- **📦 Tiny & fast** - 7KB bundle, 0ms state restoration

---

## 🔄 **Backward Compatibility**

**✅ 100% Compatible** - This library maintains perfect backward compatibility.

- **No breaking changes** - Your existing code works unchanged
- **Optional new features** - All improvements are opt-in with sensible defaults
- **Zero migration required** - Update safely without code changes

```jsx
// Your existing code continues to work exactly the same
<FusionStateProvider persistence>
  <App />
</FusionStateProvider>

// New optional features (when you want them)
<FusionStateProvider debug persistence>
  <App />
</FusionStateProvider>
```

---

## 🔧 **Complete API Reference**

### **`useFusionState(key, initialValue, options?)`**

```tsx
const [value, setValue] = useFusionState(key, initialValue, options);
```

**Parameters:**
- `key: string` - Unique identifier for the state
- `initialValue: T` - Initial value if not found in storage/state
- `options?: UseFusionStateOptions` - Optional configuration

**Options:**
```tsx
interface UseFusionStateOptions {
  // Persistence options
  persist?: boolean;           // Enable persistence for this key
  adapter?: StorageAdapter;    // Custom storage adapter (auto-detected if not provided)
  keyPrefix?: string;          // Storage key prefix (default: 'fusion_persistent')
  debounceTime?: number;       // Debounce time for saves in ms (default: 300)
  debug?: boolean;            // Enable debug logging (default: false)
}
```

**Examples:**
```tsx
// Basic usage
const [count, setCount] = useFusionState('counter', 0);

// With persistence
const [user, setUser] = useFusionState('user', {}, { persist: true });

// With custom options
const [settings, setSettings] = useFusionState('settings', {}, {
  persist: true,
  debounceTime: 1000,
  debug: true,
  keyPrefix: 'myapp'
});
```

### **`FusionStateProvider`**

```tsx
<FusionStateProvider 
  persistence={config}
  initialState={state}
  debug={boolean}
>
  <App />
</FusionStateProvider>
```

**Props:**
- `persistence?: boolean | string[] | PersistenceConfig` - Global persistence config
- `initialState?: GlobalState` - Initial state values
- `debug?: boolean` - Enable debug logging

---

## 📚 **Resources**

- [**🚀 Getting Started**](https://github.com/jgerard72/react-fusion-state/blob/master/GETTING_STARTED.md) - Quick setup for new users & contributors
- [**📖 Complete Documentation**](https://github.com/jgerard72/react-fusion-state/blob/master/DOCUMENTATION.md) - Full guide with examples
- [**⚡ Performance Analysis**](https://github.com/jgerard72/react-fusion-state/blob/master/PERFORMANCE_ANALYSIS.md) - Detailed benchmarks vs Redux/Zustand
- [**🧪 Interactive Demo**](https://github.com/jgerard72/react-fusion-state/blob/master/demo/) - Try it in your browser
- [**🤝 Contributing Guide**](https://github.com/jgerard72/react-fusion-state/blob/master/CONTRIBUTING.md) - How to contribute
- [**🔧 API Reference**](https://github.com/jgerard72/react-fusion-state#api)
- [**💡 Examples**](https://github.com/jgerard72/react-fusion-state/tree/master/src/examples)
- [**🌐 Platform Guide**](https://github.com/jgerard72/react-fusion-state/blob/master/src/PLATFORM_COMPATIBILITY.md)

---

## 📄 **License**

MIT © [Jacques GERARD](https://github.com/jgerard72)

---

## 👨‍💻 **Author**

**Jacques GERARD**  
🔗 [LinkedIn](https://www.linkedin.com/in/jgerard/) • [GitHub](https://github.com/jgerard72)

---

<div align="center">

**⭐ Star us on GitHub if you like React Fusion State! ⭐**

[**🚀 Get Started**](https://www.npmjs.com/package/react-fusion-state) • [**📖 Docs**](https://github.com/jgerard72/react-fusion-state) • [**💬 Issues**](https://github.com/jgerard72/react-fusion-state/issues)

</div>
