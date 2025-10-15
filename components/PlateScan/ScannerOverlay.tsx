import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

interface ScannerOverlayProps {
  scanAreaWidth?: number;
  scanAreaHeight?: number;
  borderRadius?: number;
}

export default function ScannerOverlay({
  scanAreaWidth = 250,
  scanAreaHeight = 200,
  borderRadius = 20,
}: ScannerOverlayProps) {
  const { width, height } = useWindowDimensions();
  const centerX = width / 2;
  const centerY = height / 2;
  const scanX = centerX - scanAreaWidth / 1.75;
  const scanY = centerY - scanAreaHeight / 2.5;

  return (
    <Svg style={StyleSheet.absoluteFill} testID="scanner-overlay">
      <Defs>
        <Mask id="hole">
          <Rect width="100%" height="100%" fill="white" />
          <Rect
            x={scanX}
            y={scanY}
            width={scanAreaWidth}
            height={scanAreaHeight}
            rx={borderRadius}
            ry={borderRadius}
            fill="black"
            testID="scan-area"
          />
        </Mask>
      </Defs>
      <Rect
        width="100%"
        height="100%"
        fill="black"
        mask="url(#hole)"
        testID="overlay-background"
      />
    </Svg>
  );
}
