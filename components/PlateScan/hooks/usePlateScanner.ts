import { useState, useCallback, useRef } from "react";
import { useFrameProcessor } from "react-native-vision-camera";
import { useTextRecognition } from 'react-native-vision-camera-ocr';
import { runOnJS } from 'react-native-reanimated';

// Regex para placas brasileiras (formato antigo: ABC1234 e novo: ABC1A23)
const matchPlate = /[A-Z]{3}[0-9][0-9A-Z][0-9]{2}/;

export const usePlateScanner = () => {
    const [plate, setPlate] = useState<string>('');
    const [isScanning, setIsScanning] = useState<boolean>(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Função para processar textos detectados (executada no JS thread)
    const processDetectedTexts = useCallback((detectedTexts: any[]) => {
        if (!detectedTexts || detectedTexts.length === 0 || !isScanning) return;
        
        console.log('Textos detectados:', detectedTexts);
        
        // Processa todos os textos detectados
        for (const textElement of detectedTexts) {
            const detectedText = textElement.text || textElement.value || '';
            
            if (!detectedText) continue;
            
            // Remove espaços e caracteres especiais, converte para maiúsculo
            const cleanText = detectedText.replace(/[^A-Z0-9]/g, '').toUpperCase();
            
            console.log('Texto limpo:', cleanText);
            
            // Tenta encontrar uma placa no texto
            const plateMatch = cleanText.match(matchPlate);
            
            if (plateMatch && plateMatch[0]) {
                const detectedPlate = plateMatch[0];
                console.log('Placa detectada:', detectedPlate);
                
                // Verifica se é uma placa válida (não repetir a mesma placa continuamente)
                if (detectedPlate !== plate) {
                    setPlate(detectedPlate);
                    
                    // Para de escanear por um breve momento após detectar uma placa
                    setIsScanning(false);
                    
                    // Limpa timeout anterior se existir
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                    
                    timeoutRef.current = setTimeout(() => {
                        setIsScanning(true);
                    }, 3000); // 3 segundos de pausa
                    break; // Para no primeiro match
                }
            }
        }
    }, [plate, isScanning]);
    
    // Configuração do reconhecimento de texto
    const { scanText } = useTextRecognition({
        language: 'latin', // Ideal para placas com caracteres latinos
    });
    
    // Frame processor para processar os frames da câmera
    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        if (!isScanning) return;
        
        try {
            const detectedTexts = scanText(frame);
            if (detectedTexts && detectedTexts.length > 0) {
                runOnJS(processDetectedTexts)(detectedTexts);
            }
        } catch (error) {
            console.log('Erro no frame processor:', error);
        }
    }, [isScanning, processDetectedTexts]);
    
    // Função para resetar a detecção
    const resetPlateDetection = useCallback(() => {
        // Limpa timeout se existir
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        setPlate('');
        setIsScanning(true);
    }, []);
    
    return {
        plate,
        isScanning,
        resetPlateDetection,
        frameProcessor
    };
}
