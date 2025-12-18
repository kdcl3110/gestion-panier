module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**/*.js',
    'utils/**/*.js',
    'database.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/__tests__/unit/**/*.test.js'],
      testEnvironment: 'node'
    }
  ]
};
