const React = require('react');
const { View } = require('react-native');

// Mock state para controlar o comportamento dos hooks
let mockHasPermission = true;
let mockBackCamera = { id: 'back-camera', name: 'back' };
let mockRequestPermission = jest.fn().mockResolvedValue(true);

const Camera = ({ children, ...props }) => {
  return React.createElement(View, { testID: "camera", ...props }, children);
};

const useCameraDevice = (type) => {
  return mockBackCamera;
};

const useCameraPermission = () => {
  return {
    hasPermission: mockHasPermission,
    requestPermission: mockRequestPermission,
  };
};

// Funções auxiliares para os testes
const __setMockHasPermission = (value) => {
  mockHasPermission = value;
};

const __setMockBackCamera = (value) => {
  mockBackCamera = value;
};

const __setMockRequestPermission = (fn) => {
  mockRequestPermission = fn;
};

const __getMockRequestPermission = () => {
  return mockRequestPermission;
};

const __resetMocks = () => {
  mockHasPermission = true;
  mockBackCamera = { id: 'back-camera', name: 'back' };
  mockRequestPermission = jest.fn().mockResolvedValue(true);
};

module.exports = {
  Camera,
  useCameraDevice,
  useCameraPermission,
  __setMockHasPermission,
  __setMockBackCamera,
  __setMockRequestPermission,
  __getMockRequestPermission,
  __resetMocks,
};