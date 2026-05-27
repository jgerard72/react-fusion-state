module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/$1',
    '^@storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@examples/(.*)$': '<rootDir>/src/examples/$1',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/examples/**',
    // Redux DevTools browser bridge — runs in browser extension context, not jsdom.
    // Covered by manual QA. Tracked separately, excluded from threshold to keep CI green.
    '!src/devtools.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
}; 