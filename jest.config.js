// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true, // Generate coverage reports
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    // Optionally specify test file patterns if you put them outside the default location:
    // testMatch: ['**/tests/**/*.test.ts?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  };