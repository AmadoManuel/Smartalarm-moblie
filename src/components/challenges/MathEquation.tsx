/**
 * Componente do desafio Equação Matemática.
 * Entrada numérica simples; validação feita no backend.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useMathEquation } from '../../hooks/useChallenge';
import type { ChallengeTask } from '../../domain/types';

interface MathEquationProps {
  challenge: ChallengeTask;
  onAnswer: (answer: { result: number }) => void;
  disabled?: boolean;
  error?: string | null;
}

export const MathEquation: React.FC<MathEquationProps> = ({
  challenge,
  onAnswer,
  disabled = false,
  error = null,
}) => {
  const { question, expected } = useMathEquation(challenge);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (answer.trim() === '' || disabled) return;
    const result = parseInt(answer, 10);
    if (isNaN(result)) return;
    setSubmitted(true);
    onAnswer({ result });
  }, [answer, disabled, onAnswer]);

  const handleKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }) => {
      if (e.nativeEvent.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          submitted && (answer == expected ? styles.inputCorrect : styles.inputIncorrect),
        ]}
        value={answer}
        onChangeText={setAnswer}
        onKeyPress={handleKeyPress}
        keyboardType="numeric"
        placeholder="Resposta"
        autoFocus
        editable={!disabled && !submitted}
        maxLength={5}
      />
      {submitted && (
        <Text style={answer == expected ? styles.successText : styles.errorText}>
          {answer == expected ? '✓ Correto!' : '✗ Incorreto'}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.submitButton, disabled && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={disabled || submitted || answer.trim() === ''}
      >
        <Text style={styles.buttonText}>{submitted ? 'Enviado' : 'Enviar'}</Text>
      </TouchableOpacity>
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
  question: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: 2,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 72,
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 3,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    backgroundColor: '#fff',
    color: '#1a1a2e',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  inputCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  inputIncorrect: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  successText: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    minWidth: 200,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default MathEquation;