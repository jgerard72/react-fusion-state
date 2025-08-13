# 🧪 React Fusion State - Interactive Demo

This directory contains interactive demonstrations of React Fusion State features.

## 📁 Files

- **`demo-persistence.html`** - Complete interactive demo with persistence
- **`styles.css`** - Modern CSS styling for the demo

## 🚀 How to Run

### Option 1: Direct Browser
```bash
# Open directly in your browser
open demo-persistence.html
```

### Option 2: Local Server (Recommended)
```bash
# Using Python (if installed)
python -m http.server 8000
# Then visit: http://localhost:8000/demo/

# Using Node.js (if installed)
npx serve .
# Then visit the provided URL + /demo/
```

## ✨ Demo Features

### 🔢 Persistent Counter
- Increment/decrement counter
- Values persist across page refreshes
- Real-time localStorage inspection

### 👤 Persistent Name Input
- Text input with global state
- Automatic persistence
- Greeting display

### 🎛️ Debug Mode Toggle
- **Silent Mode** 🤫 - No console logs (production mode)
- **Debug Mode** 📝 - Detailed console output (development mode)
- Real-time toggle between modes

### 🔍 Debug Information Panel
- Current state values
- localStorage content inspection  
- Clear storage functionality
- Real-time updates

## 🎨 Styling

The demo uses modern CSS with:
- **Responsive design** - Works on mobile and desktop
- **Gradient backgrounds** - Modern visual appeal
- **Smooth animations** - Hover effects and transitions
- **Professional typography** - Clean, readable fonts
- **Component-based styles** - Reusable CSS classes

## 🧪 Testing the Demo

### Manual Test Scenarios

1. **Basic Functionality**
   - [ ] Counter increments/decrements
   - [ ] Name input updates greeting
   - [ ] Debug toggle works

2. **Persistence Testing**
   - [ ] Set counter to 5, refresh page → should show 5
   - [ ] Enter name, refresh page → name should persist
   - [ ] Clear localStorage → values reset to defaults

3. **Debug Mode Testing**
   - [ ] Debug OFF → no console logs
   - [ ] Debug ON → console shows state changes
   - [ ] Toggle works in real-time

4. **Error Handling**
   - [ ] Works with localStorage disabled
   - [ ] Handles storage quota exceeded
   - [ ] Graceful degradation

## 🔧 Customization

You can modify the demo by:

### Adding New Components
```jsx
function MyNewComponent() {
  const [myState, setMyState] = useFusionState('myKey', 'default');
  return <div>{/* Your component */}</div>;
}

// Add to the App component
<MyNewComponent />
```

### Changing Persistence Settings
```jsx
<FusionStateProvider 
  persistence={{
    persistKeys: ['counter', 'name', 'myNewKey'], // Add your keys
    keyPrefix: 'my_demo',                        // Custom prefix
    debounceTime: 1000,                          // Delay saves
  }}
  debug={debugMode}
>
```

### Styling Modifications
Edit `styles.css` to customize:
- Colors and themes
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

## 🐛 Troubleshooting

### Demo Not Working?
1. **Check browser console** for errors
2. **Ensure JavaScript is enabled**
3. **Try a local server** instead of file:// protocol
4. **Clear localStorage** if behavior seems stuck

### Styling Issues?
1. **Hard refresh** (Ctrl+F5 or Cmd+Shift+R)
2. **Check CSS file path** in HTML
3. **Inspect element** to debug styles

### Persistence Not Working?
1. **Check localStorage support** in browser
2. **Verify debug mode** for console logs
3. **Try incognito/private mode**

## 📚 Learning from the Demo

This demo demonstrates:
- **Global state management** with `useFusionState`
- **Automatic persistence** with localStorage
- **Debug mode** for development
- **Error handling** and graceful degradation
- **Modern React patterns** with hooks

Use this as a reference for implementing React Fusion State in your own projects!

---

**Happy coding! 🚀**
