module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-ml-kit|react-native-vision-camera|@react-native-community|react-native-svg|@react-navigation|react-native-orientation-locker|styled-components)/)'
  ],
  moduleNameMapper: {
    '^@react-native-ml-kit/text-recognition$': '<rootDir>/__mocks__/@react-native-ml-kit/text-recognition.js',
    '^react-native-orientation-locker$': '<rootDir>/__mocks__/react-native-orientation-locker.js',
    '^@moov/ds$': '<rootDir>/__mocks__/@moov/ds.js',
  },
  collectCoverage: false,
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    '!components/**/*.d.ts',
    '!components/**/index.ts',
    '!components/**/styles.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/android/**',
    '!**/ios/**',
    '!**/coverage/**',
    '!**/build/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 50,
      lines: 40,
      statements: 40
    }
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/coverage/',
    '/build/',
    '/dist/'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
