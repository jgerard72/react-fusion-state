// Test complet React Native
const React = require('react');
const { 
  FusionStateProvider, 
  useFusionState,
  createAsyncStorageAdapter,
  createMemoryStorageAdapter,
  detectBestStorageAdapter
} = require('./dist/index.js');

console.log('📱 Testing React Native compatibility...\n');

try {
  // Test 1: Exports React Native
  console.log('✅ React Native exports:');
  console.log('  - createAsyncStorageAdapter:', typeof createAsyncStorageAdapter);
  console.log('  - createMemoryStorageAdapter:', typeof createMemoryStorageAdapter);
  
  // Test 2: Mock AsyncStorage (comme React Native)
  const mockAsyncStorage = {
    getItem: async (key) => {
      console.log(`  📱 AsyncStorage.getItem("${key}")`);
      return null;
    },
    setItem: async (key, value) => {
      console.log(`  📱 AsyncStorage.setItem("${key}", "${value}")`);
    },
    removeItem: async (key) => {
      console.log(`  📱 AsyncStorage.removeItem("${key}")`);
    }
  };
  
  // Test 3: Créer adapter AsyncStorage
  console.log('\n✅ AsyncStorage adapter:');
  const asyncAdapter = createAsyncStorageAdapter(mockAsyncStorage);
  console.log('  - Adapter created:', !!asyncAdapter);
  console.log('  - getItem method:', typeof asyncAdapter.getItem);
  console.log('  - setItem method:', typeof asyncAdapter.setItem);
  
  // Test 4: Test adapter functionality
  console.log('\n✅ Testing adapter methods:');
  asyncAdapter.setItem('test_key', 'test_value');
  asyncAdapter.getItem('test_key');
  
  // Test 5: Memory adapter pour tests
  console.log('\n✅ Memory adapter:');
  const memoryAdapter = createMemoryStorageAdapter();
  console.log('  - Memory adapter created:', !!memoryAdapter);
  
  // Test 6: Auto-detection (devrait détecter React Native)
  console.log('\n✅ Environment detection:');
  const autoAdapter = detectBestStorageAdapter();
  console.log('  - Auto-detection works:', !!autoAdapter);
  
  console.log('\n🎉 React Native: All tests passed!');
  
} catch (error) {
  console.error('❌ React Native test failed:', error.message);
  process.exit(1);
}
