# 🚀 Getting Started - React Fusion State v1.4.2

**New to the project?** This guide will get you up and running in 5 minutes!

**🎯 React Fusion State v1.4.2:** 0 runtime deps, maximum performance state management with ultra-simple API, granular persistence, multi-store factory (`createStore()`), pluggable secure storage adapters, and batched updates.

---

## 👨‍💻 **For New Contributors**

### Quick Setup
```bash
# 1. Fork & Clone
git clone https://github.com/YOUR_USERNAME/react-fusion-state.git
cd react-fusion-state

# 2. Install & Build
npm install
npm run build

# 3. Test everything works
npm test

# 4. Try the demo
open demo/demo-persistence.html
```

**That's it! 🎉** You're ready to contribute.

---

## 📚 **For New Users**

### Installation (React 18+)
```bash
npm install react-fusion-state
```

### Basic Usage
```jsx
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function App() {
  return (
    <FusionStateProvider persistence={['count']}>
      <Counter />
    </FusionStateProvider>
  );
}

function Counter() {
  const [count, setCount] = useFusionState('count', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

**Done!** Your state is now global and persistent. (React 18+)

---

## 📖 **Next Steps**

### For Contributors
- Read [**CONTRIBUTING.md**](CONTRIBUTING.md) - Complete contribution guide
- Check [**DOCUMENTATION.md**](DOCUMENTATION.md) - Full API reference
- Browse [**src/examples/**](src/examples/) - Code examples
- Run [**demo/demo-persistence.html**](demo/) - Interactive demo

### For Users
- Read [**README.md**](README.md) - Main introduction
- Try [**demo/demo-persistence.html**](demo/) - Live demo
- Check [**DOCUMENTATION.md**](DOCUMENTATION.md) - Complete guide
- Browse [**src/examples/**](src/examples/) - Usage examples

---

## 🆘 **Need Help?**

- **🐛 Bug?** → [Create an issue](https://github.com/jgerard72/react-fusion-state/issues/new?template=bug_report.md)
- **💡 Feature idea?** → [Request a feature](https://github.com/jgerard72/react-fusion-state/issues/new?template=feature_request.md)
- **❓ Question?** → [GitHub Discussions](https://github.com/jgerard72/react-fusion-state/discussions)
- **📧 Direct contact?** → [LinkedIn](https://www.linkedin.com/in/jgerard)

---

**Happy coding! 🎉**
