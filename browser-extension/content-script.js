/**
 * React Fusion State DevTools - Content Script
 * Bridges between the page and the extension
 */

// Listen for messages from the injected page
window.addEventListener('message', function(event) {
    // Only accept messages from the same window
    if (event.source !== window) return;
    
    // Only accept messages from our extension
    if (!event.data.source || event.data.source !== 'fusion-devtools') return;
    
    // Forward the message to the DevTools panel
    chrome.runtime.sendMessage({
        type: event.data.type,
        data: event.data.data
    });
}, false);

// Inject the monitoring script into the page context
function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected-script.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

// Inject as early as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectScript);
} else {
    injectScript();
}
