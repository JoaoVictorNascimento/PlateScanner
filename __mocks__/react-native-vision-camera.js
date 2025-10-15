const Camera = {
  // Mock da câmera
};

const useCameraDevice = jest.fn(() => ({
  id: 'mock-camera',
  position: 'back',
  name: 'Mock Camera',
}));

const useCameraPermission = jest.fn(() => ({
  hasPermission: true,
  requestPermission: jest.fn().mockResolvedValue('granted'),
}));

export { Camera, useCameraDevice, useCameraPermission };
