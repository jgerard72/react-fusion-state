/**
 * Framework-agnostic core for Fusion State
 * This module contains all the business logic without any framework dependencies
 */

// Core classes
export { FusionStateManager } from './FusionStateManager';
export { EventEmitter } from './EventEmitter';
export { PersistenceManager } from './PersistenceManager';

// Core types
export type {
  GlobalState,
  SetStateAction,
  StateUpdater,
  StateChangeCallback,
  UnsubscribeFunction,
  Subscriber,
  CoreManagerConfig,
  CorePersistenceConfig,
  PersistenceKeys,
  StorageAdapter,
  ExtendedStorageAdapter,
} from './types';

// Core errors
export {
  FusionStateError,
  PersistenceError,
  FusionStateErrorMessages,
} from './types';
