# Changelog

All notable changes to React Fusion State will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Coming Soon
- Enhanced `useFusionStateLog` hook for easier debugging
- Specialized hooks (`useToggle`, `useCounter`, etc.)
- React 18 optimizations with `useDeferredValue` and `useTransition`
- Improved persistence for large applications
- Complete API documentation