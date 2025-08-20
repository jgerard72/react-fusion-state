import React from 'react';
import {FusionStateProvider, useFusionState} from '../index';

/**
 * Advanced Persistence Example
 * Demonstrates different persistence strategies and options
 */

interface UserProfile {
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'fr' | 'es';
    notifications: boolean;
  };
}

interface AppSettings {
  version: string;
  lastUpdated: string;
  features: {
    beta: boolean;
    analytics: boolean;
  };
}

// User Profile with immediate persistence
function UserProfileComponent() {
  const [profile, setProfile] = useFusionState<UserProfile>(
    'userProfile',
    {
      name: '',
      email: '',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true,
      },
    },
    {
      persist: true,
      debounceTime: 0, // Save immediately
      debug: true,
      keyPrefix: 'user_data',
    },
  );

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({...prev, ...updates}));
  };

  const updatePreferences = (
    preferences: Partial<UserProfile['preferences']>,
  ) => {
    setProfile(prev => ({
      ...prev,
      preferences: {...prev.preferences, ...preferences},
    }));
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #4CAF50',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
      <h2>👤 User Profile (Immediate Persistence)</h2>
      <p>
        <strong>Saved instantly to localStorage with debug logs</strong>
      </p>

      <div style={{marginBottom: '10px'}}>
        <label>Name: </label>
        <input
          value={profile.name}
          onChange={e => updateProfile({name: e.target.value})}
          placeholder="Enter your name"
          style={{marginLeft: '10px', padding: '5px'}}
        />
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>Email: </label>
        <input
          value={profile.email}
          onChange={e => updateProfile({email: e.target.value})}
          placeholder="Enter your email"
          style={{marginLeft: '10px', padding: '5px'}}
        />
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>Theme: </label>
        <select
          value={profile.preferences.theme}
          onChange={e =>
            updatePreferences({
              theme: e.target.value as UserProfile['preferences']['theme'],
            })
          }
          style={{marginLeft: '10px', padding: '5px'}}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>Language: </label>
        <select
          value={profile.preferences.language}
          onChange={e =>
            updatePreferences({
              language: e.target
                .value as UserProfile['preferences']['language'],
            })
          }
          style={{marginLeft: '10px', padding: '5px'}}>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>
          <input
            type="checkbox"
            checked={profile.preferences.notifications}
            onChange={e => updatePreferences({notifications: e.target.checked})}
          />
          Enable Notifications
        </label>
      </div>

      <pre
        style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
}

// App Settings with debounced persistence
function AppSettingsComponent() {
  const [settings, setSettings] = useFusionState<AppSettings>(
    'appSettings',
    {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      features: {
        beta: false,
        analytics: true,
      },
    },
    {
      persist: true,
      debounceTime: 2000, // Save after 2 seconds of inactivity
      keyPrefix: 'app_config',
      debug: false, // Quiet mode
    },
  );

  const updateFeatures = (features: Partial<AppSettings['features']>) => {
    setSettings(prev => ({
      ...prev,
      features: {...prev.features, ...features},
      lastUpdated: new Date().toISOString(),
    }));
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #2196F3',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
      <h2>⚙️ App Settings (Debounced Persistence)</h2>
      <p>
        <strong>Saved after 2 seconds of inactivity (no debug logs)</strong>
      </p>

      <div style={{marginBottom: '10px'}}>
        <label>Version: </label>
        <input
          value={settings.version}
          onChange={e =>
            setSettings(prev => ({...prev, version: e.target.value}))
          }
          style={{marginLeft: '10px', padding: '5px'}}
        />
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>
          <input
            type="checkbox"
            checked={settings.features.beta}
            onChange={e => updateFeatures({beta: e.target.checked})}
          />
          Enable Beta Features
        </label>
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>
          <input
            type="checkbox"
            checked={settings.features.analytics}
            onChange={e => updateFeatures({analytics: e.target.checked})}
          />
          Enable Analytics
        </label>
      </div>

      <p>
        <small>
          Last updated: {new Date(settings.lastUpdated).toLocaleString()}
        </small>
      </p>

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
  );
}

// Session data without persistence
function SessionDataComponent() {
  const [sessionData, setSessionData] = useFusionState('sessionData', {
    startTime: new Date().toISOString(),
    pageViews: 0,
    currentPage: 'home',
    isActive: true,
  });
  // No persist option = temporary data

  const incrementPageViews = () => {
    setSessionData(prev => ({...prev, pageViews: prev.pageViews + 1}));
  };

  const changePage = (page: string) => {
    setSessionData(prev => ({...prev, currentPage: page}));
    incrementPageViews();
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #FF9800',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
      <h2>📊 Session Data (No Persistence)</h2>
      <p>
        <strong>This data will be lost on page refresh</strong>
      </p>

      <div style={{marginBottom: '10px'}}>
        <label>Current Page: </label>
        <select
          value={sessionData.currentPage}
          onChange={e => changePage(e.target.value)}
          style={{marginLeft: '10px', padding: '5px'}}>
          <option value="home">Home</option>
          <option value="profile">Profile</option>
          <option value="settings">Settings</option>
          <option value="about">About</option>
        </select>
      </div>

      <div style={{marginBottom: '10px'}}>
        <button onClick={incrementPageViews} style={{padding: '5px 10px'}}>
          Increment Page Views
        </button>
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>
          <input
            type="checkbox"
            checked={sessionData.isActive}
            onChange={e =>
              setSessionData(prev => ({...prev, isActive: e.target.checked}))
            }
          />
          Session Active
        </label>
      </div>

      <pre
        style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
        {JSON.stringify(sessionData, null, 2)}
      </pre>
    </div>
  );
}

// Mixed persistence strategies
function MixedPersistenceComponent() {
  // Critical user data - persist immediately
  const [userId, setUserId] = useFusionState('userId', '', {
    persist: true,
    debounceTime: 0,
  });

  // User preferences - debounced persistence
  const [preferences, setPreferences] = useFusionState(
    'userPrefs',
    {
      autoSave: true,
      theme: 'system',
    },
    {persist: true, debounceTime: 1000},
  );

  // Temporary UI state - no persistence
  const [uiState, setUiState] = useFusionState('uiState', {
    sidebarOpen: false,
    modalOpen: false,
    loading: false,
  });

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #9C27B0',
        borderRadius: '8px',
      }}>
      <h2>🔀 Mixed Persistence Strategies</h2>
      <p>
        <strong>
          Different persistence approaches for different data types
        </strong>
      </p>

      <div
        style={{
          display: 'grid',
          gap: '15px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}>
        <div
          style={{
            padding: '10px',
            backgroundColor: '#e8f5e8',
            borderRadius: '4px',
          }}>
          <h4>🔐 Critical Data (Immediate)</h4>
          <input
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="User ID"
            style={{width: '100%', padding: '5px'}}
          />
          <small>Saved immediately</small>
        </div>

        <div
          style={{
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
          }}>
          <h4>⚙️ Preferences (Debounced)</h4>
          <label>
            <input
              type="checkbox"
              checked={preferences.autoSave}
              onChange={e =>
                setPreferences(prev => ({...prev, autoSave: e.target.checked}))
              }
            />
            Auto Save
          </label>
          <br />
          <select
            value={preferences.theme}
            onChange={e =>
              setPreferences(prev => ({...prev, theme: e.target.value}))
            }
            style={{width: '100%', marginTop: '5px', padding: '5px'}}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
          <small>Saved after 1s delay</small>
        </div>

        <div
          style={{
            padding: '10px',
            backgroundColor: '#fff3e0',
            borderRadius: '4px',
          }}>
          <h4>🎨 UI State (Temporary)</h4>
          <label>
            <input
              type="checkbox"
              checked={uiState.sidebarOpen}
              onChange={e =>
                setUiState(prev => ({...prev, sidebarOpen: e.target.checked}))
              }
            />
            Sidebar Open
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={uiState.modalOpen}
              onChange={e =>
                setUiState(prev => ({...prev, modalOpen: e.target.checked}))
              }
            />
            Modal Open
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={uiState.loading}
              onChange={e =>
                setUiState(prev => ({...prev, loading: e.target.checked}))
              }
            />
            Loading
          </label>
          <small>Not persisted</small>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedPersistenceApp() {
  return (
    <FusionStateProvider>
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
        }}>
        <h1 style={{textAlign: 'center', color: '#333', marginBottom: '30px'}}>
          🔑 Advanced Persistence Strategies
        </h1>

        <UserProfileComponent />
        <AppSettingsComponent />
        <SessionDataComponent />
        <MixedPersistenceComponent />

        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
          }}>
          <h2>🧪 Test Instructions</h2>
          <ol>
            <li>
              <strong>Modify values above</strong> and watch the console for
              debug logs
            </li>
            <li>
              <strong>Refresh the page</strong> to see which data persists
            </li>
            <li>
              <strong>Open DevTools</strong> → Application → Local Storage to
              see stored data
            </li>
            <li>
              <strong>Notice different storage keys</strong> based on keyPrefix
              settings
            </li>
          </ol>

          <h3>🔍 What to Observe:</h3>
          <ul>
            <li>
              ✅ <strong>User Profile</strong>: Saves immediately with debug
              logs
            </li>
            <li>
              ✅ <strong>App Settings</strong>: Saves after 2s delay, no logs
            </li>
            <li>
              ❌ <strong>Session Data</strong>: Lost on refresh
            </li>
            <li>
              🔀 <strong>Mixed Strategies</strong>: Different persistence for
              different data types
            </li>
          </ul>
        </div>
      </div>
    </FusionStateProvider>
  );
}
