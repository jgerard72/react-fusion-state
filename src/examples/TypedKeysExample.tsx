/**
 * 🚀 EXAMPLE: React Fusion State v0.4.23 features
 *
 * ✅ 100% BACKWARD COMPATIBLE - Old API still works
 * ✅ ZERO PERFORMANCE IMPACT - Compile-time optimizations
 * ✅ BETTER DX - IntelliSense and automatic typing
 * ✅ GRANULAR PERSISTENCE - Choose exactly which keys to persist
 */

import React, {useState} from 'react';
import {
  FusionStateProvider,
  useFusionState,
  createKey,
  createNamespacedKey,
  useDevTools,
  DevToolsConfig,
} from '../index';

// 🎯 STEP 1: Define your application types
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

// 🚀 STEP 2: Create typed keys (NEW!)
const AppKeys = {
  user: createKey<User | null>('user'),
  cart: createKey<CartItem[]>('cart'),
  settings: createKey<AppSettings>('settings'),
  currentPage: createKey<string>('currentPage'),
} as const;

// 🔥 BONUS: Namespaced keys to avoid collisions
const UserKeys = {
  profile: createNamespacedKey<User>('user', 'profile'),
  preferences: createNamespacedKey<{theme: string}>('user', 'preferences'),
} as const;

// 🛠️ DevTools Configuration (NEW!)
const devToolsConfig: DevToolsConfig = {
  name: 'E-commerce App',
  trace: true,
  maxAge: 100,
  devOnly: true, // Only in development
};

// 📱 Main component with Provider
function App() {
  return (
    <FusionStateProvider
      persistence={['user', 'cart', 'settings']} // Selective persistence
      debug={process.env.NODE_ENV === 'development'}
      devTools={devToolsConfig} // 🆕 DevTools enabled!
      initialState={{
        settings: {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
        currentPage: 'home',
      }}>
      <Header />
      <UserProfile />
      <ShoppingCart />
      <Settings />
      <DevToolsInfo />
    </FusionStateProvider>
  );
}

// 👤 User component with typed keys
function UserProfile() {
  // 🚀 NEW API: Type inferred automatically!
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

// 🛒 Shopping Cart component with strict types
function ShoppingCart() {
  // Inferred type: CartItem[] ✅
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
          <span>
            {item.name} - ${item.price} x {item.quantity}
          </span>
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
  // Inferred type: AppSettings ✅
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
  const {enabled, stats} = useDevTools();

  if (!enabled) {
    return (
      <div style={{padding: '10px', backgroundColor: '#f0f0f0'}}>
        <p>🛠️ DevTools: Disabled (activate with devTools prop)</p>
      </div>
    );
  }

  return (
    <div style={{padding: '10px', backgroundColor: '#e8f5e8'}}>
      <h3>🛠️ DevTools Active</h3>
      <p>Actions logged: {stats?.actionCount || 0}</p>
      <p>Config: {stats?.config.name}</p>
      <small>Open React DevTools to see state changes!</small>
    </div>
  );
}

// 🧭 Header avec navigation
function Header() {
  // ✅ Old API still supported (backward compatibility)
  const [currentPage, setCurrentPage] = useFusionState('currentPage', 'home');

  return (
    <nav style={{padding: '10px', borderBottom: '1px solid #ccc'}}>
      <button
        onClick={() => setCurrentPage('home')}
        style={{marginRight: '10px'}}>
        Home {currentPage === 'home' && '✓'}
      </button>
      <button
        onClick={() => setCurrentPage('products')}
        style={{marginRight: '10px'}}>
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

// ✅ Now (v0.4.0+) - Automatically typed
function NewWay() {
  const [user, setUser] = useFusionState(AppKeys.user, null); // User | null
  // user?.name // ✅ IntelliSense complet!
}

// 🚀 ADVANCED EXAMPLE: Selectors with types
function AdvancedExample() {
  const [user] = useFusionState(AppKeys.user, null);
  const [cart] = useFusionState(AppKeys.cart, []);

  // Derived calculations with strict types
  const isLoggedIn = user !== null;
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = cart.length;

  return (
    <div>
      <p>Status: {isLoggedIn ? 'Logged In' : 'Guest'}</p>
      <p>
        Cart: {itemCount} items (${cartTotal.toFixed(2)})
      </p>
    </div>
  );
}

export default App;

/**
 * 🎉 SUMMARY OF NEW FEATURES v0.4.23
 *
 * ✅ Granular persistence - Choose exactly which keys to persist
 * ✅ Typed keys with createKey<T>() for IntelliSense
 * ✅ React DevTools for advanced debugging
 * ✅ 100% backward compatible - old code works
 * ✅ Zero performance impact - compile-time optimizations
 * ✅ Key namespacing to avoid collisions
 * ✅ Enhanced security - No accidental persistence of sensitive data
 *
 * 🚀 Migration facile:
 * 1. Create your typed keys with createKey<T>()
 * 2. Configure granular persistence: persistence={['user', 'cart']}
 * 3. Progressively replace strings with keys
 * 4. Activer les DevTools avec devTools={true}
 * 5. Profiter de l'IntelliSense automatique!
 */
