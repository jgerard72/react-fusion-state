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
    '!src/adapters/vue/**',
    '!src/adapters/angular/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/adapters/vue/',
    '/src/adapters/angular/',
    '/src/examples/VueExample',
    '/src/examples/AngularExample',
  ],
}; 