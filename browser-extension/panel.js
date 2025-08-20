/**
 * React Fusion State DevTools - Panel Script
 * Main logic for the DevTools panel
 */

class FusionStateDevToolsPanel {
    constructor() {
        this.states = {};
        this.selectedStateKey = null;
        this.isConnected = false;
        this.updateCount = 0;
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.startMonitoring();
        this.setupEventListeners();
    }
    
    setupUI() {
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.stateList = document.getElementById('stateList');
        this.stateCount = document.getElementById('stateCount');
        this.welcomePanel = document.getElementById('welcomePanel');
        this.stateViewer = document.getElementById('stateViewer');
        this.viewerTitle = document.getElementById('viewerTitle');
        this.jsonViewer = document.getElementById('jsonViewer');
        
        this.updateStatus('disconnected', 'Searching for React Fusion State...');
    }
    
    setupEventListeners() {
        // Toolbar buttons
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refresh();
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearStates();
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportStates();
        });
        
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importStates();
        });
        
        // State viewer buttons
        document.getElementById('editBtn').addEventListener('click', () => {
            this.editState();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetState();
        });
        
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyState();
        });
    }
    
    startMonitoring() {
        // Inject content script to monitor the page
        this.injectMonitoringScript();
        
        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'FUSION_STATE_UPDATE') {
                this.handleStateUpdate(message.data);
            } else if (message.type === 'FUSION_STATE_DETECTED') {
                this.handleDetection(message.data);
            }
        });
        
        // Periodic refresh
        setInterval(() => {
            this.requestStateUpdate();
        }, 1000);
    }
    
    injectMonitoringScript() {
        // Inject script into the inspected page
        chrome.devtools.inspectedWindow.eval(`
            (function() {
                if (window.__FUSION_DEVTOOLS_INJECTED__) return;
                window.__FUSION_DEVTOOLS_INJECTED__ = true;
                
                let detectedStates = {};
                
                // Monitor console logs for React Fusion State
                const originalLog = console.log;
                console.log = function(...args) {
                    const result = originalLog.apply(console, args);
                    
                    if (args[0] && typeof args[0] === 'string') {
                        if (args[0].includes('State updated:') || args[0].includes('[FusionState]')) {
                            if (args.length >= 3) {
                                const key = args[1];
                                const value = args[2];
                                detectedStates[key] = value;
                                
                                // Send to DevTools
                                window.postMessage({
                                    type: 'FUSION_STATE_DETECTED',
                                    source: 'fusion-devtools',
                                    data: { [key]: value }
                                }, '*');
                            }
                        }
                    }
                    
                    return result;
                };
                
                // Monitor localStorage changes
                const originalSetItem = localStorage.setItem;
                localStorage.setItem = function(key, value) {
                    const result = originalSetItem.apply(localStorage, arguments);
                    
                    if (key.includes('fusion_state') || key.includes('_all')) {
                        try {
                            const parsed = JSON.parse(value);
                            Object.assign(detectedStates, parsed);
                            
                            window.postMessage({
                                type: 'FUSION_STATE_DETECTED',
                                source: 'fusion-devtools',
                                data: parsed
                            }, '*');
                        } catch (e) {
                            // Not JSON, ignore
                        }
                    }
                    
                    return result;
                };
                
                // Check existing localStorage
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('fusion_state') || key.includes('_all')) {
                        try {
                            const value = localStorage.getItem(key);
                            if (value) {
                                const parsed = JSON.parse(value);
                                Object.assign(detectedStates, parsed);
                            }
                        } catch (e) {
                            // Not JSON, ignore
                        }
                    }
                });
                
                // Send initial state if any
                if (Object.keys(detectedStates).length > 0) {
                    window.postMessage({
                        type: 'FUSION_STATE_DETECTED',
                        source: 'fusion-devtools',
                        data: detectedStates
                    }, '*');
                }
                
                // Global API for manual interaction
                window.__FUSION_DEVTOOLS_API__ = {
                    getStates: () => detectedStates,
                    setState: (key, value) => {
                        detectedStates[key] = value;
                        console.log('DevTools: State updated:', key, '=', value);
                    }
                };
                
                console.log('🔧 React Fusion State DevTools monitoring active');
            })();
        `);
    }
    
    requestStateUpdate() {
        chrome.devtools.inspectedWindow.eval(`
            if (window.__FUSION_DEVTOOLS_API__) {
                const states = window.__FUSION_DEVTOOLS_API__.getStates();
                window.postMessage({
                    type: 'FUSION_STATE_DETECTED',
                    source: 'fusion-devtools',
                    data: states
                }, '*');
            }
        `);
    }
    
    handleStateUpdate(data) {
        this.handleDetection(data);
    }
    
    handleDetection(data) {
        if (!data || typeof data !== 'object') return;
        
        let hasChanges = false;
        
        // Update states
        Object.keys(data).forEach(key => {
            if (JSON.stringify(this.states[key]) !== JSON.stringify(data[key])) {
                this.states[key] = data[key];
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            this.updateCount++;
            this.isConnected = true;
            this.updateUI();
            this.updateStatus('connected', `${Object.keys(this.states).length} states • ${this.updateCount} updates`);
        }
    }
    
    updateStatus(status, message) {
        this.statusText.textContent = message;
        
        if (status === 'connected') {
            this.statusIndicator.classList.remove('disconnected');
        } else {
            this.statusIndicator.classList.add('disconnected');
        }
    }
    
    updateUI() {
        this.updateStateList();
        this.updateStateCount();
        
        if (this.selectedStateKey && this.states[this.selectedStateKey]) {
            this.showStateViewer(this.selectedStateKey);
        }
    }
    
    updateStateList() {
        const stateKeys = Object.keys(this.states).sort();
        
        if (stateKeys.length === 0) {
            this.stateList.innerHTML = `
                <li class="no-states">
                    <div class="icon">🔍</div>
                    <div>No states detected</div>
                    <div style="font-size: 12px; margin-top: 8px;">
                        Interact with your app to see state changes
                    </div>
                </li>
            `;
            return;
        }
        
        this.stateList.innerHTML = stateKeys.map(key => {
            const value = this.states[key];
            const isActive = this.selectedStateKey === key;
            
            return `
                <li class="state-item ${isActive ? 'active' : ''}" data-key="${key}">
                    <div class="state-key">${key}</div>
                    <div class="state-type">${typeof value}${value === null ? ' (null)' : ''}</div>
                    <div class="state-preview">${this.formatPreview(value)}</div>
                </li>
            `;
        }).join('');
        
        // Add click listeners
        this.stateList.querySelectorAll('.state-item').forEach(item => {
            item.addEventListener('click', () => {
                const key = item.dataset.key;
                this.selectState(key);
            });
        });
    }
    
    updateStateCount() {
        const count = Object.keys(this.states).length;
        this.stateCount.textContent = `${count} state${count !== 1 ? 's' : ''}`;
    }
    
    formatPreview(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') {
            return `"${value.length > 30 ? value.substring(0, 30) + '...' : value}"`;
        }
        if (typeof value === 'object') {
            const str = JSON.stringify(value);
            return str.length > 50 ? str.substring(0, 50) + '...' : str;
        }
        return String(value);
    }
    
    selectState(key) {
        this.selectedStateKey = key;
        this.updateStateList();
        this.showStateViewer(key);
    }
    
    showStateViewer(key) {
        const value = this.states[key];
        
        this.welcomePanel.style.display = 'none';
        this.stateViewer.style.display = 'block';
        
        this.viewerTitle.textContent = key;
        this.jsonViewer.textContent = JSON.stringify(value, null, 2);
    }
    
    refresh() {
        this.requestStateUpdate();
        this.updateStatus('connected', 'Refreshing...');
    }
    
    clearStates() {
        this.states = {};
        this.selectedStateKey = null;
        this.updateCount = 0;
        this.updateUI();
        this.welcomePanel.style.display = 'block';
        this.stateViewer.style.display = 'none';
        this.updateStatus('disconnected', 'States cleared');
    }
    
    exportStates() {
        const dataStr = JSON.stringify(this.states, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `fusion-state-export-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    importStates() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    this.states = { ...this.states, ...imported };
                    this.updateUI();
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    editState() {
        if (!this.selectedStateKey) return;
        
        const currentValue = this.states[this.selectedStateKey];
        const newValue = prompt('Edit state value (JSON):', JSON.stringify(currentValue, null, 2));
        
        if (newValue !== null) {
            try {
                const parsed = JSON.parse(newValue);
                
                // Update in the page
                chrome.devtools.inspectedWindow.eval(`
                    if (window.__FUSION_DEVTOOLS_API__) {
                        window.__FUSION_DEVTOOLS_API__.setState('${this.selectedStateKey}', ${JSON.stringify(parsed)});
                    }
                `);
                
                this.states[this.selectedStateKey] = parsed;
                this.updateUI();
            } catch (e) {
                alert('Invalid JSON format');
            }
        }
    }
    
    resetState() {
        if (!this.selectedStateKey) return;
        
        if (confirm(`Reset "${this.selectedStateKey}" to null?`)) {
            chrome.devtools.inspectedWindow.eval(`
                if (window.__FUSION_DEVTOOLS_API__) {
                    window.__FUSION_DEVTOOLS_API__.setState('${this.selectedStateKey}', null);
                }
            `);
            
            this.states[this.selectedStateKey] = null;
            this.updateUI();
        }
    }
    
    copyState() {
        if (!this.selectedStateKey) return;
        
        const value = JSON.stringify(this.states[this.selectedStateKey], null, 2);
        navigator.clipboard.writeText(value).then(() => {
            // Could show a toast notification
            console.log('State copied to clipboard');
        });
    }
}

// Initialize panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.devToolsPanel = new FusionStateDevToolsPanel();
    });
} else {
    window.devToolsPanel = new FusionStateDevToolsPanel();
}

// Global function for devtools.js
window.initializePanel = function() {
    if (window.devToolsPanel) {
        window.devToolsPanel.refresh();
    }
};
