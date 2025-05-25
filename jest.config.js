/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Use setupFiles for the global mocks and setupFilesAfterEnv for test framework extensions
  setupFiles: ['<rootDir>/jest.setup.global.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.framework.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/', 
    '<rootDir>/.next/', 
    '<rootDir>/src/__tests__/mocks/openai.ts',
    '<rootDir>/src/__tests__/setup-globals.ts',
    '<rootDir>/src/__tests__/setup-jest.ts',
    '<rootDir>/src/__tests__/api/sessions-route.test.ts.new',
    '<rootDir>/src/__tests__/api/session-id-route.test.ts.new',
    '<rootDir>/src/__tests__/api/chat-route.test.ts.new'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.mjs$)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
};

module.exports = config;