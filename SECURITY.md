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

React Fusion State stores data in browser localStorage or React Native AsyncStorage. Consider:

- **Sensitive data** should be encrypted before storage
- **localStorage** is accessible to any script on the same origin
- **AsyncStorage** is more secure but still accessible to the app

### 🛡️ Best Practices

```jsx
// ❌ Don't store sensitive data directly
const [password, setPassword] = useFusionState('password', '');

// ✅ Encrypt sensitive data before storage
const [encryptedData, setEncryptedData] = useFusionState('userData', '');

// ✅ Use secure keys for sensitive information
const [token, setToken] = useFusionState('auth.encrypted_token', null);
```

### 🔐 Recommendations

1. **Encrypt sensitive data** before storing
2. **Use HTTPS** in production
3. **Validate data** when loading from storage
4. **Clear sensitive data** on logout
5. **Consider token expiration** for auth data

## Vulnerability History

No security vulnerabilities have been reported for React Fusion State at this time.

---

**Thank you for helping keep React Fusion State secure! 🛡️**
