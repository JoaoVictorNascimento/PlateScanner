import { useState, useEffect, useRef } from "react";
import TextRecognition from '@react-native-ml-kit/text-recognition';

// Regex para placas brasileiras (formato antigo: ABC1234 e novo: ABC1A23)
const PLATE_REGEX = /[A-Z]{3}[0-9][0-9A-Z][0-9]{2}/;

// Função para processar OCR da foto
const processPhotoOCR = async (photoPath: string): Promise<string | null> => {
    try {
        // Converter file path para URI que o ML Kit consegue ler
        const fileUri = 'file://' + photoPath;
        const result = await TextRecognition.recognize(fileUri);
        
        if (result?.text) {
            const lines = result.text.split('\n');
            for (const line of lines) {
                const cleanLine = line.replace(/\s+/g, '').toUpperCase();
                const match = cleanLine.match(PLATE_REGEX);
                if (match) {
                    return match[0];
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Erro no OCR:', error);
        console.error('Path da foto:', photoPath);
        return null;
    }
};

export const usePlateScanner = (cameraRef: any) => {
    const [isCapturing, setIsCapturing] = useState<boolean>(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [plate, setPlate] = useState<string | null>(null);

    useEffect(() => {
        if (isCapturing && !plate && cameraRef?.current) {
            intervalRef.current = setInterval(async () => {
                if (!cameraRef?.current) return;
                
                try {
                    const photo = await cameraRef.current.takePhoto({
                        quality: 0.7,
                        skipMetadata: true,
                    });
                    
                    const plateResult = await processPhotoOCR(photo.path);
                    if (plateResult) {
                        setPlate(plateResult);
                        setIsCapturing(false);
                    }
                    
                } catch (error) {
                    console.error('Erro ao capturar foto:', error);
                }
            }, 500);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }
    }, [isCapturing, plate, cameraRef]);

    const toggleCapture = () => {
        setIsCapturing(prev => !prev);
    };

    const clearPlate = () => {
        setPlate(null);
        setIsCapturing(true);
    };

    return {
        isCapturing,
        toggleCapture,
        plate,
        clearPlate,
    };
}
