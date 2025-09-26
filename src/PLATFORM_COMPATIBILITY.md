# 🚀 Platform Compatibility Guide v0.4.22

React Fusion State v0.4.22 targets **React 18+** and works seamlessly across **React.js**, **React Native**, and **Expo** applications with **zero dependencies**, full persistence support, and new **useFusionHydrated()** hook for hydration tracking.

## ✅ Platform Support Matrix

| Platform | Status | Storage | Sync Loading | Error Callbacks |
|----------|--------|---------|--------------|-----------------|
| **React.js (Web)** | ✅ Full (React 18+) | localStorage | ✅ Yes | ✅ Yes |
| **React Native** | ✅ Full | AsyncStorage | ❌ Async only | ✅ Yes |
| **Expo** | ✅ Full | AsyncStorage | ❌ Async only | ✅ Yes |
| **Next.js (SSR)** | ✅ Full | Memory/localStorage | ✅ Yes | ✅ Yes |

---

## 🌐 React.js (Web Applications)

### ✅ **Fully Supported Features:**
- ✅ localStorage persistence
- ✅ Synchronous loading (instant state restoration)
- ✅ Error handling with callbacks
- ✅ Auto-detection of storage capabilities

### 📝 **Usage Example:**
```typescript
import { FusionStateProvider, createLocalStorageAdapter } from 'react-fusion-state';

function App() {
  const storageAdapter = createLocalStorageAdapter();
  
  return (
    <FusionStateProvider
      persistence={{
        adapter: storageAdapter,
        persistKeys: ['user', 'settings'],
        keyPrefix: 'myapp',
        onSaveError: (error, state) => console.error('Save error:', error),
        onLoadError: (error, key) => console.error('Load error:', error),
      }}
    >
      <MyApp />
    </FusionStateProvider>
  );
}
```

---

## 📱 React Native Applications

### ✅ **Fully Supported Features:**
- ✅ AsyncStorage persistence
- ✅ Asynchronous loading
- ✅ **NEW v0.4.22:** `useFusionHydrated()` hook for hydration status
- ✅ Error handling with callbacks
- ✅ Auto-detection of React Native environment
- ✅ Object.is performance optimization and batched updates

### 📦 **Required Dependencies:**
```bash
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage
```

### 📝 **Usage Example:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FusionStateProvider, createAsyncStorageAdapter } from 'react-fusion-state';

function App() {
  const asyncStorageAdapter = createAsyncStorageAdapter(AsyncStorage);
  
  return (
    <FusionStateProvider
      persistence={{
        adapter: asyncStorageAdapter,
        persistKeys: ['user', 'settings'],
        keyPrefix: 'MyReactNativeApp',
        debounceTime: 500, // Recommended for mobile
        onSaveError: (error, state) => {
          console.error('Save error:', error);
          // Show user notification
        },
        onLoadError: (error, key) => {
          console.error('Load error for', key, ':', error);
        },
      }}
      debug={__DEV__} // Enable debug only in development
    >
      <MyApp />
    </FusionStateProvider>
  );
}
```

---

## 🎯 Expo Applications

### ✅ **Fully Supported Features:**
- ✅ AsyncStorage persistence (same as React Native)
- ✅ Asynchronous loading
- ✅ Error handling with callbacks
- ✅ Works with Expo Go and standalone builds

### 📦 **Required Dependencies:**
```bash
expo install @react-native-async-storage/async-storage
```

### 📝 **Usage Example:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FusionStateProvider, createAsyncStorageAdapter } from 'react-fusion-state';

export default function App() {
  const asyncStorageAdapter = createAsyncStorageAdapter(AsyncStorage);
  
  return (
    <FusionStateProvider
      persistence={{
        adapter: asyncStorageAdapter,
        persistKeys: ['userPreferences', 'gameState'],
        keyPrefix: 'MyExpoApp',
        debounceTime: 300,
      }}
    >
      <MyExpoApp />
    </FusionStateProvider>
  );
}
```

---

## 🔧 Auto-Detection & Concurrency (React 18+)

React Fusion State automatically detects the platform and suggests the appropriate storage:

```typescript
import { detectBestStorageAdapter } from 'react-fusion-state';

// Automatically chooses the best adapter for your platform:
const adapter = detectBestStorageAdapter();

// Web → localStorage
// React Native/Expo → NoopAdapter (with console warning to use AsyncStorage)
// SSR → NoopAdapter (memory-only)

Internally, subscriptions are per key using `useSyncExternalStore` (React 18), which isolates re-renders and avoids tearing.
```

---

## 🚨 Important Notes

### **React Native & Expo Considerations:**

1. **No Synchronous Loading**: AsyncStorage is inherently asynchronous, so there's a brief moment where default values are shown before persisted data loads.

2. **Debounce Recommended**: Mobile devices benefit from debounced saves to reduce storage operations:
   ```typescript
   persistence: {
     debounceTime: 500, // Wait 500ms before saving
   }
   ```

3. **Error Handling**: Always implement error callbacks for production apps:
   ```typescript
   persistence: {
     onSaveError: (error, state) => {
       // Log to crash reporting service
       // Show user-friendly message
     },
     onLoadError: (error, key) => {
       // Handle gracefully
     },
   }
   ```

### **Web Considerations:**

1. **localStorage Limits**: Most browsers limit localStorage to 5-10MB per origin.

2. **Private Browsing**: Some browsers disable localStorage in private mode - our adapter handles this gracefully.

3. **SSR Compatibility**: Automatically detects server-side rendering and uses memory-only storage.

---

## 🧪 Testing Your Implementation

### **Web Testing:**
1. Change state values
2. Refresh the page
3. Values should persist immediately

### **React Native/Expo Testing:**
1. Change state values
2. Close and reopen the app
3. Values should restore (may take a moment)

### **Cross-Platform Testing:**
```typescript
// Enable debug mode to see persistence logs
<FusionStateProvider debug ...>
```

---

## 💡 Best Practices

1. **Choose Appropriate Keys**: Only persist data that should survive app restarts
2. **Use Key Prefixes**: Avoid conflicts with other apps/libraries
3. **Handle Errors Gracefully**: Always provide fallback behavior
4. **Optimize for Platform**: Use debouncing on mobile, immediate saves on web
5. **Test Thoroughly**: Test persistence across app restarts and platform-specific scenarios

---

## 📚 Examples

- **Web Example**: `src/examples/PersistenceExample.tsx`
- **React Native Example**: `src/examples/ReactNativeExample.tsx`
- **Live Demo**: `demo/demo-persistence.html`

React Fusion State makes cross-platform state persistence simple and reliable! 🎉
