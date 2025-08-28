/**
 * 🚀 EXEMPLE: Nouvelles fonctionnalités React Fusion State v0.4.0
 * 
 * ✅ 100% RÉTROCOMPATIBLE - L'ancienne API fonctionne toujours
 * ✅ ZÉRO IMPACT PERFORMANCE - Optimisations au compile-time
 * ✅ MEILLEURE DX - IntelliSense et typage automatique
 */

import React, { useState } from 'react';
import {
  FusionStateProvider,
  useFusionState,
  createKey,
  createNamespacedKey,
  useDevTools,
  DevToolsConfig,
} from '../index';

// 🎯 ÉTAPE 1: Définir les types de votre application
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'fr' | 'es';
  notifications: boolean;
}

// 🚀 ÉTAPE 2: Créer des clés typées (NOUVEAU!)
const AppKeys = {
  user: createKey<User | null>('user'),
  cart: createKey<CartItem[]>('cart'),
  settings: createKey<AppSettings>('settings'),
  currentPage: createKey<string>('currentPage'),
} as const;

// 🔥 BONUS: Clés avec namespace pour éviter les collisions
const UserKeys = {
  profile: createNamespacedKey<User>('user', 'profile'),
  preferences: createNamespacedKey<{ theme: string }>('user', 'preferences'),
} as const;

// 🛠️ Configuration DevTools (NOUVEAU!)
const devToolsConfig: DevToolsConfig = {
  name: 'E-commerce App',
  trace: true,
  maxAge: 100,
  devOnly: true, // Seulement en développement
};

// 📱 Composant principal avec Provider
function App() {
  return (
    <FusionStateProvider
      persistence={['user', 'cart', 'settings']} // Persistance sélective
      debug={process.env.NODE_ENV === 'development'}
      devTools={devToolsConfig} // 🆕 DevTools activés!
      initialState={{
        settings: {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
        currentPage: 'home',
      }}
    >
      <Header />
      <UserProfile />
      <ShoppingCart />
      <Settings />
      <DevToolsInfo />
    </FusionStateProvider>
  );
}

// 👤 Composant User avec clés typées
function UserProfile() {
  // 🚀 NOUVELLE API: Type inféré automatiquement!
  const [user, setUser] = useFusionState(AppKeys.user, null);
  // TypeScript sait que user est User | null ✅

  const handleLogin = () => {
    setUser({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://avatar.example.com/john.jpg',
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      <h2>User Profile</h2>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Email: {user.email}</p>
          {user.avatar && <img src={user.avatar} alt="Avatar" />}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

// 🛒 Composant Panier avec types stricts
function ShoppingCart() {
  // Type inféré: CartItem[] ✅
  const [cart, setCart] = useFusionState(AppKeys.cart, []);

  const addItem = () => {
    const newItem: CartItem = {
      id: Date.now(),
      name: 'New Product',
      price: 29.99,
      quantity: 1,
    };

    setCart(prevCart => [...prevCart, newItem]);
  };

  const removeItem = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>Shopping Cart ({cart.length} items)</h2>
      {cart.map(item => (
        <div key={item.id}>
          <span>{item.name} - ${item.price} x {item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: ${total.toFixed(2)}</p>
      <button onClick={addItem}>Add Item</button>
    </div>
  );
}

// ⚙️ Composant Settings
function Settings() {
  // Type inféré: AppSettings ✅
  const [settings, setSettings] = useFusionState(AppKeys.settings, {
    theme: 'light',
    language: 'en',
    notifications: true,
  });

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  return (
    <div>
      <h2>Settings</h2>
      <p>Theme: {settings.theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <p>Language: {settings.language}</p>
      <p>Notifications: {settings.notifications ? 'On' : 'Off'}</p>
    </div>
  );
}

// 📊 Composant pour afficher les infos DevTools
function DevToolsInfo() {
  const { enabled, stats } = useDevTools();

  if (!enabled) {
    return (
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p>🛠️ DevTools: Disabled (activate with devTools prop)</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', backgroundColor: '#e8f5e8' }}>
      <h3>🛠️ DevTools Active</h3>
      <p>Actions logged: {stats?.actionCount || 0}</p>
      <p>Config: {stats?.config.name}</p>
      <small>Open React DevTools to see state changes!</small>
    </div>
  );
}

// 🧭 Header avec navigation
function Header() {
  // ✅ Ancienne API toujours supportée (rétrocompatibilité)
  const [currentPage, setCurrentPage] = useFusionState('currentPage', 'home');

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <button
        onClick={() => setCurrentPage('home')}
        style={{ marginRight: '10px' }}
      >
        Home {currentPage === 'home' && '✓'}
      </button>
      <button
        onClick={() => setCurrentPage('products')}
        style={{ marginRight: '10px' }}
      >
        Products {currentPage === 'products' && '✓'}
      </button>
      <button onClick={() => setCurrentPage('profile')}>
        Profile {currentPage === 'profile' && '✓'}
      </button>
    </nav>
  );
}

// 🎯 COMPARAISON API

// ❌ Avant (v0.3.x) - Pas de typage
function OldWay() {
  const [user, setUser] = useFusionState('user', null); // any type
  // user.name // ❌ Pas d'IntelliSense
}

// ✅ Maintenant (v0.4.0+) - Typé automatiquement
function NewWay() {
  const [user, setUser] = useFusionState(AppKeys.user, null); // User | null
  // user?.name // ✅ IntelliSense complet!
}

// 🚀 EXEMPLE AVANCÉ: Selectors avec types
function AdvancedExample() {
  const [user] = useFusionState(AppKeys.user, null);
  const [cart] = useFusionState(AppKeys.cart, []);

  // Calculs dérivés avec types stricts
  const isLoggedIn = user !== null;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.length;

  return (
    <div>
      <p>Status: {isLoggedIn ? 'Logged In' : 'Guest'}</p>
      <p>Cart: {itemCount} items (${cartTotal.toFixed(2)})</p>
    </div>
  );
}

export default App;

/**
 * 🎉 RÉSUMÉ DES NOUVEAUTÉS v0.4.0
 * 
 * ✅ Clés typées avec createKey<T>() pour IntelliSense
 * ✅ DevTools React pour debugging avancé
 * ✅ 100% rétrocompatible - ancien code fonctionne
 * ✅ Zéro impact performance - optimisations compile-time
 * ✅ Namespace de clés pour éviter collisions
 * ✅ Configuration DevTools flexible
 * 
 * 🚀 Migration facile:
 * 1. Créer vos clés typées avec createKey<T>()
 * 2. Remplacer progressivement les strings par les clés
 * 3. Activer les DevTools avec devTools={true}
 * 4. Profiter de l'IntelliSense automatique!
 */
