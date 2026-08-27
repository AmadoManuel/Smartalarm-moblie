/**
 * Componente do desafio Sacudir Dispositivo.
 * Usa o acelerómetro para contar sacudidelas.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useShakeDevice } from '../../hooks/useChallenge';
import type { ChallengeTask } from '../../domain/types';

interface ShakeDeviceProps {
  challenge: ChallengeTask;
  onAnswer: (answer: { shakes: number }) => void;
  disabled?: boolean;
  error?: string | null;
}

export const ShakeDevice: React.FC<ShakeDeviceProps> = ({
  challenge,
  onAnswer,
  disabled = false,
  error = null,
}) => {
  const { shakeCount, requiredShakes, isComplete, reset } = useShakeDevice(challenge);
  const progressAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(shakeCount / requiredShakes, 1),
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [shakeCount, requiredShakes, progressAnim]);

  React.useEffect(() => {
    if (isComplete) {
      onAnswer({ shakes: shakeCount });
    }
  }, [isComplete, shakeCount, onAnswer]);

  const progress = shakeCount / requiredShakes;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sacuda o telemóvel</Text>
      <Text style={styles.subtitle}>
        {shakeCount} / {requiredShakes} sacudidelas
      </Text>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>
      <View style={styles.phoneIcon}>
        <Animated.View
          style={[
            styles.phone,
            {
              transform: [
                { rotate: `${Math.sin(shakeCount * 0.5) * 15}deg` },
              ],
            },
          ]}
        >
          <Text style={styles.phoneScreen}>
            {isComplete ? '✓' : '📱'}
          </Text>
        </Animated.View>
      </View>
      {isComplete && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ Completo! Bem feito!</Text>
          <TouchableOpacity style={styles.retryButton} onPress={reset} disabled={disabled}>
            <Text style={styles.retryButtonText}>Fazer outra vez</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isComplete && (
        <Text style={styles.hint}>
          Segure firmemente e sacuda vigorosamente
        </Text>
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
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3b82f6',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  phoneIcon: {
    marginVertical: 16,
  },
  phone: {
    width: 120,
    height: 200,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  phoneScreen: {
    fontSize: 64,
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22c55e',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  hint: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 280,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default ShakeDevice;