/**
 * 🔴 React Fusion State - Live Broadcaster
 * 
 * Add this script to your React app to broadcast state changes
 * to the Live DevTools Monitor in real-time
 * 
 * Usage: <script src="live-broadcaster.js"></script>
 */

(function() {
    'use strict';
    
    console.log('🔴 React Fusion State Live Broadcaster - Started');
    
    let channel = null;
    let currentState = {};
    let isMonitoring = false;
    
    // Initialize broadcast channel
    function initBroadcastChannel() {
        try {
            channel = new BroadcastChannel('fusion-state-devtools');
            
            // Listen for requests from monitor
            channel.onmessage = (event) => {
                const { type } = event.data;
                
                if (type === 'REQUEST_STATE') {
                    // Send current state to monitor
                    broadcastState();
                }
            };
            
            console.log('📡 Broadcast channel initialized');
            return true;
        } catch (e) {
            console.warn('⚠️ BroadcastChannel not supported');
            return false;
        }
    }
    
    // Broadcast current state
    function broadcastState() {
        if (!channel || Object.keys(currentState).length === 0) return;
        
        try {
            channel.postMessage({
                type: 'STATE_UPDATE',
                data: { ...currentState },
                timestamp: Date.now()
            });
            
            // Also send heartbeat
            channel.postMessage({
                type: 'HEARTBEAT',
                timestamp: Date.now()
            });
            
        } catch (e) {
            console.warn('Failed to broadcast state:', e);
        }
    }
    
    // Monitor state changes
    function startMonitoring() {
        if (isMonitoring) return;
        isMonitoring = true;
        
        // Method 1: Hook into console logs
        const originalLog = console.log;
        console.log = function(...args) {
            // Detect React Fusion State logs
            if (args[0] && typeof args[0] === 'string') {
                if (args[0].includes('[FusionState]') && args[1]) {
                    extractStateFromLog(args[1]);
                } else if (args[0].includes('State saved:') && args[1]) {
                    extractStateFromLog(args[1]);
                }
            }
            return originalLog.apply(console, args);
        };
        
        // Method 2: Monitor localStorage changes
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key.includes('fusion_state') || key.includes('_all')) {
                try {
                    const parsed = JSON.parse(value);
                    updateCurrentState(parsed);
                } catch (e) {
                    // Not JSON, ignore
                }
            }
            return originalSetItem.apply(localStorage, arguments);
        };
        
        // Method 3: Monitor global state changes
        monitorGlobalState();
        
        // Method 4: Periodic state detection
        setInterval(detectStateChanges, 1000);
        
        console.log('👀 Started monitoring state changes');
    }
    
    // Extract state from console logs
    function extractStateFromLog(logData) {
        if (logData && typeof logData === 'object') {
            if (logData.next) {
                // From [FusionState] State updated logs
                updateCurrentState(logData.next);
            } else if (logData.state) {
                // From other logs
                updateCurrentState(logData.state);
            } else {
                // Direct state object
                updateCurrentState(logData);
            }
        }
    }
    
    // Monitor global state (React DevTools integration)
    function monitorGlobalState() {
        // Hook into React DevTools if available
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            const devtools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            
            const originalOnCommit = devtools.onCommitFiberRoot;
            devtools.onCommitFiberRoot = function(id, root, ...args) {
                // Scan for state changes
                setTimeout(() => scanForStateChanges(root), 0);
                
                if (originalOnCommit) {
                    return originalOnCommit.call(this, id, root, ...args);
                }
            };
        }
        
        // Monitor window state changes
        if (window.__FUSION_STATE__) {
            const originalState = window.__FUSION_STATE__;
            Object.keys(originalState).forEach(key => {
                if (typeof originalState[key] === 'object') {
                    updateCurrentState(originalState[key]);
                }
            });
        }
    }
    
    // Scan React fiber tree for state changes
    function scanForStateChanges(root) {
        try {
            // Look for context providers with state
            const contextProviders = findContextProviders(root.current);
            contextProviders.forEach(provider => {
                if (provider.memoizedProps && provider.memoizedProps.value) {
                    const value = provider.memoizedProps.value;
                    if (value.state && typeof value.state === 'object') {
                        updateCurrentState(value.state);
                    }
                }
            });
        } catch (e) {
            // Ignore scanning errors
        }
    }
    
    // Find context providers in fiber tree
    function findContextProviders(fiber, providers = []) {
        if (!fiber) return providers;
        
        // Check if this is a context provider
        if (fiber.elementType && fiber.elementType._context) {
            providers.push(fiber);
        }
        
        // Recursively search children
        let child = fiber.child;
        while (child) {
            findContextProviders(child, providers);
            child = child.sibling;
        }
        
        return providers;
    }
    
    // Detect state changes through various methods
    function detectStateChanges() {
        // Check localStorage for fusion state
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.includes('fusion_state') || key.includes('_all')) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        const parsed = JSON.parse(value);
                        updateCurrentState(parsed);
                    }
                }
            });
        } catch (e) {
            // Ignore errors
        }
        
        // Check global variables
        if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
            // Advanced React state detection could go here
        }
    }
    
    // Update current state and broadcast
    function updateCurrentState(newState) {
        if (!newState || typeof newState !== 'object') return;
        
        let hasChanges = false;
        
        // Check for changes
        Object.keys(newState).forEach(key => {
            if (JSON.stringify(currentState[key]) !== JSON.stringify(newState[key])) {
                currentState[key] = newState[key];
                hasChanges = true;
            }
        });
        
        // Remove keys that no longer exist
        Object.keys(currentState).forEach(key => {
            if (!(key in newState)) {
                delete currentState[key];
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            broadcastState();
            console.log('📡 Broadcasting state update:', Object.keys(currentState));
        }
    }
    
    // Initialize
    function init() {
        if (initBroadcastChannel()) {
            startMonitoring();
            
            // Send heartbeat every 2 seconds
            setInterval(() => {
                if (channel) {
                    channel.postMessage({
                        type: 'HEARTBEAT',
                        timestamp: Date.now()
                    });
                }
            }, 2000);
            
            console.log('🔴 Live broadcasting enabled');
            console.log('📺 Open live-devtools.html to monitor state changes');
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Global API
    window.__FUSION_LIVE_BROADCASTER__ = {
        getCurrentState: () => currentState,
        broadcastState: broadcastState,
        isMonitoring: () => isMonitoring
    };
    
})();
