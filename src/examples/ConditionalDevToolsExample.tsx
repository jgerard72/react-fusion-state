import React, {useState, useEffect} from 'react';
import {FusionStateProvider} from '../FusionStateProvider';
import {useFusionState} from '../useFusionState';

/**
 * Example showing how to conditionally load devtools only in development
 * This pattern ensures devtools are completely excluded from production builds
 */

const App: React.FC = () => {
  const [count, setCount] = useFusionState('counter', 0);
  const [user, setUser] = useFusionState('user', {
    name: 'John Doe',
    age: 30,
    preferences: {theme: 'light'},
  });

  return (
    <div style={{fontFamily: 'Arial, sans-serif', padding: '20px'}}>
      <h1>Conditional DevTools Example</h1>

      <div style={{marginBottom: '20px'}}>
        <h3>Counter: {count}</h3>
        <button
          onClick={() => setCount(count + 1)}
          style={{marginRight: '10px'}}>
          Increment
        </button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>

      <div style={{marginBottom: '20px'}}>
        <h3>User Profile</h3>
        <p>Name: {user.name}</p>
        <p>Age: {user.age}</p>
        <p>Theme: {user.preferences.theme}</p>
        <button
          onClick={() => setUser(prev => ({...prev, age: prev.age + 1}))}
          style={{marginRight: '10px'}}>
          Age Up
        </button>
        <button
          onClick={() =>
            setUser(prev => ({
              ...prev,
              preferences: {
                ...prev.preferences,
                theme: prev.preferences.theme === 'light' ? 'dark' : 'light',
              },
            }))
          }>
          Toggle Theme
        </button>
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            marginTop: '20px',
          }}>
          <h4 style={{margin: '0 0 10px 0', color: '#2e7d32'}}>
            🛠️ Development Mode
          </h4>
          <p style={{margin: '0', fontSize: '14px', color: '#2e7d32'}}>
            DevTools are loaded! Press <kbd>Ctrl+`</kbd> (or <kbd>Cmd+`</kbd> on
            macOS) to toggle the debug panel.
          </p>
        </div>
      )}
    </div>
  );
};

// DevTools wrapper component that handles visibility state
const DevToolsWrapper: React.FC = () => {
  const [debugVisible, setDebugVisible] = useState(false);
  const [DebugPanel, setDebugPanel] = useState<React.ComponentType<any> | null>(
    null,
  );

  useEffect(() => {
    // Dynamically import devtools only in development
    if (process.env.NODE_ENV !== 'production') {
      import('../devtools')
        .then(({FusionDebugPanel}) => {
          setDebugPanel(() => FusionDebugPanel);
        })
        .catch(error => {
          console.warn('Failed to load devtools:', error);
        });
    }
  }, []);

  if (!DebugPanel) return null;

  return (
    <DebugPanel visible={debugVisible} onVisibilityChange={setDebugVisible} />
  );
};

// Main application component with conditional devtools
const ConditionalDevToolsExample: React.FC = () => {
  return (
    <FusionStateProvider
      persistence
      debug={process.env.NODE_ENV !== 'production'}>
      <App />
      <DevToolsWrapper />
    </FusionStateProvider>
  );
};

export default ConditionalDevToolsExample;

/**
 * Alternative approach using dynamic rendering in your main.tsx/index.tsx:
 *
 * ```tsx
 * import React, { StrictMode, useState, useEffect } from 'react';
 * import { createRoot } from 'react-dom/client';
 * import { FusionStateProvider } from 'react-fusion-state';
 * import App from './App';
 *
 * const root = createRoot(document.getElementById('root')!);
 *
 * // Method 1: Conditional rendering with dynamic import
 * const AppWithDevTools = () => {
 *   const [debugVisible, setDebugVisible] = useState(false);
 *   const [DebugPanel, setDebugPanel] = useState(null);
 *
 *   useEffect(() => {
 *     if (process.env.NODE_ENV !== 'production') {
 *       import('react-fusion-state/devtools')
 *         .then(({ FusionDebugPanel }) => {
 *           setDebugPanel(() => FusionDebugPanel);
 *         });
 *     }
 *   }, []);
 *
 *   return (
 *     <StrictMode>
 *       <FusionStateProvider persistence>
 *         <App />
 *         {DebugPanel && (
 *           <DebugPanel
 *             visible={debugVisible}
 *             onVisibilityChange={setDebugVisible}
 *           />
 *         )}
 *       </FusionStateProvider>
 *     </StrictMode>
 *   );
 * };
 *
 * root.render(<AppWithDevTools />);
 *
 * // Method 2: Conditional rendering at root level
 * if (process.env.NODE_ENV !== 'production') {
 *   import('react-fusion-state/devtools').then(({ FusionDebugPanel }) => {
 *     const DevApp = () => {
 *       const [debugVisible, setDebugVisible] = useState(false);
 *
 *       return (
 *         <StrictMode>
 *           <FusionStateProvider persistence>
 *             <App />
 *             <FusionDebugPanel
 *               visible={debugVisible}
 *               onVisibilityChange={setDebugVisible}
 *             />
 *           </FusionStateProvider>
 *         </StrictMode>
 *       );
 *     };
 *
 *     root.render(<DevApp />);
 *   });
 * } else {
 *   root.render(
 *     <StrictMode>
 *       <FusionStateProvider persistence>
 *         <App />
 *       </FusionStateProvider>
 *     </StrictMode>
 *   );
 * }
 * ```
 */
