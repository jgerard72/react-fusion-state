import React from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  FusionStateProvider,
  useFusionState,
  createAsyncStorageAdapter,
} from '../index';

// Import AsyncStorage - User must install @react-native-async-storage/async-storage
// import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Example of using React Fusion State with React Native
 *
 * Required installation:
 * npm install @react-native-async-storage/async-storage
 *
 * For iOS, also add:
 * cd ios && pod install
 */

interface User {
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Simple Counter component
function Counter() {
  const [count, setCount] = useFusionState('counter', 0);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Counter: {count}</Text>
      <View style={styles.buttonRow}>
        <Button title="+" onPress={() => setCount(count + 1)} />
        <Button title="-" onPress={() => setCount(count - 1)} />
        <Button title="Reset" onPress={() => setCount(0)} />
      </View>
    </View>
  );
}

// Toggle component for settings
function SettingsToggle() {
  const [darkMode, setDarkMode] = useFusionState('settings.darkMode', false);
  const [notifications, setNotifications] = useFusionState(
    'settings.notifications',
    true,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingRow}>
        <Text>Dark mode: {darkMode ? 'Enabled' : 'Disabled'}</Text>
        <Button title="Toggle" onPress={() => setDarkMode(!darkMode)} />
      </View>
      <View style={styles.settingRow}>
        <Text>Notifications: {notifications ? 'Enabled' : 'Disabled'}</Text>
        <Button
          title="Toggle"
          onPress={() => setNotifications(!notifications)}
        />
      </View>
    </View>
  );
}

// Component for persistent user data
function UserProfile() {
  const [user, setUser] = useFusionState<User>('user', {
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
      theme: 'light',
      notifications: true,
    },
  });

  const updateName = (newName: string) => {
    setUser(prev => ({
      ...prev,
      name: newName,
    }));
  };

  const updateEmail = (newEmail: string) => {
    setUser(prev => ({
      ...prev,
      email: newEmail,
    }));
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>User Profile (Persistent)</Text>
      <View style={styles.inputRow}>
        <Text>Name:</Text>
        <TextInput
          style={styles.input}
          value={user.name}
          onChangeText={updateName}
          placeholder="Name"
        />
      </View>
      <View style={styles.inputRow}>
        <Text>Email:</Text>
        <TextInput
          style={styles.input}
          value={user.email}
          onChangeText={updateEmail}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>
      <Text style={styles.info}>
        Theme: {user.preferences.theme} | Notifications:{' '}
        {user.preferences.notifications ? 'On' : 'Off'}
      </Text>
    </View>
  );
}

// Component for sharing data between screens
function NavigationData() {
  const [currentScreen, setCurrentScreen] = useFusionState<string>(
    'navigation.currentScreen',
    'Home',
  );
  const [screenData, setScreenData] = useFusionState<any>(
    'navigation.data',
    {},
  );

  const navigateWithData = (screen: string, data: any) => {
    setCurrentScreen(screen);
    setScreenData(data);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Shared Navigation</Text>
      <Text>Current screen: {currentScreen}</Text>
      <Text>Data: {JSON.stringify(screenData, null, 2)}</Text>

      <View style={styles.buttonRow}>
        <Button
          title="Home"
          onPress={() => navigateWithData('Home', {timestamp: Date.now()})}
        />
        <Button
          title="Profile"
          onPress={() => navigateWithData('Profile', {userId: 123})}
        />
        <Button
          title="Settings"
          onPress={() => navigateWithData('Settings', {section: 'privacy'})}
        />
      </View>
    </View>
  );
}

// Main component
function AppContent() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>React Fusion State - React Native</Text>
      <Text style={styles.subtitle}>
        Global state management with AsyncStorage persistence
      </Text>

      <Counter />
      <SettingsToggle />
      <UserProfile />
      <NavigationData />

      <View style={styles.section}>
        <Text style={styles.info}>
          💡 Tip: Close and reopen the app to see persistence in action!
        </Text>
      </View>
    </ScrollView>
  );
}

// Main configuration with AsyncStorage
export default function ReactNativeApp() {
  // Uncomment these lines to use AsyncStorage:

  // const asyncStorageAdapter = createAsyncStorageAdapter(AsyncStorage);

  // return (
  //   <FusionStateProvider
  //     initialState={{
  //       appVersion: '1.0.0',
  //       firstLaunch: true,
  //     }}
  //     persistence={['user', 'settings.darkMode', 'settings.notifications']} // ✅ Granular persistence (RECOMMENDED)
  //     debug={__DEV__} // Enable debug only in development
  //   >
  //     <AppContent />
  //   </FusionStateProvider>
  // );
  //
  // // Advanced configuration with custom adapter
  // return (
  //   <FusionStateProvider
  //     initialState={{
  //       appVersion: '1.0.0',
  //       firstLaunch: true,
  //     }}
  //     persistence={{
  //       adapter: asyncStorageAdapter,
  //       persistKeys: ['user', 'settings.darkMode', 'settings.notifications'],
  //       keyPrefix: 'MyReactNativeApp',
  //       debounce: 500, // Wait 500ms before saving
  //       onSaveError: (error, state) => {
  //         console.error('Save error:', error);
  //         // Here you could show a notification to the user
  //       },
  //       onLoadError: (error, key) => {
  //         console.error('Load error for', key, ':', error);
  //       },
  //     }}
  //     debug={__DEV__} // Enable debug only in development
  //   >
  //     <AppContent />
  //   </FusionStateProvider>
  // );

  // Version without persistence for testing
  return (
    <FusionStateProvider
      initialState={{
        appVersion: '1.0.0',
        firstLaunch: true,
      }}
      debug={true}>
      <AppContent />
    </FusionStateProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginLeft: 10,
    borderRadius: 4,
  },
  info: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
