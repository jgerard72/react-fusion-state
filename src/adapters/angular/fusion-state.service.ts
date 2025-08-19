import { Injectable, Inject, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, distinctUntilChanged, shareReplay } from 'rxjs';
import { 
  FusionStateManager, 
  StateUpdater, 
  SetStateAction, 
  UnsubscribeFunction,
  GlobalState,
} from '../../core';
import { FUSION_STATE_MANAGER, StateValue } from './types';

/**
 * Angular service for Fusion State management
 * Provides RxJS-based reactive state management using the framework-agnostic core
 */
@Injectable({
  providedIn: 'root'
})
export class FusionStateService implements OnDestroy {
  private subscriptions = new Map<string, UnsubscribeFunction>();
  private subjects = new Map<string, BehaviorSubject<any>>();

  constructor(
    @Inject(FUSION_STATE_MANAGER) private manager: FusionStateManager
  ) {}

  /**
   * Get an observable for a specific state key
   * The observable will emit whenever the state value changes
   * 
   * @template T - The type of the state value
   * @param {string} key - The state key
   * @param {T} [initialValue] - Initial value if the key doesn't exist
   * @returns {Observable<T>} - Observable that emits state changes
   */
  select<T = unknown>(key: string, initialValue?: T): Observable<T> {
    // Initialize the key if needed
    if (initialValue !== undefined && !this.manager.hasKey(key)) {
      this.manager.initializeKey(key, initialValue);
    }

    // Check if we already have a subject for this key
    if (!this.subjects.has(key)) {
      const currentValue = this.manager.getState<T>(key) ?? initialValue;
      const subject = new BehaviorSubject<T>(currentValue as T);
      this.subjects.set(key, subject);

      // Subscribe to manager changes
      const unsubscribe = this.manager.subscribe<T>(key, (newValue) => {
        subject.next(newValue as T);
      });

      this.subscriptions.set(key, unsubscribe);
    }

    return this.subjects.get(key)!.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  /**
   * Get the current value for a state key (synchronous)
   * 
   * @template T - The type of the state value
   * @param {string} key - The state key
   * @returns {T | undefined} - The current value or undefined if not set
   */
  getValue<T = unknown>(key: string): T | undefined {
    return this.manager.getState<T>(key);
  }

  /**
   * Set the value for a state key
   * 
   * @template T - The type of the state value
   * @param {string} key - The state key
   * @param {SetStateAction<T>} value - The new value or updater function
   */
  setValue<T = unknown>(key: string, value: SetStateAction<T>): void {
    this.manager.setState<T>(key, value);
  }

  /**
   * Get a state updater function for a specific key
   * 
   * @template T - The type of the state value
   * @param {string} key - The state key
   * @returns {StateUpdater<T>} - Function to update the state
   */
  getUpdater<T = unknown>(key: string): StateUpdater<T> {
    return (value: SetStateAction<T>) => {
      this.manager.setState<T>(key, value);
    };
  }

  /**
   * Get a complete state value object with observable and updater
   * 
   * @template T - The type of the state value
   * @param {string} key - The state key
   * @param {T} [initialValue] - Initial value if the key doesn't exist
   * @returns {StateValue<T>} - Object containing value, updater, and observable
   */
  getStateValue<T = unknown>(key: string, initialValue?: T): StateValue<T> {
    const value$ = this.select<T>(key, initialValue);
    const currentValue = this.manager.getState<T>(key) ?? initialValue;
    const update = this.getUpdater<T>(key);

    return {
      value: currentValue as T,
      update,
      value$,
    };
  }

  /**
   * Check if a key exists in the state
   * 
   * @param {string} key - The state key to check
   * @returns {boolean} - True if the key exists
   */
  hasKey(key: string): boolean {
    return this.manager.hasKey(key);
  }

  /**
   * Initialize a state key with a value if it doesn't exist
   * 
   * @template T - The type of the state value
   * @param {string} key - The state key
   * @param {T} initialValue - The initial value
   */
  initializeKey<T = unknown>(key: string, initialValue: T): void {
    this.manager.initializeKey(key, initialValue);
  }

  /**
   * Remove a key from the state
   * 
   * @param {string} key - The state key to remove
   */
  removeKey(key: string): void {
    // Clean up our local subscriptions and subjects
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(key);
    }

    const subject = this.subjects.get(key);
    if (subject) {
      subject.complete();
      this.subjects.delete(key);
    }

    // Remove from manager
    this.manager.removeKey(key);
  }

  /**
   * Get all current state as an observable
   * 
   * @returns {Observable<GlobalState>} - Observable of the entire state
   */
  selectAll(): Observable<GlobalState> {
    // Create a subject for all state changes
    const allStateKey = '__ALL_STATE__';
    
    if (!this.subjects.has(allStateKey)) {
      const subject = new BehaviorSubject<GlobalState>(this.manager.getAllState());
      this.subjects.set(allStateKey, subject);

      // Subscribe to all changes (this is a simplified implementation)
      // In a real scenario, you might want to optimize this
      const unsubscribe = this.manager.subscribeToAll(() => {
        subject.next(this.manager.getAllState());
      });

      this.subscriptions.set(allStateKey, unsubscribe);
    }

    return this.subjects.get(allStateKey)!.asObservable().pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      shareReplay(1)
    );
  }

  /**
   * Get the current state snapshot (synchronous)
   * 
   * @returns {GlobalState} - Copy of the entire state object
   */
  getAllState(): GlobalState {
    return this.manager.getAllState();
  }

  /**
   * Batch multiple state updates
   * 
   * @param {Partial<GlobalState>} updates - Object with key-value pairs to update
   */
  batchUpdate(updates: Partial<GlobalState>): void {
    this.manager.batchUpdate(updates);
  }

  /**
   * Clear all state
   */
  clear(): void {
    // Clean up all subscriptions and subjects
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subjects.forEach(subject => subject.complete());
    this.subscriptions.clear();
    this.subjects.clear();

    // Clear manager state
    this.manager.clear();
  }

  /**
   * Get debug information about the service
   * 
   * @returns {object} - Debug information
   */
  getDebugInfo() {
    return {
      ...this.manager.getDebugInfo(),
      angularSubscriptions: this.subscriptions.size,
      angularSubjects: this.subjects.size,
    };
  }

  /**
   * Access the underlying core manager (for advanced usage)
   * 
   * @returns {FusionStateManager} - The core state manager
   */
  getCoreManager(): FusionStateManager {
    return this.manager;
  }

  /**
   * Cleanup on service destroy
   */
  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();

    // Complete all subjects
    this.subjects.forEach(subject => subject.complete());
    this.subjects.clear();
  }
}
