/**
 * Componente do desafio Digitar Frase.
 * Validação Levenshtein feita no backend; aqui apenas UI.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTypePhrase } from '../../hooks/useChallenge';
import type { ChallengeTask } from '../../domain/types';

interface TypePhraseProps {
  challenge: ChallengeTask;
  onAnswer: (answer: { phrase: string }) => void;
  disabled?: boolean;
  error?: string | null;
}

export const TypePhrase: React.FC<TypePhraseProps> = ({
  challenge,
  onAnswer,
  disabled = false,
  error = null,
}) => {
  const { phrase, caseSensitive, allowTypos } = useTypePhrase(challenge);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = useCallback(() => {
    if (userInput.trim() === '' || disabled || submitted) return;
    setSubmitted(true);
    onAnswer({ phrase: userInput });
  }, [userInput, disabled, submitted, onAnswer]);

  const handleKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }) => {
      if (e.nativeEvent.key === 'Enter' && !submitted) {
        handleSubmit();
      }
    },
    [handleSubmit, submitted],
  );

  const displayPhrase = caseSensitive ? phrase : phrase.toLowerCase();
  const displayInput = caseSensitive ? userInput : userInput.toLowerCase();

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Digite exatamente:</Text>
      <Text style={styles.targetPhrase}>{displayPhrase}</Text>
      {allowTypos > 0 && (
        <Text style={styles.allowance}>
          São permitidos até {allowTypos} erro{allowTypos > 1 ? 's' : ''}.
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          submitted && (result === 'correct' ? styles.inputCorrect : styles.inputIncorrect),
        ]}
        value={userInput}
        onChangeText={setUserInput}
        onKeyPress={handleKeyPress}
        placeholder="Digite aqui..."
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        editable={!disabled && !submitted}
        multiline
        maxLength={phrase.length + (allowTypos ?? 5)}
      />
      {submitted && result && (
        <Text style={result === 'correct' ? styles.successText : styles.errorText}>
          {result === 'correct' ? '✓ Frase correta!' : '✗ Frase incorreta'}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.submitButton, disabled && styles.buttonDisabled, submitted && styles.buttonSubmitted]}
        onPress={handleSubmit}
        disabled={disabled || submitted || userInput.trim() === ''}
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
  instruction: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  targetPhrase: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    lineHeight: 32,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  allowance: {
    fontSize: 14,
    color: '#3b82f6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    maxWidth: 400,
    minHeight: 100,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    color: '#1a1a2e',
    padding: 16,
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
  buttonSubmitted: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default TypePhrase;