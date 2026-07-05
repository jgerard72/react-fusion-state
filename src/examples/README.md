# Examples

Reference examples for **react-fusion-state**. These files are not published to npm and are not runnable on their own — copy them into your React app or read them alongside the [README](../../readme.md).

## How to use

1. Install the library in your app:

   ```bash
   npm install react-fusion-state
   ```

2. Copy a component file (or parts of it) into your project.

3. Keep imports as:

   ```tsx
   import { FusionStateProvider, useFusionState } from 'react-fusion-state';
   ```

4. Wrap your app with `<FusionStateProvider>` once.

For persistence details, see [PERSISTENCE.md](../../PERSISTENCE.md).

## Files

| File | What it shows |
| --- | --- |
| [BasicExample.tsx](./BasicExample.tsx) | Counter, todo list, `useFusionStateLog`, provider `initialState` |
| [SimplePersistenceExample.tsx](./SimplePersistenceExample.tsx) | `persistence={true}` and `persistence={['theme']}` |
| [PersistenceExample.tsx](./PersistenceExample.tsx) | Full `PersistenceConfig` with `createLocalStorageAdapter()` and selective keys |
| [ComposedHooksExample.tsx](./ComposedHooksExample.tsx) | `useCounter`, `useToggle`, `useFormState`, `usePersistentState` |

## Notes

- Examples use public imports only (`react-fusion-state`), matching consumer code.
- CSS class names are placeholders — add your own styles.
- React Native: use the same hooks; pass a storage adapter when enabling persistence (see [PERSISTENCE.md](../../PERSISTENCE.md)).
