/**
 * Store Zustand de autenticação.
 * Persiste token e utilizador no AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/endpoints';
import { TOKEN_KEY, USER_KEY, getErrorMessage } from '../api/client';
import type { User } from '../domain/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string, fcmToken?: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    fcmToken?: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  setFcmToken: (token: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const [token, userJson] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
      const storedToken = token[1];
      const storedUser = userJson[1] ? (JSON.parse(userJson[1]) as User) : null;
      set({ token: storedToken, user: storedUser, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  login: async (email, password, fcmToken) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password, fcm_token: fcmToken });
      await AsyncStorage.multiSet([
        [TOKEN_KEY, data.token],
        [USER_KEY, JSON.stringify(data.user)],
      ]);
      set({ user: data.user, token: data.token, isLoading: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return false;
    }
  },

  register: async (name, email, password, fcmToken) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register({
        name,
        email,
        password,
        password_confirmation: password,
        fcm_token: fcmToken,
      });
      await AsyncStorage.multiSet([
        [TOKEN_KEY, data.token],
        [USER_KEY, JSON.stringify(data.user)],
      ]);
      set({ user: data.user, token: data.token, isLoading: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignora falha de rede no logout
    }
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    set({ user: null, token: null });
  },

  setFcmToken: async (fcmToken) => {
    const { token } = get();
    if (!token) {
      return;
    }
    try {
      await authApi.updateFcmToken(fcmToken);
      const user = get().user;
      if (user) {
        const updated = { ...user, fcm_token: fcmToken };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
        set({ user: updated });
      }
    } catch {
      // token FCM será reenviado no próximo login
    }
  },

  clearError: () => set({ error: null }),
}));
