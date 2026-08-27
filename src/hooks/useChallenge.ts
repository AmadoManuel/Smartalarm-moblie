/**
 * Hooks e lógica específica para cada tipo de desafio.
 * Cada desafio exporta: validação local, renderização, limpeza.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Accelerometer, setUpdateIntervalForType, SensorUpdateInterval } from 'expo-sensors';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import type { ChallengeTask, ChallengeType, ChallengeParameters } from '../domain/types';

// ============================================
// Utilitários partilhados
// ============================================

export function useCountdown(seconds: number, onEnd: () => void, autoStart = true) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    setRemaining(seconds);
    timerRef.current = setTimeout(() => {
      setRemaining(0);
      onEnd();
    }, seconds * 1000);
  }, [seconds, onEnd]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, [autoStart, start, stop]);

  const tick = useCallback(() => {
    if (remaining > 0) {
      setRemaining((prev) => prev - 1);
    }
  }, [remaining]);

  useEffect(() => {
    if (remaining > 0) {
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [remaining, tick]);

  return { remaining, start, stop };
}

// ============================================
// 1. MATH_EQUATION — validação no backend
// ============================================

export interface MathEquationAnswer {
  result: number;
}

export function useMathEquation(challenge: ChallengeTask) {
  const params = challenge.parameters as ChallengeParameters;
  const { operand1, operand2, operator } = params as {
    operand1: number;
    operand2: number;
    operator: '+' | '-' | '*';
  };

  const question = `${operand1} ${operator} ${operand2} = ?`;
  const expected = eval(`${operand1} ${operator} ${operand2}`);

  return { question, expected, operator };
}

// ============================================
// 2. MEMORY_SEQUENCE — validação local
// ============================================

export function useMemorySequence(challenge: ChallengeTask) {
  const params = challenge.parameters as ChallengeParameters;
  const { sequence, grid_size, display_time_ms } = params as {
    sequence: number[];
    grid_size: number;
    display_time_ms: number;
  };

  const [phase, setPhase] = useState<'showing' | 'input'>('showing');
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const startInput = useCallback(() => {
    setPhase('input');
    setUserSequence([]);
    setResult(null);
  }, []);

  const handlePress = useCallback(
    (index: number) => {
      if (phase !== 'input') return;
      const next = [...userSequence, index];
      setUserSequence(next);
      if (next.length === sequence.length) {
        const correct = next.every((v, i) => v === sequence[i]);
        setResult(correct ? 'correct' : 'incorrect');
      }
    },
    [phase, userSequence, sequence],
  );

  const reset = useCallback(() => {
    setPhase('showing');
    setUserSequence([]);
    setResult(null);
  }, []);

  return {
    phase,
    gridSize: grid_size,
    sequence: phase === 'showing' ? sequence : userSequence,
    userSequence,
    displayTimeMs: display_time_ms,
    result,
    startInput,
    handlePress,
    reset,
  };
}

// ============================================
// 3. SHAKE_DEVICE — validação local via acelerómetro
// ============================================

export function useShakeDevice(challenge: ChallengeTask) {
  const params = challenge.parameters as ChallengeParameters;
  const { required_shakes, threshold, time_window_seconds } = params as {
    required_shakes: number;
    threshold: number;
    time_window_seconds: number;
  };

  const [shakeCount, setShakeCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const lastShakeRef = useRef<number>(0);
  const shakeTimesRef = useRef<number[]>([]);

  useEffect(() => {
    setUpdateIntervalForType(SensorUpdateInterval.GAME_60HZ);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > threshold) {
        const now = Date.now();
        if (now - lastShakeRef.current > 300) {
          // debounce 300ms
          lastShakeRef.current = now;
          shakeTimesRef.current = [...shakeTimesRef.current, now].filter(
            (t) => now - t <= time_window_seconds * 1000,
          );
          setShakeCount(shakeTimesRef.current.length);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (shakeTimesRef.current.length >= required_shakes) {
            setIsComplete(true);
          }
        }
      }
    });
    return () => subscription.remove();
  }, [threshold, time_window_seconds, required_shakes]);

  const reset = useCallback(() => {
    setShakeCount(0);
    setIsComplete(false);
    lastShakeRef.current = 0;
    shakeTimesRef.current = [];
  }, []);

  return { shakeCount, requiredShakes: required_shakes, isComplete, reset };
}

// ============================================
// 4. TYPE_PHRASE — validação no backend (Levenshtein)
// ============================================

export function useTypePhrase(challenge: ChallengeTask) {
  const params = challenge.parameters as ChallengeParameters;
  const { phrase, case_sensitive, allow_typos } = params as {
    phrase: string;
    case_sensitive: boolean;
    allow_typos: number;
  };

  return { phrase, caseSensitive: case_sensitive, allowTypos: allow_typos };
}

// ============================================
// 5. PATTERN_DRAW — validação local (distância média)
// ============================================

export interface PatternPoint {
  x: number;
  y: number;
}

export function usePatternDraw(challenge: ChallengeTask) {
  const params = challenge.parameters as ChallengeParameters;
  const { pattern_points, tolerance } = params as {
    pattern_points: PatternPoint[];
    tolerance: number;
  };

  const [userPoints, setUserPoints] = useState<PatternPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const onStart = useCallback(() => {
    setIsDrawing(true);
    setUserPoints([]);
    setResult(null);
  }, []);

  const onMove = useCallback((point: PatternPoint) => {
    if (!isDrawing) return;
    setUserPoints((prev) => [...prev, point]);
  }, [isDrawing]);

  const onEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (userPoints.length < 10) {
      setResult('incorrect');
      return;
    }
    const avgDist = calculateAverageDistance(userPoints, pattern_points);
    setResult(avgDist <= tolerance ? 'correct' : 'incorrect');
  }, [isDrawing, userPoints, pattern_points, tolerance]);

  const reset = useCallback(() => {
    setUserPoints([]);
    setIsDrawing(false);
    setResult(null);
  }, []);

  return { targetPoints: pattern_points, userPoints, isDrawing, result, onStart, onMove, onEnd, reset };
}

function calculateAverageDistance(a: PatternPoint[], b: PatternPoint[]): number {
  if (a.length === 0 || b.length === 0) return Infinity;
  const len = Math.max(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const p1 = a[Math.floor((i * a.length) / len)];
    const p2 = b[Math.floor((i * b.length) / len)];
    sum += Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
  return sum / len;
}

// ============================================
// 6. SCAN_QR_CODE — validação no backend
// ============================================

export function useScanQrCode(challenge: ChallengeTask) {
  const params = challenge.parameters as ChallengeParameters;
  const { expected_content, qr_type } = params as {
    expected_content: string;
    qr_type: string;
  };

  const [scanned, setScanned] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = useCallback(
    (data: string) => {
      setScanned(data);
    },
    [],
  );

  return {
    expectedContent: expected_content,
    qrType: qr_type,
    scanned,
    hasPermission,
    handleScan,
    isCorrect: scanned === expected_content,
  };
}

// ============================================
// Factory: obtém o hook correto por tipo
// ============================================

export type ChallengeHookReturn =
  | ReturnType<typeof useMathEquation>
  | ReturnType<typeof useMemorySequence>
  | ReturnType<typeof useShakeDevice>
  | ReturnType<typeof useTypePhrase>
  | ReturnType<typeof usePatternDraw>
  | ReturnType<typeof useScanQrCode>;

export function getChallengeHook(type: ChallengeType) {
  switch (type) {
    case 'math_equation':
      return useMathEquation;
    case 'memory_sequence':
      return useMemorySequence;
    case 'shake_device':
      return useShakeDevice;
    case 'type_phrase':
      return useTypePhrase;
    case 'pattern_draw':
      return usePatternDraw;
    case 'scan_qr_code':
      return useScanQrCode;
    default:
      return useMathEquation;
  }
}