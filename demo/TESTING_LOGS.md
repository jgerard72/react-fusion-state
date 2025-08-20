# 🧪 Testing Debug Logs

## How to Test Log Control

### 1. **Open the Demo**
```bash
open demo/demo-devtools.html
```

### 2. **Open Browser Console**
- **Chrome/Edge**: F12 → Console tab
- **Firefox**: F12 → Console tab
- **Safari**: Develop → Show Web Inspector → Console

### 3. **Test Debug Mode Toggle**

#### ✅ **Expected Behavior:**

**When Debug Console is OFF (Silent 🤫):**
- ❌ No state change logs
- ❌ No persistence logs  
- ❌ No loading logs
- ✅ Only initial startup logs (shown once)

**When Debug Console is ON (Logs enabled 📝):**
- ✅ State change logs: `[FusionState] State updated:`
- ✅ Persistence logs: `💾 State saved:`
- ✅ Loading logs: `✅ State loaded from localStorage:`

### 4. **Test Steps**

1. **Initial State (Debug OFF):**
   ```
   Console should show ONLY:
   🛠️ React Fusion State DevTools Demo started
   💡 Press Ctrl+` (or Cmd+` on macOS) to toggle the debug panel
   🔧 Check the bottom-right corner for the DevTools panel when enabled
   🔇 Toggle "Debug Console" to enable/disable state change logs
   ```

2. **Click Counter (Debug OFF):**
   ```
   Console should show: NO NEW LOGS
   ```

3. **Enable Debug Mode:**
   ```
   Check the "Debug Console" checkbox
   ```

4. **Click Counter (Debug ON):**
   ```
   Console should show:
   [FusionState] State updated: { previous: {...}, next: {...}, diff: {...} }
   💾 State saved: {...}
   ```

5. **Disable Debug Mode:**
   ```
   Uncheck the "Debug Console" checkbox
   ```

6. **Click Counter (Debug OFF again):**
   ```
   Console should show: NO NEW LOGS
   ```

### 5. **Troubleshooting**

#### Problem: Logs still showing when debug is OFF
**Solution:** Refresh the page and ensure checkbox starts unchecked

#### Problem: No logs when debug is ON
**Solution:** Check if localStorage is working, try incognito mode

#### Problem: Console is cluttered
**Solution:** Click "Clear console" button (🗑️) in browser console

### 6. **What Each Log Means**

```javascript
// Startup logs (always shown)
🛠️ React Fusion State DevTools Demo started

// State change logs (debug mode only)
[FusionState] State updated: {
  previous: { counter: 0 },
  next: { counter: 1 },
  diff: { counter: 1 }
}

// Persistence logs (debug mode only)  
💾 State saved: { counter: 1, user: {...} }

// Loading logs (debug mode only)
✅ State loaded from localStorage: { counter: 1 }
```

### 7. **Real-World Usage**

In your actual React app:

```jsx
function App() {
  // In development: debug logs enabled
  // In production: debug logs disabled
  const debugMode = process.env.NODE_ENV !== 'production';
  
  return (
    <FusionStateProvider persistence debug={debugMode}>
      <YourApp />
    </FusionStateProvider>
  );
}
```

---

**✅ If logs are properly controlled, the debug toggle is working correctly!**
