import React from 'react';
import {
  FusionStateProvider,
  useFusionState,
  createLocalStorageAdapter,
} from 'react-fusion-state';

interface Settings {
  theme: string;
  fontSize: string;
  notifications: boolean;
}

function PersistentCounter() {
  const [count, setCount] = useFusionState<number>('counter', 0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <p>This counter survives page reloads.</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function PersistentSettings() {
  const [settings, setSettings] = useFusionState<Settings>('settings', {
    theme: 'light',
    fontSize: 'medium',
    notifications: true,
  });

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({...prev, [key]: value}));
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <p>Included in persistKeys — saved on change.</p>
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
      <label>
        Font size:
        <select
          value={settings.fontSize}
          onChange={e => updateSetting('fontSize', e.target.value)}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.notifications}
          onChange={e => updateSetting('notifications', e.target.checked)}
        />
        Enable notifications
      </label>
    </div>
  );
}

function TemporaryData() {
  const [tempData, setTempData] = useFusionState('tempData', {
    searchQuery: '',
    lastUpdated: new Date().toISOString(),
  });

  return (
    <div className="temp-data">
      <h2>Temporary Data</h2>
      <p>Not in persistKeys — cleared on reload.</p>
      <input
        type="text"
        value={tempData.searchQuery}
        onChange={e =>
          setTempData(prev => ({
            ...prev,
            searchQuery: e.target.value,
            lastUpdated: new Date().toISOString(),
          }))
        }
        placeholder="Search query (not persisted)"
      />
      <p>Last updated: {new Date(tempData.lastUpdated).toLocaleTimeString()}</p>
    </div>
  );
}

export default function PersistenceApp() {
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
        adapter: createLocalStorageAdapter(),
        keyPrefix: 'myapp',
        persistKeys: ['counter', 'settings'],
        loadOnInit: true,
        saveOnChange: true,
        debounceTime: 300,
      }}>
      <div className="persistence-example">
        <h1>React Fusion State — Advanced Persistence</h1>
        <p>Reload the page to verify persisted keys.</p>
        <PersistentCounter />
        <PersistentSettings />
        <TemporaryData />
      </div>
    </FusionStateProvider>
  );
}
