const rulesDirPlugin = require('eslint-plugin-rulesdir');
const path = require('path');

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

rulesDirPlugin.RULES_DIR = path.resolve(__dirname, './eslint-rules');

module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ['plugin:react/recommended'],
  parser: 'hermes-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['flowtype', 'react', 'jest', 'fb-www', 'rulesdir', 'relay'],
  rules: {
    strict: 0,
    'jsx-a11y/href-no-hash': OFF,
    'react/jsx-key': OFF,
    'react/prop-types': OFF,
    'rulesdir/no-fb-only': OFF,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
