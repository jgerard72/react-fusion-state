import React from 'react';
import {FusionStateProvider, useFusionState} from '../index';

/**
 * Example demonstrating key-level persistence
 * Shows the difference between persistent and non-persistent state
 */

interface User {
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
  };
}

function UserProfile() {
  // ✅ This will be automatically persisted
  const [user, setUser] = useFusionState<User>(
    'user',
    {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'light',
        language: 'en',
      },
    },
    {persist: true}, // ✅ Enable persistence for this key
  );

  // ✅ This will also be persisted (with custom options)
  const [settings, setSettings] = useFusionState(
    'app_settings',
    {
      notifications: true,
      autoSave: true,
      version: '1.0.0',
    },
    {
      persist: true,
      debounceTime: 1000, // Save after 1 second of inactivity
      debug: true, // Enable debug logs
    },
  );

  // ❌ This will NOT be persisted (regular state)
  const [tempData, setTempData] = useFusionState('temp_data', {
    searchQuery: '',
    selectedTab: 0,
    isLoading: false,
  }); // No { persist: true } = no persistence

  return (
    <div style={{padding: '20px', maxWidth: '600px'}}>
      <h2>🔐 Persistent vs Non-Persistent State</h2>

      <div
        style={{
          marginBottom: '30px',
          padding: '15px',
          border: '2px solid #4CAF50',
          borderRadius: '8px',
        }}>
        <h3>✅ Persistent User Data</h3>
        <p>
          <strong>This data survives page refreshes!</strong>
        </p>

        <div style={{marginBottom: '10px'}}>
          <label>Name: </label>
          <input
            value={user.name}
            onChange={e => setUser({...user, name: e.target.value})}
            style={{marginLeft: '10px', padding: '5px'}}
          />
        </div>

        <div style={{marginBottom: '10px'}}>
          <label>Email: </label>
          <input
            value={user.email}
            onChange={e => setUser({...user, email: e.target.value})}
            style={{marginLeft: '10px', padding: '5px'}}
          />
        </div>

        <div style={{marginBottom: '10px'}}>
          <label>Theme: </label>
          <select
            value={user.preferences.theme}
            onChange={e =>
              setUser({
                ...user,
                preferences: {
                  ...user.preferences,
                  theme: e.target.value as 'light' | 'dark',
                },
              })
            }
            style={{marginLeft: '10px', padding: '5px'}}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
          }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div
        style={{
          marginBottom: '30px',
          padding: '15px',
          border: '2px solid #2196F3',
          borderRadius: '8px',
        }}>
        <h3>⚙️ Persistent App Settings</h3>
        <p>
          <strong>
            Custom persistence options (1s debounce, debug enabled)
          </strong>
        </p>

        <div style={{marginBottom: '10px'}}>
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

        <div style={{marginBottom: '10px'}}>
          <label>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={e =>
                setSettings({...settings, autoSave: e.target.checked})
              }
            />
            Auto Save
          </label>
        </div>

        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
          }}>
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>

      <div
        style={{
          padding: '15px',
          border: '2px solid #FF9800',
          borderRadius: '8px',
        }}>
        <h3>❌ Temporary Data (Not Persistent)</h3>
        <p>
          <strong>This data will be lost on page refresh!</strong>
        </p>

        <div style={{marginBottom: '10px'}}>
          <label>Search: </label>
          <input
            value={tempData.searchQuery}
            onChange={e =>
              setTempData({...tempData, searchQuery: e.target.value})
            }
            placeholder="Type something..."
            style={{marginLeft: '10px', padding: '5px'}}
          />
        </div>

        <div style={{marginBottom: '10px'}}>
          <label>Selected Tab: </label>
          <select
            value={tempData.selectedTab}
            onChange={e =>
              setTempData({...tempData, selectedTab: parseInt(e.target.value)})
            }
            style={{marginLeft: '10px', padding: '5px'}}>
            <option value={0}>Home</option>
            <option value={1}>Profile</option>
            <option value={2}>Settings</option>
          </select>
        </div>

        <div style={{marginBottom: '10px'}}>
          <button
            onClick={() =>
              setTempData({...tempData, isLoading: !tempData.isLoading})
            }
            style={{padding: '5px 10px'}}>
            Toggle Loading: {tempData.isLoading ? 'ON' : 'OFF'}
          </button>
        </div>

        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
          }}>
          {JSON.stringify(tempData, null, 2)}
        </pre>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
        }}>
        <h3>🧪 Test Instructions</h3>
        <ol>
          <li>
            <strong>Modify the values above</strong>
          </li>
          <li>
            <strong>Refresh the page</strong> (F5 or Ctrl+R)
          </li>
          <li>
            <strong>Observe:</strong>
            <ul>
              <li>
                ✅ User data and settings are <strong>restored</strong>
              </li>
              <li>
                ❌ Temporary data is <strong>reset</strong>
              </li>
            </ul>
          </li>
        </ol>
        <p>
          <em>
            Check the browser console to see debug logs for the settings
            persistence!
          </em>
        </p>
      </div>
    </div>
  );
}

function ComparisonExample() {
  // Example showing different persistence approaches
  const [globalPersistent] = useFusionState(
    'persist.global_data',
    'I am global persistent',
  );
  const [keyPersistent] = useFusionState('key_data', 'I am key persistent', {
    persist: true,
  });
  const [notPersistent] = useFusionState('temp_data', 'I am not persistent');

  return (
    <div style={{padding: '20px', maxWidth: '600px'}}>
      <h2>🔄 Persistence Comparison</h2>

      <div style={{display: 'grid', gap: '15px', gridTemplateColumns: '1fr'}}>
        <div
          style={{
            padding: '10px',
            border: '1px solid #4CAF50',
            borderRadius: '4px',
          }}>
          <h4>✅ Global Persistence (via Provider)</h4>
          <p>
            Key: <code>persist.global_data</code>
          </p>
          <p>
            Value: <strong>{globalPersistent}</strong>
          </p>
          <small>Uses provider's persistence config</small>
        </div>

        <div
          style={{
            padding: '10px',
            border: '1px solid #2196F3',
            borderRadius: '4px',
          }}>
          <h4>✅ Key-Level Persistence (Independent)</h4>
          <p>
            Key: <code>key_data</code>
          </p>
          <p>
            Value: <strong>{keyPersistent}</strong>
          </p>
          <small>Independent of provider config</small>
        </div>

        <div
          style={{
            padding: '10px',
            border: '1px solid #FF9800',
            borderRadius: '4px',
          }}>
          <h4>❌ No Persistence</h4>
          <p>
            Key: <code>temp_data</code>
          </p>
          <p>
            Value: <strong>{notPersistent}</strong>
          </p>
          <small>Lost on page refresh</small>
        </div>
      </div>
    </div>
  );
}

export default function PersistentKeyApp() {
  return (
    <FusionStateProvider
      persistence={['persist.global_data']} // Only persist keys starting with 'persist.'
      debug={false}>
      <div style={{fontFamily: 'Arial, sans-serif'}}>
        <h1 style={{textAlign: 'center', color: '#333'}}>
          🔐 React Fusion State - Key-Level Persistence
        </h1>

        <UserProfile />

        <hr style={{margin: '40px 0'}} />

        <ComparisonExample />

        <div
          style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
          }}>
          <h3>🎯 Key Benefits</h3>
          <ul style={{textAlign: 'left', display: 'inline-block'}}>
            <li>
              <strong>Granular Control:</strong> Choose exactly which keys to
              persist
            </li>
            <li>
              <strong>Independent:</strong> Works without provider configuration
            </li>
            <li>
              <strong>Optimized:</strong> Debounced saves, intelligent
              comparison
            </li>
            <li>
              <strong>Flexible:</strong> Custom storage adapters and options
            </li>
            <li>
              <strong>Type Safe:</strong> Full TypeScript support
            </li>
          </ul>
        </div>
      </div>
    </FusionStateProvider>
  );
}
