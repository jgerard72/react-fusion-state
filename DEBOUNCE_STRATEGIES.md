# ⏱️ Debounce Strategies Guide

## 🎯 **When and How to Use debounceTime**

### **0ms - Immediate Save**
```jsx
const [userId, setUserId] = useFusionState('userId', '', { 
  persist: true, 
  debounceTime: 0 
});
```
**Use for:**
- ✅ Critical data (user ID, auth tokens)
- ✅ Boolean toggles (settings on/off)
- ✅ Dropdown selections
- ✅ Data that changes infrequently

**Avoid for:**
- ❌ Text inputs
- ❌ Sliders/range inputs
- ❌ Frequently changing data

### **300ms - Default (Good Balance)**
```jsx
const [settings, setSettings] = useFusionState('settings', {}, { 
  persist: true, 
  debounceTime: 300 
});
```
**Use for:**
- ✅ Form inputs (text, email, etc.)
- ✅ User preferences
- ✅ Most UI state
- ✅ General purpose persistence

**Why 300ms?**
- Fast enough to feel instant
- Long enough to batch rapid changes
- UX research shows optimal response time

### **1000ms - Slow Save**
```jsx
const [draft, setDraft] = useFusionState('draft', '', { 
  persist: true, 
  debounceTime: 1000 
});
```
**Use for:**
- ✅ Text editors (draft content)
- ✅ Large objects/arrays
- ✅ Non-critical data
- ✅ Expensive serialization

### **2000ms+ - Very Slow Save**
```jsx
const [analytics, setAnalytics] = useFusionState('analytics', {}, { 
  persist: true, 
  debounceTime: 5000 
});
```
**Use for:**
- ✅ Analytics data
- ✅ Debug information
- ✅ Bulk data
- ✅ Background processes

## 📊 **Performance Impact Examples**

### **Text Input Without Debounce**
```jsx
// User types "React Fusion State" (18 characters)
// = 18 localStorage writes
// = 18 JSON.stringify() calls
// = ~18ms of blocking time
// = Potential UI lag

const [search, setSearch] = useFusionState('search', '', { 
  persist: true, 
  debounceTime: 0 // ❌ Bad for text input
});
```

### **Text Input With Debounce**
```jsx
// User types "React Fusion State" (18 characters)
// = 1 localStorage write (after 300ms pause)
// = 1 JSON.stringify() call
// = ~1ms of blocking time
// = Smooth UI

const [search, setSearch] = useFusionState('search', '', { 
  persist: true, 
  debounceTime: 300 // ✅ Good for text input
});
```

## 🛠️ **Real-World Examples**

### **User Profile Form**
```jsx
function UserProfileForm() {
  // Critical data - save immediately
  const [userId] = useFusionState('userId', null, { 
    persist: true, 
    debounceTime: 0 
  });
  
  // Form data - debounced saves
  const [profile, setProfile] = useFusionState('profile', {
    name: '',
    email: '',
    bio: ''
  }, { 
    persist: true, 
    debounceTime: 500 // Wait for user to stop typing
  });
  
  // Draft content - longer debounce
  const [bio, setBio] = useFusionState('bio', '', { 
    persist: true, 
    debounceTime: 1000 // Longer text, longer wait
  });
}
```

### **Shopping Cart**
```jsx
function ShoppingCart() {
  // Cart items - immediate save (important for commerce)
  const [cartItems, setCartItems] = useFusionState('cart', [], { 
    persist: true, 
    debounceTime: 0 
  });
  
  // Quantity changes - short debounce
  const [quantities, setQuantities] = useFusionState('quantities', {}, { 
    persist: true, 
    debounceTime: 300 
  });
  
  // Wishlist - longer debounce (less critical)
  const [wishlist, setWishlist] = useFusionState('wishlist', [], { 
    persist: true, 
    debounceTime: 1000 
  });
}
```

### **Text Editor**
```jsx
function TextEditor() {
  // Document content - auto-save with longer debounce
  const [content, setContent] = useFusionState('document', '', { 
    persist: true, 
    debounceTime: 2000, // Wait 2s after user stops typing
    debug: true // Log saves for user feedback
  });
  
  // Editor settings - immediate save
  const [settings, setSettings] = useFusionState('editorSettings', {
    fontSize: 14,
    theme: 'light'
  }, { 
    persist: true, 
    debounceTime: 0 
  });
}
```

## ⚡ **Performance Metrics**

### **Storage Operations per Second**

| Scenario | Without Debounce | With 300ms Debounce | Improvement |
|----------|------------------|---------------------|-------------|
| Fast typing (5 chars/sec) | 5 saves/sec | 0.2 saves/sec | **96% fewer** |
| Form filling | 10 saves/sec | 0.5 saves/sec | **95% fewer** |
| Slider dragging | 30 saves/sec | 0.1 saves/sec | **99% fewer** |

### **Real User Impact**

```jsx
// Example: User types "Hello World" quickly (11 characters in 2 seconds)

// Without debounce:
// 11 localStorage.setItem() calls
// 11 JSON.stringify() calls  
// ~11ms blocking time
// Potential keyboard lag

// With 300ms debounce:
// 1 localStorage.setItem() call (300ms after last keystroke)
// 1 JSON.stringify() call
// ~1ms blocking time
// No keyboard lag
```

## 🎛️ **Choosing the Right debounceTime**

### **Decision Tree**

```
Is the data critical for app functionality?
├── YES → debounceTime: 0 (immediate)
└── NO → Is it frequently changing?
    ├── YES → Is it text input?
    │   ├── YES → debounceTime: 300-500ms
    │   └── NO → debounceTime: 100-300ms
    └── NO → debounceTime: 0 (immediate)
```

### **By Data Type**

| Data Type | Recommended debounceTime | Reason |
|-----------|-------------------------|---------|
| User ID, Auth tokens | 0ms | Critical data |
| Boolean toggles | 0ms | Infrequent changes |
| Dropdown selections | 0ms | Single action |
| Text inputs | 300-500ms | Frequent typing |
| Sliders, ranges | 100-300ms | Frequent dragging |
| Large objects | 500-1000ms | Expensive serialization |
| Draft content | 1000-2000ms | Long-form writing |
| Analytics data | 2000ms+ | Non-critical |

## 🔧 **Advanced Patterns**

### **Adaptive Debouncing**
```jsx
// Shorter debounce for short text, longer for long text
const getDebounceTime = (text) => {
  if (text.length < 10) return 200;
  if (text.length < 100) return 500;
  return 1000;
};

const [content, setContent] = useFusionState('content', '', { 
  persist: true, 
  debounceTime: getDebounceTime(content) 
});
```

### **Smart Debouncing**
```jsx
// Different debounce for different fields
const useSmartPersistence = (key, initialValue, fieldType) => {
  const debounceMap = {
    'email': 300,
    'password': 0, // Don't persist passwords!
    'text': 500,
    'number': 100,
    'boolean': 0
  };
  
  return useFusionState(key, initialValue, {
    persist: true,
    debounceTime: debounceMap[fieldType] || 300
  });
};
```

## 🎯 **Best Practices**

### **✅ Do**
- Use 300ms as default for most cases
- Use 0ms for critical data
- Use longer times for large/complex data
- Consider user typing speed (300ms covers most users)
- Test with real users and real data

### **❌ Don't**
- Use very short times (< 100ms) for text inputs
- Use very long times (> 5000ms) for important data
- Forget that debounce delays data persistence
- Use 0ms for everything (performance issues)
- Ignore the user experience impact

## 🧪 **Testing Your debounceTime**

```jsx
// Add debug logging to test your debounce settings
const [data, setData] = useFusionState('test', '', { 
  persist: true, 
  debounceTime: 300,
  debug: true // Will log when saves actually happen
});

// Test scenarios:
// 1. Type quickly - should see fewer saves
// 2. Type slowly - should see more frequent saves  
// 3. Stop typing - should see save after debounce delay
// 4. Check localStorage to verify data is saved
```

## 💡 **Pro Tips**

1. **Start with 300ms** - good default for most use cases
2. **Monitor performance** - use debug mode to see actual save frequency
3. **Consider user context** - mobile users might type differently
4. **Test edge cases** - very fast typing, very slow typing
5. **User feedback** - show "saving..." indicators for longer debounces
6. **Graceful degradation** - handle storage failures gracefully

The debounce feature makes React Fusion State production-ready for real applications! 🚀
