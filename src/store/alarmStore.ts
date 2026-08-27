/**
 * Store Zustand do alarme ativo e da sequência de desafios.
 * Estado local para o ecrã de toque (AlarmRingingScreen).
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alarm, ChallengeTask, ValidateChallengeResponse } from '../domain/types';

const RINGING_STATE_KEY = '@smartalarm/ringing-state';

interface RingingState {
  alarm: Alarm | null;
  challenges: ChallengeTask[];
  currentIndex: number;
  startedAt: number | null;
  isRinging: boolean;
  lastError: string | null;
  attemptsOnCurrent: number;
}

interface AlarmStore extends RingingState {
  startRinging: (alarm: Alarm, challenges: ChallengeTask[]) => Promise<void>;
  setChallenges: (challenges: ChallengeTask[]) => void;
  applyValidationResult: (result: ValidateChallengeResponse) => void;
  nextChallenge: () => void;
  stopRinging: () => Promise<void>;
  restoreRingingState: () => Promise<boolean>;
  setError: (message: string | null) => void;
}

const initialState: RingingState = {
  alarm: null,
  challenges: [],
  currentIndex: 0,
  startedAt: null,
  isRinging: false,
  lastError: null,
  attemptsOnCurrent: 0,
};

async function persist(state: RingingState): Promise<void> {
  await AsyncStorage.setItem(RINGING_STATE_KEY, JSON.stringify(state));
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  ...initialState,

  startRinging: async (alarm, challenges) => {
    const next: RingingState = {
      alarm,
      challenges,
      currentIndex: 0,
      startedAt: Date.now(),
      isRinging: true,
      lastError: null,
      attemptsOnCurrent: 0,
    };
    await persist(next);
    set(next);
  },

  setChallenges: (challenges) => {
    const next = { ...get(), challenges };
    void persist(next);
    set({ challenges });
  },

  applyValidationResult: (result) => {
    const state = get();
    if (result.success && result.next_challenge) {
      const challenges = [...state.challenges];
      const exists = challenges.some((c) => c.id === result.next_challenge!.id);
      if (!exists) {
        challenges.push(result.next_challenge);
      }
      const nextIndex = state.currentIndex + 1;
      const next: RingingState = {
        ...state,
        challenges,
        currentIndex: nextIndex,
        lastError: null,
        attemptsOnCurrent: 0,
        startedAt: Date.now(),
      };
      void persist(next);
      set(next);
      return;
    }

    if (result.success && result.all_completed) {
      return;
    }

    if (!result.success && result.next_challenge) {
      const challenges = [...state.challenges, result.next_challenge];
      const next: RingingState = {
        ...state,
        challenges,
        lastError: result.error_message,
        attemptsOnCurrent: result.attempt.attempts,
      };
      void persist(next);
      set(next);
      return;
    }

    set({
      lastError: result.error_message,
      attemptsOnCurrent: result.attempt.attempts,
    });
  },

  nextChallenge: () => {
    const { currentIndex, challenges } = get();
    if (currentIndex + 1 < challenges.length) {
      const next = {
        ...get(),
        currentIndex: currentIndex + 1,
        lastError: null,
        attemptsOnCurrent: 0,
        startedAt: Date.now(),
      };
      void persist(next);
      set(next);
    }
  },

  stopRinging: async () => {
    await AsyncStorage.removeItem(RINGING_STATE_KEY);
    set(initialState);
  },

  restoreRingingState: async () => {
    try {
      const raw = await AsyncStorage.getItem(RINGING_STATE_KEY);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw) as RingingState;
      if (parsed.isRinging && parsed.alarm) {
        set(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  setError: (message) => set({ lastError: message }),
}));

export function selectCurrentChallenge(state: AlarmStore): ChallengeTask | null {
  return state.challenges[state.currentIndex] ?? null;
}
