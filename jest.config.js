// Jest configuration for Next.js + TypeScript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).(ts|tsx|js)'],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.(css|less|sass|scss)$': '<rootDir>/test/__mocks__/styleMock.js',
    // Handle image and other static imports
    '^.+\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: [],
};

module.exports = createJestConfig(customJestConfig);

