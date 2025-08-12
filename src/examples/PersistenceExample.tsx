import React, {useState} from 'react';
import {
  FusionStateProvider,
  useFusionState,
  createLocalStorageAdapter,
} from '../index';

/**
 * Example of persistent counter
 * This value will be saved and restored automatically
 */
function PersistentCounter() {
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <div style={{border: '1px solid #ccc', padding: '16px', margin: '8px'}}>
      <h3>Persistent Counter</h3>
      <p>
        Current count: <strong>{count}</strong>
      </p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
      <p>
        <em>This value persists across page refreshes!</em>
      </p>
    </div>
  );
}

/**
 * Example of persistent settings
 */
interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
}

function PersistentSettings() {
  const [settings, setSettings] = useFusionState<Settings>('settings', {
    theme: 'light',
    fontSize: 'medium',
    notifications: true,
  });

  const updateTheme = (theme: 'light' | 'dark') => {
    setSettings({...settings, theme});
  };

  const updateFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    setSettings({...settings, fontSize});
  };

  const toggleNotifications = () => {
    setSettings({...settings, notifications: !settings.notifications});
  };

  return (
    <div style={{border: '1px solid #ccc', padding: '16px', margin: '8px'}}>
      <h3>Persistent Settings</h3>

      <div>
        <label>Theme: </label>
        <select
          value={settings.theme}
          onChange={e => updateTheme(e.target.value as any)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label>Font Size: </label>
        <select
          value={settings.fontSize}
          onChange={e => updateFontSize(e.target.value as any)}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={toggleNotifications}
          />
          Enable notifications
        </label>
      </div>

      <p>
        <em>These settings persist across sessions!</em>
      </p>
    </div>
  );
}

/**
 * Example of temporary data (NOT persisted)
 */
function TemporaryData() {
  const [tempData, setTempData] = useFusionState('tempData', {
    searchQuery: '',
    lastUpdated: new Date().toISOString(),
  });

  const updateSearch = (searchQuery: string) => {
    setTempData({
      searchQuery,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div style={{border: '1px solid #orange', padding: '16px', margin: '8px'}}>
      <h3>Temporary Data (NOT Persisted)</h3>
      <div>
        <label>Search: </label>
        <input
          type="text"
          value={tempData.searchQuery}
          onChange={e => updateSearch(e.target.value)}
          placeholder="This won't be saved..."
        />
      </div>
      <p>Last updated: {tempData.lastUpdated}</p>
      <p>
        <em>This data is NOT persisted and will be lost on refresh.</em>
      </p>
    </div>
  );
}

/**
 * Main application with configured persistence
 */
export default function PersistenceApp() {
  // Create localStorage adapter for web
  const storageAdapter = createLocalStorageAdapter();
  // For React Native, use: createAsyncStorageAdapter(AsyncStorage)

  return (
    <FusionStateProvider
      initialState={{
        counter: 0,
        settings: {
          theme: 'light',
          fontSize: 'medium',
          notifications: true,
        },
        tempData: {
          searchQuery: '',
          lastUpdated: new Date().toISOString(),
        },
      }}
      debug={true}
      persistence={{
        adapter: storageAdapter,
        keyPrefix: 'myapp',
        // Only persist counter and settings, NOT tempData
        persistKeys: ['counter', 'settings'],
        debounceTime: 300, // Wait 300ms before saving to reduce writes
        onSaveError: (error, state) => {
          console.error('Failed to save state:', error);
          alert('Failed to save data!');
        },
        onLoadError: (error, key) => {
          console.error('Failed to load state:', key, error);
        },
      }}>
      <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
        <h1>🚀 React Fusion State - Persistence Example</h1>
        <p>
          <strong>Instructions:</strong> Change values below, then refresh the
          page. Persistent data will be restored, temporary data will be lost.
        </p>

        <PersistentCounter />
        <PersistentSettings />
        <TemporaryData />

        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
          }}>
          <h4>💡 How it works:</h4>
          <ul>
            <li>
              <strong>Counter & Settings:</strong> Saved to localStorage with
              key prefix "myapp"
            </li>
            <li>
              <strong>Temporary Data:</strong> Not included in persistKeys, so
              not saved
            </li>
            <li>
              <strong>Debounce:</strong> Saves are delayed by 300ms to reduce
              write operations
            </li>
            <li>
              <strong>Error Handling:</strong> onSaveError and onLoadError
              callbacks handle failures
            </li>
          </ul>
        </div>
      </div>
    </FusionStateProvider>
  );
}
