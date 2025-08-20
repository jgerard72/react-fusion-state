# 🛠️ DevTools Usage Guide

## Quick Start

The React Fusion State DevTools provide an in-app debug panel for real-time state inspection and manipulation.

### 🚀 **Demo**
Open `demo/demo-devtools.html` in your browser to see the DevTools in action!

### ⌨️ **Keyboard Shortcut**
- **Windows/Linux**: `Ctrl + \``
- **macOS**: `Cmd + \``

## 📦 Installation & Usage

### 1. Import the DevTools
```jsx
// Development-only import (deep import to avoid production bloat)
import { FusionDebugPanel } from 'react-fusion-state/devtools';
```

### 2. Conditional Integration
```jsx
function App() {
  const [debugVisible, setDebugVisible] = useState(false);
  
  return (
    <FusionStateProvider persistence>
      <YourApp />
      
      {/* Only load in development */}
      {process.env.NODE_ENV !== 'production' && (
        <FusionDebugPanel 
          visible={debugVisible} 
          onVisibilityChange={setDebugVisible} 
        />
      )}
    </FusionStateProvider>
  );
}
```

### 3. Dynamic Loading (Recommended)
```jsx
// Load DevTools only when needed
const DevToolsWrapper = () => {
  const [debugVisible, setDebugVisible] = useState(false);
  const [DebugPanel, setDebugPanel] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      import('react-fusion-state/devtools')
        .then(({ FusionDebugPanel }) => {
          setDebugPanel(() => FusionDebugPanel);
        });
    }
  }, []);

  if (!DebugPanel) return null;

  return (
    <DebugPanel 
      visible={debugVisible} 
      onVisibilityChange={setDebugVisible} 
    />
  );
};
```

## 🎯 Features

### 🔍 **State Inspector**
- View all state keys and their current values
- See data types (string, number, object, null)
- Expandable/collapsible interface

### ✏️ **JSON Editor**
- Edit state values directly as JSON
- Real-time syntax validation
- Error highlighting for invalid JSON

### 🔄 **State Manipulation**
- **Set**: Apply JSON changes to state
- **Reset**: Set any key to null
- Immediate state updates

### 📁 **Export/Import**
- **Export**: Download complete state as JSON file
- **Import**: Upload and restore state from JSON file
- Perfect for debugging and testing

## 🎨 Interface

The DevTools panel appears as a **dark overlay** in the bottom-right corner:

```
┌─────────────────────────────┐
│ Fusion State Debugger   [×] │
├─────────────────────────────┤
│ ▶ counter        number     │
│ ▼ user          object      │
│   ┌─────────────────────┐   │
│   │ {               │   │
│   │   "name": "John",   │   │
│   │   "age": 30     │   │
│   │ }               │   │
│   └─────────────────────┘   │
│   [Set] [Reset]             │
└─────────────────────────────┘
```

## ⚙️ Configuration

### Props
```typescript
interface FusionDebugPanelProps {
  /** Whether the panel is visible */
  visible: boolean;
  /** Callback when visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
}
```

### Styling
- **Dark theme** with inline styles
- **Fixed position** (bottom-right)
- **High z-index** (9999) to appear above content
- **Responsive** design
- **No external dependencies**

## 🔐 Production Safety

### ✅ **Safe by Design**
- DevTools are **NOT** included in main bundle
- Deep import required: `react-fusion-state/devtools`
- Only loads when explicitly imported
- Conditional rendering recommended

### 📦 **Bundle Impact**
```javascript
// Main bundle (production)
import { useFusionState } from 'react-fusion-state'; // ✅ No DevTools

// DevTools bundle (development only)
import { FusionDebugPanel } from 'react-fusion-state/devtools'; // ✅ Separate
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] **Keyboard shortcut** toggles panel
- [ ] **State keys** display correctly
- [ ] **Expand/collapse** works
- [ ] **JSON editing** validates syntax
- [ ] **Set button** applies changes
- [ ] **Reset button** sets to null
- [ ] **Export** downloads JSON file
- [ ] **Import** restores state
- [ ] **Panel disappears** when `visible={false}`

### Automated Testing
```jsx
// Test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionDebugPanel } from 'react-fusion-state/devtools';

test('renders when visible', () => {
  render(<FusionDebugPanel visible={true} />);
  expect(screen.getByText('Fusion State Debugger')).toBeInTheDocument();
});
```

## 🐛 Troubleshooting

### Panel Not Appearing?
1. Check `visible` prop is `true`
2. Verify keyboard shortcut: `Ctrl+\`` / `Cmd+\``
3. Look in bottom-right corner
4. Check browser console for errors

### Keyboard Shortcut Not Working?
1. Ensure focus is on the page
2. Try clicking on the page first
3. Check for browser extensions conflicts
4. Use manual toggle button as fallback

### JSON Editing Issues?
1. Verify JSON syntax (use online validator)
2. Check for trailing commas
3. Ensure proper quotes around strings
4. Look for error messages in the panel

### State Not Updating?
1. Check that state key exists
2. Verify JSON is valid
3. Ensure `useFusionState` hook is used
4. Check browser console for errors

## 💡 Tips & Best Practices

### 🎯 **Development Workflow**
1. Start your app in development mode
2. Press `Ctrl+\`` to open DevTools
3. Inspect and modify state as needed
4. Export state for testing scenarios
5. Import state to reproduce issues

### 🔄 **State Management**
- Use meaningful key names
- Keep state structure simple
- Export state before major changes
- Use Reset to clear problematic values

### 🚀 **Performance**
- DevTools only impact development builds
- Panel renders conditionally (no performance cost when hidden)
- JSON parsing is optimized for small state objects

---

**Happy debugging! 🐛➡️✨**
