/**
 * Memory management and leak prevention system
 */
import React from 'react';

export interface MemoryManagerOptions {
  maxListenersPerKey?: number;

  cleanupInterval?: number;

  enableGC?: boolean;

  maxInactiveTime?: number;
}

export interface KeyMetrics {
  listenerCount: number;
  lastAccessed: number;
  accessCount: number;
  memoryUsage: number;
}

export class MemoryManager {
  private options: Required<MemoryManagerOptions>;
  private keyMetrics = new Map<string, KeyMetrics>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private weakRefs = new WeakMap();

  constructor(options: MemoryManagerOptions = {}) {
    this.options = {
      maxListenersPerKey: 50,
      cleanupInterval: 30000, // 30 seconds
      enableGC: true,
      maxInactiveTime: 300000, // 5 minutes
      ...options,
    };

    if (this.options.enableGC) {
      this.startCleanupTimer();
    }
  }

  public trackKeyAccess(key: string): void {
    const existing = this.keyMetrics.get(key);
    const now = Date.now();

    if (existing) {
      existing.lastAccessed = now;
      existing.accessCount++;
    } else {
      this.keyMetrics.set(key, {
        listenerCount: 0,
        lastAccessed: now,
        accessCount: 1,
        memoryUsage: 0,
      });
    }
  }

  public trackListenerAdd(key: string): void {
    const metrics = this.keyMetrics.get(key);
    if (metrics) {
      metrics.listenerCount++;

      if (metrics.listenerCount > this.options.maxListenersPerKey) {
        console.warn(
          `[FusionState] Memory leak warning: Key "${key}" has ${metrics.listenerCount} listeners. ` +
            'This might indicate a memory leak. Check for components that are not properly unmounting.',
        );
      }
    }
  }

  public trackListenerRemove(key: string): void {
    const metrics = this.keyMetrics.get(key);
    if (metrics && metrics.listenerCount > 0) {
      metrics.listenerCount--;
    }
  }

  public getKeyMetrics(key: string): KeyMetrics | undefined {
    return this.keyMetrics.get(key);
  }

  public getMemoryStats(): {
    totalKeys: number;
    totalListeners: number;
    averageListenersPerKey: number;
    inactiveKeys: number;
    memoryUsage: number;
  } {
    const keys = Array.from(this.keyMetrics.values());
    const totalListeners = keys.reduce(
      (sum, metrics) => sum + metrics.listenerCount,
      0,
    );
    const now = Date.now();
    const inactiveKeys = keys.filter(
      metrics => now - metrics.lastAccessed > this.options.maxInactiveTime,
    ).length;

    return {
      totalKeys: keys.length,
      totalListeners,
      averageListenersPerKey:
        keys.length > 0 ? totalListeners / keys.length : 0,
      inactiveKeys,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  public forceCleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, metrics] of this.keyMetrics.entries()) {
      if (
        metrics.listenerCount === 0 &&
        now - metrics.lastAccessed > this.options.maxInactiveTime
      ) {
        this.keyMetrics.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[FusionState] Cleaned up ${cleanedCount} inactive keys`);
    }

    return cleanedCount;
  }

  public createWeakRef<T extends object>(
    obj: T,
    cleanup?: () => void,
  ): {deref: () => T | undefined} {
    if (cleanup) {
      this.weakRefs.set(obj, cleanup);
    }

    return {deref: () => obj};
  }

  public isAlive<T extends object>(weakRef: {
    deref: () => T | undefined;
  }): boolean {
    return weakRef.deref() !== undefined;
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.forceCleanup();
      this.runGarbageCollection();
    }, this.options.cleanupInterval);
  }

  private runGarbageCollection(): void {
    if (typeof global !== 'undefined' && global.gc) {
      try {
        global.gc();
      } catch (error) {}
    }
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const [key, metrics] of this.keyMetrics.entries()) {
      totalSize += key.length * 2;
      totalSize += 64;
    }

    return totalSize;
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.keyMetrics.clear();
    this.weakRefs = new WeakMap();
  }
}

let globalMemoryManager: MemoryManager | null = null;

export function getMemoryManager(
  options?: MemoryManagerOptions,
): MemoryManager {
  if (!globalMemoryManager) {
    globalMemoryManager = new MemoryManager(options);
  }
  return globalMemoryManager;
}

export function useMemoryTracking(key: string): void {
  const memoryManager = getMemoryManager();

  React.useEffect(() => {
    memoryManager.trackKeyAccess(key);
    memoryManager.trackListenerAdd(key);

    return () => {
      memoryManager.trackListenerRemove(key);
    };
  }, [key, memoryManager]);
}

export function logMemoryStats(): void {
  if (process.env.NODE_ENV === 'development') {
    const memoryManager = getMemoryManager();
    const stats = memoryManager.getMemoryStats();

    console.group('[FusionState] Memory Statistics');
    console.log('Total Keys:', stats.totalKeys);
    console.log('Total Listeners:', stats.totalListeners);
    console.log(
      'Average Listeners per Key:',
      stats.averageListenersPerKey.toFixed(2),
    );
    console.log('Inactive Keys:', stats.inactiveKeys);
    console.log('Estimated Memory Usage:', `${stats.memoryUsage} bytes`);
    console.groupEnd();
  }
}
