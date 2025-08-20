/**
 * React Fusion State DevTools - Main DevTools Script
 * Creates a new panel in Chrome DevTools
 */

// Create the React Fusion State panel
chrome.devtools.panels.create(
  'Fusion State',
  'icons/icon32.png',
  'panel.html',
  function(panel) {
    console.log('React Fusion State DevTools panel created');
    
    // Panel lifecycle
    panel.onShown.addListener(function(panelWindow) {
      console.log('React Fusion State panel shown');
      // Initialize panel when shown
      if (panelWindow.initializePanel) {
        panelWindow.initializePanel();
      }
    });
    
    panel.onHidden.addListener(function() {
      console.log('React Fusion State panel hidden');
    });
  }
);

// Check if React Fusion State is present on the page
function checkForFusionState() {
  chrome.devtools.inspectedWindow.eval(
    `(function() {
      // Look for React Fusion State indicators
      const hasReact = typeof React !== 'undefined';
      const hasConsolePattern = !!console.log.toString().includes('FusionState');
      const hasLocalStorage = Object.keys(localStorage).some(key => 
        key.includes('fusion_state') || key.includes('_all')
      );
      
      return {
        hasReact,
        hasConsolePattern,
        hasLocalStorage,
        detected: hasReact || hasConsolePattern || hasLocalStorage
      };
    })()`,
    function(result, isException) {
      if (!isException && result.detected) {
        console.log('React Fusion State detected on page:', result);
        // Could show notification or update UI
      }
    }
  );
}

// Check periodically for React Fusion State
setInterval(checkForFusionState, 2000);

// Initial check
checkForFusionState();
