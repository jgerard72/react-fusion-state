/**
 * Consumer type contract fixture for react-fusion-state.
 *
 * Imports only from the published package name and validates dist/index.d.ts.
 * This file is type-checked via `npm run test:types` — it is not executed.
 */
import React from 'react';
import {
  FusionStateProvider,
  FusionStateErrorMessages,
  createNoopStorageAdapter,
  createLocalStorageAdapter,
  createMemoryStorageAdapter,
  detectBestStorageAdapter,
  useFusionState,
  useGlobalState,
  useFusionStateLog,
  usePersistentState,
  useFrequentState,
  useFormState,
  useCounter,
  useToggle,
  type FusionStateProviderProps,
  type FusionStatePersistenceProp,
  type SimplePersistenceConfig,
  type PersistenceConfig,
  type PersistenceKeys,
  type PersistenceKeysConfig,
  type PersistenceKeyFilter,
  type StorageAdapter,
  type GlobalState,
  type SetStateAction,
  type StateUpdater,
  type GlobalFusionStateContextType,
  type UseFusionStateOptions,
  type FusionStateLogSnapshot,
  type FusionStateLogOptions,
} from 'react-fusion-state';
import {Equal, Expect, Extends} from './assertTypes';

// ---------------------------------------------------------------------------
// useFusionState inference + setter updater function
// ---------------------------------------------------------------------------

function _useFusionStateContract(): void {
  const [count, setCount] = useFusionState('counter', 0);
  type _countIsNumber = Expect<Equal<typeof count, number>>;
  type _setterArg = Expect<
    Equal<
      Parameters<typeof setCount>[0],
      number | ((prev: number) => number)
    >
  >;

  setCount(1);
  setCount(prev => prev + 1);

  interface User {
    name: string;
    email: string;
  }

  const [user, setUser] = useFusionState<User>('user', {
    name: '',
    email: '',
  });
  type _userShape = Expect<Equal<typeof user, User>>;

  const [fps] = useFusionState('fps', 60, {skipLocalState: true});
  type _fpsWithOptions = Expect<Equal<typeof fps, number>>;

  const [lazyKey] = useFusionState<number>('lazy-key');
  type _explicitGeneric = Expect<Equal<typeof lazyKey, number>>;

  type _stateUpdaterAlias = Expect<
    Equal<StateUpdater<number>, (value: SetStateAction<number>) => void>
  >;

  // @ts-expect-error setter rejects non-numeric values
  setCount('invalid');
  // @ts-expect-error updater must return number
  setCount(prev => 'nope');
  void user;
  void setUser;
}

// ---------------------------------------------------------------------------
// FusionStateProviderProps + persistence config union
// ---------------------------------------------------------------------------

function _fusionStateProviderContract(): void {
  const minimal: FusionStateProviderProps = {
    children: <div />,
  };

  const full: FusionStateProviderProps = {
    children: <div />,
    initialState: {theme: 'dark'},
    debug: true,
    persistence: true,
  };

  type _persistenceBoolean = Expect<
    Extends<true, FusionStatePersistenceProp>
  >;
  type _persistenceKeys = Expect<
    Extends<string[], FusionStatePersistenceProp>
  >;
  type _persistenceSimple = Expect<
    Extends<SimplePersistenceConfig, FusionStatePersistenceProp>
  >;
  type _persistenceFull = Expect<
    Extends<PersistenceConfig, FusionStatePersistenceProp>
  >;

  void minimal;
  void full;
}

function _persistenceConfigContract(): void {
  const simpleBool: SimplePersistenceConfig = {persistKeys: true};
  const simpleList: SimplePersistenceConfig = {
    persistKeys: ['user', 'theme'],
  };
  const simpleFilter: SimplePersistenceConfig = {
    persistKeys: (key: string, value?: unknown) => key.startsWith('persist.'),
  };

  const filterFn: PersistenceKeyFilter = (key, value?) =>
    key.startsWith('persist.');

  const full: PersistenceConfig = {
    adapter: createMemoryStorageAdapter(),
    persistKeys: ['theme'],
    debounceTime: 500,
    loadOnInit: true,
    saveOnChange: true,
  };

  type _keysUnion = Expect<
    Extends<
      typeof simpleList.persistKeys,
      PersistenceKeys | undefined
    >
  >;
  type _keysConfigUnion = Expect<
    Extends<
      typeof full.persistKeys,
      PersistenceKeysConfig | undefined
    >
  >;

  // @ts-expect-error PersistenceConfig requires adapter
  const missingAdapter: PersistenceConfig = {persistKeys: ['a']};

  void simpleBool;
  void simpleList;
  void simpleFilter;
  void filterFn;
  void full;
}

function _fusionStateProviderJsxContract(): void {
  <FusionStateProvider persistence={true}>
    <div />
  </FusionStateProvider>;

  <FusionStateProvider persistence={['user', 'theme']}>
    <div />
  </FusionStateProvider>;

  <FusionStateProvider persistence={{debounce: 300, keyPrefix: 'app'}}>
    <div />
  </FusionStateProvider>;

  <FusionStateProvider
    persistence={{
      adapter: createNoopStorageAdapter(),
      persistKeys: ['a'],
      loadOnInit: true,
    }}>
    <div />
  </FusionStateProvider>;

  // @ts-expect-error persistence must be boolean, string[], or config object
  <FusionStateProvider persistence={123}>
    <div />
  </FusionStateProvider>;

  // @ts-expect-error FusionStateProvider requires children
  <FusionStateProvider persistence={true} />;
}

// ---------------------------------------------------------------------------
// StorageAdapter compatibility
// ---------------------------------------------------------------------------

function _storageAdapterContract(): void {
  const custom: StorageAdapter = {
    async getItem(_key: string) {
      return null;
    },
    async setItem(_key: string, _value: string) {},
    async removeItem(_key: string) {},
  };

  type _noopFactory = Expect<
    Equal<ReturnType<typeof createNoopStorageAdapter>, StorageAdapter>
  >;
  type _localFactory = Expect<
    Equal<ReturnType<typeof createLocalStorageAdapter>, StorageAdapter>
  >;
  type _memoryFactory = Expect<
    Equal<ReturnType<typeof createMemoryStorageAdapter>, StorageAdapter>
  >;
  type _detectFactory = Expect<
    Equal<ReturnType<typeof detectBestStorageAdapter>, StorageAdapter>
  >;

  const simpleWithAdapter: SimplePersistenceConfig = {adapter: custom};
  void simpleWithAdapter;

  // @ts-expect-error StorageAdapter requires removeItem
  const incomplete: StorageAdapter = {
    async getItem() {
      return null;
    },
    async setItem() {},
  };
  void incomplete;
}

// ---------------------------------------------------------------------------
// Composed hooks return types
// ---------------------------------------------------------------------------

function _composedHooksContract(): void {
  const [token, setToken] = usePersistentState('auth.token', '');
  type _persistentValue = Expect<Equal<typeof token, string>>;
  type _persistentSetter = Expect<
    Equal<
      Parameters<typeof setToken>[0],
      string | ((prev: string) => string)
    >
  >;

  const [pointer, setPointer] = useFrequentState('pointer', {x: 0, y: 0});
  type _frequentValue = Expect<
    Equal<typeof pointer, {x: number; y: number}>
  >;

  interface SignupForm {
    email: string;
    name: string;
  }

  const [form, updateField, resetForm] = useFormState('signup', {
    email: '',
    name: '',
  });
  type _formValue = Expect<Equal<typeof form, SignupForm>>;
  type _updateField = Expect<
    Equal<typeof updateField, (field: keyof SignupForm, value: any) => void>
  >;
  type _resetForm = Expect<Equal<typeof resetForm, () => void>>;

  const [count, increment, decrement, setCount] = useCounter('likes', 0);
  type _counterValue = Expect<Equal<typeof count, number>>;
  type _increment = Expect<Equal<typeof increment, () => void>>;
  type _decrement = Expect<Equal<typeof decrement, () => void>>;
  type _setCount = Expect<Equal<typeof setCount, (value: number) => void>>;

  const [open, toggle, setOpen] = useToggle('sidebar', false);
  type _toggleValue = Expect<Equal<typeof open, boolean>>;
  type _toggleFn = Expect<Equal<typeof toggle, () => void>>;
  type _setOpen = Expect<Equal<typeof setOpen, (value: boolean) => void>>;

  void setPointer;
  void updateField;
  void resetForm;
  void increment;
  void decrement;
  void setCount;
  void toggle;
  void setOpen;
}

// ---------------------------------------------------------------------------
// Exported public types
// ---------------------------------------------------------------------------

function _exportedTypesContract(): void {
  const state: GlobalState = {counter: 0, nested: {ok: true}};
  type _setStateAction = Expect<
    Equal<SetStateAction<number>, number | ((prev: number) => number)>
  >;
  type _persistenceKeysExport = Expect<
    Equal<PersistenceKeys, boolean | string[] | PersistenceKeyFilter>
  >;
  type _persistenceKeysConfigExport = Expect<
    Equal<PersistenceKeysConfig, string[] | PersistenceKeyFilter>
  >;

  const opts: UseFusionStateOptions = {skipLocalState: true};
  type _errorMessage = Expect<
    Extends<
      typeof FusionStateErrorMessages.PROVIDER_MISSING,
      FusionStateErrorMessages
    >
  >;

  const ctx: GlobalFusionStateContextType = {
    state,
    setState: () => {},
    initializingKeys: new Set<string>(),
  };
  type _ctxState = Expect<Equal<typeof ctx.state, GlobalState>>;

  const snapshot: FusionStateLogSnapshot = useFusionStateLog(['counter'], {
    trackChanges: true,
    changeDetection: 'simple',
  });
  type _logSnapshot = Expect<Equal<typeof snapshot, Record<string, unknown>>>;

  const logOptions: FusionStateLogOptions = {
    trackChanges: true,
    consoleLog: false,
    changeDetection: 'reference',
  };

  const globalCtx = useGlobalState();
  type _globalCtx = Expect<
    Equal<typeof globalCtx, GlobalFusionStateContextType>
  >;

  // @ts-expect-error UseFusionStateOptions.skipLocalState must be boolean
  const badOptions: UseFusionStateOptions = {skipLocalState: 'yes'};

  void opts;
  void logOptions;
  void globalCtx;
}

// Reference contract functions so TS checks their bodies without executing them.
type _Contracts = [
  typeof _useFusionStateContract,
  typeof _fusionStateProviderContract,
  typeof _persistenceConfigContract,
  typeof _fusionStateProviderJsxContract,
  typeof _storageAdapterContract,
  typeof _composedHooksContract,
  typeof _exportedTypesContract,
];
