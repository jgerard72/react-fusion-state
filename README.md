# React Fusion State

[![CI](https://github.com/jgerard72/react-fusion-state/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/jgerard72/react-fusion-state/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/jgerard72/react-fusion-state/graph/badge.svg)](https://codecov.io/gh/jgerard72/react-fusion-state)
[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg)](https://www.npmjs.com/package/react-fusion-state)
[![Downloads](https://img.shields.io/npm/dm/react-fusion-state.svg)](https://npmjs.com/package/react-fusion-state)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/react-fusion-state?label=minzipped)](https://bundlephobia.com/package/react-fusion-state)
[![Zero deps](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/react-fusion-state?activeTab=dependencies)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

![react-fusion-state — Simple, performant React state management with zero dependencies, built-in persistence, TypeScript inference, and ~7 KB gzipped](https://raw.githubusercontent.com/jgerard72/react-fusion-state/master/assets/hero.png)

**🎯 The simplest AND most performant React state management library.**

**Grade A+ performance** vs Redux/Zustand/Recoil in [benchmarks](PERFORMANCE_BENCHMARK_RESULTS.md).

### 🎉 **v1.1.1 - Cleanup, Migration & Honest Bundle Size**
- 🧹 **Deprecation pass** - Legacy aliases (`useSharedState`, `GlobalStateProvider`, `createWebStorageAdapter`, …) are now marked `@deprecated` and will be removed in v2.0.0
- 🗺️ **Migration guide** - New [Migration to v2 (preview)](#-migration-to-v2-preview) section listing every old → new name mapping
- 📚 **Docs cleaned up** - Removed promotion of deprecated aliases in `DOCUMENTATION.md`
- ✅ **100% backward compatible** - Zero breaking changes; every 1.0.x export still works identically
- 🎯 **Ultra-simple API** - Just `useFusionState` and `FusionStateProvider` - nothing else needed!
- 🚀 **Object.is() priority equality** - Optimal performance for all value types
- 🎯 **Batched notifications** - Cross-platform performance optimization

---

## 🚀 Quick Start

### Installation
```bash
npm install react-fusion-state
```

### Basic Usage

![Three steps to use react-fusion-state: wrap your app with FusionStateProvider, use the useFusionState hook, and persist state automatically across Browser, React Native and SSR](https://raw.githubusercontent.com/jgerard72/react-fusion-state/master/assets/quick-start.png)

```jsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function App() {
  return (
    <FusionStateProvider persistence={['counter']}>
      <Counter />
    </FusionStateProvider>
  );
}

function Counter() {
  const [count, setCount] = useFusionState('counter', 0);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

**That's it! 🎉** Your state is now:
- ✅ **Globally shared** across components
- ✅ **Automatically persisted** (survives page refresh)
- ✅ **Optimally rendered** (99.9% fewer re-renders)
- ✅ **TypeScript ready** with full type inference

### 🚀 Performance Options

For optimal performance with large objects, use the `shallow` option:

```jsx
function UserProfile() {
  const [user, setUser] = useFusionState('user', {
    name: 'John',
    email: 'john@example.com',
    preferences: { theme: 'dark' }
  }, { shallow: true }); // ← Only compares top-level properties
  
  // This won't re-render if user object reference changes but content is the same
  return <div>{user.name}</div>;
}
```

**When to use `shallow: true`:**
- ✅ Large objects with many properties
- ✅ When you only change top-level properties
- ✅ Performance-critical components

**When to use default (deep comparison):**
- ✅ Nested objects that change frequently
- ✅ Small objects (< 10 properties)
- ✅ When you need precise change detection

---

## 🎯 Selectors & Derived State (v1.2.0+)

Beyond `useFusionState` for per-key access, **`useFusionStore(selector)`** lets you compute *derived* values from the whole store and **re-render only when the selected value changes** — never when unrelated keys move.

### Why selectors

```jsx
import { useFusionStore } from 'react-fusion-state';

function CartTotal() {
  // Only re-renders when the total changes — not every time `user`, `theme`,
  // or any other unrelated key updates.
  const total = useFusionStore(
    (state) => (state.cart ?? []).reduce((sum, item) => sum + item.price, 0)
  );
  return <strong>${total.toFixed(2)}</strong>;
}
```

### Multi-key selectors with `shallow`

When your selector returns an object/array (recreated on each call), pass `shallow` as the second argument so equality is checked at one level of depth:

```jsx
import { useFusionStore, shallow } from 'react-fusion-state';

function UserBadge() {
  const { name, isAdmin } = useFusionStore(
    (state) => ({
      name: state.user?.name ?? 'Guest',
      isAdmin: state.user?.role === 'admin',
    }),
    shallow,
  );

  return <span>{name} {isAdmin && '👑'}</span>;
}
```

### When to use what

| Need | Use |
|------|-----|
| Read & write **one key** | `useFusionState('key', initial)` |
| Read a **derived value** (computed / filtered / joined) | `useFusionStore((s) => …)` |
| Read **multiple keys** as one object | `useFusionStore((s) => ({ a: s.a, b: s.b }), shallow)` |
| **Subscribe** to changes without writing | `useFusionStore((s) => s.someKey)` |

### Custom equality functions

You can pass any `(prev, next) => boolean` as the second argument:

```jsx
const itemIds = useFusionStore(
  (state) => state.items.map((i) => i.id),
  (a, b) => a.length === b.length && a.every((id, i) => id === b[i]),
);
```

**Performance note** — `useFusionStore` uses a separate React context that **never re-renders on state changes**. All re-renders are driven by `useSyncExternalStore` and gated by your equality function. That's why a `useFusionStore` consumer can sit next to a `useFusionState('frequent-key', …)` mutator and stay completely idle as long as its selected value doesn't change.

---

## ⭐ Why React Fusion State?

### 🏆 **Performance Champion**
- **99.9% fewer re-renders** than Redux/Zustand/Recoil
- **~6.4 KB gzipped, zero dependencies** (vs 45KB+ for Redux/Recoil)
- **Zero dependencies** - no bloat, maximum speed
- [**Benchmark proven**](PERFORMANCE_BENCHMARK_RESULTS.md) - Grade A+ performance

### 🎯 **Developer Experience**
- **Zero configuration** - works out of the box
- **Automatic persistence** - localStorage/AsyncStorage built-in
- **Full TypeScript support** - complete type inference
- **React 18+ optimized** - built for modern React

### 🌍 **Universal Compatibility**
- ✅ **React Web** (Create React App, Next.js, Vite)
- ✅ **React Native** (Expo, bare React Native)
- ✅ **SSR/SSG** (Next.js, Gatsby)
- ✅ **All bundlers** (Webpack, Vite, Rollup)

---

## 📚 Key Features

### 🔄 **Global State Management**
```jsx
// Component A
const [user, setUser] = useFusionState('user', { name: '', email: '' });

// Component B (anywhere in your app)
const [user] = useFusionState('user'); // Same state, automatically synced
```

### 💾 **Built-in Persistence**
```jsx
// Granular persistence (RECOMMENDED)
<FusionStateProvider persistence={['user', 'settings']}>

// Persist all keys (use with caution)
<FusionStateProvider persistence={true}>

// Advanced persistence configuration
<FusionStateProvider persistence={{
  persistKeys: ['user', 'cart'],
  debounce: 1000, // Save after 1s of inactivity
  keyPrefix: 'myApp'   // Namespace your storage
}}>
```

### 🎯 **Optimized Re-renders**
```jsx
// Only components using 'counter' re-render when it changes
const [counter] = useFusionState('counter', 0);

// Other components remain untouched - 99.9% fewer re-renders!
```

### 🔍 **Debug Mode**
```jsx
const [state, setState] = useFusionState('debug-key', {}, { debug: true });
// See all state changes in console
```

---

## 🎮 Try the Demo

**Interactive demos** with zero setup:

```bash
# Clone the repo
git clone https://github.com/jgerard72/react-fusion-state.git
cd react-fusion-state

# Open demo in browser
open demo/demo-persistence.html
```

**Or try online:** [Live Demo](https://github.com/jgerard72/react-fusion-state/tree/master/demo)

---

## 📖 Documentation

### 📋 **Complete Guides**
- [**Getting Started**](GETTING_STARTED.md) - 5-minute setup guide
- [**Full Documentation**](DOCUMENTATION.md) - Complete API reference
- [**Performance Benchmarks**](PERFORMANCE_BENCHMARK_RESULTS.md) - Detailed performance analysis

### 🧪 **Examples & Demos**
- [**Interactive Demos**](demo/) - Try all features in your browser
- [**Code Examples**](src/examples/) - React & React Native examples
- [**Platform Compatibility**](src/PLATFORM_COMPATIBILITY.md) - Cross-platform guide

### 🛠️ **Development**
- [**Contributing Guide**](CONTRIBUTING.md) - How to contribute
- [**Changelog**](CHANGELOG.md) - Version history
- [**Security Policy**](SECURITY.md) - Security guidelines

---

## 🏆 Performance Comparison

| Library | Bundle Size | Re-renders | Dependencies | Setup |
|---------|-------------|------------|--------------|--------|
| **React Fusion State** | **~6.4 KB** | **99.9% fewer** | **0** | **Zero** |
| Redux Toolkit | 45KB+ | Many | 15+ | Complex |
| Zustand | 8KB+ | Many | 2+ | Moderate |
| Recoil | 120KB+ | Many | 10+ | Complex |

**[See detailed benchmarks →](PERFORMANCE_BENCHMARK_RESULTS.md)**

---

## 🌟 Real-World Usage

### E-commerce App
```jsx
// Configure persistence for important data only
<FusionStateProvider persistence={['cart', 'user', 'theme']}>
  <App />
</FusionStateProvider>

function App() {
  // Shopping cart state (persisted)
  const [cart, setCart] = useFusionState('cart', []);
  
  // User preferences (persisted)
  const [theme, setTheme] = useFusionState('theme', 'light');
  
  // Session data (NOT persisted - temporary)
  const [currentPage, setCurrentPage] = useFusionState('page', 'home');
}
```

### React Native App
```jsx
import { useFusionState } from 'react-fusion-state';

function UserProfile() {
  // Works identically in React Native with automatic persistence
  const [userProfile, setUserProfile] = useFusionState('profile', {
    name: '',
    settings: {}
  });

  return <ProfileView profile={userProfile} />;
}
```

### Advanced Performance (v1.0+)
```jsx
function OptimizedComponent() {
  // Automatic Object.is() equality + intelligent fallbacks
  const [data, setData] = useFusionState('data', {
    users: [],
    settings: {}
  });

  // Shallow comparison for large objects (when you know structure is flat)
  const [preferences, setPreferences] = useFusionState('prefs', {
    theme: 'light',
    language: 'en'
  }, { shallow: true });

  // Updates are automatically batched across components!
  const handleUpdate = () => {
    setData({...data, users: newUsers});     // Batched
    setPreferences({...preferences, theme: 'dark'}); // Batched
    // Both updates happen in single render cycle ✨
  };
}
```

---

## 🗺️ Migration to v2 (preview)

v1.1.x marks every legacy alias as `@deprecated`. They still work — your IDE will just show them with a strikethrough. **All of them will be removed in v2.0.0.** Use the table below to migrate ahead of time.

### Hooks

| Deprecated (1.x) | Use instead |
| --- | --- |
| `useSharedState` | `useFusionState` |
| `usePersistentState` | `useFusionState` |
| `useAppState` | `useFusionState` |

### Provider

| Deprecated (1.x) | Use instead |
| --- | --- |
| `GlobalStateProvider` | `FusionStateProvider` |
| `StateProvider` | `FusionStateProvider` |
| `AppStateProvider` | `FusionStateProvider` |

### Storage adapters

| Deprecated (1.x) | Use instead |
| --- | --- |
| `createWebStorageAdapter` | `createLocalStorageAdapter` |
| `createRNStorageAdapter` | `createAsyncStorageAdapter` |
| `createMobileStorageAdapter` | `createAsyncStorageAdapter` |
| `createInMemoryAdapter` | `createMemoryStorageAdapter` |
| `autoDetectStorage` | `detectBestStorageAdapter` |
| `NoopStorageAdapter` | `createNoopStorageAdapter` |

### Example key objects

`AppKeys` and `UserKeys` were exported as documentation examples only. They will be removed in v2.0.0 — define your own typed keys directly in your app:

```jsx
import { createKey, createNamespacedKey } from 'react-fusion-state';

const userKey = createKey<{ id: number; name: string } | null>('user');
const themeKey = createKey<'light' | 'dark'>('theme');
const profileKey = createNamespacedKey<{ avatar: string }>('user', 'profile');
```

### Quick codemod

A find-and-replace across your codebase covers the migration — the function signatures are strictly identical:

```bash
# Hooks
rg -l 'useSharedState|usePersistentState|useAppState' | xargs sed -i '' 's/useSharedState\|usePersistentState\|useAppState/useFusionState/g'

# Provider
rg -l 'GlobalStateProvider|StateProvider\b|AppStateProvider' | xargs sed -i '' 's/GlobalStateProvider\|StateProvider\|AppStateProvider/FusionStateProvider/g'
```

> Always review the diff before committing — `sed` is blunt and may touch unintended occurrences inside comments or strings.

---

## 🤝 Community & Support

### 💬 **Get Help**
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/jgerard72/react-fusion-state/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/jgerard72/react-fusion-state/discussions)
- 📧 **Direct Contact:** [LinkedIn](https://www.linkedin.com/in/jgerard)

### 🚀 **Contributing**
We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for:
- 🛠️ Development setup
- 📝 Code standards
- 🧪 Testing guidelines
- 📋 Contribution workflow

---

## 📄 License

MIT © [Jacques GERARD](https://www.linkedin.com/in/jgerard)

---

## ⭐ Star This Project

If React Fusion State helps your project, please give it a star! ⭐

**Every star helps other developers discover this performance-optimized solution.**

[**⭐ Star on GitHub**](https://github.com/jgerard72/react-fusion-state)

---

**Happy coding with React Fusion State! 🚀**
