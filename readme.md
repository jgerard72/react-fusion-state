# React Fusion State

Une bibliothèque simple et légère pour gérer l'état global de vos applications React.

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg?style=flat-square)](https://www.npmjs.com/package/react-fusion-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

## Installation

```bash
npm install react-fusion-state
# ou
yarn add react-fusion-state
```

## Fonctionnalités

- 🚀 **Léger et rapide** - Moins de 2KB (minifié + gzippé)
- 🔄 **API familière** - Similaire à useState de React
- 🌐 **État global partagé** - Communication facile entre composants
- 💾 **Persistance automatique** - Sauvegarde optionnelle de l'état
- 📱 **Compatible React Native** - Fonctionne aussi sur mobile

## Utilisation

### 1. Enveloppez votre application avec le provider

```jsx
import { FusionStateProvider } from 'react-fusion-state';

function App() {
  return (
    <FusionStateProvider>
      <VotreApplication />
    </FusionStateProvider>
  );
}
```

### 2. Utilisez l'état global avec useFusionState

```jsx
import { useFusionState } from 'react-fusion-state';

function Compteur() {
  // Fonctionne comme useState, mais partagé globalement
  const [count, setCount] = useFusionState('counter', 0);
  
  return (
    <div>
      <p>Compteur: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

### 3. Accédez au même état depuis n'importe où

```jsx
function Affichage() {
  // Utilise la même valeur 'counter' que le composant Compteur
  const [count] = useFusionState('counter', 0);
  
  return <p>Valeur actuelle: {count}</p>;
}
```

## Options

### Persistance des données

```jsx
// Activez la persistance automatique (localStorage/AsyncStorage)
<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>

// Persister uniquement certaines clés
<FusionStateProvider persistence={['user', 'theme']}>
  <App />
</FusionStateProvider>

// Configuration avancée avec callback personnalisé
<FusionStateProvider 
  persistence={{
    keyPrefix: 'myApp',
    debounce: 500,
    customSaveCallback: async (state, adapter, keyPrefix) => {
      // Logique personnalisée pour sauvegarder l'état
      console.log('Sauvegarde personnalisée:', state);
      await adapter.setItem(`${keyPrefix}_custom`, JSON.stringify(state));
    }
  }}
>
  <App />
</FusionStateProvider>
```

Pour plus de détails sur les options de persistance, consultez [PERSISTENCE.md](./PERSISTENCE.md).

### Mode debug

```jsx
// Activez le mode debug en développement
<FusionStateProvider debug={true}>
  <App />
</FusionStateProvider>
```

## Utilisation avec React Native

React Fusion State fonctionne parfaitement avec React Native sans configuration supplémentaire.

```jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

// Composant de navigation
function NavigationScreen() {
  const [screenData, setScreenData] = useFusionState('navigation.data', {});
  
  // Stockez des données pour d'autres écrans
  const navigateWithData = () => {
    setScreenData({ userId: 123, lastVisited: new Date() });
    // ... puis naviguer vers l'écran suivant
  };
  
  return (
    <View>
      <Button title="Aller à l'écran Profil" onPress={navigateWithData} />
    </View>
  );
}

// Composant profil sur un autre écran
function ProfileScreen() {
  // Accédez aux mêmes données, même sur un autre écran
  const [screenData] = useFusionState('navigation.data', {});
  
  return (
    <View>
      <Text>ID utilisateur: {screenData.userId}</Text>
      <Text>Dernière visite: {screenData.lastVisited?.toString()}</Text>
    </View>
  );
}

// Configuration avec persistance pour survivre aux redémarrages de l'app
export default function App() {
  return (
    <FusionStateProvider 
      persistence={true}  // Utilise automatiquement AsyncStorage sur React Native
      initialState={{
        'app.version': '1.0.0',
        'user.settings': { notifications: true }
      }}
    >
      {/* Votre navigation ou composants ici */}
    </FusionStateProvider>
  );
}
```

### Avantages spécifiques pour React Native

- **Persistance automatique** - Utilise AsyncStorage sans configuration
- **Partage entre écrans** - Évite de passer des props à travers la navigation 
- **État cohérent** - Même après le démontage et remontage d'écrans
- **Performance** - Optimisé pour éviter les re-rendus inutiles sur mobile

## Exemple complet

```jsx
import React from 'react';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

// Composant qui modifie l'état
function ThemeToggle() {
  const [theme, setTheme] = useFusionState('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

// Composant qui utilise l'état
function ThemedComponent() {
  const [theme] = useFusionState('theme', 'light');
  
  return (
    <div style={{ 
      background: theme === 'light' ? '#fff' : '#333',
      color: theme === 'light' ? '#333' : '#fff',
      padding: '20px'
    }}>
      <h2>Thème: {theme}</h2>
    </div>
  );
}

// Application
function App() {
  return (
    <FusionStateProvider 
      initialState={{ version: '1.0' }}
      persistence={true}
      debug={process.env.NODE_ENV === 'development'}
    >
      <div>
        <ThemeToggle />
        <ThemedComponent />
      </div>
    </FusionStateProvider>
  );
}

export default App;
```

## Documentation

- [Guide de persistance](./PERSISTENCE.md) - Options détaillées pour la persistance des données
- [Changelog](./CHANGELOG.md) - Historique des versions et changements
- [Contribuer](./CONTRIBUTING.md) - Guide pour contribuer au projet

## Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus d'informations.

## License

MIT
