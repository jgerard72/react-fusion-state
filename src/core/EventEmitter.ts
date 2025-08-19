import {
  StateChangeCallback,
  UnsubscribeFunction,
  Subscriber,
} from './types';

/**
 * Simple event emitter for state change notifications
 * Framework-agnostic implementation
 */
export class EventEmitter {
  private subscribers = new Map<string, Set<Subscriber<unknown>>>();
  private subscriberCounter = 0;

  /**
   * Subscribe to state changes for a specific key
   * @param key - The state key to watch
   * @param callback - Function to call when the key changes
   * @returns Unsubscribe function
   */
  subscribe<T = unknown>(
    key: string,
    callback: StateChangeCallback<T>
  ): UnsubscribeFunction {
    const subscriberId = `sub_${++this.subscriberCounter}`;
    const subscriber: Subscriber<unknown> = {
      id: subscriberId,
      key,
      callback: callback as StateChangeCallback,
    };

    // Get or create subscribers set for this key
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    const keySubscribers = this.subscribers.get(key)!;
    keySubscribers.add(subscriber);

    // Return unsubscribe function
    return () => {
      keySubscribers.delete(subscriber);
      
      // Clean up empty sets
      if (keySubscribers.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  /**
   * Emit a state change event for a specific key
   * @param key - The state key that changed
   * @param newValue - The new value
   * @param oldValue - The previous value
   */
  emit<T = unknown>(key: string, newValue: T, oldValue: T): void {
    const keySubscribers = this.subscribers.get(key);
    
    if (!keySubscribers || keySubscribers.size === 0) {
      return;
    }

    // Notify all subscribers for this key
    keySubscribers.forEach(subscriber => {
      try {
        subscriber.callback(newValue, oldValue, key);
      } catch (error) {
        console.error(`Error in state change callback for key "${key}":`, error);
      }
    });
  }

  /**
   * Get the number of subscribers for a specific key
   * @param key - The state key
   * @returns Number of subscribers
   */
  getSubscriberCount(key: string): number {
    const keySubscribers = this.subscribers.get(key);
    return keySubscribers ? keySubscribers.size : 0;
  }

  /**
   * Get total number of subscribers across all keys
   * @returns Total number of subscribers
   */
  getTotalSubscriberCount(): number {
    let total = 0;
    this.subscribers.forEach(keySubscribers => {
      total += keySubscribers.size;
    });
    return total;
  }

  /**
   * Get all subscribed keys
   * @returns Array of keys that have subscribers
   */
  getSubscribedKeys(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Clear all subscribers (useful for cleanup)
   */
  clear(): void {
    this.subscribers.clear();
  }

  /**
   * Remove all subscribers for a specific key
   * @param key - The state key
   */
  clearKey(key: string): void {
    this.subscribers.delete(key);
  }
}
