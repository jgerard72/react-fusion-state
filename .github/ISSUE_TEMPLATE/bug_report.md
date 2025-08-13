---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: 'bug'
assignees: 'jgerard72'
---

## 🐛 Bug Description
A clear and concise description of what the bug is.

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## ✅ Expected Behavior
A clear description of what you expected to happen.

## ❌ Actual Behavior
A clear description of what actually happened.

## 📱 Environment
- **React Fusion State version:** [e.g. 0.2.7]
- **React version:** [e.g. 18.2.0]
- **Platform:** [e.g. React.js, React Native, Expo]
- **Browser:** [e.g. Chrome 91, Safari 15]
- **OS:** [e.g. macOS 12.0, Windows 11, iOS 15]

## 📝 Code Sample
```jsx
// Minimal code example that reproduces the issue
import { FusionStateProvider, useFusionState } from 'react-fusion-state';

function MyComponent() {
  const [value, setValue] = useFusionState('key', 'default');
  // ... your code that causes the issue
}
```

## 📊 Additional Context
Add any other context about the problem here (screenshots, error messages, etc.).

## ✅ Checklist
- [ ] I have searched existing issues to avoid duplicates
- [ ] I have tested with the latest version
- [ ] I have provided a minimal code example
- [ ] I have included my environment details
