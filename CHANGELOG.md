# Changelog

All notable changes to React Fusion State will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2024-12-23 - Enterprise Ready: Performance + Auto-Detection + Quality

### 🚀 **MAJOR: Performance Isolation**
- **Migrated**: Internal implementation to `useSyncExternalStore` (React 18+ official API)
- **Added**: Per-key subscriptions → components only re-render when their specific keys change
- **Result**: Even better performance isolation and React 18/19 concurrency safety
- **API**: Public interface unchanged - zero breaking changes

### ⚡ **NEW: Smart Persistence Auto-Detection**
- **React.js**: Automatically uses `localStorage` when `persistence` enabled
- **React Native/Expo**: Automatically detects and uses `AsyncStorage` 
- **SSR (Next.js)**: Safe noop adapter prevents server crashes
- **Custom**: Still supports custom adapters when explicitly provided
- **DX**: Just add `<FusionStateProvider persistence>` - it works everywhere!

### 📚 **Documentation Overhaul**
- **README**: Reduced from 385 to 170 lines (-56%) for professional appearance
- **Consistency**: Fixed all bundle size, performance claims, and dependency mentions
- **Security**: Added explicit warnings about sensitive data storage
- **Coverage**: Updated all `.md` files to reflect React 18+ minimum and new features

### 🧪 **Enterprise-Grade Testing**
- **Coverage**: Achieved 80.54% code coverage (enterprise threshold)
- **Tests**: 46/46 tests passing across all platforms
- **Platforms**: Dedicated test suites for Web, React Native, and SSR environments
- **Quality**: Added advanced error handling and edge case coverage

### 🎯 **BONUS: Zero Dependencies Optimization**
- **Removed**: `lodash.isequal` dependency (replaced with custom lightweight implementation)
- **Bundle**: Even smaller footprint with zero external dependencies
- **Performance**: Custom `customIsEqual` optimized for React Fusion State use cases
- **Tests**: 14 additional tests covering the custom implementation

### 🔄 **100% Backward Compatibility**
- **Zero breaking changes**: All existing code works unchanged
- **Same API**: `useFusionState`, `FusionStateProvider` signatures identical
- **Migration**: No code changes needed - just upgrade and enjoy better performance!

---

## [Previous Versions]

### [0.3.0] - 2024-12-19
- Performance benchmarks vs Redux, Zustand, Recoil
- Documentation cleanup and optimization

### [0.2.x] - 2024-12-18
- Per-key persistence system
- Multi-platform compatibility (React.js, React Native, Expo)
- Enhanced error handling and debug modes

### [0.1.x] - 2024-12-17
- Initial release with core functionality
- Basic state management and persistence