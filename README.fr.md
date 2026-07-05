# react-fusion-state

[![npm version](https://img.shields.io/npm/v/react-fusion-state.svg)](https://www.npmjs.com/package/react-fusion-state)
[![license: MIT](https://img.shields.io/npm/l/react-fusion-state.svg)](https://github.com/jgerard72/react-fusion-state)

> Bibliothèque légère pour l'état global dans React et React Native, avec une API proche de `useState`.

[English](./README.md)

## Pourquoi react-fusion-state ?

- **API proche de `useState`** — tuples `[value, setValue]` et updaters fonctionnels
- **État global** — partage de valeurs entre composants via des clés string
- **Persistance intégrée** — stockage optionnel pour le Web et React Native
- **React + React Native** — mêmes hooks sur les deux plateformes
- **Zéro dépendance runtime** — aucun middleware ni package supplémentaire
- **TypeScript-first** — les types sont inclus dans le package

## Installation

```bash
npm install react-fusion-state
```

Nécessite `react` >= 18. `react-dom` est optionnel (Web uniquement).

```bash
yarn add react-fusion-state
```

## Démarrage rapide

```tsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function Compteur() {
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <button onClick={() => setCount(c => c + 1)}>{count}</button>
  );
}

function App() {
  return (
    <FusionStateProvider>
      <Compteur />
    </FusionStateProvider>
  );
}
```

Tout composant sous le même provider peut lire ou modifier `'counter'` avec `useFusionState('counter', …)`.

## Concepts clés

### Clés globales

L'état est stocké sous des clés string uniques (par ex. `'counter'`, `'user.settings'`). Les composants qui utilisent la même clé partagent une seule valeur.

### Sémantique de la valeur initiale

Le second argument de `useFusionState` initialise la clé **uniquement si elle n'existe pas déjà** dans l'état global. Si un autre composant a déjà initialisé la clé, les appels suivants reçoivent la valeur existante. L'argument initial n'est pas réappliqué à chaque rendu.

### Portée du provider

`<FusionStateProvider>` possède un arbre d'état global. Enveloppez votre application (ou un sous-arbre) une fois. Les hooks doivent être appelés à l'intérieur d'un provider.

## Fonctionnalités

- État global partagé avec une API minimale
- Persistance optionnelle (`localStorage` sur le Web ; adaptateurs sur React Native)
- Journalisation debug pour le développement (prop `debug`)
- Hooks composés pour les cas courants (`useToggle`, `useCounter`, `useFormState`, …)
- Interface `StorageAdapter` pour des backends personnalisés

## Aperçu de l'API

| Export | Type | Description |
| --- | --- | --- |
| `useFusionState` | Hook | S'abonner à une clé globale ; retourne `[value, setValue]` |
| `FusionStateProvider` | Composant | Provider racine de l'état global |
| `useGlobalState` | Hook | Accéder au contexte d'état global complet |
| `useFusionStateLog` | Hook | Observer des portions d'état pour le debug |
| `usePersistentState` | Hook | Comme `useFusionState`, préfixe les clés avec `persist.` |
| `useFrequentState` | Hook | Mises à jour fréquentes avec `skipLocalState: true` |
| `useFormState` | Hook | Objet formulaire avec mise à jour par champ et reset |
| `useCounter` | Hook | Compteur avec incrément, décrément et set |
| `useToggle` | Hook | Booléen avec toggle et set |
| `createLocalStorageAdapter` | Fonction | Adaptateur Web `localStorage` |
| `createMemoryStorageAdapter` | Fonction | Adaptateur mémoire (tests, sessions éphémères) |
| `createNoopStorageAdapter` | Fonction | Adaptateur no-op (fallback SSR) |
| `detectBestStorageAdapter` | Fonction | Choisir le meilleur adaptateur pour le runtime |
| `NoopStorageAdapter` | Fonction | Alias déprécié de `createNoopStorageAdapter` |
| `formatErrorMessage` | Fonction | Remplacer les placeholders dans les messages d'erreur |
| `debounce` | Fonction | Debounce d'une fonction |
| `simpleDeepEqual` | Fonction | Égalité profonde basée sur JSON |
| `FusionStateErrorMessages` | Enum | Modèles de messages d'erreur stables |
| `FusionStateProviderProps` | Type | Props de `FusionStateProvider` |
| `UseFusionStateOptions` | Type | Options par hook (`skipLocalState`, …) |
| `GlobalState` | Type | Type de l'état global |
| `SetStateAction` | Type | Valeur ou fonction updater |
| `StateUpdater` | Type | Setter retourné par `useFusionState` |
| `GlobalFusionStateContextType` | Type | Valeur de contexte de `useGlobalState` |
| `FusionStatePersistenceProp` | Type | Formes acceptées de la prop `persistence` |
| `SimplePersistenceConfig` | Type | Configuration de persistance simplifiée |
| `PersistenceConfig` | Type | Configuration de persistance complète |
| `PersistenceKeys` | Type | Formes de `persistKeys` (config simple) |
| `PersistenceKeysConfig` | Type | Formes de `persistKeys` (config complète) |
| `PersistenceKeyFilter` | Type | Prédicat de filtrage des clés persistées |
| `StorageAdapter` | Type | Interface de backend de stockage |
| `FusionStateLogOptions` | Type | Options de `useFusionStateLog` |
| `FusionStateLogSnapshot` | Type | Snapshot retourné par `useFusionStateLog` |
| `FusionStateLogKey` | Type | Identifiant de clé pour le logging |

## Persistance

La persistance est optionnelle. Passez une prop `persistence` à `FusionStateProvider` :

```jsx
// Activer la persistance avec les valeurs par défaut
<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>

// Persister uniquement certaines clés
<FusionStateProvider persistence={['user', 'theme']}>
  <App />
</FusionStateProvider>
```

Quand `persistence={true}` et qu'aucun filtre de clés n'est configuré, seules les clés préfixées par `persist.` sont sauvegardées par défaut. Utilisez `usePersistentState` ou préfixez vos clés manuellement.

Pour les adaptateurs, le debounce, la sauvegarde/chargement personnalisés et React Native, voir **[PERSISTENCE.md](./PERSISTENCE.md)**.

## TypeScript

Les types sont inclus dans le package publié (`dist/index.d.ts`). Aucune installation `@types/*` n'est nécessaire.

- Inférence générique : `useFusionState('count', 0)` infère `number`
- Génériques explicites : `useFusionState<User>('user', { name: '', email: '' })`
- Props du provider, configuration de persistance et adaptateurs entièrement typés
- Types publics exportés (`StorageAdapter`, `PersistenceConfig`, `StateUpdater`, …) disponibles pour votre code

## React Native

React Fusion State fonctionne avec React Native en utilisant les mêmes hooks et le même provider.

```jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function NavigationScreen() {
  const [screenData, setScreenData] = useFusionState('navigation.data', {});

  const navigateWithData = () => {
    setScreenData({ userId: 123, lastVisited: new Date() });
    // …puis naviguer vers l'écran suivant
  };

  return (
    <View>
      <Button title="Aller à l'écran Profil" onPress={navigateWithData} />
    </View>
  );
}

function ProfileScreen() {
  const [screenData] = useFusionState('navigation.data', {});

  return (
    <View>
      <Text>ID utilisateur: {screenData.userId}</Text>
      <Text>Dernière visite: {screenData.lastVisited?.toString()}</Text>
    </View>
  );
}

export default function App() {
  return (
    <FusionStateProvider
      persistence={true}
      initialState={{
        'app.version': '1.0.0',
        'user.settings': { notifications: true },
      }}
    >
      {/* Votre navigation ou composants ici */}
    </FusionStateProvider>
  );
}
```

### Notes React Native

- **Persistance** — passez un adaptateur de stockage explicitement sur React Native si besoin ; voir [PERSISTENCE.md](./PERSISTENCE.md)
- **Partage entre écrans** — évite de faire transiter les props dans la navigation
- **État stable** — les valeurs survivent au démontage et remontage des écrans dans le même provider

## Exemples

Le dépôt contient des exemples de référence complets pour :

- État global de base
- Persistance
- Hooks composés
- Usage TypeScript

Consultez **[src/examples/README.md](./src/examples/README.md)** pour la liste des fichiers et comment les copier dans votre application.

### Mode debug

```jsx
<FusionStateProvider debug={true}>
  <App />
</FusionStateProvider>
```

Évitez d'activer `debug` en production — les logs peuvent contenir des données utilisateur.

### Exemple complet (thème)

```jsx
import React from 'react';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function ThemeToggle() {
  const [theme, setTheme] = useFusionState('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function ThemedComponent() {
  const [theme] = useFusionState('theme', 'light');

  return (
    <div
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff',
        padding: '20px',
      }}
    >
      <h2>Thème: {theme}</h2>
    </div>
  );
}

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

## Contribuer

Issues et pull requests sont les bienvenues sur [GitHub](https://github.com/jgerard72/react-fusion-state).

## Licence

MIT
