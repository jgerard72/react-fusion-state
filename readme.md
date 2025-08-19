# React Fusion State

<div align="center">

![React Fusion State](https://raw.githubusercontent.com/jgerard72/react-fusion-state/master/images/react-fusion-state.png)

**Universal state management for React, Vue.js & Angular**  
*Zero boilerplate • Built-in persistence • Multi-framework • Multi-platform*

🚀 **Now supports React, Vue.js, and Angular with the same powerful API!**

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg?style=flat-square)](https://www.npmjs.com/package/react-fusion-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-fusion-state?style=flat-square&color=brightgreen)](https://bundlephobia.com/package/react-fusion-state)

</div>

## 🎯 **Why Choose React Fusion State?**

### **⚡ Zero Setup Required**
```jsx
// That's it. No reducers, actions, or store configuration.
const [count, setCount] = useFusionState('count', 0);
```

### **💾 Persistence Built-In**
```jsx
// State automatically survives page refreshes
<FusionStateProvider persistence>
```

### **🌍 Works Everywhere**
```jsx
✅ React.js    ✅ Vue.js 3    ✅ Angular    ✅ React Native    ✅ Expo    ✅ Next.js    ✅ SSR
```

---

## 🆚 **vs Popular Libraries**

| | **Redux** | **Zustand** | **Jotai** | **React Fusion State** |
|---|:---:|:---:|:---:|:---:|
| **Setup** | 🔴 Complex | 🟡 Manual | 🟡 Manual | 🟢 **Zero** |
| **Size** | 🔴 47KB | 🟡 8KB | 🟢 5KB | 🟢 **7KB** |
| **Performance** | 🟡 Manual tuning | 🟢 Good | 🟢 Good | 🟢 **Optimized** |
| **Re-renders** | 🟡 Selector-dependent | 🟢 Optimized | 🟢 Atomic | 🟢 **Auto-optimized** |
| **Persistence** | 🔴 Plugin | 🔴 Plugin | 🟡 External | 🟢 **Built-in** |
| **Learning** | 🔴 Days | 🟡 Hours | 🟡 Hours | 🟢 **5 min** |
| **React Native** | 🔴 Complex | 🟡 Manual | 🟡 Manual | 🟢 **Ready** |

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

### 🟢 **Vue.js Quick Start**
```vue
<script setup>
import { useFusionState } from 'react-fusion-state/adapters/vue';

// Same simple API, Vue-native reactivity!
const [count, setCount] = useFusionState('count', 0);
const increment = () => setCount(c => c + 1);
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

### 🅰️ **Angular Quick Start**
```typescript
import { FusionStateService } from 'react-fusion-state/adapters/angular';

@Component({
  template: `
    <div>
      <p>Count: {{ count$ | async }}</p>
      <button (click)="increment()">+</button>
    </div>
  `
})
export class CounterComponent {
  count$ = this.fusionState.select('count', 0);
  
  constructor(private fusionState: FusionStateService) {}
  
  increment() {
    const current = this.fusionState.getValue('count') || 0;
    this.fusionState.setValue('count', current + 1);
  }
}
```

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

### **🌐 Universal & Multi-Framework**
- **Same powerful logic** across React, Vue.js, and Angular
- **Framework-native APIs** - feels natural in each ecosystem
- **Universal storage** - works on web, mobile, and server
- **Shared state** - even between different framework components!

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
  const [user, setUser] = useFusionState('user', null);
  
  const login = async (credentials) => {
    const userData = await api.login(credentials);
    setUser(userData); // Automatically saved!
  };
  
  const logout = () => setUser(null);
  
  return { user, login, logout };
}

// Use anywhere in your app
function Header() {
  const { user, logout } = useAuth();
  return user ? <UserMenu onLogout={logout} /> : <LoginButton />;
}
```

---

## 🌟 **What Makes It Special**

- **🚀 Zero boilerplate** - Works immediately after install
- **🔄 Automatic persistence** - State survives refreshes/restarts  
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

## 📚 **Resources**

### **Multi-Framework Documentation**
- [**🌐 Multi-Framework Guide**](https://github.com/jgerard72/react-fusion-state/blob/master/MULTI_FRAMEWORK_GUIDE.md) - Complete guide for React, Vue.js & Angular
- [**🏗️ Implementation Summary**](https://github.com/jgerard72/react-fusion-state/blob/master/IMPLEMENTATION_SUMMARY.md) - Technical architecture details

### **React Documentation**
- [**🚀 Getting Started**](https://github.com/jgerard72/react-fusion-state/blob/master/GETTING_STARTED.md) - Quick setup for new users & contributors
- [**📖 Complete Documentation**](https://github.com/jgerard72/react-fusion-state/blob/master/DOCUMENTATION.md) - Full guide with examples
- [**⚡ Performance Analysis**](https://github.com/jgerard72/react-fusion-state/blob/master/PERFORMANCE_ANALYSIS.md) - Detailed benchmarks vs Redux/Zustand

### **General Resources**
- [**🧪 Interactive Demo**](https://github.com/jgerard72/react-fusion-state/blob/master/demo/) - Try it in your browser
- [**🤝 Contributing Guide**](https://github.com/jgerard72/react-fusion-state/blob/master/CONTRIBUTING.md) - How to contribute
- [**💡 Examples**](https://github.com/jgerard72/react-fusion-state/tree/master/src/examples) - Working examples for all frameworks
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
