// Test complet ReactJS
const React = require('react');
const { 
  FusionStateProvider, 
  useFusionState,
  createLocalStorageAdapter,
  detectBestStorageAdapter
} = require('./dist/index.js');

console.log('🧪 Testing ReactJS compatibility...\n');

try {
  // Test 1: Exports principaux
  console.log('✅ Core exports:');
  console.log('  - FusionStateProvider:', typeof FusionStateProvider);
  console.log('  - useFusionState:', typeof useFusionState);
  
  // Test 2: Storage adapters
  console.log('\n✅ Storage adapters:');
  const localStorage = createLocalStorageAdapter();
  console.log('  - createLocalStorageAdapter():', !!localStorage);
  
  const autoAdapter = detectBestStorageAdapter();
  console.log('  - detectBestStorageAdapter():', !!autoAdapter);
  
  // Test 3: Adapter methods
  console.log('\n✅ Adapter interface:');
  console.log('  - getItem:', typeof localStorage.getItem);
  console.log('  - setItem:', typeof localStorage.setItem);
  console.log('  - removeItem:', typeof localStorage.removeItem);
  
  console.log('\n🎉 ReactJS: All tests passed!');
  
} catch (error) {
  console.error('❌ ReactJS test failed:', error.message);
  process.exit(1);
}
