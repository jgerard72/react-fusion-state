// Ce script simple peut être utilisé pour vérifier si la bibliothèque fonctionne correctement
// Pour l'exécuter, vous pouvez utiliser:
// 1. Compiler la bibliothèque: npm run build
// 2. Créer un projet test React: npx create-react-app test-fusion
// 3. Copier ce fichier dans src/App.js du projet test
// 4. Installer la bibliothèque locale: npm install /chemin/vers/react-fusion-state
// 5. Démarrer l'application: npm start

import React, { useState, useEffect } from 'react';
import { FusionStateProvider, useFusionState, useFusionStateLog } from 'react-fusion-state';

// Composant simple pour tester le hook useFusionState
function Counter() {
  const [count, setCount] = useFusionState('counter', 0);
  
  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd' }}>
      <h2>Counter Component</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}

// Un autre composant qui utilise la même clé d'état
function CounterDisplay() {
  const [count] = useFusionState('counter', 0);
  
  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd', backgroundColor: '#f0f0f0' }}>
      <h2>Display Component</h2>
      <p>Shared Count: {count}</p>
    </div>
  );
}

// Composant pour tester le hook useFusionStateLog
function StateDebugger() {
  const state = useFusionStateLog(['counter'], {
    trackChanges: true,
    consoleLog: true
  });
  
  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd', backgroundColor: '#e0f0e0' }}>
      <h2>State Debugger</h2>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

// Composant qui crée un formulaire avec état
function UserForm() {
  const [user, setUser] = useFusionState('user', { name: '', email: '' });
  
  const handleNameChange = (e) => {
    setUser({ ...user, name: e.target.value });
  };
  
  const handleEmailChange = (e) => {
    setUser({ ...user, email: e.target.value });
  };
  
  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd' }}>
      <h2>User Form</h2>
      <div>
        <label>Name: </label>
        <input value={user.name} onChange={handleNameChange} />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label>Email: </label>
        <input value={user.email} onChange={handleEmailChange} />
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => setUser({ name: '', email: '' })}>Reset</button>
      </div>
    </div>
  );
}

// Composant principal de l'application
function App() {
  return (
    <FusionStateProvider initialState={{ theme: 'light' }} debug={true}>
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1>React Fusion State Test</h1>
        <p>Ce test vérifie les fonctionnalités de base de la bibliothèque</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Counter />
          <CounterDisplay />
        </div>
        
        <UserForm />
        <StateDebugger />
        
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9' }}>
          <p>Vérifiez la console pour voir les logs d'état</p>
          <p>Si vous voyez cette page et que les composants interagissent correctement, la bibliothèque fonctionne !</p>
        </div>
      </div>
    </FusionStateProvider>
  );
}

export default App; 