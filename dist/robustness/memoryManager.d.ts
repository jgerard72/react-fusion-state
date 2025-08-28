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
export declare class MemoryManager {
    private options;
    private keyMetrics;
    private cleanupTimer;
    private weakRefs;
    constructor(options?: MemoryManagerOptions);
    trackKeyAccess(key: string): void;
    trackListenerAdd(key: string): void;
    trackListenerRemove(key: string): void;
    getKeyMetrics(key: string): KeyMetrics | undefined;
    getMemoryStats(): {
        totalKeys: number;
        totalListeners: number;
        averageListenersPerKey: number;
        inactiveKeys: number;
        memoryUsage: number;
    };
    forceCleanup(): number;
    createWeakRef<T extends object>(obj: T, cleanup?: () => void): {
        deref: () => T | undefined;
    };
    isAlive<T extends object>(weakRef: {
        deref: () => T | undefined;
    }): boolean;
    private startCleanupTimer;
    private runGarbageCollection;
    private estimateMemoryUsage;
    destroy(): void;
}
export declare function getMemoryManager(options?: MemoryManagerOptions): MemoryManager;
export declare function useMemoryTracking(key: string): void;
export declare function logMemoryStats(): void;
