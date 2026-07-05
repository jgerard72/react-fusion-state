import React from 'react';
import {
  FusionStateProvider,
  useFusionState,
  usePersistentState,
} from 'react-fusion-state';

function ThemePanel() {
  const [theme, setTheme] = useFusionState<'light' | 'dark'>('theme', 'light');

  return (
    <div>
      <h2>Theme: {theme}</h2>
      <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>
        Toggle theme
      </button>
    </div>
  );
}

function SessionBanner() {
  const [draft] = useFusionState<string>('draft', '');

  return (
    <p>
      Draft (not persisted with key list): {draft || '(empty)'}
    </p>
  );
}

/** persistence={['theme']} — persist only listed keys */
export function PersistenceKeyListApp() {
  return (
    <FusionStateProvider persistence={['theme']}>
      <div>
        <h1>Persistence — key list</h1>
        <ThemePanel />
        <SessionBanner />
      </div>
    </FusionStateProvider>
  );
}

function AuthToken() {
  const [token, setToken] = usePersistentState('auth.token', '');

  return (
    <label>
      Token (persisted via persist. prefix):
      <input
        type="text"
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder="Enter token"
      />
    </label>
  );
}

/** persistence={true} — default filter saves keys prefixed with persist. */
export function PersistenceDefaultApp() {
  return (
    <FusionStateProvider persistence={true}>
      <div>
        <h1>Persistence — defaults</h1>
        <AuthToken />
      </div>
    </FusionStateProvider>
  );
}

export default PersistenceKeyListApp;
