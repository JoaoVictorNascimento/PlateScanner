import { useState, useEffect, useRef } from "react";

export const usePlateScanner = (cameraRef: any) => {
    const [isCapturing, setIsCapturing] = useState<boolean>(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (isCapturing && cameraRef?.current) {
            intervalRef.current = setInterval(async () => {
                if (!cameraRef?.current) return;
                
                try {
                    const photo = await cameraRef.current.takePhoto({
                        quality: 0.7,
                        skipMetadata: true,
                    });

                    console.log('Foto capturada:', photo.path);
                    
                } catch (error) {
                    console.error('Erro ao capturar foto:', error);
                }
            }, 2000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }
    }, [isCapturing, cameraRef]);

    const toggleCapture = () => {
        setIsCapturing(prev => !prev);
    };

    return {
        isCapturing,
        toggleCapture
    };
}
