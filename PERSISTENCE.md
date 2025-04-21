# Persistance d'état dans React Fusion State

React Fusion State offre une fonctionnalité optionnelle de persistance d'état qui permet de sauvegarder l'état global dans un stockage persistant (localStorage, AsyncStorage, etc.) et de le restaurer lors du rechargement de l'application.

## Fonctionnalités

- ✨ **Flexible** : Compatible avec différentes méthodes de stockage (web, React Native, Expo)
- 🔄 **Configurable** : Contrôlez quelles parties de l'état sont persistées
- ⚡ **Performant** : Option de debounce pour limiter les écritures
- 🧩 **Extensible** : Créez vos propres adaptateurs de stockage
- 🎯 **Optionnel** : Utilisez-le uniquement si vous en avez besoin

## Comment l'utiliser

### 1. Créez un adaptateur de stockage

Commencez par créer un adaptateur qui implémente l'interface `StorageAdapter` :

```tsx
import { StorageAdapter } from 'react-fusion-state';

// Pour le web avec localStorage
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

// Pour React Native avec AsyncStorage
class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      // Importez AsyncStorage selon votre projet
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  }
}
```

### 2. Configurez la persistance dans FusionStateProvider

Ensuite, utilisez l'adaptateur dans votre FusionStateProvider :

```tsx
import { FusionStateProvider } from 'react-fusion-state';

const App = () => {
  // Créez votre adaptateur
  const storageAdapter = new LocalStorageAdapter();
  
  return (
    <FusionStateProvider
      initialState={{
        user: null,
        settings: { theme: 'light' },
        temporaryData: { searchResults: [] }
      }}
      persistence={{
        adapter: storageAdapter,
        keyPrefix: 'myapp',
        // Persister uniquement les clés spécifiées
        persistKeys: ['user', 'settings'],
        loadOnInit: true,
        saveOnChange: true,
        debounceTime: 300, // ms
      }}
    >
      {/* Vos composants */}
    </FusionStateProvider>
  );
};
```

### 3. Utilisez normalement vos hooks useFusionState

L'état sera automatiquement persisté et restauré selon votre configuration :

```tsx
const UserProfile = () => {
  // Cet état sera persisté car 'user' est dans persistKeys
  const [user, setUser] = useFusionState('user', null);
  
  return (
    <div>
      {user ? (
        <div>
          <h2>Bienvenue, {user.name}!</h2>
          <button onClick={() => setUser(null)}>Déconnexion</button>
        </div>
      ) : (
        <button onClick={() => setUser({ id: 1, name: 'John' })}>Connexion</button>
      )}
    </div>
  );
};
```

## Options de configuration

L'objet `persistence` accepte les propriétés suivantes :

| Propriété | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `adapter` | `StorageAdapter` | Oui | Adaptateur d'interface avec le stockage |
| `keyPrefix` | `string` | Non | Préfixe pour les clés de stockage (défaut : 'fusion_state') |
| `persistKeys` | `string[] \| ((key: string) => boolean)` | Non | Clés à persister (toutes par défaut) |
| `loadOnInit` | `boolean` | Non | Charger l'état au démarrage (défaut : false) |
| `saveOnChange` | `boolean` | Non | Sauvegarder l'état à chaque changement (défaut : false) |
| `debounceTime` | `number` | Non | Délai avant sauvegarde en ms (défaut : 0) |

## Filtrage des clés à persister

Vous pouvez spécifier les clés d'état à persister de deux façons :

### Avec un tableau de clés

```tsx
persistence={{
  adapter: storageAdapter,
  // Seulement ces clés seront persistées
  persistKeys: ['user', 'settings', 'cart'],
}}
```

### Avec une fonction de filtrage

```tsx
persistence={{
  adapter: storageAdapter,
  // Persister seulement les clés qui commencent par "persist_"
  persistKeys: (key) => key.startsWith('persist_'),
}}
```

## Exemples d'adaptateurs personnalisés

### Adaptateur pour IndexedDB

```tsx
class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private storeName: string;

  constructor(dbName = 'fusionStateDB', storeName = 'state') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.error('Error reading from IndexedDB:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Error writing to IndexedDB:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Error removing from IndexedDB:', error);
    }
  }
}
```

### Adaptateur pour MMKV (React Native)

```tsx
class MMKVAdapter implements StorageAdapter {
  private storage: any;
  
  constructor() {
    // Requiert: npm install react-native-mmkv
    const { MMKV } = require('react-native-mmkv');
    this.storage = new MMKV();
  }
  
  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getString(key);
    } catch (error) {
      console.error('Error reading from MMKV:', error);
      return null;
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.set(key, value);
    } catch (error) {
      console.error('Error writing to MMKV:', error);
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      this.storage.delete(key);
    } catch (error) {
      console.error('Error removing from MMKV:', error);
    }
  }
}
```

## Bonnes pratiques

1. **Ne persistez que ce qui est nécessaire** - Évitez de stocker des données temporaires ou volumineuses.

2. **Utilisez le debounce** - Pour les valeurs qui changent fréquemment, utilisez `debounceTime` pour réduire les écritures.

3. **Considérez la sécurité** - N'utilisez pas cette méthode pour stocker des informations sensibles non chiffrées.

4. **Gérez les erreurs** - Testez votre application dans des conditions où le stockage pourrait ne pas être disponible.

5. **Prévoyez la migration de données** - Ajoutez une version à vos données persistées pour gérer les migrations dans les futures versions de l'application. 