# 🤝 Contributing to React Fusion State

Thank you for your interest in contributing to React Fusion State! This guide will help you get started.

---

## 📋 **Table of Contents**

1. [🚀 Quick Start for Contributors](#-quick-start-for-contributors)
2. [🏗️ Development Setup](#️-development-setup)
3. [📝 Code Guidelines](#-code-guidelines)
4. [🧪 Testing](#-testing)
5. [📚 Documentation](#-documentation)
6. [🔄 Pull Request Process](#-pull-request-process)
7. [🐛 Bug Reports](#-bug-reports)
8. [💡 Feature Requests](#-feature-requests)
9. [📞 Getting Help](#-getting-help)

---

## 🚀 **Quick Start for Contributors**

### Prerequisites
- **Node.js** 16+ 
- **npm** or **yarn**
- **Git**
- **TypeScript** knowledge

### First Contribution
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/react-fusion-state.git
cd react-fusion-state

# 3. Install dependencies
npm install

# 4. Build the project
npm run build

# 5. Run tests
npm test

# 6. Start development
npm run dev  # TypeScript watch mode
```

---

## 🏗️ **Development Setup**

### Project Structure
```
react-fusion-state/
├── 📁 src/                    # Source code
│   ├── 📄 index.ts            # Main exports
│   ├── 📄 FusionStateProvider.tsx  # Core provider
│   ├── 📄 useFusionState.ts   # Main hook
│   ├── 📄 types.ts            # TypeScript definitions
│   ├── 📄 utils.ts            # Utility functions
│   ├── 📁 storage/            # Storage adapters
│   ├── 📁 examples/           # Usage examples
│   └── 📁 __tests__/          # Test files
├── 📁 dist/                   # Built files (auto-generated)
├── 📄 package.json            # Dependencies & scripts
├── 📄 tsconfig.json           # TypeScript config
└── 📄 jest.config.js          # Test configuration
```

### Available Scripts
```bash
npm run build        # Build for production
npm run dev          # Development mode (watch)
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run format       # Format code with Prettier
```

### Development Workflow
1. **Create a branch** for your feature/fix
2. **Make changes** in TypeScript
3. **Run tests** to ensure nothing breaks
4. **Build** to check compilation
5. **Test manually** with the demo
6. **Submit PR** with clear description

---

## 📝 **Code Guidelines**

### TypeScript Standards
```typescript
// ✅ Good: Explicit types, clear naming
interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
}

const [preferences, setPreferences] = useFusionState<UserPreferences>(
  'userPreferences', 
  { theme: 'light', language: 'en' }
);

// ❌ Avoid: Any types, unclear naming
const [data, setData] = useFusionState('stuff', {} as any);
```

### Code Style
- **Use TypeScript** - No plain JavaScript
- **Explicit types** - Avoid `any` when possible
- **Descriptive names** - Functions, variables, types
- **JSDoc comments** - For public APIs
- **Consistent formatting** - Use Prettier

### File Organization
```typescript
// File structure pattern:
// 1. Imports (React, then libraries, then local)
import React, { useState, useEffect } from 'react';
import { StorageAdapter } from './types';
import { formatErrorMessage } from './utils';

// 2. Types and interfaces
interface ComponentProps {
  // ...
}

// 3. Component/function implementation
export function MyComponent(props: ComponentProps) {
  // ...
}
```

---

## 🧪 **Testing**

### Test Structure
```
src/__tests__/
├── 📄 FusionStateProvider.test.tsx    # Provider tests
├── 📄 useFusionState.test.tsx         # Hook tests
├── 📄 persistence.test.tsx            # Persistence tests
├── 📄 integration.test.tsx            # Integration tests
└── 📄 useFusionStateLog.test.tsx      # Logging tests
```

### Writing Tests
```typescript
// Test pattern example
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionStateProvider, useFusionState } from '../index';

function TestComponent() {
  const [count, setCount] = useFusionState('count', 0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button data-testid="increment" onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
}

test('should update state correctly', () => {
  render(
    <FusionStateProvider>
      <TestComponent />
    </FusionStateProvider>
  );
  
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  fireEvent.click(screen.getByTestId('increment'));
  expect(screen.getByTestId('count')).toHaveTextContent('1');
});
```

### Test Requirements
- **All new features** must have tests
- **Bug fixes** should include regression tests
- **Maintain coverage** above 90%
- **Test edge cases** and error scenarios

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- persistence.test.tsx

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 📚 **Documentation**

### Documentation Files
- **README.md** - Main introduction and quick start
- **DOCUMENTATION.md** - Complete API reference
- **CHANGELOG.md** - Version history
- **CONTRIBUTING.md** - This file

### Documentation Standards
```markdown
## Function Documentation

### `useFusionState(key, defaultValue)`

Hook for accessing and updating global state.

**Parameters:**
- `key: string` - Unique identifier for the state value
- `defaultValue: T` - Default value if key doesn't exist

**Returns:**
- `[value: T, setValue: (newValue: T) => void]` - Current value and setter

**Example:**
```jsx
const [count, setCount] = useFusionState('counter', 0);
```

### Code Examples
- **Always include** working examples
- **Test examples** to ensure they work
- **Use TypeScript** in examples when relevant
- **Show common use cases**

---

## 🔄 **Pull Request Process**

### Before Submitting
1. **Run all tests** - `npm test`
2. **Build successfully** - `npm run build`
3. **Format code** - `npm run format`
4. **Update documentation** if needed
5. **Test manually** with demo if relevant

### PR Guidelines
```markdown
## PR Title Format
- feat: add new storage adapter for IndexedDB
- fix: resolve persistence issue on page refresh
- docs: update API documentation for useFusionState
- test: add integration tests for React Native
- refactor: improve error handling in storage adapters
```

### PR Description Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)
```

### Review Process
1. **Automated checks** must pass (build, tests)
2. **Code review** by maintainer
3. **Discussion** if changes needed
4. **Approval** and merge

---

## 🐛 **Bug Reports**

### Before Reporting
1. **Check existing issues** - Avoid duplicates
2. **Test with latest version** - Bug might be fixed
3. **Reproduce consistently** - Provide clear steps
4. **Check documentation** - Might be usage issue

### Bug Report Template
```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- React Fusion State version: [e.g. 0.2.7]
- React version: [e.g. 18.2.0]
- Platform: [e.g. React.js, React Native, Expo]
- Browser: [e.g. Chrome 91]
- OS: [e.g. macOS 12.0]

## Additional Context
Add any other context about the problem here.
```

---

## 💡 **Feature Requests**

### Before Requesting
1. **Check existing issues** - Might already be planned
2. **Consider scope** - Does it fit the library's purpose?
3. **Think about API** - How would it work?

### Feature Request Template
```markdown
## Feature Description
A clear description of the feature you'd like to see.

## Use Case
Describe the problem this feature would solve.

## Proposed API
How would you like to use this feature?

```jsx
// Example of how the API might look
const [data, setData] = useFusionState('data', [], {
  newOption: true
});
```

## Alternatives Considered
What alternatives have you considered?

## Additional Context
Any other context or screenshots about the feature request.
```

---

## 📞 **Getting Help**

### Communication Channels
- **🐛 GitHub Issues** - Bug reports and feature requests
- **💬 GitHub Discussions** - Questions and community
- **📧 Email** - [jgrd93@gmail.com](mailto:jgrd93@gmail.com)
- **💼 LinkedIn** - [Jacques GERARD](https://www.linkedin.com/in/jgerard/)

### Getting Started Help
- **Read DOCUMENTATION.md** - Complete API reference
- **Try the demo** - `demo/demo-persistence.html`
- **Check examples** - `src/examples/`
- **Ask questions** - GitHub Discussions

---

## 🏷️ **Labels and Issues**

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

### Priority Labels
- `priority: high` - Critical issues
- `priority: medium` - Important improvements
- `priority: low` - Nice to have

---

## 🎯 **Contribution Areas**

### High Priority
- **🧪 More tests** - Edge cases, platform-specific
- **📱 React Native examples** - Real-world usage
- **⚡ Performance optimizations** - Benchmarks, improvements
- **🌐 Platform adapters** - IndexedDB, custom storage

### Medium Priority
- **📚 Documentation improvements** - Clarity, examples
- **🎨 Demo enhancements** - More features, better UX
- **🔧 Developer tools** - Debug utilities, dev mode features

### Good First Issues
- **📝 Typo fixes** - Documentation, comments
- **🧪 Simple tests** - Basic functionality coverage
- **📚 Example improvements** - Better code samples
- **🎨 CSS improvements** - Demo styling

---

## 🙏 **Recognition**

Contributors will be:
- **Listed in CHANGELOG** for significant contributions
- **Mentioned in releases** for major features
- **Added to contributors** section (if desired)
- **Thanked publicly** on social media

---

## 📄 **License**

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to React Fusion State! 🚀**

Every contribution, no matter how small, helps make this library better for everyone.
