import {defineConfig} from 'tsup';
import path from 'node:path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: 'es2019',
  jsx: 'react',
  tsconfig: 'tsconfig.json',
  external: ['react', 'react-dom'],
  noExternal: ['lodash.isequal'],
  esbuildOptions(options) {
    options.alias = {
      '@core': path.resolve(__dirname, 'src'),
      '@storage': path.resolve(__dirname, 'src/storage'),
    };
  },
  outExtension({format}) {
    return {js: format === 'cjs' ? '.js' : '.mjs'};
  },
});
