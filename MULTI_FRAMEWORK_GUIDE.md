# 🌐 Multi-Framework Guide: React Fusion State

Welcome to the new multi-framework architecture of React Fusion State! This library now supports **React**, **Vue.js**, and **Angular** with the same powerful state management capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [React Usage](#react-usage)
- [Vue.js Usage](#vuejs-usage)
- [Angular Usage](#angular-usage)
- [Core API](#core-api)
- [Migration Guide](#migration-guide)
- [Performance](#performance)
- [Examples](#examples)

## 🎯 Overview

### Architecture

The new architecture consists of three layers:

1. **Framework-Agnostic Core** (`src/core/`)
   - Pure TypeScript/JavaScript logic
   - No framework dependencies
   - Universal state management

2. **Framework Adapters** (`src/adapters/`)
   - React: Hooks and Context API
   - Vue: Composables and Plugin
   - Angular: Services and RxJS

3. **Storage Layer** (`src/storage/`)
   - Universal storage adapters
   - Works across all frameworks

### Benefits

- ✅ **Same API** across all frameworks
- ✅ **Shared state** between different framework components
- ✅ **Universal persistence** with the same storage adapters
- ✅ **Performance optimized** for each framework
- ✅ **Full backward compatibility** for React users

## 📦 Installation

```bash
npm install react-fusion-state
# or
yarn add react-fusion-state
```

## ⚛️ React Usage

### Basic Setup (Unchanged - Full Backward Compatibility)

```tsx
import React from 'react';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function App() {
  return (
    <FusionStateProvider 
      debug={true}
      persistence={true}
    >
      <Counter />
    </FusionStateProvider>
  );
}

function Counter() {
  const [count, setCount] = useFusionState('count', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

### New React API (Optional)

```tsx
import { ReactAdapter } from 'react-fusion-state';

const { FusionStateProvider, useFusionState } = ReactAdapter;

// Same usage as above, but explicitly using the adapter
```

## 🟢 Vue.js Usage

### Setup

```typescript
// main.ts
import { createApp } from 'vue';
import { FusionStatePlugin } from 'react-fusion-state/adapters/vue';
import App from './App.vue';

const app = createApp(App);

app.use(FusionStatePlugin, {
  debug: true,
  persistence: true,
  initialState: {
    count: 0
  }
});

app.mount('#app');
```

### Using in Components

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup lang="ts">
import { useFusionState } from 'react-fusion-state/adapters/vue';

const [count, setCount] = useFusionState('count', 0);

const increment = () => setCount(c => c + 1);
const decrement = () => setCount(c => c - 1);
</script>
```

### Advanced Vue Usage

```vue
<script setup lang="ts">
import { 
  useFusionState,
  useFusionStateManager,
  watchFusionState 
} from 'react-fusion-state/adapters/vue';

// Basic state
const [user, setUser] = useFusionState('user', { name: '', email: '' });

// Performance mode (shallow reactivity)
const [settings, setSettings] = useFusionState('settings', {}, { shallow: true });

// Direct manager access
const manager = useFusionStateManager();

// Watch state changes
watchFusionState('count', (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});
</script>
```

## 🅰️ Angular Usage

### Module Setup

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { FusionStateModule } from 'react-fusion-state/adapters/angular';

@NgModule({
  imports: [
    FusionStateModule.forRoot({
      debug: true,
      persistence: true,
      initialState: {
        count: 0
      }
    })
  ]
})
export class AppModule {}
```

### Using in Components

```typescript
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FusionStateService } from 'react-fusion-state/adapters/angular';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <p>Count: {{ count$ | async }}</p>
      <button (click)="increment()">+</button>
      <button (click)="decrement()">-</button>
    </div>
  `
})
export class CounterComponent {
  count$: Observable<number>;

  constructor(private fusionState: FusionStateService) {
    this.count$ = this.fusionState.select<number>('count', 0);
  }

  increment() {
    const currentCount = this.fusionState.getValue<number>('count') || 0;
    this.fusionState.setValue('count', currentCount + 1);
  }

  decrement() {
    const currentCount = this.fusionState.getValue<number>('count') || 0;
    this.fusionState.setValue('count', currentCount - 1);
  }
}
```

### Advanced Angular Usage

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FusionStateService, StateValue } from 'react-fusion-state/adapters/angular';

@Component({...})
export class AdvancedComponent implements OnInit, OnDestroy {
  // Get complete state value with observable and updater
  userState: StateValue<User>;

  constructor(private fusionState: FusionStateService) {
    this.userState = this.fusionState.getStateValue('user', { name: '', email: '' });
  }

  updateUser() {
    this.userState.update(prev => ({ ...prev, name: 'John Doe' }));
  }

  // Batch updates
  batchUpdate() {
    this.fusionState.batchUpdate({
      'user.name': 'Jane Doe',
      'user.email': 'jane@example.com',
      'lastUpdated': new Date().toISOString()
    });
  }
}
```

## 🔧 Core API

### Direct Core Usage (Framework-Agnostic)

```typescript
import { FusionStateManager } from 'react-fusion-state/core';

// Create manager
const manager = new FusionStateManager({
  debug: true,
  initialState: { count: 0 }
});

// Configure persistence
manager.configurePersistence({
  adapter: createLocalStorageAdapter(),
  persistKeys: ['count', 'user'],
  keyPrefix: 'my_app'
});

// Use the manager
manager.setState('count', 1);
const count = manager.getState('count');

// Subscribe to changes
const unsubscribe = manager.subscribe('count', (newValue, oldValue) => {
  console.log(`Count: ${oldValue} → ${newValue}`);
});
```

## 📈 Performance

### Bundle Sizes

| Framework | Bundle Size | Comparison |
|-----------|-------------|------------|
| React     | 5-7KB      | Same or smaller |
| Vue       | 5-7KB      | Optimized for Vue reactivity |
| Angular   | 6-8KB      | Includes RxJS optimizations |
| Core Only | 3-4KB      | Pure logic, no framework deps |

### Performance Features

- **Tree Shaking**: Only import what you use
- **Framework Optimizations**: Each adapter is optimized for its framework
- **Lazy Loading**: Load adapters on demand
- **Memory Efficient**: Shared core, minimal overhead

## 🔄 Migration Guide

### For Existing React Users

**No changes required!** Your existing code will work exactly the same:

```tsx
// This still works exactly the same
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

// Your existing components are unchanged
function MyComponent() {
  const [state, setState] = useFusionState('key', initialValue);
  return <div>{state}</div>;
}
```

### Gradual Migration

If you want to adopt the new architecture gradually:

```tsx
// Option 1: Keep using the main export (recommended)
import { useFusionState } from 'react-fusion-state';

// Option 2: Explicitly use the React adapter
import { useFusionState } from 'react-fusion-state/adapters/react';

// Option 3: Use the core directly (advanced)
import { FusionStateManager } from 'react-fusion-state/core';
```

## 📚 Examples

### Cross-Framework State Sharing

```typescript
// Shared state configuration
const sharedConfig = {
  initialState: {
    currentUser: { id: 1, name: 'John Doe' },
    theme: 'dark',
    'persist.preferences': { language: 'en' }
  },
  persistence: {
    persistKeys: (key: string) => key.startsWith('persist.'),
    keyPrefix: 'my_app'
  }
};

// React app
const ReactApp = () => (
  <FusionStateProvider {...sharedConfig}>
    <ReactComponent />
  </FusionStateProvider>
);

// Vue app
const vueApp = createApp(VueComponent);
vueApp.use(FusionStatePlugin, sharedConfig);

// Angular app
@NgModule({
  imports: [FusionStateModule.forRoot(sharedConfig)]
})
export class AppModule {}
```

### Micro-Frontend Architecture

```typescript
// Shared state manager across micro-frontends
import { FusionStateManager } from 'react-fusion-state/core';

// Create shared manager
window.sharedStateManager = new FusionStateManager({
  initialState: { user: null, theme: 'light' }
});

// React micro-frontend
const ReactMicroFrontend = () => {
  const manager = window.sharedStateManager;
  // Use manager directly or wrap with React adapter
};

// Vue micro-frontend
const vueApp = createApp(VueComponent);
vueApp.provide(FUSION_STATE_MANAGER_KEY, window.sharedStateManager);

// Angular micro-frontend
@NgModule({
  providers: [
    { provide: FUSION_STATE_MANAGER, useValue: window.sharedStateManager }
  ]
})
export class MicroFrontendModule {}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Manager not found" errors**: Ensure you've set up the provider/plugin correctly
2. **State not persisting**: Check your persistence configuration and storage adapter
3. **TypeScript errors**: Make sure you're importing from the correct adapter path

### Debug Mode

Enable debug mode to see what's happening:

```typescript
// React
<FusionStateProvider debug={true}>

// Vue
app.use(FusionStatePlugin, { debug: true });

// Angular
FusionStateModule.forRoot({ debug: true })
```

## 🤝 Contributing

The new multi-framework architecture makes it easier to:

- Add new framework adapters
- Fix bugs in the core (benefits all frameworks)
- Add features universally
- Maintain consistency across frameworks

## 📄 License

MIT License - see LICENSE.md for details.

---

**Happy coding with React Fusion State! 🚀**

Now supporting React, Vue.js, and Angular with the same powerful state management experience.
