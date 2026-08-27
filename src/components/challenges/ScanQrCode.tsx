/**
 * Componente do desafio Escanear QR Code.
 * Usa expo-camera com detecção de código de barras.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useScanQrCode } from '../../hooks/useChallenge';
import type { ChallengeTask } from '../../domain/types';

interface ScanQrCodeProps {
  challenge: ChallengeTask;
  onAnswer: (answer: { content: string }) => void;
  disabled?: boolean;
  error?: string | null;
}

export const ScanQrCode: React.FC<ScanQrCodeProps> = ({
  challenge,
  onAnswer,
  disabled = false,
  error = null,
}) => {
  const {
    expectedContent,
    qrType,
    scanned,
    hasPermission,
    handleScan,
    isCorrect,
  } = useScanQrCode(challenge);

  const [torchOn, setTorchOn] = React.useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (scanned && !showResult) {
      setShowResult(true);
      onAnswer({ content: scanned });
    }
  }, [scanned, showResult, onAnswer]);

  const handleBarCodeScanned = useCallback(
    ({ barcodes }: { barcodes: Array<{ data: string }> }) => {
      if (barcodes.length > 0 && !showResult) {
        handleScan(barcodes[0].data);
      }
    },
    [handleScan, showResult],
  );

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Escanear QR Code</Text>
        <Text style={styles.errorText}>
          Permissão de câmara negada. Ative nas definições.
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>A pedir permissão de câmara...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escanear QR Code</Text>
      <Text style={styles.instruction}>
        Aponte a câmara para o código QR
      </Text>
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          onBarcodeScanned={handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <View style={styles.scanLine} />
          </View>
        </CameraView>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            torchOn && styles.controlButtonActive,
          ]}
          onPress={() => {
            cameraRef.current?.setTorchMode(torchOn ? 'off' : 'on');
            setTorchOn(!torchOn);
          }}
          disabled={disabled}
        >
          <Text style={styles.controlButtonText}>
            {torchOn ? '🔦 Desligar lanterna' : '🔦 Ligar lanterna'}
          </Text>
        </TouchableOpacity>
      </View>
      {showResult && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, isCorrect ? styles.success : styles.error]}>
            {isCorrect ? '✓ QR Code correto!' : '✗ QR Code incorreto'}
          </Text>
          <Text style={styles.scannedText}>Lido: {scanned}</Text>
          <Text style={styles.expectedText}>Esperado: {expectedContent}</Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  cameraWrapper: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#3b82f6',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanLine: {
    position: 'absolute',
    width: 220,
    height: 2,
    backgroundColor: '#3b82f6',
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
  },
  controlButtonActive: {
    backgroundColor: '#3b82f6',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  resultContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
  },
  success: {
    color: '#22c55e',
  },
  error: {
    color: '#ef4444',
  },
  scannedText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  expectedText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default ScanQrCode;