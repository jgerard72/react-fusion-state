import { createApp } from 'vue';
import { FusionStatePlugin } from '../adapters/vue/plugin';
import VueExample from './VueExample.vue';

/**
 * Example Vue application setup demonstrating Fusion State integration
 * 
 * This file shows how to set up a Vue 3 application with the Fusion State plugin
 */

// Create Vue app
const app = createApp(VueExample);

// Install Fusion State plugin with configuration
app.use(FusionStatePlugin, {
  debug: true,
  initialState: {
    count: 0,
    user: { name: '', email: '' },
    randomValue: 42,
    lastUpdate: new Date().toISOString()
  },
  persistence: {
    // Persist settings with 'persist.' prefix
    persistKeys: (key: string) => key.startsWith('persist.'),
    keyPrefix: 'vue_fusion_example',
    debounce: 500, // Save after 500ms of no changes
    onLoadError: (error, key) => {
      console.warn(`Failed to load ${key}:`, error);
    },
    onSaveError: (error, state) => {
      console.error('Failed to save state:', error);
    }
  }
});

// Mount the app
app.mount('#app');

export default app;
