/**
 * React Fusion State DevTools - Popup Script
 * Logic for the extension popup
 */

class DevToolsPopup {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkPageStatus();
    }
    
    setupEventListeners() {
        document.getElementById('openDevTools').addEventListener('click', () => {
            this.openDevTools();
        });
        
        document.getElementById('refreshPage').addEventListener('click', () => {
            this.refreshPage();
        });
    }
    
    checkPageStatus() {
        // Get current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            
            if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
                this.updateStatus('disconnected', 'DevTools not available on this page');
                return;
            }
            
            // Check if the page has React Fusion State
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: this.detectFusionState
            }, (results) => {
                if (chrome.runtime.lastError) {
                    this.updateStatus('disconnected', 'Cannot access this page');
                    return;
                }
                
                const result = results[0]?.result;
                if (result && result.detected) {
                    this.updateStatus('connected', `Found ${result.stateCount} state(s)`);
                } else {
                    this.updateStatus('disconnected', 'React Fusion State not detected');
                }
            });
        });
    }
    
    detectFusionState() {
        // This function runs in the page context
        try {
            // Check for React
            const hasReact = typeof React !== 'undefined';
            
            // Check for existing monitoring
            const hasMonitoring = !!window.__FUSION_DEVTOOLS_API__;
            
            // Check localStorage for persisted state
            const stateKeys = Object.keys(localStorage).filter(key => 
                key.includes('fusion_state') || key.includes('_all')
            );
            
            let stateCount = 0;
            if (hasMonitoring) {
                const states = window.__FUSION_DEVTOOLS_API__.getStates();
                stateCount = Object.keys(states).length;
            } else if (stateKeys.length > 0) {
                try {
                    const stored = localStorage.getItem(stateKeys[0]);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        stateCount = Object.keys(parsed).length;
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
            
            return {
                hasReact,
                hasMonitoring,
                stateCount,
                detected: hasReact || hasMonitoring || stateKeys.length > 0
            };
        } catch (e) {
            return {
                hasReact: false,
                hasMonitoring: false,
                stateCount: 0,
                detected: false,
                error: e.message
            };
        }
    }
    
    updateStatus(type, message) {
        const statusEl = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        
        statusEl.className = `status ${type}`;
        statusText.textContent = message;
        
        // Update button states
        const openBtn = document.getElementById('openDevTools');
        if (type === 'connected') {
            openBtn.disabled = false;
            openBtn.textContent = 'Open DevTools Panel';
        } else {
            openBtn.disabled = true;
            openBtn.textContent = 'DevTools Unavailable';
        }
    }
    
    openDevTools() {
        // Focus on the DevTools
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            
            // Send message to open DevTools (this will be handled by the content script)
            chrome.tabs.sendMessage(tab.id, { type: 'OPEN_DEVTOOLS' }, (response) => {
                // Close popup
                window.close();
            });
        });
        
        // Also try to programmatically open DevTools
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // Note: chrome.devtools API is not available in popup context
            // The user will need to manually open DevTools
            alert('Please open Chrome DevTools (F12) and look for the "Fusion State" tab');
        });
    }
    
    refreshPage() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.reload(tabs[0].id, () => {
                // Close popup after refresh
                setTimeout(() => window.close(), 100);
            });
        });
    }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DevToolsPopup();
    });
} else {
    new DevToolsPopup();
}
