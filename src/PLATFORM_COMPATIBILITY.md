# 🚀 Platform Compatibility Guide v1.0.0

React Fusion State v1.0.0 targets **React 18+** and works seamlessly across **React.js**, **React Native**, and **Expo** applications with **zero dependencies** and ultra-simple API.

## ✅ Platform Support Matrix

| Platform | Status | Default storage | Secure storage | Sync Loading | Error Callbacks |
|----------|--------|-----------------|----------------|--------------|-----------------|
| **React.js (Web)** | ✅ Full (React 18+) | localStorage | ⚠️ Web Crypto in user-land | ✅ Yes | ✅ Yes |
| **React Native** | ✅ Full | AsyncStorage | ✅ via custom adapter ([recipes](#-secure-storage-mobile)) | ❌ Async only | ✅ Yes |
| **Expo** | ✅ Full | AsyncStorage | ✅ via `expo-secure-store` ([recipe](#-secure-storage-mobile)) | ❌ Async only | ✅ Yes |
| **Next.js (SSR)** | ✅ Full | Memory/localStorage | n/a | ✅ Yes | ✅ Yes |

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
  // Simple granular persistence (RECOMMENDED)
  return (
    <FusionStateProvider persistence={['user', 'settings']}>
      <MyApp />
    </FusionStateProvider>
  );
}

// Advanced configuration with custom adapter
function AppWithCustomAdapter() {
  const storageAdapter = createLocalStorageAdapter();
  
  return (
    <FusionStateProvider
      persistence={{
        adapter: storageAdapter,
        persistKeys: ['user', 'settings'],
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
- ✅ Automatic persistence handling
- ✅ Error handling with callbacks
- ✅ Auto-detection of React Native environment
- ✅ Ultra-simple API with performance optimization

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
        debounceTime: 300,
      }}
    >
      <MyExpoApp />
    </FusionStateProvider>
  );
}
```

---

## 🔐 Secure Storage (mobile)

The default adapters (`AsyncStorage` on RN/Expo, `localStorage` on web) **do not encrypt at rest**. For auth tokens, refresh tokens, PII or anything that must survive a `chrome://settings` / `adb shell run-as` inspection, plug in a secure backend through the `StorageAdapter` contract.

### ✅ Supported via custom adapters

| Library | Stack | Backend | Biometrics | Notes |
|---------|-------|---------|------------|-------|
| `expo-secure-store` | Expo | iOS Keychain + Android EncryptedSharedPreferences | ❌ | ~2 KB / value, restricted key charset |
| `react-native-encrypted-storage` | Bare RN | iOS Keychain + Android EncryptedSharedPreferences | ❌ | API already aligned on AsyncStorage |
| `react-native-keychain` | Bare RN / Expo | iOS Keychain + Android Keystore | ✅ | Per-key biometric prompts |
| `react-native-mmkv` (with encryption key) | Bare RN | Encrypted MMKV | ❌ | Fastest option, sync API |

### 📖 Ready-to-copy recipes

The 4 mobile recipes (Expo SecureStore wrapper, EncryptedStorage one-liner, Keychain wrapper with biometrics, and the **split-sensitive-/-non-sensitive multi-store pattern**) live in the main README:

→ [**Custom Storage Adapters**](../README.md#-custom-storage-adapters-secure-storage-mmkv-)

### 🧠 Architectural recommendation

For any production mobile app with authentication, use **two `createStore()` instances**:

1. A `secureStore` wired to SecureStore / Keychain / EncryptedStorage — persists tokens, refresh tokens, biometric keys.
2. An `appStore` wired to AsyncStorage — persists theme, language, last route, cache.

This keeps the secure backend's quota and write cost contained, gives each store its own `debounceTime` and error callbacks, and makes every call site greppable (`secureStore.useFusionState(...)` is self-documenting).

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
2. **Use Fixed Prefix**: All keys use 'fusion_state' prefix automatically
3. **Handle Errors Gracefully**: Always provide fallback behavior
4. **Optimize for Platform**: Use debouncing on mobile, immediate saves on web
5. **Test Thoroughly**: Test persistence across app restarts and platform-specific scenarios

---

## 📚 Examples

- **Web Example**: `src/examples/PersistenceExample.tsx`
- **React Native Example**: `src/examples/ReactNativeExample.tsx`
- **Live Demo**: `demo/demo-persistence.html`

React Fusion State makes cross-platform state persistence simple and reliable! 🎉
