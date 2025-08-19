<template>
  <div class="vue-fusion-state-example">
    <h1>Vue Fusion State Example</h1>
    
    <!-- Basic Counter -->
    <section class="example-section">
      <h2>Basic Counter</h2>
      <div class="counter">
        <p>Count: {{ count }}</p>
        <div class="button-group">
          <button @click="increment" class="btn btn-primary">+</button>
          <button @click="decrement" class="btn btn-secondary">-</button>
          <button @click="reset" class="btn btn-outline">Reset</button>
        </div>
      </div>
    </section>

    <!-- User Profile -->
    <section class="example-section">
      <h2>User Profile</h2>
      <div class="user-profile">
        <div class="form-group">
          <label>Name:</label>
          <input 
            v-model="localName" 
            @blur="updateUserName"
            placeholder="Enter your name"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input 
            v-model="localEmail" 
            @blur="updateUserEmail"
            placeholder="Enter your email"
            class="form-input"
          />
        </div>
        <div class="user-display">
          <h3>Current User:</h3>
          <p><strong>Name:</strong> {{ user.name || 'Not set' }}</p>
          <p><strong>Email:</strong> {{ user.email || 'Not set' }}</p>
        </div>
      </div>
    </section>

    <!-- Persistent Settings -->
    <section class="example-section">
      <h2>Persistent Settings</h2>
      <div class="settings">
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              :checked="settings.darkMode"
              @change="toggleDarkMode"
            />
            Dark Mode
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              :checked="settings.notifications"
              @change="toggleNotifications"
            />
            Enable Notifications
          </label>
        </div>
        <div class="setting-item">
          <label>Language:</label>
          <select 
            :value="settings.language"
            @change="updateLanguage"
            class="form-select"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Real-time Data -->
    <section class="example-section">
      <h2>Real-time Data</h2>
      <div class="realtime-data">
        <p>Last Update: {{ lastUpdate }}</p>
        <p>Random Value: {{ randomValue }}</p>
        <button @click="generateRandomData" class="btn btn-accent">
          Generate Random Data
        </button>
      </div>
    </section>

    <!-- State Debug Info -->
    <section class="example-section">
      <h2>Debug Information</h2>
      <div class="debug-info">
        <button @click="toggleDebug" class="btn btn-outline">
          {{ showDebug ? 'Hide' : 'Show' }} Debug Info
        </button>
        <pre v-if="showDebug" class="debug-output">{{ debugInfo }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  useFusionState, 
  useFusionStateManager, 
  useFusionStateValue,
  watchFusionState,
} from '../adapters/vue';

// Basic counter state
const [count, setCount] = useFusionState('count', 0);

// User profile state
const [user, setUser] = useFusionState('user', { name: '', email: '' });

// Persistent settings (these will be saved to localStorage)
const [settings, setSettings] = useFusionState('persist.settings', {
  darkMode: false,
  notifications: true,
  language: 'en'
});

// Real-time data
const [lastUpdate, setLastUpdate] = useFusionState('lastUpdate', new Date().toISOString());
const [randomValue, setRandomValue] = useFusionState('randomValue', 0);

// Local form state
const localName = ref(user.value.name);
const localEmail = ref(user.value.email);

// Debug state
const showDebug = ref(false);
const manager = useFusionStateManager();

// Computed debug info
const debugInfo = computed(() => {
  return JSON.stringify(manager.getDebugInfo(), null, 2);
});

// Counter methods
const increment = () => setCount(prev => prev + 1);
const decrement = () => setCount(prev => prev - 1);
const reset = () => setCount(0);

// User profile methods
const updateUserName = () => {
  setUser(prev => ({ ...prev, name: localName.value }));
};

const updateUserEmail = () => {
  setUser(prev => ({ ...prev, email: localEmail.value }));
};

// Settings methods
const toggleDarkMode = (event: Event) => {
  const target = event.target as HTMLInputElement;
  setSettings(prev => ({ ...prev, darkMode: target.checked }));
};

const toggleNotifications = (event: Event) => {
  const target = event.target as HTMLInputElement;
  setSettings(prev => ({ ...prev, notifications: target.checked }));
};

const updateLanguage = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  setSettings(prev => ({ ...prev, language: target.value }));
};

// Real-time data methods
const generateRandomData = () => {
  setRandomValue(Math.floor(Math.random() * 1000));
  setLastUpdate(new Date().toISOString());
};

// Debug methods
const toggleDebug = () => {
  showDebug.value = !showDebug.value;
};

// Watch for user changes to update local form state
watchFusionState('user', (newUser) => {
  localName.value = newUser.name;
  localEmail.value = newUser.email;
});

// Auto-generate random data every 5 seconds
onMounted(() => {
  const interval = setInterval(generateRandomData, 5000);
  
  // Cleanup on unmount
  return () => clearInterval(interval);
});
</script>

<style scoped>
.vue-fusion-state-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.example-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.example-section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007acc;
  padding-bottom: 10px;
}

.counter {
  text-align: center;
}

.counter p {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #007acc;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #007acc;
  color: white;
}

.btn-primary:hover {
  background: #005a9e;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  color: #007acc;
  border: 1px solid #007acc;
}

.btn-outline:hover {
  background: #007acc;
  color: white;
}

.btn-accent {
  background: #28a745;
  color: white;
}

.btn-accent:hover {
  background: #218838;
}

.user-profile {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-input, .form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.user-display {
  padding: 15px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #007acc;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.realtime-data {
  text-align: center;
}

.realtime-data p {
  margin: 10px 0;
  font-family: monospace;
  background: white;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #28a745;
}

.debug-info {
  text-align: center;
}

.debug-output {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 15px;
  text-align: left;
}

@media (max-width: 600px) {
  .vue-fusion-state-example {
    padding: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
