import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseDeclarationExportBlock} from './helpers/parsePublicApiExports';

const ROOT = path.join(__dirname, '../..');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_CJS = path.join(DIST_DIR, 'index.js');
const DIST_ESM = path.join(DIST_DIR, 'index.mjs');
const DIST_DTS = path.join(DIST_DIR, 'index.d.ts');
const DIST_DMTS = path.join(DIST_DIR, 'index.d.mts');
const SRC_INDEX = path.join(ROOT, 'src/index.ts');

const EXPECTED_RUNTIME_EXPORTS = [
  'FusionStateErrorMessages',
  'FusionStateProvider',
  'NoopStorageAdapter',
  'createLocalStorageAdapter',
  'createMemoryStorageAdapter',
  'createNoopStorageAdapter',
  'debounce',
  'detectBestStorageAdapter',
  'formatErrorMessage',
  'simpleDeepEqual',
  'useCounter',
  'useFormState',
  'useFrequentState',
  'useFusionState',
  'useFusionStateLog',
  'useGlobalState',
  'usePersistentState',
  'useToggle',
] as const;

const EXPECTED_TYPE_ONLY_EXPORTS = [
  'FusionStateLogKey',
  'FusionStateLogOptions',
  'FusionStateLogSnapshot',
  'FusionStatePersistenceProp',
  'FusionStateProviderProps',
  'GlobalFusionStateContextType',
  'GlobalState',
  'PersistenceConfig',
  'PersistenceKeyFilter',
  'PersistenceKeys',
  'PersistenceKeysConfig',
  'SetStateAction',
  'SimplePersistenceConfig',
  'StateUpdater',
  'StorageAdapter',
  'UseFusionStateOptions',
] as const;

function assertDistIsFresh(): void {
  if (!fs.existsSync(DIST_CJS)) {
    throw new Error('Run npm run build before public API tests.');
  }

  if (!fs.existsSync(SRC_INDEX)) {
    throw new Error('Run npm run build before public API tests.');
  }

  const distMtime = fs.statSync(DIST_CJS).mtimeMs;
  const srcMtime = fs.statSync(SRC_INDEX).mtimeMs;

  if (distMtime < srcMtime) {
    throw new Error('Run npm run build before public API tests.');
  }
}

function loadCjsRuntimeExports(): string[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cjs = require(DIST_CJS) as Record<string, unknown>;
  return Object.keys(cjs).sort();
}

function loadEsmRuntimeExports(): string[] {
  const distUrl = pathToFileURL(DIST_ESM).href;
  const out = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import * as m from ${JSON.stringify(distUrl)};` +
        'console.log(JSON.stringify(Object.keys(m).sort()));',
    ],
    {encoding: 'utf8'},
  );

  return JSON.parse(out.trim()) as string[];
}

describe('public API contract (dist)', () => {
  beforeAll(() => {
    assertDistIsFresh();
  });

  describe('runtime exports', () => {
    it('matches the expected CJS export list from dist/index.js', () => {
      expect(loadCjsRuntimeExports()).toEqual([...EXPECTED_RUNTIME_EXPORTS]);
    });

    it('matches the expected ESM export list from dist/index.mjs', () => {
      expect(loadEsmRuntimeExports()).toEqual([...EXPECTED_RUNTIME_EXPORTS]);
    });

    it('keeps CJS and ESM runtime exports in parity', () => {
      expect(loadEsmRuntimeExports()).toEqual(loadCjsRuntimeExports());
    });
  });

  describe('declaration exports', () => {
    const dts = parseDeclarationExportBlock(
      fs.readFileSync(DIST_DTS, 'utf8'),
    );
    const dmts = parseDeclarationExportBlock(
      fs.readFileSync(DIST_DMTS, 'utf8'),
    );

    it('declares the expected runtime exports in dist/index.d.ts', () => {
      expect(dts.values).toEqual([...EXPECTED_RUNTIME_EXPORTS]);
    });

    it('declares the expected type-only exports in dist/index.d.ts', () => {
      expect(dts.types).toEqual([...EXPECTED_TYPE_ONLY_EXPORTS]);
    });

    it('matches actual runtime exports declared in dist/index.d.ts', () => {
      expect(dts.values).toEqual(loadCjsRuntimeExports());
    });

    it('keeps dist/index.d.ts and dist/index.d.mts public export lists equivalent', () => {
      expect(dmts.values).toEqual(dts.values);
      expect(dmts.types).toEqual(dts.types);
    });
  });

  describe('export kinds', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cjs = require(DIST_CJS) as Record<string, unknown>;

    const hooks = [
      'useFusionState',
      'useGlobalState',
      'useFusionStateLog',
      'usePersistentState',
      'useFrequentState',
      'useFormState',
      'useCounter',
      'useToggle',
    ] as const;

    it.each(hooks)('%s is a function', (name) => {
      expect(typeof cjs[name]).toBe('function');
    });

    it('storage factories and utilities are functions', () => {
      expect(typeof cjs.createNoopStorageAdapter).toBe('function');
      expect(typeof cjs.createLocalStorageAdapter).toBe('function');
      expect(typeof cjs.createMemoryStorageAdapter).toBe('function');
      expect(typeof cjs.detectBestStorageAdapter).toBe('function');
      expect(typeof cjs.debounce).toBe('function');
      expect(typeof cjs.formatErrorMessage).toBe('function');
      expect(typeof cjs.simpleDeepEqual).toBe('function');
      expect(typeof cjs.NoopStorageAdapter).toBe('function');
    });

    it('FusionStateErrorMessages is a runtime enum-like object', () => {
      expect(cjs.FusionStateErrorMessages).toMatchObject({
        PROVIDER_MISSING: expect.any(String),
      });
    });

    it('FusionStateProvider is a React component export', () => {
      expect(cjs.FusionStateProvider).toBeTruthy();
      expect(cjs.FusionStateProvider).toHaveProperty('$$typeof');
    });
  });

  describe('package.json publishing surface', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../../package.json') as {
      main: string;
      module: string;
      types: string;
      files: string[];
      sideEffects: boolean;
      exports: Record<string, unknown>;
    };

    it('points entry fields at dist artifacts', () => {
      expect(pkg.main).toBe('./dist/index.js');
      expect(pkg.module).toBe('./dist/index.mjs');
      expect(pkg.types).toBe('./dist/index.d.ts');
    });

    it('declares the conditional exports map', () => {
      expect(pkg.exports['.']).toEqual({
        types: './dist/index.d.ts',
        import: './dist/index.mjs',
        require: './dist/index.js',
      });
      expect(pkg.exports['./package.json']).toBe('./package.json');
    });

    it('ships only dist and marks the package as side-effect free', () => {
      expect(pkg.files).toEqual(['dist']);
      expect(pkg.sideEffects).toBe(false);
    });
  });
});
