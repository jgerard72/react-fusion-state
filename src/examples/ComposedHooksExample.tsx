import React from 'react';
import {
  FusionStateProvider,
  useCounter,
  useToggle,
  useFormState,
  usePersistentState,
} from 'react-fusion-state';

interface SignupForm {
  email: string;
  name: string;
}

function LikesCounter() {
  const [likes, increment] = useCounter('likes', 0);

  return (
    <div>
      <h2>Likes: {likes}</h2>
      <button onClick={increment}>Like</button>
    </div>
  );
}

function SidebarToggle() {
  const [open, toggle] = useToggle('sidebar.open', false);

  return (
    <div>
      <h2>Sidebar: {open ? 'Open' : 'Closed'}</h2>
      <button onClick={toggle}>Toggle sidebar</button>
    </div>
  );
}

function SignupFormPanel() {
  const [form, updateField, resetForm] = useFormState<SignupForm>('signup', {
    email: '',
    name: '',
  });

  return (
    <div>
      <h2>Signup</h2>
      <label>
        Email:
        <input
          value={form.email}
          onChange={e => updateField('email', e.target.value)}
        />
      </label>
      <label>
        Name:
        <input
          value={form.name}
          onChange={e => updateField('name', e.target.value)}
        />
      </label>
      <button onClick={resetForm}>Reset</button>
    </div>
  );
}

function AuthTokenField() {
  const [token, setToken] = usePersistentState('auth.token', '');

  return (
    <label>
      Auth token:
      <input
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder="Saved under persist.auth.token"
      />
    </label>
  );
}

export default function ComposedHooksApp() {
  return (
    <FusionStateProvider persistence={true}>
      <div>
        <h1>Composed Hooks</h1>
        <LikesCounter />
        <SidebarToggle />
        <SignupFormPanel />
        <AuthTokenField />
      </div>
    </FusionStateProvider>
  );
}
