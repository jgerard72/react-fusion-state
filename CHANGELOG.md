# Changelog

All notable changes to React Fusion State will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2024-12-24 - Enterprise-Ready Simplicity

### 🎯 **Major Features**
- **Added**: Typed Keys system with `createKey<T>()` for automatic TypeScript inference
- **Added**: React DevTools integration with time-travel debugging
- **Added**: Enterprise-grade robustness with invisible error recovery
- **Added**: Zero dependencies - removed `lodash.isequal` dependency

### 🔑 **Typed Keys (Optional)**
- **New**: `createKey<T>(key)` function for type-safe state management
- **New**: Automatic TypeScript inference and auto-completion
- **New**: Backward compatible - all existing code continues to work

### 🛠️ **Developer Experience**
- **Added**: React DevTools support with `devTools={true}` prop
- **Added**: State inspection, action history, and time-travel debugging
- **Added**: Development-only features with zero production impact

### 🛡️ **Enterprise Robustness (Invisible)**
- **Added**: Automatic storage corruption detection and recovery
- **Added**: Memory leak prevention and automatic cleanup
- **Added**: Integrated error boundaries for graceful error handling
- **Added**: Data integrity validation with checksum verification

### 📦 **Performance & Bundle**
- **Removed**: `lodash.isequal` dependency (breaking: now zero dependencies)
- **Added**: Custom optimized deep equal implementation
- **Improved**: Bundle size reduction and performance optimizations
- **Added**: Automatic debouncing and memoization (invisible)

### 🔄 **Migration**
- **Guaranteed**: 100% backward compatibility - no breaking changes to existing APIs
- **Optional**: Upgrade to typed keys at your own pace
- **Simple**: All new features are opt-in or completely transparent

## [0.3.41] - 2024-12-24 - Documentation & Links Update

### 📝 **Documentation**
- **Added**: Comprehensive main README.md with complete project overview
- **Added**: Quick start guide, feature showcase, and performance comparison table
- **Added**: Links to all documentation, demos, and examples
- **Added**: Professional badges and project presentation

### 🔗 **Links & Contact**
- **Fixed**: LinkedIn profile URL corrected across all documentation files
- **Updated**: Contact information in CONTRIBUTING.md, DOCUMENTATION.md, and GETTING_STARTED.md
- **Improved**: Consistent external and internal link structure

### 🧹 **Maintenance**
- **Removed**: Duplicate readme.md file (cleaned git status)
- **Verified**: All tests passing (46/46), build working, no regressions
- **Confirmed**: Library functionality 100% intact

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