/**
 * React Fusion State DevTools - Background Script
 * Service worker for the extension
 */

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Forward messages to DevTools panel if it exists
    if (message.type === 'FUSION_STATE_UPDATE' || message.type === 'FUSION_STATE_DETECTED') {
        // The panel will listen for these messages directly
        // No need to process here, just acknowledge
        sendResponse({ received: true });
    }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('React Fusion State DevTools installed');
    } else if (details.reason === 'update') {
        console.log('React Fusion State DevTools updated');
    }
});

// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // The content script will be injected automatically via manifest
        // This is just for monitoring
    }
});
