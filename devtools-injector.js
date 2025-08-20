/**
 * 🛠️ React Fusion State DevTools - Auto Injector
 * 
 * Add this script to any page to automatically detect and monitor React Fusion State
 * No code changes needed - completely transparent!
 * 
 * Usage:
 * <script src="devtools-injector.js"></script>
 */

(function() {
    'use strict';
    
    console.log('🔍 React Fusion State DevTools - Auto Detection Started');
    
    let devToolsPanel = null;
    let isVisible = false;
    let detectedState = {};
    let stateSubscribers = [];
    
    // Auto-detect React Fusion State usage
    function detectFusionState() {
        // Look for React Fusion State context in the DOM
        const reactFiberKey = Object.keys(document.querySelector('#root') || document.body)
            .find(key => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance'));
        
        if (reactFiberKey) {
            console.log('✅ React detected');
            
            // Hook into React DevTools if available
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                console.log('✅ React DevTools detected');
                hookIntoReactDevTools();
            }
            
            // Monitor for state changes
            monitorStateChanges();
        }
        
        return reactFiberKey;
    }
    
    // Monitor state changes in the page
    function monitorStateChanges() {
        // Override console.log to catch React Fusion State logs
        const originalLog = console.log;
        console.log = function(...args) {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('FusionState')) {
                // Detected React Fusion State activity
                if (args[1] && typeof args[1] === 'object') {
                    updateDetectedState(args[1]);
                }
            }
            return originalLog.apply(console, args);
        };
        
        // Monitor localStorage changes (for persistence)
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key.includes('fusion_state') || key.includes('_all')) {
                try {
                    const parsed = JSON.parse(value);
                    updateDetectedState(parsed);
                    console.log('💾 Detected state persistence:', parsed);
                } catch (e) {
                    // Not JSON, ignore
                }
            }
            return originalSetItem.apply(localStorage, arguments);
        };
    }
    
    // Hook into React DevTools
    function hookIntoReactDevTools() {
        const devtools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        
        devtools.onCommitFiberRoot = (function(original) {
            return function(id, root, ...args) {
                // Scan for React Fusion State
                scanFiberTree(root.current);
                return original.call(this, id, root, ...args);
            };
        })(devtools.onCommitFiberRoot || (() => {}));
    }
    
    // Scan React fiber tree for state
    function scanFiberTree(fiber) {
        if (!fiber) return;
        
        // Look for Context providers and state
        if (fiber.memoizedState || fiber.memoizedProps) {
            extractStateFromFiber(fiber);
        }
        
        // Recursively scan children
        let child = fiber.child;
        while (child) {
            scanFiberTree(child);
            child = child.sibling;
        }
    }
    
    // Extract state from React fiber
    function extractStateFromFiber(fiber) {
        if (fiber.memoizedState) {
            const state = fiber.memoizedState;
            if (state && typeof state.memoizedState === 'object') {
                updateDetectedState(state.memoizedState);
            }
        }
    }
    
    // Update detected state
    function updateDetectedState(newState) {
        if (newState && typeof newState === 'object') {
            detectedState = { ...detectedState, ...newState };
            notifySubscribers();
        }
    }
    
    // Notify subscribers of state changes
    function notifySubscribers() {
        stateSubscribers.forEach(callback => {
            try {
                callback(detectedState);
            } catch (e) {
                console.warn('DevTools subscriber error:', e);
            }
        });
    }
    
    // Subscribe to state changes
    function subscribe(callback) {
        stateSubscribers.push(callback);
        return () => {
            const index = stateSubscribers.indexOf(callback);
            if (index > -1) {
                stateSubscribers.splice(index, 1);
            }
        };
    }
    
    // Create DevTools Panel
    function createDevToolsPanel() {
        const panel = document.createElement('div');
        panel.id = 'fusion-devtools-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background: #1a1a1a;
            color: white;
            border: 1px solid #333;
            border-radius: 8px;
            font-family: Monaco, Consolas, 'Courier New', monospace;
            font-size: 12px;
            z-index: 999999;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            display: none;
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #2d2d2d;
            padding: 12px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const title = document.createElement('strong');
        title.textContent = '🔍 Auto DevTools';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: #666;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            padding: 4px 8px;
        `;
        closeBtn.onclick = hideDevTools;
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Content
        const content = document.createElement('div');
        content.id = 'fusion-devtools-content';
        content.style.cssText = `
            padding: 12px;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        panel.appendChild(header);
        panel.appendChild(content);
        document.body.appendChild(panel);
        
        return panel;
    }
    
    // Update panel content
    function updatePanelContent() {
        if (!devToolsPanel) return;
        
        const content = document.getElementById('fusion-devtools-content');
        if (!content) return;
        
        const stateKeys = Object.keys(detectedState);
        
        if (stateKeys.length === 0) {
            content.innerHTML = `
                <div style="color: #888; text-align: center; padding: 20px;">
                    🔍 Monitoring for React Fusion State...<br>
                    <small>Interact with your app to see state changes</small>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; text-align: center; margin-bottom: 10px;">
                🟢 LIVE - ${stateKeys.length} state keys detected
            </div>
            ${stateKeys.map(key => `
                <div style="margin-bottom: 8px; border: 1px solid #333; border-radius: 4px; background: #222;">
                    <div style="padding: 6px 10px; background: #2a2a2a; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; color: #4fc3f7;">${key}</span>
                        <span style="color: #ffa726; font-size: 10px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${JSON.stringify(detectedState[key])}
                        </span>
                    </div>
                    <div style="padding: 10px;">
                        <pre style="background: #1a1a1a; padding: 8px; border-radius: 4px; margin: 0; font-size: 10px; white-space: pre-wrap; max-height: 100px; overflow: auto; border: 1px solid #333;">
${JSON.stringify(detectedState[key], null, 2)}
                        </pre>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    // Show DevTools
    function showDevTools() {
        if (!devToolsPanel) {
            devToolsPanel = createDevToolsPanel();
        }
        devToolsPanel.style.display = 'block';
        isVisible = true;
        updatePanelContent();
        console.log('🛠️ DevTools Panel opened');
    }
    
    // Hide DevTools
    function hideDevTools() {
        if (devToolsPanel) {
            devToolsPanel.style.display = 'none';
        }
        isVisible = false;
        console.log('🛠️ DevTools Panel closed');
    }
    
    // Toggle DevTools
    function toggleDevTools() {
        if (isVisible) {
            hideDevTools();
        } else {
            showDevTools();
        }
    }
    
    // Keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '`') {
            e.preventDefault();
            toggleDevTools();
        }
    });
    
    // Subscribe to state changes to update panel
    subscribe(updatePanelContent);
    
    // Auto-detect on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectFusionState);
    } else {
        detectFusionState();
    }
    
    // Periodic detection for dynamically loaded React apps
    setInterval(() => {
        if (Object.keys(detectedState).length === 0) {
            detectFusionState();
        }
    }, 2000);
    
    // Global API
    window.__FUSION_DEVTOOLS__ = {
        show: showDevTools,
        hide: hideDevTools,
        toggle: toggleDevTools,
        getState: () => detectedState,
        subscribe: subscribe
    };
    
    console.log('🎯 Press Ctrl+` (or Cmd+` on macOS) to toggle DevTools');
    console.log('🔧 Or use: window.__FUSION_DEVTOOLS__.toggle()');
    
})();
