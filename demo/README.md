# 🧪 React Fusion State v0.4.22 - Interactive Demos

This directory contains interactive demonstrations of React Fusion State features. **Zero dependencies, maximum performance with Object.is optimization and batched updates.**

## 📁 Available Demos

### **demo-persistence.html** (React 18+)
- **Complete feature showcase** - All React Fusion State capabilities
- **Global and per-key persistence** examples
- **Multiple components** sharing state
- **Real-time state synchronization**
- **Console logging and debugging**
- **Error handling** and fallbacks

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

### 🔄 Global Persistence Demo (`demo-persistence.html`)
- **Persistent Counter** - Values survive page refreshes
- **Persistent Name Input** - Text persists globally
- **Debug Mode Toggle** - See state changes in console
- **Debug Information Panel** - Inspect state and localStorage

### 🔑 Per-Key Persistence Demo (`demo-key-persistence.html`) ⭐ **NEW**
- **User Profile** - Immediate persistence with debug logs
- **App Settings** - Debounced persistence (2s delay)
- **Session Data** - No persistence (temporary)
- **Visual indicators** for different persistence types

## 🎯 What Each Demo Shows

### Key Persistence Features Demonstrated

#### **Granular Control**
```jsx
// Immediate persistence
const [user, setUser] = useFusionState('user', {}, { 
  persist: true, 
  debounceTime: 0,
  debug: true 
});

// Debounced persistence  
const [settings, setSettings] = useFusionState('settings', {}, { 
  persist: true, 
  debounceTime: 2000 
});

// No persistence
const [temp, setTemp] = useFusionState('temp', '');
```

#### **Custom Options**
- **debounceTime**: Control save frequency (0ms to 2000ms)
- **debug**: Enable/disable console logging
- **keyPrefix**: Namespace your storage (`user_data`, `app_config`)
- **adapter**: Custom storage backends (auto-detected)

## 🧪 Testing the Demos

### Manual Test Scenarios

#### Global Persistence Demo
1. **Basic Functionality**
   - [ ] Counter increments/decrements
   - [ ] Name input updates greeting
   - [ ] Debug toggle works

2. **Persistence Testing**
   - [ ] Set counter to 5, refresh page → should show 5
   - [ ] Enter name, refresh page → name should persist
   - [ ] Clear localStorage → values reset to defaults

#### Key Persistence Demo ⭐ **NEW**
1. **Immediate Persistence (User Profile)**
   - [ ] Enter name/email → see instant debug logs
   - [ ] Change theme → saved immediately
   - [ ] Refresh page → all data restored

2. **Debounced Persistence (App Settings)**
   - [ ] Toggle settings → wait 2 seconds
   - [ ] See console log after delay
   - [ ] Refresh during delay → changes lost
   - [ ] Refresh after delay → changes saved

3. **No Persistence (Session Data)**
   - [ ] Change page views/current page
   - [ ] Refresh page → data resets to defaults
   - [ ] No localStorage entries created

## 🔍 Advanced Testing

### Browser DevTools Integration
1. **Open DevTools** → Application → Local Storage
2. **Watch storage keys** get created/updated:
   - `user_data_userProfile` (immediate)
   - `app_config_appSettings` (debounced)
   - No keys for session data
3. **See different prefixes** for different components

### Console Logging
- **User Profile**: Debug logs enabled - see every save
- **App Settings**: Debug logs disabled - silent operation
- **Session Data**: No persistence logs

## 🎨 Styling

The demos use modern CSS with:
- **Color-coded sections** - Green (persistent), Blue (debounced), Orange (temporary)
- **Status indicators** - Visual persistence state
- **Responsive design** - Works on mobile and desktop
- **Professional typography** - Clean, readable fonts

## 🔧 Customization

### Adding New Components
```jsx
function MyComponent() {
  const [data, setData] = useFusionState('myData', {}, {
    persist: true,
    debounceTime: 500,
    debug: true,
    keyPrefix: 'my_app'
  });
  return <div>{/* Your component */}</div>;
}
```

### Changing Persistence Settings
```jsx
// Global persistence (demo-persistence.html)
<FusionStateProvider persistence={{
  persistKeys: ['counter', 'name'],
  keyPrefix: 'my_demo',
  debounceTime: 1000,
}}>

// Per-key persistence (demo-key-persistence.html)
const [state, setState] = useFusionState('key', defaultValue, {
  persist: true,
  debounceTime: 300,
  debug: false,
  keyPrefix: 'custom'
});
```

## 🐛 Troubleshooting

### Demo Not Working?
1. **Check browser console** for errors
2. **Ensure JavaScript is enabled**
3. **Try a local server** instead of file:// protocol
4. **Clear localStorage** if behavior seems stuck

### Persistence Not Working?
1. **Check localStorage support** in browser
2. **Verify debug mode** for console logs
3. **Try incognito/private mode**
4. **Check storage quotas** (rare)

### Key Persistence Specific Issues
1. **Debug logs not showing**: Check `debug: true` option
2. **Debounced saves not working**: Wait for debounce delay
3. **Wrong storage keys**: Verify `keyPrefix` setting
4. **Data not loading**: Check browser's localStorage in DevTools

## 📚 Learning from the Demos

These demos demonstrate:
- **Global vs per-key persistence** strategies
- **Immediate vs debounced** saving patterns
- **Debug logging** for development
- **Custom storage configuration**
- **Error handling** and graceful degradation
- **Modern React patterns** with hooks

Use these as references for implementing React Fusion State in your own projects!

## 🚀 Next Steps

After exploring the demos:
1. **Try the npm package** in your project
2. **Read the documentation** for advanced features
3. **Check out the examples** in the `/src/examples` directory
4. **Run the benchmarks** to see performance benefits

---

**Happy coding! 🚀**