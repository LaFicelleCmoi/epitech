export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverage: false,
  collectCoverageFrom: [
    'Controllers/**/*.js',
    'Models/**/*.js',
    'Routes/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  testTimeout: 30000,
  setupFilesAfterEach: [],
  verbose: true,
};
