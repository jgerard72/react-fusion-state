# Changelog

All notable changes to React Fusion State will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.25] - 2025-09-26 - Professional JSDoc & Enhanced Developer Experience

### 📚 **Professional JSDoc Implementation**
- **NEW**: Complete JSDoc added to all core functions and components
- **Enhanced**: Full IntelliSense support with parameter descriptions and examples
- **Enhanced**: Better developer experience with detailed documentation in IDE
- **Enhanced**: Type hints and examples directly in code editor

### 🔧 **Developer Experience Improvements**
- **Enhanced**: Better code readability and maintainability
- **Enhanced**: Professional documentation standards throughout codebase
- **Enhanced**: Improved onboarding for new developers

### 📚 **Documentation Updates**
- **Updated**: All version references to v0.4.25
- **Updated**: README.md with latest feature descriptions
- **Updated**: All documentation files with consistent versioning

### 🧪 **Testing & Compatibility**
- **Maintained**: 100% backward compatibility - no breaking changes
- **Tested**: All 75 tests pass including backward compatibility tests
- **Verified**: Existing codebases require no changes

## [0.4.24] - 2025-09-26 - Granular Persistence & Enhanced Control

### 🎯 **Major Persistence Improvements**
- **NEW**: Granular persistence by default - choose exactly which state keys to persist
- **Enhanced**: `persistence={['user', 'cart']}` syntax for explicit key selection (RECOMMENDED)
- **Enhanced**: `persistence={true}` persists all keys (use with caution for performance)
- **Enhanced**: `persistence={false}` or no persistence prop = no persistence (safest default)
- **Optimized**: Skip storage operations entirely when no keys are configured for persistence

### 🔒 **Security & Performance Benefits**
- **Security**: Prevents accidental persistence of sensitive data (passwords, tokens, etc.)
- **Performance**: Reduces localStorage/AsyncStorage usage and write operations
- **Control**: Explicit declaration of what should persist vs temporary state
- **Debugging**: Clearer understanding of what data survives page reloads

### 📚 **Documentation Updates**
- **NEW**: Professional JSDoc added to all core functions and components
- **Enhanced**: IntelliSense support with detailed parameter descriptions and examples
- **Updated**: All documentation files with granular persistence examples
- **Updated**: README.md, DOCUMENTATION.md, GETTING_STARTED.md with new recommended patterns
- **Updated**: Demo examples showing best practices for persistence configuration
- **Updated**: Platform compatibility guide with granular persistence examples

### 🧪 **Testing & Compatibility**
- **Maintained**: 100% backward compatibility - no breaking changes
- **Tested**: All 75 tests pass including backward compatibility tests
- **Verified**: Legacy `persistence={true}` continues to work exactly as before
- **Verified**: Existing codebases require no changes

## [0.4.22] - 2025-09-26 - Documentation & Benchmark Updates

### 📚 **Documentation Enhancements**
- **Updated**: All documentation files to reflect version 0.4.22
- **Updated**: PERFORMANCE_BENCHMARK_RESULTS.md with latest benchmark results
- **Updated**: All example code and version references across documentation
- **Enhanced**: Performance benchmark scripts with updated version display

### 🧪 **Testing & Quality**
- **Verified**: All 75 tests continue to pass with 100% backward compatibility
- **Maintained**: Zero breaking changes from previous versions
- **Updated**: Benchmark scripts to display correct version numbers

## [0.4.2] - 2024-12-25 - Major Technical Refactoring & Performance

### 🏗️ **Major Architecture Improvements**
- **BREAKING (Internal)**: Completely refactored persistence logic - now handled exclusively in `FusionStateProvider`
- **BREAKING (Internal)**: Removed all persistence options from `useFusionState` hook (moved to Provider level)
- **Enhanced**: Unified initialization logic - merged dual `useEffect` into single, more efficient effect
- **Enhanced**: Persistence adapter configuration now frozen at mount for predictable behavior

### ⚡ **Performance Enhancements**
- **NEW**: `Object.is()` priority equality comparison for optimal performance
- **NEW**: Cross-platform batched notifications using `unstable_batchedUpdates`
- **Enhanced**: Intelligent fallback: `Object.is` → `shallowEqual` → `simpleDeepEqual`
- **Optimized**: Significant reduction in unnecessary re-renders through better equality checks
- **Added**: New `batch()` utility with automatic React DOM/Native detection

### 🔧 **SSR & Cross-Platform Fixes**
- **Fixed**: Proper `getServerSnapshot` implementation for robust SSR support
- **Fixed**: Cross-platform timeout types (`ReturnType<typeof setTimeout>` vs `NodeJS.Timeout`)
- **Enhanced**: Server-side rendering now uses actual initial state instead of fallback values

### 🆕 **New Features**
- **NEW**: `useFusionHydrated()` hook for hydration status tracking (useful for React Native/AsyncStorage)
- **NEW**: Cross-platform batching utility (`src/utils/batch.ts`)
- **Enhanced**: Better TypeScript support across web and React Native environments

### 🛠️ **Developer Experience**
- **Simplified**: Persistence configuration now centralized in Provider only
- **Enhanced**: Cleaner, more maintainable codebase with reduced duplication
- **Added**: Comprehensive test suite for new functionality
- **Maintained**: 100% backward compatibility - no API breaking changes for users

### 📚 **Documentation & Testing**
- **Added**: New test suite covering all enhanced functionality
- **Added**: Cross-platform batching tests
- **Enhanced**: Better documentation of persistence behavior
- **Added**: Migration notes and architectural decisions

### 🔄 **Migration Notes**
- ✅ **No user code changes required** - all improvements are internal
- ✅ **Persistence options at hook level are deprecated but still work**
- ✅ **Recommended**: Move persistence config to `FusionStateProvider` level
- ✅ **Performance improvements are automatic**

---

## [0.4.1] - 2024-12-24 - SSR & Performance Improvements

### 🔧 **Bug Fixes**
- **Fixed**: SSR hydration mismatch by returning `initialValue` in `getServerSnapshot`
- **Fixed**: Improved SSR compatibility for Next.js and Gatsby applications

### ⚡ **Performance Enhancements**
- **Added**: `shallow` option for optimized comparison of large objects
- **Added**: Shallow equality check function for better performance on complex state

### 📚 **Documentation**
- **Added**: Performance options section in README with clear examples
- **Added**: Usage guidelines for `shallow` option with best practices
- **Improved**: Better examples and clearer API documentation

### 🛠️ **Developer Experience**
- **Enhanced**: TypeScript support for new `shallow` option
- **Added**: Clear guidance on when to use shallow vs deep comparison

---

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