/**
 * Angular adapter for Fusion State
 * Provides Angular-specific services, modules, and types that wrap the framework-agnostic core
 */

// Core service and module
export { FusionStateService } from './fusion-state.service';
export { FusionStateModule, GlobalStateModule, StateModule } from './fusion-state.module';

// Angular-specific types
export type {
  AngularPersistenceConfig,
  AngularFullPersistenceConfig,
  AngularFusionStateConfig,
  StateValue,
  AngularFusionStateModule,
} from './types';

// Injection token (for advanced usage)
export { FUSION_STATE_MANAGER } from './types';
