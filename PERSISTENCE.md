# Guide de persistance pour React Fusion State

Ce document détaille les fonctionnalités de persistance d'état offertes par React Fusion State, vous permettant de sauvegarder et restaurer l'état de votre application entre les sessions.

## Concepts de base

La persistance dans React Fusion State permet de :
- Sauvegarder automatiquement l'état global dans un stockage persistant (localStorage, AsyncStorage, etc.)
- Restaurer l'état au redémarrage de l'application
- Sélectionner quelles parties de l'état doivent être persistées
- Configurer le comportement précis de la persistance

## Configuration simple

### Activer la persistance pour toutes les clés

```jsx
<FusionStateProvider persistence={true}>
  <App />
</FusionStateProvider>
```

Avec cette configuration, tout l'état sera sauvegardé dans le stockage par défaut (localStorage sur le web, AsyncStorage sur React Native).

### Persister uniquement certaines clés

```jsx
<FusionStateProvider persistence={['user', 'theme', 'settings']}>
  <App />
</FusionStateProvider>
```

Cette configuration limite la persistance aux clés spécifiées, ce qui est utile pour éviter de sauvegarder des données temporaires ou sensibles.

## Configuration avancée

Pour un contrôle plus précis, vous pouvez fournir un objet de configuration :

```jsx
<FusionStateProvider 
  persistence={{
    // Préfixe pour les clés dans le stockage
    keyPrefix: 'myApp',
    
    // Délai avant sauvegarde en ms (debounce)
    debounce: 500,
    
    // Adaptateur de stockage personnalisé (optionnel)
    adapter: myCustomStorageAdapter,
    
    // Clés spécifiques à persister (optionnel)
    persistKeys: ['user.profile', 'app.settings']
  }}
>
  <App />
</FusionStateProvider>
```

## Filtrage avancé avec fonctions

Vous pouvez également utiliser une fonction pour filtrer dynamiquement les clés à persister :

```jsx
<FusionStateProvider 
  persistence={{
    // Fonction de filtrage qui reçoit la clé et sa valeur
    persistKeys: (key, value) => {
      // Ne pas sauvegarder les grands tableaux
      if (Array.isArray(value) && value.length > 100) return false;
      
      // Sauvegarder uniquement les clés spécifiques
      return key.startsWith('persist.') || key === 'user' || key === 'theme';
    }
  }}
>
  <App />
</FusionStateProvider>
```

## Adapter personnalisé

Par défaut, React Fusion State détecte automatiquement la meilleure méthode de stockage disponible. Vous pouvez également fournir votre propre adaptateur :

```jsx
// Créez un adaptateur personnalisé
const myStorageAdapter = {
  getItem: async (key) => {
    // Votre logique de lecture
    return value;
  },
  setItem: async (key, value) => {
    // Votre logique d'écriture
  },
  removeItem: async (key) => {
    // Votre logique de suppression
  }
};

// Utilisez-le dans le provider
<FusionStateProvider 
  persistence={{
    adapter: myStorageAdapter
  }}
>
  <App />
</FusionStateProvider>
```

## Callback de sauvegarde personnalisé

Pour un contrôle total sur le processus de sauvegarde, vous pouvez fournir un callback personnalisé :

```jsx
<FusionStateProvider 
  persistence={{
    customSaveCallback: async (state, adapter, keyPrefix) => {
      // Transformez les données avant de les sauvegarder
      const transformedState = {
        ...state,
        lastSaved: new Date().toISOString()
      };
      
      // Sauvegardez par sections
      await adapter.setItem(`${keyPrefix}_user`, JSON.stringify(transformedState.user));
      await adapter.setItem(`${keyPrefix}_settings`, JSON.stringify(transformedState.settings));
      
      // Effectuez d'autres opérations selon vos besoins
      console.log('État sauvegardé à', new Date());
    }
  }}
>
  <App />
</FusionStateProvider>
```

## Meilleures pratiques

### Performance

- Utilisez `debounce` pour limiter les sauvegardes fréquentes
- Persistez uniquement les données nécessaires
- Évitez de persister de grands objets ou tableaux

### Sécurité

- Ne persistez pas d'informations sensibles (jetons d'authentification, mots de passe)
- Utilisez un adaptateur de stockage sécurisé pour les données sensibles
- Considérez le chiffrement des données persistées si nécessaire

### Structure des données

- Utilisez un préfixe de nom d'application pour éviter les collisions
- Structurez vos clés d'état de manière organisée (ex: 'auth.user', 'app.settings')
- Utilisez des préfixes cohérents pour les données à persister (ex: 'persist.user')

## Exemples complets

### Exemple React Web avec localStorage

```jsx
import React from 'react';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function App() {
  return (
    <FusionStateProvider 
      persistence={{
        keyPrefix: 'myWebApp',
        debounce: 300,
        persistKeys: ['user', 'theme', 'settings']
      }}
    >
      <UserProfile />
      <ThemeToggle />
    </FusionStateProvider>
  );
}

function UserProfile() {
  const [user, setUser] = useFusionState('user', { name: '', email: '' });
  
  return (
    <div>
      <input 
        value={user.name}
        onChange={e => setUser({...user, name: e.target.value})}
        placeholder="Nom"
      />
      <input 
        value={user.email}
        onChange={e => setUser({...user, email: e.target.value})}
        placeholder="Email"
      />
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useFusionState('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Exemple React Native avec AsyncStorage

```jsx
import React from 'react';
import { View, TextInput, Button } from 'react-native';
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

export default function App() {
  return (
    <FusionStateProvider 
      persistence={{
        keyPrefix: 'myNativeApp',
        debounce: 500
      }}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <UserSettings />
      </View>
    </FusionStateProvider>
  );
}

function UserSettings() {
  const [settings, setSettings] = useFusionState('settings', {
    notifications: true,
    darkMode: false,
    fontSize: 'medium'
  });
  
  return (
    <View>
      <Button 
        title={`Notifications: ${settings.notifications ? 'ON' : 'OFF'}`}
        onPress={() => setSettings({
          ...settings, 
          notifications: !settings.notifications
        })}
      />
      
      <Button 
        title={`Mode: ${settings.darkMode ? 'Dark' : 'Light'}`}
        onPress={() => setSettings({
          ...settings, 
          darkMode: !settings.darkMode
        })}
      />
    </View>
  );
}
``` 