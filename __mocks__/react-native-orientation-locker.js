// Mock do react-native-orientation-locker
const Orientation = {
  lockToLandscape: jest.fn(),
  lockToPortrait: jest.fn(),
  unlockAllOrientations: jest.fn(),
  getOrientation: jest.fn(),
  addOrientationListener: jest.fn(),
  removeOrientationListener: jest.fn(),
  addDeviceOrientationListener: jest.fn(),
  removeDeviceOrientationListener: jest.fn(),
  getDeviceOrientation: jest.fn(),
  lockToPortraitUpsideDown: jest.fn(),
  lockToLandscapeLeft: jest.fn(),
  lockToLandscapeRight: jest.fn(),
};

export default Orientation;
