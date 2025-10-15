module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-ml-kit|react-native-vision-camera|@react-native-community|react-native-svg)/)'
  ],
  moduleNameMapper: {
    '^@react-native-ml-kit/text-recognition$': '<rootDir>/__mocks__/@react-native-ml-kit/text-recognition.js',
    '^react-native-vision-camera$': '<rootDir>/__mocks__/react-native-vision-camera.js',
  },
};
