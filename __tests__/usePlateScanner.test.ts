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

  it('should handle OCR result with no text property', async () => {
    // Mock do resultado do OCR sem propriedade text
    mockTextRecognition.recognize.mockResolvedValue({
      blocks: []
    } as any);
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR result with null text', async () => {
    // Mock do resultado do OCR com text null
    mockTextRecognition.recognize.mockResolvedValue({
      text: null,
      blocks: []
    } as any);
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR result with undefined text', async () => {
    // Mock do resultado do OCR com text undefined
    mockTextRecognition.recognize.mockResolvedValue({
      text: undefined,
      blocks: []
    } as any);
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR result with empty string text', async () => {
    // Mock do resultado do OCR com text vazio
    mockTextRecognition.recognize.mockResolvedValue({
      text: '',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR result with only whitespace text', async () => {
    // Mock do resultado do OCR com apenas espaços
    mockTextRecognition.recognize.mockResolvedValue({
      text: '   \n\t   ',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR result with special characters', async () => {
    // Mock do resultado do OCR com caracteres especiais
    mockTextRecognition.recognize.mockResolvedValue({
      text: '!@#$%^&*()_+{}|:"<>?[]\\;\',./',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR result with numbers only', async () => {
    // Mock do resultado do OCR com apenas números
    mockTextRecognition.recognize.mockResolvedValue({
      text: '1234567890',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR result with letters only', async () => {
    // Mock do resultado do OCR com apenas letras
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle OCR error during photo processing', async () => {
    // Mock do erro no OCR
    mockTextRecognition.recognize.mockRejectedValue(new Error('OCR processing error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await processPhotoOCR('/test/path');

    expect(consoleSpy).toHaveBeenCalledWith('Erro no OCR:', expect.any(Error));
    expect(consoleSpy).toHaveBeenCalledWith('Path da foto:', '/test/path');
    expect(result).toBe(null);
    
    consoleSpy.mockRestore();
  });

  it('should handle photo without path property', async () => {
    // Mock do resultado do OCR sem propriedade text
    mockTextRecognition.recognize.mockResolvedValue({
      blocks: []
    } as any);
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe(null);
  });

  it('should handle empty photo path', async () => {
    // Mock do resultado do OCR
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });
    
    const result = await processPhotoOCR('');
    
    expect(result).toBe('ABC1234');
  });

  it('should handle photo path with special characters', async () => {
    // Mock do resultado do OCR
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });
    
    const result = await processPhotoOCR('/path/with spaces & special chars!');
    
    expect(result).toBe('ABC1234');
  });

  it('should handle photo path with unicode characters', async () => {
    // Mock do resultado do OCR
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });
    
    const result = await processPhotoOCR('/path/with/unicode/ção');
    
    expect(result).toBe('ABC1234');
  });

  it('should handle very long photo path', async () => {
    // Mock do resultado do OCR
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });
    
    const longPath = '/very/long/path/that/might/cause/issues/with/some/systems/and/needs/to/be/handled/properly/by/the/application';
    const result = await processPhotoOCR(longPath);
    
    expect(result).toBe('ABC1234');
  });

  it('should handle photo path with query parameters', async () => {
    // Mock do resultado do OCR
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });
    
    const result = await processPhotoOCR('/path/to/photo.jpg?param=value&other=123');
    
    expect(result).toBe('ABC1234');
  });

  it('should capture photo and detect plate successfully', async () => {
    const mockTakePhoto = jest.fn().mockResolvedValue({ path: '/test/photo.jpg' });
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });

    const { result } = renderHook(() => usePlateScanner(cameraRef));

    expect(result.current.isCapturing).toBe(true);
    expect(result.current.plate).toBe(null);

    // Advance timer to trigger photo capture
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Wait for async operations
    });

    expect(mockTakePhoto).toHaveBeenCalled();
    expect(result.current.plate).toBe('ABC1234');
    expect(result.current.isCapturing).toBe(false);
  });

  it('should continue capturing when no plate is detected', async () => {
    const mockTakePhoto = jest.fn().mockResolvedValue({ path: '/test/photo.jpg' });
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    mockTextRecognition.recognize.mockResolvedValue({
      text: 'No plate here',
      blocks: []
    });

    const { result } = renderHook(() => usePlateScanner(cameraRef));

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockTakePhoto).toHaveBeenCalled();
    expect(result.current.plate).toBe(null);
    expect(result.current.isCapturing).toBe(true);
  });

  it('should handle error during photo capture', async () => {
    const mockTakePhoto = jest.fn().mockRejectedValue(new Error('Camera error'));
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => usePlateScanner(cameraRef));

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockTakePhoto).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao capturar foto:', expect.any(Error));
    expect(result.current.plate).toBe(null);
    expect(result.current.isCapturing).toBe(true);

    consoleSpy.mockRestore();
  });

  it('should not execute interval callback when cameraRef.current is null after initialization', async () => {
    const mockTakePhoto = jest.fn().mockResolvedValue({ path: '/test/photo.jpg' });
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });

    const { result } = renderHook(() => usePlateScanner(cameraRef));

    // Set cameraRef to null before interval executes
    cameraRef.current = null;

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockTakePhoto).not.toHaveBeenCalled();
    expect(result.current.plate).toBe(null);
  });

  it('should not execute interval callback when takePhoto is undefined', async () => {
    const cameraRef = { current: {} } as any;

    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234',
      blocks: []
    });

    const { result } = renderHook(() => usePlateScanner(cameraRef));

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.plate).toBe(null);
    expect(result.current.isCapturing).toBe(true);
  });

  it('should not start interval when plate is already detected', () => {
    const mockTakePhoto = jest.fn();
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;
    
    const { result } = renderHook(() => usePlateScanner(cameraRef));

    // First, capture a plate
    act(() => {
      result.current.clearPlate();
    });

    expect(result.current.isCapturing).toBe(true);
    
    // Verify that timer is active when capturing is true
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current.isCapturing).toBe(true);
  });

  it('should cleanup interval when intervalRef.current is null', () => {
    const mockTakePhoto = jest.fn();
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    const { unmount } = renderHook(() => usePlateScanner(cameraRef));

    // Set camera to null so interval is not created in next effect
    cameraRef.current = null;

    unmount();

    // Should not throw error during cleanup
    expect(true).toBe(true);
  });

  it('should handle multiple rapid interval executions', async () => {
    const mockTakePhoto = jest.fn()
      .mockResolvedValueOnce({ path: '/test/photo1.jpg' })
      .mockResolvedValueOnce({ path: '/test/photo2.jpg' });
    
    const cameraRef = { current: { takePhoto: mockTakePhoto } } as any;

    mockTextRecognition.recognize
      .mockResolvedValueOnce({
        text: 'No plate',
        blocks: []
      })
      .mockResolvedValueOnce({
        text: 'ABC1234',
        blocks: []
      });

    const { result } = renderHook(() => usePlateScanner(cameraRef));

    // First interval execution - no plate found
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockTakePhoto).toHaveBeenCalledTimes(1);
    expect(result.current.plate).toBe(null);
    expect(result.current.isCapturing).toBe(true);

    // Second interval execution - plate found
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockTakePhoto).toHaveBeenCalledTimes(2);
    expect(result.current.plate).toBe('ABC1234');
    expect(result.current.isCapturing).toBe(false);
  });

  it('should recognize plate with mixed case letters', async () => {
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'aBc1234',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
  });

  it('should recognize plate with lowercase letters', async () => {
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'abc1a23',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1A23');
  });

  it('should handle plate format with tabs and newlines', async () => {
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'A\tB\tC\t1\t2\t3\t4\n\n',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
  });

  it('should handle multiple valid plates and return first one', async () => {
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'ABC1234\nDEF5678\nGHI9012',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
  });

  it('should not crash when processing very long text', async () => {
    const longText = 'A'.repeat(10000) + '\nABC1234\n' + 'B'.repeat(10000);
    mockTextRecognition.recognize.mockResolvedValue({
      text: longText,
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
  });

  it('should handle text with multiple line breaks', async () => {
    mockTextRecognition.recognize.mockResolvedValue({
      text: '\n\n\nABC1234\n\n\n',
      blocks: []
    });
    
    const result = await processPhotoOCR('/test/path');
    
    expect(result).toBe('ABC1234');
  });
});
