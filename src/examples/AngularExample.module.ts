import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FusionStateModule } from '../adapters/angular/fusion-state.module';
import { AngularFusionStateExampleComponent } from './AngularExample.component';

/**
 * Example Angular module demonstrating Fusion State integration
 * 
 * Usage:
 * ```typescript
 * import { AngularExampleModule } from './examples/AngularExample.module';
 * 
 * @NgModule({
 *   imports: [AngularExampleModule]
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  declarations: [
    AngularFusionStateExampleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FusionStateModule.forRoot({
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
        keyPrefix: 'angular_fusion_example',
        debounce: 500, // Save after 500ms of no changes
        onLoadError: (error, key) => {
          console.warn(`Failed to load ${key}:`, error);
        },
        onSaveError: (error, state) => {
          console.error('Failed to save state:', error);
        }
      }
    })
  ],
  exports: [
    AngularFusionStateExampleComponent
  ]
})
export class AngularExampleModule {}
