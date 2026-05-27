# 🔐 Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | ✅ Yes (Current)   |
| 0.3.x   | ✅ Yes             |
| 0.2.x   | ⚠️ Limited         |
| 0.1.x   | ❌ No              |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in React Fusion State, please report it responsibly.

### 📧 How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please email us directly:
- **Email:** [jgrd93@gmail.com](mailto:jgrd93@gmail.com)
- **Subject:** [SECURITY] React Fusion State Vulnerability Report

### 📝 What to Include

Please include as much information as possible:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** of the vulnerability
4. **Suggested fix** (if you have one)
5. **Your contact information** for follow-up

### 🔄 Response Process

1. **Acknowledgment** - We'll acknowledge receipt within 24 hours
2. **Investigation** - We'll investigate and assess the vulnerability
3. **Fix Development** - We'll develop and test a fix
4. **Disclosure** - We'll coordinate disclosure with you
5. **Release** - We'll release a security update

### ⏱️ Response Timeline

- **24 hours** - Initial acknowledgment
- **7 days** - Initial assessment and response
- **30 days** - Fix development and testing
- **Coordinated disclosure** - Public announcement after fix

### 🏆 Recognition

We appreciate security researchers who help keep React Fusion State secure. With your permission, we'll:

- Credit you in our security advisory
- Mention you in our changelog
- Thank you publicly (if desired)

## Security Considerations

### 🔒 Data Storage

By default, React Fusion State persists data through the **auto-detected** adapter for your runtime:

| Runtime | Default backend | Encrypted at rest? | Visible to other apps / scripts? |
| --- | --- | :-: | :-: |
| Browser | `localStorage` | ❌ | ✅ Any JS on the same origin |
| React Native / Expo | `AsyncStorage` | ❌ (plain SQLite / `NSUserDefaults`) | ❌ App-scoped, but readable on rooted / jailbroken devices |
| Next.js SSR | In-memory (noop) | n/a | n/a |

**None of the default adapters encrypts data at rest.** For anything sensitive (auth tokens, refresh tokens, PII, payment metadata) plug in a secure backend via the [Custom Storage Adapters](./README.md#-custom-storage-adapters-secure-storage-mmkv-) section in the README. The `StorageAdapter` contract is a 3-method interface — wiring `expo-secure-store`, `react-native-keychain` or `react-native-encrypted-storage` takes ~15 lines.

### 🛡️ Best Practices

#### 1. Never store secrets through the default adapter

```jsx
// ❌ Plain localStorage / AsyncStorage — readable by malware, dev tools, debuggers
const [token, setToken] = useFusionState('auth.token', null);

// ✅ Routed through a secure adapter (Keychain / SecureStore / EncryptedStorage)
//    See README → Custom Storage Adapters for the 4 recipes.
const [token, setToken] = secureStore.useFusionState('token', null);
```

#### 2. Split sensitive and non-sensitive state into two stores

The recommended layout on mobile is **two `createStore()` instances** — one wired to a secure adapter (auth tokens), one to AsyncStorage (theme, language, cache). See the [split-sensitive-/-non-sensitive recipe](./README.md#pattern-split-sensitive--non-sensitive-with-two-stores) in the README.

#### 3. Treat web storage as public

On the web, anything written to `localStorage` is readable by **any script on the same origin** — including third-party analytics, ad SDKs, and XSS payloads. If you can't avoid persisting a secret on the web, encrypt it explicitly with [Web Crypto API](https://developer.mozilla.org/docs/Web/API/Web_Crypto_API) before passing it to `setState`, and keep the encryption key out of `localStorage`.

#### 4. Clear sensitive data on logout

The store doesn't know what "logout" means — wire it explicitly:

```ts
// On logout
secureStore.setState({ token: null, refreshToken: null });
// or remove individual keys (skips the next save when the adapter is async)
```

If you used `react-native-keychain` with `accessControl`, also call `Keychain.resetGenericPassword({ service: 'token' })` to remove the Keychain entry itself (the adapter's `removeItem` does this for you).

#### 5. Never enable `debug` in production builds

The `debug` flag on `<FusionStateProvider>` (and on individual `useFusionState({ debug: true })` calls) **prints every state diff and every save payload** to the console. That includes any sensitive value currently in state. Gate it behind `__DEV__` / `process.env.NODE_ENV === 'development'`:

```jsx
<FusionStateProvider debug={__DEV__}>
  <App />
</FusionStateProvider>
```

#### 6. No network calls — ever

`react-fusion-state` has zero runtime dependencies and **never makes network calls**. If a future contributor proposes adding fetch / XHR / telemetry, this is a security regression and must be refused at code review time (see `.cursor/rules/70-security.mdc`).

### 🔐 Mobile cookbook

For the full copy-paste recipes (Expo SecureStore, react-native-keychain with biometrics, react-native-encrypted-storage, and the two-store split pattern), see the [Custom Storage Adapters](./README.md#-custom-storage-adapters-secure-storage-mmkv-) section in the main README.

## Vulnerability History

No security vulnerabilities have been reported for React Fusion State at this time.

---

**Thank you for helping keep React Fusion State secure! 🛡️**
