/**
 * React Fusion State DevTools - Injected Script
 * Runs in the page context to monitor React Fusion State
 */

(function() {
    'use strict';
    
    // Prevent multiple injections
    if (window.__FUSION_DEVTOOLS_INJECTED__) return;
    window.__FUSION_DEVTOOLS_INJECTED__ = true;
    
    let detectedStates = {};
    let isMonitoring = false;
    
    console.log('🔧 React Fusion State DevTools - Monitoring started');
    
    // Function to send data to DevTools
    function sendToDevTools(type, data) {
        window.postMessage({
            type: type,
            source: 'fusion-devtools',
            data: data
        }, '*');
    }
    
    // Monitor console logs for React Fusion State patterns
    function hookConsoleLog() {
        const originalLog = console.log;
        console.log = function(...args) {
            const result = originalLog.apply(console, args);
            
            // Detect React Fusion State log patterns
            if (args[0] && typeof args[0] === 'string') {
                // Pattern: console.log('State updated:', key, '=', value)
                if (args[0] === 'State updated:' && args.length >= 4) {
                    const key = args[1];
                    const value = args[3];
                    updateState(key, value);
                }
                // Pattern: console.log('[FusionState] State updated:', {...})
                else if (args[0].includes('[FusionState]') && args[0].includes('State updated:')) {
                    if (args[1] && typeof args[1] === 'object') {
                        if (args[1].next) {
                            updateStates(args[1].next);
                        }
                    }
                }
                // Pattern: console.log('💾 State saved:', {...})
                else if (args[0].includes('State saved:') && args[1]) {
                    updateStates(args[1]);
                }
            }
            
            return result;
        };
    }
    
    // Monitor localStorage for persistence
    function hookLocalStorage() {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            const result = originalSetItem.apply(localStorage, arguments);
            
            // Detect React Fusion State persistence patterns
            if (key.includes('fusion_state') || key.includes('_all')) {
                try {
                    const parsed = JSON.parse(value);
                    updateStates(parsed);
                } catch (e) {
                    // Not JSON, ignore
                }
            }
            
            return result;
        };
    }
    
    // Check existing localStorage for persisted state
    function checkExistingStorage() {
        Object.keys(localStorage).forEach(key => {
            if (key.includes('fusion_state') || key.includes('_all')) {
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        const parsed = JSON.parse(value);
                        updateStates(parsed);
                    }
                } catch (e) {
                    // Not JSON, ignore
                }
            }
        });
    }
    
    // Update a single state
    function updateState(key, value) {
        if (JSON.stringify(detectedStates[key]) !== JSON.stringify(value)) {
            detectedStates[key] = value;
            sendToDevTools('FUSION_STATE_UPDATE', { [key]: value });
        }
    }
    
    // Update multiple states
    function updateStates(newStates) {
        if (!newStates || typeof newStates !== 'object') return;
        
        let hasChanges = false;
        
        Object.keys(newStates).forEach(key => {
            if (JSON.stringify(detectedStates[key]) !== JSON.stringify(newStates[key])) {
                detectedStates[key] = newStates[key];
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            sendToDevTools('FUSION_STATE_DETECTED', detectedStates);
        }
    }
    
    // Monitor React DevTools if available
    function hookReactDevTools() {
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            const devtools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            
            const originalOnCommit = devtools.onCommitFiberRoot;
            devtools.onCommitFiberRoot = function(id, root, ...args) {
                // Scan for state changes in React components
                setTimeout(() => {
                    scanForStateChanges(root);
                }, 0);
                
                if (originalOnCommit) {
                    return originalOnCommit.call(this, id, root, ...args);
                }
            };
        }
    }
    
    // Scan React fiber tree for state changes
    function scanForStateChanges(root) {
        try {
            const contextProviders = findContextProviders(root.current);
            contextProviders.forEach(provider => {
                if (provider.memoizedProps && provider.memoizedProps.value) {
                    const value = provider.memoizedProps.value;
                    if (value.state && typeof value.state === 'object') {
                        updateStates(value.state);
                    }
                }
            });
        } catch (e) {
            // Ignore scanning errors
        }
    }
    
    // Find context providers in React fiber tree
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
    
    // Global API for DevTools interaction
    window.__FUSION_DEVTOOLS_API__ = {
        getStates: () => ({ ...detectedStates }),
        setState: (key, value) => {
            detectedStates[key] = value;
            sendToDevTools('FUSION_STATE_UPDATE', { [key]: value });
            
            // Try to trigger a re-render if React context is available
            if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
                // Advanced React integration could go here
            }
        },
        clearStates: () => {
            detectedStates = {};
            sendToDevTools('FUSION_STATE_DETECTED', {});
        },
        isMonitoring: () => isMonitoring
    };
    
    // Start monitoring
    function startMonitoring() {
        if (isMonitoring) return;
        
        hookConsoleLog();
        hookLocalStorage();
        hookReactDevTools();
        checkExistingStorage();
        
        isMonitoring = true;
        
        // Send initial state if any
        if (Object.keys(detectedStates).length > 0) {
            sendToDevTools('FUSION_STATE_DETECTED', detectedStates);
        }
        
        console.log('🔍 React Fusion State monitoring active');
    }
    
    // Initialize monitoring
    startMonitoring();
    
    // Periodic health check
    setInterval(() => {
        if (Object.keys(detectedStates).length > 0) {
            sendToDevTools('FUSION_STATE_DETECTED', detectedStates);
        }
    }, 5000);
    
})();
