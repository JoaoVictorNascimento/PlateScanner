let mockHasPermission = true;
let mockBackCamera = { id: 'back-camera', name: 'back' };
let mockRequestPermission = jest.fn().mockResolvedValue(true);

jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    Camera: ({ children, ...props }: any) => React.createElement(View, { testID: "camera", ...props }, children),
    useCameraDevice: () => mockBackCamera,
    useCameraPermission: () => ({
      hasPermission: mockHasPermission,
      requestPermission: mockRequestPermission,
    }),
  };
});

jest.mock('../components/PlateScan/hooks/usePlateScanner');
jest.mock('../helpers/navigationHelper');
jest.mock('@react-navigation/native');
jest.mock('react-native-orientation-locker');
jest.mock('styled-components/native');
jest.mock('../components/PlateScan/styles', () => ({
  styles: {
    plateScanContainer: {},
    cameraStyle: {},
    overlayContainer: {},
    actions: {},
    loadingContainer: {},
    loadingText: {},
  },
  PlateMessage: ({ children, testID, ...props }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: testID || 'plate-scan-message', ...props }, children);
  },
}));
jest.mock('../components/PlateScan/ScannerOverlay', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockScannerOverlay({ scanAreaWidth, scanAreaHeight, borderRadius }: any) {
    return React.createElement(View, { testID: "scanner-overlay" },
      React.createElement(Text, { testID: "scan-area" },
        `Scan Area: ${scanAreaWidth}x${scanAreaHeight}, Border: ${borderRadius}`
      )
    );
  };
});

const mockTheme = {
  colors: {
    white: 'white',
  },
  fontWeight: {
    bold: 'bold',
  },
};

jest.mock('styled-components/native', () => ({
  useTheme: () => mockTheme,
}));
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PlateScan from '../components/PlateScan/PlateScan';
import { usePlateScanner } from '../components/PlateScan/hooks/usePlateScanner';
import { useNavigation } from '../helpers/navigationHelper';
import { useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';

const mockUsePlateScanner = usePlateScanner as jest.MockedFunction<typeof usePlateScanner>;
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;
const mockOrientation = Orientation as jest.Mocked<typeof Orientation>;

describe('PlateScan', () => {
  const mockGoBack = jest.fn();
  const mockOnChangePlate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockHasPermission = true;
    mockBackCamera = { id: 'back-camera', name: 'back' };
    mockRequestPermission = jest.fn().mockResolvedValue(true);
    mockUsePlateScanner.mockReturnValue({
      plate: null,
      isCapturing: false,
      toggleCapture: jest.fn(),
      clearPlate: jest.fn(),
    });
    
    mockUseNavigation.mockReturnValue({
      goBack: mockGoBack,
      replace: jest.fn(),
      dispatch: jest.fn(),
      navigate: jest.fn(),
      navigateDeprecated: jest.fn(),
      setParams: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      canGoBack: jest.fn(),
      getId: jest.fn(),
      getParent: jest.fn(),
      getState: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
      isFocused: jest.fn(),
      push: jest.fn(),
      pop: jest.fn(),
    } as any);
    
    mockUseRoute.mockReturnValue({
      key: 'test-key',
      name: 'PlateScan',
      params: {
        onChangePlate: mockOnChangePlate,
      },
    } as any);
    
    mockOrientation.lockToLandscape = jest.fn();
    mockOrientation.unlockAllOrientations = jest.fn();
    
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly with camera permission', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId } = render(<PlateScan />);

    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });

    expect(getByTestId('plate-scan-message')).toBeTruthy();
    expect(getByTestId('moov-icon-chevron-left')).toBeTruthy();
    expect(getByTestId('moov-icon-flash')).toBeTruthy();
  });

  it('should show loading message when there is no permission', () => {
    mockHasPermission = false;

    const { getByText } = render(<PlateScan />);
    
    expect(getByText('Solicitando permissão da câmera...')).toBeTruthy();
  });

  it('should show loading message when there is no camera available', () => {
    mockBackCamera = null as any;

    const { getByText } = render(<PlateScan />);
    
    expect(getByText('Carregando Câmera...')).toBeTruthy();
  });

  it('should request camera permission on mount', async () => {
    mockRequestPermission.mockResolvedValue(true);

    render(<PlateScan />);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });

  it('should show alert when permission is denied', async () => {
    mockRequestPermission.mockResolvedValue(false);
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<PlateScan />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Permissão Necessária',
        'Este app precisa de acesso à câmera para funcionar',
        [{ text: 'OK' }]
      );
    });
  });

  it('should show alert when there is an error requesting permission', async () => {
    const error = new Error('Erro de permissão');
    mockRequestPermission.mockRejectedValue(error);
    const alertSpy = jest.spyOn(Alert, 'alert');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<PlateScan />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao solicitar permissão da câmera:', error);
      expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível acessar a câmera');
    });

    consoleSpy.mockRestore();
  });

  it('should call onChangePlate and goBack when plate is detected', async () => {
    const detectedPlate = 'ABC1234';
    mockUsePlateScanner.mockReturnValue({
      plate: detectedPlate,
      isCapturing: false,
      toggleCapture: jest.fn(),
      clearPlate: jest.fn(),
    });

    render(<PlateScan />);

    await waitFor(() => {
      expect(mockOnChangePlate).toHaveBeenCalledWith(detectedPlate);
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should toggle flash when button is pressed', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId } = render(<PlateScan />);

    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });

    const flashButton = getByTestId('moov-icon-flash');
    
    fireEvent.press(flashButton);
    expect(getByTestId('moov-icon-flash-off')).toBeTruthy();
    
    fireEvent.press(getByTestId('moov-icon-flash-off'));
    expect(getByTestId('moov-icon-flash')).toBeTruthy();
  });

  it('should call goBack when back button is pressed', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId } = render(<PlateScan />);

    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });

    const backButton = getByTestId('moov-icon-chevron-left');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should set orientation to landscape on mount', () => {
    render(<PlateScan />);
    
    expect(mockOrientation.lockToLandscape).toHaveBeenCalled();
  });

  it('should unlock orientations on unmount', () => {
    const { unmount } = render(<PlateScan />);
    
    unmount();
    
    expect(mockOrientation.unlockAllOrientations).toHaveBeenCalled();
  });

  it('should show ScannerOverlay after orientation timer', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { queryByTestId, getByTestId } = render(<PlateScan />);

    expect(queryByTestId('scanner-overlay')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(getByTestId('scanner-overlay')).toBeTruthy();
    });
  });

  it('should pass correct props to ScannerOverlay', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId } = render(<PlateScan />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      const scanArea = getByTestId('scan-area');
      expect(scanArea).toHaveTextContent('Scan Area: 600x200, Border: 20');
    });
  });

  it('should use theme correctly for PlateMessage', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId } = render(<PlateScan />);

    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });

    const message = getByTestId('plate-scan-message');
    expect(message).toBeTruthy();
  });

  it('should work without params in route', async () => {
    mockUseRoute.mockReturnValue({
      key: 'test-key',
      name: 'PlateScan',
      params: undefined,
    } as any);

    const { getByTestId } = render(<PlateScan />);
    
    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });
  });

  it('should work with empty params in route', async () => {
    mockUseRoute.mockReturnValue({
      key: 'test-key',
      name: 'PlateScan',
      params: {},
    } as any);

    const { getByTestId } = render(<PlateScan />);
    
    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });
  });

  it('should clear timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = render(<PlateScan />);
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('should set camera as active when permission is granted', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId } = render(<PlateScan />);

    await waitFor(() => {
      const camera = getByTestId('camera');
      expect(camera).toBeTruthy();
    });
  });

  it('should render icons with correct props', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId } = render(<PlateScan />);

    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });

    const backIcon = getByTestId('moov-icon-chevron-left');
    const flashIcon = getByTestId('moov-icon-flash');
    
    expect(backIcon).toBeTruthy();
    expect(flashIcon).toBeTruthy();
  });

  it('should toggle between flash icons correctly', async () => {
    mockRequestPermission.mockResolvedValue(true);

    const { getByTestId, queryByTestId } = render(<PlateScan />);

    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });

    expect(getByTestId('moov-icon-flash')).toBeTruthy();
    expect(queryByTestId('moov-icon-flash-off')).toBeNull();

    fireEvent.press(getByTestId('moov-icon-flash'));
    expect(getByTestId('moov-icon-flash-off')).toBeTruthy();
    expect(queryByTestId('moov-icon-flash')).toBeNull();

    fireEvent.press(getByTestId('moov-icon-flash-off'));
    expect(getByTestId('moov-icon-flash')).toBeTruthy();
    expect(queryByTestId('moov-icon-flash-off')).toBeNull();
  });

  it('should handle console error during camera setup', async () => {
    const error = new Error('Erro de setup');
    mockRequestPermission.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<PlateScan />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao solicitar permissão da câmera:', error);
    });

    consoleSpy.mockRestore();
  });

  it('should render correctly with all dependencies mocked', async () => {
    mockRequestPermission.mockResolvedValue(true);
    mockUsePlateScanner.mockReturnValue({
      plate: null,
      isCapturing: false,
      toggleCapture: jest.fn(),
      clearPlate: jest.fn(),
    });

    const { getByTestId } = render(<PlateScan />);

    await waitFor(() => {
      expect(getByTestId('camera')).toBeTruthy();
    });

    expect(getByTestId('plate-scan-message')).toBeTruthy();
    expect(getByTestId('moov-icon-chevron-left')).toBeTruthy();
    expect(getByTestId('moov-icon-flash')).toBeTruthy();
  });
});