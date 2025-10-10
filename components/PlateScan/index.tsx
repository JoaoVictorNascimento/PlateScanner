import { useEffect, useRef, useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { styles } from "./styles";
import { usePlateScanner } from "./hooks/usePlateScanner";
import ScannerOverlay from "./ScannerOverlay";

export default function PlateScan() {
    const backCamera = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const { isCapturing, toggleCapture, plate, clearPlate } = usePlateScanner(cameraRef);

    useEffect(() => {
        const setupCamera = async () => {
            try {
                const permission = await requestPermission();
                if (permission) {
                    setIsCameraActive(true);
                } else {
                    Alert.alert(
                        "Permissão Necessária",
                        "Este app precisa de acesso à câmera para funcionar",
                        [{ text: "OK" }]
                    );
                }
            } catch (error) {
                console.error("Erro ao solicitar permissão da câmera:", error);
                Alert.alert("Erro", "Não foi possível acessar a câmera");
            }
        };

        setupCamera();
    }, [requestPermission]);

    if (!hasPermission) {
        return (
            <View style={styles.plateScanContainer}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Solicitando permissão da câmera...</Text>
                </View>
            </View>
        );
    }

    if (!backCamera) {
        return (
            <View style={styles.plateScanContainer}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Carregando Câmera...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.plateScanContainer}>
            <Camera
                ref={cameraRef}
                style={styles.cameraStyle}
                device={backCamera}
                isActive={isCameraActive}
                photo={true}
            />
            {/* Overlay com furo arredondado usando SVG */}
            <ScannerOverlay
                scanAreaWidth={250}
                scanAreaHeight={200}
                borderRadius={20}
                overlayColor="rgba(0, 0, 0, 0.6)"
            />
            
            {/* Controles na parte inferior */}
            <View style={styles.overlayContainer}>
                {plate ? (
                    <>
                        <Text style={styles.plateResultStyle}>
                            {plate}
                        </Text>
                        <TouchableOpacity 
                            style={[styles.scanButton, styles.clearButton]} 
                            onPress={clearPlate}
                        >
                            <Text style={styles.scanButtonText}>
                                Limpar e Escanear Nova Placa
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.plateStyle}>
                            {isCapturing ? "Procurando placas..." : "Captura pausada"}
                        </Text>
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.scanButton} 
                                onPress={toggleCapture}
                            >
                                <Text style={styles.scanButtonText}>
                                    {isCapturing ? "Pausar" : "Iniciar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}