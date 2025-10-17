/* eslint-env jest */

// Objeto compartilhado para armazenar os mocks
const mockState = {
  hasPermission: true,
  backCamera: { id: 'back-camera', name: 'back' },
  requestPermission: jest.fn().mockResolvedValue(true),
};

// Funções auxiliares para modificar as variáveis nos testes
const setMockHasPermission = (value) => {
  mockState.hasPermission = value;
};

const setMockBackCamera = (value) => {
  mockState.backCamera = value;
};

const setMockRequestPermission = (fn) => {
  mockState.requestPermission = fn;
};

const resetCameraMocks = () => {
  mockState.hasPermission = true;
  mockState.backCamera = { id: 'back-camera', name: 'back' };
  mockState.requestPermission = jest.fn().mockResolvedValue(true);
};

// Mock do react-native-vision-camera
jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    Camera: ({ children, ...props }) => React.createElement(View, { testID: "camera", ...props }, children),
    useCameraDevice: () => {
      // Importa o jest.setup para acessar o mockState atualizado
      const { mockState: state } = require('./jest.setup.js');
      return state.backCamera;
    },
    useCameraPermission: () => {
      // Importa o jest.setup para acessar o mockState atualizado
      const { mockState: state } = require('./jest.setup.js');
      return {
        hasPermission: state.hasPermission,
        requestPermission: state.requestPermission,
      };
    },
  };
});

module.exports = {
  mockState,
  setMockHasPermission,
  setMockBackCamera,
  setMockRequestPermission,
  resetCameraMocks,
};
