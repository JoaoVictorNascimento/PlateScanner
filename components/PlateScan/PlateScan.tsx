import { useEffect, useRef, useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { MoovIcon } from "@moov/ds";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { styles } from "./styles";
import { usePlateScanner } from "./hooks/usePlateScanner";
import { useNavigation } from "../../helpers/navigationHelper";
import Orientation from "react-native-orientation-locker";
import ScannerOverlay from "./ScannerOverlay";
import { useTheme } from "styled-components/native";
import { BASE_TEST_ID } from "./constants";
import { useRoute } from "@react-navigation/native";
import * as S from "./styles";

export default function PlateScan() {
  const backCamera = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { plate } = usePlateScanner(cameraRef);
  const { goBack } = useNavigation();
  const theme = useTheme();
  const { params } = useRoute() as {
    params?: { onChangePlate(plate: string): void };
  };
  const { onChangePlate } = { ...params };

  const [isFlashOn, setFlashOn] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isOrientationReady, setIsOrientationReady] = useState(false);

  useEffect(() => {
    Orientation.lockToLandscape();

    const timer = setTimeout(() => {
      setIsOrientationReady(true);
    }, 300);

    return () => {
      Orientation.unlockAllOrientations();
      clearTimeout(timer);
    };
  }, []);

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
            [{ text: "OK" }],
          );
        }
      } catch (error) {
        console.error("Erro ao solicitar permissão da câmera:", error);
        Alert.alert("Erro", "Não foi possível acessar a câmera");
      }
    };

    setupCamera();
  }, [requestPermission]);

  useEffect(() => {
    if (plate) {
      onChangePlate?.(plate);
      goBack();
    }
  }, [plate, goBack, onChangePlate]);

  const handleFlash = () => setFlashOn(!isFlashOn);

  if (!hasPermission) {
    return (
      <View style={styles.plateScanContainer}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Solicitando permissão da câmera...
          </Text>
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
        torch={isFlashOn ? "on" : "off"}
      />
      {isOrientationReady && (
        <ScannerOverlay
          scanAreaWidth={600}
          scanAreaHeight={200}
          borderRadius={20}
        />
      )}
      <View style={styles.overlayContainer}>
        <View style={styles.actions}>
          <TouchableOpacity onPress={goBack}>
            <MoovIcon name="chevron-left" size={35} color="white" />
          </TouchableOpacity>
          <S.PlateMessage
            testID={`${BASE_TEST_ID}-message`}
            text="Posicione a placa do veículo na guia:"
            weight={theme.fontWeight.bold}
            color={theme.colors.white}
          />
          <TouchableOpacity onPress={handleFlash}>
            <MoovIcon
              name={isFlashOn ? "flash-off" : "flash"}
              size={35}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
