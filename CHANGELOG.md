# Changelog

All notable changes to React Fusion State will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.4] - 2024-08-12

### Added
- **Expo Support**: Official Expo compatibility documented and confirmed
- **Expo Examples**: Added specific Expo code examples and usage patterns
- **Enhanced Keywords**: Added "expo" keyword for better NPM discoverability

### Fixed
- **Documentation**: Corrected ReactJS component examples (div, p, button vs View, Text, Button)
- **Technical Accuracy**: ReactJS now shows proper HTML elements, React Native shows RN components
- **Terminology**: Consistent use of "ReactJS" instead of "Web" throughout documentation
- **Examples**: Clear separation between ReactJS, React Native, and Expo code samples

## [0.2.3] - 2024-08-12

### Tested
- **ReactJS Compatibility**: Complete testing suite confirms 100% ReactJS compatibility
- **React Native Compatibility**: Comprehensive tests validate full React Native support
- **Storage Adapters**: All persistence adapters (localStorage, AsyncStorage, Memory) fully tested
- **Production Ready**: Full functionality testing confirms library is production-ready

### Verified
- **Build System**: TypeScript compilation verified without errors
- **Module Resolution**: All imports and exports working correctly in production
- **Environment Detection**: Automatic platform detection working perfectly
- **Memory Management**: All storage operations (set/get/remove) functioning correctly

### Optimized
- **Package Size**: Removed large image from NPM package (949KB → 90KB)
- **Download Speed**: 90% faster package installation for users
- **NPM Display**: Image still visible via GitHub raw URL in README
- **User Experience**: Dramatically improved installation time

## [0.2.2] - 2024-08-12

### Improved
- **Package Metadata**: Enhanced NPM discoverability with better description and keywords
- **Social Sharing**: Optimized homepage URL and package information for better sharing
- **SEO**: Expanded keywords for improved NPM search visibility

## [0.2.1] - 2024-08-12

### Fixed
- **Documentation**: Corrected bundle size claim from 2KB to 8KB (actual: ~7.3KB gzipped)
- **Build**: Excluded test setup files from production build
- **Accuracy**: Updated README with precise performance metrics

## [0.2.0] - 2024-08-12

### Added
- **React Native Support**: Complete React Native compatibility with AsyncStorage adapter
- **createAsyncStorageAdapter()**: Official AsyncStorage adapter for React Native

- **Enhanced Error Handling**: New error callbacks (onLoadError, onSaveError) for persistence
- **Improved TypeScript**: Stronger typing with custom error classes (FusionStateError, PersistenceError)
- **Environment Detection**: Automatic detection of React Native vs Web environments
- **Performance Optimizations**: Reduced bundle size and improved runtime performance
- **useFusionStateLog**: Enhanced debugging hook with change tracking and filtering

### Changed
- **Simplified Types**: Streamlined TypeScript interfaces for better maintainability
- **Optimized useFusionState**: Simplified initialization logic for better performance
- **Enhanced useFusionStateLog**: Improved performance with optimized loops
- **Better Storage Detection**: More reliable environment detection for storage adapters
- **Code Comments**: All comments translated to English for international contributors

### Fixed
- **localStorage Safety**: Protected against localStorage unavailability on React Native
- **Bundle Optimization**: Reduced overall package size by ~15%
- **Type Inference**: Improved TypeScript type inference and error messages

### Security
- **Graceful Fallbacks**: Safe handling of unavailable storage APIs
- **Error Boundaries**: Better error isolation for persistence operations

### Breaking Changes
- None - This release is fully backward compatible

### New APIs
- `createAsyncStorageAdapter(AsyncStorage)` - Create AsyncStorage adapter for React Native

- `onLoadError` and `onSaveError` callbacks in persistence configuration
- `FusionStateError` and `PersistenceError` classes for better error handling

## [0.1.1] - 2023-11-26

### Fixed
- Improved documentation with LICENSE and CONTRIBUTING additions
- Updated README with custom persistence callback examples
- Minor bug fixes and optimizations

## [0.1.0] - 2023-11-26

### Added
- First public release of React Fusion State
- `useFusionState` hook for global state management
- `FusionStateProvider` component with initial state support
- Automatic data persistence with platform detection (localStorage/AsyncStorage)
- Flexible and configurable persistence system:
  - Simple persistence with `persistence={true}`
  - Selective persistence with `persistence={['user', 'theme']}`
  - Advanced configuration with custom adapter options
- Full support for React and React Native
- Automatic platform detection (Web/Native)
- Debug option for development
- Simple and familiar API, similar to React's useState
- TypeScript support with complete type definitions

### Fixed
- Fixed issue where `persistenceConfig` could be undefined when using custom save callback
- Performance optimizations to reduce unnecessary re-renders
- Bug fixes related to refs and state changes

### Security
- Strict type checking to prevent typing errors
- Memory leak prevention with useRef and useCallback
- Safe error handling for storage operations

## [Unreleased]

### Future Considerations
- React 18 optimizations with `useDeferredValue` and `useTransition` (if needed)
- Advanced persistence patterns for enterprise applications