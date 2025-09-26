/**
 * React Native Example for React Fusion State
 *
 * This file is for documentation only - React Native is not installed in this project.
 * To use this example in a real React Native project:
 * 1. npm install react-native @react-native-async-storage/async-storage
 * 2. Copy this code to your React Native project
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

// Mock React Native components for TypeScript (not used in actual compilation)
type ViewProps = {style?: any; children?: React.ReactNode};
type TextProps = {style?: any; children?: React.ReactNode};
type ButtonProps = {title: string; onPress: () => void};
type TextInputProps = {
  style?: any;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: string;
};
type ScrollViewProps = {style?: any; children?: React.ReactNode};

const View = ({children}: ViewProps) => <div>{children}</div>;
const Text = ({children}: TextProps) => <span>{children}</span>;
const Button = ({title, onPress}: ButtonProps) => (
  <button onClick={onPress}>{title}</button>
);
const TextInput = ({value, onChangeText, placeholder}: TextInputProps) => (
  <input
    value={value}
    onChange={e => onChangeText(e.target.value)}
    placeholder={placeholder}
  />
);
const ScrollView = ({children}: ScrollViewProps) => <div>{children}</div>;
const StyleSheet = {create: (styles: any) => styles};

import {
  FusionStateProvider,
  useFusionState,
  createAsyncStorageAdapter,
} from '../index';

// import AsyncStorage from '@react-native-async-storage/async-storage';

// Counter
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

// Settings
function Settings() {
  const [darkMode, setDarkMode] = useFusionState('darkMode', false);
  const [notifications, setNotifications] = useFusionState(
    'notifications',
    true,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.setting}>
        <Text>Dark Mode: {darkMode ? 'On' : 'Off'}</Text>
        <Button title="Toggle" onPress={() => setDarkMode(!darkMode)} />
      </View>

      <View style={styles.setting}>
        <Text>Notifications: {notifications ? 'On' : 'Off'}</Text>
        <Button
          title="Toggle"
          onPress={() => setNotifications(!notifications)}
        />
      </View>
    </View>
  );
}

// User Profile
function UserProfile() {
  const [name, setName] = useFusionState('userName', 'John Doe');
  const [email, setEmail] = useFusionState('userEmail', 'john@example.com');

  return (
    <View style={styles.section}>
      <Text style={styles.title}>User Profile</Text>

      <Text>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />

      <Text>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Your email"
        keyboardType="email-address"
      />
    </View>
  );
}

// App Content
function AppContent() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>React Fusion State</Text>
      <Text style={styles.subtitle}>React Native</Text>

      <Counter />
      <Settings />
      <UserProfile />
    </ScrollView>
  );
}

// Main App
export default function ReactNativeApp() {
  // const asyncAdapter = createAsyncStorageAdapter(AsyncStorage);

  return (
    <FusionStateProvider
      // persistence={{ adapter: asyncAdapter }}
      persistence={['userName', 'userEmail', 'darkMode', 'notifications']}
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  info: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 5,
  },
});
