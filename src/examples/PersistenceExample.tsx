import React, {useState} from 'react';
import {FusionStateProvider, useFusionState} from '../index';
import {StorageAdapter} from '../storage/storageAdapters';

/**
 * Exemple d'adaptateur pour localStorage
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
 * Exemple d'adaptateur pour React Native avec AsyncStorage
 * Vous devez installer @react-native-async-storage/async-storage
 *
 * Décommentez ce code pour l'utiliser dans React Native :
 */
/*
class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      // Importez AsyncStorage depuis le package adapté à votre projet
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

// Composant Counter avec stockage persistant
function PersistentCounter() {
  const [count, setCount] = useFusionState<number>('counter', 0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <p>Ce compteur persiste après rechargement de la page !</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Settings avec stockage persistant mais sélectif
function PersistentSettings() {
  const [settings, setSettings] = useFusionState('settings', {
    theme: 'light',
    fontSize: 'medium',
    notifications: true,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings({...settings, [key]: value});
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <p>Ces paramètres persistent, ils sont inclus dans persistKeys</p>

      <div>
        <label>
          Theme:
          <select
            value={settings.theme}
            onChange={e => updateSetting('theme', e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Font Size:
          <select
            value={settings.fontSize}
            onChange={e => updateSetting('fontSize', e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={e => updateSetting('notifications', e.target.checked)}
          />
          Enable Notifications
        </label>
      </div>
    </div>
  );
}

// Données temporaires - non persistantes
function TemporaryData() {
  const [tempData, setTempData] = useFusionState('tempData', {
    searchQuery: '',
    lastUpdated: new Date().toISOString(),
  });

  const updateSearch = (query: string) => {
    setTempData({
      ...tempData,
      searchQuery: query,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="temp-data">
      <h2>Temporary Data</h2>
      <p>
        Ces données ne persistent pas, car 'tempData' n'est pas dans persistKeys
      </p>

      <input
        type="text"
        value={tempData.searchQuery}
        onChange={e => updateSearch(e.target.value)}
        placeholder="Search query (not persisted)"
      />

      <p>Last Updated: {new Date(tempData.lastUpdated).toLocaleTimeString()}</p>
    </div>
  );
}

// Application principale avec persistance configurée
export default function PersistenceApp() {
  // Créez votre adaptateur de stockage
  const storageAdapter = new LocalStorageAdapter();
  // Pour React Native, utilisez AsyncStorageAdapter

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
        // Uniquement persister counter et settings, pas tempData
        persistKeys: ['counter', 'settings'],
        loadOnInit: true,
        saveOnChange: true,
        debounceTime: 300, // Attend 300ms avant de sauvegarder
      }}>
      <div className="persistence-example">
        <h1>React Fusion State avec Persistence</h1>
        <p>Rafraîchissez la page pour voir les valeurs persister !</p>

        <PersistentCounter />
        <PersistentSettings />
        <TemporaryData />
      </div>
    </FusionStateProvider>
  );
}
