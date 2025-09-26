# 📚 React Fusion State - Complete Documentation

**Version:** 1.0.0  
**Author:** Jacques GERARD  
**License:** MIT

## 🎉 **What's New in v1.0.0 - STABLE RELEASE**

### 🚀 **Major Performance Upgrade**
- **Granular Persistence by Default:** Choose exactly which state keys to persist
- **Object.is() Priority:** Optimal equality comparison for all value types
- **Batched Updates:** Cross-platform `unstable_batchedUpdates` for better performance
- **Unified Architecture:** Cleaner persistence logic, single initialization effect
- **SSR Enhanced:** Proper server snapshots for robust hydration

### 🔄 **New Hooks**
- **`useFusionHydrated()`:** Track hydration status (perfect for React Native + AsyncStorage)

### 🏗️ **Architecture Improvements**
- **Centralized Persistence:** All persistence logic moved to Provider level
- **Cross-Platform Types:** Better TypeScript support for web + React Native
- **Batched Notifications:** Automatic update batching reduces re-renders

---

## 📖 **Table of Contents**

1. [🚀 Quick Start](#-quick-start)
2. [🎛️ Core API](#️-core-api)
3. [💾 Persistence](#-persistence)
4. [🔑 Per-Key Persistence](#-per-key-persistence) ⭐ **NEW**
5. [⚡ Performance Options](#-performance-options) ⭐ **v0.4.1**
6. [🌐 Platform Support](#-platform-support)
6. [🔧 Advanced Configuration](#-advanced-configuration)
7. [🛠️ Development Setup](#️-development-setup)
8. [🧪 Testing & Demo](#-testing--demo)
9. [🔄 Migration & Compatibility](#-migration--compatibility)
10. [❓ FAQ & Troubleshooting](#-faq--troubleshooting)

---

## 🚀 **Quick Start**

### Installation
```bash
npm install react-fusion-state
# or
yarn add react-fusion-state
```

**🎯 Zero Dependencies:** React Fusion State is completely self-contained with no external dependencies!

### Basic Usage
```jsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

// 1. Wrap your app
function App() {
  return (
    <FusionStateProvider>
      <Counter />
      <UserProfile />
    </FusionStateProvider>
  );
}

// 2. Use global state anywhere
function Counter() {
  const [count, setCount] = useFusionState('count', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

function UserProfile() {
  const [count] = useFusionState('count', 0); // Same state!
  return <div>Counter value from another component: {count}</div>;
}
```

---

## 🎛️ **Core API**

### `FusionStateProvider`

The provider component that enables global state management.

```jsx
<FusionStateProvider
  initialState={{}}        // Optional: initial state values
  debug={false}           // Optional: enable debug logging
  persistence={false}     // Optional: enable state persistence
>
  <App />
</FusionStateProvider>
```

**Props:**
- `initialState?: object` - Initial values for state keys
- `debug?: boolean` - Enable console logging (default: `false`)
- `persistence?: boolean | PersistenceConfig` - Persistence configuration

### `useFusionState(key, defaultValue)`

Hook for accessing and updating global state.

```jsx
const [value, setValue] = useFusionState('keyName', defaultValue);
```

**Parameters:**
- `key: string` - Unique identifier for the state value
- `defaultValue: any` - Default value if key doesn't exist

**Returns:**
- `[value, setValue]` - Current value and setter function (same as `useState`)

#### **Hook Aliases**
For better semantic clarity, you can use these aliases:
```jsx
import { 
  useFusionState,      // Original name
  useSharedState,      // When sharing between components
  usePersistentState,  // When emphasizing persistence
  useAppState,         // For app-level state
} from 'react-fusion-state';

// All are identical - use what makes sense for your project
const [theme, setTheme] = useSharedState('theme', 'light');
const [user, setUser] = usePersistentState('user', null);
const [config, setConfig] = useAppState('config', {});
```


**Example:**
```jsx
function TodoList() {
  const [todos, setTodos] = useFusionState('todos', []);
  const [filter, setFilter] = useFusionState('filter', 'all');
  
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };
  
  return (
    <div>
      <input onKeyPress={(e) => e.key === 'Enter' && addTodo(e.target.value)} />
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      {/* todos and filter are now global state */}
    </div>
  );
}
```

---

## 💾 **Persistence**

React Fusion State uses **granular persistence by default** for better performance and security.

### Basic Persistence

```jsx
// ✅ RECOMMENDED: Granular persistence - only persist specific keys
<FusionStateProvider persistence={['user', 'settings']}>
  <App />
</FusionStateProvider>

// ⚠️ USE WITH CAUTION: Persist all keys (can impact performance)
<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>

// ✅ DEFAULT: No persistence (safest, most performant)
<FusionStateProvider>
  <App />
</FusionStateProvider>
```

### Why Granular Persistence?

1. **🚀 Better Performance** - Only saves data that needs to persist
2. **🔒 More Secure** - Doesn't accidentally persist sensitive data
3. **💾 Smaller Storage** - Reduces localStorage/AsyncStorage usage
4. **🎯 Explicit Control** - You choose exactly what to persist

### Advanced Persistence Configuration

```jsx
import { createLocalStorageAdapter } from 'react-fusion-state';

<FusionStateProvider 
  persistence={{
    adapter: createLocalStorageAdapter(),
    keyPrefix: 'myapp',                    // Storage key prefix
    persistKeys: ['user', 'settings'],     // Only persist specific keys
    debounceTime: 500,                     // Debounce saves (ms)
    onLoadError: (error, key) => {         // Handle load errors
      console.error('Failed to load', key, error);
    },
    onSaveError: (error, state) => {       // Handle save errors
      console.error('Failed to save', error);
    }
  }}
>
  <App />
</FusionStateProvider>
```

### Persistence Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `adapter` | `StorageAdapter` | `detectBestStorageAdapter()` | Storage implementation |
| `keyPrefix` | `string` | `'fusion_state'` | Prefix for storage keys |
| `persistKeys` | `string[] \| function` | All keys | Which keys to persist |
| `debounceTime` | `number` | `0` | Delay before saving (ms) |
| `onLoadError` | `function` | `undefined` | Error callback for loading |
| `onSaveError` | `function` | `undefined` | Error callback for saving |

---

## ⚡ **Performance Options**

### Shallow Comparison

For optimal performance with large objects, use the `shallow` option:

```jsx
import { useFusionState } from 'react-fusion-state';

function UserProfile() {
  const [user, setUser] = useFusionState('user', {
    name: 'John',
    email: 'john@example.com',
    preferences: { theme: 'dark', lang: 'en' },
    history: [...], // Large array
    metadata: {...} // Large object
  }, { shallow: true }); // ← Shallow comparison

  // Only re-renders if top-level properties change
  return <div>{user.name}</div>;
}
```

### When to Use Shallow vs Deep

| **Use Shallow** | **Use Deep (default)** |
|----------------|------------------------|
| ✅ Large objects (50+ properties) | ✅ Small objects (< 10 properties) |
| ✅ Only top-level changes | ✅ Nested object changes |
| ✅ Performance-critical components | ✅ Precise change detection needed |
| ✅ Objects with arrays/nested objects | ✅ Simple data structures |

### Performance Impact

```jsx
// ❌ Without shallow: O(n) recursive comparison
const bigObject = { /* 200+ properties */ };

// ✅ With shallow: O(1) top-level comparison
useFusionState('big', bigObject, { shallow: true });
```

**Result:** Up to 100x faster comparison on large objects.

### SSR Support

React Fusion State now provides perfect SSR compatibility:

```jsx
// ✅ No hydration mismatches
// ✅ Works with Next.js, Gatsby, etc.
// ✅ Automatic server/client state sync
```

---

## 🌐 **Platform Support**

### React.js (Web) — React 18+

```jsx
import { FusionStateProvider } from 'react-fusion-state';

<FusionStateProvider persistence>
  <App />
</FusionStateProvider>
```
- **Storage:** localStorage
- **SSR:** Supported (Next.js, Nuxt, etc.)
- **Bundle Size:** ~7KB

### React Native

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FusionStateProvider, createAsyncStorageAdapter } from 'react-fusion-state';

<FusionStateProvider 
  persistence={{
    adapter: createAsyncStorageAdapter(AsyncStorage)
  }}
>
  <App />
</FusionStateProvider>
```

**Required dependency:**
```bash
npm install @react-native-async-storage/async-storage
```

### Expo

Same as React Native - works out of the box with Expo's AsyncStorage.

### Next.js (SSR)

```jsx
<FusionStateProvider 
  persistence={typeof window !== 'undefined'} // Only on client
>
  <App />
</FusionStateProvider>
```

### Concurrency Safety (React 18+)
- Internally uses `useSyncExternalStore` with per-key subscriptions to avoid tearing and isolate re-renders.
- Public API unchanged.

---

## 🔧 **Advanced Configuration**

### Custom Storage Adapter

```jsx
const customAdapter = {
  async getItem(key) {
    return await myCustomStorage.get(key);
  },
  async setItem(key, value) {
    await myCustomStorage.set(key, value);
  },
  async removeItem(key) {
    await myCustomStorage.delete(key);
  },
  // Optional: for instant loading
  getItemSync(key) {
    return myCustomStorage.getSync(key);
  }
};

<FusionStateProvider persistence={{ adapter: customAdapter }}>
  <App />
</FusionStateProvider>
```

### Selective Persistence

```jsx
// Array of keys
persistence={{
  persistKeys: ['user', 'settings', 'preferences']
}}

// Function filter
persistence={{
  persistKeys: (key) => key.startsWith('persist.')
}}
```

### Debug Mode

```jsx
<FusionStateProvider 
  debug={process.env.NODE_ENV === 'development'}
  persistence
>
  <App />
</FusionStateProvider>
```

**Debug output:**
```
[FusionState] State updated: { previous: {...}, next: {...} }
[FusionState] Saved state to storage: {...}
```

---

## 🛠️ **Development Setup**

### For Contributors

If you want to contribute to React Fusion State or run it locally:

```bash
# 1. Clone the repository
git clone https://github.com/jgerard72/react-fusion-state.git
cd react-fusion-state

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Run tests
npm test

# 5. Start development mode (TypeScript watch)
npm run dev
```

### Project Structure
```
react-fusion-state/
├── 📁 src/                    # Source code
│   ├── 📄 index.ts            # Main exports
│   ├── 📄 FusionStateProvider.tsx  # Core provider
│   ├── 📄 useFusionState.ts   # Main hook
│   ├── 📄 types.ts            # TypeScript definitions
│   ├── 📁 storage/            # Storage adapters
│   ├── 📁 examples/           # Usage examples
│   └── 📁 __tests__/          # Test files
├── 📁 demo/                   # Interactive demo
├── 📁 dist/                   # Built files (auto-generated)
└── 📄 package.json            # Dependencies & scripts
```

### Available Scripts
- `npm run build` - Build for production
- `npm run dev` - Development mode (TypeScript watch)
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run format` - Format code with Prettier

### Testing the Demo
```bash
# Open the interactive demo
open demo/demo-persistence.html

# Or serve with a local server
python -m http.server 8000
# Visit: http://localhost:8000/demo/
```

---

## 🧪 **Testing & Demo**

### Interactive Demo

The project includes a complete interactive demo:

**Files:**
- `demo/demo-persistence.html` - Complete working example
- `demo/styles.css` - Modern CSS styling

**Features:**
- ✅ Persistent counter and name input
- ✅ Debug mode toggle
- ✅ Real-time localStorage inspection
- ✅ Responsive design
- ✅ Console logging demonstration

**To run:**
```bash
# Open in browser
open demo/demo-persistence.html

# Or with a local server (recommended)
python -m http.server 8000
# Visit: http://localhost:8000/demo/
```

### Testing Your Implementation

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function TestComponent() {
  const [count, setCount] = useFusionState('count', 0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button data-testid="increment" onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
}

test('global state works', () => {
  render(
    <FusionStateProvider>
      <TestComponent />
    </FusionStateProvider>
  );
  
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  fireEvent.click(screen.getByTestId('increment'));
  expect(screen.getByTestId('count')).toHaveTextContent('1');
});
```

---

## 🔄 **Migration & Compatibility**

### From Redux

```jsx
// Redux
const count = useSelector(state => state.count);
const dispatch = useDispatch();
dispatch({ type: 'INCREMENT' });

// React Fusion State
const [count, setCount] = useFusionState('count', 0);
setCount(count + 1);
```

### From Context API

```jsx
// Context API
const { count, setCount } = useContext(CountContext);

// React Fusion State (same interface!)
const [count, setCount] = useFusionState('count', 0);
```

### From Zustand

```jsx
// Zustand
const count = useStore(state => state.count);
const increment = useStore(state => state.increment);

// React Fusion State
const [count, setCount] = useFusionState('count', 0);
const increment = () => setCount(count + 1);
```

### Backward Compatibility

**✅ 100% Compatible** - All versions maintain backward compatibility.

- **No breaking changes** - Your existing code works unchanged
- **Optional new features** - All improvements are opt-in
- **Zero migration required** - Update safely without code changes

---

## ❓ **FAQ & Troubleshooting**

### Q: State not persisting on page refresh?

**A:** Ensure persistence is properly configured:

```jsx
// ✅ Correct - Granular persistence (RECOMMENDED)
<FusionStateProvider persistence={['user', 'cart']}>

// ✅ Also correct - Persist all (use with caution)
<FusionStateProvider persistence={true}>

// ❌ Wrong - No persistence by default
<FusionStateProvider>
```

### Q: Console spam in production?

**A:** Disable debug mode:

```jsx
// ✅ Production
<FusionStateProvider debug={false}> // or omit (false by default)

// ❌ Development only
<FusionStateProvider debug>
```

### Q: State not shared between components?

**A:** Ensure both components use the same key:

```jsx
// ✅ Same key = shared state
const [user] = useFusionState('currentUser', null);

// ❌ Different keys = separate state
const [user1] = useFusionState('user', null);
const [user2] = useFusionState('currentUser', null);
```

### Q: React Native AsyncStorage not working?

**A:** Install and configure AsyncStorage:

```bash
npm install @react-native-async-storage/async-storage
```

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStorageAdapter } from 'react-fusion-state';

<FusionStateProvider 
  persistence={{ adapter: createAsyncStorageAdapter(AsyncStorage) }}
>
```

### Q: TypeScript type errors?

**A:** The library is TypeScript-first with full type safety:

```tsx
// Types are automatically inferred
const [count, setCount] = useFusionState('count', 0); // number
const [user, setUser] = useFusionState('user', null); // null | User

// Explicit typing
interface User { name: string; email: string; }
const [user, setUser] = useFusionState<User | null>('user', null);
```

### Q: Performance concerns with large state?

**A:** Use selective persistence and consider state structure:

```jsx
// ✅ Good: separate concerns
const [todos] = useFusionState('todos', []);
const [filter] = useFusionState('filter', 'all');

// ⚠️ Avoid: large monolithic state
const [appState] = useFusionState('app', { todos: [], filter: 'all', ... });
```

---

## 🚀 **Best Practices**

### 1. **Key Naming Convention**
```jsx
// ✅ Descriptive keys
useFusionState('currentUser', null);
useFusionState('shoppingCart', []);
useFusionState('userPreferences', {});

// ❌ Generic keys
useFusionState('data', null);
useFusionState('state', {});
```

### 2. **State Structure**
```jsx
// ✅ Flat structure
const [user] = useFusionState('user', null);
const [settings] = useFusionState('settings', {});

// ❌ Nested structure (harder to manage)
const [app] = useFusionState('app', { user: null, settings: {} });
```

### 3. **Persistence Strategy**
```jsx
// ✅ Granular persistence (RECOMMENDED)
persistence={['user', 'settings']} // Only important data

// ✅ Advanced configuration
persistence={{
  persistKeys: ['user', 'settings'],
  debounce: 500 // Avoid excessive writes
}}

// ⚠️ Persist everything (use with caution)
persistence={true}
```

### 4. **Error Handling**
```jsx
persistence={{
  onLoadError: (error, key) => {
    // Handle gracefully, maybe use defaults
    console.warn(`Failed to load ${key}:`, error);
  },
  onSaveError: (error, state) => {
    // Maybe show user notification
    showNotification('Settings could not be saved');
  }
}}
```

---

## 📞 **Support & Contributing**

- **🐛 Issues:** [GitHub Issues](https://github.com/jgerard72/react-fusion-state/issues)
- **💡 Feature Requests:** [GitHub Discussions](https://github.com/jgerard72/react-fusion-state/discussions)
- **📧 Contact:** [LinkedIn](https://www.linkedin.com/in/jgerard)

---

**Happy coding with React Fusion State! 🚀**
