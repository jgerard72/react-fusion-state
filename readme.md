# React Fusion State

**The ultimate React state management library with zero dependencies and perfect performance.**

[![npm version](https://badge.fury.io/js/react-fusion-state.svg)](https://www.npmjs.com/package/react-fusion-state)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-fusion-state)](https://bundlephobia.com/package/react-fusion-state)
[![Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](https://www.npmjs.com/package/react-fusion-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Quick Start

```bash
npm install react-fusion-state
```

```jsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function App() {
  return (
    <FusionStateProvider>
      <Counter />
    </FusionStateProvider>
  );
}

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

**That's it!** No boilerplate, no setup, just pure simplicity.

## Why React Fusion State?

### Performance Comparison

| Library | Bundle Size | Dependencies | Re-render Prevention | Object Comparison | Setup Lines |
|---------|-------------|--------------|---------------------|-------------------|-------------|
| **React Fusion State** | **7.2KB** | **0** | **Perfect** | **Smart** | **1** |
| Zustand | 8.1KB | 1 | Good | None | 3 |
| Recoil | 78.4KB | 3+ | Good | None | 8 |
| Redux Toolkit | 135.2KB | 5+ | Poor | None | 18+ |

**Made with ❤️ for the React community by [Jacques GERARD](https://linkedin.com/in/jacques-gerard-dev). Zero dependencies, maximum performance.**
