"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMemoryStats = exports.useMemoryTracking = exports.getMemoryManager = exports.MemoryManager = void 0;
/**
 * Memory management and leak prevention system
 */
const react_1 = __importDefault(require("react"));
class MemoryManager {
    constructor(options = {}) {
        this.keyMetrics = new Map();
        this.cleanupTimer = null;
        this.weakRefs = new WeakMap();
        this.options = Object.assign({ maxListenersPerKey: 50, cleanupInterval: 30000, enableGC: true, maxInactiveTime: 300000 }, options);
        if (this.options.enableGC) {
            this.startCleanupTimer();
        }
    }
    trackKeyAccess(key) {
        const existing = this.keyMetrics.get(key);
        const now = Date.now();
        if (existing) {
            existing.lastAccessed = now;
            existing.accessCount++;
        }
        else {
            this.keyMetrics.set(key, {
                listenerCount: 0,
                lastAccessed: now,
                accessCount: 1,
                memoryUsage: 0,
            });
        }
    }
    trackListenerAdd(key) {
        const metrics = this.keyMetrics.get(key);
        if (metrics) {
            metrics.listenerCount++;
            if (metrics.listenerCount > this.options.maxListenersPerKey) {
                console.warn(`[FusionState] Memory leak warning: Key "${key}" has ${metrics.listenerCount} listeners. ` +
                    'This might indicate a memory leak. Check for components that are not properly unmounting.');
            }
        }
    }
    trackListenerRemove(key) {
        const metrics = this.keyMetrics.get(key);
        if (metrics && metrics.listenerCount > 0) {
            metrics.listenerCount--;
        }
    }
    getKeyMetrics(key) {
        return this.keyMetrics.get(key);
    }
    getMemoryStats() {
        const keys = Array.from(this.keyMetrics.values());
        const totalListeners = keys.reduce((sum, metrics) => sum + metrics.listenerCount, 0);
        const now = Date.now();
        const inactiveKeys = keys.filter(metrics => now - metrics.lastAccessed > this.options.maxInactiveTime).length;
        return {
            totalKeys: keys.length,
            totalListeners,
            averageListenersPerKey: keys.length > 0 ? totalListeners / keys.length : 0,
            inactiveKeys,
            memoryUsage: this.estimateMemoryUsage(),
        };
    }
    forceCleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, metrics] of this.keyMetrics.entries()) {
            if (metrics.listenerCount === 0 &&
                now - metrics.lastAccessed > this.options.maxInactiveTime) {
                this.keyMetrics.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`[FusionState] Cleaned up ${cleanedCount} inactive keys`);
        }
        return cleanedCount;
    }
    createWeakRef(obj, cleanup) {
        if (cleanup) {
            this.weakRefs.set(obj, cleanup);
        }
        return { deref: () => obj };
    }
    isAlive(weakRef) {
        return weakRef.deref() !== undefined;
    }
    startCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.cleanupTimer = setInterval(() => {
            this.forceCleanup();
            this.runGarbageCollection();
        }, this.options.cleanupInterval);
    }
    runGarbageCollection() {
        if (typeof global !== 'undefined' && global.gc) {
            try {
                global.gc();
            }
            catch (error) { }
        }
    }
    estimateMemoryUsage() {
        let totalSize = 0;
        for (const [key, metrics] of this.keyMetrics.entries()) {
            totalSize += key.length * 2;
            totalSize += 64;
        }
        return totalSize;
    }
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.keyMetrics.clear();
        this.weakRefs = new WeakMap();
    }
}
exports.MemoryManager = MemoryManager;
let globalMemoryManager = null;
function getMemoryManager(options) {
    if (!globalMemoryManager) {
        globalMemoryManager = new MemoryManager(options);
    }
    return globalMemoryManager;
}
exports.getMemoryManager = getMemoryManager;
function useMemoryTracking(key) {
    const memoryManager = getMemoryManager();
    react_1.default.useEffect(() => {
        memoryManager.trackKeyAccess(key);
        memoryManager.trackListenerAdd(key);
        return () => {
            memoryManager.trackListenerRemove(key);
        };
    }, [key, memoryManager]);
}
exports.useMemoryTracking = useMemoryTracking;
function logMemoryStats() {
    if (process.env.NODE_ENV === 'development') {
        const memoryManager = getMemoryManager();
        const stats = memoryManager.getMemoryStats();
        console.group('[FusionState] Memory Statistics');
        console.log('Total Keys:', stats.totalKeys);
        console.log('Total Listeners:', stats.totalListeners);
        console.log('Average Listeners per Key:', stats.averageListenersPerKey.toFixed(2));
        console.log('Inactive Keys:', stats.inactiveKeys);
        console.log('Estimated Memory Usage:', `${stats.memoryUsage} bytes`);
        console.groupEnd();
    }
}
exports.logMemoryStats = logMemoryStats;
//# sourceMappingURL=memoryManager.js.map