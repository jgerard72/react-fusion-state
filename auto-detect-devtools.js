/**
 * 🔍 Auto-Detect DevTools for React Fusion State
 * 
 * Add this script to your existing app to automatically detect and monitor
 * React Fusion State usage without modifying your code.
 * 
 * Usage: <script src="auto-detect-devtools.js"></script>
 */

(function() {
    'use strict';
    
    console.log('🔍 React Fusion State Auto-Detect DevTools - Starting...');
    
    let detectedState = {};
    let devToolsPanel = null;
    let isVisible = false;
    
    // Create DevTools Panel
    function createDevToolsPanel() {
        const panel = document.createElement('div');
        panel.id = 'fusion-auto-devtools';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-height: 400px;
            background: #1e1e1e;
            color: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            font-family: monospace;
            font-size: 13px;
            z-index: 999999;
            border: 2px solid #007bff;
            display: none;
        `;
        
        document.body.appendChild(panel);
        return panel;
    }
    
    // Update panel content
    function updatePanel() {
        if (!devToolsPanel) return;
        
        const stateKeys = Object.keys(detectedState);
        
        devToolsPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #333;">
                <strong>🔍 Auto DevTools</strong>
                <button onclick="window.__FUSION_AUTO_DEVTOOLS__.hide()" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">✕</button>
            </div>
            ${stateKeys.length === 0 ? 
                '<div style="text-align: center; color: #888; padding: 20px;">🔍 Scanning for React Fusion State...<br><small>Use your app to generate state changes</small></div>' :
                `<div style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; text-align: center; margin-bottom: 10px;">🟢 DETECTED - ${stateKeys.length} states</div>` +
                stateKeys.map(key => `
                    <div style="background: #2a2a2a; margin: 8px 0; padding: 10px; border-radius: 6px; border: 1px solid #444;">
                        <div style="color: #4fc3f7; font-weight: bold; margin-bottom: 5px;">📊 ${key}</div>
                        <div style="color: #ffa726; word-break: break-all; font-size: 12px; max-height: 100px; overflow-y: auto;">
                            ${JSON.stringify(detectedState[key], null, 2)}
                        </div>
                    </div>
                `).join('')
            }
        `;
    }
    
    // Show/hide panel
    function showPanel() {
        if (!devToolsPanel) {
            devToolsPanel = createDevToolsPanel();
        }
        devToolsPanel.style.display = 'block';
        isVisible = true;
        updatePanel();
        console.log('🛠️ Auto DevTools opened');
    }
    
    function hidePanel() {
        if (devToolsPanel) {
            devToolsPanel.style.display = 'none';
        }
        isVisible = false;
        console.log('🛠️ Auto DevTools closed');
    }
    
    function togglePanel() {
        if (isVisible) {
            hidePanel();
        } else {
            showPanel();
        }
    }
    
    // Monitor for React Fusion State activity
    function startMonitoring() {
        // Method 1: Hook console.log to catch state logs
        const originalLog = console.log;
        console.log = function(...args) {
            const result = originalLog.apply(console, args);
            
            // Look for React Fusion State patterns
            if (args[0] && typeof args[0] === 'string') {
                if (args[0].includes('State updated:') || args[0].includes('[FusionState]')) {
                    if (args[1] && typeof args[1] === 'object') {
                        updateDetectedState(args[1]);
                    }
                }
            }
            
            return result;
        };
        
        // Method 2: Monitor localStorage for persistence
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            const result = originalSetItem.apply(localStorage, arguments);
            
            if (key.includes('fusion_state') || key.includes('_all')) {
                try {
                    const parsed = JSON.parse(value);
                    updateDetectedState(parsed);
                } catch (e) {
                    // Not JSON, ignore
                }
            }
            
            return result;
        };
        
        // Method 3: Look for existing state in localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.includes('fusion_state') || key.includes('_all')) {
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        const parsed = JSON.parse(value);
                        updateDetectedState(parsed);
                    }
                } catch (e) {
                    // Not JSON, ignore
                }
            }
        });
        
        console.log('👀 Started monitoring for React Fusion State...');
    }
    
    // Update detected state
    function updateDetectedState(newState) {
        if (!newState || typeof newState !== 'object') return;
        
        let hasChanges = false;
        
        // Check for changes
        Object.keys(newState).forEach(key => {
            if (JSON.stringify(detectedState[key]) !== JSON.stringify(newState[key])) {
                detectedState[key] = newState[key];
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            updatePanel();
            console.log('📡 Detected state update:', Object.keys(detectedState));
        }
    }
    
    // Keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '`') {
            e.preventDefault();
            togglePanel();
        }
    });
    
    // Global API
    window.__FUSION_AUTO_DEVTOOLS__ = {
        show: showPanel,
        hide: hidePanel,
        toggle: togglePanel,
        getState: () => detectedState,
        isVisible: () => isVisible
    };
    
    // Start monitoring
    startMonitoring();
    
    console.log('🎯 Auto DevTools ready!');
    console.log('📝 Use your app normally - states will be detected automatically');
    console.log('⌨️ Press Ctrl+` (or Cmd+` on macOS) to toggle DevTools');
    console.log('🔧 Or use: window.__FUSION_AUTO_DEVTOOLS__.toggle()');
    
    // Show welcome message after 2 seconds if no state detected
    setTimeout(() => {
        if (Object.keys(detectedState).length === 0) {
            console.log('💡 No React Fusion State detected yet. Make sure your app uses:');
            console.log('   - useFusionState() hooks');
            console.log('   - FusionStateProvider wrapper');
            console.log('   - State changes (click buttons, type in inputs, etc.)');
        }
    }, 2000);
    
})();
