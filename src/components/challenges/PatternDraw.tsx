/**
 * Componente do desafio Desenhar Padrão.
 * Canvas simples com PanResponder; validação por distância média.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  PanResponderGestureState,
  Animated,
} from 'react-native';
import { usePatternDraw, type PatternPoint } from '../../hooks/useChallenge';
import type { ChallengeTask } from '../../domain/types';

interface PatternDrawProps {
  challenge: ChallengeTask;
  onAnswer: (answer: { points: PatternPoint[] }) => void;
  disabled?: boolean;
  error?: string | null;
}

const CANVAS_SIZE = 300;

export const PatternDraw: React.FC<PatternDrawProps> = ({
  challenge,
  onAnswer,
  disabled = false,
  error = null,
}) => {
  const {
    targetPoints,
    userPoints,
    isDrawing,
    result,
    onStart,
    onMove,
    onEnd,
    reset,
  } = usePatternDraw(challenge);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !result,
      onMoveShouldSetPanResponder: () => !disabled && !result,
      onPanResponderGrant: (_, gesture) => {
        const point = normalizePoint(gesture);
        onStart();
        onMove(point);
      },
      onPanResponderMove: (_, gesture) => {
        const point = normalizePoint(gesture);
        onMove(point);
      },
      onPanResponderRelease: () => {
        onEnd();
        if (result === 'correct') {
          onAnswer({ points: userPoints });
        }
      },
      onPanResponderTerminate: () => {
        onEnd();
      },
    }),
  ).current;

  function normalizePoint(gesture: PanResponderGestureState): PatternPoint {
    return {
      x: clamp(gesture.moveX, 0, CANVAS_SIZE) / CANVAS_SIZE,
      y: clamp(gesture.moveY, 0, CANVAS_SIZE) / CANVAS_SIZE,
    };
  }

  function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }

  const drawPath = (points: PatternPoint[], color: string, width = 3) => {
    if (points.length < 2) return null;
    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * CANVAS_SIZE} ${p.y * CANVAS_SIZE}`)
      .join(' ');
    return (
      <Animated.View
        key={color}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
        }}
      >
        <Text
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {'​'}
        </Text>
        {/*
          React Native não tem SVG nativo sem expo-svg.
          Usamos uma abordagem simplificada com Views para o padrão alvo,
          e para o desenho do utilizador usamos pontos sobrepostos.
        */}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desenhe o padrão</Text>
      <Text style={styles.instruction}>
        {result ? 'Padrão completo' : 'Deslize o dedo ligando os pontos'}
      </Text>
      <View
        style={styles.canvasWrapper}
        {...panResponder.panHandlers}
      >
        {/* Padrão alvo - pontos fixos */}
        {targetPoints.map((point, i) => (
          <View
            key={i}
            style={[
              styles.targetDot,
              {
                left: point.x * CANVAS_SIZE - 12,
                top: point.y * CANVAS_SIZE - 12,
              },
              result === 'correct' && styles.targetDotCorrect,
              result === 'incorrect' && styles.targetDotIncorrect,
            ]}
          >
            <Text style={styles.dotNumber}>{i + 1}</Text>
          </View>
        ))}
        {/* Linhas do padrão alvo */}
        {targetPoints.length > 1 && (
          <View style={styles.targetLines}>
            {targetPoints.slice(0, -1).map((p1, i) => {
              const p2 = targetPoints[i + 1];
              return (
                <View
                  key={i}
                  style={[
                    styles.targetLine,
                    getLineStyle(p1, p2),
                  ]}
                />
              );
            })}
          </View>
        )}
        {/* Desenho do utilizador - pontos */}
        {userPoints.map((point, i) => (
          <View
            key={i}
            style={[
              styles.userDot,
              {
                left: point.x * CANVAS_SIZE - 8,
                top: point.y * CANVAS_SIZE - 8,
              },
            ]}
          />
        ))}
        {/* Linhas do utilizador */}
        {userPoints.length > 1 && (
          <View style={styles.userLines}>
            {userPoints.slice(0, -1).map((p1, i) => {
              const p2 = userPoints[i + 1];
              return (
                <View
                  key={i}
                  style={[
                    styles.userLine,
                    getLineStyle(p1, p2),
                    result === 'correct' && styles.userLineCorrect,
                    result === 'incorrect' && styles.userLineIncorrect,
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>
      {result && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, result === 'correct' ? styles.success : styles.error]}>
            {result === 'correct' ? '✓ Padrão correto!' : '✗ Padrão incorreto'}
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

function getLineStyle(p1: PatternPoint, p2: PatternPoint) {
  const dx = (p2.x - p1.x) * CANVAS_SIZE;
  const dy = (p2.y - p1.y) * CANVAS_SIZE;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const midX = ((p1.x + p2.x) / 2) * CANVAS_SIZE;
  const midY = ((p1.y + p2.y) / 2) * CANVAS_SIZE;

  return {
    width: length,
    height: 3,
    left: midX - length / 2,
    top: midY - 1.5,
    transform: [{ rotate: `${angle}deg` }],
  };
}

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
  canvasWrapper: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  targetDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  targetDotCorrect: {
    backgroundColor: '#22c55e',
  },
  targetDotIncorrect: {
    backgroundColor: '#ef4444',
  },
  dotNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  targetLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    zIndex: 5,
  },
  targetLine: {
    position: 'absolute',
    backgroundColor: '#93c5fd',
    borderRadius: 2,
  },
  userDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    zIndex: 15,
  },
  userLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    zIndex: 12,
  },
  userLine: {
    position: 'absolute',
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
  },
  userLineCorrect: {
    backgroundColor: '#22c55e',
  },
  userLineIncorrect: {
    backgroundColor: '#ef4444',
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default PatternDraw;