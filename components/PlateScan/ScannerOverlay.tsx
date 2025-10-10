import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface ScannerOverlayProps {
  scanAreaWidth?: number;
  scanAreaHeight?: number;
  borderRadius?: number;
  overlayColor?: string;
}

export default function ScannerOverlay({
  scanAreaWidth = 250,
  scanAreaHeight = 200,
  borderRadius = 20,
  overlayColor = 'rgba(0, 0, 0, 0.6)',
}: ScannerOverlayProps) {
  // Calcular posição central
  const centerX = width / 2;
  const centerY = height / 2;
  const scanX = centerX - scanAreaWidth / 2;
  const scanY = centerY - scanAreaHeight / 2;

  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        {/* Máscara para criar o furo arredondado */}
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
          />
        </Mask>
      </Defs>
      
      {/* Overlay com furo arredondado */}
      <Rect
        width="100%"
        height="100%"
        fill={overlayColor}
        mask="url(#hole)"
      />
    </Svg>
  );
}
