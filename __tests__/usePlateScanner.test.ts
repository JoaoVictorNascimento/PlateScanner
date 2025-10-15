import { renderHook, act } from '@testing-library/react-native';
import { usePlateScanner, processPhotoOCR } from '../components/PlateScan/hooks/usePlateScanner';
import TextRecognition from '@react-native-ml-kit/text-recognition';

// Mock das dependências
jest.mock('@react-native-ml-kit/text-recognition');
jest.mock('react-native-vision-camera');

const mockTextRecognition = TextRecognition as jest.Mocked<typeof TextRecognition>;

describe('usePlateScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct state', () => {
    const cameraRef = { current: null } as any;
    const { result } = renderHook(() => usePlateScanner(cameraRef));

    expect(result.current.isCapturing).toBe(true);
    expect(result.current.plate).toBe(null);
  });

  it('should toggle capture state', () => {
    const cameraRef = { current: null } as any;
    const { result } = renderHook(() => usePlateScanner(cameraRef));

    act(() => {
      result.current.toggleCapture();
    });

    expect(result.current.isCapturing).toBe(false);

    act(() => {
      result.current.toggleCapture();
    });

    expect(result.current.isCapturing).toBe(true);
  });

  it('should clear plate and restart capture', () => {
    const cameraRef = { current: null } as any;
    const { result } = renderHook(() => usePlateScanner(cameraRef));

    act(() => {
      result.current.clearPlate();
    });

    expect(result.current.plate).toBe(null);
    expect(result.current.isCapturing).toBe(true);
  });

  it('should not capture photo when isCapturing is false', () => {
    const mockTakePhoto = jest.fn();
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    const { result } = renderHook(() => usePlateScanner(cameraRef));

    // Disable capture
    act(() => {
      result.current.toggleCapture();
    });

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockTakePhoto).not.toHaveBeenCalled();
  });

  it('should not capture photo when cameraRef is null', () => {
    const cameraRef = { current: null } as any;
    const { result } = renderHook(() => usePlateScanner(cameraRef));

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should not have error, just not capture
    expect(result.current.isCapturing).toBe(true);
  });

  it('should test processPhotoOCR function directly', async () => {
    // Mock OCR result
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234\nOther text',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
    expect(mockTextRecognition.recognize).toHaveBeenCalledWith('file:///test/path');
  });

  it('should return null when no valid plate is found', async () => {
    // Mock OCR result without valid plate
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'Text without plate\nOther text',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should recognize plates in new format (ABC1A23)', async () => {
    // Mock OCR result with new format plate
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1A23\nOther text',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1A23');
  });

  it('should process text with spaces and special characters', async () => {
    // Mock OCR result with spaces and special characters
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'A B C 1 2 3 4\nOther text\nX Y Z 5 6 7 8',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
  });

  it('should handle OCR errors', async () => {
    // Mock OCR error
    mockTextRecognition.recognize.mockRejectedValue(new Error('OCR Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
    expect(consoleSpy).toHaveBeenCalledWith('Erro no OCR:', expect.any(Error));
    expect(consoleSpy).toHaveBeenCalledWith('Path da foto:', '/test/path');
    
    consoleSpy.mockRestore();
  });

  it('should return null when OCR returns no text', async () => {
    // Mock OCR result with no text
    mockTextRecognition.recognize.mockResolvedValue({
      text: '',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should find first valid plate in multiple lines', async () => {
    // Mock OCR result with multiple plates
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234\nXYZ5678\nDEF9012',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
  });

  it('should clear interval when component is unmounted', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const mockTakePhoto = jest.fn();
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    const { unmount } = renderHook(() => usePlateScanner(cameraRef));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    
    clearIntervalSpy.mockRestore();
  });
});
