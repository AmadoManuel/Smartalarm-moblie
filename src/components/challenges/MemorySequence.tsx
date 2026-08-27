/**
 * Componente do desafio Sequência de Memória.
 * Mostra a sequência e depois pede para repetir tocando nos números.
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useMemorySequence } from '../../hooks/useChallenge';
import type { ChallengeTask } from '../../domain/types';

interface MemorySequenceProps {
  challenge: ChallengeTask;
  onAnswer: (answer: number[]) => void;
  disabled?: boolean;
  error?: string | null;
}

export const MemorySequence: React.FC<MemorySequenceProps> = ({
  challenge,
  onAnswer,
  disabled = false,
  error = null,
}) => {
  const {
    phase,
    gridSize,
    sequence,
    userSequence,
    displayTimeMs,
    result,
    startInput,
    handlePress,
    reset,
  } = useMemorySequence(challenge);

  const [showIndex, setShowIndex] = useState(-1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'showing') {
      const showSequence = async () => {
        for (let i = 0; i < sequence.length; i++) {
          setShowIndex(i);
          await Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
          await new Promise((r) => setTimeout(r, displayTimeMs / sequence.length));
          await Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start();
          await new Promise((r) => setTimeout(r, 100));
        }
        setShowIndex(-1);
        startInput();
      };
      showSequence();
    }
  }, [phase, sequence, displayTimeMs, startInput, fadeAnim]);

  const renderCell = useCallback(
    (index: number) => {
      const isActive = showIndex === index;
      const isSelected = phase === 'input' && userSequence.includes(index);
      const isCorrect = result === 'correct' && sequence.includes(index);
      const isIncorrect = result === 'incorrect' && userSequence.includes(index) && !sequence.includes(index);

      let bgColor = '#f3f4f6';
      if (isActive) bgColor = '#3b82f6';
      else if (isCorrect) bgColor = '#22c55e';
      else if (isIncorrect) bgColor = '#ef4444';
      else if (isSelected) bgColor = '#dbeafe';

      const textColor = isActive || isCorrect ? '#fff' : '#1a1a2e';

      return (
        <TouchableOpacity
          key={index}
          style={[styles.cell, { backgroundColor: bgColor }]}
          onPress={() => handlePress(index)}
          disabled={disabled || phase !== 'input' || result !== null}
          activeOpacity={0.8}
        >
          <Animated.View style={{ opacity: isActive ? fadeAnim : 1 }}>
            <Text style={[styles.cellText, { color: textColor }]}>{index + 1}</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    },
    [showIndex, phase, userSequence, result, sequence, handlePress, disabled, fadeAnim],
  );

  const cols = gridSize;
  const rows = Math.ceil((gridSize * gridSize) / cols);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {phase === 'showing' ? 'Memorize a sequência' : 'Repita a sequência'}
      </Text>
      {phase === 'showing' && (
        <Text style={styles.hint}>
          A mostrar {showIndex + 1} de {sequence.length}...
        </Text>
      )}
      <View style={styles.grid}>
        {Array.from({ length: rows * cols }, (_, i) => renderCell(i))}
      </View>
      {phase === 'input' && userSequence.length > 0 && (
        <Text style={styles.progress}>
          {userSequence.length} / {sequence.length}
        </Text>
      )}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, result === 'correct' ? styles.success : styles.error]}>
            {result === 'correct' ? '✓ Sequência correta!' : '✗ Sequência incorreta'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={reset} disabled={disabled}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  hint: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    gap: 8,
  },
  cell: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cellText: {
    fontSize: 24,
    fontWeight: '700',
  },
  progress: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  resultContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
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
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default MemorySequence;