import React, {useState} from 'react';
import {FusionStateProvider, useFusionState} from '../index';
import {StorageAdapter} from '../storage/storageAdapters';

/**
 * Example localStorage adapter
 */
class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
}

/**
 * Example React Native adapter with AsyncStorage
 * You need to install @react-native-async-storage/async-storage
 *
 * Uncomment this code to use it in React Native:
 */
/*
class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      // Import AsyncStorage from the package adapted to your project
      // import AsyncStorage from '@react-native-async-storage/async-storage';
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  }
}
*/

// Persistent counter component
function PersistentCounter() {
  const [count, setCount] = useFusionState<number>('counter', 0);

  return (
    <div className="counter">
      <h2>Persistent Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
      <p>This counter value persists between page reloads!</p>
    </div>
  );
}

// Persistent settings component
function PersistentSettings() {
  const [settings, setSettings] = useFusionState<{
    theme: string;
    fontSize: string;
    notifications: boolean;
  }>('settings', {
    theme: 'light',
    fontSize: 'medium',
    notifications: true,
  });

  return (
    <div className="settings">
      <h2>Persistent Settings</h2>

      <div>
        <label>Theme: </label>
        <select
          value={settings.theme}
          onChange={e => setSettings({...settings, theme: e.target.value})}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label>Font Size: </label>
        <select
          value={settings.fontSize}
          onChange={e => setSettings({...settings, fontSize: e.target.value})}>
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
            onChange={e =>
              setSettings({...settings, notifications: e.target.checked})
            }
          />
          Enable Notifications
        </label>
      </div>

      <p>
        Current settings: Theme={settings.theme}, Size={settings.fontSize},
        Notifications={settings.notifications ? 'On' : 'Off'}
      </p>
      <p>These settings persist between page reloads!</p>
    </div>
  );
}

// Temporary data component (not persisted)
function TemporaryData() {
  const [tempData, setTempData] = useFusionState<{
    searchQuery: string;
    lastUpdated: string;
  }>('tempData', {
    searchQuery: '',
    lastUpdated: new Date().toISOString(),
  });

  const updateSearchQuery = (query: string) => {
    setTempData({
      searchQuery: query,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="temp-data">
      <h2>Temporary Data (Not Persisted)</h2>

      <div>
        <label>Search Query: </label>
        <input
          type="text"
          value={tempData.searchQuery}
          onChange={e => updateSearchQuery(e.target.value)}
          placeholder="Type something..."
        />
      </div>

      <p>Search Query: {tempData.searchQuery}</p>
      <p>Last Updated: {new Date(tempData.lastUpdated).toLocaleString()}</p>
      <p>This data does NOT persist between page reloads.</p>
    </div>
  );
}

// Main application with configured persistence
export default function PersistenceApp() {
  // Create your storage adapter
  const storageAdapter = new LocalStorageAdapter();
  // For React Native, use AsyncStorageAdapter

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
        // Only persist counter and settings, not tempData
        persistKeys: ['counter', 'settings'],
        loadOnInit: true,
        saveOnChange: true,
        debounceTime: 300, // Wait 300ms before saving
      }}>
      <div className="persistence-example">
        <h1>React Fusion State with Persistence</h1>
        <p>Refresh the page to see values persist!</p>

        <PersistentCounter />
        <PersistentSettings />
        <TemporaryData />
      </div>
    </FusionStateProvider>
  );
}
